import { getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const doctorId = searchParams.get("doctorId") || "";
    const statusFilter = searchParams.get("statusFilter") || "ALL";

    if (!doctorId) {
        return new NextResponse(JSON.stringify({ message: "No doctor specified" }), {
            status: 400,
        });
    }

    try {
        const existingDoctor = await getDoctor({ doctorId });
        if (!existingDoctor) {
            return new NextResponse(JSON.stringify({ message: "No doctor found!" }), {
                status: 400,
            });
        }

        const filters: any = {
            ...statusFilter && statusFilter !== "ALL" && {
                status: statusFilter
            },
        }

        const queues = await prisma.queue.findMany({
            where: {
                doctorId,
                ...filters,
            },
            include: { appointment: true, patient: true, doctor: true },
            orderBy: [
                { date: "asc" }
            ]
        })

        console.log(queues)

        return new NextResponse(JSON.stringify({ message: "Fetched queues of doctor", payload: queues }), { status: 200 })
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