"""Procedural, copyright-free textures for the Salon OM site.
Everything is generated from noise and geometry here; no photographs are used."""
import math, os, sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/site/img'
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], float) / 255

def value_noise(h, w, cell):
    gh, gw = max(2, int(math.ceil(h / cell)) + 3), max(2, int(math.ceil(w / cell)) + 3)
    g = rng.random((gh, gw))
    z = ndimage.zoom(g, (cell, cell), order=3, mode='wrap')
    return z[:h, :w]

def fbm(h, w, cell, octaves=5, gain=0.5):
    out = np.zeros((h, w)); amp = 1.0; tot = 0
    for _ in range(octaves):
        out += amp * value_noise(h, w, max(1, cell)); tot += amp
        amp *= gain; cell = cell / 2
    out /= tot
    return (out - out.min()) / (np.ptp(out) + 1e-9)

def save(arr, name, q=80):
    im = Image.fromarray(np.clip(arr * 255, 0, 255).astype(np.uint8))
    im.save(os.path.join(OUT, name), 'WEBP', quality=q, method=6)
    print(name, im.size, os.path.getsize(os.path.join(OUT, name)) // 1024, 'KB')

def tint(gray, dark, light):
    return dark[None, None, :] + (light - dark)[None, None, :] * gray[..., None]

# ---------- palm-frond shadow mask ----------
def palm_shadow(w, h, fronds, blur):
    S = 2
    im = Image.new('L', (w * S, h * S), 0); d = ImageDraw.Draw(im)
    for (x0, y0, ang, length, curl, leaf) in fronds:
        pts = []
        for i in range(60):
            t = i / 59
            a = math.radians(ang + curl * t * t)
            if i == 0: x, y = x0 * S, y0 * S
            else:
                x += math.cos(a) * length * S / 59; y += math.sin(a) * length * S / 59
            pts.append((x, y, a, t))
        d.line([(p[0], p[1]) for p in pts], fill=255, width=int(6 * S))
        for (x, y, a, t) in pts[4::2]:
            L = leaf * S * (0.35 + 0.65 * math.sin(math.pi * min(1, t * 1.1))) * (1 - 0.25 * t)
            for side in (-1, 1):
                b = a + side * math.radians(58 - 18 * t) + rng.normal(0, 0.05)
                ex, ey = x + math.cos(b) * L, y + math.sin(b) * L
                nx, ny = -math.sin(b), math.cos(b)
                wdt = (5.5 + 3 * (1 - t)) * S
                poly = [(x + nx * wdt * .3, y + ny * wdt * .3), ((x + ex) / 2 + nx * wdt, (y + ey) / 2 + ny * wdt), (ex, ey),
                        ((x + ex) / 2 - nx * wdt, (y + ey) / 2 - ny * wdt), (x - nx * wdt * .3, y - ny * wdt * .3)]
                d.polygon(poly, fill=255)
    im = im.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(blur))
    return np.asarray(im, float) / 255

def plaster(w, h, base, shade, fronds, blur=9, light=True, strength=0.30):
    mott = fbm(h, w, 260, 6)
    fine = fbm(h, w, 6, 3)
    trowel = fbm(h, w, 90, 4)
    g = 0.55 + 0.18 * (mott - .5) + 0.10 * (trowel - .5) + 0.05 * (fine - .5)
    col = tint(np.clip(g, 0, 1), hexrgb(shade), hexrgb(base) * 1.04)
    yy, xx = np.mgrid[0:h, 0:w] / max(w, h)
    if light:  # a warm slant of sun across the wall
        sun = np.clip(1.15 - np.abs((xx * 0.8 + yy * 0.6) - 0.55) * 2.6, 0, 1) ** 1.6
        col = col * (0.90 + 0.14 * sun[..., None]) + np.array([0.025, 0.015, 0])[None, None, :] * sun[..., None]
    sh = palm_shadow(w, h, fronds, blur)
    col = col * (1 - strength * sh[..., None] * np.array([1.0, 1.02, 1.08])[None, None, :])
    return np.clip(col, 0, 1)

