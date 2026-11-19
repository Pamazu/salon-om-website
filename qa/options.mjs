// The option switcher (task e5325977): Shift+V shows the panel, it follows the section on screen, each of the pause's options
// swaps in place in both worlds, the address and this browser keep the choice, a link opens on it, Shift+V hides the panel,
// the page's own options (the world switch) still switch, the phone's handle opens it, and B scrolls through with the page's
// snap on. A picture's options (task 279db527): the pause's picture lists its candidates under the section's options, a choice
// swaps every copy in place with its AI label, survives a section option, is kept in the address and this browser; the menu's
// path (a picture opened by its row, in a panel shared by six) on a fixture page, since no service picture has candidates yet.
// WebKit (WEBKIT=<path> for the pool's pinned build). Writes <out>/result.json and screenshots.
//   node options.mjs [out]
import * as pw from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { serve, jump, wait, toWorld } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(HERE, '..');
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-options')); fs.mkdirSync(OUT, { recursive: true });
// the fixture: M as this tree builds it, with two candidates declared for Blonding (one generated, one real), kept in <out> only
const FIX = path.join(OUT, 'fixture-m.html');
const fx = spawnSync('python3', ['-c', `import sys, importlib.util; sys.path.insert(0, 'option-2.x-shared/source'); import build, mgs_parts as MP
MP.PICTURE_OPTIONS['om-menu-blonding.webp'] = dict(name='Blonding', live='Today', options=[dict(key='gen', label='A generated one', img='om-pause-rest.webp', alt='g', ai=MP.AI_GUEST, pos='60% 40%'), dict(key='real', label='A real one', img='real-lounge.webp', alt='r')])
spec = importlib.util.spec_from_file_location('c', 'option-2.x-shared/source/copy_2_2_m.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
open(sys.argv[1], 'w').write(build.page(m.CFG)[1])`, FIX], { cwd: REPO, encoding: 'utf8' });
if (fx.status) { console.error(fx.stderr); process.exit(1); }
const srv = await serve(REPO, (u, req, res) => {
  if (u === '/x/') { res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); fs.createReadStream(FIX).pipe(res); return true; }
  if (u.startsWith('/x/')) { res.writeHead(302, { Location: '/m/' + u.slice(3) }); res.end(); return true; }
}), base = `http://127.0.0.1:${srv.address().port}`;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), started: new Date().toISOString(), checks: [], errors: [] };
const ok = (name, pass, info) => { res.checks.push({ name, pass: !!pass, info }); console.log(pass ? 'PASS' : 'FAIL', name, info === undefined ? '' : JSON.stringify(info)); };
const shot = (p, name) => p.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: 78 });

async function page(ctx, url, tag) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => res.errors.push(`${tag}: ${e.message}`));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|play\(\)|NotAllowedError|AbortError/.test(m.text())) res.errors.push(`${tag}: ${m.text()}`); });
  await p.addInitScript(() => { try { localStorage.setItem('om-sound', 'off'); } catch (e) {} });
  await p.goto(url, { waitUntil: 'load' }); await wait(p, 1500);
  return p;
}
const state = (p) => p.evaluate(() => {
  const pn = document.getElementById('opt-panel'), q = (s) => document.getElementById(s);
  return { open: !!pn && !pn.hidden, sec: pn && pn.querySelector('.opt__sec') ? pn.querySelector('.opt__sec').textContent : null,
    rows: pn ? [...pn.querySelectorAll('.opt__row:not(.opt__row--pic)')].map((r) => r.textContent.trim()) : [], on: pn ? (pn.querySelector('.opt__row:not(.opt__row--pic)[aria-checked="true"]') || {}).textContent : null,
    pics: pn ? [...pn.querySelectorAll('.opt__row--pic')].map((r) => r.getAttribute('data-k') + (r.getAttribute('aria-checked') === 'true' ? '*' : '')) : [],
    picImgs: [...document.querySelectorAll('#pause img[data-pic]')].map((i) => (i.getAttribute('src') || '').split('?')[0]),
    picMark: (() => { const m = [...document.querySelectorAll('#pause .ai-mark')].filter((x) => !x.hidden && x.getClientRects().length)[0]; return m ? m.textContent : null; })(),
    // Inner Work's pause has a picture of its own (task e1a1e009): its copies, its label, and where its focus lands
    iwImgs: [...document.querySelectorAll('#c-pause img[data-pic]')].map((i) => (i.getAttribute('src') || '').split('?')[0]),
    iwMark: (() => { const m = [...document.querySelectorAll('#c-pause .ai-mark')].filter((x) => !x.hidden && x.getClientRects().length)[0]; return m ? m.textContent : null; })(),
    // as WebKit writes it back (46.200001%), to the tenth of a percent the candidates declare
    pos: [...document.querySelectorAll('#pause img[data-pic], #c-pause img[data-pic]')].filter((i) => i.getClientRects().length).map((i) => getComputedStyle(i).objectPosition.split(' ').map((x) => Math.round(parseFloat(x) * 10) / 10 + '%').join(' ')),
    pause: q('pause') && q('pause').getAttribute('data-opt'), cpause: q('c-pause') && q('c-pause').getAttribute('data-opt'),
    url: location.search, ls: Object.keys(localStorage).filter((k) => k.indexOf('om-opt-') === 0).map((k) => k + '=' + localStorage.getItem(k)),
    thumbs: pn ? [...pn.querySelectorAll('.opt__th img')].map((i) => i.complete && i.naturalWidth > 0) : [],
    letters: q('pause') ? q('pause').querySelectorAll('[data-write] .l').length : 0, sw: document.documentElement.getAttribute('data-switch') };
});
const toPause = async (p, id = 'pause') => { await jump(p, await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id)); await wait(p, 700); };

