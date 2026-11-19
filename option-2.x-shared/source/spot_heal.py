"""Heal small specks a removal model left on a plain surface (task a8c429a3): each spot (x, y, radius in full-size pixels)
takes the surface's smooth tone from the ring around it (normalized blur, the spot itself left out) and its fine grain from
the same-size patch just beside it, so the healed spot keeps the photo's grain. Every pixel outside the spots is unchanged.

  spot_heal.py PHOTO OUT x,y,r[,dx,dy] [...]
  (with dx,dy the spot is cloned from the plain surface at that offset instead, e.g. 0,-32 for the wall just above: for a
  spot beside a bright object, whose ring would lend the fill its colour)"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
P, OUT = sys.argv[1:3]
photo = np.asarray(Image.open(P).convert('RGB')).copy()
for spec in sys.argv[3:]:
    v = list(map(int, spec.split(',')))
    x, y, r = v[:3]
    if len(v) == 5:
        dx, dy = v[3:]
        R = r + 4
        yy, xx = np.mgrid[y - R:y + R + 1, x - R:x + R + 1]
        w = np.clip((r + 2 - np.hypot(yy - y, xx - x)) / 3, 0, 1)[..., None]
        dst = photo[y - R:y + R + 1, x - R:x + R + 1].astype(np.float64)
        src = photo[y - R + dy:y + R + 1 + dy, x - R + dx:x + R + 1 + dx].astype(np.float64)
        photo[y - R:y + R + 1, x - R:x + R + 1] = np.clip(dst * (1 - w) + src * w + 0.5, 0, 255).astype(np.uint8)
        continue
    R = 4 * r
    y0, y1, x0, x1 = max(0, y - R), min(photo.shape[0], y + R + 1), max(0, x - R), min(photo.shape[1], x + R + 1)
    win = photo[y0:y1, x0:x1].astype(np.float64)
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.hypot(yy - y, xx - x)
    spot = d <= r
    keep = (~spot).astype(np.float64)
    smooth = np.stack([ndi.gaussian_filter(win[..., c] * keep, r) / np.maximum(ndi.gaussian_filter(keep, r), 1e-6) for c in range(3)], -1)
    hp = win - np.stack([ndi.gaussian_filter(win[..., c], 2) for c in range(3)], -1)
    grain = np.roll(hp, (0, -2 * r - 2), (0, 1))          # the patch just to the right
    w = np.clip((r + 2 - d) / 3, 0, 1)[..., None]         # a 3 px soft edge
    win = win * (1 - w) + (smooth + grain) * w
    photo[y0:y1, x0:x1] = np.clip(win + 0.5, 0, 255).astype(np.uint8)
Image.fromarray(photo).save(OUT)
print({'out': OUT, 'spots': len(sys.argv) - 3})
