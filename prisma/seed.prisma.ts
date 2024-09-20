import { seedPermissions } from './seeds/permissions';
import { seedRoles } from './seeds/roles';
import { seedUsers } from './seeds/users';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await seedPermissions();
  await seedRoles();
  await seedUsers();
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
