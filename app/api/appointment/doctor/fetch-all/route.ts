import { getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const doctorId = searchParams.get("doctorId") || "";
    const statusFilter = searchParams.get("statusFilter") || "ALL";

    if (!doctorId) {
        return new NextResponse(JSON.stringify({ message: "No doctor specified" }), {
            status: 400,
        });
    }

    const existingDoctor = await getDoctor({ doctorId });
    if (!existingDoctor) {
        return new NextResponse(JSON.stringify({ message: "No doctor found!" }), {
            status: 400,
        });
    }

    const filters: any = {
        ...statusFilter && statusFilter !== "ALL" && {
            status: statusFilter
        }
    }

    const appointments = await prisma.appointment.findMany({
        where: {
            doctorId,
            ...filters,
        },
        include: { timeSlot: true, patient: true, doctor: true },
        orderBy: [
            { date: "asc" }
        ]
    })

    return new NextResponse(JSON.stringify({ message: "Fetched appointments of doctor", payload: appointments }), { status: 200 })
}