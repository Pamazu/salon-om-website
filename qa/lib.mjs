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
