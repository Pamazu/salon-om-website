// QA tool (task 5479dd6c): approved-features rows with a number behind them, M/G/S on the integrated build, WebKit 1440x900
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
for (const v of ['m', 'g', 's']) {
  const p = await open(ctx, `${base}/${v}/`); const out = { v };
  const Y = (id) => p.evaluate((id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : -1; }, id);
  // rows 2, 1 (sound attrs), 3: the five steps
  out.steps = await p.evaluate(() => ['arrive', 'unwind', 'renew', 'unhurried', 'home'].map((id) => { const s = document.getElementById(id); return s ? [id, s.getAttribute('data-sound'), (s.querySelector('.ch__top img, .vs__ph img') || {}).getAttribute?.('src')] : [id, null, null]; }));
  // row 6: the menu photo panel stays while the list scrolls (desktop)
  const ys = await Y('services'); if (ys >= 0) {
    const tops = []; for (const dy of [120, 420, 720]) { await jump(p, ys + dy); await wait(p, 500); tops.push(await p.evaluate(() => { const e = document.querySelector('#services .mn__ph'); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.height), getComputedStyle(e).position]; })); }
    out.menuPanel = tops;
  }
  // row 4: the visit preview's line reaches 05 / the stops travel into the rail when the first step arrives
  const yv = await Y('visit'), ya = await Y('arrive');
  if (yv >= 0 && ya >= 0) { await jump(p, yv); await wait(p, 3500); const before = await p.evaluate(() => [...document.querySelectorAll('#visit .lnsec__stop, #visit [class*=stop], #visit li')].length); await jump(p, ya); await wait(p, 1800); out.rail = await p.evaluate(() => { const r = document.querySelector('.rail'); return r ? [r.className, getComputedStyle(r).opacity, r.querySelectorAll('a').length, document.querySelectorAll('.rail a.is-active, .rail a.is-land').length] : null; }); out.previewStops = before; }
  // row 13: one call to action per world (the header's, the floating bar's, the hero's)
  out.ctaSalon = await p.evaluate(() => ({ header: document.querySelector('.hdr__book.w-salon')?.textContent.trim(), bar: document.querySelector('.wdoor, .cbar, .dock')?.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) }));
  await toWorld(p, 'coaching');
  out.ctaCoaching = await p.evaluate(() => ({ header: document.querySelector('.hdr__book.w-coaching')?.textContent.trim() }));
  // row 10: Inner Work's sections: which are dark
  out.dark = await p.evaluate(() => [...document.querySelectorAll('#main-coaching > section.s')].map((s) => [s.id, s.getAttribute('data-tone') || '']));
  // row 14: the footer sits inside the closing slide
  out.foot = await p.evaluate(() => { const f = document.querySelector('#main-salon footer'); const s = f?.closest('section'); return f && s ? [s.id, Math.round(s.getBoundingClientRect().height)] : null; });
  console.log(JSON.stringify(out));
  await p.close();
}
await b.close(); srv.close();
