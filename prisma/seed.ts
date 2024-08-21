const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
import { createId } from '@paralleldrive/cuid2';

prisma.$use(
  async (
    params: { action: string; model: string; args: { data: { id: string } } },
    next: (arg0: any) => any
  ) => {
    if (params.action === 'create' && params.model === 'User') {
      params.args.data.id ??= createId();
    }
    return next(params);
  }
);
async function main() {
  // Seed roles
  const roles = [
    {
      role_code: 'admin',
      role_name: 'Administrator',
      status: 'active',
      created_by: 'seed'
    },
    {
      role_code: 'employee',
      role_name: 'Employee',
      status: 'active',
      created_by: 'seed'
    },
    {
      role_code: 'customer',
      role_name: 'Customer',
      status: 'active',
      created_by: 'seed'
    }
  ];

  // Seed permissions
  const permissions = [
    {
      permission_code: 'admin',
      permission_name: 'Administrator Access',
      created_by: 'seed'
    },
    {
      permission_code: 'employee_create',
      permission_name: 'Create Employee Records',
      created_by: 'seed'
    },
    {
      permission_code: 'employee_read',
      permission_name: 'Read Employee Records',
      created_by: 'seed'
    },
    {
      permission_code: 'employee_update',
      permission_name: 'Update Employee Records',
      created_by: 'seed'
    },
    {
      permission_code: 'employee_delete',
      permission_name: 'Delete Employee Records',
      created_by: 'seed'
    },
    {
      permission_code: 'customer_create',
      permission_name: 'Create Customer Records',
      created_by: 'seed'
    },
    {
      permission_code: 'customer_read',
      permission_name: 'Read Customer Records',
      created_by: 'seed'
    },
    {
      permission_code: 'customer_update',
      permission_name: 'Update Customer Records',
      created_by: 'seed'
    },
    {
      permission_code: 'customer_delete',
      permission_name: 'Delete Customer Records',
      created_by: 'seed'
    }
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
      roleCode: 'admin',
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
      roleCode: 'employee',
      permissions: [
        'employee_create',
        'employee_read',
        'employee_update',
        'employee_delete'
      ]
    },
    {
      roleCode: 'customer',
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
        role_code: { in: rolePermissions.map((rp) => rp.roleCode) }
      }
    }),
    prisma.permission.findMany({
      where: {
        permission_code: { in: rolePermissions.flatMap((rp) => rp.permissions) }
      }
    })
  ]);

  // Map roles and permissions for easier access
  const roleMap = new Map(
    rolesData.map((role: { role_code: any; id: any }) => [
      role.role_code,
      role.id
    ])
  );
  const permissionMap = new Map(
    permissionsData.map((permission: { permission_code: any; id: any }) => [
      permission.permission_code,
      permission.id
    ])
  );

  // Prepare role permissions data
  const rolePermissionsData = rolePermissions.flatMap((rolePerm) => {
    const roleId = roleMap.get(rolePerm.roleCode);
    if (!roleId) return [];

    return rolePerm.permissions
      .map((permissionCode) => {
        const permissionId = permissionMap.get(permissionCode);
        if (!permissionId) return null;

        return {
          role_code: rolePerm.roleCode,
          permission_code: permissionCode,
          created_by: 'seed'
        };
      })
      .filter(Boolean);
  });

  // Create role permissions in batch
  await prisma.roleHasPermission.createMany({
    data: rolePermissionsData,
    skipDuplicates: true
  });
  //Define seeded method login
  const methodLogins = [
    {
      id: 1,
      method_login_name: 'Local',
      method_type: 'Credentials',
      configuration: JSON.stringify({ encryption: 'bcrypt' })
    },
    {
      id: 2,
      method_login_name: 'LDAP',
      method_type: 'LDAP',
      configuration: JSON.stringify({
        ldapUri: 'ldap://192.168.1.15',
        baseDn: 'ou=people,dc=katalyst,dc=local'
      })
    },
    {
      id: 3,
      method_login_name: 'Google',
      method_type: 'OAuth',
      configuration: JSON.stringify({
        clientId: 'your-google-client-id',
        clientSecret: 'your-google-client-secret'
      })
    }
  ];

  for (const methodLogin of methodLogins) {
    await prisma.methodLogin.upsert({
      where: { id: methodLogin.id },
      update: {},
      create: {
        id: methodLogin.id,
        method_login_name: methodLogin.method_login_name,
        method_type: methodLogin.method_type,
        configuration: methodLogin.configuration,
        created_by: 'seed'
      }
    });
  }

  // Define users to be seeded
  const branches = [
    {
      branch_code: '001',
      branch_name: 'Main Branch',
      description: 'Main office branch',
      status: 'active',
      created_by: 'admin'
    }
    // Add more branches as needed
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { branch_code: branch.branch_code },
      update: {},
      create: branch
    });
  }

  // Seed Departments
  const departments = [
    {
      id: 1,
      department_name: 'Admin',
      description: 'Admin Seed',
      status: 'active',
      created_by: 'admin'
    }
    // Add more departments as needed
  ];

  for (const department of departments) {
    await prisma.departments.upsert({
      where: { id: department.id },
      update: {},
      create: department
    });
  }
  const users = [
    {
      email: 'admin@gmail.com',
      username: 'admin',
      name: 'Admin User',
      password: '123123123',
      roles: ['admin'],
      permissions: [],
      permissions_deny: [],
      method_login_id: 1,
      branch_code: '001', // Example value, adjust as needed
      department_id: 1, // Example value, adjust as needed
      created_by: 'admin'
    },
    {
      email: 'employee@gmail.com',
      username: 'employee',
      name: 'Employee User',
      password: '123123123',
      roles: ['employee'],
      permissions: ['customer_read'],
      permissions_deny: ['employee_delete'],
      method_login_id: 1,
      branch_code: '001', // Example value, adjust as needed
      department_id: 1, // Example value, adjust as needed
      created_by: 'admin'
    },
    {
      email: 'customer@gmail.com',
      username: 'customer',
      name: 'Customer User',
      password: '123123123',
      roles: ['customer'],
      permissions: [],
      permissions_deny: [],
      method_login_id: 1,
      branch_code: '001', // Example value, adjust as needed
      department_id: 1, // Example value, adjust as needed
      created_by: 'admin'
    },
    {
      email: 'namnguyen137@gmail.com',
      username: 'nnguyen',
      name: 'Phương Nam',
      password: '123123123',
      roles: ['admin'],
      permissions: [],
      permissions_deny: [],
      method_login_id: 2,
      branch_code: '001', // Example value, adjust as needed
      department_id: 1, // Example value, adjust as needed
      created_by: 'admin'
    }
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: user.email,
        username: user.username,
        employment_name: user.name,
        password: hashedPassword,
        method_login_id: user.method_login_id,
        branch_code: user.branch_code,
        department_id: user.department_id,
        status: 'active',
        created_by: user.created_by
      }
    });

    // Assign roles to the new user

    for (const roleName of user.roles) {
      const role = await prisma.role.findUnique({
        where: { role_code: roleName }
      });

      if (role) {
        // Assign all permissions for this role to the user
        const rolePermissions = await prisma.roleHasPermission.findMany({
          where: {
            role_code: role.role_code
          },
          include: {
            permission: true
          }
        });

        // Fetch denied permissions
        const deniedPermissions = await prisma.permission.findMany({
          where: {
            permission_code: { in: user.permissions_deny }
          }
        });
        const deniedPermissionCodes = deniedPermissions.map(
          (p: { permission_code: any }) => p.permission_code
        );

        // Filter out denied permissions
        const filteredRolePermissions = rolePermissions.filter(
          (rp: { permission: { permission_code: any } }) =>
            !deniedPermissionCodes.includes(rp.permission.permission_code)
        );

        // Assign all non-denied role permissions to the user
        const rolePermissionsData = filteredRolePermissions.map(
          (rp: { permission: { permission_code: any } }) => ({
            user_id: newUser.id,
            permission_code: rp.permission.permission_code,
            created_by: 'seed'
          })
        );

        await prisma.userHasPermission.createMany({
          data: rolePermissionsData,
          skipDuplicates: true
        });
      }
    }

    // Assign additional permissions specified in the user's permissions array
    const additionalPermissions = await prisma.permission.findMany({
      where: {
        permission_code: { in: user.permissions }
      }
    });

    const additionalPermissionsData = additionalPermissions.map(
      (permission: { permission_code: any }) => ({
        user_id: newUser.id,
        permission_code: permission.permission_code,
        created_by: 'seed'
      })
    );

    await prisma.userHasPermission.createMany({
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
