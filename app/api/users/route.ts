import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { userSchema } from '@/lib/validation';
import { z } from 'zod';

export const POST = async (request: any) => {
  try {
    const body = await request.json();

    userSchema.parse(body);

    const { email, password, username, name } = body;
    const result = await prisma.$transaction(async (prisma) => {
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });
      if (existingUser) {
        throw new Error('Username is already in use');
      }
      // const existingEmail = await prisma.user.findUnique({
      //   where: { email }
      // });

      // if (existingEmail) {
      //   throw new Error('Email is already in use');
      // }
      const hashedPassword = await bcrypt.hash(password, 5);
      await prisma.user.create({
        data: {
          email,
          username,
          password: hashedPassword,
          name
        }
      });

      return 'User is registered';
    });

    return new NextResponse(result, { status: 200 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.errors), { status: 400 });
    }
    return new NextResponse(err.message || 'Internal Server Error', {
      status: 500
    });
  }
};
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch users:', error);
    return NextResponse.error();
  }
}
