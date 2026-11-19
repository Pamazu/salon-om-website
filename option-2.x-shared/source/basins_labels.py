"""J's 25 Oct basins picture at full size, its bottles' words true (task 69006a72).

J, 19 Nov 2026 12:01 Z: "You have not yet used the approved image the one with the organized and cleaned up beauty products,
I've reapeated this a million times." His picture is resources/salon-photos/6-shampoo-basins-edit.png (1280 px). clean_master.py
6e puts it at full size (the photographer's pixels wherever his picture equals the photo, his picture enlarged wherever it
changed the room); enlarged, its bottles carry made-up words (18 Nov, the reason it was dropped). Here they are made true:

  1. the right shelf and the right basket, in focus in the photographer's frame: each bottle's real product words, read off his
     photo on the same slots, rewritten by a local Qwen-Image-Edit 2511 edit of full-size 1024 crops (LB69/, 4 seeds each, the
     try kept per crop in WORDS) and pasted over the bottles' zone only (band_paste.py, colour fitted, feathered);
  2. the left shelf and the left basket, behind the focus (his own labels there do not read at 1:1): blurred as his lens does
     there (2.5 px, matched by eye against his photo at 1:1), so no made-up word reads;
  3. every pixel that is not the photographer's (the 6e mask) takes his photo's grain back (measured on the plain wall), so no
     enlarged patch looks painted at 1:1.

  ~/StoryForge/ComfyUI/.venv/bin/python option-2.x-shared/source/basins_labels.py
In: MASTERS/6-shampoo-basins-25oct-enlarged.jpg. Out: MASTERS/6-shampoo-basins-25oct.jpg (read by export_photos.py and by every
picture of the basins room, photo_sources.BASINS).
"""
import os, subprocess, sys
import numpy as np
from PIL import Image
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None
HERE = os.path.dirname(os.path.abspath(__file__))
MASTERS = os.environ.get('SALON_MASTERS', '/Users/j/all-worktrees/salon-om-pictures/masters/')
WORK = os.environ.get('SALON_WORK', '/Users/j/all-worktrees/salon-om-pictures/LB69/')
PY = sys.executable
IN, OUT = MASTERS + '6-shampoo-basins-25oct-enlarged.jpg', MASTERS + '6-shampoo-basins-25oct.jpg'
K = 6.4                                           # 1280 px -> the 8192 original
# crop -> (its full-size x, y; the try kept; the zone it owns, in full-size px x0,y0,x1,y1: cut between two bottles)
WORDS = {}
SOFT = [(590, 180, 732, 292), (600, 290, 732, 402)]   # 1280 px boxes: left shelf, left basket (stops before the poster's frame)
SOFT_SIGMA = 2.5
WALL = (700, 300, 730, 330)                           # a plain wall patch (1280 px) where the grain is measured
# the right shelf and basket, in focus: J's bottles stand where the photographer's real ones stand, the same products in the
# same order, so each of J's bottles takes its real label: (J's bottle body x0,y0,x1,y1 in full-size px; the real bottle it is,
# at about the same place in REAL; rows above this y keep J's own pixels: the basket's wire rim in front of the bottles).
# The real bottle's exact place is found by phase correlation within SEARCH px; the label is colour-fitted to J's bottle.
REAL = MASTERS + '6-shampoo-basins-tidied.jpg'       # the photographer's original, lamp and clutter removed; its bottles his own
SEARCH = 60
LABELS = [   # name, J's body box, the real bottle's box (None = the same box), the lowest row pasted
    ('shelf 1 botanical repair', (5650, 950, 5774, 1360), None, None),
    ('shelf 2 botanical repair', (5806, 900, 5936, 1330), None, None),
    ('shelf 3 color control', (5966, 850, 6096, 1300), None, None),
    ('shelf 4 color control', (6124, 820, 6260, 1270), None, None),
    ('shelf 5 smooth infusion', (6290, 780, 6430, 1240), (6305, 780, 6445, 1240), None),   # the real one stands 15 px right
    ('shelf 6 botanical repair', (6460, 780, 6590, 1180), (5806, 930, 5936, 1330), None),   # J's dark teal: a second of shelf 2's label, below its shoulder
    ('basket blonde revival', (5830, 1690, 5970, 2030), (5860, 1700, 6000, 2040), 2040),
    ('basket nutriplenish', (5990, 1730, 6140, 2040), (6016, 1730, 6166, 2040), 2040),
]
# J's bottles with no real bottle of their kind in focus (the yellow at the shelf's end, the white and the yellow in the basket):
# their made-up words softened as the left shelf's, so none reads
BLUR_LABELS = [(6620, 690, 6800, 1170), (6150, 1740, 6306, 2030), (6316, 1680, 6490, 2030),
               (6436, 760, 6476, 1180), (6268, 820, 6304, 1010)]   # and the thin strips of J's marks left beside two real labels


