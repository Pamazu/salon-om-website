// QA tool (task 5cb93228): each soundscape decoded by WebKit itself (decodeAudioData, as mgs_sound.js does), and the join where
// the page loops it (loopStart 0.5 s, loopEnd 0.5 + 90 s, mgs_sound.js PAD and LOOP) measured on the decoded samples: the jump
// across the join against the largest sample-to-sample steps (99.9th percentile) in the half second either side (a click is a
// jump far above them; <= 1 is none) and against the largest of them (jumpOfMax), and the level 50 ms either side (dB step). The MP3 and its lighter .m4a side by side, so
// a browser that keeps the AAC encoder's start delay in its decode shows here.
// Runs in a person's session (heavy-slot.py run --local): the pool's WebKit jobs decode no sound (19 Nov).
//   node sound-seam.mjs [names, default bed,earth,water,fire,air,ether] [exts, default mp3,m4a]
import path from 'node:path'; import { fileURLToPath } from 'node:url';
import * as pw from 'playwright'; import { serve } from './lib.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NAMES = (process.argv[2] || 'bed,earth,water,fire,air,ether').split(','), EXTS = (process.argv[3] || 'mp3,m4a').split(',');
const srv = await serve(REPO), base = `http://127.0.0.1:${srv.address().port}/m/`;
const b = await pw.webkit.launch(), p = await (await b.newContext()).newPage();
await p.goto(base + 'sound/loops.json');
let bad = 0; const got = {};
for (const n of NAMES) for (const e of EXTS) {
  const r = await p.evaluate(async (u) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const ab = await (await fetch(u)).arrayBuffer();
    let buf; try { buf = await ctx.decodeAudioData(ab); } catch (x) { return { error: String(x) }; }
    const sr = buf.sampleRate, S = Math.round(0.5 * sr), E = Math.round(Math.min(0.5 + 90, buf.duration) * sr), W = Math.round(0.5 * sr), L50 = Math.round(0.05 * sr);
    const ch = [...Array(buf.numberOfChannels).keys()].map((c) => buf.getChannelData(c));
    const y = (i) => ch.map((d) => (i < W ? d[E - W + i] : d[S + i - W]));      // the looped signal around the join (index W = first after)
    const steps = []; let jump = 0;
    for (let i = 1; i < 2 * W; i++) { const a = y(i - 1), c = y(i), s = Math.max(...c.map((v, k) => Math.abs(v - a[k]))); if (i === W) jump = s; else steps.push(s); }
    steps.sort((u, v) => u - v); const p999 = steps[Math.floor(0.999 * steps.length)], max = steps[steps.length - 1];
    const lv = (a, z) => { let s = 0; for (let i = a; i < z; i++) s += y(i).reduce((t, v) => t + v * v, 0); return 10 * Math.log10(s / (z - a) + 1e-20); };
    await ctx.close();
    return { sampleRate: sr, seconds: +buf.duration.toFixed(3), jumpRatio: +(jump / p999).toFixed(2), jumpOfMax: +(jump / max).toFixed(2), levelStepDb: +(lv(W, W + L50) - lv(W - L50, W)).toFixed(2) };
  }, base + `sound/${n}.${e}`);
  // joins: the jump is no larger than the largest step the sound itself takes in that second, and the level steps no more
  // than 1.5 dB (or no more than the first file's own join, the MP3 as it plays today)
  const first = got[n] = got[n] || r;
  const ok = !r.error && r.jumpOfMax <= 1 && (Math.abs(r.levelStepDb) <= 1.5 || Math.abs(r.levelStepDb - first.levelStepDb) <= 0.5);
  if (!ok) bad++;
  console.log(n, e, JSON.stringify(r), ok ? 'JOINS' : 'SEAM');
}
await b.close(); srv.close();
process.exit(bad ? 1 : 0);
