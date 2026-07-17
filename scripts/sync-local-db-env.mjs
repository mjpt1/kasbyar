/**
 * Sync DATABASE_URL from root .env.local (Neon) into app env files for local dev.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rootLocal = path.join(root, '.env.local');
const webLocal = path.join(root, 'apps', 'web', '.env.local');
const rootEnv = path.join(root, '.env');

function readDatabaseUrl(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^DATABASE_URL=(.+)$/m);
  if (!match) return null;
  return match[1].trim();
}

function upsertDatabaseUrl(filePath, databaseUrl) {
  let content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
  const line = `DATABASE_URL=${databaseUrl}`;
  if (/^DATABASE_URL=.+$/m.test(content)) {
    content = content.replace(/^DATABASE_URL=.+$/m, line);
  } else {
    content = `${line}\n${content}`;
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

const neonUrl = readDatabaseUrl(rootLocal);
if (!neonUrl || neonUrl.includes('localhost')) {
  console.error('DATABASE_URL معتبر در .env.local یافت نشد (Neon).');
  process.exit(1);
}

for (const target of [rootEnv, webLocal]) {
  upsertDatabaseUrl(target, neonUrl);
  console.log(`updated: ${path.relative(root, target)}`);
}
