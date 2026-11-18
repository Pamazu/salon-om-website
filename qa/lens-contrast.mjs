// Ink on the glass (task a73569a9): Why Aveda's words stand on a ribbed pane whose picture moves, so each line's contrast is read
// against the worst background under it, at rest and at the strongest frame (350 ms after a jump, the glass sliding in).
// How: the words are hidden, the glass behind them is photographed, and for every line's box the darkest 3% of the pixels
// (the worst case for dark ink on a light pane) gives the ratio WCAG uses: (L_bg + .05) / (L_ink + .05). WebKit (the pool's pinned build, %WEBKIT%).
// Usage: node lens-contrast.mjs [m,g] [1440,390,768,3230]
import { webkit } from 'playwright';
import { serve, open, jump, wait } from './lib.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [vs = 'm,g', ws = '1440,390,3230'] = process.argv.slice(2);
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch({ executablePath: process.env.WEBKIT || undefined });   // Safari's browser family, J's rule for every browser check (sDelegate task 79e9b12b)
const LINES = '.av__head .eyebrow, .av__head .mid, .av__sub, .av__row dt, .av__row dd, .av__src';
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 768 ? { width: 768, height: 1024 } : w === 3230 ? { width: 3230, height: 1319 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: 1, isMobile: w === 390, hasTouch: w === 390 });
  for (const v of vs.split(',')) {
    const p = await open(ctx, `${base}/${v}/`);
    const top = await p.evaluate(() => document.querySelector('#aveda').getBoundingClientRect().top + scrollY);
    for (const [name, pre, post] of [['rest', 6500, 0], ['arrive', 0, 350]]) {
      await jump(p, Math.max(0, top - size.height * 0.55)); await wait(p, 700);
      await jump(p, top + (w === 390 ? 60 : 0)); await wait(p, name === 'rest' ? pre : post);
      await p.addStyleTag({ content: '.av__head, .av__rows, .av__src { visibility: hidden !important; }' });
      await wait(p, 120);
      const png = await p.screenshot({ type: 'png' });
      const rows = await p.evaluate(async ({ dataUrl, sel }) => {
        const img = new Image(); img.src = dataUrl; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const lin = (x) => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); };
        const L = (r, gg, bb) => .2126 * lin(r) + .7152 * lin(gg) + .0722 * lin(bb);
        const out = [];
        for (const e of document.querySelectorAll(sel)) {
          const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) continue;
          if (innerWidth < 700 && r.top < 64) continue;                    // under the fixed header on a phone: its dark bar is the background there, not the glass
          const col = getComputedStyle(e).color.match(/[\d.]+/g).map(Number); const li = L(col[0], col[1], col[2]);
          const x = Math.max(0, Math.round(r.left)), y = Math.max(0, Math.round(r.top)), W = Math.min(c.width - x, Math.round(r.width)), H = Math.min(c.height - y, Math.round(r.height));
          if (W < 2 || H < 2) continue;
          const d = g.getImageData(x, y, W, H).data, ls = [];
          for (let i = 0; i < d.length; i += 4) ls.push(L(d[i], d[i + 1], d[i + 2]));
          ls.sort((a, b) => a - b);
          const lo = ls[Math.floor(ls.length * .03)], med = ls[Math.floor(ls.length * .5)];
          const ratio = (lb) => ((Math.max(lb, li) + .05) / (Math.min(lb, li) + .05));
          out.push({ line: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 28), size: Math.round(parseFloat(getComputedStyle(e).fontSize)), worst: +ratio(lo).toFixed(2), median: +ratio(med).toFixed(2) });
        }
        return out;
      }, { dataUrl: 'data:image/png;base64,' + png.toString('base64'), sel: LINES });
      for (const r of rows) console.log(v, w, name, JSON.stringify(r));
      await p.reload(); await wait(p, 600);
    }
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
