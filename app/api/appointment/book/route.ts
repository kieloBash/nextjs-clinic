import { AppointmentStatus, TimeSlotStatus } from "@prisma/client"
import { createNotification } from "@/libs/notification";
import { getTimeSlot } from "@/libs/timeslot";
import { getDoctor, getPatient } from "@/libs/user";
import { BOOKING_PATIENT_ADDED_FROM_QUEUE, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_HISTORY, NEW_BOOKED_TIMESLOT_CLOSED, PENDING_BOOKING_NOTIFICATION_DOCTOR, PENDING_BOOKING_NOTIFICATION_PATIENT } from "@/utils/constants";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { doctorId, patientId, timeSlotId } = body;

        // Validate required parameters
        if (!doctorId || !patientId || !timeSlotId) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        const [doctor, patient, timeSlot] = await Promise.all([
            getDoctor({ doctorId }),
            getPatient({ patientId }),
            getTimeSlot({ timeSlotId }),
        ]);

        // Validate entities exist
        if (!doctor || !patient || !timeSlot) {
            return new NextResponse(
                JSON.stringify({ message: "Can't find: doctor and/or patient and/or timeslot" }),
                { status: 400 }
            );
        }

        // Check if timeslot is already closed
        if (timeSlot.status === TimeSlotStatus.CLOSED) {
            return new NextResponse(
                JSON.stringify({
                    message: NEW_BOOKED_TIMESLOT_CLOSED,
                }),
                { status: 400 }
            );
        }

        // Book appointment and update timeslot
        const result = await prisma.$transaction(async (tx) => {
            const newAppointment = await tx.appointment.create({
                data: {
                    patientId,
                    doctorId,
                    timeSlotId,
                    date: timeSlot.date,
                    status: AppointmentStatus.PENDING,
                },
            });

            const updatedTimeSlot = await tx.timeSlot.update({
                where: { id: timeSlotId },
                data: { status: TimeSlotStatus.CLOSED },
            });

            await Promise.all([
                await tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: newAppointment.id,
                            description: BOOKING_PATIENT_ADDED_FROM_QUEUE,
                        },
                        {
                            appointmentId: newAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_HISTORY(patient.name, doctor.name),
                            newStatus: AppointmentStatus.CONFIRMED
                        },
                    ]
                }),
                
        createNotification({
          tx,
          userId: patientId,
          message: PENDING_BOOKING_NOTIFICATION_PATIENT,
          email: {
            to: patient.email,
            subject: "Appointment Pending Confirmation",
            htmlContent: `<p>Hi ${patient.name}, your appointment with Dr. ${doctor.name} is pending confirmation.</p>`,
          },
        }),
        createNotification({
          tx,
          userId: doctorId,
          message: PENDING_BOOKING_NOTIFICATION_DOCTOR,
          email: {
            to: doctor.email,
            subject: "New Appointment Request",
            htmlContent: `<p>Hi Dr. ${doctor.name}, you have a new appointment request from ${patient.name}.</p>`,
          },
        }),
      ]);
            return { newAppointment, updatedTimeSlot };
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