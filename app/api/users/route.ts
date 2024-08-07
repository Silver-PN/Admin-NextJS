import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import User from '@/app/models/User';
import { z } from 'zod';
const prisma = new PrismaClient();

const userSchema = z
  .object({
    email: z.string().email({ message: 'Invalid email address' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long' }),
    name: z.string().optional(),
    password: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Password must be at least 6 characters long' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword']
  });

export const POST = async (request: any) => {
  try {
    const body = await request.json();

    userSchema.parse(body);

    const { email, password, username, name } = body;

    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return new NextResponse('Username is already in use', { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    await User.create({
      email,
      username,
      password: hashedPassword,
      name
    });

    return new NextResponse('User is registered', { status: 200 });
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
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch users:', error);
    return NextResponse.error();
  }
}
