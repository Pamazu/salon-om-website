// the pause (tasks 2b1d1187, e1a1e009): M and G's pause, B · The breath, at 1440, 390 and J's 6K window (3230 x 1319 CSS px at
// 2x), in WebKit (J's Safari). A frame at each point of the breath (0.15 the room opening, 0.5 the in-breath full, 0.72 the
// out-breath with the question, 1 at rest) and, at the last two, the same frame with the words hidden plus each line's box and
// colour, so the contrast behind every line is read from the pixels (qa/pause_contrast.py). At 1440 also a strip of eleven
// frames through the section, to see the breath move. chromium (4th argument, or ENGINE=) for Chromium (the PC). The pool's pinned browser when
// given (WEBKIT=, run-at-ref --asset WEBKIT; CHROME= or SDELEGATE_CHROMIUM=), else Playwright's own.
// Both worlds: the salon's pause (#pause) and Inner Work's twin (#c-pause), reached with the page's own world switch (task
// 3a9e24cf). Usage: node pause.mjs <outdir> [m,g] [1440,390,3230] [webkit|chromium] [query, e.g. opt-pause=centred] [salon,coaching]
import * as pw from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [out = 'pause-shots', vs = 'm,g', ws = '1440,390,3230', eng = '', qs = '', wds = 'salon,coaching'] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const ENGINE = eng || process.env.ENGINE || 'webkit', exe = ENGINE === 'webkit' ? process.env.WEBKIT : process.env.CHROME || process.env.SDELEGATE_CHROMIUM;
const b = await pw[ENGINE].launch(exe ? { executablePath: exe } : {});
console.log(ENGINE, b.version());
const LINES = (id) => ['ps__cue', 'ps__head', 'ps__sub', 'ps__coda'].map((c) => `#${id} .${c}`).join(', ');
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 3230 ? { width: 3230, height: 1319 } : { width: 1440, height: 900 };
  const dpr = w === 390 ? 3 : 2;
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: dpr, isMobile: w === 390, hasTouch: w === 390 });
  for (const v of vs.split(',')) for (const wd of wds.split(',')) {
    const id = wd === 'coaching' ? 'c-pause' : 'pause', tag = `${v}-${wd}-${w}`;
    const p = await open(ctx, `${base}/${v}/${qs ? '?' + qs : ''}`);
    if (wd === 'coaching') await toWorld(p, 'coaching');
    // the switcher may redraw the section from its store as the page settles: wait for it, and say what the page is if it never comes
    if (!(await p.waitForSelector('#' + id, { state: 'attached', timeout: 20000 }).catch(() => null))) { console.log('NO #' + id, v, w, await p.evaluate(() => [location.href, document.title, document.querySelectorAll('section[id]').length, document.body.innerText.slice(0, 160)])); continue; }
    const g = await p.evaluate((id) => { const s = document.getElementById(id); return { y: s.getBoundingClientRect().top + scrollY, span: s.offsetHeight - innerHeight }; }, id);
    const at = (t) => jump(p, Math.round(g.y + g.span * t));
    if (w === 1440) for (let k = 0; k <= 10; k++) { await at(k / 10); await wait(p, 700); await p.screenshot({ path: `${out}/${tag}-strip-${k}.jpg`, type: 'jpeg', quality: 70 }); }
    for (const t of [0.15, 0.5, 0.72, 1]) {
      await at(t); await wait(p, t === 1 ? 5200 : 1800);
      await p.screenshot({ path: `${out}/${tag}-p${t}.jpg`, type: 'jpeg', quality: 85, timeout: 180000 });
      if (t < 0.72) continue;
      const lines = await p.evaluate((q) => [...document.querySelectorAll(q)].filter((e) => +getComputedStyle(e).opacity > 0.5 && e.getClientRects().length).map((e) => {
        const r = e.getBoundingClientRect(), c = getComputedStyle(e);
        // the glyphs' own extent, line by line (task 3a9e24cf): a centred line's box is the column's width, and its empty sides
        // are not behind any word
        const rg = document.createRange(); rg.selectNodeContents(e); const rows = [];
        for (const q of rg.getClientRects()) {
          if (q.width < 1 || q.height < 1) continue;
          const cy = (q.top + q.bottom) / 2, row = rows.find((o) => cy > o[1] && cy < o[3]);
          if (row) { row[0] = Math.min(row[0], q.left); row[1] = Math.min(row[1], q.top); row[2] = Math.max(row[2], q.right); row[3] = Math.max(row[3], q.bottom); }
          else rows.push([q.left, q.top, q.right, q.bottom]);
        }
        return { k: e.className.split(' ')[0], text: e.textContent.trim().slice(0, 60), box: [r.left, r.top, r.right, r.bottom].map(Math.round), rows: rows.map((o) => o.map(Math.round)), color: c.color, px: parseFloat(c.fontSize), weight: c.fontWeight };
      }), LINES(id));
      const vars = await p.evaluate((id) => { const s = document.getElementById(id), c = getComputedStyle(s); return Object.fromEntries(['--sc', '--ct', '--cs', '--dim'].map((k) => [k, c.getPropertyValue(k).trim()])); }, id);
      // only the glyphs are hidden: whatever is laid behind the words (a light, a shade) stays in the frame and is measured
      const hide = await p.addStyleTag({ content: ['ps__cue', 'ps__words', 'ps__coda'].map((c) => `#${id} .${c}, #${id} .${c} *`).join(', ') + ' { color: transparent !important; -webkit-text-fill-color: transparent !important; }' });
      await wait(p, 150);
      await p.screenshot({ path: `${out}/${tag}-p${t}-bare.png`, timeout: 180000 });
      await hide.evaluate((n) => n.remove());
      fs.writeFileSync(`${out}/${tag}-p${t}.json`, JSON.stringify({ dpr, lines, vars }, null, 1));
      console.log(tag, t, JSON.stringify(vars), lines.map((l) => l.k + ' ' + l.rows.map((o) => o.join(',')).join(';')).join(' | '));
    }
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
