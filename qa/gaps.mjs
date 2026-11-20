// gaps (task cf6eeff6, J 17 Nov: "please QA gaps and spacing, too much gap above Book your visit", seen by eye after a
// design-principles walk had passed): every section of M, G and S, both worlds, at 390, 768, 1024, 1280, 1366, 1440 and
// 1920, in its arrived state (?shot). In every stack (an element whose children holding words, a button or a picture sit
// one under another in the same column) it measures the gaps between consecutive children, display type (40 px and up)
// from its baseline and cap height, and flags:
//   - a button more than 1.35x this page's usual button gap (both worlds) and 14 px over it (J's case, M's step 05: 62 px against 40),
//     or under half of it;
//   - words or a picture more than 1.6x the largest other gap of its stack and 24 px over it (a gap beyond the stack's own
//     spacing levels), or 4 px or less where the stack's gaps are 20 px or more.
//   - a button straight under another button (a group) only when they sit under 8 px apart;
//   - anything cut off: words, a button or a picture past the edge of a section that hides what overflows it.
//   - (J 20 Nov, the five steps: "the gap between the heading and the text below it is too small, and the gap between the text
//     and the bottom of the viewport is too large", which no gap above showed: the title's box overlaps its words' box)
//     words under a display heading starting less than a fifth of its size under its baseline (baseline to cap height);
//   - on a slide one window tall, words laid over it (a box set absolute, as a step's words on its picture) ending more than
//     1.5x the page's foot (--base) above the window's bottom and 24 px over it, and any slide's words ending under half of it.
// Writes qa/out-gaps-<browser>/gaps.json (every gap measured and every flag) and, for each flagged section and width, a
// picture of each flagged gap, the window centred on it and the gap marked in red: <v>-<world>-<id>-<w>-<n>.jpg.
// Sizes: the seven above plus 1976 x 1209 and 3230 x 1319 (J's 6K screen), as lens-contrast.mjs.
// node run.mjs gaps [webkit|chromium] [m,g,s]     SIZES=1440,390 or IDS=sec1,sec2 narrow it; QUERY=opt-hosts=band walks a
// section's Shift+V option as a shared link opens it (task 9999ef8a), into qa/out-gaps-<browser>-<query>/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, wait, open, toWorld, jump, SIZES, vp } from './lib.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER = process.env.BROWSER || 'webkit';
const VERS = (process.env.VERS || 'm,g,s').split(',');
const ONLY_W = (process.env.SIZES || '').split(',').filter(Boolean);
const ONLY_ID = (process.env.IDS || '').split(',').filter(Boolean);
const QUERY = process.env.QUERY || '';
const OUT = path.join(REPO, 'qa', `out-gaps-${BROWSER}${QUERY ? '-' + QUERY.replace(/[^a-z0-9]+/gi, '-') : ''}`);
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
  // the baseline of the first (or last) line of words in e, and the size of those words: a zero-size marker set beside them
  const line = (e, end) => {
    const tx = []; const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    for (let n; (n = tw.nextNode());) if (n.nodeValue.trim() && vis(n.parentElement)) tx.push(n);
    if (!tx.length) return null;
    const n = end ? tx[tx.length - 1] : tx[0], sp = document.createElement('span');
    sp.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    n.parentNode.insertBefore(sp, end ? n.nextSibling : n); const y = sp.getBoundingClientRect().bottom; sp.remove();
    return { y, fs: parseFloat(getComputedStyle(n.parentElement).fontSize) };
  };
  // the page's foot: the room a slide keeps under its words (--base)
  const pb = document.createElement('div'); pb.style.cssText = 'position:absolute;left:0;top:0;width:1px;height:var(--base)';
  document.body.appendChild(pb); const BASE = Math.round(pb.getBoundingClientRect().height); pb.remove();
  const secs = [...document.querySelectorAll(`main[data-world="${world}"] > section.s, main[data-world="${world}"] > footer`)]
    .filter((s) => !onlyIds.length || onlyIds.includes(s.id));
  const res = [];
  for (const s of secs) {
    const sr = s.getBoundingClientRect();
    if (!sr.height) continue;
    const stacks = [], heads = [];
    for (const c of [s, ...s.querySelectorAll('*')]) {
      if (c.closest('[aria-hidden="true"], svg, .wdoor') || !/^(block|flex|grid|list-item|flow-root)$/.test(getComputedStyle(c).display)) continue;
      if ([...c.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) continue;   // mixed inline words: not a stack
      const kids = [];
      // a child set display: contents has no box: its own children stand in the stack in its place
      const flat = (e) => [...e.children].flatMap((k) => (getComputedStyle(k).display === 'contents' ? flat(k) : [k]));
      for (const k of flat(c)) {
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
        const disp = kind === 'text' && fs >= 40 && t !== r.top;      // display type, measured at its baseline above
        kids.push({ k, kind, l: r.left, r: r.right, t, b, fs, disp, bl: disp ? b - .15 * fs : null });
      }
      kids.sort((x, y) => x.t - y.t);
      const gaps = [];
      for (let i = 1; i < kids.length; i++) {
        const A = kids[i - 1], B = kids[i];
        if (Math.min(A.r, B.r) - Math.max(A.l, B.l) < Math.max(8, .25 * Math.min(A.r - A.l, B.r - B.l))) continue;   // side by side
        // a heading over its words, read as the eye reads it: from the heading's baseline to the cap height of the words
        // (their boxes can overlap, which is why the gaps below never saw the five steps' titles on their words)
        if (A.disp && B.kind === 'text' && A.k.matches('h1, h2, h3, h4, h5, h6, :has(h1, h2, h3, h4, h5, h6)')) {
          const c = line(B.k, false);
          if (c) heads.push({ above: label(A.k), below: label(B.k), size: Math.round(A.fs), eye: Math.round(c.y - .7 * c.fs - A.bl),
            y: Math.round(A.bl - sr.top), x: Math.round(Math.max(A.l, B.l) - sr.left), w: Math.round(Math.min(A.r, B.r) - Math.max(A.l, B.l)) });
        }
        if (B.t < A.b - 1) continue;      // overlapping (a stacked slideshow)
        gaps.push({ A, B, gap: Math.round(B.t - A.b) });
      }
      for (const g of gaps) stacks.push({ in: label(c).replace(/ ".*$/, ''), n: gaps.length, kind: g.B.kind, after: g.A.kind, gap: g.gap,
        above: label(g.A.k), below: label(g.B.k), y: Math.round(g.A.b - sr.top), x: Math.round(Math.max(g.A.l, g.B.l) - sr.left),
        w: Math.round(Math.min(g.A.r, g.B.r) - Math.max(g.A.l, g.B.l)), sib: gaps.filter((o) => o !== g && o.B.kind !== 'button').map((o) => o.gap) });
    }
    // cut off: a section that hides what overflows it (a slide one window tall) must still hold all its words, buttons and
    // pictures; J's "What is in your color?" (G #aveda, 17 Nov: "too cramped or tight") hid its four facts under the
    // window's edge, which no gap shows. Each element holding words of its own, a button or a picture is seen as far as
    // every clipping box around it lets it show; what of it lies past the section's top or bottom is lost to the eye.
    // A layer set absolute or fixed (a photo behind, a slide stacked on another) and a row that scrolls are left out.
    const cut = [];
    if (/hidden|clip/.test(getComputedStyle(s).overflowY)) {
      for (const e of s.querySelectorAll('*')) {
        if (e.closest('[aria-hidden="true"], svg, .wdoor') || (e.parentElement && e.parentElement.closest('.btn'))) continue;
        if (!(e.matches('img, video, .btn') || [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) || !vis(e)) continue;
        let r = e.getBoundingClientRect(), skip = false;
        let t = r.top, b = r.bottom;
        for (let x = e; x && x !== s; x = x.parentElement) {
          const cs = getComputedStyle(x);
          if (/^(absolute|fixed)$/.test(cs.position) || (x !== e && /auto|scroll/.test(cs.overflowX + cs.overflowY))) { skip = true; break; }
          if (x !== e && /hidden|clip/.test(cs.overflowY)) { const xr = x.getBoundingClientRect(); t = Math.max(t, xr.top); b = Math.min(b, xr.bottom); }
        }
        if (skip || r.width < 2 || b - t < 2) continue;
        const out = Math.round(Math.max(b - sr.bottom, sr.top - t));
        if (out > 4) cut.push({ out, edge: b > sr.bottom ? 'bottom' : 'top', label: label(e), x: Math.round(r.left - sr.left), w: Math.round(r.width) });
      }
    }
    // the foot: on a slide one window tall, the room under its lowest words or button, and whether those words rest on the
    // slide's foot: laid over it (a box set absolute, as a step's words on its picture) and held in its lower half (the
    // second door's words, laid over its picture high up, do not)
    let foot = null;
    // (a section as tall as its words, s--auto, that flows on into the next is no slide, even where it happens to be one window tall)
    if (Math.abs(sr.height - innerHeight) <= 2 && !s.classList.contains('s--auto')) {
      let low = null;
      for (const e of s.querySelectorAll('*')) {
        if (e.closest('[aria-hidden="true"], svg, .wdoor, .ai-mark') || (e.parentElement && e.parentElement.closest('.btn'))) continue;
        if (!(e.matches('.btn') || [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())) || !vis(e)) continue;
        let fixed = false, over = null;
        for (let x = e; x && x !== s; x = x.parentElement) { const p = getComputedStyle(x).position; if (p === 'fixed') fixed = true; if (p === 'absolute' && !over) over = x; }
        const r = e.getBoundingClientRect();
        if (fixed || r.width < 2 || r.height < 2) continue;
        if (!low || r.bottom > low.b) low = { b: r.bottom, below: label(e), over };
      }
      if (low && low.over) {     // the words of the box laid over the slide: their middle in the slide's lower half
        const ws = [...low.over.querySelectorAll('*')].filter((e) => vis(e) && [...e.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim())).map((e) => e.getBoundingClientRect()).filter((r) => r.height > 1);
        low.over = ws.length > 0 && (Math.min(...ws.map((r) => r.top)) + Math.max(...ws.map((r) => r.bottom))) / 2 > sr.top + sr.height / 2;
      }
      if (low) foot = { gap: Math.round(sr.bottom - low.b), above: low.below, over: !!low.over, y: Math.round(low.b - sr.top) };
    }
    res.push({ id: s.id, top: Math.round(sr.top + scrollY), h: Math.round(sr.height), base: BASE, gaps: stacks, heads, foot, cut });
  }
  return res;
};

const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw[BROWSER].launch();
console.log(BROWSER, b.version());
const sizes = [...SIZES(BROWSER), ['1976', vp(1976, 1209)], ['3230', vp(3230, 1319)]].filter(([w]) => !ONLY_W.length || ONLY_W.includes(w));
const med = (xs) => { const v = [...xs].sort((x, y) => x - y); return v.length ? v[Math.floor((v.length - 1) / 2)] : 0; };
const page = async (v, world, opt) => {
  const ctx = await b.newContext(opt), p = await open(ctx, `${base}/${v}/?shot${QUERY ? '&' + QUERY : ''}`);
  if (world === 'coaching') await toWorld(p, 'coaching');
  await wait(p, 600);
  return { ctx, p };
};
// judged by eye (task cf6eeff6, 17 Nov, on the round's pictures): a gap the check flags that the design means, or that
// the check cannot see as the eye does. Kept only while the gap stays within 8 px of the value judged; any other value
// flags as before. Printed apart, so a round's flags are only what is new.
const JUDGED = [
  { id: 'c-deeper', below: 'p.pr__close', gap: 40, why: 'the closing line set apart from the paragraphs, on the 40 px step' },
  { id: 'c-how', below: 'dl.pr__list', gap: 80, why: 'the words end, then the practices as cards: a break between groups' },
  { id: 'hosts', below: 'div.tl__with', gap: 46, why: 'the founder, then the two hosts with her: a break between groups' },
  { id: ['kind', 'c-kind', 'early', 'c-early'], below: 'span.voices__mark', gap: 49, why: 'the quote mark is a large glyph in a tall, mostly empty box; the eye sees about 20 px' },
  { id: ['services', 'c-services'], below: 'div.mn__after', gap: 0, why: 'the price list ends on its rule and its own padding: the boxes touch, the eye sees about 24 px' },
  { id: ['aveda', 'c-aveda'], below: 'dl.av__rows', gap: 0, why: 'the facts as a table: its line sits on the table\'s top rule and the rows start under the rule; the eye sees about 10 px (pictures, 20 Nov)' },
  { id: 'pause', below: 'p.lead', gap: 390, near: 30, why: 'the gap holds the arched photo, drawn by ::before, which the walk cannot measure' },
];
const judged = (id, g) => JUDGED.find((j) => [].concat(j.id).includes(id) && g.below.startsWith(j.below) && Math.abs(g.gap - j.gap) <= (j.near || 8));
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
    // a button straight under another button is a group (the hero's pair sits 12 px apart): it is left out of the usual
    // gap, and flagged only when the two touch
    const ref = med(both.flatMap((x) => x.gaps.filter((g) => g.kind === 'button' && g.after !== 'button').map((g) => g.gap)));
    for (const sec of both) {
      sec.buttonRef = ref; sec.flags = [];
      for (const g of sec.gaps) {
        let why = null;
        if (g.kind === 'button' && g.after === 'button') {
          if (g.gap < 8) why = `crowded: a button ${g.gap} px under another button, a group of buttons sits 12 px apart`;
        } else if (g.kind === 'button') {
          if (ref && g.gap > 1.35 * ref && g.gap - ref >= 14) why = `wide: a button ${g.gap} px under ${g.above.split(' ')[0]}, this page's buttons sit ${ref} px under`;
          else if (ref && g.gap < .5 * ref && ref - g.gap >= 14) why = `crowded: a button ${g.gap} px under ${g.above.split(' ')[0]}, this page's buttons sit ${ref} px under`;
        } else if (g.sib.length) {
          const top = Math.max(...g.sib), m = med(g.sib);
          if (top >= 8 && g.gap > 1.6 * top && g.gap - top >= 24) why = `wide: ${g.gap} px, the stack's other gaps at most ${top} px`;
          else if (g.gap <= 4 && m >= 20) why = `crowded: ${g.gap} px against ${m} px in the same stack`;
        }
        const j = why && judged(sec.id, g);
        if (j) (sec.judged = sec.judged || []).push({ why, judged: j.why, ...g });
        else if (why) sec.flags.push({ why, ...g });
      }
      // a heading over its words: at least a fifth of its size between its baseline and their cap height
      for (const h of sec.heads) {
        if (h.eye >= .2 * h.size) continue;
        const g = { why: `crowded: words ${h.eye} px under the baseline of a ${h.size} px heading, a fifth of its size is ${Math.round(.2 * h.size)}`, kind: 'head', ...h, gap: Math.max(h.eye, 2) };
        const j = judged(sec.id, g);
        if (j) (sec.judged = sec.judged || []).push({ judged: j.why, ...g }); else sec.flags.push(g);
      }
      // the foot: words laid over a slide end on the page's foot; no slide's words end under half of it
      const f = sec.foot;
      if (f) {
        let why = null;
        if (f.over && f.gap > 1.5 * sec.base && f.gap - sec.base >= 24) why = `wide: the words end ${f.gap} px above the window's bottom, the page's foot is ${sec.base} px`;
        else if (f.gap < .5 * sec.base) why = `tight: the words end ${f.gap} px above the window's bottom, the page's foot is ${sec.base} px`;
        const g = why && { why, kind: 'foot', above: f.above, below: "(the window's bottom)", gap: Math.max(f.gap, 2), y: f.y, x: 0, w: opt.viewport.width };
        const j = g && judged(sec.id, g);
        if (j) (sec.judged = sec.judged || []).push({ judged: j.why, ...g }); else if (g) sec.flags.push(g);
      }
      // one flag per section and edge for what is cut off, naming the element lost furthest; its picture marks that edge
      for (const edge of ['bottom', 'top']) {
        const c = sec.cut.filter((x) => x.edge === edge);
        if (!c.length) continue;
        const worst = c.reduce((x, y) => (y.out > x.out ? y : x));
        sec.flags.push({ why: `cut off: ${c.length} element(s) past the section's ${edge} edge, out of sight, up to ${worst.out} px`, kind: 'cut',
          gap: 2, above: worst.label, below: `(the section's ${edge} edge)`, y: edge === 'bottom' ? sec.h - 2 : 0, x: 0, w: opt.viewport.width });
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
console.log('gaps: sections measured', log.length, '| flagged', flagged.length, '| flags', flagged.reduce((n, s) => n + s.flags.length, 0),
  '| judged by eye (gaps.mjs JUDGED)', log.reduce((n, s) => n + (s.judged || []).length, 0));
for (const s of flagged) for (const f of s.flags) console.log(`  ${s.v}-${s.world}-${s.id}-${s.w}: ${f.why} | above ${f.above} | below ${f.below}`);
