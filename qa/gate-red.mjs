// The deploy gate's red controls (task 6328eca1): every row qa/gate-rows.mjs measures is broken on purpose in the built M page
// (one change per row, added to the page as it is served, never written to the repo), measured with gate-rows.mjs's own checks,
// and must come out off on that row. The green control is gate-rows.mjs's own run on the unbroken page. A check that cannot go
// red checks nothing (row 4's line check could not, until this run showed it).
//   node qa/gate-red.mjs <out-dir>   -> <out-dir>/gate-red-<key>.json { key, rows: { n: { break, red, off } } }
// key = the first 12 hex of sha256(built M page + gate-rows.mjs + lib.mjs + this file); test_approved_gate.py reads it.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld, TYPES } from './lib.mjs';
import { PASSES, WORLDS } from './gate-rows.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || 'gate-out');
const PAGE = path.join(REPO, 'option-2.2-mgs', 'm', 'index.html');

// row: [what breaks, what is added before </body>, the pass that reads it, the worlds it needs]
export const BREAKS = {
  4: ['the visit preview line stays undrawn', '<style>#visit .ln__path{animation:none!important;transition:none!important;stroke-dashoffset:.6!important}</style>', '1440', ['salon']],
  5: ['a wheel inside the menu jumps back to its top (held there 0.4 s, over the page\'s own scrolling; armed by a wheel only, so row 6\'s jump into the menu does not spend it)',
    "<script>(function(){var at=0,wh=-1e9;addEventListener('wheel',function(){wh=performance.now();},{passive:true,capture:true});function f(){var s=document.getElementById('services');if(s){var t=Math.round(s.getBoundingClientRect().top+scrollY);if(!at&&performance.now()-wh<400&&scrollY>t+150&&scrollY<t+500)at=performance.now();if(at&&performance.now()-at<400)scrollTo(0,t);}requestAnimationFrame(f);}requestAnimationFrame(f);})();</script>", '1440', ['salon']],
  6: ['the menu photo panel scrolls away with the list', '<style>.mn__ph{position:relative!important}</style>', '1440', ['salon']],
  8: ['the voices on another ground', '<style>section.voices{background:#6B3A2A!important;background-image:none!important}</style>', '1440', ['salon']],
  9: ['a step number in mint', '<style>.ch__num{color:#8FCBA4!important}</style>', '1440', ['salon']],
  10: ['an Inner Work section in another colour', '<style>#c-hosts{background-color:#2A3B55!important}</style>', '1440', ['salon', 'coaching']],
  12: ['two light neighbours in one shape',
    "<script>document.addEventListener('DOMContentLoaded',function(){var a=document.getElementById('aveda'),h=document.getElementById('hosts');if(a&&h)h.className=a.className;});</script>", '1440', ['salon']],
  14: ['an empty band under the footer', '<style>#begin{padding-bottom:160px!important}</style>', '1440', ['salon']],
  15: ['the pause heading arrives already in focus', '<style>#pause :is(.mani__text, .ps__head) .l{filter:none!important;animation:none!important;transition:none!important}</style>', '1440', ['salon']],
  17: ['a glow around the pause picture', '<style>#pause :is(.br__ph, .ps__pic){box-shadow:0 0 80px rgba(245,238,228,.6)!important}</style>', '1440', ['salon']],
  20: ['the pause\'s room never opens from a thin line (its clip taken off)', '<style>#pause .ps__pic{clip-path:none!important;-webkit-clip-path:none!important;transition:none!important;animation:none!important}</style>', '1440', ['salon']],
  21: ['the second door\'s picture held still as it arrives', '<style>#deeper :is(.sh__ph,.sh__sheet,.sh__sheet2,.ph-bg) img{scale:1!important;transform:none!important;transition:none!important}</style>', '1440', ['salon']],
  22: ['Why Aveda\'s heading already there as it arrives', '<style>#aveda .mask__in{animation:none!important;opacity:1!important;filter:none!important;transform:none!important}</style>', '1440', ['salon']],
  24: ['Why Aveda\'s clear window moved off its subject (to the top left)',
    "<script>addEventListener('load',function(){setTimeout(function(){var e=document.querySelector('#aveda [data-sheet]');if(e&&e._sheet)e._sheet.subject=function(){return{x:160,y:160,rx:220,ry:220,c:.58};};},50);});</script>", '1440', ['salon']],
  25: ['Why Aveda\'s heading at a smaller size', '<style>#aveda .sh__words .mid{font-size:40px!important}</style>', '1440', ['salon']],
  18: ['the menu photos from their smallest file',
    "<script>document.addEventListener('DOMContentLoaded',function(){document.querySelectorAll('#services .mn__ph img[srcset]').forEach(function(i){var f=i.getAttribute('srcset').split(',')[0].trim().split(' ')[0];i.removeAttribute('srcset');i.src=f;});});</script>", '6K', ['salon']],
};

export function key() {
  const h = crypto.createHash('sha256');
  for (const f of [PAGE, path.join(HERE, 'gate-rows.mjs'), path.join(HERE, 'lib.mjs'), path.join(HERE, 'gate-red.mjs')]) h.update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 12);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  fs.mkdirSync(OUT, { recursive: true });
  const page = fs.readFileSync(PAGE, 'utf8');
  const srv = await serve(REPO, (u, req, res) => {
    const n = new URL(req.url, 'http://x').searchParams.get('break');
    if (u !== '/m/' || !n || !BREAKS[n]) return false;
    const html = page.replace('</body>', BREAKS[n][1] + '</body>');
    res.writeHead(200, { 'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store' });
    res.end(html);
    return true;
  });
  const base = `http://127.0.0.1:${srv.address().port}`;
  const browser = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
  console.log('webkit', browser.version(), process.env.WEBKIT ? 'from the pool asset' : 'from Playwright');
  const rows = {};
  try {
    for (const [n, [what, , size, worlds]] of Object.entries(BREAKS)) {
      const [, opts, fn] = PASSES.find((x) => x[0] === size);
      const ctx = await browser.newContext(opts);
      const p = await open(ctx, `${base}/m/?break=${n}`);
      const off = {}, seen = {};
      for (const [w, P, W] of WORLDS.filter((x) => worlds.includes(x[0]))) {
        if (w === 'coaching') await toWorld(p, 'coaching');
        await jump(p, 0); await wait(p, 400);
        await fn(p, 'm', P, W, (r, m) => (off[r] ||= []).push(`${W}: ${m}`), seen);
      }
      await ctx.close();
      rows[n] = { break: what, red: !!off[n], off: off[n] || [] };
      console.log(`row ${n} (${what}): ${off[n] ? 'RED, ' + off[n][0] : 'still green: this check does not see its row broken'}`);
    }
  } finally { await browser.close(); srv.close(); }
  const k = key();
  fs.writeFileSync(path.join(OUT, `gate-red-${k}.json`), JSON.stringify({ key: k, rows }, null, 1) + '\n');
  const green = Object.entries(rows).filter(([, r]) => !r.red).map(([n]) => n);
  console.log(green.length ? `rows ${green.join(', ')} stayed green when broken` : 'every measured row goes red when broken');
  process.exit(0);
}
