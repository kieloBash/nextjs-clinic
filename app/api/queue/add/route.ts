import { createNotification } from "@/libs/notification";
import { getDoctor, getPatientByEmail } from "@/libs/user";
import { prisma } from "@/prisma"; // Ensure you import this correctly
import { MISSING_PARAMETERS, QUEUE_ADDED_NOTIFICATION_DOCTOR, QUEUE_ADDED_NOTIFICATION_PATIENT } from "@/utils/constants";
import { nowUTC } from "@/utils/helpers/date";
import { QueueStatus } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        console.log("START POST /api/queue/add")
        const body = await request.json();
        const { doctorId, patientEmail } = body;

        // Validate required parameters
        if (!doctorId || !patientEmail) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        console.log({ doctorId, patientEmail })

        // Check if doctor and patient exist
        const [doctor, patient] = await Promise.all([
            getDoctor({ doctorId }),
            getPatientByEmail({ email: patientEmail }),
        ]);

        console.log({ doctor, patient })

        if (!doctor) {
            return new NextResponse(
                JSON.stringify({ message: `Doctor with ID ${doctorId} not found.` }),
                { status: 404 }
            );
        }

        if (!patient) {
            return new NextResponse(
                JSON.stringify({ message: `Patient with email ${patientEmail} not found.` }),
                { status: 404 }
            );
        }

        const today = nowUTC()

        // Check if patient is already queued to this doctor
        const alreadyQueued = await prisma.queue.findFirst({
            where: {
                doctorId,
                patientId: patient.id,
                status: {
                    in: [QueueStatus.WAITING, QueueStatus.SKIPPED]
                }
            },
        });

        console.log({ alreadyQueued })

        if (alreadyQueued) {
            return new NextResponse(
                JSON.stringify({
                    message: `Patient is already queued to this doctor.`,
                    existingQueue: alreadyQueued,
                }),
                { status: 409 }
            );
        }

        // Count existing queues for the doctor today to determine position
        const lastPosition = await prisma.queue.count({
            where: {
                doctorId,
                date: {
                    gte: startOfDay(today),
                    lte: endOfDay(today)
                },
            },
        });

        console.log({ lastPosition })

        // Create the queue entry
        const newQueue = await prisma.queue.create({
            data: {
                patientId: patient.id,
                doctorId,
                status: QueueStatus.WAITING,
                position: lastPosition + 1,
                date: today,
            },
        });

        console.log({ newQueue })


        await Promise.all([
            await createNotification({ 
                tx: prisma, 
                userId: newQueue.patientId, 
                message: QUEUE_ADDED_NOTIFICATION_PATIENT(newQueue.position),
                email: {
                    to: patient.email,
                    subject: "Added to Queue",
                    htmlContent: `<p>Hi ${patient.name}, you have been added to the queue for Dr. ${doctor.name}. Your position is <strong>#${newQueue.position}</strong>.</p>`,
                },
            }),
            
            await createNotification({ 
                tx: prisma, 
                userId: newQueue.doctorId, 
                message: QUEUE_ADDED_NOTIFICATION_DOCTOR(patient.name, newQueue.position), 
                email: {
                    to: doctor.email,
                    subject: "New Patient in Queue",
                    htmlContent: `<p>Hi Dr. ${doctor.name}, ${patient.name} has been added to your queue. Their position is <strong>#${newQueue.position}</strong>.</p>`,
                },
            })
        ])

        return new NextResponse(
            JSON.stringify({
                message: "Successfully added to queue.",
                data: newQueue,
            }),
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Queue creation error:", error);

        return new NextResponse(
            JSON.stringify({
                message: "An error occurred while adding to the queue.",
                error: error.message || error,
            }),
            { status: 500 }
        );
    }
}
