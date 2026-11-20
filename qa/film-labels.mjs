// Every film on M, G and S says "Made with AI" on it (AI Act Art 50; task 2a3f89d3; StoryLegal, 18 Nov, "Made with AI labels on
// a client's website": on the film itself, as text on the page, visible with no hover or tap the whole time it plays), and
// only where its film shows: never on a step's real photo (the CEO MA's go, 20 Nov). Read in WebKit at 1440 and a phone, in
// both worlds: a film with no photo (the hero, Inner Work's hero) at rest; a step on its photo (the label away), half way
// (a shot for the eye), on its film (the label whole on screen, its words exact, at full opacity, under no shade, and nothing
// drawn over it: painted one flat colour for a moment, its middle shows only that colour). The steps' other ways (the 6th
// argument, on M's salon steps) and reduced motion (the photo stays, so the label stays away) the same. The control: the same
// run on another checkout (the live commit) fails every label.
//   node qa/film-labels.mjs [out] [m,g,s] [1440,390] [repo] [live,breath,sheet]
import * as pw from 'playwright'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { serve, open, wait, jump, toWorld, phone } from './lib.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url)), REPO = path.resolve(process.argv[5] || path.resolve(HERE, '..'));
const OUT = path.resolve(process.argv[2] || path.join(HERE, 'out-film-labels')); fs.mkdirSync(OUT, { recursive: true });
const VERS = (process.argv[3] || 'm,g,s').split(','), WIDTHS = (process.argv[4] || '1440,390').split(',');
const WAYS = (process.argv[6] || '').split(',').filter(Boolean);
const CTX = { 1440: { viewport: { width: 1440, height: 900 } }, 390: phone('webkit') };
const srv = await serve(REPO), base = 'http://127.0.0.1:' + srv.address().port;
const b = await pw.webkit.launch(process.env.WEBKIT ? { executablePath: process.env.WEBKIT } : {});
const res = { browser: 'webkit ' + b.version(), repo: REPO, started: new Date().toISOString(), checks: [], errors: [] };
const ok = (name, pass, info) => { res.checks.push({ name, pass: !!pass, info }); console.log(pass ? 'PASS' : 'FAIL', name, info === undefined ? '' : JSON.stringify(info)); };

