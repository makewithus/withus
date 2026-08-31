import { PrismaClient } from './node_modules/@prisma/client/index.js';

const p = new PrismaClient();

async function main() {
  const rows = await p.delegatedSession.groupBy({
    by: ['permission', 'scope', 'status'],
    _count: { id: true },
    orderBy: [{ permission: 'asc' }, { scope: 'asc' }, { status: 'asc' }],
  });
  console.log('\n=== Existing DelegatedSession data audit ===');
  console.log(JSON.stringify(rows, null, 2));

  // Also check total count
  const total = await p.delegatedSession.count();
  console.log(`\nTotal DelegatedSession rows: ${total}`);

  // Check if any non-REVEAL permission exists (should be 0)
  const nonReveal = await p.delegatedSession.count({
    where: { permission: { not: 'REVEAL' } },
  });
  console.log(`Rows with permission != REVEAL: ${nonReveal}`);
}

main().finally(() => p.$disconnect());
