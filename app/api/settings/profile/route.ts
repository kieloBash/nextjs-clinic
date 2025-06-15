import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { PROFILE_UPDATE } from "@/utils/constants";
import { createNotification } from "@/libs/notification";

export async function PATCH(request: Request) {
    const body = await request.json();
    const { name, email, phone, userId } = body;

    if (!userId) {
        return NextResponse.json({ message: "Please provide a user id" }, { status: 400 });
    }

    // Build only the fields that are present
    const data: Record<string, string> = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone) data.phone = phone;

    if (Object.keys(data).length === 0) {
        return NextResponse.json({ message: "Select at least one parameter to update" }, { status: 400 });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data,
        });

        await createNotification({
            tx: prisma,
            userId: updatedUser.id,
            message: PROFILE_UPDATE,
        });

        return NextResponse.json({ message: "Updated user profile", payload: updatedUser }, { status: 200 });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
        }

        return NextResponse.json({ message: "An unexpected error occurred", error: (error as Error).message }, { status: 500 });
    }
}
