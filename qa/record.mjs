// Salon OM QA on the PC through sDelegate (task 0ab956d4). sdelegate run sends the whole git tree (--include only adds),
// so stage a lean copy (qa/, option-2.2-mgs/<v>/index.html, option-2.2/site/{img,fonts,brand,media/*-poster.webp}) in a
// folder outside git and, from its qa/:  sdelegate run --name salon-om-qaN --root .. --timeout 25m --out out -- node record.mjs
// Serves the built pages of THIS commit on
// loopback (/m/, /g/, /s/ = option-2.2-mgs/<v>/index.html over option-2.2/site's films, photos and fonts) and drives
// them in Chromium. Writes to qa/out: <v>-<world>-<section>-<width>.jpg (screen-sized shots), links.json (where every
// booking button goes), morph-<width>-q<NN>.jpg (stills of the preview becoming the rail) and *.webm (recordings).
//   node record.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(REPO, 'qa', 'out');
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.json': 'application/json' };

// /film/blank, /film/frame/<i> and POST /film/save/<name>: the page that turns screencast frames into a .webm (see film())
const FILM = { frames: [] };
function serve() {
  return new Promise((done) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (u === '/film/blank') { res.writeHead(200, { 'Content-Type': TYPES['.html'] }); return res.end('<!doctype html><body style="margin:0">'); }
      const fr = u.match(/^\/film\/frame\/(\d+)$/);
      if (fr && FILM.frames[+fr[1]]) { res.writeHead(200, { 'Content-Type': 'image/jpeg' }); return res.end(FILM.frames[+fr[1]].data); }
      const sv = u.match(/^\/film\/save\/([\w.-]+\.webm)$/);
      if (sv && req.method === 'POST') { const f = fs.createWriteStream(path.join(OUT, sv[1])); req.pipe(f); return f.on('finish', () => { res.writeHead(204); res.end(); }); }
      const m = u.match(/^\/([mgs])\/(.*)$/);
      if (!m) { res.writeHead(404); return res.end(); }
      const file = !m[2] || m[2] === 'index.html' ? path.join(REPO, 'option-2.2-mgs', m[1], 'index.html') : path.join(REPO, 'option-2.2', 'site', m[2]);
      fs.stat(file, (err, st) => {
        if (err || !st.isFile()) { res.writeHead(404); return res.end(); }
        const type = TYPES[path.extname(file)] || 'application/octet-stream', r = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
        if (r) {
          const a = r[1] ? +r[1] : 0, b = r[2] ? Math.min(+r[2], st.size - 1) : st.size - 1;
          res.writeHead(206, { 'Content-Type': type, 'Content-Length': b - a + 1, 'Content-Range': `bytes ${a}-${b}/${st.size}`, 'Accept-Ranges': 'bytes' });
          return fs.createReadStream(file, { start: a, end: b }).pipe(res);
        }
        res.writeHead(200, { 'Content-Type': type, 'Content-Length': st.size, 'Accept-Ranges': 'bytes' });
        fs.createReadStream(file).pipe(res);
      });
    }).listen(0, '127.0.0.1', () => done(srv));
  });
}

const DESK = { viewport: { width: 1440, height: 900 } };
const TAB = { viewport: { width: 1024, height: 768 } };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const PHONE430 = { viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const LAP = { viewport: { width: 1280, height: 800 } };
const wait = (p, ms) => p.waitForTimeout(ms);

async function open(ctx, url) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' });
  await wait(p, 1500);
  return p;
}
async function toWorld(p, w) {
  await p.evaluate((w) => document.querySelector(`.worlds [data-to-world="${w}"]`).click(), w);
  await wait(p, 2800);
}

