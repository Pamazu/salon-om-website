"""The footprint band of a removal edit, for band_paste.py (task a8c429a3): where the edit changed the photo (colour fitted
first, as band_paste's auto band), kept only inside the boxes that hold the removed items, so whatever else the model
redrew in its crop never reaches the photo. Writes a mask the size of the photo, and a preview of the crop with the band.

  band_mask.py PHOTO EDIT X,Y OUT [T=40] [close=6] box=x0,y0,x1,y1 [box=...] [cut=x0,y0,x1,y1 ...]
  (boxes in crop pixels; cut = an area never pasted, e.g. a real bottle the band must not touch; close = how far apart
  changed pieces may be and still join into one band, e.g. 25 behind a wire basket, so nothing of the item survives between
  its wires)"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
P, E, XY, OUT = sys.argv[1:5]
args = sys.argv[5:]
T = float(next((a[2:] for a in args if a.startswith('T=')), 40))
CLOSE = int(next((a[6:] for a in args if a.startswith('close=')), 6))
boxes = [tuple(map(int, a[4:].split(','))) for a in args if a.startswith('box=')]
cuts = [tuple(map(int, a[4:].split(','))) for a in args if a.startswith('cut=')]
x, y = map(int, XY.split(','))
photo = Image.open(P).convert('RGB')
W, H = photo.size
e = np.asarray(Image.open(E).convert('RGB')).astype(np.float64) / 255
h, w = e.shape[:2]
o = np.asarray(photo.crop((x, y, x + w, y + h))).astype(np.float64) / 255
ef = e.copy()
for c in range(3):
    g, b0 = np.polyfit(e[..., c].ravel(), o[..., c].ravel(), 1)
    ef[..., c] = e[..., c] * g + b0
d = np.abs(ndi.gaussian_filter(o, (2, 2, 0)) - ndi.gaussian_filter(ef, (2, 2, 0))).max(2) * 255
keep = np.zeros((h, w), bool)
for x0, y0, x1, y1 in boxes:
    keep[y0:y1, x0:x1] = True
m = (d > T) & keep
lab, n = ndi.label(m)
m = np.isin(lab, 1 + np.nonzero(ndi.sum(m, lab, range(1, n + 1)) >= 200)[0])
m = ndi.binary_fill_holes(ndi.binary_closing(np.pad(m, CLOSE), iterations=CLOSE)[CLOSE:-CLOSE, CLOSE:-CLOSE]) & keep
for x0, y0, x1, y1 in cuts:
    m[y0:y1, x0:x1] = False
full = np.zeros((H, W), np.uint8)
full[y:y + h, x:x + w] = m * 255
Image.fromarray(full).save(OUT)
prev = (o * 255).astype(np.uint8).copy()
edge = m ^ ndi.binary_erosion(m, iterations=3)
prev[edge] = (255, 0, 0)
Image.fromarray(prev).save(OUT.rsplit('.', 1)[0] + '-preview.png')
print({'out': OUT, 'band_px': int(m.sum())})
