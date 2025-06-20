import { AppointmentStatus, InvoiceStatus, Prisma, QueueStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import {
    BOOKING_WAITING_PAYMENT_NOTIFICATION_DOCTOR,
    BOOKING_WAITING_PAYMENT_NOTIFICATION_PATIENT,
    MISSING_PARAMETERS,
    NEW_BOOKED_APPOINTMENT_WAITING_FOR_PAYMENT_HISTORY,
} from "@/utils/constants";
import { createNotification } from "@/libs/notification";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { status, amount: amountString, queueId } = body;

        // Validate input
        if (!status || !queueId) {
            return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
        }

        if (![AppointmentStatus.PENDING_PAYMENT].includes(status)) {
            return NextResponse.json({ message: "Invalid status!" }, { status: 400 });
        }

        // Fetch queue with related info
        const queue = await prisma.queue.findFirst({
            where: { id: queueId },
            include: {
                patient: { select: { name: true } },
                doctor: { select: { name: true } },
            },
        });

        if (!queue || !queue.appointmentId) {
            return NextResponse.json(
                { message: "Queue or linked appointment not found." },
                { status: 404 }
            );
        }

        const amount = parseInt(amountString)
        if (status === AppointmentStatus.PENDING_PAYMENT && typeof amount !== "number") {
            return NextResponse.json({ message: "Missing or invalid amount!" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            if (!queue.appointmentId) return null;

            const [updatedAppointment, invoice, updatedQueue] = await Promise.all([
                tx.appointment.update({
                    where: { id: queue.appointmentId },
                    data: { status },
                }),
                tx.invoice.create({
                    data: {
                        amount,
                        status: InvoiceStatus.PENDING,
                        createdBy: queue.doctorId,
                        patientId: queue.patientId,
                        appointmentId: queue.appointmentId,
                    },
                }),
                tx.queue.update({
                    where: { id: queue.id },
                    data: { status: QueueStatus.COMPLETED },
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
                                queue.patient.name,
                                queue.doctor.name
                            ),
                            newStatus: AppointmentStatus.PENDING_PAYMENT,
                        },
                    ],
                }),
                createNotification({
                    tx,
                    userId: queue.patientId,
                    message: BOOKING_WAITING_PAYMENT_NOTIFICATION_PATIENT,
                }),
                createNotification({
                    tx,
                    userId: queue.doctorId,
                    message: BOOKING_WAITING_PAYMENT_NOTIFICATION_DOCTOR,
                }),
            ]);

            return { updatedAppointment, invoice, updatedQueue };
        });

        return NextResponse.json(
            {
                message: "Successfully created invoice for appointment!",
                data: result,
            },
            { status: 201 }
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
