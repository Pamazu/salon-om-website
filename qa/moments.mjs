// QA tool (task 95ac520e): a section of M/G/S as built in this worktree, shot at chosen moments after it arrives, in WebKit
// (J, 4 Nov), so motion is read over time, never from one frame. A target is a section id, optionally with how far into a tall
// section to stand (id@0.4: 40 % of the way through its scroll); it is first left a screen above, so its animations replay.
// Each shot also logs the header's state there (glass on or off, its veil, its text colour) for the bar's legibility check.
// Usage: node qa/moments.mjs <m|g|s> <WxH[xDPR]> <outdir> <id[@frac],...> <ms,ms,...>      shots: <v>-<id>[@frac]-<W>-<ms>ms.png
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [v, size, out, targets, times] = process.argv.slice(2); const [W, H, D = 1] = size.split('x').map(Number);
const at = times.split(',').map(Number).sort((a, b) => a - b);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: D, isMobile: W < 600, hasTouch: W < 600 });
ctx.on('page', (pg) => { pg.on('pageerror', (e) => console.log('PAGEERROR', e.message.slice(0, 160))); });
const p = await open(ctx, `${base}/${v}/`);
for (const t of targets.split(',')) {
  const [id, frac = '0'] = t.split('@');
  if (id.startsWith('c-')) await toWorld(p, 'coaching');
  const box = await p.evaluate((id) => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), h: Math.round(r.height) }; }, id);
  if (!box) { console.log(id, 'missing'); continue; }
  const y = box.y + Math.round(Math.max(0, box.h - H) * +frac);
  await jump(p, Math.max(0, box.y - H)); await wait(p, 900);
  await jump(p, y); const t0 = Date.now();
  for (const ms of at) {
    const left = ms - (Date.now() - t0); if (left > 0) await wait(p, left);
    const f = path.join(out, `${v}-${t}-${W}-${ms}ms.png`); await p.screenshot({ path: f });
    const hdr = await p.evaluate(() => { const h = document.getElementById('hdr'), c = getComputedStyle(h), g = getComputedStyle(h, '::before');
      return { glass: document.documentElement.classList.contains('hdr-ground'), veil: g.opacity, bg: g.backgroundImage.slice(0, 90), backdrop: g.webkitBackdropFilter || g.backdropFilter, ink: c.color, solid: c.backgroundColor }; });
    console.log(f, JSON.stringify(hdr));
  }
}
await b.close(); srv.close();
