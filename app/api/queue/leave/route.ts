import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS } from "@/utils/constants";

export async function POST(request: Request) {
    const { patientId, doctorId } = await request.json();

    if (!patientId || !doctorId) {
        return new NextResponse(JSON.stringify({ message: MISSING_PARAMETERS }), { status: 400 });
    }

    try {
        const queueEntry = await prisma.queue.findFirst({
            where: {
                patientId,
                doctorId,
            },
        });

        if (!queueEntry) {
            return new NextResponse(JSON.stringify({ message: "You're not in the queue." }), { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            // Delete the queue entry
            await tx.queue.delete({ where: { id: queueEntry.id } });

            // Reorder everyone behind them
            await tx.queue.updateMany({
                where: {
                    doctorId,
                    date: queueEntry.date,
                    position: { gt: queueEntry.position },
                },
                data: {
                    position: {
                        decrement: 1,
                    },
                },
            });
        });

        return new NextResponse(JSON.stringify({ message: "You have successfully left the queue." }), { status: 200 });
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ message: "An error occurred", error: (error as Error).message }),
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}
