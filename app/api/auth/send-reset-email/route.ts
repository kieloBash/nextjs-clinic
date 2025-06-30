import { MISSING_PARAMETERS } from "@/utils/constants";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";
import crypto from "crypto";

export async function POST(request: Request) {
    try {

        const body = await request.json();
        const { email } = body;

        if (!email) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findFirst({ where: { email } })

        if (!existingUser) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid email!" }),
                { status: 400 }
            );
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

        await prisma.passwordResetToken.deleteMany({
            where: { identifier: email },
        });

        await prisma.passwordResetToken.create({
            data: {
                identifier: email,
                token,
                expires,
            },
        });


        /*
        TODO: send email for reset password
        the email should redirect to this page

        /auth/reset-password/new?token={token}

        */
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password/new?token=${token}`;

        return new NextResponse(
            JSON.stringify({
                message: "Successfully sent a reset email",
                data: resetUrl,
            }),
            { status: 200 }
        );

    } catch (error: any) {
        console.error("Queue creation error:", error);

        return new NextResponse(
            JSON.stringify({
                message: "An error occurred while adding to the queue.",
                error: error.message || error,
            }),
            { status: 500 }
        );
    }

}