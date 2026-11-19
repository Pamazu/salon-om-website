// The pause's options in WebKit (task a78e6208): each option the switcher offers, chosen in place (window.OMOptions), shot at
// 1440, 390 and J's 6K window (3230 x 1319 at 2x). The glass door twice (closed at 1.2 s, open at 7 s); Step through at the
// start, middle and end of its scroll; every other option once it has settled.
// Usage: node pause-options.mjs <outdir> [m,g] [1440,390,3230] [salon|coaching] [option,...]
import { webkit } from 'playwright';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out = 'pause-options', vs = 'm', ws = '1440,390,3230', world = 'salon', only = ''] = process.argv.slice(2);
const sid = world === 'coaching' ? 'c-pause' : 'pause', tag = world === 'coaching' ? 'iw-' : '';
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch({ executablePath: process.env.WEBKIT || undefined });
const report = [];
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 3230 ? { width: 3230, height: 1319 } : w === 1024 ? { width: 1024, height: 768 } : { width: 1440, height: 900 };
  for (const v of vs.split(',')) {
    const ctx = await b.newContext({ viewport: size, deviceScaleFactor: w === 3230 ? 2 : w < 700 ? 3 : 2, isMobile: w < 700, hasTouch: w < 700 }); ctx.setDefaultTimeout(120000);
    const p = await open(ctx, `${base}/${v}/`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    const ks = await p.evaluate((sid) => JSON.parse(document.getElementById(sid).dataset.opts).map((o) => o.k), sid);
    for (const k of ks) {
      if (only && !only.split(',').includes(k)) continue;
      await p.evaluate((k) => window.OMOptions.choose('pause', k, false), k);
      await wait(p, 300);
      const y = await p.evaluate((sid) => document.getElementById(sid).getBoundingClientRect().top + scrollY, sid);
      // re-enter the section so its entrance plays from the start
      await jump(p, Math.max(0, y - size.height * 1.5)); await wait(p, 600); await jump(p, y);
      const shots = k === 'glass' ? [[1200, 'closed'], [7000, 'open']] : k === 'through' ? [[2500, 'p0']] : [[6000, '']];
      let t0 = 0;
      for (const [t, name] of shots) { await wait(p, t - t0); t0 = t; await p.screenshot({ path: `${out}/${tag}${v}-${w}-${k}${name ? '-' + name : ''}.jpg`, type: 'jpeg', quality: 82, timeout: 180000 }); }
      if (k === 'through') {
        const h = await p.evaluate((sid) => document.getElementById(sid).getBoundingClientRect().height, sid);
        for (const [f, name] of [[.5, 'p50'], [1, 'p100']]) {
          await p.evaluate((yy) => scrollTo(0, yy), y + (h - size.height) * f); await wait(p, 1600);
          await p.screenshot({ path: `${out}/${tag}${v}-${w}-${k}-${name}.jpg`, type: 'jpeg', quality: 82, timeout: 180000 });
        }
      }
      const m = await p.evaluate((sid) => { const s = document.getElementById(sid), i = s.querySelector('img'), r = i && i.getBoundingClientRect();
        const bar = [...document.querySelectorAll('.bar, .book-bar, [class*="float"]')].map((e) => e.getBoundingClientRect()).find((r) => r.width > 100 && r.bottom > innerHeight - 140);
        return { opt: s.dataset.opt, img: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null, file: i && (i.currentSrc || '').split('/').pop(), bar: bar ? [Math.round(bar.left), Math.round(bar.right)] : null }; }, sid);
      report.push({ v, w, k, ...m }); console.log(v, w, k, JSON.stringify(m));
    }
    await ctx.close();
  }
}
await b.close(); srv.close();
fs.writeFileSync(`${out}/${tag}report.json`, JSON.stringify(report, null, 1));
