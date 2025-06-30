import { MISSING_PARAMETERS } from "@/utils/constants";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(request: Request) {
    try {

        const body = await request.json();
        const { newPassword, token } = body;

        if (!newPassword || !token) {
            return new NextResponse(
                JSON.stringify({ message: MISSING_PARAMETERS }),
                { status: 400 }
            );
        }

        const existingToken = await prisma.passwordResetToken.findFirst({
            where: { token },
        });

        if (!existingToken) {
            return new NextResponse(
                JSON.stringify({ message: "Invalid or expired token." }),
                { status: 400 }
            );
        }

        if (existingToken.expires < new Date()) {
            await prisma.passwordResetToken.delete({
                where: {
                    identifier_token: {
                        identifier: existingToken.identifier,
                        token: existingToken.token,
                    },
                },
            });

            return new NextResponse(
                JSON.stringify({ message: "Token has expired." }),
                { status: 400 }
            );
        }


        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const updatedUser = await prisma.user.update({
            where: { email: existingToken.identifier },
            data: { hashedPassword },
        });

        await prisma.passwordResetToken.delete({
            where: {
                identifier_token: {
                    identifier: existingToken.identifier,
                    token: existingToken.token,
                },
            },
        });

        return new NextResponse(
            JSON.stringify({
                message: "Successfully reset new password.",
                data: updatedUser,
            }),
            { status: 201 }
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