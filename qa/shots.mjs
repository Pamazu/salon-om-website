// QA tool (task 5479dd6c): screenshots of named sections of M/G/S as built in this worktree. node _shots.mjs <v> <WxH[xDPR]> <outdir> <id,id,...> [--wait ms]
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [v, size, out, ids] = process.argv.slice(2); const [W, H, D = 1] = size.split('x').map(Number);
const dwell = +(process.argv.includes('--wait') ? process.argv[process.argv.indexOf('--wait') + 1] : 2600);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
// WebKit only (J, 4 Nov), the pool's pinned one when %WEBKIT% is set (as gate-rows.mjs)
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {}); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: D, isMobile: W < 600, hasTouch: W < 600 });
ctx.on('page', (pg) => { pg.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 160))); pg.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 160)); }); pg.on('requestfailed', (r) => console.log('REQFAIL', r.url().slice(-80))); });
const p = await open(ctx, `${base}/${v}/`);
for (const id of ids.split(',')) {
  if (id.startsWith('c-')) { if (!(await p.evaluate(() => document.body.classList.contains('is-coaching') || document.documentElement.classList.contains('is-coaching')))) await toWorld(p, 'coaching'); }
  const y = await p.evaluate((id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : -1; }, id);
  if (y < 0) { console.log(id, 'missing'); continue; }
  await jump(p, y); await wait(p, dwell);
  const f = path.join(out, `${v}-${id}-${W}x${H}.png`); await p.screenshot({ path: f }); console.log(f);
}
await b.close(); srv.close();
