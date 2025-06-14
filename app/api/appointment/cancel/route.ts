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
            patient: { select: { name: true } },
            doctor: { select: { name: true } },
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
                createNotification({
                    tx,
                    userId: existingAppointment.patientId,
                    message: BOOKING_CANCELLED_NOTIFICATION_PATIENT,
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.doctorId,
                    message: BOOKING_CANCELLED_NOTIFICATION_DOCTOR,
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