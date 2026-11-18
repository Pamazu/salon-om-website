// Pictures as J sees them on his 6K screen (task b1dd24c9): each visit step while its photo shows (before the film
// dissolves in) and each menu row's photo panel, at 3230 x 1319 CSS px @2x, plus a 1:1 detail from the middle of each.
//   node shots6k.mjs <base: live URL like https://salon-om-2-2-m.web.app/ | local> <out dir> [m|g|s]
// "local" serves this checkout's build (lib.mjs). Out: step-<id>.jpg, step-<id>-1to1.jpg, menu-<n>.jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, open, wait } from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [, , BASE, OUT, V = 'm'] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
const srv = BASE === 'local' ? await serve(REPO) : null;
const url = (srv ? `http://127.0.0.1:${srv.address().port}/${V}/` : BASE) + '?shot';   // ?shot: every section shown arrived, films held
const browser = await pw.chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 3230, height: 1319 }, deviceScaleFactor: 2 });
  const p = await open(ctx, url);
  for (const id of ['arrive', 'unwind', 'renew', 'unhurried', 'home']) {
    if (!(await p.$('#' + id))) continue;
    await p.evaluate((id) => document.getElementById(id).scrollIntoView({ block: 'start' }), id);
    await wait(p, 2200);                                   // the photo shows; the film dissolves in at about 4 s
    // wait (at most 8 s) for the pictures on screen to finish loading: a lazy one off screen never does
    await p.evaluate(() => Promise.race([new Promise((r) => setTimeout(r, 8000)), Promise.all([...document.images].filter((i) => {
      const b = i.getBoundingClientRect(); return !i.complete && b.bottom > 0 && b.top < innerHeight; }).map((i) => new Promise((r) => { i.onload = i.onerror = r; })))]));
    await p.screenshot({ path: path.join(OUT, `step-${id}.jpg`), type: 'jpeg', quality: 90, timeout: 120000 });
    await p.screenshot({ path: path.join(OUT, `step-${id}-1to1.jpg`), type: 'jpeg', quality: 92, clip: { x: 1615 - 450, y: 660 - 300, width: 900, height: 600 }, scale: 'device', timeout: 120000 });
  }
  const rows = await p.locator('#services .mn__row').count();
  for (let i = 0; i < rows; i++) {
    const row = p.locator('#services .mn__row').nth(i);
    await row.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await row.hover({ position: { x: 40, y: 20 } }).catch(() => {});
    await row.click({ position: { x: 40, y: 20 } }).catch(() => {});
    await wait(p, 1800);
    await p.locator('#services .mn__ph').first().screenshot({ path: path.join(OUT, `menu-${i + 1}.jpg`), type: 'jpeg', quality: 90, timeout: 120000 });
  }
  // every other real photo in its own slot, as drawn, in each world: pic-<section>.jpg
  const { toWorld } = await import('./lib.mjs');
  for (const [world, ids] of [['salon', ['hosts', 'begin', 'deeper']], ['coaching', ['c-hosts', 'c-begin', 'c-deeper', 'c-aveda']]]) {
    if (world === 'coaching') await toWorld(p, 'coaching');
    for (const id of ids) {
      const im = p.locator(`#${id} img[src^="img/real-"], #${id} img[src="img/meadow.webp"]`).first();
      if (!(await im.count())) continue;
      await im.evaluate((el) => el.scrollIntoView({ block: 'center' }));
      await wait(p, 2500);
      const box = await im.boundingBox();
      if (!box || box.width < 50) continue;
      const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, 3230 - Math.max(0, box.x)), height: Math.min(box.height, 1319 - Math.max(0, box.y)) };
      await p.screenshot({ path: path.join(OUT, `pic-${id}.jpg`), type: 'jpeg', quality: 92, clip, timeout: 120000 });
    }
  }
  console.log(url, '->', OUT);
} finally { await browser.close(); srv?.close(); }
