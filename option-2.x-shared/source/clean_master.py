"""Full-size masters of the client's cleaned salon photos (task b1dd24c9).

The site shows three photos the way the client asked them cleaned (her list on the 19 Oct stream, 1:36-1:51: the halo
light, the trash cans and hair vacuum, the brooms, only litre bottles, the colour bar tidied). Those clean copies were
whole-frame re-renders at 1280 px, too small for the full-bleed steps on a 6K screen. Here each master is the
photographer's full-size original, with the clean copy's pixels only where the clutter was:

  1. mask: the clean copy is colour-fitted to the 1280 photo and the two are compared; what differs strongly and is big
     enough is the removed clutter (KEEP boxes protect what the re-render merely redrew, such as a poster's face)
  2. the clean copy, upscaled 4x on SeedVR2 (local), is fitted to the original's colour around each patch and blended in
     with a soft edge; every other pixel is the original's

  ~/StoryForge/ComfyUI/.venv/bin/python option-2.x-shared/source/clean_master.py <key> [--mask-only]   (key: 10, 11, 6)
Masks and previews go to MASTERS/check/, the master to MASTERS/<n>-clean.jpg (read by export_photos.py).
"""
import os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

Image.MAX_IMAGE_PIXELS = None
PH = os.environ.get('SALON_PHOTOS', '/Users/j/all-worktrees/salon-om-website-b9a04e51/resources/salon-photos/')
ORIG = PH + 'originals/'
MASTERS = os.environ.get('SALON_MASTERS', '/Users/j/all-worktrees/salon-om-pictures/masters/')
# key: (1280 photo, clean copy, original, SeedVR2 4x of the clean copy, threshold, KEEP boxes, ADD boxes), boxes in 1280 px as
# x0,y0,x1,y1; ADD covers clutter the clean copy removed that differs too softly for the threshold
PHOTOS = {
    '10': ('10-color-bar.jpg', '10-color-bar-clean.png', '10-color-bar-5B3A1078.jpg', 'sr/10c.png', 55, [], [(0, 270, 110, 854), (110, 345, 335, 470), (110, 470, 430, 854), (690, 640, 990, 790)]),   # the mop's strip at the left edge; the counter's left end below the hanging tubes as one block (the re-render moved the heater and faucet: a tight mask left a ghost of them; a block reaching the rack put the re-render's garbled labels on real boxes, 17 Nov); pump bottle, glass, cups
    '11': ('11-styling-stations.jpg', '11-styling-stations-clean.png', '11-styling-stations-5B3A1083.jpg', 'sr/11c.png', 55, [], [(50, 735, 250, 1240)]),   # the cart's legs over the black mat
    '6': ('6-shampoo-basins.jpg', '6-shampoo-basins-clean.png', '6-shampoo-basins-5B3A1072.jpg', 'sr/6c.png', 55, [(590, 185, 745, 300), (865, 95, 1085, 245)], [(600, 300, 710, 395), (895, 240, 1040, 370), (840, 55, 1060, 118), (995, 245, 1280, 854), (1085, 0, 1280, 245)]),   # KEEP both shelves with their real bottles (the clean copy's 'litre bottles only' wrote fake brand text, ACTEDA, readable at 1:1, 18 Nov); ADD whole blocks (a tight mask left ghosts): the two wire racks, the lamp's arc over the cabinet, and the right side (the lamp's pole, the hair vacuum, the blurred foreground). Where the lamp crosses the real bottles it is removed by a local edit after this (lamp_over_shelf.py)
}
OUT = {'10': '10-color-bar-clean.jpg', '11': '11-styling-stations-clean.jpg', '6': '6-shampoo-basins-clean.jpg'}


def fit(src, ref, w=None):
    """per-channel gain and offset taking src onto ref (over the pixels w selects)"""
    out = src.copy()
    for c in range(3):
        a, b = src[..., c], ref[..., c]
        if w is not None: a, b = a[w], b[w]
        k, o = np.polyfit(a.ravel(), b.ravel(), 1)
        out[..., c] = src[..., c] * k + o
    return out


