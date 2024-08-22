// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
      include: {
        method_login: {
          select: {
            id: true,
            method_login_name: true
          }
        },
        branch: true
      }
      // select: {
      //   id: true,
      //   email: true,
      //   username: true,
      //   name: true
      // }
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

    const { email, username } = body;

    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        email,
        username
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
    // Delete user permissions
    await prisma.userHasPermission.deleteMany({
      where: { user_id: id }
    });

    // Delete the user
    const deletedUser = await prisma.user.delete({
      where: { id: id }
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
