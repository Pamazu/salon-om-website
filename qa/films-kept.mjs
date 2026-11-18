// Nothing lost while films and sounds are let go far away (task 5cb93228). WebKit, this checkout's M/G/S, at 1440 and 390:
//   1. the opening film plays, and keeps looping (or, marked data-stop, slows to stillness)
//   2. a step's film plays on screen, is let go far below, and plays again when the person comes back
//   3. Low Power Mode (every play() refused): the step's film moves as an image on screen, the image is let go far away
//      and is back when the person returns
//   4. Inner Work: its opening film plays and its pictures arrive once the world is shown
//   node films-kept.mjs [m,g,s] [1440,390]      prints one line per case, PASS or FAIL with what failed
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import * as pw from 'playwright'; import { serve, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , VS = 'm,g,s', WS = '1440,390'] = process.argv;
const srv = await serve(REPO); const BASE = `http://127.0.0.1:${srv.address().port}`;
const film = (p, sel) => p.evaluate((sel) => { const v = document.querySelector(sel); if (!v) return null;
  const im = v.parentNode.querySelector('img.film-img');
  return { src: v.getAttribute('src'), t: +v.currentTime.toFixed(2), paused: v.paused, on: v.classList.contains('is-on'), img: !!im, imgOn: !!im && im.classList.contains('is-on') }; }, sel);
const topOf = (p, id) => p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
let bad = 0;
for (const v of VS.split(',')) for (const w of WS.split(',').map(Number)) for (const mode of ['play', 'refused']) {
  const fails = [];
  const b = await pw.webkit.launch();
  const ctx = await b.newContext({ viewport: { width: w, height: w < 700 ? 844 : 900 }, ...(w < 700 ? { isMobile: true, hasTouch: true, deviceScaleFactor: 3 } : {}) });
  await ctx.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  if (mode === 'refused') await ctx.addInitScript(() => { HTMLMediaElement.prototype.play = function () { this.dispatchEvent(new Event('play')); return Promise.reject(new DOMException('refused', 'NotAllowedError')); }; });
  const p = await ctx.newPage(); await p.goto(`${BASE}/${v}/`, { waitUntil: 'load' });
  const H = w < 700 ? 844 : 900;
  if (mode === 'play') {
    // 1. the opening film moves, then stills
    await p.waitForTimeout(1500); const h1 = await film(p, '#top video'); await p.waitForTimeout(1000); const h2 = await film(p, '#top video');
    if (!(h2 && h2.t > h1.t && h2.on)) fails.push(`opening film not moving (${JSON.stringify([h1, h2])})`);
    // a film marked data-stop slows to stillness (2.2's hero); M/G/S mark none, so their opening film keeps looping
    const stops = await p.evaluate(() => !!document.querySelector('#top video[data-stop]'));
    await p.waitForTimeout(6000); const h3 = await film(p, '#top video'); await p.waitForTimeout(800); const h4 = await film(p, '#top video');
    if (stops && !(h4 && h4.paused && h4.t === h3.t)) fails.push(`opening film not still after ~8 s (${JSON.stringify([h3, h4])})`);
    if (!stops && !(h4 && !h4.paused && h4.t > h3.t)) fails.push(`opening film stopped looping (${JSON.stringify([h3, h4])})`);
  }
  // 2/3. the first step with a film: on screen, far below, back
  const step = await p.evaluate(() => { const s = [...document.querySelectorAll('main[data-world="salon"] .s')].find((x) => x.querySelector('video[data-src]') && x.id !== 'top'); return s && s.id; });
  // (S, the short page, carries films only in its two openings, as live: it has no step film to follow)
  if (step) {
  const sel = `#${step} video`, y = await topOf(p, step);
  await jump(p, y); await p.waitForTimeout(3500);
  const a1 = await film(p, sel); await p.waitForTimeout(800); const a2 = await film(p, sel);
  const moving = (x, y2) => mode === 'play' ? (y2.on && y2.t > x.t) : (y2.img && y2.imgOn);
  if (!moving(a1, a2)) fails.push(`${step} film not moving on screen (${JSON.stringify([a1, a2])})`);
  const Ht = await p.evaluate(() => document.documentElement.scrollHeight);
  await jump(p, Math.min(Ht - H, y + 5 * H)); await p.waitForTimeout(1500);
  const far = await film(p, sel);
  if (far.src || far.img) fails.push(`${step} film not let go five screens below (${JSON.stringify(far)})`);
  await jump(p, y); await p.waitForTimeout(3500);
  const b1 = await film(p, sel); await p.waitForTimeout(800); const b2 = await film(p, sel);
  if (!moving(b1, b2)) fails.push(`${step} film not moving again after coming back (${JSON.stringify([b1, b2])})`);
  }
  if (mode === 'play') {
    // 4. Inner Work: its opening film and pictures
    await jump(p, 0); await p.waitForTimeout(500); await toWorld(p, 'coaching'); await p.waitForTimeout(1500);
    const c = await p.evaluate(() => { const m = document.querySelector('main[data-world="coaching"]'); const v = m.querySelector('.s video[data-src]');
      const ims = [...m.querySelectorAll('img')].filter((i) => { const r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; });
      return { film: v && { src: v.getAttribute('src'), t: v.currentTime, on: v.classList.contains('is-on') }, shown: ims.length, loaded: ims.filter((i) => i.complete && i.naturalWidth > 0).length }; });
    if (!(c.film && c.film.src && c.film.t > 0)) fails.push(`Inner Work opening film not playing (${JSON.stringify(c.film)})`);
    if (c.loaded < c.shown) fails.push(`Inner Work pictures on screen not loaded (${c.loaded}/${c.shown})`);
  }
  console.log(`${v} ${w} ${mode} ${fails.length ? 'FAIL: ' + fails.join(' | ') : 'PASS'}`); bad += fails.length > 0;
  await ctx.close(); await b.close();
}
srv.close(); process.exit(bad ? 1 : 0);
