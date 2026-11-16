// Real Safari through safaridriver (task 2846db82, CEO MA 16 Nov): what Playwright's WebKit cannot show, on the live pages.
//   node run.mjs safari <mac|sim> [m,g] [films,sound,snap]
//   mac: Safari on macOS, its window at 1440 x 900 on the job's own screen (sDelegate --needs macos,own-screen gives
//        SDELEGATE_SCREEN_FRAME; without one this refuses to open a window). sim: iOS Simulator Safari at iPhone size.
// No packages: WebDriver over HTTP with Node's own fetch. Reuses r4.mjs's step ids, film timing (photo on at 1.5 s, the film
// moving by 6 s) and its six snap steps and expectations.
//   films: per step, the element film's clock advances, it is not paused, no error, the photo has dissolved.
//   sound: read-only wrappers on the page's Web Audio, installed after load (no page code changed), then ONE click on the
//          page, the visitor's first gesture; per step: the context running and its clock advancing, the step's own track
//          (sound/<element>.mp3, the section's data-sound) glided up to full and its source started.
//   snap: r4.mjs snap()'s six steps through WebDriver wheel actions (reported as such if Safari has no wheel input).
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [, WHERE = 'mac', VERS_ARG = 'm,g', WHAT = 'films,sound,snap'] = process.argv.slice(2);
const VERS = VERS_ARG.split(',');
const OUT = path.join(HERE, `out-safari-${WHERE}`);
fs.mkdirSync(OUT, { recursive: true });
const PORT = 4444 + Math.floor(Math.random() * 500);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const res = { where: WHERE, started: new Date().toISOString(), versions: {}, notes: [] };
const save = () => fs.writeFileSync(path.join(OUT, 'safari.json'), JSON.stringify(res, null, 1));
let sid = null, drv = null;

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
  let up = false;
  for (let i = 0; i < 60 && !up; i++) { try { up = (await fetch(`http://127.0.0.1:${PORT}/status`)).ok; } catch (e) { await sleep(250); } }
  if (!up) throw new Error('safaridriver did not answer on its port');
  const caps = WHERE === 'sim'
    ? { browserName: 'safari', platformName: 'iOS', 'safari:useSimulator': true, 'safari:deviceType': 'iPhone' }
    : { browserName: 'safari' };
  const v = await wd('POST', '/session', { capabilities: { alwaysMatch: caps } });
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
    photo: top ? Math.round(+getComputedStyle(top).opacity * 100) / 100 : null, sound: s.getAttribute('data-sound'), active: s.classList.contains('is-active') };
}, id);

async function version(v) {
  const r = res.versions[v] = {};
  await wd('POST', S('/url'), { url: `https://salon-om-2-2-${v}.web.app/` });
  await sleep(2500);
  r.build = await exec(() => ({ url: location.href, fixes7efa6f0: document.documentElement.outerHTML.indexOf('io2.observe') > 0, soundPref: localStorage.getItem('om-sound') }));
  const ids = await exec(() => [...document.querySelectorAll('main[data-world="salon"] > section.s')].filter((s) => s.querySelector('.ch--stack, .ch__top') && s.querySelector('video')).map((s) => s.id));
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
  for (const id of ids) {
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

// r4.mjs snap(): the same six steps on the tall sections of this version (1440 x 900), through WebDriver wheel actions
async function wheel(dy, step = 60) {
  const n = Math.max(1, Math.round(Math.abs(dy) / step)), d = Math.round(Math.sign(dy) * Math.abs(dy) / n);
  const acts = [];
  for (let i = 0; i < n; i++) { acts.push({ type: 'scroll', x: 720, y: 450, deltaX: 0, deltaY: d, duration: 40, origin: 'viewport' }); acts.push({ type: 'pause', duration: 40 }); }
  await wd('POST', S('/actions'), { actions: [{ type: 'wheel', id: 'wheel', actions: acts }] });
}
const edges = (id) => exec((id) => {
  const s = document.getElementById(id), n = s.nextElementSibling, r = s.getBoundingClientRect();
  return { top: Math.round(r.top), bottomGap: Math.round(r.bottom - innerHeight), nextTop: n ? Math.round(n.getBoundingClientRect().top) : null, y: Math.round(scrollY), vh: innerHeight };
}, id);
async function snap(v) {
  const cases = { g: ['services', 'c-how', 'hosts'], m: ['services', 'hosts'] }[v] || [];
  const out = [];
  for (const id of cases) {
    if (id.startsWith('c-')) { await exec(() => document.querySelector('.worlds [data-to-world="coaching"]').click()); await sleep(2800); }
    const g = await exec((id) => { const e = document.getElementById(id), r = e.getBoundingClientRect(); return { top: r.top + scrollY, h: r.height, vh: innerHeight }; }, id);
    if (g.h <= g.vh + 2) { out.push({ id, note: 'not taller than the window here' }); continue; }
    const third = g.vh / 3, rec = async (step, expect) => { await sleep(1300); out.push({ id, step, expect, ...(await edges(id)) }); };
    try {
      await jump(g.top); await sleep(900);
      await wheel(Math.min(300, g.h - g.vh - 40)); await rec('a', 'no move: top < 0, bottomGap > 0');
      await jump(g.top + g.h - g.vh - 200); await sleep(900);
      await wheel(320); await rec('b', 'bottomGap 0');
      await wheel(Math.round(third * 0.6)); await rec('c', 'bottomGap 0 again');
      await wheel(Math.round(third * 1.25)); await rec('d', 'nextTop 0');
      await wheel(-120); await rec('e', 'nextTop 0 (stays)');
      await wheel(-Math.round(third * 1.25)); await rec('f', 'bottomGap 0');
    } catch (e) { out.push({ id, error: e.message }); break; }
    if (id.startsWith('c-')) { await exec(() => document.querySelector('.worlds [data-to-world="salon"]').click()); await sleep(2800); }
  }
  for (const r of out) {
    if (!r.step) continue;
    const ok = { a: r.top < 0 && r.bottomGap > 0, b: Math.abs(r.bottomGap) <= 2, c: Math.abs(r.bottomGap) <= 2, d: r.nextTop != null && Math.abs(r.nextTop) <= 2, e: r.nextTop != null && Math.abs(r.nextTop) <= 2, f: Math.abs(r.bottomGap) <= 2 }[r.step];
    r.pass = ok;
    console.log('snap', v, r.id, r.step, ok ? 'pass' : 'FAIL', `top ${r.top} bottomGap ${r.bottomGap} nextTop ${r.nextTop}`);
  }
  return out;
}

try {
  await start(); save();
  for (const v of VERS) { try { await version(v); } catch (e) { res.versions[v] = { ...(res.versions[v] || {}), error: e.message }; console.log(v, 'error', e.message); save(); } }
} catch (e) {
  res.error = e.message; console.log('error', e.message);
} finally {
  try { if (sid) await wd('DELETE', S('')); } catch (e) {}
  if (drv) drv.kill();
  res.ended = new Date().toISOString(); save();
}
