/**
 * Clean git commit without extra trailers — run from terminal if IDE injects metadata.
 * Usage: node scripts/git-commit-clean.mjs [message-file]
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const msgFile =
  process.argv[2] ?? path.join(root, '.git', 'COMMIT_EDITMSG_MANUAL');

if (!fs.existsSync(msgFile)) {
  console.error('پیام کامیت یافت نشد:', msgFile);
  process.exit(1);
}

const env = {
  ...process.env,
  GIT_AUTHOR_NAME: process.env.GIT_AUTHOR_NAME ?? 'mjpt1',
  GIT_AUTHOR_EMAIL: process.env.GIT_AUTHOR_EMAIL ?? '5987282+mjpt1@users.noreply.github.com',
  GIT_COMMITTER_NAME: process.env.GIT_COMMITTER_NAME ?? 'mjpt1',
  GIT_COMMITTER_EMAIL:
    process.env.GIT_COMMITTER_EMAIL ?? '5987282+mjpt1@users.noreply.github.com',
};

const add = spawnSync('git', ['add', '-A'], { cwd: root, env, stdio: 'inherit', shell: false });
if (add.status !== 0) process.exit(add.status ?? 1);

const commit = spawnSync('git', ['commit', '-F', msgFile], {
  cwd: root,
  env,
  stdio: 'inherit',
  shell: false,
});

process.exit(commit.status ?? 0);
