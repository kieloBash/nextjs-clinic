import { AppointmentStatus, Prisma, QueueStatus, TimeSlotStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { BOOKING_RESCHEDULED_NOTIFICATION_DOCTOR, BOOKING_RESCHEDULED_NOTIFICATION_PATIENT, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_CANCELLED_HISTORY, NEW_BOOKED_APPOINTMENT_RESCHEDULED_HISTORY } from "@/utils/constants";
import { createNotification } from "@/libs/notification";

export async function POST(request: Request) {
    console.log("START RESCHEDULE POST")
    const body = await request.json();
    const { appointmentId, timeSlotId } = body

    if (!appointmentId || !timeSlotId) {
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

    const existingTimeSlot = await prisma.timeSlot.findFirst({
        where: { id: timeSlotId },
    });


    if (!existingTimeSlot) {
        return NextResponse.json(
            { message: "Timeslot not found." },
            { status: 404 }
        );
    }

    try {

        const result = await prisma.$transaction(async (tx) => {
            const updatedAppointment = await tx.appointment.update({
                where: { id: existingAppointment.id },
                data: { status: AppointmentStatus.RESCHEDULED },
            })

            const updatedTimeSlot = await tx.timeSlot.update({
                where: { id: existingTimeSlot.id },
                data: {
                    status: TimeSlotStatus.CLOSED
                },
            });

            console.log({ updatedTimeSlot })

            //new appointment
            const newAppointment = await tx.appointment.create({
                data: {
                    patientId: updatedAppointment.patientId,
                    doctorId: updatedAppointment.doctorId,
                    timeSlotId: updatedTimeSlot.id,
                    date: updatedTimeSlot.date,
                    status: AppointmentStatus.PENDING,
                },
            });

            await Promise.all([
                tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: updatedAppointment.id,
                            description: BOOKING_RESCHEDULED_NOTIFICATION_DOCTOR,
                        },
                        {
                            appointmentId: updatedAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_RESCHEDULED_HISTORY(
                                existingAppointment.patient.name,
                                existingAppointment.doctor.name
                            ),
                            newStatus: AppointmentStatus.RESCHEDULED,
                        },
                    ],
                }),
                tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: newAppointment.id,
                            description: BOOKING_RESCHEDULED_NOTIFICATION_DOCTOR,
                        },
                        {
                            appointmentId: newAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_RESCHEDULED_HISTORY(
                                existingAppointment.patient.name,
                                existingAppointment.doctor.name
                            ),
                            newStatus: AppointmentStatus.RESCHEDULED,
                        },
                    ],
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.patientId,
                    message: BOOKING_RESCHEDULED_NOTIFICATION_PATIENT,
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.doctorId,
                    message: BOOKING_RESCHEDULED_NOTIFICATION_DOCTOR,
                }),
            ]);

            return { updatedAppointment, updatedTimeSlot }
        });

        return NextResponse.json(
            {
                message: "Successfully rescheduled appointment!",
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