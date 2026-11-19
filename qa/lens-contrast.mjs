// Ink on the sheet (task 95e37a41; first written for Why Aveda's glass in task a73569a9): every section whose words ride on the
// lenticular sheet (sheet.js, any [data-sheet], both worlds) has each line's contrast read against the worst background under it,
// at rest and at the worst moment of the sheet's drift. How: the sheet's clock (window.__lensT, sheet.js) is swept over 36 s
// (F's clear window repeats every 18 s sideways, 12.6 s up and down); at each moment the window's centre and radius are read
// from the sheet's own mask, and the moment it comes nearest the words is the worst. There and at rest the words are hidden, the
// glass is photographed, and for every line's box the darkest 3 % of the pixels (the worst case for dark ink on a light pane)
// gives the ratio WCAG uses: (L_bg + .05) / (L_ink + .05). Body text needs 7:1 (AAA), large text (24 px, or 18.66 px bold) 4.5:1.
// It also keeps screen shots of each section with its words (top, the worst moment, and where its picture meets the words below).
// WebKit (the pool's pinned build, %WEBKIT%), J's rule for every browser check.
// Usage: node qa/lens-contrast.mjs [m,g,s] [1120,1440,1976,3230,390]     results: qa/out-lens/
import { webkit } from 'playwright';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(REPO, 'qa', 'out-lens'); fs.mkdirSync(OUT, { recursive: true });
const [vs = 'm,g,s', ws = '1120,1440,1976,3230,390'] = process.argv.slice(2);
const SIZE = { 390: [390, 844], 1120: [1120, 700], 1440: [1440, 900], 1976: [1976, 1209], 3230: [3230, 1319] };
const LINES = '.sh__words :is(.eyebrow, .mid, .av__sub, .av__row dt, .av__row dd, .av__src, .sh__text, .sh__more, .btn--line)';
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
console.log('webkit', b.version(), process.env.WEBKIT ? 'from the pool asset' : 'from Playwright');
const frames = (p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
const all = [];
let red = 0;
for (const w of ws.split(',').map(Number)) {
  const [W, H] = SIZE[w] || [w, Math.round(w * .625)];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 700, hasTouch: W < 700 }); ctx.setDefaultTimeout(120000);
  for (const v of vs.split(',')) {
    const p = await open(ctx, `${base}/${v}/`);
    for (const [world, P] of [['salon', ''], ['coaching', 'c-']]) {
      if (world === 'coaching') await toWorld(p, 'coaching');
      const ids = await p.evaluate((m) => [...document.querySelectorAll(`#${m} > section.s`)].filter((s) => s.querySelector('[data-sheet]')).map((s) => s.id), `main-${world}`);
      for (const id of ids) {
        const top = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
        await jump(p, Math.max(0, top - H * .6)); await wait(p, 500);
        await jump(p, top);
        await p.waitForFunction((id) => document.querySelector(`#${id} [data-sheet]`).classList.contains('sh--on'), id, { timeout: 30000 }).catch(() => {});
        await wait(p, 3200);                                                  // the words arrive (their last entrance starts at 1.4 s)
        const worst = await p.evaluate(async (id) => {                        // the moment the clear window comes nearest the words
          const st = document.querySelector(`#${id} [data-sheet]`), sh = st.querySelector('.sh__sheet'), wd = st.querySelector('.sh__words');
          let best = null;
          for (let t = 0; t <= 36; t += 0.25) {
            window.__lensT = t; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
            const m = String(sh.style.webkitMaskImage || sh.style.maskImage || '').match(/circle at (-?[\d.]+)px (-?[\d.]+)px, transparent (-?[\d.]+)px/);
            if (!m) return { t: 0, dist: null, note: 'no clear window in this sheet' };
            const sr = st.getBoundingClientRect(), r = wd.getBoundingClientRect(), x = +m[1] + sr.left, y = +m[2] + sr.top;
            const d = Math.hypot(Math.max(r.left - x, 0, x - r.right), Math.max(r.top - y, 0, y - r.bottom)) - +m[3];
            if (!best || d < best.dist) best = { t, dist: Math.round(d) };
          }
          return best;
        }, id);
        // a stage taller than the screen (it grows to hold its words) is read a screen at a time, 80 % apart, down to its foot
        const foot = await p.evaluate((id) => { const st = document.querySelector(`#${id} .sh`); return st.getBoundingClientRect().bottom + scrollY; }, id);
        const at = [top]; while (foot - at[at.length - 1] > H + 2) at.push(Math.min(at[at.length - 1] + Math.round(H * .8), foot - H));
        for (const [k, y] of at.entries()) {
        if (k) { await jump(p, y); await wait(p, 1800); }
        for (const [moment, t] of [['rest', 0], ['worst', worst.t]]) {
          await p.evaluate((t) => { window.__lensT = t; }, t); await frames(p); await wait(p, 150);
          const shot = `${v}-${w}-${id}${k ? '-' + k : ''}-${moment}.png`;
          await p.screenshot({ path: path.join(OUT, shot) });
          const tag = await p.addStyleTag({ content: '.sh__words { visibility: hidden !important; }' });
          await frames(p); await wait(p, 120);
          const png = await p.screenshot({ type: 'png' });
          await tag.evaluate((n) => n.remove());
          const rows = await p.evaluate(async ({ dataUrl, sel, id }) => {
            const img = new Image(); img.src = dataUrl; await img.decode();
            const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
            const lin = (x) => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); };
            const L = (r, gg, bb) => .2126 * lin(r) + .7152 * lin(gg) + .0722 * lin(bb);
            // whatever floats over the page (the header, the door bar, the round buttons) covers any text scrolling past it: what is
            // behind a line there is that part, not the glass, so a line box under one is not read (the 19 Nov run read them as 1:1)
            const covers = [...document.querySelectorAll('body *')].filter((x) => { const k = getComputedStyle(x); return k.position === 'fixed' && k.visibility !== 'hidden' && k.display !== 'none' && +k.opacity > 0.05; })
              .map((x) => x.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.width * r.height < innerWidth * innerHeight * .5);   // a full-screen layer is not a cover: it would hide every line
            const under = (r) => covers.some((c) => r.left < c.right && r.right > c.left && r.top < c.bottom && r.bottom > c.top);
            const out = [];
            for (const e of document.getElementById(id).querySelectorAll(sel)) {
              // the glass behind the letters: the text's own line boxes (a Range), never the element's whole box, which also covers
              // whatever sits beside a short line (the picture's AI label beside the eyebrow on a phone read 2.08 that way)
              const rg = document.createRange(); rg.selectNodeContents(e);
              const boxes = [...rg.getClientRects()].filter((r) => r.width >= 4 && r.height >= 4 && r.bottom > 0 && r.top < innerHeight && !under(r));
              if (!boxes.length) { if ([...rg.getClientRects()].some((r) => r.width >= 4 && r.bottom > 0 && r.top < innerHeight)) out.push({ line: (e.textContent || '').trim().slice(0, 30), skipped: 'under a fixed part of the page' }); continue; }
              const cs = getComputedStyle(e), col = cs.color.match(/[\d.]+/g).map(Number), li = L(col[0], col[1], col[2]);
              const ls = [];
              for (const r of boxes) {
                const x = Math.max(0, Math.round(r.left)), y = Math.max(0, Math.round(r.top)), Wd = Math.min(c.width - x, Math.round(r.width)), Hd = Math.min(c.height - y, Math.round(r.height));
                if (Wd < 2 || Hd < 2) continue;
                const d = g.getImageData(x, y, Wd, Hd).data;
                for (let i = 0; i < d.length; i += 4) ls.push(L(d[i], d[i + 1], d[i + 2]));
              }
              if (!ls.length) continue;
              ls.sort((a, b) => a - b);
              const ratio = (lb) => (Math.max(lb, li) + .05) / (Math.min(lb, li) + .05);
              const px = parseFloat(cs.fontSize), large = px >= 24 || (px >= 18.66 && +cs.fontWeight >= 700);
              out.push({ line: (e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 30), px: Math.round(px), large,
                worst: +ratio(ls[Math.floor(ls.length * .03)]).toFixed(2), median: +ratio(ls[Math.floor(ls.length * .5)]).toFixed(2) });
            }
            return out;
          }, { dataUrl: 'data:image/png;base64,' + png.toString('base64'), sel: LINES, id });
          for (const r of rows) {
            if (r.skipped) { all.push({ v, w, world, id, part: k, moment, t, ...r }); continue; }
            const need = r.large ? 4.5 : 7, ok = r.worst >= need; if (!ok) red++;
            all.push({ v, w, world, id, part: k, moment, t, ...r, need, ok });
            console.log(ok ? 'ok ' : 'LOW', v, w, id, k, moment, `t=${t}`, JSON.stringify(r));
          }
        }
        }
        await p.evaluate(() => { window.__lensT = null; });
        // where the picture meets what follows it inside the same section (Why Aveda's letter): its lower edge at 55 % of the screen
        const join = await p.evaluate((id) => { const s = document.getElementById(id), st = s.querySelector('.sh'); const a = s.getBoundingClientRect(), b = st.getBoundingClientRect(); return a.bottom - b.bottom > 40 ? b.bottom + scrollY : null; }, id);
        if (join) { await jump(p, join - H * .55); await wait(p, 2600); await p.screenshot({ path: path.join(OUT, `${v}-${w}-${id}-join.png`) }); }
        console.log('worst moment', v, w, id, JSON.stringify(worst));
      }
      await jump(p, 0); await wait(p, 300);
    }
    await p.close();
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'contrast.json'), JSON.stringify(all, null, 1) + '\n');
const low = all.filter((r) => !r.skipped && !r.ok), skip = all.filter((r) => r.skipped);
console.log(`${all.length - skip.length} lines measured, ${low.length} under their need (7:1 body, 4.5:1 large); ${skip.length} not read, wholly under a fixed part of the page`);
await b.close(); srv.close();
process.exit(0);
