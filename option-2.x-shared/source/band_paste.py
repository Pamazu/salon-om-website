"""Paste an object-removal edit into a photo over a whole band (task b1dd24c9): every pixel of the band comes from the
edit, so nothing of the object survives (its tip over a dark poster, its light rims); the edit's tone is matched to the
untouched photo in a ring just outside the band (low frequencies of edit - photo, spread into the band), and the band's
edge is feathered. Every pixel outside the band and its feather stays the photo's.
  band_paste.py PHOTO EDIT X,Y BAND OUT"""
import sys, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
P, E, XY, B, OUT = sys.argv[1:6]
x, y = map(int, XY.split(','))
full = np.asarray(Image.open(P).convert('RGB')).copy()
e = np.asarray(Image.open(E).convert('RGB')).astype(np.float64) / 255
h, w = e.shape[:2]
o = full[y:y + h, x:x + w].astype(np.float64) / 255
band = ndi.binary_dilation(np.asarray(Image.open(B).convert('L'))[y:y + h, x:x + w] > 127, iterations=8)
ring = ndi.binary_dilation(band, iterations=40) & ~ndi.binary_dilation(band, iterations=10)
W = ndi.gaussian_filter(ring.astype(float), 40) + 1e-9
corr = np.stack([ndi.gaussian_filter((e[..., c] - o[..., c]) * ring, 40) / W for c in range(3)], 2)
e2 = np.clip(e - corr, 0, 1)
a = np.clip(ndi.gaussian_filter(band.astype(float), 5) * 1.6, 0, 1)
a[band & ndi.binary_erosion(band, iterations=8)] = 1
# fade to the photo over the crop's last 8 px, so no crop border shows as a tone step
r = np.minimum.outer(np.minimum(np.arange(h), np.arange(h)[::-1]), np.minimum(np.arange(w), np.arange(w)[::-1]))
a = a * np.clip(r / 8, 0, 1)
# optional KEEP_ABOVE=slope,intercept: a straight edge of the room (the cabinet's underside) stays the photo's above it
if len(sys.argv) > 6:
    k, c = map(float, sys.argv[6].split(','))
    yy, xx = np.mgrid[y:y + h, x:x + w]
    a = a * np.clip((yy - (k * xx + c)) / 3, 0, 1)
# optional LEFT_RAMP px: this edit fades in from its left border over that width (a seam with a paste on its left)
if len(sys.argv) > 7:
    a = a * np.clip(np.arange(w)[None, :] / float(sys.argv[7]), 0, 1)
a = a[..., None]
out = o * (1 - a) + e2 * a
full[y:y + h, x:x + w] = np.round(out * 255).astype(np.uint8)
Image.fromarray(full).save(OUT)
print(json.dumps({'out': OUT, 'band_px': int(band.sum()), 'changed_px': int((np.abs(out - o).max(2) > 1 / 255).sum())}))