// the label, its film and what shows of the step's photo at the label's own spot (the photo, or the sheet's last rib)
const look = (p, id) => p.evaluate(async (id) => {
  const s = document.getElementById(id), m = s.querySelector('.ai-mark--film'), v = s.querySelector('video[data-src]');
  const opOf = (el) => { let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) o *= +getComputedStyle(e).opacity; return +o.toFixed(2); };
  const img = s.querySelector('.ch__top > img'), ribs = s.querySelectorAll('.ch__ribs i');
  const t0 = v.currentTime; await new Promise((d) => setTimeout(d, 700));
  const out = { y: Math.round(s.getBoundingClientRect().top), e: getComputedStyle(s).getPropertyValue('--e').trim() || null,
    playing: v.currentTime > t0 || !!s.querySelector('.film-img.is-on'), film: (v.currentSrc || '').split('/').pop().split('?')[0],
    photo: img ? Math.max(opOf(img), ribs.length ? opOf(ribs[ribs.length - 1]) : 0) : null, text: m ? m.textContent : null };
  if (!m) return out;
  const bx = m.getBoundingClientRect();
  out.box = [bx.left, bx.top, bx.right, bx.bottom].map(Math.round);
  out.whole = bx.left >= 0 && bx.top >= 0 && bx.right <= innerWidth && bx.bottom <= innerHeight && bx.width > 20 && bx.height < 40;
  out.op = opOf(m); out.vis = getComputedStyle(m).visibility;
  const sh = s.querySelector('.s__shade'); out.shade = sh ? +(+getComputedStyle(sh).opacity).toFixed(2) : 0;
  return out;
}, id);
// nothing drawn over it: the label painted one flat green for a moment; the share of its middle that is not that green
async function cover(p, id, box) {
  const set = (on) => p.evaluate(([id, on]) => { const m = document.getElementById(id).querySelector('.ai-mark--film');
    for (const k of ['background', 'color', 'transition', 'box-shadow']) on ? m.style.setProperty(k, { background: '#00ff00', color: '#00ff00', transition: 'none', 'box-shadow': 'none' }[k], 'important') : m.style.removeProperty(k); }, [id, on]);
  await set(true); await wait(p, 120);
  const [l, t, r, bt] = box, h = bt - t;
  const png = await p.screenshot({ clip: { x: l + h / 2, y: t + 3, width: Math.max(4, r - l - h), height: Math.max(4, h - 6) } });
  await set(false);
  return p.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const g = c.getContext('2d'); g.drawImage(im, 0, 0);
    const d = g.getImageData(0, 0, im.width, im.height).data; let bad = 0;
    for (let i = 0; i < d.length; i += 4) if (!(d[i + 1] > 200 && d[i] < 70 && d[i + 2] < 70)) bad++;
    return +(bad / (d.length / 4)).toFixed(3); }, png.toString('base64'));
}
const shot = (p, n) => p.screenshot({ path: path.join(OUT, n + '.png') });
const onFilm = async (p, tag, id, name) => {
  const r = await look(p, id);
  if (r.box && r.op > .95) r.cover = await cover(p, id, r.box);
  ok(tag + ' "' + id + '": "Made with AI" on its film, whole on screen, full opacity, no shade, nothing drawn over it',
    r.text === 'Made with AI' && r.whole && r.op > .95 && r.vis === 'visible' && r.shade < .05 && r.cover !== undefined && r.cover < .03, r);
  ok(tag + ' "' + id + '": its film plays', r.playing, { film: r.film });
  await shot(p, name);
};
const onPhoto = async (p, tag, id, name, when) => {
  const r = await look(p, id);
  ok(tag + ' "' + id + '": ' + when + ', on its real photo, no "Made with AI" on it', r.photo > .95 && (r.text === null || r.op < .05), r);
  await shot(p, name);
};
// one section the way a visitor meets it: today's step by time, a scroll way through its scroll, a film with no photo at rest
async function section(p, tag, id, name, rm) {
  const g = await p.evaluate((id) => { const s = document.getElementById(id); return { top: Math.round(s.getBoundingClientRect().top + scrollY),
    span: s.offsetHeight - innerHeight, stack: s.classList.contains('ch--stack'), scroll: s.classList.contains('ch--scroll') }; }, id);
  await jump(p, g.top);
  if (rm) { await wait(p, 5200); return g.stack ? onPhoto(p, tag, id, name + '-rest', 'reduced motion, at rest') : onFilm(p, tag, id, name); }
  if (!g.stack) { await wait(p, 3000); return onFilm(p, tag, id, name); }
  if (!g.scroll) { await wait(p, 900); await onPhoto(p, tag, id, name + '-photo', 'as it arrives'); await wait(p, 4300); return onFilm(p, tag, id, name + '-film'); }
  await wait(p, 900); await onPhoto(p, tag, id, name + '-photo', 'at its start');
  await jump(p, g.top + Math.round(g.span * .5)); await wait(p, 1300);
  const mid = await look(p, id); res.checks.push({ name: tag + ' "' + id + '": half way (for the eye)', pass: true, info: mid }); await shot(p, name + '-mid');
  await jump(p, g.top + g.span); await wait(p, 1300); return onFilm(p, tag, id, name + '-film');
}
async function pageRun(v, w, url, worlds, way, ctxOpts, rm) {
  const ctx = await b.newContext(ctxOpts), p = await open(ctx, url);
  p.on('pageerror', (e) => res.errors.push(v + ' ' + w + ' ' + (way || '') + ': ' + e.message));
  for (const world of worlds) {
    if (world === 'coaching') await toWorld(p, 'coaching');
    const ids = await p.evaluate((world) => [...document.querySelectorAll('main[data-world="' + world + '"] > section.s')]
      .filter((s) => s.querySelector('video[data-src]')).map((s) => s.id), world);
    for (const id of ids) {
      if (way && !/^(arrive|unwind|renew|unhurried|home)$/.test(id)) continue;
      await section(p, v + ' ' + w + ' ' + world + (way ? ' ' + way : '') + (rm ? ' reduced-motion' : ''), id, [v, w, (way || 'default') + (rm ? '-rm' : ''), id].join('-'), rm);
    }
  }
  await ctx.close();
}
for (const v of VERS) for (const w of WIDTHS) await pageRun(v, w, base + '/' + v + '/', ['salon', 'coaching'], '', CTX[w], false);
if (WAYS.length) {
  for (const k of WAYS) for (const w of WIDTHS) await pageRun('m', w, base + '/m/?opt-steps=' + k, ['salon'], k, CTX[w], false);
  for (const k of ['', 'live']) await pageRun('m', 1440, base + '/m/' + (k ? '?opt-steps=' + k : ''), ['salon'], k, { ...CTX[1440], reducedMotion: 'reduce' }, true);
}
res.pass = res.checks.length > 0 && res.checks.every((c) => c.pass) && !res.errors.length;
fs.writeFileSync(path.join(OUT, 'film-labels.json'), JSON.stringify(res, null, 1));
console.log(res.checks.filter((c) => c.pass).length + '/' + res.checks.length + ' pass', res.errors.length ? 'errors: ' + res.errors.join(' | ') : '');
await b.close(); srv.close(); process.exit(res.pass ? 0 : 1);
