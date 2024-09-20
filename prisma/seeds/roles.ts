import { PrismaClient } from '@prisma/client';
import { permissions } from './permissions';

const prisma = new PrismaClient();

export const PREDEFINED_ROLES = {
  MANAGER: 'Manager',
  CUSTOMER: 'Customer',
};

export const seedRoles = async () => {
  // Create roles
  const managerRole = await prisma.role.upsert({
    where: { name: PREDEFINED_ROLES.MANAGER },
    update: {},
    create: {
      name: PREDEFINED_ROLES.MANAGER,
    },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: PREDEFINED_ROLES.CUSTOMER },
    update: {},
    create: {
      name: PREDEFINED_ROLES.CUSTOMER,
    },
  });

  // Filter permissions for manager and customer roles
  const filteredManagerPermissions = permissions
    .filter(permission => permission.roles.includes(PREDEFINED_ROLES.MANAGER))
    .map(permission => permission.name);

  const filteredCustomerPermissions = permissions
    .filter(permission => permission.roles.includes(PREDEFINED_ROLES.CUSTOMER))
    .map(permission => permission.name);

  // Fetch permissions to assign to roles
  const managerPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: filteredManagerPermissions,
      },
    },
    select: {
      id: true,
    },
  });

  const customerPermissions = await prisma.permission.findMany({
    where: {
      name: {
        in: filteredCustomerPermissions,
      },
    },
    select: {
      id: true,
    },
  });

  // Assign permissions to roles
  for (const managerPermission of managerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: managerPermission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: managerPermission.id,
      },
    });
  }

  for (const customerPermission of customerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: customerRole.id,
          permissionId: customerPermission.id,
        },
      },
      update: {},
      create: {
        roleId: customerRole.id,
        permissionId: customerPermission.id,
      },
    });

    console.log('Roles and RolePermissions seeded');
  }
};
