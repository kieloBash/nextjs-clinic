import { AppointmentStatus, TimeSlotStatus } from "@prisma/client"
import { createNotification } from "@/libs/notification";
import { getTimeSlot } from "@/libs/timeslot";
import { getDoctor, getPatient } from "@/libs/user";
import { BOOKING_CONFIRMED_NOTIFICATION_DOCTOR, BOOKING_CONFIRMED_NOTIFICATION_PATIENT, BOOKING_PATIENT_ADDED_FROM_QUEUE, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY, NEW_BOOKED_APPOINTMENT_HISTORY, NEW_BOOKED_TIMESLOT_CLOSED, PENDING_BOOKING_NOTIFICATION_DOCTOR, PENDING_BOOKING_NOTIFICATION_PATIENT } from "@/utils/constants";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { CONFIRM_PAYMENT_APPOINTMENT } from "@/utils/api-endpoints";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { timeSlotId } = body;

        // Validate required parameters
        if (!timeSlotId) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        const [timeSlot] = await Promise.all([
            getTimeSlot({ timeSlotId }),
        ]);

        // Validate entities exist
        if (!timeSlot) {
            return new NextResponse(
                JSON.stringify({ message: "Can't find: timeslot" }),
                { status: 400 }
            );
        }

        // Book appointment and update timeslot
        const result = await prisma.$transaction(async (tx) => {
            const newAppointment = await tx.appointment.update({
                where: { timeSlotId: timeSlot.id },
                data: {
                    status: AppointmentStatus.CONFIRMED,
                },
                include: { patient: true, doctor: true }
            });

            await Promise.all([
                await tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: newAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_CONFIRMED_HISTORY(newAppointment.patient.name, newAppointment.doctor.name),
                            newStatus: AppointmentStatus.CONFIRMED
                        },
                    ]
                }),
                await createNotification({ 
                    tx, 
                    userId: newAppointment.patientId, 
                    message: BOOKING_CONFIRMED_NOTIFICATION_PATIENT,
                    email: {
                        to: newAppointment.patient.email,
                        subject: "Appointment Booking Confirmed",
                        htmlContent: `<p>Hi ${newAppointment.patient.name}, your appointment with Dr. ${newAppointment.doctor.name} has been confirmed.</p>`,
                    },
                }),

                await createNotification({ 
                    tx, 
                    userId: newAppointment.doctorId, 
                    message: BOOKING_CONFIRMED_NOTIFICATION_DOCTOR,
                    email: {
                        to: newAppointment.doctor.email,
                        subject: "Appointment Confirmed",
                        htmlContent: `<p>Hi Dr. ${newAppointment.doctor.name}, your appointment with ${newAppointment.patient.name} has been confirmed.</p>`,
                    },
                })
            ])

            return { newAppointment };
        });

        // TODO: send sms

        return new NextResponse(
            JSON.stringify({
                message: "Successfully booked timeslot",
                data: result,
            }),
            { status: 201 }
        );

    } catch (error: any) {
        console.error("Error booking appointment:", error);

        return new NextResponse(
            JSON.stringify({ message: "An unexpected error occurred", error: error.message }),
            { status: 500 }
        );
    }
}