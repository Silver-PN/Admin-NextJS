import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  const { userId, permissionId, roleCode } = await request.json(); // Include roleCode in the request body

  try {
    const userPermission = await prisma.userHasPermission.create({
      data: {
        user: { connect: { id: userId } },
        permission: { connect: { permission_code: permissionId } }, // Use correct relation fields
        role: { connect: { role_code: roleCode } } // Connect the role_code
      }
    });

    return NextResponse.json(userPermission);
  } catch (error) {
    console.error('Error creating user permission:', error);
    return NextResponse.error();
  }
}
export async function PUT(request: Request) {
  try {
    const {
      userId,
      created_by,
      data
    }: {
      userId: string;
      created_by: string;
      data: {
        rightOptions1: any[];
        rightOptions2: any[];
        tmpRightOptions1: any[];
        finalOptions: Array<{
          value: string;
          label: string;
          role_code: string;
        }>;
      };
    } = await request.json();

    const existingPermissions = await prisma.userHasPermission.findMany({
      where: { user_id: userId }
    });

    if (existingPermissions.length > 0) {
      const historyEntries = existingPermissions.map((permission) => ({
        user_id: permission.user_id,
        permission_code: permission.permission_code,
        role_code: permission.role_code,
        has_permission_type: permission.has_permission_type,
        changed_at: new Date(),
        changed_by: created_by
      }));

      await prisma.userHasPermissionHistory.createMany({
        data: historyEntries
      });
    }
    // Delete existing permissions for the user
    await prisma.userHasPermission.deleteMany({
      where: { user_id: userId }
    });

    // Create sets of existing permissions for quick lookup

    const filteredOptions = data.rightOptions1.filter(
      (option) =>
        !data.tmpRightOptions1.some(
          (tmpOption) => tmpOption.value === option.value
        )
    );
    const existingPermissionsSet2 = new Set(
      data.rightOptions2.map((option) => option.value)
    );
    const existingPermissionsSet1 = new Set(
      filteredOptions.map((option) => option.value)
    );
    // Filter finalOptions to exclude those already in rightOptions1 or rightOptions2
    const filteredFinalOptions = data.finalOptions.filter(
      (option) =>
        !existingPermissionsSet1.has(option.value) &&
        !existingPermissionsSet2.has(option.value)
    );

    const permissionsToAdd = [
      ...filteredFinalOptions.map((option) => ({
        user_id: userId,
        created_by: created_by,
        permission_code: option.value,
        role_code: option.role_code,
        has_permission_type: 'active'
      })),
      ...filteredOptions.map((option) => ({
        user_id: userId,
        created_by: created_by,
        permission_code: option.value,
        role_code: option.role_code,
        has_permission_type: 'add'
      })),
      ...data.rightOptions2.map((option) => ({
        user_id: userId,
        created_by: created_by,
        permission_code: option.value,
        role_code: option.role_code,
        has_permission_type: 'lock'
      }))
    ];

    const addedPermissions = await prisma.userHasPermission.createMany({
      data: permissionsToAdd,
      skipDuplicates: true
    });

    return NextResponse.json(addedPermissions);
  } catch (error) {
    console.error('Error updating permissions:', error);
    return NextResponse.error();
  }
}
