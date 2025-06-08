import { getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const doctorId = searchParams.get("doctorId") || "";
    const statusFilter = searchParams.get("statusFilter") || "ALL";

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const isOnlyOneDateProvided =
        (!!startDateParam && !endDateParam) || (!startDateParam && !!endDateParam);
    if (isOnlyOneDateProvided) {
        return new NextResponse(
            JSON.stringify({ message: "Provide both startDate and endDate, or neither." }),
            { status: 400 }
        );
    }

    if (startDateParam && endDateParam) {
        const start = new Date(startDateParam);
        const end = new Date(endDateParam);
        if (start > end) {
            return new NextResponse(
                JSON.stringify({ message: "endDate must be greater than or equal to startDate." }),
                { status: 400 }
            );
        }
    }

    if (!doctorId) {
        return new NextResponse(
            JSON.stringify({ message: "No doctor specified" }),
            { status: 400 }
        );
    }

    try {
        const existingDoctor = await getDoctor({ doctorId });
        if (!existingDoctor) {
            return new NextResponse(
                JSON.stringify({ message: "No doctor found!" }),
                { status: 404 }
            );
        }

        const filters: any = {
            ...(statusFilter !== "ALL" && { status: statusFilter }),
            ...(startDateParam &&
                endDateParam && {
                date: {
                    gte: startOfDay(new Date(startDateParam)),
                    lte: endOfDay(new Date(endDateParam)),
                },
            }),
        };

        const timeSlots = await prisma.timeSlot.findMany({
            where: {
                doctorId,
                ...filters,
            },
            orderBy: [{ date: "asc" }, { startTime: "asc" }],
        });

        return new NextResponse(
            JSON.stringify({
                message: "Fetched timeslots per doctor",
                payload: timeSlots,
            }),
            { status: 200 }
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
