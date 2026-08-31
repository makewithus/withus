const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const secret = await prisma.secret.findUnique({
    where: { id: 'ab0163f2-55c6-4597-9025-fe23ef774984' }
  });
  console.log(JSON.stringify(secret, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
