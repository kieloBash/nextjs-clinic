import { prisma } from "@/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const users = await prisma.user.findMany({});
  return new NextResponse(JSON.stringify({ data: users }), {
    status: 200,
  });
}
