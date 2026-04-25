const { spawnSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const trackCount = await prisma.track.count();

  if (trackCount > 0) {
    console.log(`[seed-if-empty] Found ${trackCount} tracks. Skipping seed.`);
    return;
  }

  console.log('[seed-if-empty] No tracks found. Running prisma db seed...');

  const result = spawnSync('npx', ['prisma', 'db', 'seed'], {
    stdio: 'inherit',
    env: process.env,
  });

  if (result.status !== 0) {
    throw new Error(`prisma db seed failed with exit code ${String(result.status)}`);
  }

  console.log('[seed-if-empty] Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('[seed-if-empty] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
