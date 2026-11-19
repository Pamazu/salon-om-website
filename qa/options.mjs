// The option switcher (task e5325977): Shift+V shows the panel, it follows the section on screen, each of the pause's options
// swaps in place in both worlds, the address and this browser keep the choice, a link opens on it, Shift+V hides the panel,
// the page's own options (the world switch) still switch, the phone's handle opens it, and B scrolls through with the page's
// snap on. WebKit (WEBKIT=<path> for the pool's pinned build). Writes <out>/result.json and screenshots.
//   node options.mjs [out]
import * as pw from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, jump, wait, toWorld } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-options')); fs.mkdirSync(OUT, { recursive: true });
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), started: new Date().toISOString(), checks: [], errors: [] };
const ok = (name, pass, info) => { res.checks.push({ name, pass: !!pass, info }); console.log(pass ? 'PASS' : 'FAIL', name, info === undefined ? '' : JSON.stringify(info)); };
const shot = (p, name) => p.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 78 });

async function page(ctx, url, tag) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => res.errors.push(`${tag}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|play\(\)|NotAllowedError|AbortError/.test(m.text())) res.errors.push(`${tag}: ${m.text()}`); });
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' }); await wait(p, 1500);
  return p;
}
const state = (p) => p.evaluate(() => {
  const pn = document.getElementById('opt-panel'), q = (s) => document.getElementById(s);
  return { open: !!pn && !pn.hidden, sec: pn && pn.querySelector('.opt__sec') ? pn.querySelector('.opt__sec').textContent : null,
    rows: pn ? [...pn.querySelectorAll('.opt__row')].map((r) => r.textContent.trim()) : [], on: pn ? (pn.querySelector('.opt__row[aria-checked="true"]') || {}).textContent : null,
    pause: q('pause') && q('pause').getAttribute('data-opt'), cpause: q('c-pause') && q('c-pause').getAttribute('data-opt'),
    url: location.search, ls: Object.keys(localStorage).filter((k) => k.indexOf('om-opt-') === 0).map((k) => k + '=' + localStorage.getItem(k)),
    letters: q('pause') ? q('pause').querySelectorAll('[data-write] .l').length : 0, sw: document.documentElement.getAttribute('data-switch') };
});
const toPause = async (p, id = 'pause') => { await jump(p, await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id)); await wait(p, 700); };

for (const v of ['m', 'g', 's']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await page(ctx, `${base}/${v}/`, `${v}-1440`);
  ok(`${v}: a review page`, await p.evaluate(() => document.documentElement.hasAttribute('data-review')));
  ok(`${v}: hidden until Shift+V`, !(await state(p)).open);
  await p.keyboard.press('Shift+V'); await wait(p, 500);
  let s = await state(p);
  ok(`${v}: Shift+V shows the panel`, s.open, s.sec);
  await shot(p, `${v}-1440-hero-panel`);
  // the page's own options: the world switch next.js cycled
  await p.click('#opt-panel [data-v="a"]'); await wait(p, 400); s = await state(p);
  ok(`${v}: world switch to the pill`, s.sw === 'a' && /switch=a/.test(s.url), { sw: s.sw, url: s.url });
  await p.click('#opt-panel [data-v="b"]'); await wait(p, 400); s = await state(p);
  ok(`${v}: world switch back to its default, address clean`, s.sw === 'b' && !/switch=/.test(s.url), { sw: s.sw, url: s.url });
  if (!(await p.$('#pause[data-opt-key]'))) {
    await p.keyboard.press('Shift+V'); await wait(p, 500);
    ok(`${v}: Shift+V again hides it`, !(await state(p)).open); await ctx.close(); continue;
  }
  // from the hero, the panel offers to go to the sections that have options
  await p.click('#opt-panel [data-go="pause"]'); await wait(p, 2200); s = await state(p);
  ok(`${v}: it follows the section on screen`, s.sec === 'The pause' && s.rows.length === 5, { sec: s.sec, rows: s.rows });
  await shot(p, `${v}-1440-pause-live`);
  for (const k of ['door', 'room', 'breath', 'cinema']) {
    await toPause(p);
    await p.click(`#opt-panel [data-k="${k}"]`); await wait(p, 4200); s = await state(p);
    ok(`${v}: pause -> ${k}, both worlds, in the address and this browser`, s.pause === k && s.cpause === k && s.url.includes(`opt-pause=${k}`) && s.ls.some((x) => x.endsWith('opt-pause=' + k)) && s.letters > 0,
      { pause: s.pause, cpause: s.cpause, url: s.url, letters: s.letters, on: s.on });
    if (k === 'breath') {
      // with the page's snap on, the wheel moves through it (it must not jump past it)
      const top = await p.evaluate(() => document.getElementById('pause').getBoundingClientRect().top + scrollY);
      const h = await p.evaluate(() => document.getElementById('pause').offsetHeight);
      await jump(p, top); await wait(p, 900); await p.mouse.move(720, 450);
      const ys = [];
      for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 260); await wait(p, 420); ys.push(Math.round(await p.evaluate(() => scrollY - document.getElementById('pause').offsetTop))); }
      ok(`${v}: B scrolls through with the snap on`, ys[ys.length - 1] > 0 && ys.some((y) => y > 0 && y < h - 900), { h, ys });
      for (const f of [0, .3, .62, .97]) { await jump(p, top + (h - 900) * f); await wait(p, 1300); await shot(p, `${v}-1440-pause-breath-${Math.round(f * 100)}`); }
      const cls = await p.evaluate(() => document.getElementById('pause').className); ok(`${v}: B rests at its end`, /is-rest/.test(cls), cls);
      await toPause(p);
    }
    await wait(p, 600); await shot(p, `${v}-1440-pause-${k}`);
  }
  // a link opens on the option; this browser remembers it without the link
  const p2 = await page(ctx, `${base}/${v}/?opt-pause=cinema`, `${v}-link`); s = await state(p2);
  ok(`${v}: a link opens on its option`, s.pause === 'cinema' && s.cpause === 'cinema' && s.letters > 0, { pause: s.pause, letters: s.letters });
  await p2.close();
  const p3 = await page(ctx, `${base}/${v}/`, `${v}-memory`); s = await state(p3);
  ok(`${v}: this browser remembers it`, s.pause === 'cinema', { pause: s.pause, ls: s.ls });
  await p3.evaluate(() => window.OMOptions.choose('pause', 'live', false)); await wait(p3, 300); s = await state(p3);
  ok(`${v}: today's version again, address and memory clean`, s.pause === 'live' && !s.url.includes('opt-pause') && !s.ls.some((x) => x.includes('opt-pause')), s);
  await p3.close();
  // Inner Work: the same options in its own words
  await toWorld(p, 'coaching'); await toPause(p, 'c-pause'); s = await state(p);
  ok(`${v}: Inner Work's pause lists the same options`, s.open && s.rows.length === 5, { sec: s.sec });
  await p.click('#opt-panel [data-k="door"]'); await wait(p, 4200); await shot(p, `${v}-1440-iw-pause-door`);
  await p.click('#opt-panel [data-k="room"]'); await wait(p, 4200); await shot(p, `${v}-1440-iw-pause-room`);
  await p.click('#opt-panel [data-k="live"]'); await wait(p, 1200);
  await p.keyboard.press('Shift+V'); await wait(p, 500);
  ok(`${v}: Shift+V again hides it`, !(await state(p)).open);
  await ctx.close();
}

