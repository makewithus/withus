const { PrismaClient } = require('@prisma/client');

const p = new PrismaClient();

async function main() {
  const rows = await p.delegatedSession.groupBy({
    by: ['permission', 'scope', 'status'],
    _count: { id: true },
  });
  console.log('=== Existing DelegatedSession audit ===');
  console.log(JSON.stringify(rows, null, 2));
  const total = await p.delegatedSession.count();
  console.log('Total rows:', total);
}

main().finally(() => p.$disconnect());
