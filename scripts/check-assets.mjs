import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';

const root = resolve('public');
let references = 0;
function checkReference(file, value) {
  const ref = value.replace(/^['"]|['"]$/g, '').split(/[?#]/)[0];
  if (!ref || /^(?:[a-z]+:|\/\/)/i.test(ref)) return;
  const target = ref.startsWith('/') ? resolve(root, '.' + ref) : resolve(dirname(file), ref);
  assert.ok(target === root || target.startsWith(root + sep), `Asset escapes public/: ${ref}`);
  assert.ok(existsSync(target), `${file}: missing ${ref}`);
  references++;
}
function walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name);
    if (entry.isDirectory()) { walk(file); continue; }
    if (!/\.(?:html|css|mjs|svg)$/.test(file)) continue;
    const source = readFileSync(file, 'utf8');
    const patterns = file.endsWith('.mjs')
      ? [/\bfrom\s+['"]([^'"]+)['"]/g]
      : file.endsWith('.css')
        ? [/url\(\s*([^)]*?)\s*\)/g]
        : [/(?:src|href)=["']([^"']+)["']/g];
    for (const pattern of patterns) {
      for (const match of source.matchAll(pattern)) checkReference(file, match[1]);
    }
  }
}
walk(root);
const html = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(html.includes('https://swarm.coach/'), 'Production canonical URL is missing');
assert.ok(!html.includes('Something coordinated is taking shape.'), 'Placeholder is still present');
assert.ok(html.includes('type="module" src="app.mjs"'), 'Game entrypoint is missing');
console.log(`Validated ${references} local references, production URL, and game entrypoint.`);
