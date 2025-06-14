import { AppointmentStatus, InvoiceStatus, Prisma, QueueStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
    BOOKING_COMPLETED_NOTIFICATION_DOCTOR,
    BOOKING_COMPLETED_NOTIFICATION_PATIENT,
    MISSING_PARAMETERS,
    NEW_BOOKED_APPOINTMENT_COMPLETED_HISTORY,
} from "@/utils/constants";
import { createNotification } from "@/libs/notification";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { appointmentId } = body;

        // Validate input
        if (!appointmentId) {
            return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
        }


        const [existingAppointment, existingQueue] = await Promise.all([
            prisma.appointment.findFirst({
                where: { id: appointmentId },
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true } },
                },
            }),
            prisma.queue.findFirst({
                where: { appointmentId: appointmentId },
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true } },
                },
            })
        ])

        console.log(existingAppointment, existingQueue)

        if (!existingAppointment) {
            return NextResponse.json(
                { message: "Appointment not found." },
                { status: 404 }
            );
        }


        // COMPLETED FLOW
        const result = await prisma.$transaction(async (tx) => {

            const [updatedAppointment, updatedInvoice] = await Promise.all([
                tx.appointment.update({
                    where: { id: existingAppointment.id },
                    data: { status: AppointmentStatus.COMPLETED },
                }),
                tx.invoice.update({
                    where: { appointmentId: existingAppointment.id },
                    data: { status: InvoiceStatus.PAID },
                }),
            ]);

            if (existingQueue) {
                await tx.queue.delete({
                    where: { id: existingQueue.id }
                });
            }


            await Promise.all([
                tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: updatedAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_COMPLETED_HISTORY(
                                existingAppointment.patient.name,
                                existingAppointment.doctor.name
                            ),
                            newStatus: AppointmentStatus.COMPLETED,
                        },
                    ],
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.patientId,
                    message: BOOKING_COMPLETED_NOTIFICATION_PATIENT,
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.doctorId,
                    message: BOOKING_COMPLETED_NOTIFICATION_DOCTOR,
                }),
            ]);

            return { updatedAppointment, updatedInvoice };
        });

        return NextResponse.json(
            { message: "Appointment marked as completed.", data: result },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error updating appointment status:", error);

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json(
                { message: "Database error", error: error.message },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: "An unexpected error occurred",
                error: (error as Error).message,
            },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
