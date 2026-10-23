import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

const origin = new URL(process.env.LIVE_ORIGIN || 'https://swarm.coach/');
const root = resolve('public');
const sha256 = data => createHash('sha256').update(data).digest('hex');
const attempts = Math.min(30, Math.max(1, Number(process.env.VERIFY_ATTEMPTS) || 18));
function assets(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? assets(path) : ['_headers', '404.html'].includes(entry.name) ? [] : [path];
  });
}
async function check() {
  const paths = assets(root);
  await Promise.all(paths.map(async path => {
    const name = relative(root, path).split('\\').join('/');
    const url = new URL(name === 'index.html' ? '/' : name, origin);
    const response = await fetch(url, { signal: AbortSignal.timeout(10000), cache: 'no-store' });
    assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
    assert.equal(new URL(response.url).origin, origin.origin, `${url}: unexpected redirect`);
    if (name.endsWith('.mjs')) {
      assert.match(response.headers.get('content-type') || '', /(?:javascript|ecmascript)/i, `${url}: module MIME type`);
    }
    const body = Buffer.from(await response.arrayBuffer());
    assert.equal(sha256(body), sha256(readFileSync(path)), `${url}: deployed content differs from this commit`);
  }));
  const missing = await fetch(new URL('/swarm-deployment-missing-page', origin), { signal: AbortSignal.timeout(10000) });
  assert.equal(missing.status, 404, 'Missing routes must return HTTP 404');
  assert.equal(sha256(Buffer.from(await missing.arrayBuffer())), sha256(readFileSync(join(root, '404.html'))), 'Branded 404 page must match the deployed source');
  console.log(`Verified ${paths.length} production files at ${origin.href}: exact SHA-256 matches, JavaScript MIME types, and the 404 route.`);
}
for (let attempt = 1; attempt <= attempts; attempt++) {
  try { await check(); process.exit(0); }
  catch (error) {
    console.log(`Production check ${attempt}/${attempts}: ${error.message}${error.cause ? ` (${error.cause.message})` : ''}`);
    if (attempt === attempts) throw error;
    await setTimeout(10000);
  }
}
