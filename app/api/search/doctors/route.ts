import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const userId = searchParams.get("userId") || "";
    const nameQuery = searchParams.get("searchTerm")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const sortBy = searchParams.get("sortBy") || "most_experienced";

    console.log(userId)

    if (page < 1 || limit < 1) {
        return NextResponse.json({ message: "Invalid pagination" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    if (!userId) {
        return new NextResponse(JSON.stringify({ message: "No user specified" }), {
            status: 400,
        });
    }

    let orderBy: Prisma.UserOrderByWithRelationInput = {};

    if (sortBy === "most_experienced") {
        orderBy = { completedAppointments: "desc" };
    } else if (sortBy === "name_asc") {
        orderBy = { name: "asc" };
    } else if (sortBy === "name_desc") {
        orderBy = { name: "desc" };
    }

    try {
        const existingUser = await checkUserExists({ id: userId });
        if (!existingUser) {
            return new NextResponse(JSON.stringify({ message: "No user found!" }), {
                status: 400,
            });
        }

        const doctors = await prisma.user.findMany({
            where: {
                role: { roleName: "DOCTOR" },
                name: {
                    contains: nameQuery,
                    mode: "insensitive",
                },
            },
            orderBy,
            skip,
            take: limit,
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

        const totalDoctors = await prisma.user.count({
            where: {
                role: { roleName: "DOCTOR" },
                name: {
                    contains: nameQuery,
                    mode: "insensitive",
                },
            },
        });


        return new NextResponse(JSON.stringify({
            message: "Fetched searched doctors",
            payload: {
                data: doctors.map((doctor) => ({
                    ...doctor,
                    completedAppointments: doctor.completedAppointments,
                })),
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalDoctors / limit),
                    totalItems: totalDoctors,
                },
            },
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