import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const wikiTmp = path.join(process.env.TEMP || '/tmp', 'kasbyar-wiki-rm-readme');
fs.rmSync(wikiTmp, { recursive: true, force: true });
execSync(`git clone --depth 1 https://github.com/mjpt1/kasbyar.wiki.git "${wikiTmp}"`, {
  stdio: 'inherit',
});

const readme = path.join(wikiTmp, 'README.md');
console.log('readme exists', fs.existsSync(readme));
if (fs.existsSync(readme)) fs.unlinkSync(readme);

execSync('git add -A', { cwd: wikiTmp, stdio: 'inherit' });
const st = execSync('git status --porcelain', { cwd: wikiTmp, encoding: 'utf8' });
console.log(st || '(clean)');
if (!st.trim()) process.exit(0);

execSync(
  'git -c user.name=mjpt1 -c user.email=mjpt1@users.noreply.github.com commit -m "fix(wiki): remove README page from published wiki nav"',
  { cwd: wikiTmp, stdio: 'inherit' },
);
execSync('git push origin HEAD', { cwd: wikiTmp, stdio: 'inherit' });
console.log(execSync('git log -1 --oneline', { cwd: wikiTmp, encoding: 'utf8' }));
