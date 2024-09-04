import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { userSchema } from '@/lib/branch/validation';
import { z } from 'zod';

export const POST = async (request: any) => {
  try {
    const body = await request.json();

    const validData = await userSchema.parseAsync(body);

    const { branch_code, branch_name, status, created_by, updated_by } =
      validData;
    const result = await prisma.$transaction(async (prisma) => {
      await prisma.branch.create({
        data: {
          branch_code,
          branch_name,
          status,
          updatedby: {
            connect: { id: updated_by }
          },
          createdby: {
            connect: { id: created_by }
          }
        }
      });
      return 'Branch is registered';
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

    const users = await prisma.branch.findMany({
      include: {
        createdby: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip, // Skip the previous pages
      take // Limit to the number of users per page
    });

    // Get the total count of users for pagination metadata
    const totalUsers = await prisma.branch.count();

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
