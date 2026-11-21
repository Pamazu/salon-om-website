"""The contrast behind every line of the pause's words, read from the pixels (task e1a1e009; J 20 Nov: "use lighting to enhance
readability"). Reads what qa/pause.mjs wrote at the out-breath and at rest: the frame with the words hidden (*-bare.png) and each
line's box, colour and size (*.json). For every background pixel under a line, the line's colour (its alpha laid over that pixel)
against the pixel, as WCAG measures contrast; a line passes when its worst 5 % of pixels still reach the level: AA 4.5:1, or 3:1
for large text (24 px and over, or 18.66 px bold); AAA 7:1, or 4.5:1 large (task 3a9e24cf: AA at least, AAA the aim).
Usage: python pause_contrast.py <outdir> [aa|aaa]; exit 1 when a line misses the level (AA when not given)."""
import glob, json, re, sys
import numpy as np
from PIL import Image


def lin(c):
    c = c / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lum(rgb):
    l = lin(rgb)
    return 0.2126 * l[..., 0] + 0.7152 * l[..., 1] + 0.0722 * l[..., 2]


level = (sys.argv[2] if len(sys.argv) > 2 else 'aa').lower()
bad = 0
for j in sorted(glob.glob(sys.argv[1] + '/*-p*.json')):
    d = json.load(open(j))
    im = np.asarray(Image.open(j[:-5] + '-bare.png').convert('RGB')).astype(float)
    for l in d['lines']:
        x0, y0, x1, y1 = [int(round(v * d['dpr'])) for v in l['box']]
        bg = im[max(0, y0):y1, max(0, x0):x1].reshape(-1, 3)
        if not len(bg):
            continue
        n = [float(v) for v in re.findall(r'[\d.]+', l['color'])]
        a = n[3] if len(n) > 3 else 1.0
        fg = a * np.array(n[:3]) + (1 - a) * bg
        lt, lb = lum(fg), lum(bg)
        cr = (np.maximum(lt, lb) + 0.05) / (np.minimum(lt, lb) + 0.05)
        large = l['px'] >= 24 or (l['px'] >= 18.66 and int(l['weight']) >= 700)
        aa, aaa = (3.0, 4.5) if large else (4.5, 7.0)
        worst, mid = float(np.percentile(cr, 5)), float(np.median(cr))
        got = 'AAA' if worst >= aaa else 'AA' if worst >= aa else 'fail'
        ok = worst >= (aaa if level == 'aaa' else aa)
        bad += not ok
        print(f"{'PASS' if ok else 'FAIL'} {j.split('/')[-1][:-5]:<26} {l['k']:<9} {l['px']:>5.1f}px  worst 5% {worst:5.2f}  median {mid:5.2f}  {got:<4} (AA {aa}, AAA {aaa})")
sys.exit(1 if bad else 0)
