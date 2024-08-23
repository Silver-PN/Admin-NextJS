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
      select: {
        id: true,
        email: true,
        username: true,
        employment_name: true,
        user_permissions: {
          select: {
            permission: {
              select: {
                id: true,
                permission_code: true
              }
            },
            role: {
              select: {
                id: true,
                role_name: true,
                role_code: true
              }
            },
            has_permission_type: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Extract permissions and roles
    const permissions = user.user_permissions.map((p) => ({
      permission_code: p.permission.permission_code,
      role_code: p.role ? p.role.role_code : null,
      has_permission_type: p.has_permission_type
    }));

    // Use a Set to get unique roles based on role_code
    const roles = Array.from(
      new Set(user.user_permissions.map((p) => JSON.stringify(p.role)))
    ).map((r) => JSON.parse(r));

    const userWithDetails = {
      ...user,
      user_permissions: permissions,
      roles: roles
    };

    return NextResponse.json(userWithDetails);
  } catch (error) {
    console.error('Failed to fetch user', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// export async function PUT(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   try {
//     const body = await request.json();

//     const { email, username, name } = body;

//     const updatedUser = await prisma.user.update({
//       where: { id: id },
//       data: {
//         email,
//         username,
//         name
//       }
//     });

//     return NextResponse.json(updatedUser);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request: Request,
//   { params }: { params: { id: string } }
// ) {
//   const { id } = params;

//   try {
//     const deletedUser = await prisma.user.delete({
//       where: { id: id }
//     });

//     return NextResponse.json(deletedUser);
//   } catch (error) {
//     return NextResponse.json(
//       { error: 'Internal Server Error' },
//       { status: 500 }
//     );
//   }
// }
