/**
 * Set required production env on Vercel (no DATABASE_URL — Neon integration handles that).
 */
import { randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const vars = {
  SESSION_SECRET: randomBytes(48).toString('base64url'),
  NEXT_PUBLIC_APP_URL: 'https://kasbyar.vercel.app',
  APP_ENV: 'production',
  ALLOW_SEED: 'false',
};

function addEnv(name, value) {
  const existing = spawnSync('npx', ['vercel', 'env', 'ls', 'production'], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (existing.stdout?.includes(name)) {
    console.log(`skip (exists): ${name}`);
    return;
  }
  const result = spawnSync('npx', ['vercel', 'env', 'add', name, 'production'], {
    cwd: root,
    input: value,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    console.error(`failed: ${name}`, result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  console.log(`set: ${name}`);
}

for (const [name, value] of Object.entries(vars)) {
  addEnv(name, value);
}

console.log('done — redeploy with: npx vercel --prod --yes');
