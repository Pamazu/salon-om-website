// gaps (task cf6eeff6, J 17 Nov: "please QA gaps and spacing, too much gap above Book your visit", seen by eye after a
// design-principles walk had passed): every section of M, G and S, both worlds, at 390, 768, 1024, 1280, 1366, 1440 and
// 1920, in its arrived state (?shot). In every stack (an element whose children holding words, a button or a picture sit
// one under another in the same column) it measures the gaps between consecutive children, display type (40 px and up)
// from its baseline and cap height, and flags:
//   - a button more than 1.35x this page's usual button gap (both worlds) and 14 px over it (J's case, M's step 05: 62 px against 40),
//     or under half of it;
//   - words or a picture more than 1.6x the largest other gap of its stack and 24 px over it (a gap beyond the stack's own
//     spacing levels), or 4 px or less where the stack's gaps are 20 px or more.
// Writes qa/out-gaps-<browser>/gaps.json (every gap measured and every flag) and, for each flagged section and width, a
// picture of each flagged gap, the window centred on it and the gap marked in red: <v>-<world>-<id>-<w>-<n>.jpg.
// node run.mjs gaps [webkit|chromium] [m,g,s]     SIZES=1440,390 or IDS=sec1,sec2 narrow it
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, wait, open, toWorld, jump, SIZES } from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.env.BROWSER || 'webkit';
const VERS = (process.env.VERS || 'm,g,s').split(',');
const ONLY_W = (process.env.SIZES || '').split(',').filter(Boolean);
const ONLY_ID = (process.env.IDS || '').split(',').filter(Boolean);
const OUT = path.join(REPO, 'qa', `out-gaps-${BROWSER}`);
fs.mkdirSync(OUT, { recursive: true });

// runs in the page: every stack of every section of one world. A stack is an element whose visible children (the ones
// holding words, a button or a picture) sit one under another in the same column; its gaps are the CSS box gaps between
// consecutive children, the spacing a designer sets, compared only with the other gaps of the same stack.
const measure = (args) => {
  const [world, onlyIds] = args;
  const vis = (e) => {
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) {
      const cs = getComputedStyle(x);
      if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < .1) return false;
    }
    return true;
  };
  const holds = (e) => e.matches('img, video, .btn') || !!e.querySelector('img, video, .btn')
    || [...e.querySelectorAll('*'), e].some((x) => [...x.childNodes].some((c) => c.nodeType === 3 && c.nodeValue.trim()));
  const label = (e) => (e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '')
    + ' "' + (e.textContent || e.getAttribute('alt') || '').trim().replace(/\s+/g, ' ').slice(0, 32) + '"');
  const med = (xs) => { const v = [...xs].sort((x, y) => x - y); return v.length ? v[Math.floor((v.length - 1) / 2)] : 0; };
  const secs = [...document.querySelectorAll(`main[data-world="${world}"] > section.s, main[data-world="${world}"] > footer`)]
    .filter((s) => !onlyIds.length || onlyIds.includes(s.id));
  const res = [];
  for (const s of secs) {
    const sr = s.getBoundingClientRect();
    if (!sr.height) continue;
    const stacks = [];
    for (const c of [s, ...s.querySelectorAll('*')]) {
      if (c.closest('[aria-hidden="true"], svg, .wdoor') || !/^(block|flex|grid|list-item|flow-root)$/.test(getComputedStyle(c).display)) continue;
      if ([...c.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) continue;   // mixed inline words: not a stack
      const kids = [];
      for (const k of c.children) {
        if (k.matches('script, style, template') || /^(absolute|fixed)$/.test(getComputedStyle(k).position)) continue;   // a decorative glyph (aria-hidden) is still seen
        const r = k.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || !vis(k) || !holds(k)) continue;
        // display type (40 px and up) is set tight, so its box is not where the eye sees it: its bottom is the baseline of
        // its last line and its top the cap height over the baseline of its first
        const fs = parseFloat(getComputedStyle(k).fontSize);
        let t = r.top, b = r.bottom;
        if (fs >= 40 && !k.querySelector('img, video, .btn') && k.textContent.trim()) {
          // a zero-size marker set beside the first (or last) word itself, inside whatever spans hold it
          const tx = []; const tw = document.createTreeWalker(k, NodeFilter.SHOW_TEXT);
          for (let n; (n = tw.nextNode());) if (n.nodeValue.trim()) tx.push(n);
          const base = (end) => { const n = end ? tx[tx.length - 1] : tx[0], sp = document.createElement('span');
            sp.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
            n.parentNode.insertBefore(sp, end ? n.nextSibling : n); const y = sp.getBoundingClientRect().bottom; sp.remove(); return y; };
          b = base(true) + .15 * fs; t = base(false) - .7 * fs;      // the eye: cap height over the first baseline, a short tail under the last
        }
        const kind = k.matches('.btn') || (k.querySelector('.btn') && !(k.textContent.replace(k.querySelector('.btn').textContent, '').trim())) ? 'button'
          : (k.matches('img, video, figure, picture') || (k.querySelector('img, video') && !k.textContent.trim())) ? 'picture' : 'text';
        kids.push({ k, kind, l: r.left, r: r.right, t, b });
      }
      kids.sort((x, y) => x.t - y.t);
      const gaps = [];
      for (let i = 1; i < kids.length; i++) {
        const A = kids[i - 1], B = kids[i];
        if (Math.min(A.r, B.r) - Math.max(A.l, B.l) < Math.max(8, .25 * Math.min(A.r - A.l, B.r - B.l))) continue;   // side by side
        if (B.t < A.b - 1) continue;      // overlapping (a stacked slideshow)
        gaps.push({ A, B, gap: Math.round(B.t - A.b) });
      }
      for (const g of gaps) stacks.push({ in: label(c).replace(/ ".*$/, ''), n: gaps.length, kind: g.B.kind, gap: g.gap,
        above: label(g.A.k), below: label(g.B.k), y: Math.round(g.A.b - sr.top), x: Math.round(Math.max(g.A.l, g.B.l) - sr.left),
        w: Math.round(Math.min(g.A.r, g.B.r) - Math.max(g.A.l, g.B.l)), sib: gaps.filter((o) => o !== g && o.B.kind !== 'button').map((o) => o.gap) });
    }
    res.push({ id: s.id, top: Math.round(sr.top + scrollY), h: Math.round(sr.height), gaps: stacks });
  }
  return res;
};

