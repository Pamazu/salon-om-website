// Salon OM M/G/S round 4 QA (task 2846db82), in Safari's engine (WebKit) by default, Chromium with BROWSER=chromium.
// Serves this commit's built pages on loopback like record.mjs (/m/, /g/, /s/ over option-2.2/site's assets) and writes
// to qa/out-<browser>/:
//   shots   every section of both worlds as the visitor sees it, at 1440 x 900 and 390 x 844 (and 1366 x 768 on G):
//           <v>-<world>-<id>-<w>.jpg, plus <...>-end.jpg at the bottom of a section taller than the window.
//           bar.json: per shot, whether the floating "Book your visit · Begin" bar shows and whether text sits under it.
//   snap    the calm snapping around tall sections, measured after each move: snap.json and snap-*.jpg stills.
//   visit   a person's walk down the salon world, this commit's pages against VISIT_BEFORE's: visit.json (task b36dde1f)
//   end     the page's end, walked (task d9a90616): the last two slides of each world, into the last and back: end.json, end-*.jpg
//   ONLY=shots|snap (default both), VERS=m,g,s; WEBKIT=<launcher> (sDelegate's WebKit asset) instead of Playwright's own
//   QUERY=opt-deeper=photo: shots and end open the pages on that address (a section's option, as a shared link does)
//   npm i && npx playwright install webkit && node r4.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve as serveRepo, wait, open, toWorld, jump, SIZES, tall, pullWalk, io, STEPS, wheel, edgesOf } from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.env.BROWSER || 'webkit';
const OUT = path.join(REPO, 'qa', `out-${BROWSER}`);
const ONLY = process.env.ONLY || 'shots,snap';
const VERS = (process.env.VERS || 'm,g,s').split(',');
const QUERY = process.env.QUERY || '', QTAG = QUERY ? '-' + QUERY.replace(/[^a-z0-9]+/gi, '-') : '';
fs.mkdirSync(OUT, { recursive: true });
const serve = () => serveRepo(REPO);

const DESK = { viewport: { width: 1440, height: 900 } };
const LAP = { viewport: { width: 1366, height: 768 } };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: BROWSER !== 'firefox', hasTouch: true };
const WAIT = +(process.env.WAIT || 5000);

const barState = (p) => p.evaluate(() => {
  const w = document.documentElement.getAttribute('data-world') || 'salon', bars = [...document.querySelectorAll('.wdoor')];
  const b = w === 'coaching' ? (bars[1] || bars[0]) : bars[0];
  if (!b) return { bar: 'none' };
  const cs = getComputedStyle(b), shown = cs.display !== 'none' && +cs.opacity > .5, r = b.getBoundingClientRect();
  let under = [];
  if (shown) {
    for (let i = 0; i <= 6; i++) for (let j = 0; j < 3; j++) {
      const x = r.left + 6 + (r.width - 12) * i / 6, y = r.top + 4 + (r.height - 8) * j / 2;
      for (const e of document.elementsFromPoint(x, y)) {
        if (b.contains(e) || e.closest('.wdoor, .hdr, .tw, .tw-btn')) continue;
        if (/^(SECTION|MAIN|BODY|HTML)$/.test(e.tagName)) break;
        const own = /^(BUTTON|INPUT|A)$/.test(e.tagName) || [...e.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim());
        if (own && +getComputedStyle(e).opacity > .1) { under.push(e.tagName + ':' + e.textContent.trim().slice(0, 40)); break; }
      }
    }
  }
  return { bar: shown ? 'shown' : 'hidden', under: [...new Set(under)] };
});

