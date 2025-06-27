import { AppointmentStatus, InvoiceStatus, Prisma, QueueStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { BOOKING_WAITING_PAYMENT_NOTIFICATION_DOCTOR, BOOKING_WAITING_PAYMENT_NOTIFICATION_PATIENT, MISSING_PARAMETERS, NEW_BOOKED_APPOINTMENT_WAITING_FOR_PAYMENT_HISTORY } from "@/utils/constants";
import { createNotification } from "@/libs/notification";

export async function POST(request: Request) {
    const body = await request.json();
    const { appointmentId, amount: amountString, } = body

    console.log(appointmentId)

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

        const amount = parseInt(amountString)
        if (typeof amount !== "number") {
            return NextResponse.json({ message: "Missing or invalid amount!" }, { status: 400 });
        }

        const existingQueue = await prisma.queue.findFirst({
            where: { appointmentId: existingAppointment.id },
        })

        if (existingQueue) {
            await prisma.queue.update({ where: { id: existingQueue.id }, data: { status: QueueStatus.COMPLETED } })
        }

        const result = await prisma.$transaction(async (tx) => {

            const [updatedAppointment, invoice] = await Promise.all([
                tx.appointment.update({
                    where: { id: existingAppointment.id },
                    data: { status: AppointmentStatus.PENDING_PAYMENT },
                }),
                tx.invoice.create({
                    data: {
                        amount,
                        status: InvoiceStatus.PENDING,
                        createdBy: existingAppointment.doctorId,
                        patientId: existingAppointment.patientId,
                        appointmentId: existingAppointment.id,
                    },
                }),
            ]);

            await Promise.all([
                tx.appointmentHistory.createMany({
                    data: [
                        {
                            appointmentId: updatedAppointment.id,
                            description: BOOKING_WAITING_PAYMENT_NOTIFICATION_DOCTOR,
                        },
                        {
                            appointmentId: updatedAppointment.id,
                            description: NEW_BOOKED_APPOINTMENT_WAITING_FOR_PAYMENT_HISTORY(
                                amount,
                                existingAppointment.patient.name,
                                existingAppointment.doctor.name
                            ),
                            newStatus: AppointmentStatus.PENDING_PAYMENT,
                        },
                    ],
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.patientId,
                    message: BOOKING_WAITING_PAYMENT_NOTIFICATION_PATIENT,
                    email: {
                        to: existingAppointment.patient.email,
                        subject: "Payment Pending for Your Appointment",
                        htmlContent: `<p>Dear ${existingAppointment.patient.name},</p>
                                      <p>Your appointment with Dr. ${existingAppointment.doctor.name} is pending payment with an amount of ₱${amount}.</p>
                                      <p>Please complete the payment to confirm your appointment.</p>`,
                    },
                }),
                createNotification({
                    tx,
                    userId: existingAppointment.doctorId,
                    message: BOOKING_WAITING_PAYMENT_NOTIFICATION_DOCTOR,
                    email: {
                        to: existingAppointment.doctor.email,
                        subject: "Payment Pending for Appointment",
                        htmlContent: `<p>Dear Dr. ${existingAppointment.doctor.name},</p>
                                      <p>The appointment with ${existingAppointment.patient.name} is pending payment with an amount of ₱${amount}.</p>
                                      <p>Please check your schedule for any updates.</p>`,
                    },
                }),
            ]);

            return { updatedAppointment, invoice };
        });

        return NextResponse.json(
            {
                message: "Successfully created invoice for appointment!",
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