# 1. ivory plaster, palm shadow falling from the top right (portrait)
W, H = 1200, 1500
fronds = [(1280, -60, 150, 1250, 30, 260), (1300, 380, 168, 980, 22, 230), (980, -120, 118, 900, -26, 210)]
save(plaster(W, H, '#F4EEE6', '#DCD1C2', fronds, blur=10, strength=0.26), 'plaster-palm.webp')

# 2. sage-washed plaster with a softer frond (cards, botanical)
fronds2 = [(-80, 200, 20, 1150, -24, 240), (-60, 820, -8, 900, 26, 210)]
save(plaster(1200, 900, '#C9CDBB', '#9FA88F', fronds2, blur=14, strength=0.22, light=True), 'sage-frond.webp')

# 3. sand ripples under raking light (landscape)
W, H = 1600, 1200
yy, xx = np.mgrid[0:H, 0:W].astype(float)
warp = fbm(H, W, 520, 4) * 140 + fbm(H, W, 160, 3) * 30 + fbm(H, W, 40, 2) * 5
scale = 30.0 * (1 + 0.35 * (fbm(H, W, 600, 3) - .5))
phase = (yy * 0.92 + xx * 0.30 + warp) / scale
saw = phase - np.floor(phase)
ripple = np.where(saw < 0.72, saw / 0.72, (1 - saw) / 0.28)
breakup = fbm(H, W, 70, 3)
ripple = ripple * (0.55 + 0.45 * np.clip((breakup - 0.25) * 2, 0, 1))  # crests fade and fork
ripple = ndimage.gaussian_filter(ripple, 2.2)
gy, gx = np.gradient(ripple)
shade = np.clip(0.5 + 12 * (-gx * 0.40 - gy * 0.92), 0, 1)
grain = ndimage.gaussian_filter(rng.random((H, W)), 0.7)
speck = ndimage.gaussian_filter((rng.random((H, W)) > 0.996).astype(float), 0.8) * 3
lum = 0.60 + 0.16 * (shade - .5) + 0.16 * (grain - .5) + 0.10 * (fbm(H, W, 500, 3) - .5) - 0.10 * np.clip(speck, 0, 1)
col = tint(np.clip(lum, 0, 1), hexrgb('#B39C80'), hexrgb('#F2E8DA'))
save(col, 'sand-ripples.webp', q=84)

# 4. linen: a fine plain weave with slubs and a soft fold of light
W, H = 1200, 1200
rows = ndimage.gaussian_filter1d(rng.random(H), 0.8)[:, None] * np.ones((1, W))
cols = ndimage.gaussian_filter1d(rng.random(W), 0.8)[None, :] * np.ones((H, 1))
yy, xx = np.mgrid[0:H, 0:W].astype(float)
weave = 0.5 + 0.5 * np.sin(xx * math.pi / 2.2) * np.sin(yy * math.pi / 2.2)
slub = ndimage.gaussian_filter(rng.random((H, W)), (0.6, 14)) + ndimage.gaussian_filter(rng.random((H, W)), (14, 0.6))
fold = np.sin((xx * 0.6 + yy * 0.35) / 160 + fbm(H, W, 400, 3) * 3)
lum = 0.66 + 0.10 * (rows - .5) + 0.10 * (cols - .5) + 0.05 * (weave - .5) + 0.6 * (slub - slub.mean()) + 0.07 * fold
col = tint(np.clip(lum, 0, 1), hexrgb('#CFC2B1'), hexrgb('#F5EFE7'))
save(col, 'linen.webp')

# 5. travertine stone: layered bands and small pores
W, H = 1200, 1200
yy, xx = np.mgrid[0:H, 0:W].astype(float)
bands = fbm(H, W, 300, 5)
layers = np.sin((yy + 120 * bands + 40 * fbm(H, W, 80, 3)) / 26.0) * 0.5 + 0.5
pores = (fbm(H, W, 10, 2) > 0.80).astype(float)
pores = ndimage.binary_opening(pores, iterations=1).astype(float)
pores = ndimage.gaussian_filter(pores, (0.8, 2.2))
lum = 0.62 + 0.10 * (layers - .5) + 0.12 * (bands - .5) - 0.22 * pores + 0.04 * (rng.random((H, W)) - .5)
col = tint(np.clip(lum, 0, 1), hexrgb('#A79A8A'), hexrgb('#E9E1D5'))
save(col, 'stone.webp')