async function shots(b, base) {
  const log = [];
  const sizes = [['1440', DESK], ['390', PHONE]];
  const only_w = (process.env.SIZES || '').split(',').filter(Boolean);    // SIZES=768,1024: those widths instead (lib's sizes)
  for (const v of VERS) for (const world of ['salon', 'coaching']) for (const [w, opt] of (only_w.length ? SIZES(BROWSER).filter(([x]) => only_w.includes(x))
    : v === 'g' ? [...sizes, ['1366', LAP]] : sizes)) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/${QUERY ? '?' + QUERY : ''}`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    const only = (process.env.IDS || '').split(',').filter(Boolean);      // IDS=begin,c-begin: just those sections
    const ids = (await p.evaluate((world) => [...document.querySelectorAll(`main[data-world="${world}"] > section.s`)].map((s) => s.id), world)).filter((id) => !only.length || only.includes(id));
    for (const id of ids) {
      const g = await p.evaluate((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; }, id);
      await jump(p, g.top); await wait(p, WAIT);      // a section's late lines arrive up to about 4.5 s after it does
      await p.screenshot({ path: path.join(OUT, `${v}-${world}-${id}-${w}${QTAG}.jpg`), type: 'jpeg', quality: 80 });
      log.push({ v, world, id, w, h: Math.round(g.h), ...(await barState(p)) });
      if (g.h > g.vh + 2) {
        await jump(p, g.top + g.h - g.vh); await wait(p, 1800);
        await p.screenshot({ path: path.join(OUT, `${v}-${world}-${id}-${w}-end${QTAG}.jpg`), type: 'jpeg', quality: 80 });
        log.push({ v, world, id: id + '-end', w, ...(await barState(p)) });
      }
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, VERS.length < 3 || QTAG ? `bar-${VERS.join('')}${QTAG}.json` : 'bar.json'), JSON.stringify(log, null, 1));   // a run per version keeps its own
  const bad = log.filter((l) => l.bar === 'shown' && l.under && l.under.length);
  console.log('shots', log.length, '| bar shown over text:', bad.length, bad.map((l) => `${l.v}-${l.world}-${l.id}-${l.w}`).join(' '));
}

async function snap(b, base) {
  const res = [], save = () => fs.writeFileSync(path.join(OUT, 'snap.json'), JSON.stringify(res, null, 1));
  // every section taller than the window, found by id in each version, world and size (lib.mjs tall(), task 58855053), through
  // lib.mjs pullWalk()'s six moves; IDS narrows the sections
  const ids = (process.env.IDS || '').split(',').filter(Boolean);
  for (const v of VERS) for (const world of ['salon', 'coaching']) for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    try {
      if (world === 'coaching') await toWorld(p, 'coaching');
      for (const t of (await p.evaluate(tall)).filter((t) => !ids.length || ids.includes(t.id))) {
        if (!t.next) { res.push({ v, world, id: t.id, w, note: 'the last section: nothing to pull into' }); continue; }
        try {
          await pullWalk(io(p, BROWSER), t.id, async (r) => {
            res.push({ v, world, id: t.id, w, ...r, step: `${r.step}: ${STEPS[r.step][0]}`, expect: STEPS[r.step][1] });
            await p.screenshot({ path: path.join(OUT, `snap-${v}-${t.id}-${w}-${res.length}.jpg`), type: 'jpeg', quality: 70 });
          });
        } catch (e) { res.push({ v, world, id: t.id, w, error: e.message.slice(0, 200) }); }
        save();
      }
    } catch (e) { res.push({ v, world, w, error: e.message.slice(0, 200) }); }
    await ctx.close();
  }
  save();
  for (const r of res) console.log('snap', r.v, r.world, r.id, r.w, r.step || r.note || r.error, '|', r.expect || '', r.pass === false ? '| OFF' : '', '| top', r.top, 'bottomGap', r.bottomGap, 'nextTop', r.nextTop, 'snap', JSON.stringify(r.snap));
}

// the page's end (task d9a90616; J 19 Nov: each world's last call to action, then its door to the other world, the footer inside
// that last slide): the last two slides of each world, walked as a visitor does. From the slide before the last, a slow scroll
// of more than a third of the window brings the last slide in whole; inside a last slide taller than the window nothing moves,
// and at its end its lower edge is on the window's with the page at its end; back up past its top by less than a third it
// returns, by more than a third the slide before is back (whole, or at its end when it is the taller one)
async function end(b, base) {
  const res = [], W = (p, dy) => wheel(p, dy, { browser: BROWSER });
  for (const v of VERS) for (const world of ['salon', 'coaching']) for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/${QUERY ? '?' + QUERY : ''}`);
    try {
      if (world === 'coaching') await toWorld(p, 'coaching');
      const ids = await p.evaluate((world) => [...document.querySelectorAll(`main[data-world="${world}"] > section.s`)].map((s) => s.id), world);
      const last = ids[ids.length - 1], prev = ids[ids.length - 2];
      const geo = (id) => p.evaluate((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), vh: innerHeight }; }, id);
      // a visitor has scrolled the whole page by the time they are here: each section is visited once, top to bottom, so its
      // lazy pictures are in and its stage has its size, and nothing above changes height during the walk
      for (const id of ids) { await jump(p, (await geo(id)).top); await wait(p, 400); }
      await wait(p, 800);
      const rec = async (step, expect, ok) => {
        await wait(p, 1500);
        const a = await p.evaluate(edgesOf, prev), z = await p.evaluate(edgesOf, last), left = await p.evaluate(() => Math.round(document.documentElement.scrollHeight - scrollY - innerHeight));
        res.push({ v, world, w, prev, last, step, expect, pass: !!ok(a, z, left), prevTop: a.top, prevBottomGap: a.bottomGap, lastTop: z.top, lastBottomGap: z.bottomGap, pageLeft: left, snap: z.snap, ...(await barState(p)) });
        await p.screenshot({ path: path.join(OUT, `end-${v}-${world}-${w}-${step[0]}${QTAG}.jpg`), type: 'jpeg', quality: 75 });
      };
      const P0 = await geo(prev), vh = P0.vh, third = vh / 3, tallPrev = P0.h > vh + 2;
      await jump(p, P0.top + Math.max(0, P0.h - vh)); await wait(p, 1200);
      await W(p, Math.round(third * 1.5)); await rec('a: from the slide before, on by more than a third', 'the last slide in whole (its top 0)', (a, z) => Math.abs(z.top) <= 2);
      let L = await geo(last);
      if (L.h > vh + 2) {
        const into = Math.min(200, L.h - vh - 20);
        await W(p, into); await rec('b: a little way into the last slide, at rest', `no move (its top -${into})`, (a, z) => Math.abs(z.top + into) <= 4);
        await W(p, L.h); await rec('c: on to the end of the page', 'its lower edge on the window\'s, nothing left under it', (a, z, left) => Math.abs(z.bottomGap) <= 2 && left <= 2);
      }
      L = await geo(last); await jump(p, L.top); await wait(p, 1200);
      await W(p, -Math.round(third * .5)); await rec('d: from its top, back up less than a third', 'back to its top (0)', (a, z) => Math.abs(z.top) <= 2);
      L = await geo(last); await jump(p, L.top); await wait(p, 1200);
      await W(p, -Math.round(third * 1.5)); await rec('e: from its top, back up more than a third', tallPrev ? 'the slide before back, its end on the window\'s lower edge' : 'the slide before back whole (its top 0)', (a) => Math.abs(tallPrev ? a.bottomGap : a.top) <= 2);
    } catch (e) { res.push({ v, world, w, error: e.message.slice(0, 200) }); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, `end${QTAG}.json`), JSON.stringify(res, null, 1));
  for (const r of res) console.log('end', r.v, r.world, r.w, r.error || `${r.pass ? 'PASS' : 'FAIL'} ${r.step} | ${r.expect} | ${r.prev} top ${r.prevTop} gap ${r.prevBottomGap}, ${r.last} top ${r.lastTop} gap ${r.lastBottomGap}, page left ${r.pageLeft}, snap "${r.snap}", bar ${r.bar}`);
  console.log('end', res.filter((r) => r.pass).length, 'pass,', res.filter((r) => r.pass === false).length, 'fail,', res.filter((r) => r.error).length, 'errors');
}

