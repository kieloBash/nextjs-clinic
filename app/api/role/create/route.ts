import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();

  const nameRaw = formData.get("name");

  if (!nameRaw) {
    return new NextResponse(JSON.stringify({ message: "Missing parameters" }), {
      status: 400,
    });
  }

  const roleName = nameRaw.toString();

  const newRole = await prisma.role.create({
    data: { roleName },
  });

  return new NextResponse(
    JSON.stringify({ message: "Created new role!", data: newRole }),
    {
      status: 200,
    }
  );
}
