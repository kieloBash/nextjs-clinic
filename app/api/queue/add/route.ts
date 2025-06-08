import { createNotification } from "@/libs/notification";
import { getDoctor, getPatient } from "@/libs/user";
import { prisma } from "@/prisma"; // Ensure you import this correctly
import { MISSING_PARAMETERS, QUEUE_ADDED_NOTIFICATION_DOCTOR, QUEUE_ADDED_NOTIFICATION_PATIENT } from "@/utils/constants";
import { QueueStatus } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { doctorId, patientId } = body;

        // Validate required parameters
        if (!doctorId || !patientId) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        // Check if doctor and patient exist
        const [doctor, patient] = await Promise.all([
            getDoctor({ doctorId }),
            getPatient({ patientId }),
        ]);

        if (!doctor) {
            return new NextResponse(
                JSON.stringify({ message: `Doctor with ID ${doctorId} not found.` }),
                { status: 404 }
            );
        }

        if (!patient) {
            return new NextResponse(
                JSON.stringify({ message: `Patient with ID ${patientId} not found.` }),
                { status: 404 }
            );
        }

        const today = new Date();

        today.setHours(0, 0, 0, 0); // Normalize date to 00:00

        // Check if patient is already queued to this doctor
        const alreadyQueued = await prisma.queue.findFirst({
            where: {
                doctorId,
                patientId,
                status: QueueStatus.WAITING
            },
        });

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
                date: today,
            },
        });

        // Create the queue entry
        const newQueue = await prisma.queue.create({
            data: {
                patientId,
                doctorId,
                status: QueueStatus.WAITING,
                position: lastPosition + 1,
                date: today,
            },
        });

        await Promise.all([
            await createNotification({ userId: newQueue.patientId, message: QUEUE_ADDED_NOTIFICATION_PATIENT(newQueue.position) }),
            await createNotification({ userId: newQueue.doctorId, message: QUEUE_ADDED_NOTIFICATION_DOCTOR(patient.name, newQueue.position) })
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
