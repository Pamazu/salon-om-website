"""Put a real object back after a removal paste took it too (task a8c429a3): inside the object's outline, given as boxes of
its parts (full-size pixels), every pixel is the photo's own from BEFORE the paste, with a 1.5 px soft edge; every other
pixel is AFTER's. Used when a model removed what it was asked to keep (a real bottle beside the removed ones).

  keep_real.py BEFORE AFTER OUT x0,y0,x1,y1 [x0,y0,x1,y1 ...]"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
Image.MAX_IMAGE_PIXELS = None
BEFORE, AFTER, OUT = sys.argv[1:4]
boxes = [tuple(map(int, a.split(','))) for a in sys.argv[4:]]
b = np.asarray(Image.open(BEFORE).convert('RGB'))
a = np.asarray(Image.open(AFTER).convert('RGB')).copy()
X0, Y0 = min(x[0] for x in boxes) - 8, min(x[1] for x in boxes) - 8
X1, Y1 = max(x[2] for x in boxes) + 8, max(x[3] for x in boxes) + 8
m = np.zeros((Y1 - Y0, X1 - X0))
for x0, y0, x1, y1 in boxes:
    m[y0 - Y0:y1 - Y0, x0 - X0:x1 - X0] = 1
w = ndi.gaussian_filter(m, 1.5)[..., None]
a[Y0:Y1, X0:X1] = (b[Y0:Y1, X0:X1] * w + a[Y0:Y1, X0:X1] * (1 - w) + 0.5).astype(np.uint8)
Image.fromarray(a).save(OUT)
print({'out': OUT, 'boxes': len(boxes)})
