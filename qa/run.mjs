// Runs r4.mjs the same way on any sDelegate machine (the PC runs PowerShell, the Mac Studio bash): installs the
// packages and Playwright's browser if missing, then the checks.  node run.mjs [shots|snap|shots,snap] [webkit|chromium] [m,g,s]
// PW=<version> installs that Playwright instead of package.json's. If the machine's shared browser folder is locked or
// not writable (the PC's, 11 Nov), the browser goes into this run's own folder (./pw) instead.
import { execSync } from 'node:child_process';
import path from 'node:path';
const [only, browser, vers] = process.argv.slice(2);
if (only) process.env.ONLY = only;
if (browser) process.env.BROWSER = browser;
if (vers) process.env.VERS = vers;
const run = (cmd) => { try { execSync(cmd, { stdio: 'inherit' }); return true; } catch (e) { console.log('failed:', cmd, e.message.slice(0, 200)); return false; } };
run(process.env.PW ? `npm i --no-audit --no-fund --silent playwright@${process.env.PW}` : 'npm i --no-audit --no-fund --silent');
const install = `npx playwright install ${process.env.BROWSER || 'webkit'}`;
if (!run(install)) { process.env.PLAYWRIGHT_BROWSERS_PATH = path.resolve('pw'); console.log('browsers in', process.env.PLAYWRIGHT_BROWSERS_PATH); run(install); }
await import('./r4.mjs');
