import { checkValidRole } from "@/libs/role";
import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const nameRaw = formData.get("name");
  const roleRaw = formData.get("role");
  const emailRaw = formData.get("email");

  if (!nameRaw || !roleRaw || !emailRaw) {
    return new NextResponse(JSON.stringify({ message: "Missing parameters" }), {
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

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      roleId: existingRole.id,
    },
  });

  return new NextResponse(
    JSON.stringify({ message: "Created New User!", data: newUser }),
    { status: 201 }
  );
}
