import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { userSchema } from '@/lib/validation';
import { z } from 'zod';

export const POST = async (request: any) => {
  try {
    const body = await request.json();

    const validData = await userSchema.parseAsync(body);

    const {
      email,
      password,
      username,
      employment_name,
      method_login_id,
      user_active,
      branch_code,
      department_id
    } = validData;

    const result = await prisma.$transaction(async (prisma) => {
      // const existingUser = await prisma.user.findUnique({
      //   where: { username }
      // });
      // if (existingUser) {
      //   throw new Error('Username is already in use');
      // }
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
          employment_name,
          status: 'active',
          password: hashedPassword,
          method_login: {
            connect: { id: Number(method_login_id) }
          },
          branch: {
            connect: { branch_code: branch_code }
          },
          department: {
            connect: { id: department_id }
          },
          created_by: user_active
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
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const users = await prisma.user.findMany({
      include: {
        user_permissions: {
          select: {
            role: {
              select: {
                id: true,
                role_name: true
              }
            }
          },
          distinct: ['role_code']
        },
        method_login: true,
        branch: true
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take
    });

    // Get the total count of users for pagination metadata
    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      users,
      meta: {
        totalUsers,
        page,
        pageSize,
        totalPages: Math.ceil(totalUsers / pageSize)
      }
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch users:', error);
    return NextResponse.error();
  }
}
