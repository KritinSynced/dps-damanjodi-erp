const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      name: true,
      role: true,
      passwordHash: true
    }
  });

  console.log('Testing passwords for all users:');
  for (const user of users) {
    const emailPrefix = user.email.split('@')[0];
    const candidate1 = emailPrefix + '123';
    const candidate2 = 'admin123';
    const candidate3 = 'student123';
    const candidate4 = 'teacher123';
    const candidate5 = 'parent123';
    const candidate6 = 'principal123';
    const candidate7 = 'clerk123';
    const candidate8 = 'alumni123';

    let match = null;
    if (bcrypt.compareSync(candidate1, user.passwordHash)) match = candidate1;
    else if (bcrypt.compareSync(candidate2, user.passwordHash)) match = candidate2;
    else if (bcrypt.compareSync(candidate3, user.passwordHash)) match = candidate3;
    else if (bcrypt.compareSync(candidate4, user.passwordHash)) match = candidate4;
    else if (bcrypt.compareSync(candidate5, user.passwordHash)) match = candidate5;
    else if (bcrypt.compareSync(candidate6, user.passwordHash)) match = candidate6;
    else if (bcrypt.compareSync(candidate7, user.passwordHash)) match = candidate7;
    else if (bcrypt.compareSync(candidate8, user.passwordHash)) match = candidate8;
    else if (user.passwordHash === candidate1) match = candidate1 + ' (plaintext)';
    else if (user.passwordHash === candidate2) match = candidate2 + ' (plaintext)';

    console.log(`User: ${user.name} (${user.email}), Role: ${user.role}, Matched Password: ${match || 'UNKNOWN'}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
