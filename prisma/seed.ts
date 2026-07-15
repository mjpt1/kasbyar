import { PrismaClient } from '@prisma/client';

import { requireDestructiveDbAllowed } from '../scripts/ops/destructive-guard';
import { runSeed } from './seed/index';

async function main() {
  requireDestructiveDbAllowed('db:seed');

  const prisma = new PrismaClient();
  try {
    await runSeed(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
