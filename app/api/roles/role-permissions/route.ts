// app/api/role-permissions/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true
      }
    });
    return NextResponse.json(rolePermissions);
  } catch (error) {
    return NextResponse.error();
  }
}

export async function POST(request: Request) {
  const { roleId, permissionId } = await request.json();
  try {
    const rolePermission = await prisma.rolePermission.create({
      data: {
        role: { connect: { id: roleId } },
        permission: { connect: { id: permissionId } },
      },
    });
    return NextResponse.json(rolePermission);
  } catch (error) {
    return NextResponse.error();
  }
}

// You can add DELETE and PUT methods here for managing role-permission associations
