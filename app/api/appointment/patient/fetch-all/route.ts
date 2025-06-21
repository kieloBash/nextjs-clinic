import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const patientId = searchParams.get("patientId") || "";
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

    if (!patientId) {
        return new NextResponse(JSON.stringify({ message: "No patient specified" }), {
            status: 400,
        });
    }

    try {
        const existingPatient = await checkUserExists({ id: patientId });
        if (!existingPatient) {
            return new NextResponse(JSON.stringify({ message: "No patient found!" }), {
                status: 400,
            });
        }

        const filters: any = {
            ...statusFilter && statusFilter !== "ALL" && {
                status: statusFilter
            },
            ...(startDateParam &&
                endDateParam && {
                date: {
                    gte: startOfDay(new Date(startDateParam)),
                    lte: endOfDay(new Date(endDateParam)),
                },
            }),
        }

        const appointments = await prisma.appointment.findMany({
            where: {
                patientId,
                ...filters,
            },
            include: { timeSlot: true, patient: true, doctor: true, invoice: { select: { id: true, amount: true, status: true, createdAt: true } } },
            orderBy: [
                { date: "desc" }
            ]
        })

        return new NextResponse(JSON.stringify({ message: "Fetched appointments of patient", payload: appointments }), { status: 200 })
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