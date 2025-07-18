import { Prisma, TimeSlotStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS } from "@/utils/constants";

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const timeSlotId = url.pathname.split("/").pop();

        // Validate input
        if (!timeSlotId) {
            return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
        }

        const existingTimeslot = await prisma.timeSlot.findFirst({
            where: { id: timeSlotId }, include: { appointment: true }
        })
        if (!existingTimeslot) {
            return NextResponse.json({ message: "Timeslot doesn't exist!" }, { status: 400 });
        }

        if (existingTimeslot?.appointment) {
            return NextResponse.json({ message: "Can't delete because there is an associated appoiontment" }, { status: 400 });
        }
        await prisma.timeSlot.delete({ where: { id: timeSlotId } })

        return NextResponse.json(
            { message: "Successfully deleted timeslot", data: "result" },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error deleting timeslot:", error);

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
