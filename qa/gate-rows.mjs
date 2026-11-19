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

// 1440 x 900: rows 4, 5, 6, 8, 9, 10, 12, 14, 15, 17, 20, 21, 22, 24, 25
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
  // row 10: each Inner Work section has its salon twin's tone and its computed ground (the salon world is read first)
  seen[`10 ${W}`] = secs.map((t) => t.slice(0, 3));
  if (P) {
    const twin = Object.fromEntries((seen['10 Salon OM'] || []).map(([id, tone, ground]) => [id, [tone, ground]]));
    for (const [id, tone, ground] of secs) {
      const t = twin[id.replace(/^c-/, '')];
      if (!t) continue;
      if (t[0] !== tone || t[1] !== ground) add(10, `"${id}" is ${tone} on ${ground}; its salon twin is ${t[0]} on ${t[1]}`);
    }
  }
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
    const blur0 = await p.evaluate((P) => { const l = document.querySelector(`#${P}pause :is(.mani__text, .ps__head) .l`); return l && getComputedStyle(l).filter; }, P);
    await wait(p, 5200);
    const pause = await p.evaluate((P) => {
      const s = document.getElementById(`${P}pause`), hd = s.querySelector('.mani__text, .ps__head'), ls = hd ? hd.querySelectorAll('.l') : [];   // the pause's heading, whichever block draws it
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
      return { text: (hd || {}).textContent?.trim().slice(0, 40), last: ls.length ? getComputedStyle(ls[ls.length - 1]).filter : null, rings, shadow, glow };
    }, P);
    seen[`15/17 ${W}`] = { blur0, ...pause };
    if (!/blur\((?!0px)/.test(blur0 || '')) add(15, `the pause's heading is not out of focus as it arrives (first letter: ${blur0})`);
    if (!(pause.last === 'none' || /blur\(0px\)/.test(pause.last || ''))) add(15, `the pause's heading has not come into focus 5 s after it arrived (last letter: ${pause.last})`);
    if (!P && !/^Take a breath\./.test(pause.text || '')) add(15, `the pause's heading reads "${pause.text}", not "Take a breath."`);
    if (pause.rings) add(17, `${pause.rings} ring line(s) are drawn in the pause`);
    if (pause.shadow.length) add(17, `a shadow around ${pause.shadow.slice(0, 3).join(', ')} in the pause`);
    if (pause.glow.length) add(17, `a glow (radial gradient) on ${pause.glow.slice(0, 3).join(', ')} in the pause`);
    await door(p, P, W, add, seen, '1440');
  }

  // rows 24 and 25: each sheet's clear window on its subject; every section heading at the one heading size
  await subjects(p, P, W, add, seen, '1440');
  await heads(p, P, W, add, seen, '1440');
  // rows 21 and 22: the second door's and Why Aveda's entries
  await entry(p, 21, `${P}deeper`, 'the second door', W, add, seen, '1440', vh);
  await entry(p, 22, `${P}aveda`, 'Why Aveda', W, add, seen, '1440', vh);

  // row 4: the visit preview's line reaches 05, its stops travel into the step rail at step 01, and back in reverse (M, G)
  const yv = await topOf(p, `${P}visit`), ya = await topOf(p, `${P}arrive`);
  if (yv >= 0 && ya >= 0 && await p.evaluate((P) => !!document.querySelector(`#${P}visit .ln__stops`), P)) {
    await jump(p, yv); await wait(p, 3600);
    const line = await p.evaluate((P) => {
      const s = document.getElementById(`${P}visit`), path = s.querySelector('.ln__path'), dots = s.querySelectorAll('.ln__dot');
      if (!path || dots.length < 5) return { dots: dots.length };
      const pr = path.getBoundingClientRect(), d = dots[dots.length - 1].getBoundingClientRect(), c = getComputedStyle(path);
      return { dots: dots.length, morph: s.classList.contains('pv--morph'), right: Math.round(pr.right), last: Math.round(d.left + d.width / 2), dash: c.strokeDashoffset, len: +path.getAttribute('pathLength') || path.getTotalLength() };
    }, P);
    await jump(p, ya); await wait(p, 2600);
    const inRail = await p.evaluate(() => document.querySelectorAll('#rail a.is-landed').length);
    await jump(p, yv); await wait(p, 2600);
    const back = await p.evaluate(() => document.querySelectorAll('#rail a.is-landed').length);
    seen[`4 ${W}`] = { ...line, inRail, back };
    if (line.dots !== 5) add(4, `the visit preview has ${line.dots} stops, not five`);
    else {
      if (line.right < line.last - 4) add(4, `the line ends at ${line.right} px, short of stop 05 at ${line.last} px`);
      const off = (parseFloat(line.dash) || 0) / (line.len || 1);   // the share of the line still undrawn (pathLength="1" on the page)
      if (off > 0.01) add(4, `the line is not drawn in fully 3.6 s after the preview arrives (dash offset ${line.dash} of ${line.len})`);
      if (!line.morph) add(4, 'the preview does not morph into the step rail (no pv--morph)');
      if (inRail < 5) add(4, `${inRail} of five stops landed in the step rail at step 01`);
      if (back > 0) add(4, `${back} stops stayed in the rail after scrolling back to the preview (no reverse)`);
    }
  }
}

