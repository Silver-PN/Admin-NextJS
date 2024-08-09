import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import User from "@/models/User"
const prisma = new PrismaClient();

export const POST = async (request: any) => {
  const { name } = await request.json();

  try {
    const role = await prisma.role.create({
      data: { name },
    });
    return NextResponse.json(role);
  } catch (err: any) {
    return new NextResponse(err.message || "Internal Server Error", {
      status: 500,
    });
  }
};
export const GET = async () => {
  try {
    const roles = await prisma.role.findMany();
    return new NextResponse(JSON.stringify(roles), { status: 200 });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
};
