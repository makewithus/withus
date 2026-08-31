const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'ankit@gmail.com' }
  });
  console.log('User ID:', user?.id);

  const sessions = await prisma.delegatedSession.findMany({
    where: { granteeId: user?.id },
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Sessions:', JSON.stringify(sessions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