def mask(key):
    p, c, _, _, t, keep, add = PHOTOS[key]
    P = np.asarray(Image.open(PH + p).convert('RGB'), dtype=np.float64)
    C = np.asarray(Image.open(PH + c).convert('RGB').resize((P.shape[1], P.shape[0]), Image.LANCZOS), dtype=np.float64)
    C = fit(C, P)
    d = np.abs(ndimage.gaussian_filter(P, (2, 2, 0)) - ndimage.gaussian_filter(C, (2, 2, 0))).max(2)
    m = d > t
    lab, n = ndimage.label(m)
    area = ndimage.sum(m, lab, range(1, n + 1))
    m = np.isin(lab, 1 + np.nonzero(area >= 150)[0])          # small specks are the re-render's noise, not clutter
    m = ndimage.binary_closing(m, iterations=4)
    m = ndimage.binary_fill_holes(m)
    m = ndimage.binary_dilation(m, iterations=9)          # margin: the re-render shifts edges a little (a 5 px margin left ghosts)
    for x0, y0, x1, y1 in add:
        m[y0:y1, x0:x1] = True
    for x0, y0, x1, y1 in keep:
        m[y0:y1, x0:x1] = False
    return m, P, C


def preview(key, m, P, C):
    os.makedirs(MASTERS + 'check', exist_ok=True)
    over = P.copy(); over[m] = over[m] * .45 + np.array([255, 40, 40]) * .55
    side = np.concatenate([over, np.full((P.shape[0], 10, 3), 255.), C], 1)
    Image.fromarray(np.clip(side, 0, 255).astype(np.uint8)).save(f'{MASTERS}check/mask-{key}.jpg', quality=88)
    Image.fromarray((m * 255).astype(np.uint8)).save(f'{MASTERS}check/mask-{key}.png')
    print(key, 'mask', int(m.sum()), 'px of', m.size, f'({100 * m.mean():.1f} %)')


def master(key, m):
    _, _, o, sr, _, _, _ = PHOTOS[key]
    O = Image.open(ORIG + o).convert('RGB')
    S = np.asarray(Image.open(MASTERS + sr).convert('RGB').resize(O.size, Image.LANCZOS), dtype=np.float32)
    # the upscaler invents texture on flat surfaces (streaks on a plain painted wall, 17 Nov): its detail is kept only where
    # the clean copy itself has structure (an object's edges); elsewhere the patch is the clean copy smoothly enlarged
    L = np.asarray(Image.open(PH + PHOTOS[key][1]).convert('RGB').resize(O.size, Image.LANCZOS), dtype=np.float32)
    g = Image.open(PH + PHOTOS[key][1]).convert('L')
    g = np.asarray(g, dtype=np.float32)
    edge = np.hypot(ndimage.sobel(g, 0), ndimage.sobel(g, 1))
    edge = ndimage.gaussian_filter(np.clip((edge - 20) / 60, 0, 1), 1.5)
    edge = np.asarray(Image.fromarray((edge * 255).astype(np.uint8)).resize(O.size, Image.BILINEAR), dtype=np.float32)[..., None] / 255
    S = L + (S - L) * edge
    del L
    O = np.asarray(O, dtype=np.float32)
    M = np.asarray(Image.fromarray((m * 255).astype(np.uint8)).resize((O.shape[1], O.shape[0]), Image.BILINEAR), dtype=np.float32) / 255
    hard = M > .5
    ring = ndimage.binary_dilation(hard[::4, ::4], iterations=12) & ~ndimage.binary_dilation(hard[::4, ::4], iterations=3)
    S = fit(S, O, np.repeat(np.repeat(ring, 4, 0), 4, 1)[:O.shape[0], :O.shape[1]])   # the patch takes the original's colour
    a = ndimage.gaussian_filter(M, 10)[..., None]                                       # a soft 10 px edge at full size
    out = O * (1 - a) + S * a
    Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)).save(MASTERS + OUT[key], quality=96, subsampling=0)
    print(key, '->', MASTERS + OUT[key], O.shape[1::-1])


if __name__ == '__main__':
    key = sys.argv[1]
    m, P, C = mask(key)
    preview(key, m, P, C)
    if '--mask-only' not in sys.argv:
        master(key, m)
