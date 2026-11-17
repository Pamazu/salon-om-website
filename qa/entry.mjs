// Task b36dde1f (J, 17 Nov: "When you go into that section and scroll, the video is static and doesn't move at all. When
// the image at the top disappears, a few seconds later the video starts reproducing"; approved-features row 16): in each
// step where a film and a gradient mask join a photo, the film moves from the moment the section is on screen, while the
// person scrolls, alongside the photo. For M, G and S at 1440 x 900 and 390 x 844, each step is reached by a wheel swipe
// from the slide before it (a person's stroke, about 750 px/s, never a jump); every 50 ms the page records the section's
// visible height, the film's clock and state and the photo's opacity. Pass: the film's clock has advanced 0.1 s within
// 1.5 s of the section's first visible pixel, the photo is still fully on screen at that moment, and the film still plays once the step is at rest.
//   node run.mjs entry [chromium|webkit] [m,g,s]      (SITE=live checks the live links instead of this checkout; REDUCE, ENTRY_CSS, TAG below)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const BROWSER = process.env.BROWSER || 'chromium', VERS = (process.env.VERS || 'm,g,s').split(',');
const LIVE = { m: 'https://salon-om-2-2-m.web.app/', g: 'https://salon-om-2-2-g.web.app/', s: 'https://salon-om-2-2-s.web.app/' };
// REDUCE=1: the device asks for Reduce Motion, as J's Mac does (the review hosts still play full motion: the motion switch);
// ENTRY_CSS=<css>: a style added after load, to switch one full-motion change off and find what holds a film; TAG names the run
const REDUCE = process.env.REDUCE === '1', CSS = process.env.ENTRY_CSS || '', TAG = process.env.TAG ? '-' + process.env.TAG : '';
const OUT = path.join(HERE, `out-entry-${BROWSER}${TAG}`); fs.mkdirSync(OUT, { recursive: true });
const SIZES = [['1440', { viewport: { width: 1440, height: 900 } }], ['390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }]];
const LIMIT = 1500, EVERY = 40;   // pass within 1.5 s; the swipe: three wheel strokes of a fifth of the window, 40 ms apart
const srv = process.env.SITE === 'live' ? null : await serve(REPO), base = (v) => srv ? `http://127.0.0.1:${srv.address().port}/${v}/` : LIVE[v];
// Playwright's own Chromium has no H.264; Chrome (if installed) plays the films as a person's Chrome does
const b = await pw[BROWSER].launch(BROWSER === 'webkit' && process.env.WEBKIT ? { executablePath: process.env.WEBKIT }
  : BROWSER === 'chromium' && process.env.CHANNEL !== 'none' ? { channel: process.env.CHANNEL || 'chrome' } : {});
console.log(BROWSER, b.version(), srv ? 'this checkout' : 'live');
const res = { browser: BROWSER, version: b.version(), site: srv ? 'checkout' : 'live', reduce: REDUCE, css: CSS || null, started: new Date().toISOString(), runs: [] };
const START = (id) => `(() => { const s = document.getElementById(${JSON.stringify(id)}), v = s.querySelector('.s__zoom > video'), top = s.querySelector('.ch__top');
  const log = window.__entry = []; const t0 = performance.now();
  window.__entryTimer = setInterval(() => { const r = s.getBoundingClientRect(), vh = innerHeight;
    log.push({ t: Math.round(performance.now() - t0), top: Math.round(r.top), vis: Math.max(0, Math.round(Math.min(r.bottom, vh) - Math.max(r.top, 0))),
      ct: Math.round(v.currentTime * 1000) / 1000, paused: v.paused, rs: v.readyState, on: v.classList.contains('is-on'),
      photo: top ? +getComputedStyle(top).opacity : null, active: s.classList.contains('is-active') }); }, 50); })()`;
for (const v of VERS) for (const [w, opt] of SIZES) {
  const ctx = await b.newContext({ ...opt, reducedMotion: REDUCE ? 'reduce' : 'no-preference' }), page = await ctx.newPage(), run = { v, w, steps: [] };
  await page.goto(base(v), { waitUntil: 'load' }); await page.waitForTimeout(1500);
  if (CSS) await page.addStyleTag({ content: CSS });
  const ids = await page.evaluate(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')]
    .filter((s) => s.querySelector('.ch__top') && s.querySelector('.s__zoom > video')).map((s) => s.id));
  await page.mouse.move(opt.viewport.width / 2, opt.viewport.height / 2);
  for (const id of ids) {
    // just above the step (its first pixel 200 px under the window), then let the page come to rest
    await page.evaluate((id) => { const r = document.documentElement; r.style.scrollBehavior = 'auto';
      scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY - innerHeight - 200); r.style.scrollBehavior = ''; }, id);
    await page.waitForTimeout(1200);
    await page.evaluate(START(id));
    // a person's swipe into the step (the slides snap: a slow drag that stops is pulled back, so the swipe is one steady
    // stroke and the page's own snap carries the step in), then 3 s at rest
    for (let k = 0; k < 3; k++) { await page.mouse.wheel(0, Math.round(opt.viewport.height / 5)); await page.waitForTimeout(EVERY); }
    // headless Chromium sometimes pulls a short stroke back; the arrival is then finished as the snap would finish it
    await page.waitForTimeout(700);
    await page.evaluate((id) => { const t = document.getElementById(id).getBoundingClientRect().top; if (Math.abs(t) > 2) scrollTo({ top: scrollY + t, behavior: 'instant' }); }, id);
    await page.waitForTimeout(3000);
    const log = await page.evaluate(() => { clearInterval(window.__entryTimer); return window.__entry; });
    const enter = log.find((s) => s.vis > 0), ct0 = enter ? enter.ct : 0;
    const move = enter && log.find((s) => s.t >= enter.t && s.ct - ct0 >= 0.1 && !s.paused);
    const last = log[log.length - 1] || {}, delay = enter && move ? move.t - enter.t : null;
    // and it is still playing at rest with the step on screen
    const ok = delay !== null && delay <= LIMIT && (move.photo === null || move.photo >= 0.95) && !last.paused && last.vis > 0;
    await page.screenshot({ path: path.join(OUT, `${v}-${w}-${id}.png`) });
    run.steps.push({ id, ok, delay, photoAtMove: move ? move.photo : null, enter, move, log });
    console.log('entry', v, w, id, ok ? 'pass' : 'FAIL', `film moving ${delay === null ? 'never (in ' + (log.length ? log[log.length - 1].t - (enter ? enter.t : 0) : 0) + ' ms)' : delay + ' ms'} after the step came on screen, photo ${move ? move.photo : '-'}, last: paused ${log.length && log[log.length - 1].paused} t ${log.length && log[log.length - 1].ct} rs ${log.length && log[log.length - 1].rs}`);
  }
  res.runs.push(run); fs.writeFileSync(path.join(OUT, 'entry.json'), JSON.stringify(res, null, 1));
  await ctx.close();
}
await b.close(); if (srv) srv.close();
const all = res.runs.flatMap((r) => r.steps.map((s) => s.ok));
// a page whose steps were not found is a failure, never a pass (a Windows WebKit job found none and read 0/0 pass)
const missing = res.runs.filter((r) => !r.steps.length).map((r) => `${r.v} ${r.w}`);
if (missing.length) console.log('entry: FAIL, no step films found on', missing.join(', '));
console.log(`entry: ${all.filter(Boolean).length}/${all.length} pass`);
process.exit(all.length && !missing.length && all.every(Boolean) ? 0 : 1);
