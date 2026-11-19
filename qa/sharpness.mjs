// Every picture's sharpness at its display size (task b1dd24c9, approved features row 18: "sharp at its display size on
// J's largest screen (his captures are 6460 px wide)"). For each <img> and film poster on M, G and S, in both worlds, at
// J's 6K window (3230 x 1319 CSS px at 2x) and at 1440: the scale the browser draws it at (object-fit cover counted), in
// device pixels per file pixel. Over 1.0 = the browser enlarges the file = soft on screen.
//   node sharpness.mjs [m,g,s] [3230,1440,390]   -> prints one line per picture, worst first; qa/out-chromium/sharpness.json
//   ... --manifest   also writes option-2.x-shared/source/photo_sizes.json: per page and picture, the widest it is drawn
//   (CSS px) at 3230, 1440 and 390, which build.py turns into each <img>'s sizes and export_photos.py into file widths
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, open, toWorld, wait, pictures } from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARGS = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const VERS = (ARGS[0] || 'm,g,s').split(',');
const WIDTHS = (ARGS[1] || '3230').split(',').map(Number);
const H = { 3230: 1319, 1440: 900, 390: 844 };
const DPR = { 3230: 2, 1440: 2, 390: 3 };
const MANIFEST = process.argv.includes('--manifest');
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await pw.chromium.launch();
const rows = [];
try {
  for (const v of VERS) for (const W of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H[W] || 900 }, deviceScaleFactor: DPR[W] || 2, ...(W < 700 ? { isMobile: true, hasTouch: true } : {}) });
    const p = await open(ctx, `${base}/${v}/`);
    const worlds = await p.evaluate(() => [...document.querySelectorAll('.worlds [data-to-world]')].map((b) => b.dataset.toWorld));
    for (const w of worlds.length ? worlds : ['']) {
      if (w) await toWorld(p, w);
      // walk the page so lazy pictures load, then measure each one where it is laid out
      const total = await p.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 900) { await p.evaluate((y) => scrollTo(0, y), y); await wait(p, 120); }
      await wait(p, 800);
      const got = await pictures(p);
      for (const g of got) rows.push({ v, W, world: w, ...g, dpx: +(g.scale * (DPR[W] || 2)).toFixed(2), rw: Math.round(g.nat[0] * g.scale) });
    }
    await ctx.close();
  }
} finally { await browser.close(); srv.close(); }
const seen = new Set();
const uniq = rows.filter((r) => { const k = `${r.v}|${r.W}|${r.src}|${r.where}`; if (seen.has(k)) return false; seen.add(k); return true; })
  .sort((a, b) => b.dpx - a.dpx);
fs.writeFileSync(path.join(REPO, 'qa', 'out-chromium', 'sharpness.json'), JSON.stringify(uniq, null, 1));
if (MANIFEST) {
  // the widest each picture is drawn on each page, per viewport (img/ files only; the films' posters are not exported here)
  const man = {};
  for (const r of rows) {
    const f = (r.src || '').replace(/\?v=[0-9a-f]+$/, '').match(/^img\/([^ ]+\.webp)$/); if (!f) continue;   // the address without its content version (task 01849ea5)
    const e = ((man[r.v] ||= {})[f[1]] ||= {});
    e['w' + r.W] = Math.max(e['w' + r.W] || 0, r.rw);
  }
  fs.writeFileSync(path.join(REPO, 'option-2.x-shared', 'source', 'photo_sizes.json'), JSON.stringify(man, null, 1) + '\n');
}
for (const r of uniq) console.log(`${r.dpx.toFixed(2)}x  ${r.v} ${r.W} ${r.world.padEnd(6)} ${String(r.nat).padEnd(10)} box ${String(r.box).padEnd(10)} ${r.where.padEnd(14)} ${r.file && r.file !== r.src ? r.file : r.src}`);
