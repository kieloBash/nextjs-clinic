import { AppointmentStatus, QueueStatus, TimeSlotStatus } from "@prisma/client"
import { createNotification } from "@/libs/notification";
import { BOOKING_CONFIRMED_NOTIFICATION_DOCTOR, BOOKING_CONFIRMED_NOTIFICATION_PATIENT, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY } from "@/utils/constants";
import { addHours, startOfDay } from "date-fns";
import { NextResponse } from "next/server";

import { prisma } from "@/prisma";
import { getTodayDateTimezone, nowUTC, parseDate } from "@/utils/helpers/date";

export async function POST(request: Request) {

    try {

        const body = await request.json();
        const { queueId } = body;

        if (!queueId) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        const existingQueue = await prisma.queue.findFirst({
            where: { id: queueId },
            include: {
                patient: true,
                doctor: true
            }
        })

        if (!existingQueue) {
            return new NextResponse(
                JSON.stringify({ message: `Queue not found!` }),
                { status: 404 }
            );
        }

        const hasCurrentQueue = await prisma.queue.findFirst({
            where: { doctorId: existingQueue.doctorId, status: QueueStatus.APPROVED },
        })

        if (hasCurrentQueue) {
            return new NextResponse(
                JSON.stringify({ message: `You have currently a patient in queue. Please complete the current appointment first to proceed.` }),
                { status: 404 }
            );
        }

        const d = nowUTC()

        console.log("UTC RAW TODAY:", d)
        const today = parseDate(d.toISOString());
        console.log("UTC PARSED TODAY:", today)

        return new NextResponse(
            JSON.stringify({
                message: "Successfully confirmed queue and added to appointments.",
                data: "{ ...result }",
            }),
            { status: 400 }
        );

        // const result = await prisma.$transaction(async (tx) => {

        //     const timeSlot = await tx.timeSlot.create({
        //         data: {
        //             doctorId: existingQueue.doctorId,
        //             status: TimeSlotStatus.CLOSED,
        //             date: today,
        //             startTime: today,
        //             endTime: addHours(today, 1),
        //         }
        //     })

        //     const confirmedAppointment = await tx.appointment.create({
        //         data: {
        //             patientId: existingQueue.patientId,
        //             doctorId: existingQueue.doctorId,
        //             timeSlotId: timeSlot.id,
        //             date: timeSlot.date,
        //             status: AppointmentStatus.CONFIRMED,
        //         },
        //     });

        //     await tx.queue.update({ where: { id: queueId }, data: { status: QueueStatus.APPROVED, appointmentId: confirmedAppointment.id } });

        //     await Promise.all([
        //         await tx.appointmentHistory.create({
        //             data: {
        //                 appointmentId: confirmedAppointment.id,
        //                 description: NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY(existingQueue.patient.name, existingQueue.doctor.name),
        //                 newStatus: AppointmentStatus.PENDING
        //             }
        //         }),
        //         await createNotification({ tx, userId: existingQueue.patientId, message: BOOKING_CONFIRMED_NOTIFICATION_PATIENT }),
        //         await createNotification({ tx, userId: existingQueue.doctorId, message: BOOKING_CONFIRMED_NOTIFICATION_DOCTOR })
        //     ])


        //     return { confirmedAppointment, timeSlot };
        // })

        // return new NextResponse(
        //     JSON.stringify({
        //         message: "Successfully confirmed queue and added to appointments.",
        //         data: { ...result },
        //     }),
        //     { status: 200 }
        // );
    } catch (error: any) {
        console.error("Queue confirmation error:", error);

        return new NextResponse(
            JSON.stringify({
                message: "An error occurred while confirming the queue.",
                error: error.message || error,
            }),
            { status: 500 }
        );
    }
}