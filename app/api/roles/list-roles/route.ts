import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const POST = async (request: Request) => {
  const { role_code, role_name, description, status, user_active } =
    await request.json();

  try {
    const [role] = await prisma.$transaction([
      prisma.role.create({
        data: {
          role_code,
          role_name,
          description,
          status,
          created_by: user_active
        }
      })
    ]);

    return NextResponse.json(role);
  } catch (err: any) {
    return new NextResponse(err.message || 'Internal Server Error', {
      status: 500
    });
  }
};

export const GET = async () => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true // Include related permissions
      }
    });

    // Map roles to a simplified structure
    const roleWithPermissions = roles.map((role) => ({
      id: role.id,
      role_code: role.role_code,
      role_name: role.role_name,
      description: role.description,
      status: role.status,
      created_at: role.created_at,
      updated_at: role.updated_at,
      permissions: role.permissions.map((p) => p.permission_code) // Map permissions to their codes
    }));

    return NextResponse.json(roleWithPermissions);
  } catch (error: any) {
    return new NextResponse(error.message || 'Internal Server Error', {
      status: 500
    });
  }
};
