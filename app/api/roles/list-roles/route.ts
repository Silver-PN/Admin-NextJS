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
// export const GET = async () => {
//   try {
//     const roles = await prisma.role.findMany({
//       include: {
//         permissions: true
//       }
//     });

//     const roleWithPermissions = roles.map((role) => ({
//       id: role.id,
//       name: role.name,
//       permissions: role.permissions.map((p) => p.permissionId),
//       createdAt: role.createdAt,
//       updatedAt: role.updatedAt
//     }));

//     return new NextResponse(JSON.stringify(roleWithPermissions), {
//       status: 200
//     });
//   } catch (error) {
//     return new NextResponse(error.message, { status: 500 });
//   }
// };
