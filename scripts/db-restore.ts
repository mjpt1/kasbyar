import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

import { getAppEnvironment, parseDatabaseUrl, requireRestoreAllowed } from './ops/destructive-guard';

requireRestoreAllowed();

const backupFile = process.argv[2];
if (!backupFile) {
  console.error('استفاده: npm run db:restore -- <path-to-backup.sql>');
  process.exit(1);
}

if (!fs.existsSync(backupFile)) {
  console.error(`❌ فایل یافت نشد: ${backupFile}`);
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL تنظیم نشده است');
  process.exit(1);
}

const env = getAppEnvironment();
console.log(`⚠️  بازگردانی دیتابیس در محیط ${env}`);
console.log(`   فایل: ${backupFile}`);
console.log('   این عملیات داده فعلی را بازنویسی می‌کند.');

const db = parseDatabaseUrl(databaseUrl);

const result = spawnSync(
  'psql',
  [
    '--host',
    db.host,
    '--port',
    db.port,
    '--username',
    db.user,
    '--dbname',
    db.database,
    '--file',
    backupFile,
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: db.password },
  },
);

if (result.status !== 0) {
  console.error('❌ psql restore ناموفق');
  process.exit(result.status ?? 1);
}

console.log('✅ بازگردانی انجام شد — سلامت اپ را بررسی کنید: npm run verify:health');