// row 24 (task 4739f125; J 19 Nov 18:05 Z, Why Aveda: "is not highlighting the products, is highlighting something at the
// center"): at rest, each sheet section's clear window covers the subject its stage names. The subject (data-subject, fractions of
// the picture) is put on the screen here through the photo's own crop (object-fit cover at its object-position), independently
// of sheet.js; the window is read from the sheet's own mask (its oval and the clear inner part). Pass: the subject's centre and
// the middle of each of its sides lie in the clear part (inside 1.1 of it).
async function subjects(p, P, W, add, seen, size) {
  const ids = await p.evaluate((P) => [...document.querySelectorAll(`#main-${P ? 'coaching' : 'salon'} section[id] [data-sheet][data-subject]`)].map((e) => e.closest('section[id]').id), P);
  for (const id of ids) {
    const y = await topOf(p, id); await jump(p, y);
    await p.waitForFunction((id) => !!document.querySelector(`#${id} .sh--on`), id, { timeout: 8000 }).catch(() => {}); await wait(p, 600);
    const m = await p.evaluate((id) => {
      const st = document.querySelector(`#${id} [data-sheet]`), im = st.querySelector('.sh__ph img'), sh = st.querySelector('.sh__sheet');
      const k = String(sh.style.webkitMaskImage || sh.style.maskImage || '').match(/ellipse (-?[\d.]+)px (-?[\d.]+)px at (-?[\d.]+)px (-?[\d.]+)px, transparent (-?[\d.]+)%/);
      const b = st.getAttribute('data-subject').split(/\s+/).map(Number), Wd = st.clientWidth, Hd = st.clientHeight, nw = im.naturalWidth, nh = im.naturalHeight;
      if (!k || !nw) return { id, mask: k ? 'read' : 'no oval window', loaded: !!nw };
      const op = getComputedStyle(im).objectPosition.split(' ').map(parseFloat), s = Math.max(Wd / nw, Hd / nh), ox = (Wd - nw * s) * op[0] / 100, oy = (Hd - nh * s) * op[1] / 100;
      const x0 = ox + b[0] * nw * s, x1 = ox + b[2] * nw * s, y0 = Math.max(0, oy + b[1] * nh * s), y1 = Math.min(Hd, oy + b[3] * nh * s), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const rx = +k[1] * +k[5] / 100, ry = +k[2] * +k[5] / 100, X = +k[3], Y = +k[4], v = (x, y) => ((x - X) / rx) ** 2 + ((y - Y) / ry) ** 2;
      const pts = [[cx, cy], [x0, cy], [x1, cy], [cx, y0], [cx, y1]], worst = Math.max(...pts.map(([x, y]) => v(x, y)));
      return { id, subject: b.join(' '), box: [x0, y0, x1, y1].map(Math.round), clear: [X, Y, rx, ry].map(Math.round), worst: +worst.toFixed(2) };
    }, id);
    seen[`24 ${W} ${size} ${id}`] = m;
    if (m.mask) add(24, `at ${size} "${id}": ${m.mask}${m.loaded === false ? ', its photo not loaded' : ''}`);
    else if (!(m.worst <= 1.1)) add(24, `at ${size} "${id}": its clear window (centre ${m.clear[0]}, ${m.clear[1]}) does not hold its subject ${m.subject} (box ${m.box.join(', ')}; the farthest point at ${m.worst} of the clear part)`);
  }
}

