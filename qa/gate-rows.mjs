// The deploy gate's measured half (task 6328eca1): the rows of reference/approved-features.md that only a rendered page can
// show (a computed colour, a position that stays, a quote that changes in place, a letter that comes into focus, a picture's
// pixels at J's 6K window), read in WebKit (J, 4 Nov: browser checks in WebKit, never Chromium) on the built M/G/S pages.
// option-2.x-shared/source/approved_gate.py reads the result before any deploy, and fetches it from the pool when it is
// missing; the static rows (a tag, a class, a file) it checks itself.
//   node qa/gate-rows.mjs <out-dir> [m,g,s]
//   -> <out-dir>/gate-rows-<v>-<key>.json per page: { v, key, off: { row: [what is off, ...] }, seen: { what was measured } }
// key = the first 12 hex of sha256(built page + this file + lib.mjs): a changed page or check is measured again, an unchanged
// one never (approved_gate.py computes the same key).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pw from 'playwright';
import { serve, open, wait, jump, toWorld, pictures } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || 'gate-out'), VERS = (process.argv[3] || 'm,g,s').split(',');
// row 9 (J, 19 Oct, "this is much better ?accent=b"; option-2.2/design.md "Look"): every green a page shows is one of option B's
// forests: the fill #276B45 and its hover #1F5A39, lifted forest #3F9465 where a dark ground remains, deep forest #1E5A3A on
// light clay. Never mint (the client, 19 Oct: "This mint grint is not the one that we want"). On a dark ground the buttons are
// ivory by design, so the row is read on the marks and fills that carry a green, never on one button.
const FORESTS = { 'rgb(39, 107, 69)': '#276B45', 'rgb(31, 90, 57)': '#1F5A39', 'rgb(63, 148, 101)': '#3F9465', 'rgb(30, 90, 58)': '#1E5A3A' };
const SHARP = 1.0;                   // row 18: device pixels per file pixel at J's 6K window; over 1 = the file is enlarged = soft

export function key(v) {
  const h = crypto.createHash('sha256');
  for (const f of [path.join(REPO, 'option-2.2-mgs', v, 'index.html'), path.join(HERE, 'gate-rows.mjs'), path.join(HERE, 'lib.mjs')]) h.update(fs.readFileSync(f));
  return h.digest('hex').slice(0, 12);
}

const WORLDS = [['salon', '', 'Salon OM'], ['coaching', 'c-', 'Inner Work']];
const topOf = (p, id) => p.evaluate((id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : -1; }, id);
const frames = (p) => p.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));

