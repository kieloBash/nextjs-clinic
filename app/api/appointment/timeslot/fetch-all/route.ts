import { getDoctor } from "@/libs/user";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url || "");

    const doctorId = searchParams.get("doctorId") || "";

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

    const timeSlots = await prisma.timeSlot.findMany({
        where: {
            doctorId,
        },
        orderBy: [
            { date: "asc" },
            { startTime: "asc" }
        ]
    })

    return new NextResponse(JSON.stringify({ message: "Fetched timeslots per doctor", data: timeSlots }), { status: 200 })
}