// row 25 (J 19 Nov 18:05 Z, Why Aveda: "the heading is still not big as the other ones"; M/G's one type scale, mgs.css --t-*):
// every section's heading (its first h2: the visit, the menu, the team, Why Aveda, the second door; never the step titles or the
// closing words, which take the display size) is drawn at --t-h2, read in the page at this size.
async function heads(p, P, W, add, seen, size) {
  const r = await p.evaluate((P) => {
    const main = document.getElementById(`main-${P ? 'coaching' : 'salon'}`), pr = document.createElement('span');
    pr.style.fontSize = 'var(--t-h2)'; main.appendChild(pr); const want = parseFloat(getComputedStyle(pr).fontSize); pr.remove();
    const got = [...main.querySelectorAll(':scope > section[id]')].map((s) => [s.id, s.querySelector('h2')])
      .filter(([, h]) => h && !h.matches('.ch__title, .cl__words h2, h1')).map(([id, h]) => [id, +parseFloat(getComputedStyle(h).fontSize).toFixed(1)]);
    return { want, got };
  }, P);
  seen[`25 ${W} ${size}`] = r;
  for (const [id, fs] of r.got) if (Math.abs(fs - r.want) > .6) add(25, `at ${size} "${id}"'s heading is ${fs} px, not the one heading size ${r.want} px`);
}

// rows 21 and 22: a section's entry J kept (task 4739f125; J 19 Nov 14:25 Z: "you broke the intro text and image animation, zoom
// in text appearing"). Reached from the screen before it after a person's pause there (0.7 s), every 100 ms for 4.5 s: whether it
// is on (active, its sheet drawn), its picture's scale (the `scale` property and its transform together) and its heading's
// opacity. As it comes on, the picture is still close (scale over 1.04) and the heading not yet there (under 0.3); 4.5 s on, the
// picture rests at its size (1) and the heading is there; the heading never comes in before the sheet is drawn (behind it).
async function entry(p, n, id, name, W, add, seen, size, vh) {
  const y = await topOf(p, id);
  if (y < 0) return;
  await jump(p, Math.max(0, y - vh)); await wait(p, 700);
  await p.evaluate((id) => {
    const s = document.getElementById(id), im = s.querySelector('.sh__ph img, .ph-bg img, .av__ph img'), h = s.querySelector('.mask__in'), t0 = performance.now(), log = window.__entry = [];
    const sc = (e) => { if (!e) return null; const c = getComputedStyle(e), k = c.scale === 'none' ? 1 : parseFloat(c.scale), m = c.transform === 'none' ? null : new DOMMatrix(c.transform); return +(k * (m ? Math.hypot(m.a, m.b) : 1)).toFixed(3); };
    (function tick() {
      const t = performance.now() - t0;
      log.push({ t: Math.round(t), a: s.classList.contains('is-active'), on: !s.querySelector('.sh') || !!s.querySelector('.sh--on'), sc: sc(im), ho: h ? +(+getComputedStyle(h).opacity).toFixed(2) : null });
      if (t < 4500) setTimeout(tick, 100);
    })();
  }, id);
  await jump(p, y); await wait(p, 4700);
  const log = await p.evaluate(() => window.__entry), k = log.findIndex((x) => x.a && x.on), end = log[log.length - 1];
  seen[`${n} ${W} ${size}`] = { arrive: log[k] || null, end, active: (log.find((x) => x.a) || {}).t ?? null, on: (log.find((x) => x.on) || {}).t ?? null };
  if (k < 0) return add(n, `at ${size} ${name} did not come on 4.5 s after it was reached (${log.some((x) => x.a) ? 'its sheet was never drawn' : 'never active'})`);
  const early = log.find((x) => !x.on && x.ho > 0.05);
  if (early) add(n, `at ${size} ${name}'s heading came in before its sheet was drawn, behind it (opacity ${early.ho} at ${early.t} ms)`);
  if (!(log[k].sc > 1.04)) add(n, `at ${size} ${name}'s picture does not settle in from close as it arrives (scale ${log[k].sc})`);
  if (!(end.sc <= 1.005)) add(n, `at ${size} ${name}'s picture has not come to rest at its size 4.5 s after it was reached (scale ${end.sc})`);
  if (!(log[k].ho < 0.3)) add(n, `at ${size} ${name}'s heading is already there as it arrives; it does not come in (opacity ${log[k].ho})`);
  if (!(end.ho >= 0.99)) add(n, `at ${size} ${name}'s heading has not come in 4.5 s after it was reached (opacity ${end.ho})`);
  await jump(p, y); await wait(p, 200);
}

