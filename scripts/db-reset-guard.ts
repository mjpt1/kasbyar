import { spawnSync } from 'node:child_process';

import { requireDestructiveDbAllowed } from './ops/destructive-guard';

requireDestructiveDbAllowed('db:reset');

const result = spawnSync(
  'npx',
  ['prisma', 'migrate', 'reset', '--schema=./prisma/schema.prisma', '--force'],
  { stdio: 'inherit', shell: true },
);

process.exit(result.status ?? 1);
