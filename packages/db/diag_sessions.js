const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find ankit@gmail.com (the MEMBER)
  const user = await prisma.user.findFirst({ where: { email: { contains: 'ankit' } } });
  if (!user) { console.log('User not found'); return; }
  console.log('User:', user.id, user.email);

  const now = new Date();
  console.log('Current time (UTC):', now.toISOString());

  const sessions = await prisma.delegatedSession.findMany({
    where: { granteeId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  for (const s of sessions) {
    const isExpired = s.expiresAt < now;
    console.log('---');
    console.log('  id           :', s.id);
    console.log('  scope        :', s.scope);
    console.log('  permission   :', s.permission);
    console.log('  status       :', s.status);
    console.log('  provider     :', s.integrationProvider);
    console.log('  resourceId   :', s.resourceId);
    console.log('  expiresAt    :', s.expiresAt.toISOString(), isExpired ? '<<EXPIRED>>' : '<<ACTIVE>>');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
