// The lenticular sheet (task a73569a9): the pause's door and Why Aveda's glass on M and G, at 1440, 390 and J's 6K window (3230 x 1319).
// For each: the frames while the glass settles after a jump (it slides in), the settled frame, a frame mid-scroll (the ribs smear
// and slide), and what the page says about its panes (is WebGL live, how big is each canvas, is the pane clear). Also console errors.
// Usage: node lens.mjs <outdir> [webkit|chromium] [m,g] [1440,390,768,3230] [pause,aveda] [salon|coaching]   (coaching: Inner Work's twins, #c-pause and #c-aveda)
import { chromium, webkit } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
import { serve, open, jump, wait, toWorld } from './lib.mjs';
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const [out = 'lens-shots', br = 'webkit', vs = 'm,g', ws = '1440,390,3230', secs = 'pause,aveda', world = 'salon'] = process.argv.slice(2);
const pre = world === 'coaching' ? 'c-' : '', tag = world === 'coaching' ? 'iw-' : '';
fs.mkdirSync(out, { recursive: true });
const srv = await serve(REPO);
const base = `http://127.0.0.1:${srv.address().port}`;
const b = await (br === 'chromium' ? chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }) : webkit.launch());
for (const w of ws.split(',').map(Number)) {
  const size = w === 390 ? { width: 390, height: 844 } : w === 768 ? { width: 768, height: 1024 } : w === 3230 ? { width: 3230, height: 1319 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: size, deviceScaleFactor: w === 3230 || w === 768 ? 2 : w === 390 ? 3 : 1, isMobile: w === 390, hasTouch: w === 390 });
  for (const v of vs.split(',')) {
    const p = await open(ctx, `${base}/${v}/`);
    if (world === 'coaching') await toWorld(p, 'coaching');
    const errs = []; p.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 160)); }); p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    for (const id of secs.split(',')) {
      const sel = id === 'aveda' ? `#${pre}aveda` : `#${pre}pause`;
      const top = await p.evaluate((s) => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : -1; }, sel);
      if (top < 0) { console.log(v, w, id, 'NO SECTION'); continue; }
      // approaching: a screen above the section, then a jump onto it (the glass slides in, then settles)
      await jump(p, Math.max(0, top - size.height * 0.55)); await wait(p, 900);
      await p.screenshot({ path: `${out}/${tag}${v}-${w}-${id}-1approach.jpg`, type: 'jpeg', quality: 82 });
      await jump(p, top); await wait(p, 350);
      await p.screenshot({ path: `${out}/${tag}${v}-${w}-${id}-2arrive.jpg`, type: 'jpeg', quality: 82 });
      await wait(p, 1500);
      await p.screenshot({ path: `${out}/${tag}${v}-${w}-${id}-3settling.jpg`, type: 'jpeg', quality: 82 });
      await wait(p, 4200);
      await p.screenshot({ path: `${out}/${tag}${v}-${w}-${id}-4rest.jpg`, type: 'jpeg', quality: 84, timeout: 180000 });
      // leaving: scroll down by a third of a screen and catch the smear before it settles
      await jump(p, top + size.height * 0.35); await wait(p, 120);
      await p.screenshot({ path: `${out}/${tag}${v}-${w}-${id}-5leaving.jpg`, type: 'jpeg', quality: 82 });
      const st = await p.evaluate((s) => ({ lenOn: document.documentElement.classList.contains('len-on'),
        panes: [...document.querySelector(s).querySelectorAll('.len')].map((e) => { const c = e.querySelector('canvas'), r = e.getBoundingClientRect();
          return { css: [Math.round(r.width), Math.round(r.height)], canvas: [c.width, c.height], gl: e.classList.contains('len--gl'), clear: e.classList.contains('is-clear'), frost: e.classList.contains('len--css') }; }) }), sel);
      console.log(v, w, id, JSON.stringify(st));
    }
    console.log(v, w, 'console:', errs.length ? JSON.stringify(errs.slice(0, 4)) : 'none');
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
