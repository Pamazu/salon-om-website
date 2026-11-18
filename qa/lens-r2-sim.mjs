// The lenticular options r2 (qa/lens-options-r2) in the iOS Simulator's own mobile Safari (task 9b13c4b2): no WebDriver,
// a headless simulator driven by `simctl openurl` and read by `simctl io screenshot`. Each option alone (?only=X), five
// frames over about 2 s, and the page's own report (did each option draw, how many frames) posted back by one injected line.
//   node lens-r2-sim.mjs "<device name>" <outdir>
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { execFileSync } from 'node:child_process';
const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'lens-options-r2');
const NAME = process.argv[2] || 'iPhone 17e', OUT = path.resolve(process.argv[3] || 'out-lens-sim'); fs.mkdirSync(OUT, { recursive: true });
const sh = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' });
const dev = Object.values(JSON.parse(sh('list', 'devices', 'available', '-j')).devices).flat().find((d) => d.name === NAME || d.udid === NAME);
const wasBooted = dev.state === 'Booted'; if (!wasBooted) sh('boot', dev.udid); sh('bootstatus', dev.udid, '-b');
console.log('simulator', dev.name, dev.udid, wasBooted ? '(was booted)' : '(booted here)');
const REPORT = `<script>setTimeout(function(){fetch('/__r',{method:'POST',body:JSON.stringify({id:new URLSearchParams(location.search).get('only'),w:innerWidth,h:innerHeight,dpr:devicePixelRatio,ua:navigator.userAgent,lens:window.__lens&&window.__lens()})})},3200)</script>`;
const T = { '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.woff2': 'font/woff2' }; let got = null;
const srv = http.createServer((q, r) => {
  const u = new URL(q.url, 'http://x');
  if (u.pathname === '/__r') { let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => { got && got(JSON.parse(b)); r.writeHead(204); r.end(); }); return; }
  const f = path.join(DIR, decodeURIComponent(u.pathname).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); }
    if (f.endsWith('.html')) d = Buffer.from(String(d).replace('</body>', REPORT + '</body>'));
    r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); r.end(d); });
}).listen(0, '127.0.0.1');
await new Promise((ok) => srv.on('listening', ok)); const port = srv.address().port;
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms)); const res = [];
import { spawn } from 'node:child_process';
const FR = process.env.FRAMES_BIN;   // a frame reader for the recorded film (AVFoundation), times in seconds
for (const id of ['A', 'B', 'C', 'D', 'E']) {
  let r = null;
  for (let tries = 0; tries < 3 && !r; tries++) {   // a cold Safari under a heavy load can miss the first open: open again
    const rep = new Promise((ok) => { got = ok; setTimeout(() => ok(null), 30000); });
    sh('openurl', dev.udid, `http://127.0.0.1:${port}/?only=${id}&n=${Date.now()}`); r = await rep;
  }
  await sleep(800);
  // a screen recording, not screenshots: under load one simctl screenshot took 22 s, a film keeps every moment
  const mov = path.join(OUT, `${id}.mov`); try { fs.unlinkSync(mov); } catch (e) {}
  // its own process group: SIGINT must reach simctl itself (xcrun and simctl are wrappers), or nothing is written
  const rec = spawn('xcrun', ['simctl', 'io', dev.udid, 'recordVideo', '--codec=h264', '--force', mov], { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
  let log = ''; const started = new Promise((ok) => { const on = (d) => { log += d; if (/Recording started/i.test(log)) ok(true); }; rec.stdout.on('data', on); rec.stderr.on('data', on); setTimeout(() => ok(false), 40000); });
  const st = await started; await sleep(3600); try { process.kill(-rec.pid, 'SIGINT'); } catch (e) {}
  await new Promise((ok) => { rec.on('exit', ok); setTimeout(ok, 30000); }); if (!st) console.log(id, 'recorder never said it started:', log.slice(-200));
  let fr = ''; if (FR) { try { fr = execFileSync(FR, [mov, path.join(OUT, id), '0.6,1.1,1.6,2.1,2.6'], { encoding: 'utf8' }).replace(/\n/g, ' '); } catch (e) { fr = 'frames failed ' + e.message.slice(0, 80); } }
  console.log(id, r ? `${r.w}x${r.h}@${r.dpr}` : 'no report', JSON.stringify(r && r.lens && r.lens.find((x) => x.id === id)), fr);
  res.push({ id, report: r });
}
fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify({ device: dev.name, res }, null, 1));
if (!wasBooted) { try { sh('shutdown', dev.udid); } catch (e) {} }
srv.close(); process.exit(0);
