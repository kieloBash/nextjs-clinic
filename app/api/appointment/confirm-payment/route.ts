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
import { auth } from "@/auth";

export async function POST(request: Request) {
    try {
        const session = await auth();
        const body = await request.json();
        const { appointmentId } = body;

        // Validate input
        if (!appointmentId) {
            return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
        }

        if (!session || !session.user) {
            return NextResponse.json({ message: "Session not found!" }, { status: 400 });
        }


        const [existingAppointment, existingQueue, existingUser] = await Promise.all([
            prisma.appointment.findFirst({
                where: { id: appointmentId },
                include: {
                    patient: { select: { name: true, email: true } },
                    doctor: { select: { name: true, email: true } },
                },
            }),
            prisma.queue.findFirst({
                where: { appointmentId: appointmentId },
                include: {
                    patient: { select: { name: true } },
                    doctor: { select: { name: true } },
                },
            }),
            prisma.user.findFirst({ where: { id: session.user.id }, select: { id: true, completedAppointments: true } })
        ])

        console.log(existingAppointment, existingQueue)

        if (!existingAppointment || !existingUser) {
            return NextResponse.json(
                { message: "Appointment not found and/or user not found!" },
                { status: 404 }
            );
        }



        // COMPLETED FLOW
        const result = await prisma.$transaction(async (tx) => {

            const newCount = (existingUser?.completedAppointments ?? 0) + 1

            const [updatedAppointment, updatedInvoice, updatedUser] = await Promise.all([
                tx.appointment.update({
                    where: { id: existingAppointment.id },
                    data: { status: AppointmentStatus.COMPLETED },
                }),
                tx.invoice.update({
                    where: { appointmentId: existingAppointment.id },
                    data: { status: InvoiceStatus.PAID },
                }),
                tx.user.update({ where: { id: existingUser?.id }, data: { completedAppointments: newCount } })
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
                    email: {
                        to: existingAppointment.patient.email,
                        subject: "Appointment Completed",
                        htmlContent: `<p>Hi ${existingAppointment.patient.name}, your appointment with Dr. ${existingAppointment.doctor.name} has been marked as completed. Thank you for visiting NextJS Clinic!</p>`,
                    },
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.doctorId,
                    message: BOOKING_COMPLETED_NOTIFICATION_DOCTOR,
                    email: {
                        to: existingAppointment.doctor.email,
                        subject: "Appointment Completed",
                        htmlContent: `<p>Hi Dr. ${existingAppointment.doctor.name}, your appointment with ${existingAppointment.patient.name} has been marked as completed.</p>`,
                    },
                }),
            ]);

            return { updatedAppointment, updatedInvoice, updatedUser };
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
