import logger from '@/lib/logger';
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
    const oldUser = await prisma.user.findUnique({
      where: { id: id }
    });
    const updatedUser = await prisma.user.update({
      where: { id: id },
      data: {
        email,
        username
      }
    });
    const compareUserObjects = (oldUser, updatedUser) => {
      const changes = {};

      // Lấy danh sách các trường của đối tượng
      const fields = Object.keys(oldUser);

      fields.forEach((field) => {
        // Bỏ qua các trường thời gian tạo và cập nhật
        if (field !== 'created_at' && field !== 'updated_at') {
          // Compare field values between objects
          if (
            oldUser[field as keyof typeof oldUser] !==
            updatedUser[field as keyof typeof updatedUser]
          ) {
            (changes as Record<string, { oldValue: any; newValue: any }>)[
              field
            ] = {
              oldValue: oldUser[field as keyof typeof oldUser],
              newValue: updatedUser[field as keyof typeof updatedUser]
            };
          }
        }
      });

      return changes;
    };

    logger.info({
      message: 'User updated',
      change: compareUserObjects(oldUser, updatedUser)
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
    const lockedUser = await prisma.user.update({
      where: { id: id },
      data: {
        status: 'locked'
      }
    });

    return NextResponse.json(lockedUser);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
