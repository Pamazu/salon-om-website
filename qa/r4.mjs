// Salon OM M/G/S round 4 QA (task 2846db82), in Safari's engine (WebKit) by default, Chromium with BROWSER=chromium.
// Serves this commit's built pages on loopback like record.mjs (/m/, /g/, /s/ over option-2.2/site's assets) and writes
// to qa/out-<browser>/:
//   shots   every section of both worlds as the visitor sees it, at 1440 x 900 and 390 x 844 (and 1366 x 768 on G):
//           <v>-<world>-<id>-<w>.jpg, plus <...>-end.jpg at the bottom of a section taller than the window.
//           bar.json: per shot, whether the floating "Book your visit · Begin" bar shows and whether text sits under it.
//   snap    the calm snapping around tall sections, measured after each move: snap.json and snap-*.jpg stills.
//   ONLY=shots|snap (default both), VERS=m,g,s
//   npm i && npx playwright install webkit && node r4.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.env.BROWSER || 'webkit';
const OUT = path.join(REPO, 'qa', `out-${BROWSER}`);
const ONLY = process.env.ONLY || 'shots,snap';
const VERS = (process.env.VERS || 'm,g,s').split(',');
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.json': 'application/json' };

function serve() {
  return new Promise((done) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
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
const LAP = { viewport: { width: 1366, height: 768 } };
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: BROWSER !== 'firefox', hasTouch: true };
const wait = (p, ms) => p.waitForTimeout(ms);
const WAIT = +(process.env.WAIT || 5000);

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
// jump straight to a scroll position (no smooth scroll, the page's snap paused for the jump and restored after)
async function jump(p, y) {
  await p.evaluate((y) => {
    const r = document.documentElement, b = r.style.scrollBehavior, s = r.style.scrollSnapType;
    r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none'; scrollTo(0, y);
    requestAnimationFrame(() => { r.style.scrollSnapType = s; r.style.scrollBehavior = b; });
  }, y);
}
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
  for (const v of VERS) for (const world of ['salon', 'coaching']) for (const [w, opt] of (v === 'g' ? [...sizes, ['1366', LAP]] : sizes)) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    const only = (process.env.IDS || '').split(',').filter(Boolean);      // IDS=begin,c-begin: just those sections
    const ids = (await p.evaluate((world) => [...document.querySelectorAll(`main[data-world="${world}"] > section.s`)].map((s) => s.id), world)).filter((id) => !only.length || only.includes(id));
    for (const id of ids) {
      const g = await p.evaluate((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; }, id);
      await jump(p, g.top); await wait(p, WAIT);      // a section's late lines arrive up to about 4.5 s after it does
      await p.screenshot({ path: path.join(OUT, `${v}-${world}-${id}-${w}.jpg`), type: 'jpeg', quality: 80 });
      log.push({ v, world, id, w, h: Math.round(g.h), ...(await barState(p)) });
      if (g.h > g.vh + 2) {
        await jump(p, g.top + g.h - g.vh); await wait(p, 1800);
        await p.screenshot({ path: path.join(OUT, `${v}-${world}-${id}-${w}-end.jpg`), type: 'jpeg', quality: 80 });
        log.push({ v, world, id: id + '-end', w, ...(await barState(p)) });
      }
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'bar.json'), JSON.stringify(log, null, 1));
  const bad = log.filter((l) => l.bar === 'shown' && l.under && l.under.length);
  console.log('shots', log.length, '| bar shown over text:', bad.length, bad.map((l) => `${l.v}-${l.world}-${l.id}-${l.w}`).join(' '));
}