// 1440 x 900: rows 4, 5, 6, 8, 9, 12, 14, 15, 17
async function desktop(p, v, P, W, add, seen) {
  const vh = 900;
  // row 9: every green on the page is one of option B's forests (a green = its green clearly above its red and blue)
  const greens = await p.evaluate((P) => {
    const found = {};
    for (const el of document.querySelectorAll(`#main-${P ? 'coaching' : 'salon'} *`)) {
      if (!el.getClientRects().length) continue;
      const c = getComputedStyle(el);
      if (c.visibility === 'hidden') continue;
      const props = [c.color, c.backgroundColor, c.fill, c.stroke];
      if (parseFloat(c.borderTopWidth) > 0) props.push(c.borderTopColor);
      for (const val of props) {
        const m = /rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?/.exec(val || '');
        if (!m || m[4] === '0') continue;
        const [R, G, B] = [+m[1], +m[2], +m[3]];
        if (!(G > R + 25 && G > B + 10)) continue;
        const k = `rgb(${R}, ${G}, ${B})`;
        (found[k] ||= new Set()).add(`${el.closest('section[id]')?.id || ''} ${el.tagName.toLowerCase()}${el.classList[0] ? '.' + el.classList[0] : ''}`);
      }
    }
    return Object.fromEntries(Object.entries(found).map(([k, v]) => [k, [...v].slice(0, 4)]));
  }, P);
  seen[`9 ${W}`] = greens;
  for (const [c, where] of Object.entries(greens)) if (!FORESTS[c]) add(9, `${c} is not one of option B's forests (on ${where.join(', ')})`);
  if (!Object.keys(greens).some((c) => FORESTS[c])) add(9, "no mark or fill wears option B's forest");

  // row 12: no two neighbouring light sections share a ground and a shape
  const secs = await p.evaluate((P) => [...document.querySelectorAll(`#main-${P ? 'coaching' : 'salon'} > section.s`)].map((s) => {
    const c = getComputedStyle(s);
    return [s.id, s.getAttribute('data-tone'), c.backgroundColor + ' ' + c.backgroundImage.slice(0, 60), [...s.classList].filter((k) => !['s', 's--auto', 'is-active', 'is-past', 'is-seen', 'is-in'].includes(k)).sort().join(' ')];
  }), P);
  seen[`12 ${W}`] = secs.map((s) => `${s[0]}:${s[1]}:${s[2]}:${s[3]}`);
  for (let i = 1; i < secs.length; i++) {
    const [a, b] = [secs[i - 1], secs[i]];
    if (a[1] === 'light' && b[1] === 'light' && a[2] === b[2] && a[3] === b[3]) add(12, `light sections "${a[0]}" and "${b[0]}" sit together with one ground and one shape`);
  }

  // row 6: the menu's photo panel stays under the header while the list scrolls (read while the list still runs on below the
  // panel: past the list's end a sticky panel leaves with it, as it should; Inner Work's list is shorter than the salon's)
  const ys = await topOf(p, `${P}services`);
  if (ys >= 0) {
    const panel = (P) => p.evaluate((P) => {
      const e = document.querySelector(`#${P}services .mn__ph`); if (!e) return null;
      const r = e.getBoundingClientRect(), box = e.parentElement.getBoundingClientRect();
      return [Math.round(r.top), Math.round(r.height), getComputedStyle(e).position, Math.round(box.bottom - r.bottom)];
    }, P);
    await jump(p, ys + 160); await wait(p, 600);
    const at = [await panel(P)];
    const room = at[0] ? Math.min(300, at[0][3] - 8) : 0;
    if (at[0] && room >= 40) { await jump(p, ys + 160 + room); await wait(p, 600); at.push(await panel(P)); }
    seen[`6 ${W} 1440`] = { at, room };
    if (!at[0]) add(6, 'the menu has no photo panel (.mn__ph)');
    else if (at[0][2] !== 'sticky') add(6, `the menu's photo panel is not sticky (position ${at[0][2]})`);
    else if (at[1] && Math.abs(at[0][0] - at[1][0]) > 2) add(6, `the menu's photo panel does not stay while the list scrolls (top ${at[0][0]} then ${at[1][0]}, ${room} px further down the list)`);
  }

  // row 5: a slow wheel through the tall menu never jumps back to its top, and the same in reverse; read inside the menu's free
  // scroll (until its bottom meets the window's), since past its end the bottom aligns and the next slide pulls in by design
  const hs = ys >= 0 ? await p.evaluate((id) => Math.round(document.getElementById(id).getBoundingClientRect().height), `${P}services`) : 0;
  const steps = Math.min(10, Math.floor((hs - vh - 30) / 90));
  if (ys >= 0 && steps < 3) seen[`5 ${W}`] = { top: ys, height: hs, note: 'the menu is not taller than the window, so it has no free scroll to read' };
  if (ys >= 0 && steps >= 3) {
    await jump(p, ys); await wait(p, 900);
    await p.mouse.move(720, 450);
    const down = [], up = [];
    for (let i = 0; i < steps; i++) { await p.mouse.wheel(0, 90); await wait(p, 180); down.push(await p.evaluate(() => Math.round(scrollY))); }
    await wait(p, 1400);
    for (let i = 0; i < steps - 1; i++) { await p.mouse.wheel(0, -90); await wait(p, 180); up.push(await p.evaluate(() => Math.round(scrollY))); }
    seen[`5 ${W}`] = { top: ys, height: hs, down, up };
    const back = down.findIndex((y, i) => i && y < down[i - 1] - 4);
    if (back > 0) add(5, `wheeling down through the menu jumped back from ${down[back - 1]} to ${down[back]}`);
    const fwd = up.findIndex((y, i) => i && y > up[i - 1] + 4);
    if (fwd > 0) add(5, `wheeling up through the menu jumped forward from ${up[fwd - 1]} to ${up[fwd]}`);
    if (down[down.length - 1] <= ys + 4) add(5, `a slow wheel did not move into the menu (stayed at ${down[down.length - 1]}, its top is ${ys})`);
  }

  // row 8: the voices: one centred testimonial at a time, changing in place, on the forest ground
  for (const id of await p.evaluate((P) => [...document.querySelectorAll(`#main-${P ? 'coaching' : 'salon'} > section.voices`)].filter((s) => s.querySelectorAll('[data-quotes] .q').length > 1).map((s) => s.id), P)) {
    await jump(p, await topOf(p, id)); await wait(p, 2400);
    const read = () => p.evaluate((id) => {
      const s = document.getElementById(id), sr = s.getBoundingClientRect();
      const on = [...s.querySelectorAll('[data-quotes] .q')].map((q, i) => [i, +getComputedStyle(q).opacity, q.getBoundingClientRect()]).filter((x) => x[1] > 0.5);
      const c = getComputedStyle(s);
      return { on: on.map((x) => x[0]), off: on.map((x) => Math.round(Math.abs(x[2].left + x[2].width / 2 - (sr.left + sr.width / 2)))), w: Math.round(sr.width), ground: c.backgroundColor, img: c.backgroundImage.slice(0, 80) };
    }, id);
    const a = await read(); await wait(p, 7200); const b = await read();
    seen[`8 ${W} ${id}`] = [a, b];
    if (a.on.length !== 1 || b.on.length !== 1) add(8, `"${id}" shows ${a.on.length} then ${b.on.length} testimonials at once, not one`);
    else if (a.on[0] === b.on[0]) add(8, `"${id}": the testimonial did not change in place within 7 s`);
    if (a.off.some((d) => d > a.w * 0.03)) add(8, `"${id}": the testimonial sits ${a.off[0]} px off the centre`);
    const g = (a.ground.match(/[\d.]+/g) || []).map(Number);
    if (!(g.length >= 3 && g[1] > g[0] + 8 && g[1] > g[2]) && !/rgb\(\s*\d+,\s*\d{2,3},/.test(a.img)) add(8, `"${id}": the ground is ${a.ground}, not the forest green`);
  }

  // row 14: the footer sits inside the closing slide, with no empty band under it
  const yb = await topOf(p, `${P}begin`);
  if (yb >= 0) {
    await jump(p, yb); await wait(p, 900);
    const f = await p.evaluate((P) => { const s = document.getElementById(`${P}begin`), f = s.querySelector('footer'); if (!f) return null; const a = s.getBoundingClientRect(), b = f.getBoundingClientRect(); return [Math.round(a.height), Math.round(a.bottom - b.bottom)]; }, P);
    seen[`14 ${W} 1440`] = f;
    if (!f) add(14, 'the closing slide has no footer inside it');
    else if (f[1] > 2) add(14, `an empty band of ${f[1]} px under the footer at 1440`);
  }

  // rows 15 and 17: the pause (M and G)
  const yp = await topOf(p, `${P}pause`);
  if (yp >= 0) {
    await jump(p, Math.max(0, yp - vh)); await wait(p, 700);
    await jump(p, yp); await frames(p);
    const blur0 = await p.evaluate((P) => { const l = document.querySelector(`#${P}pause .mani__text .l`); return l && getComputedStyle(l).filter; }, P);
    await wait(p, 5200);
    const pause = await p.evaluate((P) => {
      const s = document.getElementById(`${P}pause`), ls = s.querySelectorAll('.mani__text .l');
      const vis = (e) => e.checkVisibility ? e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) : !!e.getClientRects().length;
      const rings = [...s.querySelectorAll('circle, ellipse')].filter((c) => vis(c) && c.getBoundingClientRect().width > 4).length;
      const shadow = [], glow = [];
      for (const e of [s, ...s.querySelectorAll('*')]) {
        if (!vis(e)) continue;
        const name = e.tagName.toLowerCase() + (e.classList.length ? '.' + [...e.classList].join('.') : '');
        const c = getComputedStyle(e);
        if (c.boxShadow !== 'none' && !e.closest('a, button')) shadow.push(name);
        if (/drop-shadow/.test(c.filter)) shadow.push(name + ' (drop-shadow)');
        for (const pe of ['::before', '::after']) {
          const q = getComputedStyle(e, pe);
          if (q.content !== 'none' && q.display !== 'none' && /radial-gradient/.test(q.backgroundImage) && +q.opacity > 0.05) glow.push(name + pe);
        }
        if (e !== s && /radial-gradient/.test(c.backgroundImage)) glow.push(name);
      }
      return { text: (s.querySelector('.mani__text') || {}).textContent?.trim().slice(0, 40), last: ls.length ? getComputedStyle(ls[ls.length - 1]).filter : null, rings, shadow, glow };
    }, P);
    seen[`15/17 ${W}`] = { blur0, ...pause };
    if (!/blur\((?!0px)/.test(blur0 || '')) add(15, `the pause's heading is not out of focus as it arrives (first letter: ${blur0})`);
    if (!(pause.last === 'none' || /blur\(0px\)/.test(pause.last || ''))) add(15, `the pause's heading has not come into focus 5 s after it arrived (last letter: ${pause.last})`);
    if (!P && !/^Take a breath\./.test(pause.text || '')) add(15, `the pause's heading reads "${pause.text}", not "Take a breath."`);
    if (pause.rings) add(17, `${pause.rings} ring line(s) are drawn in the pause`);
    if (pause.shadow.length) add(17, `a shadow around ${pause.shadow.slice(0, 3).join(', ')} in the pause`);
    if (pause.glow.length) add(17, `a glow (radial gradient) on ${pause.glow.slice(0, 3).join(', ')} in the pause`);
  }

  // row 4: the visit preview's line reaches 05, its stops travel into the step rail at step 01, and back in reverse (M, G)
  const yv = await topOf(p, `${P}visit`), ya = await topOf(p, `${P}arrive`);
  if (yv >= 0 && ya >= 0 && await p.evaluate((P) => !!document.querySelector(`#${P}visit .ln__stops`), P)) {
    await jump(p, yv); await wait(p, 3600);
    const line = await p.evaluate((P) => {
      const s = document.getElementById(`${P}visit`), path = s.querySelector('.ln__path'), dots = s.querySelectorAll('.ln__dot');
      if (!path || dots.length < 5) return { dots: dots.length };
      const pr = path.getBoundingClientRect(), d = dots[dots.length - 1].getBoundingClientRect(), c = getComputedStyle(path);
      return { dots: dots.length, morph: s.classList.contains('pv--morph'), right: Math.round(pr.right), last: Math.round(d.left + d.width / 2), dash: c.strokeDashoffset, len: Math.round(path.getTotalLength()) };
    }, P);
    await jump(p, ya); await wait(p, 2600);
    const inRail = await p.evaluate(() => document.querySelectorAll('#rail a.is-landed').length);
    await jump(p, yv); await wait(p, 2600);
    const back = await p.evaluate(() => document.querySelectorAll('#rail a.is-landed').length);
    seen[`4 ${W}`] = { ...line, inRail, back };
    if (line.dots !== 5) add(4, `the visit preview has ${line.dots} stops, not five`);
    else {
      if (line.right < line.last - 4) add(4, `the line ends at ${line.right} px, short of stop 05 at ${line.last} px`);
      const off = parseFloat(line.dash) || 0;
      if (off > 2) add(4, `the line is not drawn in fully 3.6 s after the preview arrives (dash offset ${line.dash} of ${line.len})`);
      if (!line.morph) add(4, 'the preview does not morph into the step rail (no pv--morph)');
      if (inRail < 5) add(4, `${inRail} of five stops landed in the step rail at step 01`);
      if (back > 0) add(4, `${back} stops stayed in the rail after scrolling back to the preview (no reverse)`);
    }
  }
}

// 390 x 844 phone: rows 6 and 14
async function phone(p, v, P, W, add, seen) {
  const ys = await topOf(p, `${P}services`);
  if (ys >= 0) {
    const h = await p.evaluate((P) => document.getElementById(`${P}services`).getBoundingClientRect().height, P);
    for (let y = ys; y < ys + h; y += 600) { await jump(p, y); await wait(p, 250); }
    const m = await p.evaluate((P) => {
      const s = document.getElementById(`${P}services`), panel = s.querySelector('.mn__ph');
      const rows = [...s.querySelectorAll('.mn__rph')];
      return { panel: panel ? panel.getBoundingClientRect().width : 0, rows: rows.length, shown: rows.filter((f) => { const i = f.querySelector('img'); return i && i.getBoundingClientRect().width > 40 && i.complete && i.naturalWidth; }).length, srcs: new Set(rows.map((f) => f.querySelector('img')?.getAttribute('src'))).size };
    }, P);
    seen[`6 ${W} 390`] = m;
    if (!m.rows) add(6, 'on a phone the menu rows carry no photos (.mn__rph)');
    else if (m.shown < m.rows) add(6, `on a phone ${m.rows - m.shown} of ${m.rows} menu rows show no photo`);
    else if (m.srcs < m.rows) add(6, 'on a phone two menu rows show the same photo');
  }
  const yb = await topOf(p, `${P}begin`);
  if (yb >= 0) {
    await jump(p, yb); await wait(p, 900);
    const f = await p.evaluate((P) => { const s = document.getElementById(`${P}begin`), f = s.querySelector('footer'); if (!f) return null; const a = s.getBoundingClientRect(), b = f.getBoundingClientRect(); return [Math.round(a.height), Math.round(a.bottom - b.bottom)]; }, P);
    seen[`14 ${W} 390`] = f;
    if (f && f[1] > 2) add(14, `an empty band of ${f[1]} px under the footer on a phone`);
  }
}

// 3230 x 1319 at 2x (J's 6K window): row 18, every picture drawn from at least as many pixels as the screen shows
async function sixK(p, v, P, W, add, seen) {
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 1100) { await jump(p, y); await wait(p, 160); }
  await wait(p, 900);
  const main = P ? 'main-coaching' : 'main-salon';
  const mine = await p.evaluate((main) => [...document.querySelectorAll(`#${main} section[id]`)].map((s) => s.id), main);
  // at rest: each picture's own laid-out size (an entry zoom or the step's leaving zoom is motion, not its display size); a film's
  // still is the film's first frame until it plays, so it is judged with its film (no row covers the films' pixels: kept in seen)
  const all = (await pictures(p, { rest: true })).filter((g) => mine.includes(g.where));
  seen[`18 ${W} film stills`] = all.filter((g) => g.film).map((g) => `${g.where} ${String(g.file || g.src).replace(/\?v=.*/, '')} ${(g.scale * 2).toFixed(2)}x`);
  const got = all.filter((g) => !g.film);
  const soft = got.filter((g) => g.scale * 2 > SHARP + 0.005);
  seen[`18 ${W}`] = { pictures: got.length, soft: soft.map((g) => `${g.where} ${g.file} ${g.nat} drawn ${g.box} = ${(g.scale * 2).toFixed(2)}x`) };
  for (const g of soft) add(18, `"${g.where}": ${String(g.file).replace(/\?v=.*/, '')} (${g.nat[0]} px wide) is enlarged ${(g.scale * 2).toFixed(2)}x on J's 6K window, so it is soft`);
}

