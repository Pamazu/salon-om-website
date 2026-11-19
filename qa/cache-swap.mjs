// J's Safari kept the pause's old picture after it was replaced (task 01849ea5, 19 Nov). This replays it in WebKit (Safari's
// engine; the pool's pinned build when %WEBKIT% is set) with Firebase's own cache headers (firebase.json: the page no-cache,
// pictures, films and sounds a week, fonts and icons a month):
//   1. a visitor opens M and reaches the pause: the browser fetches the pause picture it needs (file X) and caches it;
//   2. the picture is replaced on the server: X now holds other bytes (a smaller rung of the same photo, so its width tells
//      which one is shown), and the page is rebuilt;
//   3. the visitor comes back: did the browser ask the server for the pause picture again, and which picture does it show?
// LIVE = the page as it was live at a7da0ba (this build's page with every ?v= removed and its 3 selectors put back: byte-identical
// to the a7da0ba page, compared when task 01849ea5 was built), so step 2 leaves the page unchanged. VERSIONED = this build's page, and in step 2 the
// page names X with the version of its new bytes (what build.py writes once the file changed: mgs_parts.asset_hash).
// Red = LIVE shows the old picture without asking; green = VERSIONED asks and shows the new one.
//   node qa/cache-swap.mjs [m]
import { webkit } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), SITE = path.join(REPO, 'option-2.2', 'site');
const v = process.argv[2] || 'm';
const built = fs.readFileSync(path.join(REPO, 'option-2.2-mgs', v, 'index.html'), 'utf8');
const live = built.replace(/\?v=[0-9a-f]{10}/g, '').replace(/\[src\*="([\w.%-]+)\?v="\]/g, '[src$="$1"]');
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
const CACHE = (ext) => (/^\.(mp4|mp3|webp|jpg|png)$/.test(ext) ? 'public, max-age=604800' : /^\.(woff2|svg)$/.test(ext) ? 'public, max-age=2592000' : 'no-cache, max-age=0, must-revalidate');
const ver = (buf) => crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10);

async function run(name, page0) {
  let doc = page0, overlay = {}, log = [];
  const srv = http.createServer((q, r) => {
    const u = decodeURIComponent(new URL(q.url, 'http://x').pathname);
    if (u === `/${v}/` || u === `/${v}/index.html`) { r.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': CACHE('.html') }); return r.end(doc); }
    const m = u.match(new RegExp(`^/${v}/(.+)$`)); if (!m) { r.writeHead(404); return r.end(); }
    log.push(q.url);
    const body = overlay[m[1]] || (fs.existsSync(path.join(SITE, m[1])) ? fs.readFileSync(path.join(SITE, m[1])) : null);
    if (!body) { r.writeHead(404); return r.end(); }
    const ext = path.extname(m[1]); const rg = /bytes=(\d*)-(\d*)/.exec(q.headers.range || '');
    const h = { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': CACHE(ext), 'Accept-Ranges': 'bytes' };
    if (rg) { const a = +rg[1] || 0, b = rg[2] ? Math.min(+rg[2], body.length - 1) : body.length - 1; r.writeHead(206, { ...h, 'Content-Range': `bytes ${a}-${b}/${body.length}`, 'Content-Length': b - a + 1 }); return r.end(body.subarray(a, b + 1)); }
    r.writeHead(200, { ...h, 'Content-Length': body.length }); r.end(body);
  }).listen(0, '127.0.0.1');
  await new Promise((ok) => srv.on('listening', ok));
  const base = `http://127.0.0.1:${srv.address().port}/${v}/`;
  const b = await webkit.launch({ executablePath: process.env.WEBKIT || undefined });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }); ctx.setDefaultTimeout(120000);
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  const visit = async () => {
    await p.goto(base, { waitUntil: 'domcontentloaded', timeout: 120000 }); await p.waitForTimeout(1500);
    await p.evaluate(() => { const s = document.getElementById('pause'), r = document.documentElement; r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none'; scrollTo(0, s.getBoundingClientRect().top + scrollY); });
    await p.waitForTimeout(4000);
    return p.evaluate(async () => {
      const im = document.querySelector('#pause img[srcset], #pause img'); const u = im.currentSrc || im.src;
      const t = new Image(); t.src = u; try { await t.decode(); } catch (e) {}
      return { shown: u.replace(/^.*\/(img\/)/, '$1'), width: t.naturalWidth };
    });
  };
  // 1. first visit
  const first = await visit();
  const X = first.shown.replace(/\?v=.*$/, '');
  const rungs = [640, 960, 1280, 1920, 2560, 2906].map((w) => X.replace(/-\d+\.webp$/, `-${w}.webp`)).filter((f) => f !== X && fs.existsSync(path.join(SITE, f)));
  const other = rungs[0];                                             // the smallest other rung: its width differs, so it shows which bytes are drawn
  // 2. the picture is replaced on the server (and, VERSIONED, the page names its new version)
  const nb = fs.readFileSync(path.join(SITE, other)); overlay[X] = nb;
  if (name.startsWith('VERSIONED')) doc = doc.split(`${X}?v=${ver(fs.readFileSync(path.join(SITE, X)))}`).join(`${X}?v=${ver(nb)}`);
  log = [];
  await p.goto('about:blank');
  // 3. the visitor comes back
  const second = await visit();
  const asked = log.filter((u) => u.split('?')[0] === `/${v}/${X}`).length;
  console.log(`${name}: first visit drew ${first.shown} (${first.width} px wide). After the picture changed on the server, the second visit `
    + `${asked ? 'ASKED the server for it' : 'did NOT ask the server for it'} and drew ${second.shown} at ${second.width} px wide: `
    + `${second.width === first.width ? 'the OLD picture (cached)' : 'the NEW picture'}.`);
  await b.close(); srv.close();
  return { asked, old: second.width === first.width };
}

const red = await run('LIVE (a7da0ba page)', live);
const green = await run('VERSIONED (this build)', built);
const ok = red.old && !red.asked && !green.old && green.asked;
console.log(ok ? 'RED then GREEN: the live page keeps the old picture; the versioned page fetches and shows the new one.' : 'UNEXPECTED: see the lines above.');
process.exit(ok ? 0 : 1);
