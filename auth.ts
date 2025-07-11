import NextAuth, { DefaultSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { checkUserExists } from "./libs/user";
import authConfig from "./auth.config";
import { PrismaClient } from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] & {
    role: string;
    phone?: string;
    accessToken?: string;
    isExpired?: boolean;
};

declare module "next-auth" {
    interface Session {
        user: ExtendedUser;
    }
}

const prisma = new PrismaClient();

const TOKEN_EXPIRES_IN = 60 * 60 * 24; // 24 hrs

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/auth/sign-in",
        signOut: "/",
    },
    callbacks: {
        async signIn({ user, account }) {
            console.log("Start signIn")
            // //Allow OAth w/o email verification
            if (account?.provider !== "credentials") return true;

            const existingUser = await checkUserExists({ id: user?.id });
            console.log("Existing user: ", existingUser);

            //Prevent sign in w/o email verification
            // if (!existingUser?.emailVerified) return false;

            //TODO: Add 2FA check

            console.log("End signIn")
            return true;
        },
        async session({ session, token }) {
            console.log("Start session")

            if (token.sub && session.user) {
                session.user.id = token.sub;
            }

            if (token.role && session.user) {
                session.user.role = token.role as string;
            }

            if (session.user) {
                session.user.name = token.name;
                session.user.email = token.email as string;
                session.user.phone = token?.phone as string;
                session.user.accessToken = token.accessToken as string;
            }

            console.log("Session: ", session);
            console.log("End session")
            return session;
        },
        async jwt({ token }) {
            console.log("Start jwt")

            if (!token.sub) return token;

            const existingUser = await checkUserExists({ id: token.sub });

            if (!existingUser) return token;

            token.role = existingUser.role.roleName;
            token.name = existingUser.name;
            token.email = existingUser.email;
            token.picture = existingUser.image;
            token.phone = existingUser.phone;

            console.log("Token:", token);
            console.log("End jwt")
            return token;

        },
    },
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt', maxAge: TOKEN_EXPIRES_IN },
    secret: process.env.AUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
    ...authConfig
})