const PASSES = [
  ['1440', { viewport: { width: 1440, height: 900 } }, desktop],
  ['390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, phone],
  ['6K', { viewport: { width: 3230, height: 1319 }, deviceScaleFactor: 2 }, sixK],
];

fs.mkdirSync(OUT, { recursive: true });
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}`;
// the pool's pinned WebKit when %WEBKIT% is set (run-at-ref --asset WEBKIT: the job's own home has no Playwright browser), else Playwright's own
const browser = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
console.log('webkit', browser.version(), process.env.WEBKIT ? 'from the pool asset' : 'from Playwright');
let red = 0;
try {
  for (const v of VERS) {
    const off = {}, seen = {};
    for (const [size, opts, fn] of PASSES) {
      const ctx = await browser.newContext(opts);
      const p = await open(ctx, `${base}/${v}/`);
      for (const [w, P, W] of WORLDS) {
        if (w === 'coaching') await toWorld(p, 'coaching');
        await jump(p, 0); await wait(p, 400);
        await fn(p, v, P, W, (n, m) => (off[n] ||= []).push(`${W}: ${m}`), seen);
      }
      await ctx.close();
    }
    const k = key(v);
    fs.writeFileSync(path.join(OUT, `gate-rows-${v}-${k}.json`), JSON.stringify({ v, key: k, off, seen }, null, 1) + '\n');
    const n = Object.keys(off).length; red += n;
    console.log(`${v.toUpperCase()} ${k}: ` + (n ? 'OFF ' + Object.entries(off).map(([r, m]) => `row ${r}: ${m.join(' | ')}`).join(' || ') : 'every measured row holds'));
  }
} finally { await browser.close(); srv.close(); }
// the run measured every page and wrote its result: the gate judges it, so a row that is off is not a failed run (a failed run
// keeps no result where the gate reads it); exit 1 only when a page could not be measured (thrown above)
console.log(red ? `${red} row(s) off: the gate (approved_gate.py) refuses on them` : 'every measured row holds');
process.exit(0);
