import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { checkUserExists } from "./libs/user";

export default {
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log("Start authorize")

                const email = credentials.email as string;
                const password = credentials.password as string;

                const user = await checkUserExists({ email });
                console.log("FOUND USER: ", user)
                if (!user || !user.hashedPassword) return null;

                const passwordsMatch = await bcrypt.compare(password, user.hashedPassword);

                console.log(user)
                console.log("end authorize")

                if (passwordsMatch) return user;

                return null;
            },
        }),
    ],
} satisfies NextAuthConfig;
