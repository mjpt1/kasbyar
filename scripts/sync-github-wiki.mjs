import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const wikiSrc = path.join(root, 'wiki');
const wikiTmp = path.join(process.env.TEMP || '/tmp', 'kasbyar-wiki-sync2');

fs.rmSync(wikiTmp, { recursive: true, force: true });
execSync(`git clone --depth 1 https://github.com/mjpt1/kasbyar.wiki.git "${wikiTmp}"`, {
  stdio: 'inherit',
});

for (const f of fs.readdirSync(wikiSrc)) {
  if (!f.endsWith('.md')) continue;
  // README is repo-side index only; publishing it as a wiki page confuses navigation.
  if (f === 'README.md') continue;
  fs.copyFileSync(path.join(wikiSrc, f), path.join(wikiTmp, f));
}

const publishedReadme = path.join(wikiTmp, 'README.md');
if (fs.existsSync(publishedReadme)) {
  fs.unlinkSync(publishedReadme);
}

execSync('git add -A', { cwd: wikiTmp, stdio: 'inherit' });
const status = execSync('git status --porcelain', { cwd: wikiTmp, encoding: 'utf8' });
console.log('STATUS:\n' + status);
if (!status.trim()) {
  console.log('no changes');
  process.exit(0);
}

execSync(
  'git -c user.name=mjpt1 -c user.email=mjpt1@users.noreply.github.com commit -m "fix(wiki): open sidebar pages without .md links"',
  { cwd: wikiTmp, stdio: 'inherit' },
);
execSync('git push origin HEAD', { cwd: wikiTmp, stdio: 'inherit' });
console.log('pushed', execSync('git log -1 --oneline', { cwd: wikiTmp, encoding: 'utf8' }));
