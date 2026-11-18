// QA tool (task 5479dd6c QA walk): a visitor's walk of M/G/S in WebKit (Safari's engine), every section arrived, both worlds.
// node _walk.mjs <v> <WxHxDPR> <outdir> [dwell ms]   -> <v>-<w>-<NN>-<id>.png per section + walk.json (errors, failed requests, overflow)
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [v, size, out, dw] = process.argv.slice(2); const [W, H, D = '1'] = size.split('x').map(Number); const dwell = +(dw || 2200);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: D, isMobile: W < 600, hasTouch: W < 600 });
const res = { v, size, errors: [], failed: [], sections: [] };
ctx.on('page', (pg) => { pg.on('pageerror', (e) => res.errors.push(e.message.slice(0, 200))); pg.on('console', (m) => { if (m.type() === 'error') res.errors.push('console: ' + m.text().slice(0, 200)); }); pg.on('requestfailed', (r) => res.failed.push(r.url().slice(-90))); pg.on('response', (r) => { if (r.status() >= 400) res.failed.push(r.status() + ' ' + r.url().slice(-90)); }); });
const p = await open(ctx, `${base}/${v}/`);
for (const w of ['salon', 'coaching']) {
  if (w === 'coaching') await toWorld(p, 'coaching');
  const ids = await p.evaluate((w) => [...document.querySelectorAll(`#main-${w} > section.s`)].map((s) => s.id), w);
  let n = 0;
  for (const id of ids) {
    n++;
    const y = await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY), id);
    await jump(p, y); await wait(p, dwell);
    const info = await p.evaluate((id) => { const s = document.getElementById(id), r = s.getBoundingClientRect(), vw = innerWidth;
      const over = [...s.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width > 0 && (b.right > vw + 2 || b.left < -2) && getComputedStyle(e).position !== 'fixed' && !e.closest('.s__media,.ph-bg,.mn__ph,.ch__top'); }).slice(0, 3).map((e) => e.tagName + '.' + String(e.className).slice(0, 30));
      return { h: Math.round(r.height), over, imgs: [...s.querySelectorAll('img')].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.getAttribute('src')) }; }, id);
    const f = path.join(out, `${v}-${w}-${String(n).padStart(2, '0')}-${id}.png`); await p.screenshot({ path: f });
    res.sections.push({ w, id, ...info });
  }
}
fs.writeFileSync(path.join(out, `walk-${v}.json`), JSON.stringify(res, null, 1));
console.log(v, size, 'sections', res.sections.length, 'errors', res.errors.length, 'failed', res.failed.length, 'overflow', res.sections.filter((s) => s.over.length).map((s) => s.w + ':' + s.id + ' ' + s.over.join(',')).join(' | '), 'unloaded', res.sections.filter((s) => s.imgs.length).map((s) => s.id + ':' + s.imgs.join(',')).join(' | '));
await b.close(); srv.close();
