import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const POST = async (request: any) => {
  const { name } = await request.json();

  try {
    const role = await prisma.role.create({
      data: { name }
    });
    return NextResponse.json(role);
  } catch (err: any) {
    return new NextResponse(err.message || 'Internal Server Error', {
      status: 500
    });
  }
};
// export const POST = async (request: any) => {
//   const { name, permissions } = await request.json(); // Assume permissions are sent in the request

//   try {
//     const result = await prisma.$transaction(async (prisma) => {
//       // Tạo một role mới
//       const role = await prisma.role.create({
//         data: { name }
//       });

//       // Nếu có quyền (permissions) được truyền vào, thêm chúng vào role
//       if (permissions && permissions.length > 0) {
//         await prisma.rolePermission.createMany({
//           data: permissions.map((permissionId: string) => ({
//             roleId: role.id,
//             permissionId
//           }))
//         });
//       }

//       return role;
//     });

//     return NextResponse.json(result);
//   } catch (err: any) {
//     return new NextResponse(err.message || 'Internal Server Error', {
//       status: 500
//     });
//   }
// };

export const GET = async () => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: true
      }
    });

    const roleWithPermissions = roles.map((role) => ({
      id: role.id,
      name: role.name,
      permissions: role.permissions.map((p) => p.permissionId),
      createdAt: role.createdAt,
      updatedAt: role.updatedAt
    }));

    return new NextResponse(JSON.stringify(roleWithPermissions), {
      status: 200
    });
  } catch (error) {
    return new NextResponse(error.message, { status: 500 });
  }
};
