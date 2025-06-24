import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";
import { DoctorAnalyticsPayload, PatientAnalyticsPayload } from "@/types/global.type";

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
        const existingPatient = await checkUserExists({ id: userId })
        if (!existingPatient) {
            return new NextResponse(JSON.stringify({ message: "No patient found!" }), {
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


        const [invoices, appointments] = await Promise.all([
            prisma.invoice.findMany({
                where: {
                    patientId: userId,
                    ...filtersCreatedAt,
                },
                include: {
                    appointment: {
                        include: {
                            doctor: true,
                        },
                    },
                },
            }),
            prisma.appointment.findMany({
                where: {
                    patientId: userId,
                    ...filtersCreatedAt,
                },
                include: {
                    doctor: true,
                    timeSlot: true,
                },
            }),
        ]);

        const now = new Date();
        const upcomingAppointments = await prisma.appointment.findMany({
            where: {
                patientId: userId,
                date: {
                    gte: startOfDay(now),
                },
                status: {
                    in: ["CONFIRMED", "PENDING"],
                },
                ...(filtersCreatedAt || {}),
            },
            include: {
                doctor: true,
                timeSlot: true,
            },
        });

        const totalSpent = invoices
            .filter((inv) => inv.status === "PAID")
            .reduce((sum, inv) => sum + inv.amount, 0);

        const paidInvoices = invoices.filter((inv) => inv.status === "PAID").length;
        const unpaidInvoices = invoices.filter((inv) => inv.status === "PENDING").length;

        const doctorVisitCounts = new Map<string, { name: string; visits: number }>();
        for (const app of appointments) {
            const doctorId = app.doctor.id;
            const doctorName = app.doctor.name;
            if (!doctorVisitCounts.has(doctorId)) {
                doctorVisitCounts.set(doctorId, { name: doctorName, visits: 0 });
            }
            doctorVisitCounts.get(doctorId)!.visits++;
        }

        const uniqueDoctors = doctorVisitCounts.size;

        const topDoctors = Array.from(doctorVisitCounts.values())
            .sort((a, b) => b.visits - a.visits)
            .slice(0, 5);

        const payload: PatientAnalyticsPayload = {
            totalSpent,
            paidInvoices,
            unpaidInvoices,
            uniqueDoctors,
            topDoctors,
            appointments: appointments as any[],
            totalAppointments: appointments.length,
            upcomingAppointments: upcomingAppointments as any[]
        };

        console.log({ payload })

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