import { checkValidRole } from "@/libs/role";
import { prisma } from "@/prisma";
import { MISSING_PARAMETERS } from "@/utils/constants";
import { encryptPassword } from "@/utils/helpers/password";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const nameRaw = formData.get("name");
    const roleRaw = formData.get("role");
    const emailRaw = formData.get("email");
    const phoneRaw = formData.get("phone");
    const passwordRaw = formData.get("password");

    console.log(nameRaw, roleRaw, passwordRaw, roleRaw)

    if (!nameRaw || !roleRaw || !emailRaw || !passwordRaw || !phoneRaw) {
      return new NextResponse(
        JSON.stringify({ message: MISSING_PARAMETERS }),
        { status: 400 }
      );
    }

    const role = roleRaw.toString();
    const name = nameRaw.toString();
    const email = emailRaw.toString().toLowerCase();
    const password = passwordRaw.toString();
    const phone = phoneRaw.toString();

    const existingRole = await checkValidRole({ role });
    if (!existingRole) {
      return new NextResponse(JSON.stringify({ message: "Invalid role!" }), {
        status: 400,
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ message: "User with this email already exists." }),
        { status: 409 } // Conflict
      );
    }

    const hashedPassword = await encryptPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        roleId: existingRole.id,
        hashedPassword,
        phone
      },
    });

    return new NextResponse(
      JSON.stringify({
        message: "Created New User!",
        payload: newUser,
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error", error: String(error) }),
      { status: 500 }
    );
  }
}
