// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const user = await prisma.branch.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        status: true,
        branch_code: true,
        branch_name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user', error);
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

    const { branch_code, branch_name, updated_by, status } = body;

    const updatedUser = await prisma.branch.update({
      where: { id: parseInt(id) },
      data: {
        branch_code,
        branch_name,
        status,
        updatedby: {
          connect: { id: updated_by }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // await prisma.userPermission.deleteMany({
    //   where: { userId: parseInt(id) }
    // });

    // await prisma.userRole.deleteMany({
    //   where: { userId: parseInt(id) }
    // });

    const deletedUser = await prisma.branch.delete({
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
