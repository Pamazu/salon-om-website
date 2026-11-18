// QA tool (task 65320d04): boxes in #deeper at a phone/laptop size: header, bottom bar, tweaks button, eyebrow, headline, text, buttons, AI mark
import path from 'node:path'; import { fileURLToPath } from 'node:url'; import * as pw from 'playwright';
import { serve, open, wait, jump } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srv = await serve(REPO); const base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.chromium.launch();
for (const [W, H] of [[393, 660], [393, 740], [393, 852], [1512, 945]]) {
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: W < 600, hasTouch: W < 600 });
  for (const v of ['m', 'g', 's']) {
    const p = await open(ctx, `${base}/${v}/`);
    const y = await p.evaluate(() => Math.round(document.getElementById('deeper').getBoundingClientRect().top + scrollY));
    await jump(p, y); await wait(p, 2600);
    const r = await p.evaluate(() => {
      const box = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), Math.round(r.left), Math.round(r.right)]; };
      const d = document.getElementById('deeper'), q = (s) => d.querySelector(s);
      const bar = [...document.querySelectorAll('body *')].filter((e) => { const c = getComputedStyle(e); return c.position === 'fixed' && e.getBoundingClientRect().bottom > innerHeight - 140 && e.getBoundingClientRect().top > innerHeight - 160 && e.textContent.trim().length; }).map((e) => [e.className.toString().slice(0, 24), box(e)]);
      return { hdr: box(document.getElementById('hdr')), bars: bar, sec: box(d), eyebrow: box(q('.eyebrow')), h2: box(q('h2')), text: box(q('.bridge__in > p.a-up')), btns: box(q('.bridge__in > div.a-up')), ai: box(q('.ai-mark')), fs: [getComputedStyle(q('h2')).fontSize, getComputedStyle(q('.bridge__in > p.a-up')).fontSize] };
    });
    console.log(`${W}x${H} ${v}`, JSON.stringify(r));
    await p.close();
  }
  await ctx.close();
}
await b.close(); srv.close();
