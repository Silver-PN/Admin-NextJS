const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Seed roles
  const roles = [{ name: 'admin' }, { name: 'employee' }, { name: 'customer' }];

  // Seed permissions
  const permissions = [
    { permissionCode: 'admin', name: 'Administrator Access' },
    { permissionCode: 'employee_create', name: 'Create Employee Records' },
    { permissionCode: 'employee_read', name: 'Read Employee Records' },
    { permissionCode: 'employee_update', name: 'Update Employee Records' },
    { permissionCode: 'employee_delete', name: 'Delete Employee Records' },
    { permissionCode: 'customer_create', name: 'Create Customer Records' },
    { permissionCode: 'customer_read', name: 'Read Customer Records' },
    { permissionCode: 'customer_update', name: 'Update Customer Records' },
    { permissionCode: 'customer_delete', name: 'Delete Customer Records' }
  ];

  // Create roles and permissions
  await prisma.role.createMany({
    data: roles,
    skipDuplicates: true
  });

  await prisma.permission.createMany({
    data: permissions,
    skipDuplicates: true
  });

  // Define role permissions
  const rolePermissions = [
    {
      roleName: 'admin',
      permissions: [
        'admin',
        'employee_create',
        'employee_read',
        'employee_update',
        'employee_delete',
        'customer_create',
        'customer_read',
        'customer_update',
        'customer_delete'
      ]
    },
    {
      roleName: 'employee',
      permissions: [
        'employee_create',
        'employee_read',
        'employee_update',
        'employee_delete'
      ]
    },
    {
      roleName: 'customer',
      permissions: [
        'customer_create',
        'customer_read',
        'customer_update',
        'customer_delete'
      ]
    }
  ];

  // Fetch roles and permissions in batch
  const [rolesData, permissionsData] = await Promise.all([
    prisma.role.findMany({
      where: {
        name: { in: rolePermissions.map((rp) => rp.roleName) }
      }
    }),
    prisma.permission.findMany({
      where: {
        permissionCode: { in: rolePermissions.flatMap((rp) => rp.permissions) }
      }
    })
  ]);

  // Map roles and permissions for easier access
  const roleMap = new Map(
    rolesData.map((role: { name: any; id: any }) => [role.name, role.id])
  );
  const permissionMap = new Map(
    permissionsData.map((permission: { permissionCode: any; id: any }) => [
      permission.permissionCode,
      permission.id
    ])
  );

  // Prepare role permissions data
  const rolePermissionsData = rolePermissions.flatMap((rolePerm) => {
    const roleId = roleMap.get(rolePerm.roleName);
    if (!roleId) return [];

    return rolePerm.permissions
      .map((permissionCode) => permissionMap.get(permissionCode))
      .filter((permissionId) => permissionId)
      .map((permissionId) => ({
        roleId,
        permissionId
      }));
  });

  // Create role permissions in batch
  await prisma.rolePermission.createMany({
    data: rolePermissionsData,
    skipDuplicates: true
  });

  // Define users to be seeded
  const users = [
    {
      email: 'admin@gmail.com',
      username: 'admin',
      name: 'Admin User',
      password: '123123123',
      roles: ['admin'],
      permissions: [],
      permissions_deny: []
    },
    {
      email: 'employee@gmail.com',
      username: 'employee',
      name: 'Employee User',
      password: '123123123',
      roles: ['employee'],
      permissions: ['customer_read'],
      permissions_deny: ['employee_delete']
    },
    {
      email: 'customer@gmail.com',
      username: 'customer',
      name: 'Customer User',
      password: '123123123',
      roles: ['customer'],
      permissions: [],
      permissions_deny: []
    }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        name: user.name,
        password: hashedPassword
      }
    });

    // Assign roles to the new user
    for (const roleName of user.roles) {
      const role = await prisma.role.findUnique({
        where: { name: roleName }
      });

      if (role) {
        await prisma.userRole.create({
          data: {
            userId: newUser.id,
            roleId: role.id
          }
        });

        // Assign all permissions for this role to the user
        const rolePermissions = await prisma.rolePermission.findMany({
          where: {
            roleId: role.id
          },
          include: {
            permission: true
          }
        });

        // Fetch denied permissions
        const deniedPermissions = await prisma.permission.findMany({
          where: {
            permissionCode: { in: user.permissions_deny }
          }
        });
        const deniedPermissionIds = deniedPermissions.map(
          (p: { id: any }) => p.id
        );

        // Filter out denied permissions
        const filteredRolePermissions = rolePermissions.filter(
          (rp: { permission: { id: any } }) =>
            !deniedPermissionIds.includes(rp.permission.id)
        );

        // Assign all non-denied role permissions to the user
        const rolePermissionsData = filteredRolePermissions.map(
          (rp: { permission: { id: any } }) => ({
            userId: newUser.id,
            permissionId: rp.permission.id
          })
        );

        await prisma.userPermission.createMany({
          data: rolePermissionsData,
          skipDuplicates: true
        });
      }
    }

    // Assign additional permissions specified in the user's permissions array
    const additionalPermissions = await prisma.permission.findMany({
      where: {
        permissionCode: { in: user.permissions }
      }
    });

    const additionalPermissionsData = additionalPermissions.map(
      (permission: { id: any }) => ({
        userId: newUser.id,
        permissionId: permission.id
      })
    );

    await prisma.userPermission.createMany({
      data: additionalPermissionsData,
      skipDuplicates: true
    });
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
