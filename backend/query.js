const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ['ADMIN', 'PRINCIPAL', 'TEACHER', 'CLERK', 'ALUMNI']
      }
    },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      passwordHash: true,
      isFirstLogin: true,
      clerkUserId: true
    }
  });
  console.log('Seeded Staff/Admin/Alumni/Clerk Users:');
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
