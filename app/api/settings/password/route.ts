import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS, PASSWORD_UPDATE } from "@/utils/constants";
import { createNotification } from "@/libs/notification";
import bcrypt from "bcryptjs"; // Ensure this is installed

export async function PATCH(request: Request) {
    const body = await request.json();
    const { newPassword, confirmPassword, currentPassword, userId } = body;

    if (!userId || !newPassword || !confirmPassword || !currentPassword) {
        return NextResponse.json({ message: MISSING_PARAMETERS }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
        return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser || !existingUser.hashedPassword) {
            return NextResponse.json({ message: "User not found or password missing" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, existingUser.hashedPassword);
        if (!isPasswordValid) {
            return NextResponse.json({ message: "Current password is incorrect" }, { status: 403 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { hashedPassword },
        });

        await createNotification({
            tx: prisma,
            userId: updatedUser.id,
            message: PASSWORD_UPDATE,
        });

        return NextResponse.json({ message: "Password updated successfully", payload: updatedUser }, { status: 200 });

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            message: "An unexpected error occurred",
            error: (error as Error).message,
        }, { status: 500 });
    }
}
