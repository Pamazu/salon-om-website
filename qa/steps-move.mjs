// The five steps' ways to scroll (task bfbe9e35; J 20 Nov 07:18 Z: "I don't like any of the effects on the 5 steps scroll
// triggered, do something really beautiful and clean, simple and beautfiul and clean. Give more ideas"): A still pictures,
// B sheets, C one room, D into focus, one choice for all five steps in both worlds (mgs_parts.STEP_OPTIONS). Checked in
// WebKit, on M and G, at 1440, a phone and J's 6K window: today's steps untouched until a choice; each choice marks all ten
// steps, keeps each one screen tall and its film's own element; half way between two steps the picture and the words are
// where that way says (read from the page, the snap paused so the page rests there); at rest nothing is left over; calm
// motion gives today's; a link opens on a choice; and the frames through two hand-overs beside today's. A shot of each
// half way, for the eye.   node steps-move.mjs [out] [m,g] [1440,390,3230]
import * as pw from 'playwright'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { serve, open, wait, phone } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-steps-move')); fs.mkdirSync(OUT, { recursive: true });
const VERS = (process.argv[3] || 'm,g').split(','), WIDTHS = (process.argv[4] || '1440,390,3230').split(',');
const WAYS = ['still', 'sheets', 'room', 'focus'], CTX = { 1440: { viewport: { width: 1440, height: 900 } }, 390: phone('webkit'), 3230: { viewport: { width: 3230, height: 1700 }, deviceScaleFactor: 2 } };
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), started: new Date().toISOString(), checks: [], errors: [], frames: {} };
const ok = (name, pass, info) => { res.checks.push({ name, pass: !!pass, info }); console.log(pass ? 'PASS' : 'FAIL', name, info === undefined ? '' : JSON.stringify(info)); };
const near = (a, b, by = 1.5) => Math.abs(a - b) <= by;
// the page at rest at y, its snap paused; release() gives the snap back
// (a rule of its own with !important: mgs.js gives the page's snap back on every scroll, so its inline style cannot hold it)
const hold = (p, y) => p.evaluate((y) => new Promise((done) => { if (!document.getElementById('qa-hold')) { const st = document.createElement('style'); st.id = 'qa-hold'; st.textContent = 'html { scroll-snap-type: none !important; scroll-behavior: auto !important; }'; document.head.appendChild(st); } scrollTo(0, y); requestAnimationFrame(() => requestAnimationFrame(() => done(scrollY))); }), y);
const release = (p) => p.evaluate(() => { const st = document.getElementById('qa-hold'); if (st) st.remove(); });
const tops = (p) => p.evaluate(() => Object.fromEntries([...document.querySelectorAll('main[data-world]:not([hidden]) > .s.ch')].map((s) => [s.id, Math.round(s.getBoundingClientRect().top + scrollY)])));
const all = (p) => p.evaluate(() => [...document.querySelectorAll('main[data-world] > .s.ch')].map((s) => ({ id: s.id, cls: s.className, opt: s.getAttribute('data-opt'), one: Math.abs(s.offsetHeight - innerHeight) <= 1 || s.closest('[hidden]') !== null, film: !!(s.querySelector('video') || {})._qa, soft: !!s.querySelector('.ch__soft'), vars: s.style.getPropertyValue('--in') + s.style.getPropertyValue('--out') })));
const read = (p, ids) => p.evaluate((ids) => { const g = (el) => { if (!el) return null; const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return { top: +r.top.toFixed(1), h: +r.height.toFixed(1), op: +(+cs.opacity).toFixed(3), blur: (cs.filter.match(/blur\(([\d.]+)px\)/) || [0, 0])[1] * 1 }; };
  return Object.fromEntries(ids.map((id) => { const s = document.getElementById(id); return [id, { sec: g(s), rad: parseFloat((getComputedStyle(s).clipPath.match(/round ([\d.]+)px/) || [0, 0])[1]) || 0, media: g(s.querySelector('.s__media')), copy: g(s.querySelector('.s__leave')), soft: g(s.querySelector('.ch__soft')), title: g(s.querySelector('.ch__title')) }]; })); }, ids);
