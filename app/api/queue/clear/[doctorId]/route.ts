import { getDoctor } from "@/libs/user";
import { MISSING_PARAMETERS } from "@/utils/constants";
import { prisma } from "@/prisma"; // Ensure this path matches your project
import { NextResponse } from "next/server";
import { checkSessionUser, currentUser } from "@/libs/auth";

export async function DELETE(
    request: Request) {
    const sessionUser = await checkSessionUser() as any;

    const url = new URL(request.url);
    const doctorId = url.pathname.split("/").pop();
    
    if (!doctorId) {
        return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
    }

    if (sessionUser.id !== doctorId) {
        return NextResponse.json({ message: "Unauthorized user!" }, { status: 401 });
    }

    try {
        const doctor = await getDoctor({ doctorId });

        if (!doctor) {
            return NextResponse.json(
                { message: `Doctor with ID ${doctorId} not found.` },
                { status: 404 }
            );
        }

        const { count } = await prisma.queue.deleteMany({
            where: { doctorId },
        });

        return NextResponse.json(
            {
                message: "Successfully cleared queue.",
                deletedCount: count,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Queue clearing for doctor error:", error);

        return NextResponse.json(
            {
                message: "An error occurred while clearing the queue.",
                error: error.message || error,
            },
            { status: 500 }
        );
    }
}
