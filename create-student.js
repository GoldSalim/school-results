const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcryptjs');

const db = new PrismaClient();

async function main() {
  const schoolId = 'seed-school-1';
  const email = 'student2@test.com'; // Changed the email here
  const password = 'password123';

  // 1. Find an existing Student record that doesn't have a user account yet
  const student = await db.student.findFirst({
    where: { userId: null, schoolId }
  });

  if (!student) {
    console.log("ERROR: No unlinked student found.");
    console.log("Please go to your Admin panel and add a new student first, then run this script again.");
    return;
  }

  // 2. Create the User account
  const user = await db.user.create({
    data: {
      email,
      name: student.fullName, // Using the real student name from the DB
      passwordHash: await hash(password, 12),
      role: 'STUDENT',
      schoolId,
    }
  });

  // 3. Link the User to the Student record
  await db.student.update({
    where: { id: student.id },
    data: { userId: user.id, isVerified: true }
  });

  console.log(`Success! Student account created for ${student.fullName}.`);
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
}

main().finally(() => db.$disconnect());