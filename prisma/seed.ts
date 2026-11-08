import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  const school = await db.school.upsert({
    where: { id: 'seed-school-1' },
    update: {},
    create: {
      id: 'seed-school-1',
      name: 'Sample Secondary School, Lagos',
      address: '1 Education Way, Lagos',
      phone: '+234-800-000-0000',
      email: 'admin@sample.school.ng',
    },
  });

  await db.gradingScale.createMany({
    data: [
      { schoolId: school.id, minScore: 70, maxScore: 100, grade: 'A' },
      { schoolId: school.id, minScore: 60, maxScore: 69, grade: 'B' },
      { schoolId: school.id, minScore: 50, maxScore: 59, grade: 'C' },
      { schoolId: school.id, minScore: 45, maxScore: 49, grade: 'D' },
      { schoolId: school.id, minScore: 40, maxScore: 44, grade: 'E' },
      { schoolId: school.id, minScore: 0, maxScore: 39, grade: 'F' },
    ],
    skipDuplicates: true,
  });

  const session = await db.academicSession.upsert({
    where: { schoolId_name: { schoolId: school.id, name: '2024/2025' } },
    update: { isCurrent: true },
    create: { schoolId: school.id, name: '2024/2025', isCurrent: true },
  });

  await db.term.upsert({
    where: { sessionId_name: { sessionId: session.id, name: 'First Term' } },
    update: { isCurrent: true },
    create: { sessionId: session.id, name: 'First Term', isCurrent: true },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error('SEED_ADMIN_PASSWORD env var required');
  }

  // CHANGED: Update the password if the user already exists
  await db.user.upsert({
    where: { email: process.env.SEED_ADMIN_EMAIL ?? 'admin@yourschool.ng' },
    update: {
      passwordHash: await hash(adminPassword, 12),
    },
    create: {
      email: process.env.SEED_ADMIN_EMAIL ?? 'admin@yourschool.ng',
      name: 'School Administrator',
      passwordHash: await hash(adminPassword, 12),
      role: 'ADMIN',
      schoolId: school.id,
    },
  });

  // --- ADD DEFAULT CLASSES ---
  const defaultClasses = [
    { name: 'Primary 1', level: 'Primary' },
    { name: 'Primary 2', level: 'Primary' },
    { name: 'Primary 3', level: 'Primary' },
    { name: 'Primary 4', level: 'Primary' },
    { name: 'Primary 5', level: 'Primary' },
    { name: 'JSS 1', level: 'Junior Secondary' },
    { name: 'JSS 2', level: 'Junior Secondary' },
    { name: 'JSS 3', level: 'Junior Secondary' },
  ];
  
  for (const cls of defaultClasses) {
    await db.class.upsert({
      where: { schoolId_name: { schoolId: school.id, name: cls.name } },
      update: {},
      create: {
        schoolId: school.id,
        name: cls.name,
        level: cls.level,
      },
    });
  }

  console.log('Seed complete. Admin user and default classes created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });