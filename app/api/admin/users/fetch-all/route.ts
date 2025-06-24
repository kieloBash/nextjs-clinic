import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const roleFilter = searchParams.get("roleFilter") || "ALL";
    const nameQuery = searchParams.get("searchTerm")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);


    if (page < 1 || limit < 1) {
        return NextResponse.json({ message: "Invalid pagination" }, { status: 400 });
    }

    const skip = (page - 1) * limit;


    const filters: any = {
        ...roleFilter !== "ALL" && {
            role: { roleName: roleFilter }
        },
        name: {
            contains: nameQuery,
            mode: "insensitive",
        },
    }
    try {
        const users = await prisma.user.findMany({
            where: {
                ...filters
            },
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                createdAt: true,
                isActive: true,
                completedAppointments: true,
                role: { select: { roleName: true } },
                appointmentsAsDoctor: { select: { id: true, status: true } },
                appointmentsAsPatient: { select: { id: true, status: true } }
            },
        });

        console.log({ users })

        const totalItems = await prisma.user.count({
            where: {
                ...filters
            },
        });

        const totalUsers = await prisma.user.groupBy({
            by: ['roleId'],
            _count: {
                roleId: true,
            },
            where: {
                role: { roleName: { in: ["PATIENT", "DOCTOR"] } }
            }
        });

        const roles = await prisma.role.findMany();
        const totalUsersByRoleName = totalUsers.map(group => {
            const role = roles.find(r => r.id === group.roleId);
            return {
                roleName: role?.roleName || "Unknown",
                count: group._count.roleId,
            };
        });

        return new NextResponse(JSON.stringify({
            message: "Fetched all users",
            payload: {
                data: { totalUsersByRoleName, users },
                pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(totalItems / limit),
                    totalItems,
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