for (const v of ['m', 'g', 's']) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await page(ctx, `${base}/${v}/`, `${v}-1440`);
  ok(`${v}: a review page`, await p.evaluate(() => document.documentElement.hasAttribute('data-review')));
  ok(`${v}: hidden until Shift+V`, !(await state(p)).open);
  await p.keyboard.press('Shift+V'); await wait(p, 500);
  let s = await state(p);
  ok(`${v}: Shift+V shows the panel`, s.open, s.sec);
  await shot(p, `${v}-1440-hero-panel`);
  // the page's own options: the world switch next.js cycled
  await p.click('#opt-panel [data-v="a"]'); await wait(p, 400); s = await state(p);
  ok(`${v}: world switch to the pill`, s.sw === 'a' && /switch=a/.test(s.url), { sw: s.sw, url: s.url });
  await p.click('#opt-panel [data-v="b"]'); await wait(p, 400); s = await state(p);
  ok(`${v}: world switch back to its default, address clean`, s.sw === 'b' && !/switch=/.test(s.url), { sw: s.sw, url: s.url });
  if (!(await p.$('#pause[data-opt-key]'))) {
    await p.keyboard.press('Shift+V'); await wait(p, 500);
    ok(`${v}: Shift+V again hides it`, !(await state(p)).open); await ctx.close(); continue;
  }
  // from the hero, the panel offers to go to the sections that have options
  await p.click('#opt-panel [data-go="pause"]'); await wait(p, 2200); s = await state(p);
  // as many rows as the section declares options (task a78e6208: the pause's list grew from 5 to 7; a fixed count went red)
  const nOpts = (id) => p.evaluate((id) => JSON.parse(document.getElementById(id).dataset.opts).length, id);
  ok(`${v}: it follows the section on screen`, s.sec === 'The pause' && s.rows.length === await nOpts('pause'), { sec: s.sec, rows: s.rows });
  await shot(p, `${v}-1440-pause-live`);
  // B · The breath is the default since f1857cd (task 95ac520e): choosing it is choosing today's version, the address and memory clean
  for (const k of ['door', 'room', 'live', 'cinema']) {
    await toPause(p);
    await p.click(`#opt-panel [data-k="${k}"]:not([data-pic])`); await wait(p, 4200); s = await state(p);
    const kept = k === 'live' ? !s.url.includes('opt-pause') && !s.ls.some((x) => x.includes('opt-pause')) : s.url.includes(`opt-pause=${k}`) && s.ls.some((x) => x.endsWith('opt-pause=' + k));
    ok(`${v}: pause -> ${k}, both worlds, in the address and this browser`, s.pause === k && s.cpause === k && kept && s.letters > 0,
      { pause: s.pause, cpause: s.cpause, url: s.url, letters: s.letters, on: s.on });
    if (k === 'live') {
      // with the page's snap on, the wheel moves through it (it must not jump past it)
      const top = await p.evaluate(() => document.getElementById('pause').getBoundingClientRect().top + scrollY);
      const h = await p.evaluate(() => document.getElementById('pause').offsetHeight);
      await jump(p, top); await wait(p, 900); await p.mouse.move(720, 450);
      const ys = [];
      for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 260); await wait(p, 420); ys.push(Math.round(await p.evaluate(() => scrollY - document.getElementById('pause').offsetTop))); }
      ok(`${v}: B scrolls through with the snap on`, ys[ys.length - 1] > 0 && ys.some((y) => y > 0 && y < h - 900), { h, ys });
      for (const f of [0, .3, .62, .97]) { await jump(p, top + (h - 900) * f); await wait(p, 1300); await shot(p, `${v}-1440-pause-breath-${Math.round(f * 100)}`); }
      const cls = await p.evaluate(() => document.getElementById('pause').className); ok(`${v}: B rests at its end`, /is-rest/.test(cls), cls);
      await toPause(p);
    }
    await wait(p, 600); await shot(p, `${v}-1440-pause-${k}`);
  }
  // Why Aveda under the lenticular sheet: every preset draws (sheet.js), the words on the frost
  await toPause(p, 'aveda'); s = await state(p);
  const av = await p.evaluate(() => JSON.parse(document.getElementById('aveda').getAttribute('data-opts')).map((o) => o.k));
  ok(`${v}: the panel follows to Why Aveda`, /Why Aveda|What is in your color|Beauty/.test(s.sec || '') && s.rows.length === av.length, { sec: s.sec, rows: s.rows.length });
  for (const k of av.filter((k) => k !== 'live')) {
    await toPause(p, 'aveda'); await p.click(`#opt-panel [data-k="${k}"]`); await wait(p, 3200);
    const here = await p.evaluate(() => { const el = document.querySelector('#aveda [data-sheet]'); return el && el._sheet ? { id: el._sheet.id, ready: !!el._sheet.ready, frames: el._sheet.frames, err: el.getAttribute('data-sheet-error') } : null; });
    const twin = (await p.evaluate(() => document.getElementById('c-aveda').getAttribute('data-opt'))) === k;
    // a sheet option draws its sheet; the label option (task a749167b) has none
    ok(`${v}: Why Aveda -> ${k} draws`, k.startsWith('sheet-') ? here && here.ready && here.frames > 10 && !here.err && twin : twin, here);
    await shot(p, `${v}-1440-aveda-${k}`);
  }
  await p.click('#opt-panel [data-k="live"]'); await wait(p, 1500); await shot(p, `${v}-1440-aveda-live`);
  // a link opens on the option; this browser remembers it without the link
  const p2 = await page(ctx, `${base}/${v}/?opt-pause=cinema`, `${v}-link`); s = await state(p2);
  ok(`${v}: a link opens on its option`, s.pause === 'cinema' && s.cpause === 'cinema' && s.letters > 0, { pause: s.pause, letters: s.letters });
  await p2.close();
  const p3 = await page(ctx, `${base}/${v}/`, `${v}-memory`); s = await state(p3);
  ok(`${v}: this browser remembers it`, s.pause === 'cinema', { pause: s.pause, ls: s.ls });
  await p3.evaluate(() => window.OMOptions.choose('pause', 'live', false)); await wait(p3, 300); s = await state(p3);
  ok(`${v}: today's version again, address and memory clean`, s.pause === 'live' && !s.url.includes('opt-pause') && !s.ls.some((x) => x.includes('opt-pause')), s);
  await p3.close();
  // the pause's picture (task 279db527): today's, A and B under the section's options, each with its thumbnail
  await toPause(p); await p.click('#opt-panel [data-k="live"]:not([data-pic])'); await wait(p, 3600); s = await state(p);
  ok(`${v}: the pause lists its picture's options, thumbnails drawn`, s.pics.join() === 'live*,rest,exhale,window,lounge' && s.thumbs.length === 5 && s.thumbs.every(Boolean), { pics: s.pics, thumbs: s.thumbs });
  await p.click('#opt-panel [data-pic][data-k="rest"]'); await wait(p, 1600); s = await state(p);
  ok(`${v}: A swaps the picture in place, labelled, kept in the address and this browser`,
    s.picImgs.length && s.picImgs.every((x) => x.endsWith('om-pause-rest.webp')) && s.picMark === 'Guest made with AI' && /pic-real-chair-window=rest/.test(s.url) && s.ls.some((x) => x.includes('pic-real-chair-window=rest')) && s.pics.includes('rest*'),
    { imgs: s.picImgs, mark: s.picMark, url: s.url, pics: s.pics });
  { const top = await p.evaluate(() => document.getElementById('pause').offsetTop), h = await p.evaluate(() => document.getElementById('pause').offsetHeight);
    await jump(p, top + (h - 900) * .97); await wait(p, 1500); await shot(p, `${v}-1440-pause-picture-rest`); await toPause(p); }
  await p.click('#opt-panel [data-k="room"]'); await wait(p, 3600); s = await state(p);
  ok(`${v}: A stays through a section option (room)`, s.pause === 'room' && s.picImgs.every((x) => x.endsWith('om-pause-rest.webp')) && s.picMark === 'Guest made with AI', { pause: s.pause, imgs: s.picImgs, mark: s.picMark });
  await shot(p, `${v}-1440-pause-room-picture-rest`);
  await p.click('#opt-panel [data-k="live"]:not([data-pic])'); await wait(p, 3600);
  // the pause's other candidates (task e1a1e009): each swaps in labelled, drawn on its own focus
  for (const [k, f, pos] of [['exhale', 'om-pause-exhale.webp', '46.2% 49.9%'], ['window', 'om-pause-window.webp', '61.1% 23.9%']]) {
    await toPause(p); await p.click(`#opt-panel [data-pic][data-k="${k}"]`); await wait(p, 1600); s = await state(p);
    ok(`${v}: ${k} swaps the picture in place, labelled, on its focus`, s.picImgs.every((x) => x.endsWith(f)) && s.picMark === 'Guest made with AI' && s.pos.includes(pos) && new RegExp('pic-real-chair-window=' + k).test(s.url), { imgs: s.picImgs, mark: s.picMark, pos: s.pos, url: s.url });
    const top = await p.evaluate(() => document.getElementById('pause').offsetTop), h = await p.evaluate(() => document.getElementById('pause').offsetHeight);
    await jump(p, top + (h - 900) * .97); await wait(p, 1500); await shot(p, `${v}-1440-pause-picture-${k}`); await toPause(p);
  }
  await p.click('#opt-panel [data-pic][data-k="lounge"]'); await wait(p, 1600); s = await state(p);
  ok(`${v}: B, a real photo, carries no AI label`, s.pause === 'live' && s.picImgs.every((x) => x.endsWith('real-lounge.webp')) && s.picMark === null && /pic-real-chair-window=lounge/.test(s.url), { imgs: s.picImgs, mark: s.picMark, url: s.url });
  { const top = await p.evaluate(() => document.getElementById('pause').offsetTop), h = await p.evaluate(() => document.getElementById('pause').offsetHeight);
    await jump(p, top + (h - 900) * .97); await wait(p, 1500); await shot(p, `${v}-1440-pause-picture-lounge`); await toPause(p); }
  { const q = await page(ctx, `${base}/${v}/?pic-real-chair-window=rest`, `${v}-piclink`), t = await state(q);
    ok(`${v}: a link opens on the picture's option`, t.picImgs.every((x) => x.endsWith('om-pause-rest.webp')), t.picImgs); await q.close(); }
  { const q = await page(ctx, `${base}/${v}/`, `${v}-picmemory`), t = await state(q);
    ok(`${v}: this browser remembers the picture's option`, t.picImgs.every((x) => x.endsWith('real-lounge.webp')), t.picImgs); await q.close(); }
  await p.click('#opt-panel [data-pic][data-k="live"]'); await wait(p, 1600); s = await state(p);
  ok(`${v}: today's picture again, address clean`, s.picImgs.every((x) => x.endsWith('real-chair-window.webp')) && s.picMark === null && !/pic-/.test(s.url), { imgs: s.picImgs, url: s.url });
  // Inner Work: the same options in its own words
  await toWorld(p, 'coaching'); await toPause(p, 'c-pause'); s = await state(p);
  ok(`${v}: Inner Work's pause lists the same options`, s.open && s.rows.length === await nOpts('c-pause') && s.rows.length === await nOpts('pause'), { sec: s.sec, rows: s.rows.length });
  ok(`${v}: Inner Work's pause lists its own picture's options, thumbnails drawn`, s.pics.join() === 'live*,fire-tea,coach-fire,shelves' && s.thumbs.length === 4 && s.thumbs.every(Boolean), { pics: s.pics, thumbs: s.thumbs });
  for (const [k, f, ai, pos] of [['fire-tea', 'iw-pause-fire-tea.webp', 'Guest made with AI', '38.4% 19%'], ['coach-fire', 'iw-pause-coach-fire.webp', null, '47% 28%'], ['shelves', 'iw-pause-shelves.webp', 'Guest made with AI', '18.5% 22.6%']]) {
    await toPause(p, 'c-pause'); await p.click(`#opt-panel [data-pic][data-k="${k}"]`); await wait(p, 1600); s = await state(p);
    ok(`${v}: Inner Work ${k} swaps its picture in place, ${ai ? 'labelled' : 'no AI label (her own photo)'}, on its focus, the salon's untouched`,
      s.iwImgs.length && s.iwImgs.every((x) => x.endsWith(f)) && s.iwMark === ai && s.pos.includes(pos) && s.picImgs.every((x) => x.endsWith('real-chair-window.webp')) && new RegExp('pic-real-maggie-lounge-seated=' + k).test(s.url), { imgs: s.iwImgs, mark: s.iwMark, pos: s.pos, url: s.url });
    const top = await p.evaluate(() => document.getElementById('c-pause').offsetTop), h = await p.evaluate(() => document.getElementById('c-pause').offsetHeight);
    await jump(p, top + (h - 900) * .97); await wait(p, 1500); await shot(p, `${v}-1440-iw-pause-picture-${k}`);
  }
  { const q = await page(ctx, `${base}/${v}/?pic-real-maggie-lounge-seated=coach-fire`, `${v}-iwpiclink`); await toWorld(q, 'coaching'); const t = await state(q);
    ok(`${v}: a link opens on Inner Work's picture option`, t.iwImgs.every((x) => x.endsWith('iw-pause-coach-fire.webp')), t.iwImgs); await q.close(); }
  await toPause(p, 'c-pause'); await p.click('#opt-panel [data-pic][data-k="live"]'); await wait(p, 1600); s = await state(p);
  ok(`${v}: Inner Work's picture today's again, address clean`, s.iwImgs.every((x) => x.endsWith('real-maggie-lounge-seated.webp')) && s.iwMark === null && !/pic-/.test(s.url), { imgs: s.iwImgs, url: s.url });
  await p.click('#opt-panel [data-k="door"]'); await wait(p, 4200); await shot(p, `${v}-1440-iw-pause-door`);
  await p.click('#opt-panel [data-k="room"]'); await wait(p, 4200); await shot(p, `${v}-1440-iw-pause-room`);
  await p.click('#opt-panel [data-k="live"]'); await wait(p, 1200);
  await p.keyboard.press('Shift+V'); await wait(p, 500);
  ok(`${v}: Shift+V again hides it`, !(await state(p)).open);
  await ctx.close();
}

