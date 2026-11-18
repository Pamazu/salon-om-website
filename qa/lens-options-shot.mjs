// Looks at qa/lens-options/index.html in WebKit (the pool's pinned build when %WEBKIT% is set): is WebGL live in each variant, any script error,
// and a screenshot of each of A-D (task a73569a9). Usage: node lens-options-shot.mjs <outdir>
import { webkit } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'lens-options'), out = process.argv[2] || 'opt-out'; fs.mkdirSync(out, { recursive: true });
const T = { '.html': 'text/html', '.webp': 'image/webp', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(DIR, decodeURIComponent(new URL(q.url, 'http://x').pathname).replace(/^\/$/, '/index.html')); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0, '127.0.0.1');
await new Promise((ok) => srv.on('listening', ok));
const b = await webkit.launch({ executablePath: process.env.WEBKIT || undefined }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); ctx.setDefaultTimeout(120000);
const p = await ctx.newPage(); const errs = []; p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errs.push(m.text().slice(0, 160)); }); p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
await p.goto(`http://127.0.0.1:${srv.address().port}/index.html`, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(2000);
console.log('stages without WebGL:', await p.evaluate(() => document.querySelectorAll('.nogl').length));
for (const id of ['A', 'B', 'C', 'D']) {
  const y = await p.evaluate((id) => document.querySelector('[data-v="' + id + '"] .stage').getBoundingClientRect().top + scrollY, id);
  if (id === 'A') { await p.evaluate((y) => scrollTo(0, y - 800), y); await p.mouse.move(700, 400); await p.waitForTimeout(800); await p.screenshot({ path: out + '/A-0cover.jpg', type: 'jpeg', quality: 80 }); }
  await p.evaluate((y) => scrollTo(0, y - (id === 'A' ? 300 : 40)), y); await p.mouse.move(id === 'D' ? 400 : 900, 420, { steps: 6 }); await p.waitForTimeout(1500);
  await p.screenshot({ path: out + '/' + id + '-1.jpg', type: 'jpeg', quality: 80 });
}
console.log('errors:', JSON.stringify(errs.slice(0, 6)));
await b.close(); srv.close();
