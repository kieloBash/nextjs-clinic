import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const userId = searchParams.get("userId") || "";
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

    if (!userId) {
        return new NextResponse(JSON.stringify({ message: "No doctor specified" }), {
            status: 400,
        });
    }

    try {
        const existingUser = await checkUserExists({ id: userId });
        if (!existingUser) {
            return new NextResponse(JSON.stringify({ message: "No user found!" }), {
                status: 400,
            });
        }

        const filters: any = {
            ...statusFilter && statusFilter !== "ALL" && {
                status: statusFilter
            },
            // ...(startDateParam &&
            //     endDateParam && {
            //     date: {
            //         gte: startOfDay(new Date(startDateParam)),
            //         lte: endOfDay(new Date(endDateParam)),
            //     },
            // }),
        }

        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                ...filters,
            },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: [
                { sentAt: "desc" }
            ]
        })

        return new NextResponse(JSON.stringify({ message: "Fetched notifications of user", payload: notifications }), { status: 200 })
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