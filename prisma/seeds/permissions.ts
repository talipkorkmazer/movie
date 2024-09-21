import { PrismaClient } from '@prisma/client';
import { PREDEFINED_ROLES } from './roles';

const prisma = new PrismaClient();

export const permissions = [
  // Role Permissions
  {
    name: 'view:roles',
    description: 'View all roles',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'view:role',
    description: 'View a role',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'create:role',
    description: 'Create a role',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'update:role',
    description: 'Update a role',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'delete:role',
    description: 'Delete a role',
    roles: [PREDEFINED_ROLES.MANAGER],
  },

  // Permission Permissions
  {
    name: 'view:permissions',
    description: 'View all permissions',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'view:permission',
    description: 'View a permission',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'create:permission',
    description: 'Create a permission',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'update:permission',
    description: 'Update a permission',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'delete:permission',
    description: 'Delete a permission',
    roles: [PREDEFINED_ROLES.MANAGER],
  },

  // User Permissions
  {
    name: 'view:users',
    description: 'View all users',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'view:user',
    description: 'View a user',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'create:user',
    description: 'Create a user',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'update:user',
    description: 'Update a user',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'delete:user',
    description: 'Delete a user',
    roles: [PREDEFINED_ROLES.MANAGER],
  },

  // Movie Permissions
  {
    name: 'view:movies',
    description: 'View all movies',
    roles: [PREDEFINED_ROLES.MANAGER, PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'view:movie',
    description: 'View a movie',
    roles: [PREDEFINED_ROLES.MANAGER, PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'create:movie',
    description: 'Create a movie',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'update:movie',
    description: 'Update a movie',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'delete:movie',
    description: 'Delete a movie',
    roles: [PREDEFINED_ROLES.MANAGER],
  },

  // Session Permissions
  {
    name: 'view:sessions',
    description: 'View all sessions',
    roles: [PREDEFINED_ROLES.MANAGER, PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'view:session',
    description: 'View a session',
    roles: [PREDEFINED_ROLES.MANAGER, PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'create:session',
    description: 'Create a session',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'update:session',
    description: 'Update a session',
    roles: [PREDEFINED_ROLES.MANAGER],
  },
  {
    name: 'delete:session',
    description: 'Delete a session',
    roles: [PREDEFINED_ROLES.MANAGER],
  },

  // Ticket Permissions
  {
    name: 'view:tickets',
    description: 'View all tickets',
    roles: [PREDEFINED_ROLES.MANAGER, PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'view:ticket',
    description: 'View a ticket',
    roles: [PREDEFINED_ROLES.MANAGER, PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'create:ticket',
    description: 'Create a ticket',
    roles: [PREDEFINED_ROLES.CUSTOMER],
  },

  // Watch History Permissions
  {
    name: 'view:watch-history',
    description: 'View all watch history',
    roles: [PREDEFINED_ROLES.CUSTOMER],
  },
  {
    name: 'view:watch-history-entry',
    description: 'View a specific watch history entry',
    roles: [PREDEFINED_ROLES.CUSTOMER],
  },
];

export const seedPermissions = async () => {
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: {},
      create: {
        name: permission.name,
        description: permission.description,
      },
    });
  }
  console.log('Permissions seeded');
};
