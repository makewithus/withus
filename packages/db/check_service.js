const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.delegatedSession.findMany({
    where: { granteeId: '2145ced6-08f4-4866-a3cb-fb6ae2270aba' },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const secretIds = sessions.filter(s => s.scope === 'SECRET').map(s => s.resourceId);
  const secrets = await prisma.secret.findMany({ where: { id: { in: secretIds } }, select: { id: true, name: true } });
  
  const secretMap = new Map(secrets.map(s => [s.id, s.name]));

  const enriched = sessions.map(s => ({
    ...s,
    resourceName: s.scope === 'SECRET' ? (secretMap.get(s.resourceId) ?? null) : null
  }));

  console.log('Enriched:', JSON.stringify(enriched, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
