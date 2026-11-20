// Every film on M, G and S says "Made with AI" on it (AI Act Art 50; task 2a3f89d3; StoryLegal, 18 Nov, "Made with AI labels on
// a client's website": on the film itself, as text on the page, visible with no hover or tap the whole time it plays). Read in
// WebKit at 1440 and a phone, in both worlds: in each section a film plays in, at rest with its film playing (or its moving
// picture standing in), the label shows whole on screen, its words exact, nothing drawn over it, at full opacity, under no
// shade; a shot of each for the eye. The control: the same run on another checkout (the live commit) fails every label.
//   node qa/film-labels.mjs [out] [m,g,s] [1440,390] [repo]
import * as pw from 'playwright'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { serve, open, wait, jump, toWorld, phone } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(process.argv[5] || path.resolve(HERE, '..'));
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-film-labels')); fs.mkdirSync(OUT, { recursive: true });
const VERS = (process.argv[3] || 'm,g,s').split(','), WIDTHS = (process.argv[4] || '1440,390').split(',');
const CTX = { 1440: { viewport: { width: 1440, height: 900 } }, 390: phone('webkit') };
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), repo: REPO, started: new Date().toISOString(), checks: [], errors: [] };
const ok = (name, pass, info) => { res.checks.push({ name, pass: !!pass, info }); console.log(pass ? 'PASS' : 'FAIL', name, info === undefined ? '' : JSON.stringify(info)); };
for (const v of VERS) for (const w of WIDTHS) {
  const ctx = await b.newContext(CTX[w]), p = await open(ctx, `${base}/${v}/`);
  p.on('pageerror', (e) => res.errors.push(`${v} ${w}: ${e.message}`));
  for (const world of ['salon', 'coaching']) {
    if (world === 'coaching') await toWorld(p, 'coaching');
    const ids = await p.evaluate((world) => [...document.querySelectorAll(`main[data-world="${world}"] > section.s`)]
      .filter((s) => s.querySelector('video[data-src]')).map((s) => s.id), world);
    for (const id of ids) {
      await jump(p, await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().top + scrollY), id));
      await wait(p, 4800);       // the section arrives and a step's photo dissolves into its film (2.8 s + 1.8 s)
      const r = await p.evaluate(async (id) => {
        const s = document.getElementById(id), m = s.querySelector(':scope > .ai-mark--film'), v = s.querySelector('video[data-src]');
        const t0 = v.currentTime; await new Promise((d) => setTimeout(d, 700));
        const out = { at: Math.round(s.getBoundingClientRect().top), playing: v.currentTime > t0 || !!s.querySelector('.film-img.is-on'),
          film: (v.currentSrc || '').split('/').pop().split('?')[0], text: m ? m.textContent : null };
        if (!m) return out;
        const bx = m.getBoundingClientRect();
        out.box = [bx.left, bx.top, bx.right, bx.bottom].map(Math.round);
        out.whole = bx.left >= 0 && bx.top >= 0 && bx.right <= innerWidth && bx.bottom <= innerHeight && bx.width > 20;
        let op = 1; for (let e = m; e && e !== document.documentElement; e = e.parentElement) op *= +getComputedStyle(e).opacity;
        out.op = +op.toFixed(2); out.vis = getComputedStyle(m).visibility;
        const sh = s.querySelector(':scope > .s__shade'); out.shade = sh ? +(+getComputedStyle(sh).opacity).toFixed(2) : 0;
        m.style.pointerEvents = 'auto';          // read what sits on top at its centre and inner corners, then give it back
        out.over = [[(bx.left + bx.right) / 2, (bx.top + bx.bottom) / 2], [bx.left + 3, bx.top + 3], [bx.right - 3, bx.top + 3], [bx.left + 3, bx.bottom - 3], [bx.right - 3, bx.bottom - 3]]
          .map(([x, y]) => { const e = document.elementFromPoint(x, y); return !e ? 'nothing' : e === m || m.contains(e) ? '' : e.tagName.toLowerCase() + '.' + [...e.classList].join('.'); }).filter(Boolean);
        m.style.pointerEvents = '';
        return out;
      }, id);
      ok(`${v} ${w} ${world} "${id}": "Made with AI" on its film, whole on screen, nothing over it, full opacity, no shade`,
        r.text === 'Made with AI' && r.whole && r.op > .95 && r.vis === 'visible' && r.shade < .05 && !r.over.length, r);
      ok(`${v} ${w} ${world} "${id}": its film plays`, r.playing, { film: r.film });
      await p.screenshot({ path: path.join(OUT, `${v}-${w}-${id}.png`) });
    }
  }
  await ctx.close();
}
res.pass = res.checks.length > 0 && res.checks.every((c) => c.pass) && !res.errors.length;
fs.writeFileSync(path.join(OUT, 'film-labels.json'), JSON.stringify(res, null, 1));
console.log(`${res.checks.filter((c) => c.pass).length}/${res.checks.length} pass`, res.errors.length ? `errors: ${res.errors.join(' | ')}` : '');
await b.close(); srv.close(); process.exit(res.pass ? 0 : 1);