// G: the visit preview becoming the step rail (J's 4 Nov ask): stills at fixed points of the preview's leave, and whether the
// animation is wired (the morph class is on the section, the numbers move, the rail shows by the end)
async function morph(b, base) {
  const res = [];
  for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/g/`);
    const [a, z] = await p.evaluate(() => [document.getElementById('visit').offsetTop, document.getElementById('arrive').offsetTop]);
    const wired = await p.evaluate(() => document.getElementById('visit').classList.contains('pv--morph'));
    const nextIsStep = await p.evaluate(() => document.getElementById('visit').nextElementSibling.id);
    for (const q of [0, .2, .4, .56, .7, 1]) {
      await jump(p, a + (z - a) * q); await wait(p, 700);
      const st = await p.evaluate(() => { const n = document.querySelector('#visit .ln__n'), r = document.getElementById('rail'); return { numMoved: n ? n.style.transform !== '' : null, railOpacity: r ? +getComputedStyle(r).opacity : null }; });
      await p.screenshot({ path: path.join(OUT, `morph-${w}-q${String(Math.round(q * 100)).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 80 });
      res.push({ w, q, wired, nextIsStep, ...st });
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'morph.json'), JSON.stringify(res, null, 1));
  for (const r of res) console.log('morph', r.w, 'q', r.q, 'wired', r.wired, 'next', r.nextIsStep, 'numMoved', r.numMoved, 'railOpacity', r.railOpacity);
}

