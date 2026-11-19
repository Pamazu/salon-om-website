// The sheet moves with the scroll (task 4739f125; J 19 Nov 14:25 Z: "if in all sections in which you have the effect, can you
// synchronize it with scroll just like in the take a breath section"). For each sheet section of a page (both worlds), from a
// screen above it, a person's slow mouse wheel (60 px every 60 ms, through the page's own snapping and pulls) carries it up to the
// window's top; on every step the section's top, the sheet's clear window (sheet.js win) and its ribs' offset are read.
// Pass: the window is a function of where the section stands (the higher it has risen, the more open: never less open at a
// higher place, read across every step, whichever way a pull moved the page) and opens as it rises (top far more open than a
// screen below); the ribs take a new place wherever the section does; once the page has come to rest (its scroll unchanged for
// 0.6 s), nothing in the sheet moves for 1.2 s. Frames: a second pass of the same wheel with nothing read or shot during it, the
// rAF intervals kept, beside the same pass with the sheet held still (calm motion): what the moving sheet costs on top of the page.
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
  const st = document.querySelector(`#${id} [data-sheet]`), s = st && st._sheet, w = s && s.win, k = st.querySelector('.sh__streak');
  return { y: Math.round(scrollY), top: Math.round(st.getBoundingClientRect().top), rx: w ? Math.round(w.rx) : null, x: w ? Math.round(w.x) : null, ribs: k ? k.style.backgroundPosition : null };
}, id);
const rest = async () => { let y = -1; for (let i = 0; i < 20; i++) { const n = await p.evaluate(() => Math.round(scrollY)); if (n === y) return; y = n; await wait(p, 600); } };
const ready = (id) => p.waitForFunction((id) => !!document.querySelector(`#${id} .sh--on`), id, { timeout: 30000 }).catch(() => {});
const wheel = async (id, y0, look) => {
  await jump(p, y0 - H); await rest(); await ready(id);
  await p.mouse.move(W / 2, H / 2); const steps = [];
  for (let i = 0; i < Math.ceil(H / 60) + 4; i++) {
    await p.mouse.wheel(0, 60); await wait(p, 60);
    if (look) steps.push(await look());
  }
  return steps;
};
const res = {}; let bad = 0;
for (const [world, P] of [['salon', ''], ['coaching', 'c-']]) {
  if (world === 'coaching') await toWorld(p, 'coaching');
  for (const id of [`${P}deeper`, `${P}aveda`]) {
    const y0 = await p.evaluate((id) => { const e = document.getElementById(id); return e && e.querySelector('[data-sheet]') ? Math.round(e.getBoundingClientRect().top + scrollY) : -1; }, id);
    if (y0 < 0) continue;
    const shots = { '60': 0.6, '25': 0.25, 'top': 0 };
    const steps = await wheel(id, y0, async () => {
      const s = await read(id);
      for (const [k, f] of Object.entries(shots)) if (f !== null && s.top <= H * f && s.top > -H * .2) { await p.screenshot({ path: path.join(out, `${v}-${id}-${W}-${k}.png`) }); shots[k] = null; }
      return s;
    });
    await rest(); const a = await read(id); await wait(p, 1200); const z = await read(id);
    const seen = steps.filter((s) => s.rx !== null && s.top > -H * .5 && s.top <= H), off = [];
    const byTop = [...seen].sort((m, n) => n.top - m.top);           // from lowest on the screen to highest
    const back = byTop.findIndex((s, i) => i && s.rx < byTop[i - 1].rx - 1);
    if (!seen.length) off.push('no clear window read');
    else {
      const lo = byTop[0], hi = byTop[byTop.length - 1];
      if (!(hi.rx > lo.rx * 1.3) && lo.top > H * .5) off.push(`the window does not open as the section rises (${lo.rx} px at ${lo.top} -> ${hi.rx} px at ${hi.top})`);
      if (back > 0) off.push(`the window is less open higher up (${byTop[back - 1].rx} px at ${byTop[back - 1].top} -> ${byTop[back].rx} px at ${byTop[back].top})`);
      const ribsAt = new Map(); for (const s of seen) ribsAt.set(s.top, s.ribs);
      const tops = new Set(seen.map((s) => s.top)).size, ribs = new Set(seen.map((s) => s.ribs)).size;
      if (tops >= 3 && ribs < Math.min(3, tops)) off.push(`the ribs do not move with the page (${ribs} places over ${tops} section positions)`);
    }
    if (a.y === z.y && (a.rx !== z.rx || a.x !== z.x || a.ribs !== z.ribs)) off.push(`the sheet moves while the page rests (${JSON.stringify(a)} -> ${JSON.stringify(z)})`);
    // frames: the same wheel, nothing read during it; then the same with the sheet held still (calm) as the control
    const frames = async () => {
      await p.evaluate(() => { window.__fr = []; let f0 = performance.now(); window.__go = true; (function fr(now) { window.__fr.push(now - f0); f0 = now; if (window.__go) requestAnimationFrame(fr); })(f0); });
      await wheel(id, y0, null);
      const fr = (await p.evaluate(() => { window.__go = false; return window.__fr; })).slice(2).sort((m, n) => m - n);
      const q = (x) => Math.round(fr[Math.min(fr.length - 1, Math.floor(fr.length * x))] || 0);
      return { n: fr.length, median: q(.5), p95: q(.95), max: q(1) };
    };
    const moving = await frames();
    const m0 = await p.evaluate(() => { const r = document.documentElement, m = r.getAttribute('data-motion'); r.setAttribute('data-motion', 'calm'); return m; });
    const held = await frames();                                      // calm also stills the page's other motion: the control is the lighter one
    await p.evaluate((m) => { const r = document.documentElement; if (m === null) r.removeAttribute('data-motion'); else r.setAttribute('data-motion', m); }, m0);
    res[id] = { off, moving, held, steps: seen.map((s) => [s.top, s.rx, s.ribs]) };
    if (off.length) bad++;
    console.log(`${v} ${W} ${id}: ${off.length ? 'OFF ' + off.join('; ') : 'opens and moves with the scroll, still at rest'} | frames moving: median ${moving.median} p95 ${moving.p95} max ${moving.max} ms (${moving.n}); held still: median ${held.median} p95 ${held.p95} max ${held.max} ms (${held.n})`);
  }
}
fs.writeFileSync(path.join(out, `sheet-scroll-${v}-${W}.json`), JSON.stringify(res, null, 1) + '\n');
await b.close(); srv.close();
process.exit(bad ? 1 : 0);
