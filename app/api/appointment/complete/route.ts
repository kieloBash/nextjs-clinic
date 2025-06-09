import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
    const body = await request.json();
    const { } = body
    try {
        return new NextResponse(
            JSON.stringify({ message: "Success" }),
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