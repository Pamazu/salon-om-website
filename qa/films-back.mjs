// QA tool (task c4360b88): the films are back on M, G and S. For each version and size, in WebKit (Safari's engine), every section
// that has a film is arrived at the way a visitor does; 7 s later the film's clock has advanced and it is not paused, and the step's
// words (title, meta, body, specs) are clear of the rail (no box overlaps a rail link) and inside the viewport.
//   node films-back.mjs <m|g|s,...> <outdir>      -> films-back.json + one shot per film section and size
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERS = (process.argv[2] || 'm,g,s').split(','), OUT = process.argv[3] || 'out-films-back'; fs.mkdirSync(OUT, { recursive: true });
const SIZES = [['1440', { viewport: { width: 1440, height: 900 } }], ['390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]];
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(); const res = { browser: 'webkit ' + b.version(), runs: [] };
const rect = (r) => ({ l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) });
for (const [sz, opt] of SIZES) for (const v of VERS) {
  const ctx = await b.newContext(opt); const errs = [];
  ctx.on('page', (pg) => { pg.on('pageerror', (e) => errs.push(e.message.slice(0, 160))); pg.on('requestfailed', (r) => errs.push('failed ' + r.url().slice(-70))); });
  const p = await open(ctx, `${base}/${v}/`);
  const run = { v, sz, films: [], errs };
  for (const w of ['salon', 'coaching']) {
    if (w === 'coaching') await toWorld(p, 'coaching');
    const ids = await p.evaluate((w) => [...document.querySelectorAll(`#main-${w} > section.s`)].filter((s) => s.querySelector('video')).map((s) => s.id), w);
    for (const id of ids) {
      const y = await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY), id);
      await jump(p, y); await wait(p, 1600);
      const read = () => p.evaluate((id) => { const s = document.getElementById(id);
        return [...s.querySelectorAll('video')].map((vd) => ({ src: (vd.currentSrc || vd.getAttribute('data-src') || '').split('/').pop(), t: +vd.currentTime.toFixed(2), paused: vd.paused, rs: vd.readyState, err: vd.error ? vd.error.code : 0, stop: vd.getAttribute('data-stop') })); }, id);
      const a = await read(); await wait(p, 5400); const c = await read();
      const words = await p.evaluate((id) => { const s = document.getElementById(id), rail = document.getElementById('rail'), vw = innerWidth, vh = innerHeight;
        const R = (e) => e.getBoundingClientRect(), vis = (e) => { const r = R(e), cs = getComputedStyle(e); return r.width > 2 && r.height > 2 && cs.visibility !== 'hidden' && +cs.opacity > 0.05; };
        const rr = rail && getComputedStyle(rail).display !== 'none' && +getComputedStyle(rail).opacity > 0.05 ? [...rail.querySelectorAll('a')].filter(vis).map((e) => ({ t: e.textContent.slice(0, 14), r: R(e) })) : [];
        const rb = rail ? R(rail) : null;
        const tx = [...s.querySelectorAll('.ch__title,.ch__meta,.ch__body,.ch__specs,.hero__hook,.hero__line,.hero__cta,.hero__foot')].filter(vis);
        const hits = []; for (const e of tx) { const r = R(e); for (const a of rr) { const q = a.r; if (r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top) hits.push(e.className.toString().slice(0, 18) + ' x rail ' + a.t); }
          if (r.right > vw + 1 || r.left < -1) hits.push(e.className.toString().slice(0, 18) + ' off-screen'); }
        return { rail: rb ? { l: Math.round(rb.left), t: Math.round(rb.top), r: Math.round(rb.right), b: Math.round(rb.bottom), links: rr.length } : null, texts: tx.length, hits }; }, id);
      const moved = c.map((x, i) => ({ ...x, t0: a[i] ? a[i].t : null, moving: !x.paused && a[i] && x.t > a[i].t + 1 }));
      run.films.push({ w, id, videos: moved, words });
      await p.screenshot({ path: path.join(OUT, `${v}-${sz}-${w}-${id}.jpg`), type: 'jpeg', quality: 82 });
    }
  }
  res.runs.push(run);
  const bad = run.films.filter((f) => f.videos.some((x) => !x.moving && !x.stop) || f.words.hits.length);
  console.log(v, sz, 'films', run.films.length, 'not moving/overlap:', bad.map((f) => `${f.w}:${f.id} ` + JSON.stringify(f.videos.map((x) => [x.t0, x.t, x.paused, x.rs, x.err])) + ' ' + f.words.hits.join(';')).join(' | ') || 'none', 'errs', errs.length);
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'films-back.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
