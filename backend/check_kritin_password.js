const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'kritin006@gmail.com' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const candidates = ['kritin006123', 'admin123', 'password', 'password123', 'dps123', 'dpsdamanjodi'];
  for (const cand of candidates) {
    if (bcrypt.compareSync(cand, user.passwordHash)) {
      console.log('FOUND PASSWORD:', cand);
      return;
    }
  }
  console.log('Password not found in candidates list');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
