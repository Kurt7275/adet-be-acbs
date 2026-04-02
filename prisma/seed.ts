import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const student = await prisma.user.upsert({
    where: { email: 'student@liceo.edu.ph' },
    update: {},
    create: {
      email: 'student@liceo.edu.ph',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      role: 'STUDENT',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@liceo.edu.ph' },
    update: {},
    create: {
      email: 'teacher@liceo.edu.ph',
      firstName: 'Maria',
      lastName: 'Santos',
      role: 'TEACHER',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@liceo.edu.ph' },
    update: {},
    create: {
      email: 'admin@liceo.edu.ph',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Seeding completed!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });