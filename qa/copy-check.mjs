// One-off visual check (task 2846db82) of copy QA 5a4704a9 + the hero eyebrow placement fix:
//   tops     the opening of M, G, S at 1024, 1280, 1366, 1440, 1920 and 390, plus the boxes of its words (overlaps listed)
//   footers  #letters (salon) and #c-letters (Inner Work) of M, G, S at 1440 and 390, the whole footer
//   bar      G #hosts at 1366 after 7 s: whether the floating bar still sits over text once the page's last check ran
// node copy-check.mjs [chromium|webkit]   writes qa/out-check-<browser>/ and check.json; SIZES=390,768 PARTS=tops narrows it
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.argv[2] || process.env.BROWSER || 'chromium';
const OUT = path.join(REPO, 'qa', `out-check-${BROWSER}`);
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.mp4': 'video/mp4', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.json': 'application/json' };
const serve = () => new Promise((done) => {
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname), m = u.match(/^\/([mgs])\/(.*)$/);
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
const vp = (w, h) => ({ viewport: { width: w, height: h } });
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: BROWSER !== 'firefox', hasTouch: true };
const ALL = [['768', vp(768, 1024)], ['1024', vp(1024, 768)], ['1280', vp(1280, 800)], ['1366', vp(1366, 768)], ['1440', vp(1440, 900)], ['1920', vp(1920, 1080)], ['390', PHONE]];
const SIZES = ALL.filter(([w]) => !process.env.SIZES || process.env.SIZES.split(',').includes(w));   // SIZES=390,768: just those
const PARTS = (process.env.PARTS || 'tops,footers,bar').split(',');
const wait = (p, ms) => p.waitForTimeout(ms);
async function open(ctx, url) {
  const p = await ctx.newPage();
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' });
  await wait(p, 1500);
  return p;
}
const jump = (p, y) => p.evaluate((y) => {
  const r = document.documentElement, b = r.style.scrollBehavior, s = r.style.scrollSnapType;
  r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none'; scrollTo(0, y);
  requestAnimationFrame(() => { r.style.scrollSnapType = s; r.style.scrollBehavior = b; });
}, y);
// the opening's word boxes (the mark's letters measured on its drawn paths, not its svg box) and every pair that overlaps
const heroBoxes = (p) => p.evaluate(() => {
  const top = document.getElementById('top'), q = (s) => top.querySelector(s);
  const box = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) } : null; };
  const paths = [...top.querySelectorAll('.hero__mark svg path')].map(box).filter(Boolean);
  const B = { eyebrow: box(q('.hero__foot > .eyebrow')), line: box(q('.hero__line')), hook: box(q('.hero__hook')), cta: box(q('.hero__cta')), cue: box(q('.hero__cue')) };
  paths.forEach((b, i) => { B['mark' + i] = b; });
  const hit = (a, b) => a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
  const keys = Object.keys(B), over = [];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    if (keys[i].startsWith('mark') && keys[j].startsWith('mark')) continue;
    if (hit(B[keys[i]], B[keys[j]])) over.push(keys[i] + '×' + keys[j]);
  }
  return { boxes: B, over };
});
const barState = (p) => p.evaluate(() => {
  const b = document.querySelectorAll('.wdoor')[0];
  if (!b) return { bar: 'none' };
  const cs = getComputedStyle(b), shown = cs.display !== 'none' && +cs.opacity > .5, r = b.getBoundingClientRect(), under = [];
  if (shown) for (let i = 0; i <= 6; i++) for (let j = 0; j < 3; j++) {
    const x = r.left + 6 + (r.width - 12) * i / 6, y = r.top + 4 + (r.height - 8) * j / 2;
    for (const e of document.elementsFromPoint(x, y)) {
      if (b.contains(e) || e.closest('.wdoor, .hdr, .tw, .tw-btn')) continue;
      if (/^(SECTION|MAIN|BODY|HTML)$/.test(e.tagName)) break;
      if ([...e.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim()) && +getComputedStyle(e).opacity > .1) { under.push(e.tagName + ':' + e.textContent.trim().slice(0, 40)); break; }
    }
  }
  return { bar: shown ? 'shown' : 'hidden', opacity: cs.opacity, hold: document.documentElement.classList.contains('wdoor-hold'), under: [...new Set(under)] };
});

const srv = await serve(), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw[BROWSER].launch();
const log = { tops: [], footers: [], bar: null };
for (const v of ['m', 'g', 's']) {
  if (PARTS.includes('tops')) for (const [w, opt] of SIZES) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    await wait(p, 3500);      // the opening's words arrive by about 3 s
    await p.screenshot({ path: path.join(OUT, `${v}-top-${w}.jpg`), type: 'jpeg', quality: 80 });
    log.tops.push({ v, w, ...(await heroBoxes(p)) });
    await ctx.close();
  }
  if (PARTS.includes('footers')) for (const world of ['salon', 'coaching']) for (const [w, opt] of [['1440', vp(1440, 900)], ['390', PHONE]]) {
    const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/`);
    if (world === 'coaching') { await p.evaluate(() => document.querySelector('.worlds [data-to-world="coaching"]').click()); await wait(p, 2800); }
    const id = world === 'salon' ? 'letters' : 'c-letters';
    const y = await p.evaluate((id) => { const e = document.getElementById(id); return e.getBoundingClientRect().top + scrollY; }, id);
    await jump(p, y); await wait(p, 3000);
    await p.locator('#' + id).screenshot({ path: path.join(OUT, `${v}-${world}-${id}-${w}.jpg`), type: 'jpeg', quality: 80 });
    const brand = await p.evaluate((id) => [...document.querySelectorAll(`#${id} .foot__brand p`)].map((e) => e.textContent.trim()), id);
    log.footers.push({ v, world, w, brand });
    await ctx.close();
  }
}
if (PARTS.includes('bar')) {
  const ctx = await b.newContext(vp(1366, 768)), p = await open(ctx, `${base}/g/`);
  const y = await p.evaluate(() => document.getElementById('hosts').getBoundingClientRect().top + scrollY);
  await jump(p, y); await wait(p, 7000);
  await p.screenshot({ path: path.join(OUT, 'g-hosts-1366-7s.jpg'), type: 'jpeg', quality: 80 });
  log.bar = await barState(p);
  await ctx.close();
}
await b.close(); srv.close();
fs.writeFileSync(path.join(OUT, process.env.SIZES || process.env.PARTS ? `check-${process.env.SIZES || ''}${process.env.PARTS || ''}.json` : 'check.json'), JSON.stringify(log, null, 1));
console.log('overlaps:', log.tops.filter((t) => t.over.length).map((t) => `${t.v}-${t.w}: ${t.over.join(' ')}`).join(' | ') || 'none');
console.log('footers:', log.footers.map((f) => `${f.v}-${f.world}-${f.w}: ${f.brand.join(' / ')}`).join(' | '));
console.log('bar G hosts 1366 after 7 s:', JSON.stringify(log.bar));
