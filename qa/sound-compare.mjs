// QA tool (task 5cb93228, J 18 Nov: "the music takes too long to load bro. Ensure films, music all is extremely fast"): is a
// lighter encode of a soundscape still the same sound, and does its loop still join without a seam?
// Reads two sounds decoded to raw 44.1 kHz stereo s16le (ffmpeg -i x -f s16le -ar 44100 -ac 2 x.raw; ffmpeg strips each
// codec's own delay, so the two line up sample for sample) and prints:
//   bands: for each third-octave band from 50 Hz to 16 kHz, how far the new sound's level is from the reference's, frame by
//          frame (2048 samples, Hann window, half overlap), in dB: the mean and the 95th percentile over frames where the
//          reference band is above -75 dBFS; and the whole sound's level difference
//   seam:  the file is periodic (0.5 s pad, then the 90 s loop, then 0.5 s pad: the page loops [0.5, 90.5]), so each sample at
//          t should equal the one at t + 90 for t in the pads; the difference's level against the signal's, for the reference
//          and the new sound (a transcode keeps the seam when its figure stays near the reference's)
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
// the seam: sample t against t + LOOP across the two pads (0.05-0.95 s), as a level below the signal's
function seam(x) {
  const lo = Math.round(0.05 * SR), hi = Math.round(0.95 * SR), L = Math.round(LOOP * SR); let d = 0, s = 0;
  for (let i = lo; i < hi && i + L < n; i++) { const u = mono(x, i), v = mono(x, i + L); d += (u - v) ** 2; s += u * u; }
  return +(10 * Math.log10(d / (s + 1e-20) + 1e-20)).toFixed(1);
}
const out = { seconds: +(n / SR).toFixed(2), levelDb: { ref: +rms(a, 0, n).toFixed(2), new: +rms(b, 0, n).toFixed(2) },
  worstBandMeanDb: Math.max(...bands.filter((x) => x.meanDb !== null).map((x) => x.meanDb)),
  worstBandP95Db: Math.max(...bands.filter((x) => x.p95Db !== null).map((x) => x.p95Db)),
  seamDb: { ref: seam(a), new: seam(b) }, bands };
console.log(JSON.stringify(out));
