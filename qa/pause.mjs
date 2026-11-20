// the pause (tasks 2b1d1187, e1a1e009): M and G's pause, B · The breath, at 1440, 390 and J's 6K window (3230 x 1319 CSS px at
// 2x), in WebKit (J's Safari). A frame at each point of the breath (0.15 the room opening, 0.5 the in-breath full, 0.72 the
// out-breath with the question, 1 at rest) and, at the last two, the same frame with the words hidden plus each line's box and
// colour, so the contrast behind every line is read from the pixels (qa/pause_contrast.py). At 1440 also a strip of eleven
// frames through the section, to see the breath move. ENGINE=chromium for Chromium (the PC). The pool's pinned browser when
// given (WEBKIT=, run-at-ref --asset WEBKIT; CHROME= or SDELEGATE_CHROMIUM=), else Playwright's own.
// Usage: node pause.mjs <outdir> [m,g] [1440,390,3230]
import * as pw from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait } from './lib.mjs';
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [out = 'pause-shots', vs = 'm,g', ws = '1440,390,3230'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const ENGINE = process.env.ENGINE || 'webkit', exe = ENGINE === 'webkit' ? process.env.WEBKIT : process.env.CHROME || process.env.SDELEGATE_CHROMIUM;
const b = await pw[ENGINE].launch(exe ? { executablePath: exe } : {});
console.log(ENGINE, b.version());
const LINES = '#pause .ps__cue, #pause .ps__head, #pause .ps__sub, #pause .ps__coda';
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 3230 ? { width: 3230, height: 1319 } : { width: 1440, height: 900 };
  const dpr = w === 390 ? 3 : 2;
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: dpr, isMobile: w === 390, hasTouch: w === 390 });
  for (const v of vs.split(',')) {
    const p = await open(ctx, `${base}/${v}/`);
    const g = await p.evaluate(() => { const s = document.getElementById('pause'); return { y: s.offsetTop, span: s.offsetHeight - innerHeight }; });
    const at = (t) => jump(p, Math.round(g.y + g.span * t));
    if (w === 1440) for (let k = 0; k <= 10; k++) { await at(k / 10); await wait(p, 700); await p.screenshot({ path: `${out}/${v}-${w}-strip-${k}.jpg`, type: 'jpeg', quality: 70 }); }
    for (const t of [0.15, 0.5, 0.72, 1]) {
      await at(t); await wait(p, t === 1 ? 5200 : 1800);
      await p.screenshot({ path: `${out}/${v}-${w}-p${t}.jpg`, type: 'jpeg', quality: 85, timeout: 180000 });
      if (t < 0.72) continue;
      const lines = await p.evaluate((q) => [...document.querySelectorAll(q)].filter((e) => +getComputedStyle(e).opacity > 0.5 && e.getClientRects().length).map((e) => {
        const r = e.getBoundingClientRect(), c = getComputedStyle(e);
        return { k: e.className.split(' ')[0], text: e.textContent.trim().slice(0, 60), box: [r.left, r.top, r.right, r.bottom].map(Math.round), color: c.color, px: parseFloat(c.fontSize), weight: c.fontWeight };
      }), LINES);
      const vars = await p.evaluate(() => { const s = document.getElementById('pause'), c = getComputedStyle(s); return Object.fromEntries(['--lx', '--ly', '--lr', '--ld', '--lk', '--sc', '--ws', '--ct'].map((k) => [k, c.getPropertyValue(k).trim()])); });
      const hide = await p.addStyleTag({ content: '#pause .ps__cue, #pause .ps__words, #pause .ps__coda { visibility: hidden !important; }' });
      await wait(p, 150);
      await p.screenshot({ path: `${out}/${v}-${w}-p${t}-bare.png`, timeout: 180000 });
      await hide.evaluate((n) => n.remove());
      fs.writeFileSync(`${out}/${v}-${w}-p${t}.json`, JSON.stringify({ dpr, lines, vars }, null, 1));
      console.log(v, w, t, JSON.stringify(vars), lines.map((l) => l.k + ' ' + l.box.join(',')).join(' | '));
    }
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
