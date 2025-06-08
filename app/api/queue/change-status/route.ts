import { Prisma, QueueStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS } from "@/utils/constants";

export async function PATCH(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const queueId = searchParams.get("queueId") || "";
    const status = searchParams.get("status") || "";

    if (!queueId || !status) {
        return new NextResponse(JSON.stringify({ message: MISSING_PARAMETERS }), {
            status: 400,
        });
    }

    if (!Object.keys(QueueStatus).includes(status.toString())) {
        return new NextResponse(JSON.stringify({ message: "Invalid status" }), {
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

        const newStatus = status as QueueStatus;

        const updatedQueue = await prisma.queue.update({ where: { id: existingQueue.id }, data: { status: newStatus } })

        return new NextResponse(JSON.stringify({ message: "Updated queue", payload: updatedQueue }), { status: 200 })

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