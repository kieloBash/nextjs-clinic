import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS } from "@/utils/constants";

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const queueId = searchParams.get("queueId") || "";

    if (!queueId) {
        return new NextResponse(JSON.stringify({ message: MISSING_PARAMETERS }), {
            status: 400,
        });
    }

    try {
        const existingQueue = await prisma.queue.findFirst({ where: { id: queueId } });
        if (!existingQueue) {
            return new NextResponse(JSON.stringify({ message: "No queue found!" }), {
                status: 400,
            });
        }

        await prisma.queue.delete({ where: { id: existingQueue.id } })

        return new NextResponse(JSON.stringify({ message: "Deleted queue", payload: existingQueue }), { status: 200 })
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