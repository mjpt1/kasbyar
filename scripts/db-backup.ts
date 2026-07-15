import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { getAppEnvironment, parseDatabaseUrl } from './ops/destructive-guard';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL تنظیم نشده است');
  process.exit(1);
}

const outDir = process.env.BACKUP_DIR ?? path.join(process.cwd(), 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const env = getAppEnvironment();
const fileName = `kesbyar-${env}-${timestamp}.sql`;
const outPath = path.join(outDir, fileName);

fs.mkdirSync(outDir, { recursive: true });

const db = parseDatabaseUrl(databaseUrl);

console.log(`📦 پشتیبان‌گیری PostgreSQL → ${outPath}`);

const result = spawnSync(
  'pg_dump',
  [
    '--host',
    db.host,
    '--port',
    db.port,
    '--username',
    db.user,
    '--format=plain',
    '--no-owner',
    '--no-acl',
    '--file',
    outPath,
    db.database,
  ],
  {
    stdio: 'inherit',
    env: { ...process.env, PGPASSWORD: db.password },
  },
);

if (result.status !== 0) {
  console.error('❌ pg_dump ناموفق — pg_dump نصب است؟ (یا از Docker: docker exec kesbyar-postgres pg_dump ...)');
  process.exit(result.status ?? 1);
}

const metaPath = `${outPath}.meta.json`;
fs.writeFileSync(
  metaPath,
  JSON.stringify(
    {
      createdAt: new Date().toISOString(),
      environment: env,
      database: db.database,
      host: db.host,
      file: fileName,
    },
    null,
    2,
  ),
);

console.log(`✅ پشتیبان ذخیره شد: ${outPath}`);
console.log(`   متادیتا: ${metaPath}`);
