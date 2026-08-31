// Simulates exactly what the API getIncomingSessions returns for this user+org
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const MCA_TOP_LEVEL_MODULES = [
  'mca.master_data','mca.llp_efiling','mca.fo_services','mca.dsc_services',
  'mca.company_efiling','mca.complaints','mca.document_related_services',
  'mca.payment_services','mca.id_databank',
];

async function main() {
  const userId = '2145ced6-08f4-4866-a3cb-fb6ae2270aba';
  const orgId  = 'a67d5cd8-9e4b-4fc1-a483-08e9e28e115d';

  const sessions = await prisma.delegatedSession.findMany({
    where: { granteeId: userId, organizationId: orgId },
    orderBy: { createdAt: 'desc' },
    include: { grantor: { select: { email: true, fullName: true } } },
  });

  console.log('Total sessions from DB:', sessions.length);

  // Simulate enrichSessionsWithResourceNames
  const secretIds = sessions.filter(s => s.scope === 'SECRET').map(s => s.resourceId);
  const secrets = secretIds.length > 0
    ? await prisma.secret.findMany({ where: { id: { in: secretIds } }, select: { id: true, name: true } })
    : [];
  const secretMap = new Map(secrets.map(s => [s.id, s.name]));

  const enriched = sessions.map(s => ({
    ...s,
    resourceName: s.scope === 'SECRET'
      ? (secretMap.get(s.resourceId) ?? null)
      : s.scope === 'VAULT' ? null
      : s.scope === 'INTEGRATION' ? (s.integrationProvider ?? null)
      : null,
  }));

  // Then MCA transform
  const result = enriched.map(session => {
    if (session.integrationProvider === 'MCA') {
      let mcaRestrictedModules = [];
      if (session.capabilities !== null) {
        const allowed = session.capabilities || [];
        mcaRestrictedModules = MCA_TOP_LEVEL_MODULES.filter(mod => !allowed.includes(mod));
      }
      return { ...session, mcaRestrictedModules };
    }
    return session;
  });

  // Extension filter (from service-worker.ts)
  const hostname = 'vercel.com';
  const cleanHostname = hostname.replace(/^www\./, '');
  const GENERIC = new Set(['gov', 'com', 'net', 'org', 'in', 'co', 'www', 'app', 'api']);
  const parts = cleanHostname.split('.').filter(p => p.length >= 3 && !GENERIC.has(p));

  console.log('\n=== API result (getIncomingSessions) ===');
  const matching = result.filter(s => {
    const statusOk = s.status === 'ACTIVE';
    const notExpired = !s.expiresAt || new Date(s.expiresAt) >= new Date();
    const name = (s.resourceName || '').toLowerCase();
    const hasName = !!name;
    const domainMatch = hasName && parts.some(part => name.includes(part) || part.includes(name));

    console.log(`[${s.id.slice(0,8)}] status=${s.status} permission=${s.permission} resourceName=${s.resourceName} statusOk=${statusOk} notExpired=${notExpired} hasName=${hasName} domainMatch=${domainMatch}`);
    return statusOk && notExpired && domainMatch;
  });

  console.log('\n=== Sessions that WOULD be shown in extension ===');
  console.log('Count:', matching.length);
  matching.forEach(s => console.log('  -', s.id, s.permission, s.resourceName, s.status));
}

main().catch(console.error).finally(() => prisma.$disconnect());
