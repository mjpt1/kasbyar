import { spawnSync } from 'node:child_process';

import { getAppEnvironment, isProductionEnvironment } from './ops/destructive-guard';

const env = getAppEnvironment();

if (isProductionEnvironment() && process.env.CONFIRM_MIGRATE_DEPLOY !== 'true') {
  console.error('❌ migrate deploy در production نیاز به CONFIRM_MIGRATE_DEPLOY=true دارد');
  console.error('   قبل از اجرا: backup بگیرید (npm run db:backup)');
  process.exit(1);
}

console.log(`🔄 prisma migrate deploy — محیط: ${env}`);
if (isProductionEnvironment()) {
  console.log('   production: اطمینان از backup و staging-first انجام شده باشد');
}

const result = spawnSync(
  'npx',
  ['prisma', 'migrate', 'deploy', '--schema=./prisma/schema.prisma'],
  { stdio: 'inherit', shell: true },
);

process.exit(result.status ?? 1);
