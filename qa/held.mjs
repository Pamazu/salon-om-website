// Task b36dde1f: Low Power Mode, simulated as Safari does it on J's MacBook (measured 17 Nov): every film's play() is refused
// (NotAllowedError) until the person clicks or presses a key; scrolling never counts. For M, G and S at 1440 x 900 and
// 390 x 844: the hero's frame and every step film's frame are marked is-held and their photo drifts (its transform moves
// between 1.5 s and 6 s after arriving, no jump at the start), each step film is laid in as its moving image (<img> of the
// film, which Safari plays in Low Power Mode: task b36dde1f), and a key press then starts the film (playing, is-on).
//   node run.mjs held [chromium|webkit] [m,g,s]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const BROWSER = process.env.BROWSER || 'chromium', VERS = (process.env.VERS || 'm,g,s').split(',');
const OUT = path.join(HERE, `out-held-${BROWSER}`); fs.mkdirSync(OUT, { recursive: true });
const SIZES = [['1440', { viewport: { width: 1440, height: 900 } }], ['390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true }]];
const srv = await serve(REPO), port = srv.address().port;
const b = await pw[BROWSER].launch(BROWSER === 'webkit' && process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
console.log(BROWSER, b.version());
const res = { browser: BROWSER, started: new Date().toISOString(), runs: [] };
const frame = (sel) => `(() => { const v = document.querySelector(${JSON.stringify(sel)}); if (!v) return null; const f = v.closest('.ch__top, .s__zoom'), img = f && f.querySelector('img');
  const top = f && f.querySelector(':scope > .ch__top > img');
  const im = f && f.querySelector('.film-img'); return { stop: v.hasAttribute('data-stop'), img: im ? im.getAttribute('src') === v.getAttribute('data-src') : false, held: !!(f && f.classList.contains('is-held')), tf: img ? getComputedStyle(img).transform : null, topTf: top ? getComputedStyle(top).transform : null, paused: v.paused, on: v.classList.contains('is-on'), t: Math.round(v.currentTime * 100) / 100 }; })()`;
for (const v of VERS) for (const [w, opt] of SIZES) {
  const ctx = await b.newContext(opt);
  await ctx.addInitScript(() => {
    const p0 = HTMLMediaElement.prototype.play; let unlocked = false;
    for (const ev of ['click', 'keydown', 'touchend']) addEventListener(ev, () => { unlocked = true; }, true);
    HTMLMediaElement.prototype.play = function () {
      if (!unlocked) return Promise.reject(new DOMException('refused: Low Power Mode, simulated', 'NotAllowedError'));
      return p0.apply(this, arguments);
    };
  });
  const page = await ctx.newPage(), run = { v, w, films: [] };
  await page.goto(`http://127.0.0.1:${port}/${v}/`, { waitUntil: 'load' });
  // the hero at the top, then each step film as a person arrives at it (instant scroll, no gesture)
  const targets = [{ id: 'top', sel: '#top video' }].concat(await page.evaluate(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')]
    .filter((s) => s.querySelector('.ch__top') && s.querySelector('.s__zoom > video')).map((s) => ({ id: s.id, sel: `#${s.id} .s__zoom > video` }))));
  for (const t of targets) {
    if (t.id !== 'top') await page.evaluate((id) => { const r = document.documentElement; r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none';
      scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY); requestAnimationFrame(() => { r.style.scrollSnapType = ''; r.style.scrollBehavior = ''; }); }, t.id);
    await page.waitForTimeout(1500); const a = await page.evaluate(frame(t.sel));
    await page.screenshot({ path: path.join(OUT, `${v}-${w}-${t.id}-1.5s.png`) });
    await page.waitForTimeout(4500); const z = await page.evaluate(frame(t.sel));
    await page.screenshot({ path: path.join(OUT, `${v}-${w}-${t.id}-6s.png`) });
    // a refused film is laid in as its moving image (mgs.js asImage; Safari plays it, Chromium cannot show it); a film that
    // slows to a stillness (data-stop) keeps only its drifting photo
    const ok = !!(a && z && z.held && a.tf && z.tf && a.tf !== z.tf && z.paused && (z.topTf === null || z.topTf === z.tf) && z.img === !z.stop);
    run.films.push({ id: t.id, ok, a, z });
    console.log('held', v, w, t.id, ok ? 'pass' : 'FAIL', `held ${z && z.held} image ${z && z.img} drift ${a && a.tf} -> ${z && z.tf} paused ${z && z.paused}`);
  }
  // the person presses a key: the film on screen starts and fades in
  const last = targets[targets.length - 1];
  await page.keyboard.press('Shift'); await page.waitForTimeout(2500);
  const k = await page.evaluate(frame(last.sel));
  run.key = { id: last.id, ok: !!(k && !k.paused && k.t > 0.3 && k.on), k };
  console.log('key', v, w, last.id, run.key.ok ? 'pass' : 'FAIL', `paused ${k && k.paused} t ${k && k.t} on ${k && k.on}`);
  await page.screenshot({ path: path.join(OUT, `${v}-${w}-${last.id}-after-key.png`) });
  res.runs.push(run); fs.writeFileSync(path.join(OUT, 'held.json'), JSON.stringify(res, null, 1));
  await ctx.close();
}
await b.close(); srv.close();
const all = res.runs.flatMap((r) => r.films.map((f) => f.ok).concat([r.key.ok]));
console.log(`held: ${all.filter(Boolean).length}/${all.length} pass`);
