import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`; const OUT = process.argv[2]; fs.mkdirSync(OUT, { recursive: true });
const b = await pw.webkit.launch(); const rows = [];
for (const [W, H] of [[390, 844], [393, 660], [1440, 900]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 600, hasTouch: W < 600 });
  for (const v of ['m']) { const p = await open(ctx, `${base}/${v}/`);
    for (const id of ['arrive', 'unwind', 'renew', 'unhurried', 'home']) {
      const y = await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY), id);
      await jump(p, y); await wait(p, 3200);
      const boxes = await p.evaluate((id) => { const s = document.getElementById(id); const g = (q) => [...s.querySelectorAll(q)].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)]; }); return { body: g('.ch__body')[0], specs: g('.ch__specs')[0], title: g('.ch__title')[0], meta: g('.ch__meta')[0] }; }, id);
      const f = path.join(OUT, `${v}-${id}-${W}x${H}.png`); await p.screenshot({ path: f }); rows.push({ v, id, W, H, f, boxes }); }
    await p.close(); }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'boxes.json'), JSON.stringify(rows)); await b.close(); srv.close();
