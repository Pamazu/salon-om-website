// Every picture's sharpness at its display size (task b1dd24c9, approved features row 18: "sharp at its display size on
// J's largest screen (his captures are 6460 px wide)"). For each <img> and film poster on M, G and S, in both worlds, at
// J's 6K window (3230 x 1319 CSS px at 2x) and at 1440: the scale the browser draws it at (object-fit cover counted), in
// device pixels per file pixel. Over 1.0 = the browser enlarges the file = soft on screen.
//   node sharpness.mjs [m,g,s] [3230,1440]   -> prints one line per picture, worst first; qa/out-sharpness.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, open, toWorld, wait } from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERS = (process.argv[2] || 'm,g,s').split(',');
const WIDTHS = (process.argv[3] || '3230').split(',').map(Number);
const H = { 3230: 1319, 1440: 900 };
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await pw.chromium.launch();
const rows = [];
try {
  for (const v of VERS) for (const W of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H[W] || 900 }, deviceScaleFactor: 2 });
    const p = await open(ctx, `${base}/${v}/`);
    const worlds = await p.evaluate(() => [...document.querySelectorAll('.worlds [data-to-world]')].map((b) => b.dataset.toWorld));
    for (const w of worlds.length ? worlds : ['']) {
      if (w) await toWorld(p, w);
      // walk the page so lazy pictures load, then measure each one where it is laid out
      const total = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 900) { await p.evaluate((y) => scrollTo(0, y), y); await wait(p, 120); }
      await wait(p, 800);
      const got = await p.evaluate(() => {
        const out = [];
        const fit = (el, nw, nh) => {
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (!r.width || !r.height || !nw) return null;
          const f = cs.objectFit || 'fill';
          const s = f === 'cover' ? Math.max(r.width / nw, r.height / nh) : f === 'contain' ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh);
          return { box: [Math.round(r.width), Math.round(r.height)], scale: s };
        };
        for (const el of document.querySelectorAll('img')) {
          const m = fit(el, el.naturalWidth, el.naturalHeight); if (!m) continue;
          out.push({ src: el.getAttribute('src'), nat: [el.naturalWidth, el.naturalHeight], ...m, where: el.closest('section,[id]')?.id || '' });
        }
        for (const el of document.querySelectorAll('video[poster]')) {
          const m = fit(el, el.videoWidth || 1600, el.videoHeight || 900); if (!m) continue;
          out.push({ src: el.getAttribute('poster') + ' (film ' + el.currentSrc.split('/').pop() + ', ' + (el.videoWidth || '?') + 'x' + (el.videoHeight || '?') + ')', nat: [el.videoWidth, el.videoHeight], ...m, where: el.closest('section,[id]')?.id || '' });
        }
        return out;
      });
      for (const g of got) rows.push({ v, W, world: w, ...g, dpx: +(g.scale * 2).toFixed(2) });
    }
    await ctx.close();
  }
} finally { await browser.close(); srv.close(); }
const seen = new Set();
const uniq = rows.filter((r) => { const k = `${r.v}|${r.W}|${r.src}|${r.where}`; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => b.dpx - a.dpx);
fs.writeFileSync(path.join(REPO, 'qa', 'out-sharpness.json'), JSON.stringify(uniq, null, 1));
for (const r of uniq) console.log(`${r.dpx.toFixed(2)}x  ${r.v} ${r.W} ${r.world.padEnd(6)} ${String(r.nat).padEnd(10)} box ${String(r.box).padEnd(10)} ${r.where.padEnd(14)} ${r.src}`);
