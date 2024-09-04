// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { userSchema } from '@/lib/department/validation';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const user = await prisma.departments.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        status: true,
        department_name: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'department not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch department', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const body = await request.json();

    // const validData = await userSchema.parseAsync(body, userId: 1);
    const validData = await userSchema.parseAsync(body);

    const { department_name, updated_by, status } = validData;

    const updatedUser = await prisma.departments.update({
      where: { id: parseInt(id) },
      data: {
        department_name,
        status,
        updated_by_user: {
          connect: { id: updated_by }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(err.errors), { status: 400 });
    }
    return new NextResponse(err.message || 'Internal Server Error', {
      status: 500
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const deletedUser = await prisma.departments.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