// the menu's path (task 279db527): a picture opened by its row, in the desktop panel shared by six and in its own row on a phone
const menu = (p) => p.evaluate(() => {
  const s = document.getElementById('services'), b = [...s.querySelectorAll('img[data-pic="om-menu-blonding.webp"]')];
  const panel = b.find((i) => i.closest('.mn__ph')), row = b.find((i) => i.closest('.mn__rph')), pm = s.querySelector('.mn__ph > .ai-mark'), rm = row && row.parentElement.querySelector('.ai-mark');
  return { srcs: b.map((i) => (i.getAttribute('src') || '').split('?')[0].replace('img/', '')), panelOn: panel && panel.classList.contains('is-on'), panelAi: panel && panel.classList.contains('is-ai'),
    panelMark: pm ? +getComputedStyle(pm).opacity : null, rowMark: rm ? (rm.hidden ? 'hidden' : rm.textContent) : null, pos: panel && panel.style.getPropertyValue('--pos'), url: location.search };
});
{
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await page(ctx, `${base}/x/`, 'fixture-1440');
  await toPause(p, 'services'); await wait(p, 2500); await p.click('#services .mn__row[data-i="0"]'); await wait(p, 900);
  await p.keyboard.press('Shift+V'); await wait(p, 600); let s = await state(p);
  ok('menu 1440: the section lists Blonding\'s picture options', s.pics.join() === 'live*,gen,real', s.pics);
  await p.click('#opt-panel [data-pic][data-k="gen"]'); await wait(p, 2200); let m = await menu(p);
  ok('menu 1440: a candidate opens its row and swaps both copies, labelled', m.panelOn && m.srcs.every((x) => x === 'om-pause-rest.webp') && m.panelAi && m.panelMark > .9 && m.rowMark === 'Guest made with AI' && m.pos === '60% 40%' && /pic-om-menu-blonding=gen/.test(m.url), m);
  await shot(p, 'menu-1440-blonding-gen');
  await p.click('#opt-panel [data-pic][data-k="real"]'); await wait(p, 2200); m = await menu(p);
  ok('menu 1440: a real candidate drops the AI label', m.srcs.every((x) => x === 'real-lounge.webp') && !m.panelAi && m.panelMark < .1 && m.rowMark === 'hidden', m);
  await shot(p, 'menu-1440-blonding-real');
  await p.click('#opt-panel [data-pic][data-k="live"]'); await wait(p, 2200); m = await menu(p);
  ok('menu 1440: today\'s picture back, labelled as before', m.srcs.every((x) => x === 'om-menu-blonding.webp') && m.panelAi && m.panelMark > .9 && m.rowMark === 'Guest made with AI' && !/pic-/.test(m.url), m);
  await ctx.close();
}
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await page(ctx, `${base}/x/`, 'fixture-390');
  await toPause(p, 'services'); await wait(p, 2000);
  await p.tap('.opt-handle'); await wait(p, 600);
  await p.tap('#opt-panel [data-pic][data-k="gen"]'); await wait(p, 2200); let m = await menu(p);
  const seenRow = await p.evaluate(() => { const i = document.querySelector('#services .mn__rph img[data-pic]'), r = i.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
  ok('menu 390: the row\'s own picture swaps, labelled, and comes into view', m.srcs.every((x) => x === 'om-pause-rest.webp') && m.rowMark === 'Guest made with AI' && seenRow, { m, seenRow });
  await p.tap('.opt-handle'); await wait(p, 900); await shot(p, 'menu-390-blonding-gen'); await p.tap('.opt-handle'); await wait(p, 600);
  await p.tap('#opt-panel [data-pic][data-k="live"]'); await wait(p, 1200);
  await shot(p, 'menu-390-panel');
  await ctx.close();
}

// the phone: a handle opens it; each option drawn at 390
{
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await page(ctx, `${base}/m/`, 'm-390');
  const hv = await p.evaluate(() => { const h = document.querySelector('.opt-handle'); return h ? getComputedStyle(h).display : 'none'; });
  ok('m 390: the handle shows on a phone', hv !== 'none', hv);
  await p.tap('.opt-handle'); await wait(p, 500); let s = await state(p);
  ok('m 390: the handle opens the panel', s.open, s.sec);
  await toPause(p); s = await state(p); ok('m 390: the panel follows to the pause', s.sec === 'The pause', s.sec);
  await shot(p, 'm-390-pause-live-panel');
  await p.tap('#opt-panel [data-pic][data-k="rest"]'); await wait(p, 1600); s = await state(p);
  ok('m 390: the pause\'s picture A from the handle', s.picImgs.every((x) => x.endsWith('om-pause-rest.webp')) && s.picMark === 'Guest made with AI', { imgs: s.picImgs, mark: s.picMark });
  await p.tap('.opt-handle'); await wait(p, 400);
  { const h = await p.evaluate(() => document.getElementById('pause').offsetHeight), top = await p.evaluate(() => document.getElementById('pause').offsetTop); await jump(p, top + (h - 844) * .97); await wait(p, 1400); }
  await shot(p, 'm-390-pause-picture-rest'); await toPause(p); await p.tap('.opt-handle'); await wait(p, 500);
  await p.tap('#opt-panel [data-pic][data-k="live"]'); await wait(p, 1200);
  await p.tap('.opt-handle'); await wait(p, 400);      // the panel closed: each step below opens it on its section
  // on a phone only a narrow column of the picture shows: each candidate's face (its focus) lands inside it (task e1a1e009)
  const focusIn = (id, fx, fy) => p.evaluate(([id, fx, fy]) => { const i = [...document.querySelectorAll(`#${id} img[data-pic]`)].filter((x) => x.getClientRects().length)[0]; if (!i || !i.naturalWidth) return null;
    const r = i.getBoundingClientRect(), k = Math.max(r.width / i.naturalWidth, r.height / i.naturalHeight), dw = i.naturalWidth * k, dh = i.naturalHeight * k, [ox, oy] = getComputedStyle(i).objectPosition.split(' ').map((x) => parseFloat(x) / 100);
    const x = (r.width - dw) * ox + fx * dw, y = (r.height - dh) * oy + fy * dh; return { x: Math.round(x), y: Math.round(y), w: Math.round(r.width), h: Math.round(r.height), inside: x > 24 && x < r.width - 24 && y > 24 && y < r.height - 24 }; }, [id, fx, fy]);
  const open = async (id) => { const h = await p.evaluate((id) => document.getElementById(id).offsetHeight, id), top = await p.evaluate((id) => document.getElementById(id).offsetTop, id); await jump(p, top + (h - 844) * .97); await wait(p, 1400); };
  for (const [id, k, fx, fy] of [['pause', 'rest', .54, .55], ['pause', 'exhale', .462, .499], ['pause', 'window', .611, .239], ['c-pause', 'fire-tea', .384, .19], ['c-pause', 'coach-fire', .47, .28], ['c-pause', 'shelves', .185, .226]]) {
    if (id === 'c-pause') await toWorld(p, 'coaching'); else await toWorld(p, 'salon');
    await toPause(p, id); await p.tap('.opt-handle'); await wait(p, 500); await p.tap(`#opt-panel [data-pic][data-k="${k}"]`); await wait(p, 1600); await p.tap('.opt-handle'); await wait(p, 400);
    await open(id); const f = await focusIn(id, fx, fy);
    ok(`m 390: ${k}'s face is in view on a phone`, f && f.inside, f); await shot(p, `m-390-${id}-picture-${k}`);
    await toPause(p, id); await p.tap('.opt-handle'); await wait(p, 500); await p.tap('#opt-panel [data-pic][data-k="live"]'); await wait(p, 1200); await p.tap('.opt-handle'); await wait(p, 400);
  }
  await toWorld(p, 'salon'); await toPause(p); await p.tap('.opt-handle'); await wait(p, 500);
  for (const k of ['door', 'room', 'live', 'cinema']) {
    await toPause(p); await p.tap(`#opt-panel [data-k="${k}"]:not([data-pic])`); await wait(p, 600);
    await p.tap('.opt-handle'); await wait(p, 4000);
    if (k === 'live') { const h = await p.evaluate(() => document.getElementById('pause').offsetHeight); const top = await p.evaluate(() => document.getElementById('pause').offsetTop); await jump(p, top + (h - 844) * .97); await wait(p, 1400); }
    const wide = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(`m 390: ${k} fits the phone`, wide <= 390, wide);
    await shot(p, `m-390-pause-${k}`);
    await p.tap('.opt-handle'); await wait(p, 500);
  }
  const avk = await p.evaluate(() => JSON.parse(document.getElementById('aveda').dataset.opts).map((o) => o.k));
  for (const k of avk.slice(0, 2)) {      // its default and its first option, whatever Why Aveda's list holds (task 4739f125 trims it)
    await toPause(p, 'aveda'); await p.tap(`#opt-panel [data-k="${k}"]`); await wait(p, 600); await p.tap('.opt-handle'); await wait(p, 3400);
    const wide = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(`m 390: Why Aveda ${k} fits the phone`, wide <= 390, wide);
    await shot(p, `m-390-aveda-${k}`); await p.tap('.opt-handle'); await wait(p, 500);
  }
  await ctx.close();
}
ok('no script errors', res.errors.length === 0, res.errors.slice(0, 8));
res.pass = res.checks.every((c) => c.pass);
fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 2));
console.log(res.pass ? 'ALL PASS' : 'SOME FAIL', res.checks.filter((c) => !c.pass).length, 'failed of', res.checks.length);
await b.close(); srv.close();
