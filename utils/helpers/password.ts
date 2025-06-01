import bcrypt from "bcryptjs";

export async function encryptPassword(password: string) {
    return await bcrypt.hash(password, 10);
}