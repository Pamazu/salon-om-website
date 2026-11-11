// Runs r4.mjs the same way on any sDelegate machine (the PC runs PowerShell, the Mac Studio bash): installs the
// packages and Playwright's WebKit if missing, then the checks.  node run.mjs [shots|snap|shots,snap] [webkit|chromium] [m,g,s]
import { execSync } from 'node:child_process';
const [only, browser, vers] = process.argv.slice(2);
if (only) process.env.ONLY = only;
if (browser) process.env.BROWSER = browser;
if (vers) process.env.VERS = vers;
// PW=<version> installs that Playwright instead of package.json's (a WebKit build that matches a newer macOS)
for (const cmd of [process.env.PW ? `npm i --no-audit --no-fund --silent playwright@${process.env.PW}` : 'npm i --no-audit --no-fund --silent', `npx playwright install ${process.env.BROWSER || 'webkit'}`]) {
  try { execSync(cmd, { stdio: 'inherit' }); } catch (e) { console.log('failed:', cmd, e.message.slice(0, 200)); }
}
await import('./r4.mjs');
