// Why one tall section misses its pull (task 95e37a41): r4 snap's step b (jump 200 px short of the section's end, scroll slowly
// 320 px on), then every 50 ms for 2.5 s the scroll position, the section's top, bottom and height, the next section's top, and
// any sheet stage's own height and min-height, so a move that is not the pull shows where it comes from. WebKit (%WEBKIT%).
// Usage: node qa/pull-probe.mjs <m|g> <salon|coaching> <section id> [390|1440]
import { webkit } from 'playwright';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [v = 'm', world = 'coaching', id = 'c-aveda', w = '390'] = process.argv.slice(2);
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const phone = +w < 600;
const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const p = await open(ctx, `${base}/${v}/`);
if (world === 'coaching') await toWorld(p, 'coaching');
const g = await p.evaluate((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; }, id);
console.log('section', id, JSON.stringify(g));
await jump(p, g.top); await wait(p, 900);
await jump(p, g.top + g.h - g.vh - 200); await wait(p, 900);
await p.evaluate((id) => {
  const s = document.getElementById(id), nx = s.nextElementSibling, st = s.querySelector('.sh'), t0 = performance.now(); window.__probe = [];
  const rec = (why) => { const r = s.getBoundingClientRect(); window.__probe.push({ t: Math.round(performance.now() - t0), why, y: Math.round(scrollY), top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height), next: nx && Math.round(nx.getBoundingClientRect().top), sh: st && Math.round(st.getBoundingClientRect().height), mh: st && st.style.minHeight, snap: document.documentElement.style.scrollSnapType }); };
  addEventListener('scroll', () => rec('scroll'), { passive: true });
  const iv = setInterval(() => rec('tick'), 50); setTimeout(() => clearInterval(iv), 4000);
}, id);
const n = Math.round(320 / 60);
for (let i = 0; i < n; i++) { await p.evaluate((d) => scrollBy({ top: d, behavior: 'instant' }), 320 / n); await wait(p, 40); }
await wait(p, 2500);
const rows = await p.evaluate(() => window.__probe);
let last = '';
for (const r of rows) { const k = `${r.y}|${r.h}|${r.sh}|${r.mh}|${r.snap}`; if (k !== last || r.why === 'scroll') console.log(JSON.stringify(r)); last = k; }
await b.close(); srv.close();
