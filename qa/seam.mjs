// the seam between two sections (task 9999ef8a): how one section runs on into the next, as a visitor scrolls. For each
// width: the two sections whole, stacked as the page lays them out (?shot: every section arrived), and a strip of frames as
// the page scrolls from the first one's end into the second. SITE=<a tree> serves another commit's pages (run-at-ref
// --mirror OLD=salon-om-website@<sha>:tree, SITE=$OLD) with this commit's tools. WebKit, the pool's pinned one when given.
// The same id twice: that one section whole, and the strip through it (its top at the window's top to its end at the window's end).
// Usage: node seam.mjs <outdir> <v> <from-id> <to-id> [1440,390] [query, e.g. opt-hosts=flow] [label]
import * as pw from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { serve, open, jump, wait } from './lib.mjs';
// fileURLToPath, never URL.pathname: on Windows the pathname is "/C:/...", the server then finds no page (the PC, 21 Nov)
const REPO = process.env.SITE || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [out = 'seam', v = 'g', a = 'aveda', z = 'hosts', ws = '1440,390', qs = '', label = 'now'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const geo = (ids) => ids.map((id) => { const e = document.getElementById(id); if (!e) return null; const r = e.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), h: Math.round(r.height) }; });
for (const w of ws.split(',').map(Number)) {
  const phone = w < 600, size = phone ? { width: w, height: 844 } : { width: w, height: w >= 1440 ? 900 : 768 };
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  const q = (extra) => `${base}/${v}/?${[qs, extra].filter(Boolean).join('&')}`;
  // the two sections whole, as laid out
  let p = await open(ctx, q('shot'));
  await p.waitForSelector('#' + z, { state: 'attached', timeout: 20000 }).catch(() => null);
  await wait(p, 1500);
  const [ga, gz] = await p.evaluate(geo, [a, z]);
  if (!ga || !gz) { console.log('missing', a, !!ga, z, !!gz, v, w); await ctx.close(); continue; }
  const f = path.join(out, `${label}-${v}-${w}-whole.jpg`);
  await p.screenshot({ path: f, type: 'jpeg', quality: 72, fullPage: true, clip: { x: 0, y: ga.y, width: size.width, height: gz.y + gz.h - ga.y } });
  console.log(f, JSON.stringify({ [a]: ga, [z]: gz }));
  await p.close();
  // the scroll from the first section's end into the second, as a visitor sees it
  p = await open(ctx, q(''));
  await p.waitForSelector('#' + z, { state: 'attached', timeout: 20000 }).catch(() => null);
  const [ha, hz] = await p.evaluate(geo, [a, z]);
  const one = a === z, from = one ? ha.y : ha.y + Math.max(0, ha.h - size.height), to = one ? ha.y + Math.max(0, ha.h - size.height) : hz.y, n = 6;
  for (let k = 0; k <= n; k++) {
    await jump(p, Math.round(from + (to - from) * k / n)); await wait(p, 1400);
    await p.screenshot({ path: path.join(out, `${label}-${v}-${w}-seam-${k}.jpg`), type: 'jpeg', quality: 66 });
  }
  await ctx.close();
}
await b.close(); srv.close();
