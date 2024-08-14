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
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true
              }
            }
          }
        },
        roles: {
          select: {
            role: {
              select: {
                id: true,
                permissions: true
              }
            }
          }
        }
      }
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userWithPermissions = {
      ...user,
      permissions: user.permissions.map((p) => p.permission.id)
      // roles: user.permissions.map((r) => r.permission.map((p) => p.permission.id))
    };
    return NextResponse.json(userWithPermissions);
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

    const { email, username, name } = body;

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        email,
        username,
        name
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
    const deletedUser = await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json(deletedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
