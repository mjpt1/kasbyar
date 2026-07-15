import { spawnSync } from 'node:child_process';

import { requireDestructiveDbAllowed } from './ops/destructive-guard';

requireDestructiveDbAllowed('db:reseed');

console.log('⚠️  db:reseed — push اسکیما + seed مجدد. در staging/production ابتدا backup بگیرید.');
console.log('   راهنما: npm run db:backup');

const push = spawnSync('npx', ['prisma', 'db', 'push', '--schema=./prisma/schema.prisma'], {
  stdio: 'inherit',
  shell: true,
});

if (push.status !== 0) {
  process.exit(push.status ?? 1);
}

const seed = spawnSync('npx', ['tsx', 'prisma/seed.ts'], {
  stdio: 'inherit',
  shell: true,
  env: process.env,
});

process.exit(seed.status ?? 1);
