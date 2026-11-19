// the pause (task 2b1d1187; the door, task a73569a9): M and G's pause at 1440, 390, 768 and J's 6K window (3230 x 1319 CSS px at 2x, as sharpness.mjs), the settled frame
// plus frames while the picture opens. PZ_IMG=<file> serves that file as img/om-pause-guest.webp (a stand-in or a
// candidate) without touching the site's img folder. WebKit (Safari's engine; the pool's pinned build when %WEBKIT% is set).
// Usage: node pause.mjs <outdir> [m,g] [1440,390,768,3230] [salon|coaching]   (coaching: Inner Work's door, #c-pause)
import { webkit } from 'playwright';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out = 'pause-shots', vs = 'm,g', ws = '1440,390,3230', world = 'salon'] = process.argv.slice(2);
const sid = world === 'coaching' ? 'c-pause' : 'pause', tag = world === 'coaching' ? 'iw-' : '';
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO, (u, req, res) => {
  if (process.env.PZ_IMG && /\/img\/om-pause-guest\.webp$/.test(u.split('?')[0])) { res.writeHead(200, { 'Content-Type': 'image/webp' }); fs.createReadStream(process.env.PZ_IMG).pipe(res); return true; }
});
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch({ executablePath: process.env.WEBKIT || undefined });
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 768 ? { width: 768, height: 1024 } : w === 3230 ? { width: 3230, height: 1319 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: w === 3230 ? 2 : w === 390 ? 3 : 2, isMobile: w === 390, hasTouch: w === 390 }); ctx.setDefaultTimeout(120000);
  for (const v of vs.split(',')) {
    const p = await open(ctx, `${base}/${v}/`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    const y = await p.evaluate((sid) => document.getElementById(sid).getBoundingClientRect().top + scrollY, sid);
    await jump(p, y);
    for (const t of w === 3230 ? [] : [700, 1600]) { await wait(p, t === 700 ? 700 : 900); await p.screenshot({ path: `${out}/${tag}${v}-${w}-t${t}.jpg`, type: 'jpeg', quality: 80 }); }
    await wait(p, 5200);
    await p.screenshot({ path: `${out}/${tag}${v}-${w}.jpg`, type: 'jpeg', quality: 82, timeout: 180000 });
    const m = await p.evaluate((sid) => { const i = document.querySelector('#' + sid + ' .br__ph img'), r = i.getBoundingClientRect();
      // with srcset, naturalWidth is the slot's width, not the file's: read the width of the file the browser chose
      const fw = +((i.currentSrc.replace(/\?.*$/, '').match(/-(\d+)\.webp$/) || [])[1] || 0) || 1280;
      return { css: [Math.round(r.width), Math.round(r.height)], file: i.currentSrc.split('/').pop(), fileW: fw, devPerFile: +(r.width * devicePixelRatio / fw).toFixed(2) }; }, sid);
    console.log(world, v, w, JSON.stringify(m));
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
