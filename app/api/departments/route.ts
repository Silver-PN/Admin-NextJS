import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { userSchema } from '@/lib/department/validation';
import { z } from 'zod';

export const POST = async (request: any) => {
  try {
    const body = await request.json();

    const validData = await userSchema.parseAsync(body);

    const { department_name, status, created_by, updated_by } = validData;
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.departments.create({
        data: {
          department_name,
          status,
          created_by_user: created_by
            ? {
                connect: { id: created_by }
              }
            : undefined
          // updated_by_user: updated_by
          //   ? {
          //       connect: { id: updated_by }
          //     }
          //   : undefined
        }
      });
      return 'department is registered';
    });

    return new NextResponse(JSON.stringify(result), { status: 200 });
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

    const users = await prisma.departments.findMany({
      include: {
        created_by_user: {
          select: {
            id: true,
            employment_name: true
          }
        }
      },
      skip, // Skip the previous pages
      take // Limit to the number of users per page
    });

    // Get the total count of users for pagination metadata
    const totalUsers = await prisma.departments.count();

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
    console.error('Failed to fetch departments:', error);
    return NextResponse.error();
  }
}