// screen-sized shots of named sections, as the visitor sees each one arrive
async function shots(b, base, v, world, ids, sizes) {
  for (const [w, opt] of sizes) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/?shot`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    for (const id of ids) {
      const ok = await p.evaluate((id) => { const e = id === 'top' ? document.body : document.getElementById(id); if (!e) return false; e.scrollIntoView({ block: 'start' }); return true; }, id);
      if (!ok) { console.log('missing section', v, world, id); continue; }
      await wait(p, 1800);
      await p.screenshot({ path: path.join(OUT, `${v}-${world}-${id}-${w}.jpg`), type: 'jpeg', quality: 82 });
    }
    await ctx.close();
  }
}

// where every booking button goes, per version and world
async function links(b, base) {
  const all = {};
  for (const v of ['m', 'g', 's']) {
    const ctx = await b.newContext(DESK), p = await open(ctx, `${base}/${v}/`);
    all[v] = await p.evaluate(() => [...document.querySelectorAll('a.btn, a.wdoor, a.door')].map((a) => ({
      world: a.closest('[data-world]') ? a.closest('[data-world]').getAttribute('data-world') : 'chrome',
      section: a.closest('section') ? a.closest('section').id : (a.closest('header') ? 'header' : a.className),
      label: a.textContent.replace(/\s+/g, ' ').replace('→', '').trim(), href: a.getAttribute('href'),
      target: a.getAttribute('target') || '', toWorld: a.getAttribute('data-to-world') || '' })));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'links.json'), JSON.stringify(all, null, 1));
}

// G: the preview becoming the rail. A recording (real wheel steps with the page's own snap, then a slow scrub down
// and back up) and stills at fixed points of the preview's leave (q).
async function scrub(p, from, to, ms) {
  await p.evaluate(([from, to, ms]) => new Promise((done) => {
    const el = document.documentElement; el.style.scrollSnapType = 'none'; el.style.scrollBehavior = 'auto';
    const t0 = performance.now();
    (function step(t) { const k = Math.min(1, (t - t0) / ms); scrollTo(0, from + (to - from) * k); if (k < 1) requestAnimationFrame(step); else done(); })(t0);
  }), [from, to, ms]);
}
// A recording without Playwright's recordVideo (the PC's Playwright has no ffmpeg): the page's own screencast frames,
// replayed at their timestamps onto a canvas in a second page and encoded there by MediaRecorder (VP9, else VP8).
async function film(b, base, p, name, run) {
  const cdp = await p.context().newCDPSession(p), frames = [];
  cdp.on('Page.screencastFrame', (f) => { frames.push({ t: f.metadata.timestamp, data: Buffer.from(f.data, 'base64') }); cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 80 });
  await run();
  await cdp.send('Page.stopScreencast');
  if (frames.length < 2) return console.log('film', name, 'no frames');
  FILM.frames = frames;
  const ctx = await b.newContext({ viewport: { width: 320, height: 240 } }), e = await ctx.newPage();
  await e.goto(`${base}/film/blank`);
  const r = await e.evaluate(async ({ ts, name }) => {
    const first = await createImageBitmap(await (await fetch('/film/frame/0')).blob());
    const c = document.createElement('canvas'); c.width = first.width; c.height = first.height; document.body.append(c);
    const g = c.getContext('2d'); g.drawImage(first, 0, 0);
    const type = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'].find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(c.captureStream(30), { mimeType: type, videoBitsPerSecond: 8e6 }), chunks = [];
    rec.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data); rec.start(500);
    const t0 = performance.now();
    for (let i = 1; i < ts.length; i++) {
      const bm = await createImageBitmap(await (await fetch(`/film/frame/${i}`)).blob());
      const due = (ts[i] - ts[0]) * 1000 - (performance.now() - t0); if (due > 0) await new Promise((ok) => setTimeout(ok, due));
      g.drawImage(bm, 0, 0); bm.close();
    }
    await new Promise((ok) => setTimeout(ok, 800)); const stopped = new Promise((ok) => { rec.onstop = ok; }); rec.stop(); await stopped;
    await fetch(`/film/save/${name}`, { method: 'POST', body: new Blob(chunks, { type: 'video/webm' }) });
    return { type, w: c.width, h: c.height };
  }, { ts: frames.map((f) => f.t), name });
  console.log('film', name, frames.length, 'frames', `${(frames.at(-1).t - frames[0].t).toFixed(1)} s`, r.type, `${r.w}x${r.h}`);
  FILM.frames = []; await ctx.close();
}
// every in-page link lands somewhere: a #id that exists, or a world switch
async function deadLinks(b, base) {
  const dead = {};
  for (const v of ['m', 'g', 's']) {
    const ctx = await b.newContext(DESK), p = await open(ctx, `${base}/${v}/`);
    dead[v] = await p.evaluate(() => [...document.querySelectorAll('a[href^="#"]')].filter((a) => !a.dataset.toWorld && a.getAttribute('href').length > 1
      && !document.getElementById(a.getAttribute('href').slice(1))).map((a) => `${a.getAttribute('href')} "${a.textContent.trim().slice(0, 30)}"`));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'dead-links.json'), JSON.stringify(dead, null, 1)); console.log('dead links', JSON.stringify(dead));
}
// a section arriving as a visitor scrolls to it (no ?shot, so its real motion plays): stills at fixed times after it
// lands (ms) and a recording of the same arrival; the menu also gets a pointer on its third row, as a hand would
async function arrive(b, base, v, world, id, w, opt, at, menu = false) {
  for (const rec of [false, true]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    const top = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
    await scrub(p, 0, Math.max(0, top - opt.viewport.height), 1); await wait(p, 1200);
    const go = async () => {
      await scrub(p, Math.max(0, top - opt.viewport.height), top, 1100);
      let t = 0;
      for (const ms of at) { await wait(p, ms - t); t = ms; if (!rec) await p.screenshot({ path: path.join(OUT, `move-${v}-${id}-${w}-${String(ms).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 80 }); }
      if (menu && w === '1440') {
        const r = await p.evaluate(() => { const e = document.querySelectorAll('.mn__row')[2].getBoundingClientRect(); return [e.left + 80, e.top + 30]; });
        await p.mouse.move(r[0], r[1]); await wait(p, 1600);
        if (!rec) await p.screenshot({ path: path.join(OUT, `move-${v}-${id}-${w}-hover3.jpg`), type: 'jpeg', quality: 80 });
      }
    };
    if (rec) { try { await film(b, base, p, `move-${v}-${id}-${w}.webm`, go); } catch (e) { console.log('film', id, w, e.message.split('\n')[0]); } }
    else await go();
    await ctx.close();
  }
}
async function morph(b, base, w, opt) {
  const ctx = await b.newContext(opt);
  const p = await open(ctx, `${base}/g/`);
  const [a, z] = await p.evaluate(() => [document.getElementById('visit').offsetTop, document.getElementById('arrive').offsetTop]);
  await scrub(p, 0, a, 1); await p.evaluate(() => { document.documentElement.style.scrollSnapType = ''; document.documentElement.style.scrollBehavior = ''; });
  await wait(p, 2600);
  try {
    await film(b, base, p, `morph-${w}.webm`, async () => {
      await wait(p, 600);
      try { await p.mouse.move(opt.viewport.width / 2, opt.viewport.height / 2); await p.mouse.wheel(0, 240); await wait(p, 2600); await p.mouse.wheel(0, -240); await wait(p, 2600); }
      catch (e) { console.log('wheel', w, e.message); }
      await scrub(p, a, a, 1); await wait(p, 600);
      await scrub(p, a, z, 4200); await wait(p, 1400);
      await scrub(p, z, a, 4200); await wait(p, 1400);
    });
  } catch (e) { console.log('film', w, e.message.split('\n')[0]); }
  await ctx.close();

  const c2 = await b.newContext(opt), s = await open(c2, `${base}/g/`);
  await scrub(s, 0, a, 1); await wait(s, 2600);
  for (const q of [0, .1, .2, .3, .4, .46, .5, .56, .7, 1]) {
    await scrub(s, a, a + (z - a) * q, 1); await wait(s, 120);
    await s.screenshot({ path: path.join(OUT, `morph-${w}-q${String(Math.round(q * 100)).padStart(3, '0')}.jpg`), type: 'jpeg', quality: 82 });
  }
  await c2.close();
}

