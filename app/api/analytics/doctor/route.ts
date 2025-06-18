import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";
import { DoctorAnalyticsPayload } from "@/types/global.type";

export async function GET(request: Request) {
    console.log("START ANALYTICS ROUTE")
    const { searchParams } = new URL(request.url || "");

    const userId = searchParams.get("userId") || "";

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
        const existingDoctor = await getDoctor({ doctorId: userId })
        if (!existingDoctor) {
            return new NextResponse(JSON.stringify({ message: "No doctor found!" }), {
                status: 400,
            });
        }

        const filtersCreatedAt: any = {
            ...(startDateParam &&
                endDateParam && {
                createdAt: {
                    gte: startOfDay(new Date(startDateParam)),
                    lte: endOfDay(new Date(endDateParam)),
                },
            }),
        }

        const currentDoctorId = existingDoctor.id;

        // 1. Revenue over time (e.g., for graph)
        const revenueOverTimeRaw = await prisma.invoice.groupBy({
            by: ['createdAt'],
            where: {
                createdBy: currentDoctorId,
                status: 'PAID',
                ...filtersCreatedAt
            },
            _sum: { amount: true },
            orderBy: { createdAt: 'asc' }
        });

        const revenueOverTime = revenueOverTimeRaw.map((item) => ({
            date: item.createdAt.toISOString(),
            revenue: item._sum.amount || 0,
        }));

        console.log({ revenueOverTime })

        // 2. Appointment status breakdown
        const appointmentStatusRaw = await prisma.appointment.groupBy({
            by: ['status'],
            where: { doctorId: currentDoctorId, ...filtersCreatedAt },
            _count: true
        });

        console.log({ appointmentStatusRaw })

        const appointmentStatusBreakdown = appointmentStatusRaw.map((item) => ({
            status: item.status,
            count: item._count,
        }));

        console.log({ appointmentStatusBreakdown })

        // 3. Total patients (distinct)
        const uniquePatients = await prisma.appointment.findMany({
            where: { doctorId: currentDoctorId, ...filtersCreatedAt },
            distinct: ['patientId'],
            select: { patientId: true }
        });
        const totalPatients = uniquePatients.length;

        console.log({ totalPatients })

        // 4. Total appointments and completion rate
        const [totalAppointments, completedAppointments] = await Promise.all([
            prisma.appointment.count({ where: { doctorId: currentDoctorId, ...filtersCreatedAt } }),
            prisma.appointment.count({
                where: {
                    doctorId: currentDoctorId,
                    status: 'COMPLETED',
                    ...filtersCreatedAt
                }
            })
        ]);

        const completionRate = totalAppointments > 0
            ? parseFloat(((completedAppointments / totalAppointments) * 100).toFixed(1))
            : 0;

        // 5. Total revenue
        const totalRevenueResult = await prisma.invoice.aggregate({
            where: {
                createdBy: currentDoctorId,
                status: 'PAID',
                ...filtersCreatedAt
            },
            _sum: { amount: true }
        });
        const totalRevenue = totalRevenueResult._sum.amount || 0;

        const payload: DoctorAnalyticsPayload = {
            totalPatients,
            totalAppointments,
            totalRevenue,
            completionRate,
            appointmentStatusBreakdown,
            revenueOverTime
        };

        return new NextResponse(JSON.stringify({ message: "Fetched analytics", payload }), { status: 200 })
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