import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const doctorId = searchParams.get("id") || "";

    if (!doctorId) {
        return new NextResponse(JSON.stringify({ message: "No doctor specified" }), {
            status: 400,
        });
    }

    try {
        const doctor = await prisma.user.findFirst({
            where: {
                id: doctorId
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                completedAppointments: true,
                role: { select: { roleName: true } },
                doctorTimeSlots: {
                    where: {
                        status: "OPEN",
                        startTime: { gte: new Date() },
                    },
                    orderBy: { startTime: "asc" },
                    take: 5,
                    select: {
                        id: true,
                        date: true,
                        startTime: true,
                        endTime: true,
                        status: true,
                    },
                },
            },
        });

        return new NextResponse(JSON.stringify({
            message: "Fetched single doctor",
            payload: doctor
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