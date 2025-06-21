import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const patientId = searchParams.get("patientId") || "";
    const statusFilter = searchParams.get("statusFilter") || "ALL";

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    console.log({ startDateParam, endDateParam })

    if (page < 1 || limit < 1) {
        return NextResponse.json({ message: "Invalid pagination" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

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

        console.log({ filters })

        const appointments = await prisma.appointment.findMany({
            skip,
            take: limit,
            where: {
                patientId,
                ...filters,
            },
            include: { timeSlot: true, patient: true, doctor: true, invoice: { select: { id: true, amount: true, status: true, createdAt: true } } },
            orderBy: [
                { date: "desc" }
            ]
        })

        const groupedCounts = await prisma.appointment.groupBy({
            by: ['status'],
            where: {
                patientId,
                ...(startDateParam && endDateParam && {
                    date: {
                        gte: startOfDay(new Date(startDateParam)),
                        lte: endOfDay(new Date(endDateParam)),
                    },
                }),
            },
            _count: true,
        });

        console.log({ groupedCounts })

        const statusSummary = {
            total: groupedCounts.reduce((sum, group) => sum + group._count, 0),
            completed: groupedCounts.find(g => g.status === 'COMPLETED')?._count || 0,
            cancelled: (groupedCounts.find(g => g.status === 'RESCHEDULED')?._count || 0) + (groupedCounts.find(g => g.status === 'CANCELLED')?._count || 0),
            pending_or_confirmed:
                (groupedCounts.find(g => g.status === 'PENDING')?._count || 0) +
                (groupedCounts.find(g => g.status === 'PENDING_PAYMENT')?._count || 0) +
                (groupedCounts.find(g => g.status === 'CONFIRMED')?._count || 0),
        };

        const totalItems = await prisma.appointment.count({
            where: {
                patientId,
                ...filters,
            }
        })

        return new NextResponse(JSON.stringify({
            message: "Fetched appointments of patient",
            payload: {
                data: { appointments, statusSummary },
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems,
                }
            }
        }), { status: 200 })
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