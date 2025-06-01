import { AppointmentStatus, TimeSlotStatus } from "@/app/generated/prisma";
import { getTimeSlot } from "@/libs/timeslot";
import { getDoctor, getPatient } from "@/libs/user";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { doctorId, patientId, timeSlotId } = body;

        // Validate required parameters
        if (!doctorId || !patientId || !timeSlotId) {
            return new NextResponse(
                JSON.stringify({ message: "Missing parameters!" }),
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
                    message: "Sorry, timeslot has already been booked/closed. Please book another timeslot. Thank you!",
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

            return { newAppointment, updatedTimeSlot };
        });

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