// Every picture's sharpness at its display size (task b1dd24c9, approved features row 18: "sharp at its display size on
// J's largest screen (his captures are 6460 px wide)"). For each <img> and film poster on M, G and S, in both worlds, at
// J's 6K window (3230 x 1319 CSS px at 2x) and at 1440: the scale the browser draws it at (object-fit cover counted), in
// device pixels per file pixel. Over 1.0 = the browser enlarges the file = soft on screen.
//   node sharpness.mjs [m,g,s] [3230,1440,390]   -> prints one line per picture, worst first; qa/out-chromium/sharpness.json
//   ... --manifest   also writes option-2.x-shared/source/photo_sizes.json: per page and picture, the widest it is drawn
//   (CSS px) at 3230, 1440 and 390, which build.py turns into each <img>'s sizes and export_photos.py into file widths;
//   a section's other options (the option switcher) are measured too, as o3230 / o1440 / o390: file widths only
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, open, toWorld, wait } from './lib.mjs';

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
      const got = await p.evaluate(async () => {
        const out = [];
        // with a srcset, naturalWidth is density-corrected: read the chosen file's own pixels from a plain Image
        const real = {};
        for (const el of document.querySelectorAll('img[srcset]')) {
          const u = el.currentSrc; if (!u || real[u]) continue;
          const t = new Image(); t.src = u; try { await t.decode(); } catch (e) {}
          real[u] = [t.naturalWidth, t.naturalHeight];
        }
        const fit = (el, nw, nh) => {
          const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
          if (!r.width || !r.height || !nw) return null;
          const f = cs.objectFit || 'fill';
          const s = f === 'cover' ? Math.max(r.width / nw, r.height / nh) : f === 'contain' ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh);
          return { box: [Math.round(r.width), Math.round(r.height)], scale: s };
        };
        for (const el of document.querySelectorAll('img')) {
          const [nw, nh] = el.hasAttribute('srcset') && real[el.currentSrc] ? real[el.currentSrc] : [el.naturalWidth, el.naturalHeight];
          const m = fit(el, nw, nh); if (!m) continue;
          const file = el.hasAttribute('srcset') ? el.currentSrc.replace(/^.*\/img\//, 'img/') : el.getAttribute('src');
          out.push({ src: el.getAttribute('src'), file, nat: [nw, nh], ...m, where: el.closest('section,[id]')?.id || '' });
        }
        for (const el of document.querySelectorAll('video[poster]')) {
          const m = fit(el, el.videoWidth || 1600, el.videoHeight || 900); if (!m) continue;
          out.push({ src: el.getAttribute('poster') + ' (film ' + el.currentSrc.split('/').pop() + ', ' + (el.videoWidth || '?') + 'x' + (el.videoHeight || '?') + ')', nat: [el.videoWidth, el.videoHeight], ...m, where: el.closest('section,[id]')?.id || '' });
        }
        return out;
      });
      for (const g of got) rows.push({ v, W, world: w, ...g, dpx: +(g.scale * (DPR[W] || 2)).toFixed(2), rw: Math.round(g.nat[0] * g.scale) });
      // each section's options (the option switcher, task e5325977): every option is chosen in turn and its pictures measured
      // where it draws them, so a full-screen option gets files sharp enough too (task a78e6208); they count for the files'
      // widths only ('o' keys), never for the default's sizes ('w' keys)
      const opts = await p.evaluate(() => [...document.querySelectorAll('section[data-opt-key][data-opts]')]
        .filter((s) => s.getBoundingClientRect().height > 0)
        .map((s) => ({ id: s.id, key: s.dataset.optKey, ks: JSON.parse(s.dataset.opts).map((o) => o.k).filter((k) => k !== 'live') })));
      for (const o of opts) for (const k of o.ks) {
        await p.evaluate(({ key, k, id }) => { window.OMOptions.choose(key, k, false); document.getElementById(id).scrollIntoView(); }, { key: o.key, k, id: o.id });
        await wait(p, 1400);
        const og = await p.evaluate(async (id) => {
          const out = [], s = document.getElementById(id);
          for (const el of s.querySelectorAll('img')) {
            const t = new Image(); t.src = el.currentSrc || el.src; try { await t.decode(); } catch (e) {}
            const r = el.getBoundingClientRect(), cs = getComputedStyle(el), nw = t.naturalWidth, nh = t.naturalHeight;
            if (!r.width || !r.height || !nw) continue;
            const sc = cs.objectFit === 'contain' ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh);
            out.push({ src: el.getAttribute('src'), file: (el.currentSrc || '').replace(/^.*\/img\//, 'img/'), nat: [nw, nh], box: [Math.round(r.width), Math.round(r.height)], scale: sc });
          }
          return out;
        }, o.id);
        for (const g of og) rows.push({ v, W, world: w, ...g, where: `${o.id}:${k}`, opt: true, dpx: +(g.scale * (DPR[W] || 2)).toFixed(2), rw: Math.round(g.nat[0] * g.scale) });
        await p.evaluate(({ key }) => window.OMOptions.choose(key, 'live', false), { key: o.key });
      }
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
    const e = ((man[r.v] ||= {})[f[1]] ||= {}), k = (r.opt ? 'o' : 'w') + r.W;
    e[k] = Math.max(e[k] || 0, r.rw);
  }
  fs.writeFileSync(path.join(REPO, 'option-2.x-shared', 'source', 'photo_sizes.json'), JSON.stringify(man, null, 1) + '\n');
}
for (const r of uniq) console.log(`${r.dpx.toFixed(2)}x  ${r.v} ${r.W} ${r.world.padEnd(6)} ${String(r.nat).padEnd(10)} box ${String(r.box).padEnd(10)} ${r.where.padEnd(14)} ${r.file && r.file !== r.src ? r.file : r.src}`);
