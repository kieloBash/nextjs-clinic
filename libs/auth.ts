import { auth } from "@/auth";
import { HAS_SESSION, NO_SESSION } from "@/utils/constants";
import { NextResponse } from "next/server";

export const currentUser = async () => {
    const session = await auth();
    return session?.user;
};

export const currentRole = async () => {
    const session = await auth();
    return session?.user.role;
};

export const checkSessionUser = async () => {
    const session = await auth();

    if (!session?.user) {
        return new NextResponse(NO_SESSION, { status: 401 })
    }
    console.log(HAS_SESSION);

    return session.user;

}
