// Runs r4.mjs the same way on any sDelegate machine (the PC runs PowerShell, the Mac Studio bash): installs the
// packages and Playwright's browser if missing, then the checks.  node run.mjs [shots|snap|shots,snap|gaps|visit] [webkit|chromium] [m,g,s]
// PW=<version> installs that Playwright instead of package.json's. If the machine's shared browser folder is locked or
// not writable (the PC's, 11 Nov), the browser goes into this run's own folder (./pw) instead.
import { execSync } from 'node:child_process';
import path from 'node:path';
const [only, browser, vers, ids, wait] = process.argv.slice(2);
if (only) process.env.ONLY = only;
if (browser) process.env.BROWSER = browser;
if (vers) process.env.VERS = vers;
if (ids) process.env.IDS = ids;
if (wait) process.env.WAIT = wait;
// safari (task 2846db82): real Safari through safaridriver needs no package and no Playwright browser: safari.mjs reads its
// own arguments (node run.mjs safari <mac|sim> [m,g] [films,sound,snap])
if (only === 'safari') { await import('./safari.mjs'); process.exit(0); }
const run = (cmd) => { try { execSync(cmd, { stdio: 'inherit' }); return true; } catch (e) { console.log('failed:', cmd, e.message.slice(0, 200)); return false; } };
run(process.env.PW ? `npm i --no-audit --no-fund --silent playwright@${process.env.PW}` : 'npm i --no-audit --no-fund --silent');
// WEBKIT (task b36dde1f): sDelegate's WebKit asset on the Mac Studio (run-at-ref --asset WEBKIT), launched by r4.mjs as is
const install = `npx playwright install ${process.env.BROWSER || 'webkit'}`;
if ((process.env.BROWSER || 'webkit') === 'webkit' && process.env.WEBKIT) console.log('webkit from the asset', process.env.WEBKIT);
else if (!run(install)) { process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve('pw'); console.log('browsers in', process.env.PLAYWRIGHT_BROWSERS_PATH); run(install); }
// gaps (task cf6eeff6): every section's spacing measured and the gaps off its rhythm flagged (gaps.mjs); the rest is r4.mjs
await import(only === 'gaps' ? './gaps.mjs' : only === 'held' ? './held.mjs' : './r4.mjs');   // held (task b36dde1f): Low Power Mode, simulated
