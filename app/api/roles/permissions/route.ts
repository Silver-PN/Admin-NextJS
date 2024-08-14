import { NextResponse } from 'next/server';

import prisma from '@/lib/db';

export async function GET() {
  try {
    const permissions = await prisma.permission.findMany();
    return NextResponse.json(permissions);
  } catch (error) {
    return NextResponse.error();
  }
}

export async function POST(request: Request) {
  const { name } = await request.json();
  try {
    const permission = await prisma.permission.create({
      data: { name }
    });
    return NextResponse.json(permission);
  } catch (error) {
    return NextResponse.error();
  }
}

// Additional methods for PUT and DELETE can be added similarly
