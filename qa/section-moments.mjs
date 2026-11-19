// One section through its scroll, in WebKit (task 1a6089ec): for each page, width and option of the section, shots at the
// given scroll moments, as fractions of its scroll (0 = its top a little below the screen's top edge... 1 = its last screen).
// A section taller than the screen is read over its pinned run (top at the screen's top to its foot at the screen's foot);
// a shorter one from 60 % of a screen before its top. Options are the switcher's keys ('live' = the page's default).
// Usage: node section-moments.mjs <out> <sid> [m,g,s] [1440,390,3230] [salon|coaching] [live,key,...] [0,.5,1]
import { webkit } from 'playwright';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out = 'section-moments', sid0 = 'hosts', vs = 'm', ws = '1440,390', world = 'salon', keys = 'live', fs0 = '0,.5,1'] = process.argv.slice(2);
const sid = world === 'coaching' ? 'c-' + sid0 : sid0, tag = world === 'coaching' ? 'iw-' : '';
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch({ executablePath: process.env.WEBKIT || undefined });
const report = [];
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 3230 ? { width: 3230, height: 1319 } : w === 1976 ? { width: 1976, height: 1236 } : { width: 1440, height: 900 };
  for (const v of vs.split(',')) {
    const ctx = await b.newContext({ viewport: size, deviceScaleFactor: w === 3230 ? 2 : w < 700 ? 3 : 2, isMobile: w < 700, hasTouch: w < 700 }); ctx.setDefaultTimeout(120000);
    const p = await open(ctx, `${base}/${v}/`);
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    if (world === 'coaching') await toWorld(p, 'coaching');
    if (!(await p.evaluate((sid) => !!document.getElementById(sid), sid))) { report.push({ v, w, missing: sid }); await ctx.close(); continue; }
    for (const k of keys.split(',')) {
      const has = await p.evaluate(([sid, k]) => { const s = document.getElementById(sid); return k === 'live' || (s.dataset.opts && JSON.parse(s.dataset.opts).some((o) => o.k === k)); }, [sid, k]);
      if (!has) { report.push({ v, w, k, missing: 'option' }); continue; }
      if (k !== 'live') { await p.evaluate(([sid, k]) => window.OMOptions.choose(sid.replace(/^c-/, ''), k, false), [sid, k]); await wait(p, 400); }
      const { y, h } = await p.evaluate((sid) => { const r = document.getElementById(sid).getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; }, sid);
      const pinned = h > size.height * 1.2;
      const a = pinned ? y : y - size.height * .6, z = pinned ? y + h - size.height : y;
      await jump(p, Math.max(0, a - size.height * 1.5)); await wait(p, 600);
      for (const f of fs0.split(',').map(Number)) {
        // scroll there in a few steps, as a reader does, so a scroll-driven part sees the scroll arrive
        const t = a + (z - a) * f, from = await p.evaluate(() => scrollY);
        for (let i = 1; i <= 6; i++) { await p.evaluate((yy) => scrollTo(0, yy), from + (t - from) * i / 6); await wait(p, 60); }
        await wait(p, 1800);
        await p.screenshot({ path: `${out}/${tag}${v}-${w}-${k}-${String(Math.round(f * 100)).padStart(3, '0')}.jpg`, type: 'jpeg', quality: 80, timeout: 180000 });
      }
      report.push({ v, w, k, y: Math.round(y), h: Math.round(h), pinned });
    }
    if (errs.length) report.push({ v, w, errors: errs });
    await ctx.close();
  }
}
fs.writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report));
await b.close(); srv.close();
