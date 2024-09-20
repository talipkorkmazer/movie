import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PREDEFINED_ROLES } from './roles';
const prisma = new PrismaClient();

export const seedUsers = async () => {
  // Fetch roles to assign to users
  const managerRole = await prisma.role.findUnique({
    where: { name: PREDEFINED_ROLES.MANAGER },
  });
  const customerRole = await prisma.role.findUnique({
    where: { name: PREDEFINED_ROLES.CUSTOMER },
  });

  if (managerRole && customerRole) {
    // Hash the passwords
    const adminPassword = await bcrypt.hash('securepassword', 10); // Admin password
    const userPassword = await bcrypt.hash('userpassword', 10); // User password

    // Create users
    await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        password: adminPassword, // Store hashed password
        age: 30,
        roleId: managerRole.id,
      },
    });

    await prisma.user.upsert({
      where: { username: 'user' },
      update: {},
      create: {
        username: 'user',
        password: userPassword, // Store hashed password
        age: 25,
        roleId: customerRole.id,
      },
    });

    console.log('Users seeded with hashed passwords');
  }
};
