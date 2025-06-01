import { checkValidRole } from "@/libs/role";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS } from "@/utils/constants";
import { encryptPassword } from "@/utils/helpers/password";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const nameRaw = formData.get("name");
  const roleRaw = formData.get("role");
  const emailRaw = formData.get("email");
  const passwordRaw = formData.get("password");

  if (!nameRaw || !roleRaw || !emailRaw || !passwordRaw) {
    return new NextResponse(JSON.stringify({ message: MISSING_PARAMETERS }), {
      status: 400,
    });
  }

  const existingRole = await checkValidRole({ role: roleRaw.toString() });
  if (!existingRole) {
    return new NextResponse(JSON.stringify({ message: "Invalid role!" }), {
      status: 400,
    });
  }

  const name = nameRaw.toString();
  const email = emailRaw.toString();
  const password = passwordRaw.toString();

  const hashedPassword = await encryptPassword(password);


  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      roleId: existingRole.id,
      hashedPassword
    },
  });

  return new NextResponse(
    JSON.stringify({ message: "Created New User!", data: newUser }),
    { status: 201 }
  );
}
