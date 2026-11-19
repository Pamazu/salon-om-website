"""Soften a straight tonal edge a removal left on a plain wall (task a8c429a3): the ghost of a removed object's side, where its
shadow ended. Inside a box, the wall's broad tone is smoothed along one direction (sx across a vertical edge, sy across a
horizontal one) and the photo's own grain is kept; the box's edges are feathered, every pixel outside it is unchanged.

  tone_blend.py PHOTO OUT x0,y0,x1,y1 sx,sy   (full-size pixels; sigmas in pixels, e.g. 60,4 for a vertical edge)"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
P, OUT, BOX, S = sys.argv[1:5]
x0, y0, x1, y1 = map(int, BOX.split(','))
sx, sy = map(float, S.split(','))
photo = np.asarray(Image.open(P).convert('RGB')).copy()
M = int(3 * max(sx, sy))
X0, Y0, X1, Y1 = max(0, x0 - M), max(0, y0 - M), min(photo.shape[1], x1 + M), min(photo.shape[0], y1 + M)
win = photo[Y0:Y1, X0:X1].astype(np.float64)
low = ndi.gaussian_filter(win, (2, 2, 0))          # only the finest grain is kept: a sharp ghost edge is smoothed too
broad = ndi.gaussian_filter(low, (sy, sx, 0))
inside = np.zeros(win.shape[:2])
inside[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = 1
w = ndi.gaussian_filter(inside, 6)[..., None] * inside[..., None]
win = win + (broad - low) * w
photo[Y0:Y1, X0:X1] = np.clip(win + 0.5, 0, 255).astype(np.uint8)
Image.fromarray(photo).save(OUT)
print({'out': OUT, 'box': [x0, y0, x1, y1]})
