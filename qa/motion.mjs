// Task b36dde1f: the one motion switch (mgs_parts.MOTION_HEAD + motion_css). Chromium, 1440 x 900, M/G/S:
//   review host (127.0.0.1) + device asks Reduce Motion -> data-motion full, scripts told "no preference", the hero film
//     plays, the pause breathes (where there is one);
//   launched host (salonom.test mapped to 127.0.0.1) + Reduce Motion -> calm: scripts told "reduce", no film loaded or
//     played, no breath;
//   launched host, no preference -> full: the hero film plays.
//   node run.mjs motion chromium [m,g,s]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const VERS = (process.env.VERS || 'm,g,s').split(','), OUT = path.join(HERE, 'out-motion'); fs.mkdirSync(OUT, { recursive: true });
const srv = await serve(REPO), port = srv.address().port;
const b = await pw.chromium.launch({ args: ['--host-resolver-rules=MAP salonom.test 127.0.0.1', '--autoplay-policy=no-user-gesture-required'] });
console.log('chromium', b.version());
const CASES = [
  { name: 'review+reduce', host: '127.0.0.1', rm: 'reduce', want: { motion: 'full', mq: false, film: true, breath: true } },
  { name: 'launched+reduce', host: 'salonom.test', rm: 'reduce', want: { motion: 'calm', mq: true, film: false, breath: false } },
  { name: 'launched+none', host: 'salonom.test', rm: 'no-preference', want: { motion: 'full', mq: false, film: true, breath: true } },
];
const res = { runs: [] }; let pass = 0, all = 0;
for (const v of VERS) for (const c of CASES) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: c.rm });
  const page = await ctx.newPage();
  await page.goto(`http://${c.host}:${port}/${v}/`, { waitUntil: 'load' }); await page.waitForTimeout(3000);
  const top = await page.evaluate(() => { const h = document.querySelector('#top video');
    return { motion: document.documentElement.getAttribute('data-motion'), mq: matchMedia('(prefers-reduced-motion: reduce)').matches,
      src: !!(h && h.getAttribute('src')), t: h ? Math.round(h.currentTime * 100) / 100 : null, paused: h ? h.paused : null }; });
  const film = top.src && !top.paused && top.t > 0.5;
  let breath = null;
  if (await page.$('#pause')) {
    await page.evaluate(() => { const r = document.documentElement; r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none';
      scrollTo(0, document.getElementById('pause').getBoundingClientRect().top + scrollY); });
    await page.waitForTimeout(3500);
    breath = await page.evaluate(() => [...document.querySelectorAll('#pause .br__arch img, #pause .br__halo, #pause .br__ring')]
      .some((e) => e.getAnimations().some((a) => a.playState === 'running')));
    await page.screenshot({ path: path.join(OUT, `${v}-${c.name}-pause.png`) });
  }
  const got = { motion: top.motion, mq: top.mq, film, breath };
  const checks = { motion: got.motion === c.want.motion, mq: got.mq === c.want.mq, film: got.film === c.want.film,
    breath: breath === null ? true : breath === c.want.breath };
  const ok = Object.values(checks).every(Boolean); all++; if (ok) pass++;
  res.runs.push({ v, case: c.name, ok, got, want: c.want, top });
  console.log('motion', v, c.name, ok ? 'pass' : 'FAIL', JSON.stringify(got), ok ? '' : 'want ' + JSON.stringify(c.want));
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, 'motion.json'), JSON.stringify(res, null, 1));
await b.close(); srv.close();
console.log(`motion: ${pass}/${all} pass`);
