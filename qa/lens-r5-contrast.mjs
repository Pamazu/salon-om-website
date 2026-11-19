// Ink on the sheet (task 9b13c4b2, J 18 Nov 19:41 Z: "Ensure the text is always readable"): each option of qa/lens-options-r2 held
// at 12 moments across its motion (window.__lensT), the words hidden, the sheet behind them photographed, and for every line the
// darkest 3% of the pixels under it give the WCAG ratio (L_bg + .05) / (L_ink + .05) (the method of lens-contrast.mjs, task a73569a9).
// Body text needs 4.5:1, large text (24 px and up, or 18.66 px bold) 3:1. Prints the worst moment per line kind and option.
// Usage: node lens-r5-contrast.mjs <url> [1440,390]
import { webkit } from 'playwright';
const url = process.argv[2], WS = (process.argv[3] || '1440,390').split(',').map(Number);
const b = await webkit.launch(); const worst = {};
for (const W of WS) {
  const ph = W < 700, ctx = await b.newContext({ viewport: { width: W, height: ph ? 844 : 900 }, deviceScaleFactor: 1, isMobile: ph, hasTouch: ph });
  for (const id of (process.env.IDS || 'ABCDE').split('')) {
    const p = await ctx.newPage(); await p.goto(`${url}?only=${id}`); await p.waitForTimeout(1500);
    const rows = {};
    for (let k = 0; k < 12; k++) {
      const t = k * 0.55; await p.evaluate((t) => { window.__lensT = t; }, t); await p.waitForTimeout(220);
      await p.evaluate(() => document.querySelectorAll('.v.on .words, .v.on .words *').forEach((w) => w.style.setProperty('color', 'transparent', 'important'))); await p.waitForTimeout(120);   // the letters go, any glow around them stays: what is really behind each letter
      const png = await p.screenshot({ type: 'png' });
      const r = await p.evaluate(async (dataUrl) => {
        const img = new Image(); img.src = dataUrl; await img.decode();
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
        const lin = (x) => { x /= 255; return x <= .03928 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4); };
        const L = (r, gg, bb) => .2126 * lin(r) + .7152 * lin(gg) + .0722 * lin(bb); const out = [];
        for (const e of document.querySelectorAll('.v.on .words .eyebrow, .v.on .words h2, .v.on .words dt, .v.on .words dd')) {
          const cs = getComputedStyle(e), fs = parseFloat(cs.fontSize), large = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
          const col = [23, 17, 13], li = L(col[0], col[1], col[2]);   // the ink, #17110D (its colour is hidden while measuring)
          const rg = document.createRange(); rg.selectNodeContents(e);
          for (const q of rg.getClientRects()) {
            const x = Math.max(0, Math.round(q.left)), y = Math.max(0, Math.round(q.top)), w = Math.min(c.width - x, Math.round(q.width)), h = Math.min(c.height - y, Math.round(q.height));
            if (w < 2 || h < 2) continue; const d = g.getImageData(x, y, w, h).data, ls = [];
            for (let i = 0; i < d.length; i += 4) ls.push(L(d[i], d[i + 1], d[i + 2])); ls.sort((a, b) => a - b);
            const lo = ls[Math.floor(ls.length * .03)]; out.push({ kind: e.tagName === 'P' ? 'eyebrow' : e.tagName.toLowerCase(), large, ratio: (Math.max(lo, li) + .05) / (Math.min(lo, li) + .05) });
          }
        }
        return out;
      }, 'data:image/png;base64,' + png.toString('base64'));
      for (const o of r) { const key = o.kind; if (!rows[key] || o.ratio < rows[key].ratio) rows[key] = { ...o, t }; }
      await p.evaluate(() => document.querySelectorAll('.v.on .words, .v.on .words *').forEach((w) => w.style.removeProperty('color')));
    }
    const line = Object.values(rows).map((o) => `${o.kind}${o.large ? '(large)' : ''} ${o.ratio.toFixed(2)}${o.ratio >= (o.large ? 3 : 4.5) ? '' : ' FAIL'} @${o.t.toFixed(2)}s`).join(' · ');
    const pass = Object.values(rows).every((o) => o.ratio >= (o.large ? 3 : 4.5));
    console.log(W, id, pass ? 'PASS' : 'FAIL', '|', line); worst[`${W}-${id}`] = { pass, rows };
    await p.close();
  }
  await ctx.close();
}
await b.close();
