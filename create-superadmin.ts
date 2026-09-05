/**
 * create-superadmin.ts
 *
 * One-time setup script to create the WITHUS Platform Super Admin account.
 * Run once against your Neon DB: npx tsx create-superadmin.ts
 *
 * Security notes:
 *  - Password is bcrypt-hashed before storage (never stored in plaintext)
 *  - isSuperAdmin is set at platform level (NOT an org role)
 *  - No organization is created for this account (platform admin, not org user)
 */

import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const SUPERADMIN_EMAIL = 'admin@makewithus.in';
const SUPERADMIN_PASSWORD = 'Withus@2026';
const SUPERADMIN_FULLNAME = 'WITHUS Platform Admin';

async function main() {
  console.log('=== WITHUS Super Admin Setup ===\n');

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email: SUPERADMIN_EMAIL },
  });

  if (existing) {
    if (existing.isSuperAdmin) {
      console.log(`✅ Super Admin already exists: ${SUPERADMIN_EMAIL}`);
      console.log('   isSuperAdmin = true ✓');
      return;
    }

    // User exists but isSuperAdmin is false — promote them
    await prisma.user.update({
      where: { id: existing.id },
      data: { isSuperAdmin: true },
    });
    console.log(`✅ Existing user promoted to Super Admin: ${SUPERADMIN_EMAIL}`);
    return;
  }

  // Create new Super Admin user
  const passwordHash = await argon2.hash(SUPERADMIN_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  const user = await prisma.user.create({
    data: {
      email: SUPERADMIN_EMAIL,
      fullName: SUPERADMIN_FULLNAME,
      passwordHash,
      isActive: true,
      isSuperAdmin: true,
      // No organization membership — platform admin only
    },
  });

  console.log(`✅ Super Admin account created:`);
  console.log(`   Email:        ${user.email}`);
  console.log(`   Full Name:    ${user.fullName}`);
  console.log(`   isSuperAdmin: ${user.isSuperAdmin}`);
  console.log(`   User ID:      ${user.id}`);
  console.log(`\n⚠  Keep these credentials secure.`);
}

main()
  .catch((e) => {
    console.error('❌ Setup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
