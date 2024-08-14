import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const { userId, permissionId } = await request.json();
  try {
    const userPermission = await prisma.userPermission.create({
      data: {
        user: { connect: { id: userId } },
        permission: { connect: { id: permissionId } }
      }
    });
    return NextResponse.json(userPermission);
  } catch (error) {
    return NextResponse.error();
  }
}

export async function PUT(request: Request) {
  const { userId, permissionIds }: { userId: string; permissionIds: string[] } =
    await request.json();

  try {
    // Remove all existing permissions for the user
    await prisma.userPermission.deleteMany({
      where: { userId }
    });

    // Add the new permissions
    const addedPermissions = await prisma.userPermission.createMany({
      data: permissionIds.map((permissionId) => ({
        userId,
        permissionId
      })),
      skipDuplicates: true
    });

    return NextResponse.json(addedPermissions);
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.error();
  }
}
