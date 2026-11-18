"""Cinematic but realistic light on a finished picture, in code (task a8c429a3; J 18 Nov on the pause: "the camera angle is
boring (also the lighting)"; 17 Nov on b1dd24c9: cinematographic but realistic light). Nothing is redrawn: every pixel stays
the photo's, re-lit like a photographer's grade in the edit. A soft pool of key light on the subject, the light falling off
away from the window side, the corners settled down, a gentle S-curve and a touch of warmth where the key falls.

  cine_grade.py IN OUT --key X,Y [--radius R] [--pool 0.30] [--fall 0.35] [--side left|right] [--curve 0.10] [--warm 0.04]
X, Y and R are fractions of the picture (R of its diagonal). Stops are photographic: +0.30 = 0.30 stop brighter.
"""
import argparse
import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
a = argparse.ArgumentParser()
a.add_argument('inp'); a.add_argument('out')
a.add_argument('--key', required=True)
a.add_argument('--radius', type=float, default=.28)
a.add_argument('--pool', type=float, default=.30)      # stops added at the key's centre
a.add_argument('--fall', type=float, default=.35)      # stops taken away at the far side from the window
a.add_argument('--side', default='left')               # where the window light comes from
a.add_argument('--vignette', type=float, default=.35)  # stops taken away in the corners
a.add_argument('--curve', type=float, default=.10)     # S-curve strength on luminance
a.add_argument('--warm', type=float, default=.04)      # warmth added inside the pool (R up, B down, as a fraction)
o = a.parse_args()

im = Image.open(o.inp).convert('RGB')
x = np.asarray(im, dtype=np.float32) / 255
h, w = x.shape[:2]
kx, ky = (float(v) for v in o.key.split(','))
yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
diag = np.hypot(w, h)
d2 = ((xx - kx * w) ** 2 + (yy - ky * h) ** 2) / (o.radius * diag) ** 2
pool = np.exp(-d2 / 2)                                              # 1 at the key, falling softly
across = (xx / w) if o.side == 'left' else (1 - xx / w)             # 0 at the window side, 1 far from it
r = np.hypot(xx / w - .5, yy / h - .5) / np.hypot(.5, .5)
stops = o.pool * pool - o.fall * across ** 1.5 * (1 - pool) - o.vignette * np.clip((r - .55) / .45, 0, 1) ** 2
del xx, yy, d2, across, r
lin = x ** 2.2 * (2 ** stops)[..., None]                            # light adds in linear light, like a real lamp
x = np.clip(lin, 0, 1) ** (1 / 2.2)
del lin
lum = (x * np.array([.2126, .7152, .0722], np.float32)).sum(2, keepdims=True)
s = lum + o.curve * np.sin(2 * np.pi * lum) / (2 * np.pi) * -1      # S-curve: darks a little deeper, lights a little brighter
x = np.clip(x * (s / np.maximum(lum, 1e-4)), 0, 1)
x[..., 0] *= 1 + o.warm * pool
x[..., 2] *= 1 - o.warm * pool
Image.fromarray(np.clip(x * 255 + .5, 0, 255).astype(np.uint8)).save(o.out, **({'quality': 95, 'subsampling': 0} if o.out.endswith('.jpg') else {}))
print(o.out, (w, h), 'key', (kx, ky), 'stops', round(float(stops.min()), 2), '..', round(float(stops.max()), 2))
