import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {

    const { searchParams } = new URL(request.url || "");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);
    const searchTerm = searchParams.get("searchTerm") || "";

    const searchWhere = searchTerm && searchTerm.trim() !== ""
        ? {
            name: {
                contains: searchTerm,
                mode: Prisma.QueryMode.insensitive,
            },
        }
        : {};

    const doctors = await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
            ...searchWhere,
            role: {
                roleName: "DOCTOR"
            },
        },
    })

    return new NextResponse(JSON.stringify({ message: "Fetched doctors list", data: doctors }), { status: 200 })
}