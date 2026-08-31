const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.delegatedSession.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log(JSON.stringify(sessions, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