// round 5 motion (J 13 Nov: "The line is not even animated and it ends like a step 4" / "the nature being a video, I don't
// know why those don't move"). line: G's visit preview and Inner Work's path, the line's clip during and after its draw, and
// where its drawn end sits against the last stop. films: each step slide, the photo on top dissolving and the element film
// under it actually advancing (currentTime moves; an error code 4 = this browser cannot decode the file).
async function line(b, base) {
  const res = [];
  for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) for (const [v, world, id] of [['g', 'salon', 'visit'], ['g', 'coaching', 'c-path'], ['m', 'coaching', 'c-path']]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    try {
      if (world === 'coaching') await toWorld(p, 'coaching');
      const top = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
      await jump(p, top);
      for (const t of [600, 1800, 4000]) {
        await wait(p, t === 600 ? 600 : t === 1800 ? 1200 : 2200);
        const st = await p.evaluate((id) => {
          const s = document.getElementById(id), svg = s.querySelector('.ln__svg'), nums = [...s.querySelectorAll('.ln__n')];
          if (!svg) return { svg: false };
          const r = svg.getBoundingClientRect(), cp = getComputedStyle(svg).clipPath, m = /inset\(([-\d.]+)px ([-\d.]+)(?:px|%) /.exec(cp);
          const last = nums.length ? nums[nums.length - 1].getBoundingClientRect() : null;
          return { active: s.classList.contains('is-active'), clip: cp, clipRight: m ? m[2] : null, stops: nums.length,
            svgL: Math.round(r.left), svgR: Math.round(r.right), svgT: Math.round(r.top), svgB: Math.round(r.bottom),
            lastStopCx: last ? Math.round(last.left + last.width / 2) : null, lastStopCy: last ? Math.round(last.top + last.height / 2) : null };
        }, id);
        await p.screenshot({ path: path.join(OUT, `line-${v}-${id}-${w}-t${t}.jpg`), type: 'jpeg', quality: 80 });
        res.push({ v, world, id, w, t, ...st });
      }
    } catch (e) { res.push({ v, world, id, w, error: e.message.slice(0, 200) }); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'line.json'), JSON.stringify(res, null, 1));
  for (const r of res) console.log('line', r.v, r.id, r.w, 't', r.t, r.error || `active ${r.active} clip ${r.clip} stops ${r.stops} svg x ${r.svgL}-${r.svgR} y ${r.svgT}-${r.svgB} last stop ${r.lastStopCx},${r.lastStopCy}`);
}
async function films(b, base) {
  const res = [];
  for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/g/`);
    try {
      const ids = await p.evaluate(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')].filter((s) => s.querySelector('.ch--stack, .ch__top') && s.querySelector('video')).map((s) => s.id));
      for (const id of ids) {
        const top = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
        await jump(p, top);
        const at = async (label) => p.evaluate(([id, label]) => {
          const s = document.getElementById(id), v = s.querySelector('video'), top = s.querySelector('.ch__top');
          return { label, active: s.classList.contains('is-active'), src: v ? (v.currentSrc || v.getAttribute('src') || v.dataset.src || '').split('/').pop() : null,
            t: v ? +v.currentTime.toFixed(2) : null, paused: v ? v.paused : null, ready: v ? v.readyState : null, err: v && v.error ? v.error.code : null,
            mp4: v ? v.canPlayType('video/mp4; codecs="avc1.42E01E"') : null, photoOpacity: top ? +(+getComputedStyle(top).opacity).toFixed(2) : null };
        }, [id, label]);
        await wait(p, 1500); const a = await at('1.5s'); await p.screenshot({ path: path.join(OUT, `film-${id}-${w}-a.jpg`), type: 'jpeg', quality: 75 });
        await wait(p, 4500); const z = await at('6s'); await p.screenshot({ path: path.join(OUT, `film-${id}-${w}-b.jpg`), type: 'jpeg', quality: 75 });
        res.push({ id, w, a, z, moving: z.t != null && a.t != null && z.t > a.t + .5 });
      }
    } catch (e) { res.push({ w, error: e.message.slice(0, 200) }); }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'films.json'), JSON.stringify(res, null, 1));
  for (const r of res) console.log('film', r.id, r.w, r.error || `moving ${r.moving} | 1.5s t ${r.a.t} photo ${r.a.photoOpacity} | 6s t ${r.z.t} paused ${r.z.paused} ready ${r.z.ready} err ${r.z.err} photo ${r.z.photoOpacity} src ${r.z.src} mp4 '${r.z.mp4}'`);
}

// visit (task b36dde1f): safari.mjs's person's walk, here in WebKit and for two builds served side by side: this commit's
// pages (after) and VISIT_BEFORE's (before: its option-2.2-mgs/<v>/index.html read from git; the shared assets are the
// same files). A jump asks a film to play in the frame it is attached; a person reaches a step seconds after its film was
// attached two screens before, so the walk pauses DWELL ms on every section (VISIT_DWELL: a quick scroller, a reader).
// The films come at FILM_BPS bytes a second (default 1.5 MB/s, a phone's network): on loopback a whole download is
// instant, and the engine's 4.5 s swap to one would never meet a film already asked to play. play() is wrapped read-only
// before any page script runs (each call and how its promise ended); blob: in currentSrc = the film was swapped.
const DWELLS = (process.env.VISIT_DWELL || '2300,6000').split(',').map(Number);
const FILM_BPS = +(process.env.FILM_BPS || 1500000);
function slowFilms(root) {
  return (u, req, res) => {
    const m = u.match(/^\/[mgs]\/(media\/[^/]+\.mp4)$/);
    if (!m) return false;
    const file = path.join(root, 'option-2.2', 'site', m[1]);
    let st; try { st = fs.statSync(file); } catch (e) { res.writeHead(404); res.end(); return true; }
    const r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || ''), a = r && r[1] ? +r[1] : 0, z = r && r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
    res.writeHead(r ? 206 : 200, { 'Content-Type': 'video/mp4', 'Content-Length': z - a + 1, 'Accept-Ranges': 'bytes', ...(r ? { 'Content-Range': `bytes ${a}-${z}/${st.size}` } : {}) });
    const fd = fs.openSync(file, 'r'), chunk = Math.max(1024, Math.round(FILM_BPS / 10));
    let pos = a, done = false;
    const end = () => { if (!done) { done = true; fs.closeSync(fd); } };
    res.on('close', end);
    const tick = () => {
      if (done) return;
      if (pos > z) { res.end(); return end(); }
      const n = Math.min(chunk, z - pos + 1), buf = Buffer.alloc(n);
      fs.readSync(fd, buf, 0, n, pos); pos += n; res.write(buf); setTimeout(tick, 100);
    };
    tick();
    return true;
  };
}
// VISIT_BEFORE: a checkout of the earlier build (sDelegate --mirror), or a commit of this repo's history
function beforeRoot(sha) {
  if (fs.existsSync(path.join(sha, 'option-2.2-mgs'))) return sha;
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'mgs-before-'));
  for (const v of VERS) {
    fs.mkdirSync(path.join(d, 'option-2.2-mgs', v), { recursive: true });
    fs.writeFileSync(path.join(d, 'option-2.2-mgs', v, 'index.html'), execFileSync('git', ['-C', REPO, 'show', `${sha}:option-2.2-mgs/${v}/index.html`]));
  }
  fs.mkdirSync(path.join(d, 'option-2.2'));
  fs.symlinkSync(path.join(REPO, 'option-2.2', 'site'), path.join(d, 'option-2.2', 'site'));
  return d;
}
const PLAYLOG = () => {
  const fv = window.__fv = { plays: [] }, p0 = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () {
    const rec = { src: (this.currentSrc || this.getAttribute('src') || this.getAttribute('data-src') || '').split('/').pop().slice(0, 24), at: Math.round(performance.now()), out: 'pending' };
    fv.plays.push(rec); const pr = p0.apply(this, arguments);
    if (pr && pr.then) pr.then(() => { rec.out = 'ok'; }, (e) => { rec.out = (e && e.name) || 'rejected'; });
    return pr;
  };
};
const filmAt = (p, id) => p.evaluate((id) => {
  const s = document.getElementById(id), v = s.querySelector('video'), top = s.querySelector('.ch__top');
  return { t: v ? Math.round(v.currentTime * 100) / 100 : null, paused: v ? v.paused : null, ready: v ? v.readyState : null,
    err: v && v.error ? v.error.code : null, blob: v ? /^blob:/.test(v.currentSrc || '') : null, on: v ? v.classList.contains('is-on') : null,
    photo: top ? Math.round(+getComputedStyle(top).opacity * 100) / 100 : null, active: s.classList.contains('is-active') };
}, id);
async function walk(b, base, v, opt, dwell) {
  const ctx = await b.newContext(opt);
  await ctx.addInitScript(PLAYLOG);
  const p = await open(ctx, `${base}/${v}/`), steps = [];
  try {
    await wait(p, 1000);
    const secs = await p.evaluate(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')]
      .map((s, i) => ({ i, id: s.id || null, step: !!(s.querySelector('.ch__top') && s.querySelector('video')) })));
    for (const s of secs) {
      await jump(p, await p.evaluate((i) => document.querySelectorAll('main[data-world="salon"] > section.s')[i].getBoundingClientRect().top + scrollY, s.i));
      if (!s.step) { await wait(p, dwell); continue; }
      await wait(p, 1500); const a = await filmAt(p, s.id); await wait(p, 4500); const z = await filmAt(p, s.id);
      steps.push({ id: s.id, moving: z.t != null && a.t != null && z.t > a.t + 0.5 && !z.paused && z.err == null, a, z });
    }
    return { dwell, steps, plays: await p.evaluate(() => window.__fv.plays) };
  } catch (e) { return { dwell, steps, error: e.message.slice(0, 200) }; } finally { await ctx.close(); }
}
async function visit(b) {
  const builds = [['after', REPO]];
  if (process.env.VISIT_BEFORE) builds.unshift(['before', beforeRoot(process.env.VISIT_BEFORE)]);
  const res = { filmBps: FILM_BPS, before: process.env.VISIT_BEFORE || null, builds: {} };
  for (const [name, root] of builds) {
    const srv = await serveRepo(root, slowFilms(root)), base = `http://127.0.0.1:${srv.address().port}`, r = res.builds[name] = {};
    for (const v of VERS) for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) for (const d of DWELLS) {
      const k = `${v}-${w}-${d}`, x = r[k] = await walk(b, base, v, opt, d);
      fs.writeFileSync(path.join(OUT, 'visit.json'), JSON.stringify(res, null, 1));
      console.log('visit', name, k, x.error || `${x.steps.filter((s) => s.moving).length}/${x.steps.length} moving`,
        x.steps.map((s) => `${s.id} ${s.moving ? 'moving' : 'STILL'} t ${s.a.t}->${s.z.t} paused ${s.z.paused} ready ${s.z.ready} blob ${s.a.blob}->${s.z.blob}`).join(' | '));
    }
    srv.close();
  }
}

const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw[BROWSER].launch(BROWSER === 'webkit' && process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
console.log(BROWSER, b.version());
try {
  if (ONLY.includes('visit')) await visit(b);
  if (ONLY.includes('morph')) await morph(b, base);
  if (ONLY.includes('line')) await line(b, base);
  if (ONLY.includes('films')) await films(b, base);
  if (ONLY.includes('snap')) await snap(b, base);
  if (ONLY.includes('end')) await end(b, base);
  if (ONLY.includes('shots')) await shots(b, base);
} finally { await b.close(); srv.close(); }
