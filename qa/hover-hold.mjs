// A menu row stays open under a still mouse (task 0e3c8e1c). For each row of the M/G/S menu at 1440: glide the mouse onto
// the row, keep it still for HOLD ms, and log every row change (which row opened, and the event that opened it).
// PASS = every row stays the open one for the whole hold. Touch (390) and keyboard: a tap and Enter still open a row.
//   node hover-hold.mjs [chromium|webkit] [m,g,s] [local|live]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.argv[2] || 'chromium';
const VERS = (process.argv[3] || 'm,g,s').split(',');
const LIVE = process.argv[4] === 'live';
const HOLD = 9000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png',
  '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.json': 'application/json' };

// the same mapping as menu-panels.mjs: /<v>/ is the built page, anything else the 2.2 site's assets
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
const url = (v) => LIVE ? `https://salon-om-2-2-${v}.web.app/?nocache=${Date.now()}` : `http://127.0.0.1:${srv.address().port}/${v}/`;

// in the page: log each row change with the last pointer event a row received
const SPY = () => {
  window.__log = []; const t0 = performance.now(); let last = '';
  const rows = [...document.querySelectorAll('#services .mn__row')];
  rows.forEach((r, i) => ['pointerenter', 'pointerleave', 'click', 'focusin'].forEach((ev) =>
    r.addEventListener(ev, () => { last = `${ev} ${i}`; window.__log.push({ t: Math.round(performance.now() - t0), ev: `${ev} ${i}` }); }, true)));
  new MutationObserver(() => { const on = rows.findIndex((r) => r.classList.contains('is-on')); window.__log.push({ t: Math.round(performance.now() - t0), open: on, after: last }); })
    .observe(document.querySelector('#services .mn__list'), { subtree: true, attributes: true, attributeFilter: ['class'] });
};
const openRow = (p) => p.evaluate(() => [...document.querySelectorAll('#services .mn__row')].findIndex((r) => r.classList.contains('is-on')));
const panelRow = (p) => p.evaluate(() => [...document.querySelectorAll('#services .mn__ph > [data-i]')].findIndex((r) => r.classList.contains('is-on')));

let fails = 0;
const browser = await pw[BROWSER].launch();
try {
  for (const v of VERS) {
    // mouse at 1440
    let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }), p = await ctx.newPage();
    await p.goto(url(v), { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    await p.evaluate(() => document.getElementById('services').scrollIntoView());
    await p.waitForTimeout(2500);
    await p.evaluate(SPY);
    const n = await p.locator('#services .mn__row').count();
    let mx = 1440 - 40, my = 450; await p.mouse.move(mx, my);
    for (let i = 0; i < n; i++) {
      const box = await p.locator('#services .mn__row').nth(i).boundingBox();
      const tx = box.x + Math.min(box.width / 2, 300), ty = box.y + Math.min(box.height / 2, 40);
      if (ty < 80 || ty > 860) { await p.locator('#services .mn__row').nth(i).scrollIntoViewIfNeeded(); await p.waitForTimeout(800); i--; continue; }
      await p.evaluate(() => window.__log.push({ t: -1, ev: '--- move' }));
      await p.mouse.move(tx, ty, { steps: 12 });
      const seen = new Set();
      for (let t = 0; t < HOLD; t += 300) { await p.waitForTimeout(300); seen.add(await openRow(p)); }
      const held = seen.size === 1 && seen.has(i), panel = await panelRow(p);
      const log = await p.evaluate(() => window.__log.splice(0));
      if (!held || panel !== i) fails++;
      console.log(`${v} 1440 row ${i}: ${held && panel === i ? 'PASS' : 'FAIL'} open rows seen ${[...seen].join(',')} · panel ${panel}`);
      if (!held) console.log('   ' + log.filter((e) => e.t >= 0).map((e) => e.ev || `open ${e.open} (after ${e.after})`).join(' | '));
    }
    // the page moves under a still mouse (a wheel scroll, then the page's own settle): no row opens by itself
    for (const [k, by] of [[1, 260], [3, -260], [4, 420]]) {
      const r = p.locator('#services .mn__row').nth(k);
      await r.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' })); await p.waitForTimeout(1200);
      const box = await r.boundingBox();
      await p.mouse.move(box.x + Math.min(box.width / 2, 300) - 30, box.y + 20, { steps: 4 });
      await p.mouse.move(box.x + Math.min(box.width / 2, 300), box.y + 24, { steps: 8 });
      await p.waitForTimeout(800);
      const before = await openRow(p);
      await p.evaluate(() => window.__log.splice(0));
      await p.mouse.wheel(0, by); await p.waitForTimeout(2500);
      const seen = new Set();
      for (let t = 0; t < 3000; t += 300) { await p.waitForTimeout(300); seen.add(await openRow(p)); }
      const log = await p.evaluate(() => window.__log.splice(0)), ok = before === k && seen.size === 1 && seen.has(k);
      if (!ok) fails++;
      console.log(`${v} 1440 still mouse on row ${k}, page moves ${by}px: ${ok ? 'PASS' : 'FAIL'} open before ${before}, after ${[...seen].join(',')}`);
      if (!ok) console.log('   ' + log.map((e) => e.ev || `open ${e.open} (after ${e.after})`).join(' | '));
    }
    // then a small move opens the row now under the mouse; and with the mouse off the list the menu drifts on its own again
    {
      const pt = await p.evaluate(() => { const r = [...document.querySelectorAll('#services .mn__row')][2]; r.scrollIntoView({ block: 'center', behavior: 'instant' }); const b = r.getBoundingClientRect(); return { x: b.x + 200, y: b.y + 24 }; });
      await p.waitForTimeout(1200);
      await p.mouse.move(pt.x - 6, pt.y + 2, { steps: 3 }); await p.mouse.move(pt.x, pt.y, { steps: 3 }); await p.waitForTimeout(700);
      const moved = await openRow(p);
      const out = await p.evaluate(() => { const b = document.querySelector('#services .mn__ph').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + 60 }; });
      await p.mouse.move(out.x, out.y, { steps: 10 });
      const seen = new Set();
      for (let t = 0; t < 9000; t += 500) { await p.waitForTimeout(500); seen.add(await openRow(p)); }
      const ok = moved === 2 && seen.size > 1;
      if (!ok) fails++;
      console.log(`${v} 1440 small move opens row 2 -> ${moved} · mouse off the list, rows drift ${[...seen].join(',')}: ${ok ? 'PASS' : 'FAIL'}`);
    }
    await ctx.close();
    // touch at 390: a tap opens the row and it stays open
    ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: BROWSER === 'chromium', hasTouch: true }); p = await ctx.newPage();
    await p.goto(url(v), { waitUntil: 'load' });
    await p.waitForTimeout(1500);
    const row = p.locator('#services .mn__row').nth(2);
    await row.scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
    await row.tap(); await p.waitForTimeout(1200);
    const tap = await openRow(p);
    // keyboard: focus row 1 and press Enter
    await p.locator('#services .mn__row').nth(1).focus(); await p.keyboard.press('Enter'); await p.waitForTimeout(600);
    const key = await openRow(p);
    if (tap !== 2 || key !== 1) fails++;
    console.log(`${v} 390 tap row 2 -> open ${tap} · keyboard row 1 -> open ${key}: ${tap === 2 && key === 1 ? 'PASS' : 'FAIL'}`);
    await ctx.close();
  }
} finally { await browser.close(); srv.close(); }
console.log(fails ? `FAIL ${fails}` : 'PASS');
process.exitCode = fails ? 1 : 0;
