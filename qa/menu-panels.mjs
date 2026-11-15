// The menu's pictures as the reader sees them (task 2846db82, round 5): for each row, open it and capture the desktop
// photo panel (1440) and, on a phone (390), the row with its own photo. Judges the crop and focus point of every menu
// picture, which a whole-section capture cannot (the panel shows one row at a time).
//   node menu-panels.mjs [chromium|webkit] [m,g,s]      -> qa/out-<browser>/menu-<v>-<row>-<width>.jpg
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.argv[2] || 'chromium';
const VERS = (process.argv[3] || 'g').split(',');
const OUT = path.join(REPO, 'qa', `out-${BROWSER}`);
fs.mkdirSync(OUT, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };

// the same mapping as r4.mjs: /<v>/ is the built page, anything else the 2.2 site's assets
const srv = await new Promise((done) => {
  const s = http.createServer((req, res) => {
    const m = decodeURIComponent(new URL(req.url, 'http://x').pathname).match(/^\/([mgs])\/(.*)$/);
    if (!m) { res.writeHead(404); return res.end(); }
    const file = !m[2] || m[2] === 'index.html' ? path.join(REPO, 'option-2.2-mgs', m[1], 'index.html') : path.join(REPO, 'option-2.2', 'site', m[2]);
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' }); res.end(buf);
    });
  }).listen(0, '127.0.0.1', () => done(s));
});
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await pw[BROWSER].launch();
try {
  for (const v of VERS) {
    for (const [w, opts] of [[1440, { viewport: { width: 1440, height: 900 } }], [390, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: BROWSER === 'chromium', hasTouch: true }]]) {
      const ctx = await browser.newContext(opts), p = await ctx.newPage();
      await p.goto(`${base}/${v}/`, { waitUntil: 'load' });
      await p.waitForTimeout(1500);
      const n = await p.locator('#services .mn__row').count();
      for (let i = 0; i < n; i++) {
        const row = p.locator('#services .mn__row').nth(i);
        await row.scrollIntoViewIfNeeded();
        await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await row.click({ position: { x: 40, y: 20 } }).catch(() => {});
        await p.waitForTimeout(1600);
        const target = w === 1440 ? p.locator('#services .mn__ph').first() : row;
        await target.screenshot({ path: path.join(OUT, `menu-${v}-${i + 1}-${w}.jpg`), type: 'jpeg', quality: 82 });
      }
      console.log(v, w, n, 'rows');
      await ctx.close();
    }
  }
} finally { await browser.close(); srv.close(); }
