import { AppointmentStatus, Prisma, QueueStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { BOOKING_CANCELLED_NOTIFICATION_DOCTOR, BOOKING_CANCELLED_NOTIFICATION_PATIENT, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_CANCELLED_HISTORY } from "@/utils/constants";
import { createNotification } from "@/libs/notification";


export async function POST(request: Request) {
    const body = await request.json();
    const { appointmentId } = body

    if (!appointmentId) {
        return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
    }

    const existingAppointment = await prisma.appointment.findFirst({
        where: { id: appointmentId },
        include: {
            patient: { select: { name: true, email: true } },
            doctor: { select: { name: true, email: true } },
        },
    });

    if (!existingAppointment) {
        return NextResponse.json(
            { message: "Appointment not found." },
            { status: 404 }
        );
    }

    try {
        const existingQueue = await prisma.queue.findFirst({
            where: { appointmentId: existingAppointment.id },
        })

        if (existingQueue) {
            await prisma.queue.delete({ where: { id: existingQueue.id } })
        }

        const result = await prisma.$transaction(async (tx) => {
            const updatedAppointment = await tx.appointment.update({
                where: { id: existingAppointment.id },
                data: { status: AppointmentStatus.CANCELLED },
            })

            await Promise.all([
                tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: updatedAppointment.id,
                            description: BOOKING_CANCELLED_NOTIFICATION_DOCTOR,
                        },
                        {
                            appointmentId: updatedAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_CANCELLED_HISTORY(
                                existingAppointment.patient.name,
                                existingAppointment.doctor.name
                            ),
                            newStatus: AppointmentStatus.CANCELLED,
                        },
                    ],
                }),
                //PATIENT NOTIFICATION
                createNotification({
                    tx,
                    userId: existingAppointment.patientId,
                    message: BOOKING_CANCELLED_NOTIFICATION_PATIENT,
                    email: {
                        to: existingAppointment.patient.email,
                        subject: "Appointment Cancelled",
                        htmlContent: `<p>Dear ${existingAppointment.patient.name},</p>
                                      <p>Your appointment with Dr. ${existingAppointment.doctor.name} has been cancelled.</p>
                                      <p>We apologize for any inconvenience this may cause.</p>
                                      <p>Thank you for your understanding.</p>`,
                    },
                }),

                //DOCTOR NOTIFICATION
                createNotification({
                    tx,
                    userId: existingAppointment.doctorId,
                    message: BOOKING_CANCELLED_NOTIFICATION_DOCTOR,
                    email: {
                        to: existingAppointment.doctor.email,
                        subject: "Appointment Cancelled",
                        htmlContent: `<p>Dear Dr. ${existingAppointment.doctor.name},</p>
                                      <p>The appointment with ${existingAppointment.patient.name} has been cancelled.</p>
                                      <p>Please check your schedule for any updates.</p>`,
                    },
                }),
            ]);

            return { updatedAppointment }
        });

        return NextResponse.json(
            {
                message: "Successfully cancelled appointment!",
                data: result,
            },
            { status: 201 }
        );

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return new NextResponse(
                JSON.stringify({ message: "Database error", error: error.message }),
                { status: 500 }
            );
        }

        return new NextResponse(
            JSON.stringify({
                message: "An unexpected error occurred",
                error: (error as Error).message,
            }),
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}