const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw[BROWSER].launch();
console.log(BROWSER, b.version());
const sizes = SIZES(BROWSER).filter(([w]) => !ONLY_W.length || ONLY_W.includes(w));
const med = (xs) => { const v = [...xs].sort((x, y) => x - y); return v.length ? v[Math.floor((v.length - 1) / 2)] : 0; };
const page = async (v, world, opt) => {
  const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/?shot`);
  if (world === 'coaching') await toWorld(p, 'coaching');
  await wait(p, 600);
  return { ctx, p };
};
const log = [];
try {
  // pass 1: every gap of every section, both worlds
  for (const v of VERS) for (const [w, opt] of sizes) {
    const both = [];
    for (const world of ['salon', 'coaching']) {
      const { ctx, p } = await page(v, world, opt);
      for (const sec of await p.evaluate(measure, [world, ONLY_ID])) both.push({ v, world, w, ...sec });
      await ctx.close();
    }
    // a button is compared with this page's usual button gap, both worlds together (the spacing system gives a button
    // more room than a line of words); words and pictures with the largest other gap of their own stack
    const ref = med(both.flatMap((x) => x.gaps.filter((g) => g.kind === 'button').map((g) => g.gap)));
    for (const sec of both) {
      sec.buttonRef = ref; sec.flags = [];
      for (const g of sec.gaps) {
        let why = null;
        if (g.kind === 'button') {
          if (ref && g.gap > 1.35 * ref && g.gap - ref >= 14) why = `wide: a button ${g.gap} px under ${g.above.split(' ')[0]}, this page's buttons sit ${ref} px under`;
          else if (ref && g.gap < .5 * ref && ref - g.gap >= 14) why = `crowded: a button ${g.gap} px under ${g.above.split(' ')[0]}, this page's buttons sit ${ref} px under`;
        } else if (g.sib.length) {
          const top = Math.max(...g.sib), m = med(g.sib);
          if (top >= 8 && g.gap > 1.6 * top && g.gap - top >= 24) why = `wide: ${g.gap} px, the stack's other gaps at most ${top} px`;
          else if (g.gap <= 4 && m >= 20) why = `crowded: ${g.gap} px against ${m} px in the same stack`;
        }
        if (why) sec.flags.push({ why, ...g });
      }
      log.push(sec);
    }
  }
  // pass 2: a picture of each flagged gap, the window centred on it, the gap marked in red
  for (const v of VERS) for (const [w, opt] of sizes) for (const world of ['salon', 'coaching']) {
    const secs = log.filter((x) => x.v === v && x.w === w && x.world === world && x.flags.length);
    if (!secs.length) continue;
    const { ctx, p } = await page(v, world, opt);
    const vh = opt.viewport.height;
    for (const sec of secs) for (const [i, f] of sec.flags.entries()) {
      await jump(p, Math.max(0, sec.top + f.y - vh * .45)); await wait(p, 300);
      await p.evaluate(([id, f]) => {
        const s = document.getElementById(id);
        if (getComputedStyle(s).position === 'static') s.style.position = 'relative';
        const d = document.createElement('div');
        d.className = 'qa-gap';
        d.style.cssText = `position:absolute;z-index:99;left:${f.x}px;top:${f.y}px;width:${Math.max(f.w, 24)}px;height:${Math.max(f.gap, 2)}px;background:rgba(230,30,30,.35);outline:2px solid #e61e1e;pointer-events:none`;
        s.appendChild(d);
      }, [sec.id, f]);
      await p.screenshot({ path: path.join(OUT, `${v}-${world}-${sec.id}-${w}-${i + 1}.jpg`), type: 'jpeg', quality: 78 });
      await p.evaluate(() => document.querySelectorAll('.qa-gap').forEach((d) => d.remove()));
    }
    await ctx.close();
  }
} finally { await b.close(); srv.close(); }
fs.writeFileSync(path.join(OUT, ONLY_W.length || ONLY_ID.length || VERS.length < 3 ? `gaps-${VERS.join('')}${ONLY_W.join('_')}${ONLY_ID.join('_')}.json` : 'gaps.json'), JSON.stringify(log, null, 1));
const flagged = log.filter((s) => s.flags.length);
console.log('gaps: sections measured', log.length, '| flagged', flagged.length, '| flags', flagged.reduce((n, s) => n + s.flags.length, 0));
for (const s of flagged) for (const f of s.flags) console.log(`  ${s.v}-${s.world}-${s.id}-${s.w}: ${f.why} | above ${f.above} | below ${f.below}`);