// the frames of a steady scroll from y0 to y1 in ms, the page's own animation frames
// (long: each frame over 50 ms with where it fell, in screens from the start: 0 is the first step at rest, 1 the second)
const walk = (p, y0, y1, ms) => p.evaluate(([y0, y1, ms]) => new Promise((done) => { const g = [], long = [], t0 = performance.now(); let last = 0; (function fr(t) { if (last) { g.push(t - last); if (t - last > 50) long.push([Math.round(t - last), +((scrollY - y0) / innerHeight).toFixed(2)]); } last = t; const k = Math.min(1, (t - t0) / ms); scrollTo(0, y0 + (y1 - y0) * k); if (k < 1) requestAnimationFrame(fr); else { g.sort((a, b) => a - b); done({ n: g.length, worst: Math.round(g[g.length - 1]), p95: Math.round(g[Math.floor(g.length * .95)]), over50: g.filter((x) => x > 50).length, long }); } })(t0); }), [y0, y1, ms]);
const choose = async (p, k) => { await p.evaluate((k) => window.OMOptions.choose('steps', k, false), k); await wait(p, 500); };

// node steps-move.mjs <out> <m,g> <widths> perf: the frames only, each way twice, under three ways of giving the moving parts
// their own layers (as built: the two steps in a hand-over; none; every step that carries a way), and where the long ones fall
if (process.argv[5] === 'perf') {
  const LAYERS = { built: '', none: '.ch--move :is(.s__media, .s__scrim, .s__leave, .ch__soft) { will-change: auto !important; }',
    all: '.ch--move > :is(.s__media, .s__scrim, .s__leave) { will-change: transform, opacity !important; }' };
  res.perf = {};
  for (const v of VERS) for (const w of WIDTHS) {
    const ctx = await b.newContext(CTX[w]), p = await open(ctx, `${base}/${v}/`);
    p.on('pageerror', (e) => res.errors.push(`${v} ${w}: ${e.message}`));
    for (const [lk, rule] of Object.entries(LAYERS)) {
      await p.evaluate((rule) => { let st = document.getElementById('qa-layers'); if (!st) { st = document.createElement('style'); st.id = 'qa-layers'; document.head.appendChild(st); } st.textContent = rule; }, rule);
      for (const k of ['live', ...WAYS]) {
        await choose(p, k); const t = await tops(p);
        for (const run of [1, 2]) { await hold(p, t.arrive); await wait(p, 700); res.perf[`${v} ${w} ${lk} ${k} ${run}`] = await walk(p, t.arrive, t.renew, 2800); }
        await release(p); await wait(p, 300);
        console.log(v, w, lk, k, JSON.stringify(res.perf[`${v} ${w} ${lk} ${k} 1`]), JSON.stringify(res.perf[`${v} ${w} ${lk} ${k} 2`]));
      }
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'perf.json'), JSON.stringify(res, null, 1));
  await b.close(); srv.close(); process.exit(0);
}
for (const v of VERS) for (const w of WIDTHS) {
  const tag = `${v} ${w}`, ctx = await b.newContext(CTX[w]), p = await open(ctx, `${base}/${v}/`);
  p.on('pageerror', (e) => res.errors.push(`${tag}: ${e.message}`));
  await p.evaluate(() => document.querySelectorAll('.s.ch video').forEach((x) => { x._qa = 1; }));
  let s = await all(p);
  ok(`${tag}: today's ten steps until a choice (no way to scroll set, one screen each)`, s.length === 10 && s.every((x) => !/ch--move/.test(x.cls) && x.one && !x.soft && !x.vars), s.map((x) => x.cls));
  const vh = p.viewportSize().height;
  for (const k of ['live', ...WAYS]) {
    if (k !== 'live') {
      await choose(p, k); s = await all(p);
      ok(`${tag}: ${k} marks all ten steps in both worlds, each still one screen, each keeping its film`, s.length === 10 && s.every((x) => x.cls.includes('ch--move-' + k) && x.opt === k && x.one && x.film) && s.every((x) => x.soft === (k === 'focus')), s.map((x) => x.cls.split(' ').pop() + ':' + x.film));
    }
    const t = await tops(p), mid = Math.round((t.arrive + t.unwind) / 2);
    await hold(p, mid); await wait(p, 1500); await p.evaluate(() => scrollBy(0, 1)); await wait(p, 900);
    const m = await read(p, ['arrive', 'unwind']), A = m.arrive, U = m.unwind;
    if (k === 'still') ok(`${tag}: still, half way: both pictures stand at the screen's top, the words travel with their step`, near(A.media.top, 0) && near(U.media.top, 0) && U.copy.top > vh * .5, { a: A.media.top, u: U.media.top, words: U.copy.top });
    if (k === 'sheets') ok(`${tag}: sheets, half way: the last step holds and eases back, the next travels as one sheet with rounded top corners`, near(A.media.top + A.media.h / 2, vh / 2, 3) && A.media.h < vh - 4 && near(U.media.top, U.sec.top) && U.rad >= 18, { a: A.media, u: U.media.top, sec: U.sec.top, rad: U.rad });
    if (k === 'room') ok(`${tag}: one room, half way: both pictures stand still, the next half dissolved in, neither step's words showing`, near(A.media.top, 0) && near(U.media.top, 0) && near(U.media.op, .5, .06) && U.copy.op === 0 && A.copy.op === 0, { a: A.media.top, u: U.media, words: [A.copy.op, U.copy.op] });
    if (k === 'focus') ok(`${tag}: into focus, half way: the next step's picture and title are soft`, U.soft && U.soft.op > .5 && U.title.blur > 3 && near(U.media.top, U.sec.top), { soft: U.soft, title: U.title.blur });
    await p.screenshot({ path: path.join(OUT, `${v}-${w}-${k}-half.jpg`), type: 'jpeg', quality: 76 });
    if (k !== 'live') {
      // calm motion: today's hand-over, whatever the choice
      await p.evaluate(() => { document.documentElement.setAttribute('data-motion', 'calm'); scrollBy(0, -1); }); await wait(p, 900);
      const c = await read(p, ['arrive', 'unwind']);
      ok(`${tag}: ${k} with calm motion is today's hand-over`, near(c.unwind.media.top, c.unwind.sec.top) && c.unwind.media.op === 1 && c.unwind.rad === 0 && (!c.unwind.soft || c.unwind.soft.op === 0 || c.unwind.soft.h === 0) && c.unwind.title.blur === 0 && c.arrive.media.h >= vh - 1, { u: c.unwind.media, rad: c.unwind.rad, soft: c.unwind.soft });
      await p.evaluate(() => { document.documentElement.removeAttribute('data-motion'); scrollBy(0, 1); }); await wait(p, 300);
      // at rest on the next step nothing is left over
      await hold(p, t.unwind); await wait(p, 1300);
      const r = await read(p, ['unwind']);
      ok(`${tag}: ${k} at rest on a step: its picture whole and sharp, its corners square`, near(r.unwind.media.top, 0) && r.unwind.media.op === 1 && r.unwind.rad === 0 && (!r.unwind.soft || r.unwind.soft.op < .02) && r.unwind.title.blur < .2, { u: r.unwind.media, rad: r.unwind.rad, soft: r.unwind.soft, blur: r.unwind.title.blur });
    }
    // the frames through two hand-overs, a steady scroll (the snap paused)
    await hold(p, t.arrive); await wait(p, 600);
    const f = await walk(p, t.arrive, t.renew, 2800); res.frames[`${tag} ${k}`] = f;
    if (k !== 'live') { const today = res.frames[`${tag} live`]; ok(`${tag}: ${k} scrolls through two hand-overs as smoothly as today's steps (95th-percentile frame within 4 ms of today's, at most one more frame over 50 ms)`, f.p95 <= today.p95 + 4 && f.over50 <= today.over50 + 1, { it: f, today }); }
    await release(p); await wait(p, 400);
  }
  await choose(p, 'live'); s = await all(p);
  ok(`${tag}: today's again restores every step (nothing set, no soft picture, the same films)`, s.every((x) => !/ch--move/.test(x.cls) && x.one && !x.soft && !x.vars && x.film), s.map((x) => x.cls));
  await ctx.close();
}
{ const ctx = await b.newContext(CTX[1440]), p = await open(ctx, `${base}/m/?opt-steps=room`); const s = await all(p);
  ok('m 1440: a link with one room opens on it, all ten steps', s.every((x) => x.cls.includes('ch--move-room') && x.opt === 'room'), s.map((x) => x.opt)); await ctx.close(); }
ok('no script errors', res.errors.length === 0, res.errors.slice(0, 8));
res.pass = res.checks.every((c) => c.pass);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 1));
console.log(res.pass ? 'ALL PASS' : 'SOME FAIL', res.checks.filter((c) => !c.pass).length, 'failed of', res.checks.length);
await b.close(); srv.close();
