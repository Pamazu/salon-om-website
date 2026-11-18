// The QA scripts' shared blocks (task 2846db82 / cf6eeff6): the loopback server for a commit's built M/G/S pages and the
// page helpers every check uses. r4.mjs, copy-check.mjs and gaps.mjs import them; record.mjs and menu-panels.mjs still
// carry their own server (record.mjs adds film routes: pass them as `extra`).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
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
  // 'load' waits for every picture and film's first bytes: on a busy pool machine in WebKit it passed 30 s (task a73569a9), so the page is
  // ready at domcontentloaded and 'load' gets up to 90 s more without failing the run (every check waits for its own settling anyway)
  await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await p.waitForLoadState('load', { timeout: 90000 }).catch(() => {});
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

// the window sizes every check walks: phone, tablet, the laptop and desktop widths
export const vp = (w, h) => ({ viewport: { width: w, height: h } });
export const phone = (browser) => ({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: browser !== 'firefox', hasTouch: true });
export const SIZES = (browser) => [['390', phone(browser)], ['768', vp(768, 1024)], ['1024', vp(1024, 768)], ['1280', vp(1280, 800)],
  ['1366', vp(1366, 768)], ['1440', vp(1440, 900)], ['1920', vp(1920, 1080)]];
