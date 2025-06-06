import { AppointmentStatus, QueueStatus, TimeSlotStatus } from "@/app/generated/prisma";
import { createNotification } from "@/libs/notification";
import { BOOKING_CONFIRMED_NOTIFICATION_DOCTOR, BOOKING_CONFIRMED_NOTIFICATION_PATIENT, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY } from "@/utils/constants";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";

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

        const today = new Date();

        const result = await prisma.$transaction(async (tx) => {

            const timeSlot = await tx.timeSlot.create({
                data: {
                    doctorId: existingQueue.doctorId,
                    status: TimeSlotStatus.CLOSED,
                    date: today,
                    startTime: today,
                    endTime: addHours(today, 1),
                }
            })

            const confirmedAppointment = await tx.appointment.create({
                data: {
                    patientId: existingQueue.patientId,
                    doctorId: existingQueue.doctorId,
                    timeSlotId: timeSlot.id,
                    date: timeSlot.date,
                    status: AppointmentStatus.CONFIRMED,
                },
            });

            await tx.queue.delete({ where: { id: queueId } });

            await Promise.all([
                await tx.appointmentHistory.create({
                    data: {
                        appointmentId: confirmedAppointment.id,
                        description: NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY(existingQueue.patient.name, existingQueue.doctor.name),
                        newStatus: AppointmentStatus.PENDING
                    }
                }),
                await createNotification({ tx, userId: existingQueue.patientId, message: BOOKING_CONFIRMED_NOTIFICATION_PATIENT }),
                await createNotification({ tx, userId: existingQueue.doctorId, message: BOOKING_CONFIRMED_NOTIFICATION_DOCTOR })
            ])


            return { confirmedAppointment, timeSlot };
        })




        return new NextResponse(
            JSON.stringify({
                message: "Successfully confirmed queue and added to appointments.",
                data: { ...result },
            }),
            { status: 200 }
        );
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