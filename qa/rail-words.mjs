// QA tool (task c4360b88): over each film section, the step's words are clear of the rail. Compares the real text LINES (Range
// rects of every text node in the section's copy) with the rail's links, 6 px apart at least, at 1440 and 390, in WebKit.
//   node rail-words.mjs <m|g|s,...> <outdir>
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERS = (process.argv[2] || 'm,g,s').split(','), OUT = process.argv[3] || 'out-rail-words'; fs.mkdirSync(OUT, { recursive: true });
const SIZES = [['1440', { viewport: { width: 1440, height: 900 } }], ['390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]];
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(); const all = [];
for (const [sz, opt] of SIZES) for (const v of VERS) {
  const ctx = await b.newContext(opt); const p = await open(ctx, `${base}/${v}/`);
  for (const w of ['salon', 'coaching']) {
    if (w === 'coaching') await toWorld(p, 'coaching');
    const ids = await p.evaluate((w) => [...document.querySelectorAll(`#main-${w} > section.s`)].filter((s) => s.querySelector('video')).map((s) => s.id), w);
    for (const id of ids) {
      const y = await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY), id);
      await jump(p, y); await wait(p, 3400);   // everything in (the copy arrives in 2-3 s)
      const r = await p.evaluate((id) => {
        const s = document.getElementById(id), rail = document.getElementById('rail'), vw = innerWidth, vh = innerHeight;
        const cs = rail ? getComputedStyle(rail) : null, railOn = !!rail && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05;
        const links = railOn ? [...rail.querySelectorAll('a')].map((a) => { const q = a.getBoundingClientRect(); return { t: a.textContent.replace(/\s+/g, ' ').trim(), l: q.left, t0: q.top, r: q.right, b: q.bottom }; }).filter((q) => q.r - q.l > 2 && q.b - q.t0 > 2) : [];
        const lines = []; const tw = document.createTreeWalker(s.querySelector('.s__leave') || s, NodeFilter.SHOW_TEXT);
        for (let n = tw.nextNode(); n; n = tw.nextNode()) {
          if (!n.textContent.trim()) continue; const e = n.parentElement, st = getComputedStyle(e);
          if (st.visibility === 'hidden' || +st.opacity < 0.05 || e.closest('.sr,[aria-hidden="true"] .sr')) continue;
          const g = document.createRange(); g.selectNodeContents(n);
          for (const q of g.getClientRects()) if (q.width > 1 && q.height > 4 && q.bottom > 0 && q.top < vh) lines.push({ x: n.textContent.trim().slice(0, 24), l: q.left, t0: q.top, r: q.right, b: q.bottom, cls: String(e.className).slice(0, 18) });
        }
        const hits = [];
        for (const q of lines) { for (const a of links) if (q.l < a.r + 6 && q.r > a.l - 6 && q.t0 < a.b + 6 && q.b > a.t0 - 6) hits.push(`"${q.x}" (${q.cls}) x rail ${a.t}`); if (q.r > vw + 1 || q.l < -1) hits.push(`"${q.x}" off-screen`); }
        const rb = railOn ? rail.getBoundingClientRect() : null;
        return { railOn, rail: rb ? [Math.round(rb.left), Math.round(rb.top), Math.round(rb.right), Math.round(rb.bottom)] : null, lines: lines.length, hits: [...new Set(hits)].slice(0, 8) };
      }, id);
      all.push({ v, sz, w, id, ...r });
      await p.screenshot({ path: path.join(OUT, `${v}-${sz}-${w}-${id}.jpg`), type: 'jpeg', quality: 80 });
    }
  }
  await ctx.close();
  const mine = all.filter((x) => x.v === v && x.sz === sz);
  console.log(v, sz, 'film sections', mine.length, 'rail shown on', mine.filter((x) => x.railOn).length, 'clashes:', mine.filter((x) => x.hits.length).map((x) => `${x.w}:${x.id} ` + x.hits.join('; ')).join(' | ') || 'none');
}
fs.writeFileSync(path.join(OUT, 'rail-words.json'), JSON.stringify(all, null, 1));
await b.close(); srv.close();
