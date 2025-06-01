import { Role, User } from "@/app/generated/prisma";

export type UserFullType = User & {
    role: Role
}