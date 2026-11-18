// the pause (task 2b1d1187): M and G's pause at 1440, 390 and J's 6K-wide window (3230 CSS px at 2x), the settled frame
// plus frames while the picture opens. PZ_IMG=<file> serves that file as img/om-pause-guest.webp (a stand-in or a
// candidate) without touching the site's img folder. Usage: node pause.mjs <outdir> [m,g] [1440,390,3230]
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait } from './lib.mjs';
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [out = 'pause-shots', vs = 'm,g', ws = '1440,390,3230'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO, (u, req, res) => {
  if (process.env.PZ_IMG && /\/img\/om-pause-guest\.webp$/.test(u)) { res.writeHead(200, { 'Content-Type': 'image/webp' }); fs.createReadStream(process.env.PZ_IMG).pipe(res); return true; }
});
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await chromium.launch();
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 3230 ? { width: 3230, height: 1900 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: w === 3230 ? 2 : w === 390 ? 3 : 2, isMobile: w === 390, hasTouch: w === 390 });
  for (const v of vs.split(',')) {
    const p = await open(ctx, `${base}/${v}/`);
    const y = await p.evaluate(() => document.getElementById('pause').offsetTop);
    await jump(p, y);
    for (const t of w === 3230 ? [] : [700, 1600]) { await wait(p, t === 700 ? 700 : 900); await p.screenshot({ path: `${out}/${v}-${w}-t${t}.jpg`, type: 'jpeg', quality: 80 }); }
    await wait(p, 5200);
    await p.screenshot({ path: `${out}/${v}-${w}.jpg`, type: 'jpeg', quality: 82, timeout: 180000 });
    const m = await p.evaluate(() => { const i = document.querySelector('#pause .br__ph img'), r = i.getBoundingClientRect();
      // with srcset, naturalWidth is the slot's width, not the file's: read the width of the file the browser chose
      const fw = +((i.currentSrc.match(/-(\d+)\.webp$/) || [])[1] || 0) || 1280;
      return { css: [Math.round(r.width), Math.round(r.height)], file: i.currentSrc.split('/').pop(), fileW: fw, devPerFile: +(r.width * devicePixelRatio / fw).toFixed(2) }; });
    console.log(v, w, JSON.stringify(m));
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