def shift(a, b):
    """(dy, dx) that best moves b onto a (grey arrays, same size): phase correlation"""
    A, B = np.fft.fft2(a - a.mean()), np.fft.fft2(b - b.mean())
    R = A * np.conj(B); R /= np.abs(R) + 1e-9
    r = np.fft.ifft2(R).real
    dy, dx = np.unravel_index(np.argmax(r), r.shape)
    return (dy - r.shape[0] if dy > r.shape[0] // 2 else dy), (dx - r.shape[1] if dx > r.shape[1] // 2 else dx)


def labels(A):
    T = np.asarray(Image.open(REAL).convert('RGB'), dtype=np.float32)
    for name, (x0, y0, x1, y1), src, low in LABELS:
        sx0, sy0, sx1, sy1 = src or (x0, y0, x1, y1)
        p = SEARCH
        ref = A[y0 - p:y1 + p, x0 - p:x1 + p].mean(2)
        mov = T[sy0 - p:sy0 - p + ref.shape[0], sx0 - p:sx0 - p + ref.shape[1]].mean(2)
        dy, dx = shift(ref, mov) if src is None else (0, 0)
        if abs(dy) > p or abs(dx) > p:
            dy, dx = 0, 0
        s = T[sy0 - dy:sy0 - dy + (y1 - y0), sx0 - dx:sx0 - dx + (x1 - x0)].copy()
        d = A[y0:y1, x0:x1]
        for c in range(3):                                   # the real label takes J's bottle's colour
            g, o = np.polyfit(s[..., c].ravel(), d[..., c].ravel(), 1)
            s[..., c] = s[..., c] * g + o
        h, w = y1 - y0, x1 - x0
        m = np.ones((h, w), np.float32)
        if low:
            m[low - y0:] = 0
        e = 10                                               # its edges stay J's: a 10 px ramp inside the box
        xs, ys = np.arange(w), np.arange(h)
        r = np.minimum(np.minimum(xs, xs[::-1])[None, :], np.minimum(ys, ys[::-1])[:, None])
        m = (m * np.clip(r / e, 0, 1))[..., None]
        A[y0:y1, x0:x1] = d * (1 - m) + s * m
        print(f'{name}: real label from ({sx0 - dx},{sy0 - dy}), shift {dx},{dy}')
    for x0, y0, x1, y1 in BLUR_LABELS:
        soften(A, x0, y0, x1, y1, 8)


def soften(A, X0, Y0, X1, Y1, r=16):
    pad = 24
    z = ndimage.gaussian_filter(A[Y0 - pad:Y1 + pad, X0 - pad:X1 + pad], (SOFT_SIGMA, SOFT_SIGMA, 0))[pad:-pad, pad:-pad]
    xs, ys = np.arange(X1 - X0), np.arange(Y1 - Y0)
    w = np.minimum(np.minimum(xs, xs[::-1])[None, :], np.minimum(ys, ys[::-1])[:, None])
    w = np.clip(w / r, 0, 1).astype(np.float32)[..., None]
    A[Y0:Y1, X0:X1] = A[Y0:Y1, X0:X1] * (1 - w) + z * w


def hp(a):
    return a - ndimage.gaussian_filter(a, (2, 2, 0))


def main():
    cur = IN
    for k, ((x, y), seed, (x0, y0, x1, y1)) in WORDS.items():
        band = np.zeros((5464, 8192), np.uint8); band[y0:y1, x0:x1] = 255
        bf = WORK + f'band-{k}.png'; Image.fromarray(band).save(bf)
        nxt = WORK + f'after-{k}.png'
        subprocess.run([PY, os.path.join(HERE, 'band_paste.py'), cur, WORK + f'{k}/{k}_s{seed}.png', f'{x},{y}', bf, nxt],
                       check=True, env=dict(os.environ, FIT='1'))
        cur = nxt
    A = np.asarray(Image.open(cur).convert('RGB'), dtype=np.float32)
    labels(A)
    for b in SOFT:
        soften(A, *(round(v * K) for v in b))                # a 16 px ramp so the edge of the softened box never shows
    # the photographer's grain over every pixel that is not his (6e's mask, soft edge as clean_master gives it)
    sys.path.insert(0, HERE)
    import clean_master
    m, _, _ = clean_master.mask('6e')
    M = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((8192, 5464), Image.BILINEAR), dtype=np.float32) / 255
    M = ndimage.gaussian_filter(M, 10)
    O = np.asarray(Image.open(clean_master.ORIG + clean_master.PHOTOS['6e'][2]).convert('RGB'), dtype=np.float32)
    X0, Y0, X1, Y1 = (round(v * K) for v in WALL)
    g_real, g_now = hp(O[Y0:Y1, X0:X1]).std(), hp(A[Y0:Y1, X0:X1]).std()
    del O
    sd = float(np.sqrt(max(g_real ** 2 - g_now ** 2, 0)))
    rng = np.random.default_rng(69006)
    n = rng.normal(0, sd, A.shape[:2] + (1,)).astype(np.float32) * 0.8 + rng.normal(0, sd * 0.6, A.shape).astype(np.float32) * 0.6
    A = A + n * M[..., None]
    print('grain: real', round(float(g_real), 2), 'master before', round(float(g_now), 2), '-> added sd', round(sd, 2))
    Image.fromarray(np.clip(A, 0, 255).round().astype(np.uint8)).save(OUT, quality=96, subsampling=0)
    print('->', OUT)


if __name__ == '__main__':
    main()
