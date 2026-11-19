// Real Safari through safaridriver (task 2846db82, CEO MA 16 Nov): what Playwright's WebKit cannot show, on the live pages.
//   node run.mjs safari <mac|sim> [m,g] [films,sound,snap,visit,entry,glass]   (visit: a person's walk, VISIT_DWELL=2300,6000 ms; glass: the header's glass)
//   mac: Safari on macOS, its window at 1440 x 900 on the job's own screen (sDelegate --needs macos,own-screen gives
//        SDELEGATE_SCREEN_FRAME; without one this refuses to open a window). sim: iOS Simulator Safari at iPhone size.
// No packages: WebDriver over HTTP with Node's own fetch. Reuses r4.mjs's step ids, film timing (photo on at 1.5 s, the film
// moving by 6 s) and its six snap steps and expectations.
//   films: per step, the element film's clock advances, it is not paused, no error, the photo has dissolved.
//   sound: read-only wrappers on the page's Web Audio, installed after load (no page code changed), then ONE click on the
//          page, the visitor's first gesture; per step: the context running and its clock advancing, the step's own track
//          (sound/<element>.mp3, the section's data-sound) glided up to full and its source started.
//   snap: r4.mjs snap()'s six steps through WebDriver wheel actions (reported as such if Safari has no wheel input).
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import http from 'node:http';
import { tall, pullWalk } from './lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [, WHERE = 'mac', VERS_ARG = 'm,g', WHAT = 'films,sound,snap'] = process.argv.slice(2);
const VERS = VERS_ARG.split(',');
const OUT = path.join(HERE, `out-safari-${WHERE}${process.env.SITE === 'local' ? '-local' : ''}`);
fs.mkdirSync(OUT, { recursive: true });
const PORT = 4444 + Math.floor(Math.random() * 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const res = { where: WHERE, started: new Date().toISOString(), versions: {}, notes: [] };
const save = () => fs.writeFileSync(path.join(OUT, 'safari.json'), JSON.stringify(res, null, 1));
let sid = null, drv = null, sim = null;
// sim: an iPhone simulator booted headless with simctl (no Simulator window), shut down at the end if this run booted it
function bootSim() {
  const all = JSON.parse(execFileSync('xcrun', ['simctl', 'list', 'devices', 'available', '-j']).toString()).devices;
  const phones = Object.entries(all).filter(([rt]) => /iOS/.test(rt)).flatMap(([, d]) => d).filter((d) => /^iPhone/.test(d.name));
  const dev = phones.find((d) => d.name === 'iPhone 17') || phones[0];
  if (!dev) throw new Error('no iPhone simulator available');
  const mine = dev.state !== 'Booted';
  if (mine) execFileSync('xcrun', ['simctl', 'boot', dev.udid]);
  execFileSync('xcrun', ['simctl', 'bootstatus', dev.udid, '-b']);
  // a headless boot starts no Safari, and safaridriver then finds no session host (17 Nov: "Could not find any session
  // hosts"); Safari is opened inside the simulator first (simulators allow remote automation since iOS 14)
  execFileSync('xcrun', ['simctl', 'launch', dev.udid, 'com.apple.mobilesafari']);
  return { name: dev.name, udid: dev.udid, mine };
}

async function wd(method, p, body) {
  const r = await fetch(`http://127.0.0.1:${PORT}${p}`, { method, headers: { 'content-type': 'application/json; charset=utf-8' },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${p}: ${j.value && j.value.error}: ${j.value && j.value.message}`.slice(0, 500));
  return j.value;
}
const S = (p) => `/session/${sid}${p}`;
const exec = (fn, ...args) => wd('POST', S('/execute/sync'), { script: `return (${fn}).apply(null, arguments);`, args });
async function shot(name) {
  try { fs.writeFileSync(path.join(OUT, name), Buffer.from(await wd('GET', S('/screenshot')), 'base64')); } catch (e) { res.notes.push(`screenshot ${name}: ${e.message}`); }
}

async function start() {
  if (WHERE === 'mac' && !process.env.SDELEGATE_SCREEN_FRAME) throw new Error('no own screen (SDELEGATE_SCREEN_FRAME unset): run through sDelegate with --needs macos,own-screen');
  drv = spawn('/usr/bin/safaridriver', ['-p', String(PORT)], { stdio: ['ignore', 'inherit', 'inherit'] });
  let up = false, gone = null;
  drv.on('exit', (code, sig) => { gone = `safaridriver exited (code ${code}, signal ${sig})`; });
  for (let i = 0; i < 60 && !up && !gone; i++) { try { up = (await fetch(`http://127.0.0.1:${PORT}/status`)).ok; } catch (e) {} if (!up) await sleep(250); }
  if (!up) throw new Error(gone || 'safaridriver did not answer on its port in 15 s');
  if (WHERE === 'sim') { sim = bootSim(); res.device = { name: sim.name, udid: sim.udid, bootedHere: sim.mine }; console.log('simulator', JSON.stringify(res.device)); }
  const caps = WHERE === 'sim'
    ? { browserName: 'safari', platformName: 'iOS', 'safari:useSimulator': true, 'safari:deviceUDID': sim.udid }
    : { browserName: 'safari' };
  let v = null;
  for (let i = 0; !v; i++) {
    try { v = await wd('POST', '/session', { capabilities: { alwaysMatch: caps } }); }
    catch (e) { if (WHERE !== 'sim' || i >= 5 || !/session hosts/.test(e.message)) throw e; res.notes.push(`session try ${i + 1}: ${e.message}`); await sleep(3000); }
  }
  sid = v.sessionId;
  res.browser = { name: v.capabilities.browserName, version: v.capabilities.browserVersion, platform: v.capabilities.platformName,
    device: v.capabilities['safari:deviceName'] || null };
  console.log('session', JSON.stringify(res.browser));
  if (WHERE === 'mac') {
    const [fx, fy, fw, fh] = (process.env.SDELEGATE_SCREEN_FRAME.match(/-?\d+(\.\d+)?/g) || []).map(Number);
    res.screen = { name: process.env.SDELEGATE_SCREEN_NAME || null, frame: [fx, fy, fw, fh] };
    let h = 990;
    await wd('POST', S('/window/rect'), { x: fx + 10, y: fy + 4, width: 1440, height: h });
    const inner = await exec(() => [innerWidth, innerHeight]);
    h = Math.min(fh - 8, h + (900 - inner[1]));
    await wd('POST', S('/window/rect'), { x: fx + 10, y: fy + 4, width: 1440 + (1440 - inner[0]), height: h });
    res.viewport = await exec(() => [innerWidth, innerHeight]);
    res.window = await wd('GET', S('/window/rect'));
    console.log('window', JSON.stringify(res.window), 'viewport', res.viewport.join('x'));
  } else {
    res.viewport = await exec(() => [innerWidth, innerHeight, devicePixelRatio]);
  }
}

// the same scroll jump as r4.mjs (no smooth scroll, the page's snap paused for the jump and restored after)
const jump = (y) => exec((y) => {
  const r = document.documentElement, b = r.style.scrollBehavior, s = r.style.scrollSnapType;
  r.style.scrollBehavior = 'auto'; r.style.scrollSnapType = 'none'; scrollTo(0, y);
  requestAnimationFrame(() => { r.style.scrollSnapType = s; r.style.scrollBehavior = b; });
}, y);
const topOf = (id) => exec((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);

// read-only wrappers on the page's Web Audio: which sound file each track's gain carries, every gain glide, every source
// start, the context; nothing the page does is changed
function instrument() {
  if (window.__om) return 'already';
  const om = window.__om = { urls: new WeakMap(), buf: new WeakMap(), gain: new Map(), ctxs: [], glides: [], starts: [] };
  const addCtx = (c) => { if (c && om.ctxs.indexOf(c) < 0) om.ctxs.push(c); };
  const f0 = window.fetch;
  window.fetch = function (u) {
    const url = String((u && u.url) || u), p = f0.apply(this, arguments);
    if (!/sound\//.test(url)) return p;
    return p.then((r) => { const a0 = r.arrayBuffer.bind(r); r.arrayBuffer = () => a0().then((b) => { om.urls.set(b, url.split('/').pop()); return b; }); return r; });
  };
  const AC = window.AudioContext || window.webkitAudioContext;
  const BP = window.BaseAudioContext ? window.BaseAudioContext.prototype : AC.prototype;
  const d0 = BP.decodeAudioData;
  BP.decodeAudioData = function (buf, ok, bad) {
    addCtx(this); const name = om.urls.get(buf), tag = (b) => { if (name && b) om.buf.set(b, name); return b; };
    const p = d0.call(this, buf, ok ? (b) => ok(tag(b)) : undefined, bad);
    return p && p.then ? p.then(tag) : p;
  };
  const c0 = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (dest) {
    try { addCtx(this.context); if (this.buffer && dest && dest.gain && om.buf.get(this.buffer)) om.gain.set(dest.gain, om.buf.get(this.buffer)); } catch (e) {}
    return c0.apply(this, arguments);
  };
  const s0 = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function () { om.starts.push({ name: om.buf.get(this.buffer) || null, at: performance.now() }); return s0.apply(this, arguments); };
  for (const k of ['setValueCurveAtTime', 'linearRampToValueAtTime']) {
    const o = AudioParam.prototype[k];
    AudioParam.prototype[k] = function (v) {
      const to = k === 'setValueCurveAtTime' ? v[v.length - 1] : v;
      om.glides.push({ name: om.gain.get(this) || null, to: Math.round(to * 100) / 100, at: performance.now() });
      return o.apply(this, arguments);
    };
  }
  return 'ok';
}
const soundAt = (since) => exec((since) => {
  const om = window.__om; if (!om) return null; const c = om.ctxs[0];
  return { ctx: c ? { state: c.state, t: Math.round(c.currentTime * 100) / 100 } : null, n: om.ctxs.length,
    glides: om.glides.filter((g) => g.at >= since).map((g) => ({ name: g.name, to: g.to, ms: Math.round(g.at - since) })),
    starts: om.starts.filter((g) => g.at >= since).map((g) => ({ name: g.name, ms: Math.round(g.at - since) })), now: performance.now() };
}, since);

const filmAt = (id) => exec((id) => {
  const s = document.getElementById(id), v = s.querySelector('video'), top = s.querySelector('.ch__top');
  return { t: v ? Math.round(v.currentTime * 100) / 100 : null, paused: v ? v.paused : null, ready: v ? v.readyState : null,
    err: v && v.error ? v.error.code : null, src: v ? (v.currentSrc || '').split('/').pop() : null,
    blob: v ? /^blob:/.test(v.currentSrc || '') : null, on: v ? v.classList.contains('is-on') : null,
    photo: top ? Math.round(+getComputedStyle(top).opacity * 100) / 100 : null, sound: s.getAttribute('data-sound'), active: s.classList.contains('is-active') };
}, id);

async function version(v) {
  const r = res.versions[v] = {};
  await wd('POST', S('/url'), { url: siteOf(v) });
  await sleep(2500);
  r.build = await exec(() => ({ url: location.href, fixes7efa6f0: document.documentElement.outerHTML.indexOf('io2.observe') > 0, soundPref: localStorage.getItem('om-sound') }));
  const ids = await exec(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')].filter((s) => s.querySelector('.ch--stack, .ch__top') && s.querySelector('video')).map((s) => s.id));
  // the visit walks first, from fresh loads, before the jumps below have asked every film to play
  if (WHAT.includes('visit')) for (const d of DWELLS) { r['visit' + d] = await visit(v, d); save(); }
  if (WHAT.includes('entry')) { r.entry = await entry(v); save(); }
  if (WHAT.includes('glass')) { r.glass = await glass(v); save(); }
  r.steps = [];
  if (WHAT.includes('sound')) {
    r.instrument = await exec(instrument);
    const h = await wd('POST', S('/element'), { using: 'css selector', value: 'main[data-world="salon"] h1' });
    const el = h[Object.keys(h)[0]];
    await wd('POST', S(`/element/${el}/click`), {});
    await sleep(1500);
    r.afterClick = await soundAt(0);
    delete r.afterClick.glides; delete r.afterClick.starts;
  }
  for (const id of (WHAT.includes('films') ? ids : [])) {
    await jump(await topOf(id));
    const t0 = (await exec(() => performance.now()));
    await sleep(1500); const a = await filmAt(id);
    await sleep(4500); const z = await filmAt(id);
    const step = { id, a, z, filmMoving: z.t != null && a.t != null && z.t > a.t + 0.5 && !z.paused && z.err == null };
    if (WHAT.includes('sound')) {
      const s1 = await soundAt(t0); await sleep(1000); const s2 = await soundAt(t0);
      const own = `${z.sound}.mp3`, up = s2.glides.filter((g) => g.name === own && g.to >= 0.99);
      step.sound = { own, ctx1: s1.ctx, ctx2: s2.ctx, upMs: up.length ? up[0].ms : null, started: s2.starts.filter((g) => g.name === own).map((g) => g.ms),
        glides: s2.glides.slice(0, 8) };
      step.soundPlaying = !!(s2.ctx && s2.ctx.state === 'running' && s1.ctx && s2.ctx.t > s1.ctx.t + 0.5 && up.length);
    }
    await shot(`${v}-${id}-6s.png`);
    r.steps.push(step); save();
    console.log(v, id, 'film', step.filmMoving, `t ${a.t}->${z.t} paused ${z.paused} err ${z.err} photo ${z.photo}`, step.sound ? `| sound ${step.soundPlaying} ${step.sound.own} up ${step.sound.upMs} ms ctx ${JSON.stringify(step.sound.ctx2)}` : '');
  }
  if (WHAT.includes('snap') && WHERE === 'mac') r.snap = await snap(v);
  save();
}

// visit (task b36dde1f): a person's walk, not a jump. 'films' jumps straight to each step, so its film is attached and
// asked to play in the same frame; a person reaches a step seconds after its film was attached (two screens before).
// From a fresh load: every salon section in order, a pause of DWELL ms on each (VISIT_DWELL, a list: a quick scroller
// and a reader), each step film read 1.5 s and 6 s after arrival. A read-only wrapper on play() records each call and
// how its promise ended; currentSrc says whether the film was swapped to a whole download (blob:).
const DWELLS = (process.env.VISIT_DWELL || '2300,6000').split(',').map(Number);
const playLog = () => exec(() => {
  if (!window.__fv) {
    const fv = window.__fv = { plays: [] }, p0 = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const rec = { src: (this.currentSrc || this.src || '').split('/').pop().slice(0, 24), at: Math.round(performance.now()), out: 'pending' };
      fv.plays.push(rec); const pr = p0.apply(this, arguments);
      if (pr && pr.then) pr.then(() => { rec.out = 'ok'; }, (e) => { rec.out = (e && e.name) || 'rejected'; });
      return pr;
    };
  }
  return window.__fv.plays.length;
});
async function visit(v, dwell) {
  await wd('POST', S('/url'), { url: siteOf(v) });
  await sleep(2500); await playLog();
  const secs = await exec(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')]
    .map((s, i) => ({ i, id: s.id || null, step: !!(s.querySelector('.ch__top') && s.querySelector('video')) })));
  const steps = [];
  for (const s of secs) {
    await jump(await exec((i) => document.querySelectorAll('main[data-world="salon"] > section.s')[i].getBoundingClientRect().top + scrollY, s.i));
    if (!s.step) { await sleep(dwell); continue; }
    // two frames per step film, 1.5 s and 6 s after arriving: the evidence that it moves, beside the clock
    await sleep(1500); const a = await filmAt(s.id); await shot(`${v}-visit${dwell}-${s.id}-1.5s.png`);
    await sleep(4500); const z = await filmAt(s.id); await shot(`${v}-visit${dwell}-${s.id}-6s.png`);
    const moving = z.t != null && a.t != null && z.t > a.t + 0.5 && !z.paused && z.err == null;
    steps.push({ id: s.id, moving, a, z });
    console.log('visit', v, dwell, s.id, 'film', moving, `t ${a.t}->${z.t} paused ${z.paused} ready ${z.ready} blob ${a.blob}->${z.blob} on ${z.on} photo ${z.photo}`);
  }
  const plays = await exec(() => window.__fv.plays);
  return { dwell, steps, plays };
}

// entry (task b36dde1f, J 17 Nov: "When you go into that section and scroll, the video is static ... a few seconds later the
// video starts"; approved-features row 16): entry.mjs's check in real Safari. From a fresh load, each step is reached by a
// wheel swipe from just above it (Safari's own snap finishes it), and every 50 ms the page logs the step's visible height,
// the film's clock, paused, readiness, the frames Safari actually decoded (an interrupted film keeps paused false but decodes
// none), is-on, is-held and the photo's opacity. Pass: the clock and the decoded frames both advance within 1.5 s of the
// step's first visible pixel while the photo is still fully on screen. ENTRY_CSS=<css> adds a style first (to find a cause).
// glass (task 95ac520e; J 19 Nov 11:50 Z: the navigation bar glass, never a hard background): the header's own glass layer
// (.hdr-glass, mgs.js) over Why Aveda's sheet and the menu, in real Safari, since Playwright's WebKit draws no backdrop blur at all.
// At each place one shot with the glass, then the same with only the glass hidden: the control, where what lies behind the bar
// reads sharp; with the glass it must read frosted. Its computed backdrop filter, opacity and colour are kept with the shots.
async function glass(v) {
  const out = [];
  for (const [id, frac] of [['aveda', .5], ['services', .4]]) {
    const top = await exec((id) => { const e = document.getElementById(id); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : -1; }, id);
    if (top < 0) { out.push({ id, missing: true }); continue; }
    const [h, vh] = await exec((id) => [document.getElementById(id).getBoundingClientRect().height, innerHeight], id);
    await jump(top + Math.round(Math.max(0, h - vh) * frac)); await sleep(1800);
    const st = await exec(() => { const g = document.querySelector('.hdr-glass'); if (!g) return { glass: 'none on the page' }; const c = getComputedStyle(g);
      return { backdrop: c.webkitBackdropFilter || c.backdropFilter, opacity: c.opacity, bg: c.backgroundColor, h: Math.round(g.getBoundingClientRect().height), ground: document.documentElement.classList.contains('hdr-ground') }; });
    await shot(`${v}-glass-${id}.png`);
    await exec(() => { const g = document.querySelector('.hdr-glass'); if (g) g.style.visibility = 'hidden'; }); await sleep(500);
    await shot(`${v}-glass-${id}-off.png`);
    await exec(() => { const g = document.querySelector('.hdr-glass'); if (g) g.style.visibility = ''; });
    out.push({ id, frac, ...st });
  }
  return out;
}

async function entry(v) {
  await wd('POST', S('/url'), { url: siteOf(v) });
  await sleep(2500);
  if (process.env.ENTRY_CSS) await exec((c) => { const s = document.createElement('style'); s.textContent = c; document.head.appendChild(s); }, process.env.ENTRY_CSS);
  const ids = await exec(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')].filter((s) => s.querySelector('.ch__top') && s.querySelector('.s__zoom > video')).map((s) => s.id));
  const steps = [];
  for (const id of ids) {
    await jump(await topOf(id) - (await exec(() => innerHeight)) - 200); await sleep(1200);
    await exec((id) => { const s = document.getElementById(id), v = s.querySelector('.s__zoom > video'), top = s.querySelector('.ch__top'), z = s.querySelector('.s__zoom');
      const log = window.__entry = [], t0 = performance.now(); clearInterval(window.__entryTimer);
      window.__entryTimer = setInterval(() => { const r = s.getBoundingClientRect(), vh = innerHeight, q = v.getVideoPlaybackQuality && v.getVideoPlaybackQuality();
        log.push({ t: Math.round(performance.now() - t0), top: Math.round(r.top), vis: Math.max(0, Math.round(Math.min(r.bottom, vh) - Math.max(r.top, 0))),
          ct: Math.round(v.currentTime * 1000) / 1000, paused: v.paused, rs: v.readyState, fr: v.webkitDecodedFrameCount != null ? v.webkitDecodedFrameCount : q ? q.totalVideoFrames : null,
          on: v.classList.contains('is-on'), held: !!(z && z.classList.contains('is-held')), photo: top ? +getComputedStyle(top).opacity : null, active: s.classList.contains('is-active') }); }, 50); }, id);
    try { await wheel(Math.round((await exec(() => innerHeight)) / 3), 30); } catch (e) { res.notes.push('entry wheel: ' + e.message); await jump(await topOf(id)); }
    await sleep(4500);
    const log = await exec(() => { clearInterval(window.__entryTimer); return window.__entry; });
    const enter = log.find((s) => s.vis > 0), c0 = enter ? enter.ct : 0, f0 = enter ? enter.fr : 0;
    const move = enter && log.find((s) => s.t >= enter.t && s.ct - c0 >= 0.1 && !s.paused && (s.fr == null || s.fr - f0 >= 3));
    const delay = enter && move ? move.t - enter.t : null, ok = delay !== null && delay <= 1500 && (move.photo == null || move.photo >= 0.95);
    await shot(`${v}-entry-${id}.png`);
    steps.push({ id, ok, delay, enter, move, log });
    const last = log[log.length - 1] || {};
    console.log('entry', v, id, ok ? 'pass' : 'FAIL', `film moving ${delay === null ? 'never' : delay + ' ms'} after the step came on screen, photo ${move ? move.photo : '-'}; at the end t ${last.ct} frames ${last.fr} paused ${last.paused} rs ${last.rs} held ${last.held} top ${last.top}`);
  }
  return { css: process.env.ENTRY_CSS || null, steps };
}

// r4.mjs snap(): the same six moves (lib.mjs pullWalk) on every section of this version taller than the window, found by id in
// both worlds (lib.mjs tall(); 1440 x 900), through WebDriver wheel actions
async function wheel(dy, step = 60) {
  const n = Math.max(1, Math.round(Math.abs(dy) / step)), d = Math.round(Math.sign(dy) * Math.abs(dy) / n);
  const acts = [];
  for (let i = 0; i < n; i++) { acts.push({ type: 'scroll', x: 720, y: 450, deltaX: 0, deltaY: d, duration: 40, origin: 'viewport' }); acts.push({ type: 'pause', duration: 40 }); }
  await wd('POST', S('/actions'), { actions: [{ type: 'wheel', id: 'wheel', actions: acts }] });
}
async function snap(v) {
  const out = [], drive = { run: exec, jump, wheel: (dy) => wheel(dy), wait: sleep };
  for (const world of ['salon', 'coaching']) {
    if (world === 'coaching') { await exec(() => document.querySelector('.worlds [data-to-world="coaching"]').click()); await sleep(2800); }
    for (const t of await exec(tall)) {
      if (!t.next) { out.push({ world, id: t.id, note: 'the last section: nothing to pull into' }); continue; }
      try {
        await pullWalk(drive, t.id, (r) => { out.push({ world, id: t.id, ...r }); console.log('snap', v, world, t.id, r.step, r.pass ? 'pass' : 'FAIL', `top ${r.top} bottomGap ${r.bottomGap} nextTop ${r.nextTop}`); });
      } catch (e) { out.push({ world, id: t.id, error: e.message }); break; }
    }
    if (world === 'coaching') { await exec(() => document.querySelector('.worlds [data-to-world="salon"]').click()); await sleep(2800); }
  }
  return out;
}

// SITE=local (task b36dde1f): this checkout's built pages instead of the live ones, staged as deploy-mgs.sh stages them
// (option-2.2/site's films, photos, fonts and sound + option-2.2-mgs/<v>/index.html) and served with byte ranges (206) like
// the live host, so a fix is proven in real Safari before it is deployed. Default: the live sites.
let siteOf = (v) => `https://salon-om-2-2-${v}.web.app/`;
async function local() {
  const REPO = path.resolve(HERE, '..'), T = { '.html': 'text/html; charset=utf-8', '.mp4': 'video/mp4', '.webp': 'image/webp', '.jpg': 'image/jpeg',
    '.png': 'image/png', '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.json': 'application/json', '.js': 'text/javascript', '.css': 'text/css' };
  const srv = http.createServer((q, r) => {
    const [, v, ...rest] = decodeURIComponent(q.url.split('?')[0]).split('/'), rel = rest.join('/');
    const f = path.resolve(rel === '' || rel === 'index.html' ? path.join(REPO, 'option-2.2-mgs', v, 'index.html') : path.join(REPO, 'option-2.2', 'site', rel));
    if (!f.startsWith(REPO + path.sep) || !fs.existsSync(f) || !fs.statSync(f).isFile()) { r.writeHead(404); return r.end(); }
    const size = fs.statSync(f).size, m = /^bytes=(\d*)-(\d*)$/.exec(q.headers.range || ''), h = { 'content-type': T[path.extname(f)] || 'application/octet-stream', 'accept-ranges': 'bytes' };
    if (!m) { r.writeHead(200, { ...h, 'content-length': size }); return fs.createReadStream(f).pipe(r); }
    const a = m[1] === '' ? Math.max(0, size - +m[2]) : +m[1], z = m[1] !== '' && m[2] !== '' ? Math.min(+m[2], size - 1) : size - 1;
    if (a > z || a >= size) { r.writeHead(416, { 'content-range': `bytes */${size}` }); return r.end(); }
    r.writeHead(206, { ...h, 'content-range': `bytes ${a}-${z}/${size}`, 'content-length': z - a + 1 }); fs.createReadStream(f, { start: a, end: z }).pipe(r);
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  const port = srv.address().port; siteOf = (v) => `http://127.0.0.1:${port}/${v}/`; srv.unref();
  res.site = `local: this checkout, served at 127.0.0.1:${port} with byte ranges`;
}

try {
  if (process.env.SITE === 'local') await local();
  await start(); save();
  for (const v of VERS) { try { await version(v); } catch (e) { res.versions[v] = { ...(res.versions[v] || {}), error: e.message }; console.log(v, 'error', e.message); save(); } }
} catch (e) {
  res.error = e.message; console.log('error', e.message);
} finally {
  try { if (sid) await wd('DELETE', S('')); } catch (e) {}
  if (drv) drv.kill();
  if (sim && sim.mine) { try { execFileSync('xcrun', ['simctl', 'shutdown', sim.udid]); } catch (e) { res.notes.push('simctl shutdown: ' + e.message); } }
  res.ended = new Date().toISOString(); save();
}
