// Quick look at qa/lens-options-r2 in WebKit: each option alone (?only=X), frames over 2 s, at 1440 and 390 (task 9b13c4b2).
// Usage: node lens-r2-shot.mjs <url> <outdir> [sizes]
import { webkit } from 'playwright'; import fs from 'node:fs';
const url = process.argv[2], out = process.argv[3]; fs.mkdirSync(out, { recursive: true });
const SIZES = (process.argv[4] || '1440,390').split(',').map(Number);
const b = await webkit.launch();
for (const W of SIZES) {
  const phone = W < 700, H = phone ? 844 : 900;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: phone, hasTouch: phone });
  for (const id of ['A', 'B', 'C', 'D', 'E']) {
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(`${url}?only=${id}`); await p.waitForTimeout(1500);
    const t0 = Date.now(); for (let i = 0; i < 5; i++) { const due = t0 + i * 500; const w = due - Date.now(); if (w > 0) await p.waitForTimeout(w); await p.screenshot({ path: `${out}/${W}-${id}-${i}.jpg`, type: "jpeg", quality: 82 }); }
    console.log(W, id, JSON.stringify(await p.evaluate(() => window.__lens && window.__lens())), errs.slice(0, 3).join(' | '));
    await p.close();
  }
  await ctx.close();
}
await b.close();
