// The QA scripts' shared blocks (task 2846db82 / cf6eeff6): the loopback server for a commit's built M/G/S pages and the
// page helpers every check uses. r4.mjs, copy-check.mjs, gaps.mjs, gate-rows.mjs and safari.mjs import them; record.mjs and menu-panels.mjs still
// carry their own server (record.mjs adds film routes: pass them as `extra`).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.woff2': 'font/woff2', '.json': 'application/json' };

// /m/, /g/, /s/ serve option-2.2-mgs/<v>/index.html; every other path under them comes from option-2.2/site (the shared
// assets), with byte ranges for the films. extra(u, req, res) may answer a request first (return true when it did).
export function serve(REPO, extra) {
  return new Promise((done) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      if (extra && extra(u, req, res)) return;
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

export const wait = (p, ms) => p.waitForTimeout(ms);

// a page with the sound off (no autoplay prompt), loaded and settled 1.5 s
export async function open(ctx, url) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' });
  await wait(p, 1500);
  return p;
}

// switch to a world with the page's own switch, as a visitor does
export async function toWorld(p, w) {
  await p.evaluate((w) => document.querySelector(`.worlds [data-to-world="${w}"]`).click(), w);
  await wait(p, 2800);
}

// jump straight to a scroll position (no smooth scroll, the page's snap paused for the jump and restored after)
export async function jump(p, y) {
  await p.evaluate((y) => {
    const r = document.documentElement, b = r.style.scrollBehavior, s = r.style.scrollSnapType;
    r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none'; scrollTo(0, y);
    requestAnimationFrame(() => { r.style.scrollSnapType = s; r.style.scrollBehavior = b; });
  }, y);
}

// every <img> and film poster laid out on the page now: the file's own pixels, its box and the scale the browser draws the
// file at (object-fit counted), in CSS px per file pixel; sharpness.mjs and gate-rows.mjs (approved-features row 18) read it
// rest: true measures each picture's own laid-out box (offsetWidth/Height: no entry zoom or other transform), the size it rests at;
// otherwise its drawn box now. An <img> straight before a <video> is that film's still (its first frame until it plays): film: true.
export function pictures(p, { rest = false } = {}) {
  return p.evaluate(async (rest) => {
    const out = [];
    // with a srcset, naturalWidth is density-corrected: read the chosen file's own pixels from a plain Image
    const real = {};
    for (const el of document.querySelectorAll('img[srcset]')) {
      const u = el.currentSrc; if (!u || real[u]) continue;
      const t = new Image(); t.src = u; try { await t.decode(); } catch (e) {}
      real[u] = [t.naturalWidth, t.naturalHeight];
    }
    const fit = (el, nw, nh) => {
      const r = rest ? { width: el.offsetWidth, height: el.offsetHeight } : el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (!r.width || !r.height || !nw) return null;
      const f = cs.objectFit || 'fill';
      const s = f === 'cover' ? Math.max(r.width / nw, r.height / nh) : f === 'contain' ? Math.min(r.width / nw, r.height / nh) : Math.max(r.width / nw, r.height / nh);
      return { box: [Math.round(r.width), Math.round(r.height)], scale: s };
    };
    for (const el of document.querySelectorAll('img')) {
      if (el.closest('.sh__sheet, .sh__sheet2')) continue;   // the lenticular sheet's smeared copies of its photo are the glass, not pictures (the photo itself is measured)
      const [nw, nh] = el.hasAttribute('srcset') && real[el.currentSrc] ? real[el.currentSrc] : [el.naturalWidth, el.naturalHeight];
      const m = fit(el, nw, nh); if (!m) continue;
      const file = el.hasAttribute('srcset') ? el.currentSrc.replace(/^.*\/img\//, 'img/') : el.getAttribute('src');
      const still = el.nextElementSibling?.tagName === 'VIDEO';   // the film's still: its first frame, shown until the film plays
      out.push({ src: el.getAttribute('src'), file, nat: [nw, nh], ...m, where: el.closest('section,[id]')?.id || '', ...(still && { film: true }) });
    }
    for (const el of document.querySelectorAll('video[poster]')) {
      const m = fit(el, el.videoWidth || 1600, el.videoHeight || 900); if (!m) continue;
      out.push({ src: el.getAttribute('poster') + ' (film ' + el.currentSrc.split('/').pop() + ', ' + (el.videoWidth || '?') + 'x' + (el.videoHeight || '?') + ')', nat: [el.videoWidth, el.videoHeight], ...m, where: el.closest('section,[id]')?.id || '', film: true });
    }
    return out;
  }, rest);
}

// the window sizes every check walks: phone, tablet, the laptop and desktop widths
export const vp = (w, h) => ({ viewport: { width: w, height: h } });
export const phone = (browser) => ({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: browser !== 'firefox', hasTouch: true });
export const SIZES = (browser) => [['390', phone(browser)], ['768', vp(768, 1024)], ['1024', vp(1024, 768)], ['1280', vp(1280, 800)],
  ['1366', vp(1366, 768)], ['1440', vp(1440, 900)], ['1920', vp(1920, 1080)]];

// approved-features row 5, the pull (J 13 Nov, asks e55369fb, ead2f524: past a tall section the page "should have the same
// behavior as the transition between any other slides and work the same way ... The same applies in reverse"; task 58855053).
// One block for gate-rows.mjs row 5, r4.mjs snap and safari.mjs snap.
// tall(): every section of the shown world taller than the window, by id, as mgs.js secs() sees them (main[data-world] > .s),
// each with whether a section follows it; run in the page (p.evaluate(tall), or WebDriver's execute)
export function tall() {
  const m = document.querySelector('main[data-world]:not([hidden])'), vh = innerHeight;
  const all = m ? [...m.children].filter((e) => e.classList.contains('s') && e.id) : [];
  return all.map((e, i) => ({ id: e.id, h: Math.round(e.getBoundingClientRect().height), next: i < all.length - 1 })).filter((s) => s.h > vh + 2);
}
// where a section's edges sit relative to the window (px; 0 = aligned); the next section is the next one mgs.js settles on
export function edgesOf(id) {
  const s = document.getElementById(id), r = s.getBoundingClientRect();
  let n = s.nextElementSibling; while (n && !n.classList.contains('s')) n = n.nextElementSibling;
  return { top: Math.round(r.top), bottomGap: Math.round(r.bottom - innerHeight), nextTop: n ? Math.round(n.getBoundingClientRect().top) : null, y: Math.round(scrollY), vh: innerHeight, snap: document.documentElement.style.scrollSnapType };
}
// a slow scroll in small steps: the mouse wheel on a laptop size; on a phone size (mobile WebKit has no wheel) the same steps as
// scroll positions, which fire the same scroll events a finger's scroll does; Chromium on a phone: a finger's drag over CDP
export async function wheel(p, dy, { step = 60, browser = 'webkit' } = {}) {
  const n = Math.max(1, Math.round(Math.abs(dy) / step)), vp = p.viewportSize(), mobile = vp.width < 600;
  if (!mobile) await p.mouse.move(vp.width / 2, vp.height / 2);      // the wheel where a person's pointer rests, mid-window
  if (mobile && browser === 'chromium') {
    const cdp = await p.context().newCDPSession(p), x = vp.width / 2;
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
// the six moves (r4.mjs round 4, task 2846db82) and what each must leave once the page is at rest: [move, expected, pass]
export const STEPS = {
  a: ['a little way into the section, at rest', 'no move: top < 0, bottomGap > 0', (e) => e.top < 0 && e.bottomGap > 0],
  b: ['slowly a little past its end (120 px of the next)', 'bottomGap 0 (its bottom on the window bottom)', (e) => Math.abs(e.bottomGap) <= 2],
  c: ['on, less than a third of the window', 'bottomGap 0 again', (e) => Math.abs(e.bottomGap) <= 2],
  d: ['on, more than a third of the window', 'nextTop 0 (the next section in)', (e) => e.nextTop !== null && Math.abs(e.nextTop) <= 2],
  e: ['back up a little', 'nextTop 0 (stays)', (e) => e.nextTop !== null && Math.abs(e.nextTop) <= 2],
  f: ['back up more than a third', 'bottomGap 0 (back to its end)', (e) => Math.abs(e.bottomGap) <= 2],
};
// what pullWalk() drives: run(fn, arg) in the page, jump(y), wheel(dy), wait(ms); io(p) for Playwright, safari.mjs passes WebDriver's
export const io = (p, browser = 'webkit') => ({ run: (fn, a) => p.evaluate(fn, a), jump: (y) => jump(p, y), wheel: (dy) => wheel(p, dy, { browser }), wait: (ms) => wait(p, ms) });
// walk one tall section through the six moves; at(r) runs after each (r4.mjs takes its still there). Step a needs some free
// scroll to read (over 100 px); b starts 200 px short of the end (at the top of a section less than 200 px taller than the
// window) and moves 120 px past it; c to f need a section after it: callers pass only those (tall()'s next).
export async function pullWalk(io, id, at) {
  const g = await io.run((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), vh: innerHeight }; }, id);
  const out = [], over = g.h - g.vh, third = g.vh / 3;
  const rec = async (k) => { await io.wait(1300); const e = await io.run(edgesOf, id), r = { step: k, ...e, pass: STEPS[k][2](e) }; out.push(r); if (at) await at(r); };
  if (over > 100) { await io.jump(g.top); await io.wait(900); await io.wheel(Math.min(300, over - 40)); await rec('a'); }
  const start = g.top + Math.max(0, over - 200);
  await io.jump(start); await io.wait(900);
  await io.wheel(g.top + over - start + 120); await rec('b');
  await io.wheel(Math.round(third * .6)); await rec('c');
  await io.wheel(Math.round(third * 1.25)); await rec('d');
  await io.wheel(-120); await rec('e');
  await io.wheel(-Math.round(third * 1.25)); await rec('f');
  return out;
}