const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}`;
const exe = process.env.CHROME || process.env.SDELEGATE_CHROMIUM;     // a granted pinned asset, else the PC's own headless Chromium
const b = await chromium.launch(exe ? { executablePath: exe } : {});
try {
  const both = [['1440', DESK], ['390', PHONE]];
  if (process.env.QA_ONLY === 'hero') {      // the two openings only, every version, at 1024 / 1280 / 1440 / 390
    const four = [['1024', TAB], ['1280', { viewport: { width: 1280, height: 800 } }], ...both,
      ['430', { viewport: { width: 430, height: 932 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
      ['768', { viewport: { width: 768, height: 1024 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }],
      ['1366', { viewport: { width: 1366, height: 768 } }]];
    for (const v of ['m', 'g', 's']) { await shots(b, base, v, 'salon', ['top'], four); await shots(b, base, v, 'coaching', ['c-top'], four); }
    await deadLinks(b, base);
    process.exit(0);
  }
  if (process.env.QA_ONLY === 'r3') {        // round 3 (task a2e5a9d0): its sections at 390 / 430 / 1280 / 1440, both worlds, and their motion
    const r3 = [['390', PHONE], ['430', PHONE430], ['1280', LAP], ['1440', DESK]];
    await shots(b, base, 'm', 'salon', ['pause', 'om', 'aveda', 'services', 'kind', 'begin'], r3);
    await shots(b, base, 'm', 'coaching', ['c-deeper', 'c-how', 'c-cred', 'c-begin'], r3);
    await shots(b, base, 'g', 'salon', ['pause', 'om', 'aveda', 'services', 'begin'], r3);
    await shots(b, base, 'g', 'coaching', ['c-how', 'c-cred', 'c-begin'], r3);
    await shots(b, base, 's', 'salon', ['services', 'begin'], r3);
    await shots(b, base, 's', 'coaching', ['c-cred', 'c-begin'], r3);
    for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) {
      await arrive(b, base, 'm', 'salon', 'services', w, opt, [300, 1200, 2600, 9600], true);
      await arrive(b, base, 'm', 'coaching', 'c-cred', w, opt, [200, 800, 1600, 3200]);
      await arrive(b, base, 'm', 'salon', 'begin', w, opt, [200, 800, 1600, 3200]);
    }
    await deadLinks(b, base);
    process.exit(0);
  }
  await links(b, base);
  await shots(b, base, 'm', 'salon', ['top', 'arrive', 'unhurried', 'home', 'aveda', 'services', 'kind', 'deeper', 'begin', 'letters'], both);
  await shots(b, base, 'm', 'coaching', ['c-top', 'c-how', 'c-path', 'c-begin'], both);
  await shots(b, base, 'g', 'salon', ['top', 'visit', 'arrive', 'unhurried', 'services', 'deeper'], both);
  await shots(b, base, 's', 'salon', ['services'], both);
  await shots(b, base, 'g', 'salon', ['top'], [['1024', TAB]]);
  await shots(b, base, 'g', 'coaching', ['c-top'], [['1024', TAB], ['1440', DESK]]);
  await morph(b, base, '1440', DESK);
  await morph(b, base, '390', PHONE);
} finally { await b.close(); srv.close(); }
console.log('done', fs.readdirSync(OUT).length, 'files in qa/out');
