const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessionId = '6d4578a5-5371-4809-b4a5-0b6e8edcf216';
  const secretId  = 'ab0163f2-55c6-4597-9025-fe23ef774984';

  const secret = await prisma.secret.findUnique({
    where: { id: secretId },
    select: { id: true, name: true, description: true }
  });
  console.log('Secret:', JSON.stringify(secret));

  // Simulate enrichSessionsWithResourceNames for scope=SECRET
  const resourceName = secret?.name ?? null;
  console.log('resourceName that API returns:', resourceName);

  // Simulate extension filter
  const hostname = 'vercel.com'; // the page domain
  const cleanHostname = hostname.replace(/^www\./, '');
  const GENERIC = new Set(['gov', 'com', 'net', 'org', 'in', 'co', 'www', 'app', 'api']);
  const parts = cleanHostname.split('.').filter(p => p.length >= 3 && !GENERIC.has(p));
  const name = (resourceName || '').toLowerCase();

  console.log('hostname parts after filter:', parts);
  console.log('name (lowercase):', name);
  const matched = parts.some(part => name.includes(part) || part.includes(name));
  console.log('Domain match result:', matched, '← This must be TRUE for extension to show the session');
}

main().catch(console.error).finally(() => prisma.$disconnect());
