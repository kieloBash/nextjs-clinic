import { checkUserExists, getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { endOfDay, startOfDay } from "date-fns";
import { Prisma } from "@prisma/client";
import { MISSING_PARAMETERS } from "@/utils/constants";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const id = searchParams.get("id") || "";

    if (!id) {
        return new NextResponse(JSON.stringify({ message: MISSING_PARAMETERS }), {
            status: 400,
        });
    }

    try {
        const notification = await prisma.notification.findFirst({
            where: {
                id
            },
            include: { user: { select: { id: true, name: true, email: true } } },
        })

        console.log({ notification })
        
        return new NextResponse(JSON.stringify({ message: "Fetched notification of user", payload: notification }), { status: 200 })
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