// the phone: a handle opens it; each option drawn at 390
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await page(ctx, `${base}/m/`, 'm-390');
  const hv = await p.evaluate(() => { const h = document.querySelector('.opt-handle'); return h ? getComputedStyle(h).display : 'none'; });
  ok('m 390: the handle shows on a phone', hv !== 'none', hv);
  await p.tap('.opt-handle'); await wait(p, 500); let s = await state(p);
  ok('m 390: the handle opens the panel', s.open, s.sec);
  await toPause(p); s = await state(p); ok('m 390: the panel follows to the pause', s.sec === 'The pause', s.sec);
  await shot(p, 'm-390-pause-live-panel');
  for (const k of ['door', 'room', 'breath', 'cinema']) {
    await toPause(p); await p.tap(`#opt-panel [data-k="${k}"]`); await wait(p, 600);
    await p.tap('.opt-handle'); await wait(p, 4000);
    if (k === 'breath') { const h = await p.evaluate(() => document.getElementById('pause').offsetHeight); const top = await p.evaluate(() => document.getElementById('pause').offsetTop); await jump(p, top + (h - 844) * .97); await wait(p, 1400); }
    const wide = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(`m 390: ${k} fits the phone`, wide <= 390, wide);
    await shot(p, `m-390-pause-${k}`);
    await p.tap('.opt-handle'); await wait(p, 500);
  }
  await ctx.close();
}
ok('no script errors', res.errors.length === 0, res.errors.slice(0, 8));
res.pass = res.checks.every((c) => c.pass);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 2));
console.log(res.pass ? 'ALL PASS' : 'SOME FAIL', res.checks.filter((c) => !c.pass).length, 'failed of', res.checks.length);
await b.close(); srv.close();
