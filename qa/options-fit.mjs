// The option switcher's layouts against the screen (task e5325977): the door's words either side of the arch, never under or
// off it; Cinema's and The breath's last words clear of the floating booking bar; Why Aveda's ten options and the page's own
// options inside a laptop's screen. M and G at 1440x900, 1280x800 and J's 6K window (3230x1319). WebKit. <out>/fit.json + shots.
//   node options-fit.mjs [out]
import * as pw from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { serve, jump, wait } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-options-fit')); fs.mkdirSync(OUT, { recursive: true });
// SITE=live measures the deployed sites (salon-om-2-2-<v>.web.app) instead of this checkout
const LIVE = process.env.SITE === 'live', srv = LIVE ? null : await serve(REPO);
const url = (v, q = '') => (LIVE ? `https://salon-om-2-2-${v}.web.app/` : `http://127.0.0.1:${srv.address().port}/${v}/`) + q;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), checks: [] };
const ok = (n, p, i) => { res.checks.push({ n, pass: !!p, i }); console.log(p ? 'PASS' : 'FAIL', n, JSON.stringify(i)); };
const box = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(), st = getComputedStyle(e);
  return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom), w: Math.round(r.width), op: +st.opacity }; }, sel);
for (const [W, H] of [[1440, 900], [1280, 800], [3230, 1319]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H } });
  for (const v of ['m', 'g']) {
    const go = async (q, id, f = 0, ms = 6500) => {
      const p = await ctx.newPage(); await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
      await p.goto(url(v, '?' + q), { waitUntil: 'load', timeout: 120000 }); await wait(p, 1500);   // a busy pool machine took over 30 s once
      await jump(p, await p.evaluate(([id, f]) => { const s = document.getElementById(id); return s.getBoundingClientRect().top + scrollY + (s.offsetHeight - innerHeight) * f; }, [id, f]));
      await wait(p, ms); return p;
    };
    // the door: label and question end before the arch, the last line starts after it, all on screen
    let p = await go('opt-pause=door', 'pause');
    const [lab, txt, door, lead] = [await box(p, '#pause .mani__label'), await box(p, '#pause .mani__text'), await box(p, '#pause .br'), await box(p, '#pause .lead')];
    ok(`${v} ${W}: the door's words either side of it`, txt.l >= 0 && lab.l >= 0 && txt.r <= door.l && lab.r <= door.l && lead.l >= door.r && lead.r <= W && lead.op > .9 && Math.abs((door.l + door.r) / 2 - W / 2) < W * .08,
      { label: lab, text: txt, door, lead });
    await p.screenshot({ path: path.join(OUT, `${v}-${W}-door.jpg`), type: 'jpeg', quality: 75 }); await p.close();
    // Cinema and The breath: their last words above the floating booking bar
    p = await go('opt-pause=cinema', 'pause');
    let bar = await box(p, '.wdoor:not(.wdoor--back)'), last = await box(p, '#pause .ps__breath'), side = await box(p, '#pause .ps__side');
    ok(`${v} ${W}: Cinema clear of the booking bar`, !bar || bar.op < .1 || Math.max(last.b, side.b) <= bar.t - 8, { last, side, bar });
    await p.screenshot({ path: path.join(OUT, `${v}-${W}-cinema.jpg`), type: 'jpeg', quality: 75 }); await p.close();
    // The breath wherever it sits: today's default (J's pick, task 95ac520e) or an option
    p = await go('', 'pause', .97, 2500);
    if (!(await p.evaluate(() => document.getElementById('pause').classList.contains('ps--breath')))) { await p.close(); p = await go('opt-pause=breath', 'pause', .97, 2500); }
    bar = await box(p, '.wdoor:not(.wdoor--back)'); last = await box(p, '#pause .ps__coda');
    ok(`${v} ${W}: The breath's last line clear of the booking bar`, !bar || bar.op < .1 || last.b <= bar.t - 8, { last, bar });
    await p.screenshot({ path: path.join(OUT, `${v}-${W}-breath.jpg`), type: 'jpeg', quality: 75 }); await p.close();
    // Why Aveda's ten options and the page's own fit the screen (no inner scroll)
    p = await go('', 'aveda', 0, 2500); await p.keyboard.press('Shift+V'); await wait(p, 700);
    const pn = await p.evaluate(() => { const e = document.getElementById('opt-panel'); const r = e.getBoundingClientRect();
      return { t: Math.round(r.top), b: Math.round(r.bottom), sh: e.scrollHeight, ch: e.clientHeight, sec: e.querySelector('.opt__sec').textContent, nums: [...e.querySelectorAll('.opt__row b')].map((x) => x.textContent).join(''), n: Math.min(10, JSON.parse(document.getElementById('aveda').dataset.opts).length) }; });
    ok(`${v} ${W}: Why Aveda's panel fits, named, every row numbered`, pn.sh <= pn.ch + 1 && pn.t >= 0 && pn.sec === 'Why Aveda' && pn.nums === '1234567890'.slice(0, pn.n), pn);
    await p.screenshot({ path: path.join(OUT, `${v}-${W}-aveda-panel.jpg`), type: 'jpeg', quality: 75 }); await p.close();
  }
  await ctx.close();
}
res.pass = res.checks.every((c) => c.pass);
fs.writeFileSync(path.join(OUT, 'fit.json'), JSON.stringify(res, null, 2));
console.log(res.pass ? 'ALL PASS' : 'SOME FAIL', res.checks.filter((c) => !c.pass).length, 'failed of', res.checks.length);
await b.close(); if (srv) srv.close();
