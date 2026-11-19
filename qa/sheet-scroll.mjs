// The sheet moves with the scroll (task 4739f125; J 19 Nov 14:25 Z: "if in all sections in which you have the effect, can you
// synchronize it with scroll just like in the take a breath section"). For each sheet section of a page (both worlds), from a
// screen above it, a person's slow wheel (60 px every 40 ms) carries it up to the window's top; on every step the sheet's clear
// window (sheet.js win: its size and place) and its ribs' offset are read, and every frame's interval is kept. Then the page rests
// 1.2 s and the sheet is read again. Pass: the window opens as the section rises (bigger at the top than a screen below, never
// shrinking on the way), the ribs move with the page, nothing moves while the page rests; frames: median and p95 interval.
// Shots at three moments: the section's top at 60 % and 25 % of the window, and at its top. WebKit (%WEBKIT%).
// Usage: node qa/sheet-scroll.mjs <m|g|s> <WxH[xDPR]> <outdir>          -> <outdir>/<v>-<id>-<W>-<moment>.png, sheet-scroll-<v>-<W>.json
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { webkit } from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [v = 'm', size = '1440x900', out = 'out-sheet-scroll'] = process.argv.slice(2); const [W, H, D = 1] = size.split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: D, isMobile: W < 600, hasTouch: W < 600 });
const p = await open(ctx, `${base}/${v}/`);
const read = (id) => p.evaluate((id) => {
  const st = document.querySelector(`#${id} [data-sheet]`), s = st && st._sheet, w = s && s.win;
  return { y: Math.round(scrollY), top: Math.round(st.getBoundingClientRect().top), rx: w ? Math.round(w.rx) : null, x: w ? Math.round(w.x) : null,
    ribs: st.querySelector('.sh__streak') ? st.querySelector('.sh__streak').style.backgroundPosition : null };
}, id);
const res = {}; let bad = 0;
for (const [world, P] of [['salon', ''], ['coaching', 'c-']]) {
  if (world === 'coaching') await toWorld(p, 'coaching');
  for (const id of [`${P}deeper`, `${P}aveda`]) {
    const y0 = await p.evaluate((id) => { const e = document.getElementById(id); return e && e.querySelector('[data-sheet]') ? Math.round(e.getBoundingClientRect().top + scrollY) : -1; }, id);
    if (y0 < 0) continue;
    await jump(p, y0 - H); await wait(p, 1200);
    await p.evaluate(() => { window.__fr = []; let f0 = performance.now(); window.__go = true; (function fr(now) { window.__fr.push(now - f0); f0 = now; if (window.__go) requestAnimationFrame(fr); })(f0); });
    const steps = [], shots = { '60': 0.6, '25': 0.25, 'top': 0 };
    for (let y = y0 - H; y <= y0; y += 60) {
      await p.evaluate((y) => { const r = document.documentElement, s = r.style.scrollSnapType; r.style.scrollSnapType = 'none'; scrollTo({ top: y, behavior: 'instant' }); requestAnimationFrame(() => { r.style.scrollSnapType = s; }); }, Math.min(y, y0));
      await wait(p, 40); const s = await read(id); steps.push(s);
      for (const [k, f] of Object.entries(shots)) if (f !== null && s.top <= H * f) { await p.screenshot({ path: path.join(out, `${v}-${id}-${W}-${k}.png`) }); shots[k] = null; }
    }
    const fr = (await p.evaluate(() => { window.__go = false; return window.__fr; })).slice(2).sort((a, b) => a - b), q = (x) => Math.round(fr[Math.min(fr.length - 1, Math.floor(fr.length * x))] || 0);
    const a = await read(id); await wait(p, 1200); const z = await read(id);
    const rx = steps.map((s) => s.rx).filter((x) => x !== null), shrink = rx.findIndex((x, i) => i && x < rx[i - 1] - 1);
    const off = [];
    if (!rx.length) off.push('no clear window read');
    else {
      if (!(rx[rx.length - 1] > rx[0] * 1.3)) off.push(`the window does not open as the section rises (${rx[0]} -> ${rx[rx.length - 1]} px)`);
      if (shrink > 0) off.push(`the window shrinks on the way up (${rx[shrink - 1]} -> ${rx[shrink]} px)`);
    }
    if (new Set(steps.map((s) => s.ribs)).size < 3) off.push('the ribs do not move with the page');
    if (a.rx !== z.rx || a.x !== z.x || a.ribs !== z.ribs) off.push(`the sheet moves while the page rests (${JSON.stringify(a)} -> ${JSON.stringify(z)})`);
    res[id] = { off, frames: fr.length, median: q(.5), p95: q(.95), max: q(1), first: steps[0], last: steps[steps.length - 1] };
    if (off.length) bad++;
    console.log(`${v} ${W} ${id}: ${off.length ? 'OFF ' + off.join('; ') : 'opens and moves with the scroll, still at rest'} | frames ${fr.length}, median ${q(.5)} ms, p95 ${q(.95)} ms, max ${q(1)} ms | window ${steps[0].rx} -> ${steps[steps.length - 1].rx} px`);
  }
}
fs.writeFileSync(path.join(out, `sheet-scroll-${v}-${W}.json`), JSON.stringify(res, null, 1) + '\n');
await b.close(); srv.close();
process.exit(bad ? 1 : 0);
