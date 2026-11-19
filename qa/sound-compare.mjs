// QA tool (task 5cb93228, J 18 Nov: "the music takes too long to load bro. Ensure films, music all is extremely fast"): is a
// lighter encode of a soundscape still the same sound, and does its loop still join without a seam?
// Reads two sounds decoded to raw 44.1 kHz stereo s16le (ffmpeg -i x -f s16le -ar 44100 -ac 2 x.raw; ffmpeg strips each
// codec's own delay, so the two line up sample for sample) and prints:
//   bands: for each third-octave band from 50 Hz to 16 kHz, how far the new sound's level is from the reference's, frame by
//          frame (2048 samples, Hann window, half overlap), in dB: the mean and the 95th percentile over frames where the
//          reference band is above -75 dBFS; and the whole sound's level difference
//   seam:  where the page loops [0.5, 90.5] (the file is 0.5 s pad, the 90 s loop, 0.5 s pad): no click and no level step at
//          the join, for the reference and the new sound (see seam() below)
//   node sound-compare.mjs <reference.raw> <new.raw> [loop seconds, default 90]
import fs from 'node:fs';
const [, , A, B, LOOPS = '90'] = process.argv, SR = 44100, LOOP = +LOOPS;
const read = (f) => { const b = fs.readFileSync(f); return new Int16Array(b.buffer, b.byteOffset, b.length >> 1); };
const a = read(A), b = read(B), n = Math.min(a.length, b.length) >> 1;      // frames of two samples (left, right)
const mono = (x, i) => (x[2 * i] + x[2 * i + 1]) / 65536;                   // -1..1, the two channels averaged
// a radix-2 FFT in place (re, im of length N)
function fft(re, im) {
  const N = re.length;
  for (let i = 1, j = 0; i < N; i++) { let bit = N >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= N; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < N; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], j = i + k + len / 2;
        const vr = re[j] * cr - im[j] * ci, vi = re[j] * ci + im[j] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[j] = ur - vr; im[j] = ui - vi;
        const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
const N = 2048, HOP = 1024, win = Float32Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
const centres = []; for (let f = 50; f <= 16000; f *= Math.pow(2, 1 / 3)) centres.push(f);
const edges = centres.map((c) => [Math.floor(c / Math.pow(2, 1 / 6) * N / SR), Math.ceil(c * Math.pow(2, 1 / 6) * N / SR)]);
function bandsOf(x, at) {
  const re = new Float64Array(N), im = new Float64Array(N);
  for (let i = 0; i < N; i++) re[i] = mono(x, at + i) * win[i];
  fft(re, im);
  return edges.map(([lo, hi]) => { let e = 0; for (let k = Math.max(1, lo); k <= Math.min(N / 2, hi); k++) e += re[k] * re[k] + im[k] * im[k]; return 10 * Math.log10(e / (N * N / 4) + 1e-20); });
}
const diffs = centres.map(() => []);
for (let at = 0; at + N < n; at += HOP) {
  const ra = bandsOf(a, at), rb = bandsOf(b, at);
  ra.forEach((v, i) => { if (v > -75) diffs[i].push(Math.abs(v - rb[i])); });
}
const q = (arr, p) => { if (!arr.length) return null; const s = [...arr].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const mean = (arr) => arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null;
const rms = (x, from, to) => { let s = 0; for (let i = from; i < to; i++) s += mono(x, i) ** 2; return 10 * Math.log10(s / (to - from) + 1e-20); };
const bands = centres.map((c, i) => ({ hz: Math.round(c), frames: diffs[i].length, meanDb: mean(diffs[i]) === null ? null : +mean(diffs[i]).toFixed(2), p95Db: q(diffs[i], 0.95) === null ? null : +q(diffs[i], 0.95).toFixed(2) }));
// the seam, where the page loops (loopStart 0.5 s, loopEnd 0.5 + LOOP): the jump from the last sample before the loop's end to
// the first after its start, against the largest sample-to-sample steps (99.9th percentile) in the half second either side
// (a click is a jump far above them; <= 1 is none), and the level 50 ms either side (dB step). Also at an offset of 2112
// samples, should a browser keep the AAC encoder's start delay (the file is periodic, so a shifted loop is still whole)
function seam(x, off = 0) {
  const S = Math.round(0.5 * SR) + off, E = Math.round((0.5 + LOOP) * SR) + off, W = Math.round(0.5 * SR), y = [];
  for (let i = E - W; i < E; i++) y.push([x[2 * i] / 32768, x[2 * i + 1] / 32768]);
  for (let i = S; i < S + W; i++) y.push([x[2 * i] / 32768, x[2 * i + 1] / 32768]);
  const steps = []; for (let i = 1; i < y.length; i++) if (i !== W) steps.push(Math.max(Math.abs(y[i][0] - y[i - 1][0]), Math.abs(y[i][1] - y[i - 1][1])));
  const jump = Math.max(Math.abs(y[W][0] - y[W - 1][0]), Math.abs(y[W][1] - y[W - 1][1]));
  const lv = (a, b) => { let e = 0; for (let i = a; i < b; i++) e += y[i][0] ** 2 + y[i][1] ** 2; return 10 * Math.log10(e / (b - a) + 1e-20); };
  const L50 = Math.round(0.05 * SR);
  return { jumpRatio: +(jump / q(steps, 0.999)).toFixed(2), levelStepDb: +(lv(W, W + L50) - lv(W - L50, W)).toFixed(2) };
}
const out = { seconds: +(n / SR).toFixed(2), levelDb: { ref: +rms(a, 0, n).toFixed(2), new: +rms(b, 0, n).toFixed(2) },
  worstBandMeanDb: Math.max(...bands.filter((x) => x.meanDb !== null).map((x) => x.meanDb)),
  worstBandP95Db: Math.max(...bands.filter((x) => x.p95Db !== null).map((x) => x.p95Db)),
  seam: { ref: seam(a), new: seam(b), newShifted: seam(b, 2112) }, bands };
console.log(JSON.stringify(out));