// where a section's edges sit relative to the window (px; 0 = aligned)
const edges = (p, id) => p.evaluate((id) => {
  const s = document.getElementById(id), n = s.nextElementSibling, r = s.getBoundingClientRect();
  return { top: Math.round(r.top), bottomGap: Math.round(r.bottom - innerHeight), nextTop: n ? Math.round(n.getBoundingClientRect().top) : null, y: Math.round(scrollY), vh: innerHeight, snap: document.documentElement.style.scrollSnapType };
}, id);
// a slow scroll in small steps: the mouse wheel on a laptop size; on a phone size (mobile WebKit has no wheel) the same
// steps as scroll positions, which fire the same scroll events a finger's scroll does
async function wheel(p, dy, step = 60) {
  const n = Math.max(1, Math.round(Math.abs(dy) / step)), mobile = p.viewportSize().width < 600;
  if (mobile && BROWSER === 'chromium') {      // Chromium: a finger's drag (touch down, move in small steps, lift)
    const cdp = await p.context().newCDPSession(p), vp = p.viewportSize(), x = vp.width / 2;
    const y0 = dy > 0 ? vp.height * .8 : vp.height * .2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] });
    for (let i = 1; i <= n; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 - dy * i / n }] }); await wait(p, 40); }
    await wait(p, 120);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    return;
  }
  for (let i = 0; i < n; i++) {
    const d = Math.sign(dy) * Math.abs(dy) / n;
    if (mobile) await p.evaluate((d) => scrollBy({ top: d, behavior: 'instant' }), d); else await p.mouse.wheel(0, d);
    await wait(p, 40);
  }
}
async function snap(b, base) {
  const res = [];
  const cases = [['g', 'salon', 'services'], ['m', 'salon', 'services'], ['g', 'coaching', 'c-how'], ['s', 'coaching', 'c-deeper']];
  for (const [v, world, id] of cases) for (const [w, opt] of [['1440', DESK], ['390', PHONE]]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    try {
    if (world === 'coaching') await toWorld(p, 'coaching');
    if (opt.viewport.width >= 600) await p.mouse.move(opt.viewport.width / 2, opt.viewport.height / 2);
    const g = await p.evaluate((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; }, id);
    if (g.h <= g.vh + 2) { res.push({ v, world, id, w, note: 'not taller than the window here' }); await ctx.close(); continue; }
    const third = g.vh / 3, rec = async (step, expect) => { await wait(p, 1300); const e = await edges(p, id); res.push({ v, world, id, w, step, expect, ...e }); await p.screenshot({ path: path.join(OUT, `snap-${v}-${id}-${w}-${res.length}.jpg`), type: 'jpeg', quality: 70 }); };
    await jump(p, g.top); await wait(p, 900);
    await wheel(p, Math.min(300, g.h - g.vh - 40)); await rec('a: a little way into the section, at rest', 'no move: top < 0, bottomGap > 0');
    await jump(p, g.top + g.h - g.vh - 200); await wait(p, 900);
    await wheel(p, 320); await rec('b: slowly a little past its end (120 px of the next)', 'bottomGap 0 (its bottom on the window bottom)');
    await wheel(p, Math.round(third * .6)); await rec('c: on, less than a third of the window', 'bottomGap 0 again');
    await wheel(p, Math.round(third * 1.25)); await rec('d: on, more than a third of the window', 'nextTop 0 (next section in)');
    await wheel(p, -120); await rec('e: back up a little', 'nextTop 0 (stays)');
    await wheel(p, -Math.round(third * 1.25)); await rec('f: back up more than a third', 'bottomGap 0 (back to its end)');
    } catch (e) { res.push({ v, world, id, w, error: e.message.slice(0, 200) }); }
    fs.writeFileSync(path.join(OUT, 'snap.json'), JSON.stringify(res, null, 1));
    await ctx.close();
  }
  fs.writeFileSync(path.join(OUT, 'snap.json'), JSON.stringify(res, null, 1));
  for (const r of res) console.log('snap', r.v, r.id, r.w, r.step || r.note || r.error, '|', r.expect || '', '| top', r.top, 'bottomGap', r.bottomGap, 'nextTop', r.nextTop, 'snap', JSON.stringify(r.snap));
}

const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw[BROWSER].launch();
console.log(BROWSER, b.version());
try {
  if (ONLY.includes('snap')) await snap(b, base);
  if (ONLY.includes('shots')) await shots(b, base);
} finally { await b.close(); srv.close(); }
