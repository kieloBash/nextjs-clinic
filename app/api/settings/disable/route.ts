import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function PATCH(request: Request) {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
        return NextResponse.json({ message: "Missing user ID" }, { status: 400 });
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                isActive: false, // you need an isActive field in your User model
            },
        });

        return NextResponse.json({ message: "Account has been disabled successfully", payload: user }, { status: 200 });
    } catch (error) {
        return NextResponse.json({
            message: "Something went wrong",
            error: (error as Error).message,
        }, { status: 500 });
    }
}
