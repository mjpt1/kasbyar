import fs from 'fs';
import path from 'path';

const wikiDir = path.join(process.cwd(), 'wiki');
const files = fs.readdirSync(wikiDir).filter((f) => f.endsWith('.md'));
let changed = 0;

for (const file of files) {
  const p = path.join(wikiDir, file);
  let text = fs.readFileSync(p, 'utf8');
  const before = text;
  // [label](./Page.md) or [label](Page.md) -> [label](Page)
  // Keep http(s), mailto, absolute paths, and anchors alone.
  text = text.replace(/\]\(\.\/([^)#]+)\.md\)/g, ']($1)');
  text = text.replace(/\]\((?!https?:|mailto:|#|\/)([^)#]+)\.md\)/g, ']($1)');
  if (text !== before) {
    fs.writeFileSync(p, text, 'utf8');
    changed += 1;
    console.log('fixed', file);
  }
}

console.log('files_changed', changed);
console.log('---SIDEBAR---');
console.log(fs.readFileSync(path.join(wikiDir, '_Sidebar.md'), 'utf8'));
