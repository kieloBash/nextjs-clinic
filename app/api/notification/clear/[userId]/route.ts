import { checkUserExists, getDoctor } from "@/libs/user";
import { MISSING_PARAMETERS } from "@/utils/constants";
import { prisma } from "@/prisma"; // Ensure this path matches your project
import { NextResponse } from "next/server";
import { checkSessionUser, currentUser } from "@/libs/auth";

export async function DELETE(
    request: Request) {
    const sessionUser = await checkSessionUser() as any;

    const url = new URL(request.url);
    const userId = url.pathname.split("/").pop();

    if (!userId) {
        return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
    }

    if (sessionUser.id !== userId) {
        return NextResponse.json({ message: "Unauthorized user!" }, { status: 401 });
    }

    try {
        const existingUser = await checkUserExists({ id: userId });

        if (!existingUser) {
            return NextResponse.json(
                { message: `User with ID ${userId} not found.` },
                { status: 404 }
            );
        }

        const { count } = await prisma.notification.deleteMany({
            where: { userId },
        });

        return NextResponse.json(
            {
                message: "Successfully cleared notifications.",
                deletedCount: count,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Notification clearing error:", error);

        return NextResponse.json(
            {
                message: "An error occurred while clearing the notification.",
                error: error.message || error,
            },
            { status: 500 }
        );
    }
}