// row 20: the pause is J's pick, B · The breath (task 95ac520e): its room picture (the salon's: the empty chair by the window;
// Inner Work's its own, never the 17 Nov spread's guest) loads, starts as a thin line (clip-path inset 48 % top and bottom) and
// opens as you scroll through it: half way through the section the room is open (inset under 5 %) and the question has come
async function door(p, P, W, add, seen, size) {
  const read = () => p.evaluate((P) => {
    const s = document.getElementById(`${P}pause`), f = s && s.querySelector('.ps__pic'), i = f && f.querySelector('img');
    if (!s || !s.classList.contains('ps--breath') || !f || !i) return null;
    const r = s.getBoundingClientRect(), c = getComputedStyle(f), top = parseFloat((c.clipPath.match(/inset\(([\d.]+)%/) || [])[1]);
    return { y: Math.round(scrollY + r.top), span: Math.round(r.height - innerHeight), top: isNaN(top) ? (c.clipPath === 'none' ? 0 : null) : top,
      src: (i.currentSrc || i.src).replace(/^.*\/img\//, 'img/').replace(/\?.*/, ''), shown: i.complete && i.naturalWidth > 0 };
  }, P);
  const d0 = await read();
  if (!d0) { seen[`20 ${W} ${size}`] = null; return add(20, `at ${size} the pause is not B · The breath (.ps--breath) with its room picture`); }
  const want = d0.y + Math.round(d0.span * 0.6);
  await jump(p, want); await wait(p, 900);
  const d1 = await read(), at = await p.evaluate(() => Math.round(scrollY));     // where the page really stands: a pull would show here
  seen[`20 ${W} ${size}`] = { ...d0, open: d1 && d1.top, want, at };
  if (!P && !/real-chair-window/.test(d0.src)) add(20, `at ${size} the breath opens on ${d0.src}, not the empty chair by the window`);
  if (/om-pause-guest/.test(d0.src)) add(20, `at ${size} the breath shows the 17 Nov editorial spread's picture (${d0.src})`);
  if (!d0.shown) add(20, `at ${size} the breath's picture did not load`);
  if (!(d0.top > 40)) add(20, `at ${size} the room does not start as a thin line as the pause arrives (clip inset ${d0.top} %)`);
  if (!(d1 && d1.top !== null && d1.top < 5)) add(20, `at ${size} the room has not opened 60 % of the way through the pause (clip inset ${d1 && d1.top} %; the page at ${at} px, asked ${want})`);
  await jump(p, d0.y); await wait(p, 300);
}

// 390 x 844 phone: rows 6, 14, 20 and 25
async function phone(p, v, P, W, add, seen) {
  await heads(p, P, W, add, seen, '390');
  const yp = await topOf(p, `${P}pause`);
  if (yp >= 0) { await jump(p, Math.max(0, yp - 844)); await wait(p, 500); await jump(p, yp); await wait(p, 5200); await door(p, P, W, add, seen, '390'); }
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
  await heads(p, P, W, add, seen, '3230');
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

export { desktop, phone, sixK, WORLDS };
export const PASSES = [
  ['1440', { viewport: { width: 1440, height: 900 } }, desktop],
  ['390', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, phone],
  ['6K', { viewport: { width: 3230, height: 1319 }, deviceScaleFactor: 2 }, sixK],
];

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
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
}
