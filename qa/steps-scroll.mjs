// The five steps' scroll options (task 5cf1107e; J 19 Nov 18:15 Z: "Have different options for the group of 5 sections. One
// in which we play with scroll to switch between the nature video and the other video ... Just like in the take a breath
// section we play with scroll"). In WebKit, on M and G, at 1440, 3230 and 390: today's steps are unchanged while nothing is
// chosen; Shift+V on a step (the handle on a phone) lists "The five steps" with today's and B, C, D; one choice switches all
// five steps in both worlds and keeps each step's own film element (its loading and playing carry on); through each option
// the step stays on screen while its photo hands over to its film (the photo whole at the start, the film alone at the end,
// half way between), and the film keeps moving; Inner Work's steps the same; a link opens on the choice (the sheet's ribs
// drawn); calm motion keeps the photo on one screen; frames while scrolling through a step, today's and each option's; back
// to today's restores every step. Writes <out>/result.json and screenshots.
//   node steps-scroll.mjs [out] [m,g] [1440,3230,390]
import * as pw from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve, jump, wait, toWorld } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-steps')); fs.mkdirSync(OUT, { recursive: true });
const VS = (process.argv[3] || 'm,g').split(','), WS = (process.argv[4] || '1440,3230,390').split(',').map(Number);
const KS = ['breath', 'fade', 'sheet'];
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), started: new Date().toISOString(), checks: [], frames: [], errors: [] };
const ok = (name, pass, info) => { res.checks.push({ name, pass: !!pass, info }); console.log(pass ? 'PASS' : 'FAIL', name, info === undefined ? '' : JSON.stringify(info)); };
const shot = (p, name) => p.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 76 });
const H = (w) => w < 700 ? 844 : w > 2000 ? Math.round(w * 9 / 16) : 900;
const ctxFor = (w, extra = {}) => b.newContext({ viewport: { width: w, height: H(w) }, deviceScaleFactor: w < 700 ? 3 : 2, ...(w < 700 ? { isMobile: true, hasTouch: true } : {}), ...extra });
async function page(ctx, url, tag) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => res.errors.push(`${tag}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|play\(\)|NotAllowedError|AbortError/.test(m.text())) res.errors.push(`${tag}: ${m.text()}`); });
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' }); await wait(p, 1500);
  return p;
}
// every step section of both worlds: its class, whether it holds the sticky frame, its height against the screen, its film
const steps = (p) => p.evaluate(() => [...document.querySelectorAll('main .s.ch.ch--stack')].map((s) => ({ id: s.id, cls: s.className.replace(/\s*is-active/, ''),
  stick: !!s.querySelector(':scope > .ch__stick'), h: s.offsetHeight / innerHeight, film: (s.querySelector('video[data-src]') || {}).__id })));
// where the reader is in one step: its handover (--e), the frame's top, what shows of the photo, and the film's clock
const at = (p, id) => p.evaluate((id) => { const s = document.getElementById(id), st = s.querySelector('.ch__stick'), top = s.querySelector('.ch__top'), v = s.querySelector('video[data-src]');
  const ribs = [...s.querySelectorAll('.ch__ribs i')], cs = getComputedStyle(s);
  return { e: cs.getPropertyValue('--e').trim() || null, stickTop: st ? Math.round(st.getBoundingClientRect().top) : null,
    topOpacity: top ? +getComputedStyle(top).opacity : null, imgOpacity: top ? +getComputedStyle(top.querySelector('img')).opacity : null,
    filmClip: v ? getComputedStyle(v).clipPath : null, ribs: ribs.length, ribsOn: ribs.filter((r) => +getComputedStyle(r).opacity > .02).length,
    ribsDrawn: ribs.filter((r) => /url\(/.test(r.style.backgroundImage)).length, t: v ? v.currentTime : null, playing: v ? !v.paused : null }; }, id);
// frames over a scripted scroll through a step (the same speed for every case): gaps between frames, the worst, and over 50 ms
async function frames(p, id, w) {
  const { top, span } = await p.evaluate((id) => { const s = document.getElementById(id); return { top: s.offsetTop, span: Math.max(innerHeight, s.offsetHeight - innerHeight) }; }, id);
  await jump(p, top - 40); await wait(p, 800);
  return p.evaluate(async ([y0, dy]) => {
    const r = document.documentElement, sn = r.style.scrollSnapType; r.style.scrollSnapType = 'none'; r.style.scrollBehavior = 'auto';
    const gaps = []; let last = 0;
    await new Promise((done) => { const t0 = performance.now(); (function f(t) { if (last) gaps.push(t - last); last = t; const k = Math.min(1, (t - t0) / 2400); scrollTo(0, y0 + dy * k); if (k < 1) requestAnimationFrame(f); else done(); })(t0); });
    r.style.scrollSnapType = sn; gaps.sort((a, b) => a - b);
    return { n: gaps.length, worst: Math.round(gaps[gaps.length - 1]), p95: Math.round(gaps[Math.floor(gaps.length * .95)]), over50: gaps.filter((g) => g > 50).length };
  }, [top - 40, span + 80]);
}
const choose = async (p, w, k) => {
  // the person's way: Shift+V (the handle on a phone), the option's row, Shift+V again
  if (w < 700) { await p.tap('.opt-handle'); await wait(p, 500); await p.tap(`#opt-panel .opt__row[data-key="steps"][data-k="${k}"]`); await wait(p, 900); await p.tap('.opt-handle'); }
  else { await p.keyboard.press('Shift+V'); await wait(p, 500); await p.click(`#opt-panel .opt__row[data-key="steps"][data-k="${k}"]`); await wait(p, 900); await p.keyboard.press('Shift+V'); }
  await wait(p, 600);
};
for (const v of VS) for (const w of WS) {
  const tag = `${v} ${w}`, ctx = await ctxFor(w), p = await page(ctx, `${base}/${v}/?review`, tag);
  await p.evaluate(() => document.querySelectorAll('main .s.ch video[data-src]').forEach((x, i) => { x.__id = i; }));
  const s0 = await steps(p);
  ok(`${tag}: today's five steps in both worlds, unchanged (no scroll frame, one screen each)`, s0.length === 10 && s0.every((s) => !/ch--scroll/.test(s.cls) && !s.stick && Math.abs(s.h - 1) < .01), s0.map((s) => s.id + ':' + s.h.toFixed(2)));
  const top1 = await p.evaluate(() => document.getElementById('arrive').offsetTop);
  await jump(p, top1); await wait(p, 900);
  if (w < 700) { await p.tap('.opt-handle'); } else { await p.keyboard.press('Shift+V'); }
  await wait(p, 700);
  const pn = await p.evaluate(() => { const pn = document.getElementById('opt-panel'); return { sec: pn.querySelector('.opt__sec').textContent, rows: [...pn.querySelectorAll('.opt__row')].map((r) => r.textContent.trim().slice(0, 40)), on: (pn.querySelector('.opt__row[aria-checked="true"]') || {}).textContent }; });
  ok(`${tag}: the panel on a step offers the five steps' options, today's chosen`, pn.sec === 'The five steps' && pn.rows.length === 4 && /^1Today/.test(pn.rows[0]) && /^1Today/.test(pn.on || ''), pn);
  await shot(p, `${v}-${w}-panel`);
  if (w < 700) await p.tap('.opt-handle'); else await p.keyboard.press('Shift+V');
  await wait(p, 500);
  const f0 = await frames(p, 'arrive', w); res.frames.push({ v, w, k: 'live', ...f0 });
  for (const k of KS) {
    await jump(p, top1); await wait(p, 700);
    await choose(p, w, k);
    const s1 = await steps(p), url = await p.evaluate(() => location.search);
    ok(`${tag}: ${k} switches all five steps in both worlds, each keeping its own film`, s1.length === 10 && s1.every((s) => s.cls.includes('ch--scroll-' + k) && s.stick && s.film !== undefined) && s1.every((s, i) => s.film === s0[i].film), s1.map((s) => s.id + ':' + s.h.toFixed(2) + ':' + s.film));
    ok(`${tag}: ${k} is in the address`, url.includes('opt-steps=' + k), url);
    const { top, span } = await p.evaluate(() => { const s = document.getElementById('arrive'); return { top: s.offsetTop, span: s.offsetHeight - innerHeight }; });
    const pts = {};
    for (const [n, f] of [['start', 0], ['mid', .5], ['end', 1]]) { await jump(p, top + Math.round(span * f)); await wait(p, n === 'start' ? 900 : 1300); pts[n] = await at(p, 'arrive'); await shot(p, `${v}-${w}-${k}-${n}`); }
    const E = (x) => x.e === null ? 0 : +x.e;
    const photoWhole = (x) => k === 'fade' ? x.topOpacity > .99 : k === 'sheet' ? x.imgOpacity > .99 && x.ribsOn === 0 || x.imgOpacity > .99 : E(x) === 0;
    ok(`${tag}: ${k} starts on the photo, whole`, E(pts.start) === 0 && photoWhole(pts.start), pts.start);
    ok(`${tag}: ${k} holds the step on screen half way, mid-handover`, pts.mid.stickTop === 0 && E(pts.mid) > .2 && E(pts.mid) < .8, pts.mid);
    const filmAlone = (x) => E(x) === 1 && (k === 'fade' ? x.topOpacity < .01 : k === 'sheet' ? x.imgOpacity < .01 && x.ribsOn === 0 : /inset\(0(px|%)? ?/.test(x.filmClip || '') || /^inset\(0/.test(x.filmClip || ''));
    ok(`${tag}: ${k} ends on the film alone, still held`, filmAlone(pts.end) && pts.end.stickTop === 0, pts.end);
    ok(`${tag}: ${k}: the film moves through the handover`, pts.end.playing && pts.end.t > pts.mid.t && pts.mid.t > 0, [pts.start.t, pts.mid.t, pts.end.t]);
    if (k === 'sheet') ok(`${tag}: the sheet's ribs are drawn from the photo`, pts.mid.ribs === 18 && pts.mid.ribsDrawn === 18, pts.mid);
    const fk = await frames(p, 'arrive', w); res.frames.push({ v, w, k, ...fk });
    ok(`${tag}: ${k} scrolls through a step without a frame over 100 ms, no more long frames than today's`, fk.worst <= 100 && fk.over50 <= f0.over50 + 1, { today: f0, [k]: fk });
  }
  // Inner Work's steps, on the last option
  await toWorld(p, 'coaching');
  const ct = await p.evaluate(() => { const s = document.getElementById('c-arrive'); return { top: s.offsetTop, span: s.offsetHeight - innerHeight }; });
  await jump(p, ct.top + Math.round(ct.span * .5)); await wait(p, 1400);
  const cm = await at(p, 'c-arrive');
  ok(`${tag}: Inner Work's step hands over the same way`, cm.stickTop === 0 && +cm.e > .2 && +cm.e < .8, cm);
  await shot(p, `${v}-${w}-coaching-sheet-mid`);
  await toWorld(p, 'salon');
  // back to today's
  await jump(p, top1); await wait(p, 700);
  await choose(p, w, 'live');
  const s2 = await steps(p);
  ok(`${tag}: today's again restores every step (no frame, one screen, the same films)`, s2.every((s, i) => !/ch--scroll/.test(s.cls) && !s.stick && Math.abs(s.h - 1) < .01 && s.film === s0[i].film), s2.map((s) => s.id + ':' + s.h.toFixed(2)));
  ok(`${tag}: today's leaves the address clean`, !(await p.evaluate(() => location.search)).includes('opt-steps'));
  await ctx.close();
}
// a link opens on the choice; calm motion keeps the photo on one screen
{
  const w = 1440, ctx = await ctxFor(w), p = await page(ctx, `${base}/m/?review&opt-steps=sheet`, 'm link');
  const s = await steps(p);
  ok('m 1440: a link with the sheet opens on it, all five steps', s.every((x) => x.cls.includes('ch--scroll-sheet') && x.stick), s.map((x) => x.cls));
  const top = await p.evaluate(() => document.getElementById('renew').offsetTop);
  await jump(p, top + 400); await wait(p, 1400);
  const a = await at(p, 'renew');
  ok('m 1440: its ribs are drawn from the photo', a.ribs === 18 && a.ribsDrawn === 18, a);
  await ctx.close();
  const c2 = await ctxFor(w, { reducedMotion: 'reduce' }), p2 = await page(c2, `${base}/m/?review&opt-steps=breath`, 'm calm');
  const s2 = await steps(p2);
  const t2 = await p2.evaluate(() => document.getElementById('arrive').offsetTop); await jump(p2, t2); await wait(p2, 1200);
  const a2 = await at(p2, 'arrive');
  ok('m 1440, reduced motion: the steps stay one screen each and show the photo', s2.every((x) => Math.abs(x.h - 1) < .01) && (a2.e === null || +a2.e === 0) && a2.topOpacity > .99, { h: s2.map((x) => x.h.toFixed(2)), a2 });
  await shot(p2, 'm-1440-calm-breath');
  await c2.close();
}
ok('no script errors', res.errors.length === 0, res.errors.slice(0, 8));
res.pass = res.checks.every((c) => c.pass);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 2));
console.log(res.pass ? 'ALL PASS' : 'SOME FAIL', res.checks.filter((c) => !c.pass).length, 'failed of', res.checks.length);
await b.close(); srv.close();
