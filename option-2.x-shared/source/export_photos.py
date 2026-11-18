"""Sharp pictures for M, G and S at every screen size (task b1dd24c9; J 17 Nov, approved features row 18: "sharp at its
display size on J's largest screen ... never upscaled soft").

Each picture the pages show gets a ladder of widths in option-2.2/site/img/hd/<name>-<w>.webp, made from its master (the
photographer's original, a cleaned full-size copy of it, or a generated picture's full-size render), up to the widest the
page ever draws it (photo_sizes.json, measured by qa/sharpness.mjs --manifest, times the screen's pixel ratio). build.py
then gives each <img> its srcset and sizes, so a phone loads a small file and J's 6K screen a full one. The page's own
img/<name>.webp stays as the fallback, and 2.2-2.4 never change (they do not read img/hd/).

Each export keeps the look of the file it replaces: its colour is fitted, channel by channel, to the current img/<name>.webp
(a grade made for the site, such as the Inner Work copies, carries over). The originals are not in git (photos of people,
StoryLegal's client-photo conditions; 30-55 MB each); only the exports are.

  ~/StoryForge/ComfyUI/.venv/bin/python option-2.x-shared/source/export_photos.py [name ...] [--dry]
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageFilter

Image.MAX_IMAGE_PIXELS = None
V = os.path.dirname(os.path.abspath(__file__)) + '/'
REPO = os.path.abspath(V + '../..') + '/'
IMG = REPO + 'option-2.2/site/img/'
ORIG = os.environ.get('SALON_ORIGINALS', '/Users/j/all-worktrees/salon-om-website-b9a04e51/resources/salon-photos/originals/')
MASTERS = os.environ.get('SALON_MASTERS', '/Users/j/all-worktrees/salon-om-pictures/masters/')

# site picture -> its master. 'o:' = the photographer's original (README in ORIG maps the numbers), 'm:' = a master made
# here (a cleaned full-size original per the client's own list, or a generated picture's full-size render)
SOURCE = {
    'real-team-of-three.webp': 'o:9-team-of-three-5B3A1134.jpg',
    'real-aveda-shelves.webp': 'o:7-aveda-product-shelves-5B3A1050.jpg',     # Why Aveda (task a749167b)
    'real-lounge.webp': 'o:2-lounge-fireplace-5B3A1048.jpg',
    'real-lounge-iw.webp': 'o:2-lounge-fireplace-5B3A1048.jpg',
    'real-maggie-arms-crossed.webp': 'o:3-portrait-arms-crossed-5B3A1343.jpg',
    'real-maggie-portrait-iw.webp': 'o:3-portrait-arms-crossed-5B3A1343.jpg',
    'real-maggie-fireplace.webp': 'o:5-portrait-seated-fireplace-5B3A1413.jpg',
    'real-maggie-outdoor.webp': 'o:13-portrait-outdoor-white-blazer-5B3A1353.jpg',
    'real-maggie-standing-shelves.webp': 'o:14-portrait-standing-shelves-5B3A1319.jpg',
    'real-color-bar.webp': 'm:10-color-bar-clean.jpg',
    'real-shampoo-basins.webp': 'm:6-shampoo-basins-clean.jpg',
    'real-styling-stations.webp': 'm:11-styling-stations-clean.jpg',
    'om-menu-signature-color.webp': 'm:om-menu-signature-color.png',
    'om-menu-blonding.webp': 'm:om-menu-blonding.png',
    'om-menu-color-correction.webp': 'm:om-menu-color-correction.png',
    'om-menu-cut-and-style.webp': 'm:om-menu-cut-and-style.png',
    'om-menu-extensions.webp': 'm:om-menu-extensions.png',
    'om-menu-finishing-touches.webp': 'm:om-menu-finishing-touches.png',
    'meadow.webp': 'm:meadow.png',
    # the two heroes' stills while the films are off (build.FILMS_SHOWN, task 5479dd6c): the sharpest frame of the film, upscaled
    # x4 (SeedVR2 or Real-ESRGAN on the Mac Studio); the master PNG lives with the other masters, not in git
    'film-hero-forest.webp': 'm:film-hero-forest.png',
    'film-air-curtains.webp': 'm:film-air-curtains.png',
}
NEW = {'film-hero-forest.webp', 'film-air-curtains.webp'}      # no site file yet: the 1280 fallback is made from the master first
# a photo's own sensor grain costs half its bytes at 45 MP: a 0.9 px blur on the full-size original removes the grain and keeps
# every edge and label sharp at 1:1 (lounge at 3840: 6.2 -> 2.9 MB, 17 Nov side by side); generated masters have no grain
GRAIN_BLUR = 0.9
QUALITY = 78
LADDER = [640, 960, 1280, 1920, 2560, 3840, 5120, 6400, 8192]
DPR = {'w3230': 2, 'w1440': 2, 'w390': 3}


def needed(name):
    """the widest file the pages need: the widest drawn CSS width on any page and viewport, times that screen's ratio"""
    sizes = json.load(open(V + 'photo_sizes.json'))
    return max((e[k] * DPR[k] for v in sizes.values() for n, e in v.items() if n == name for k in DPR if k in e), default=0)


def widths(need, have):
    top = min(need, have)
    w = [x for x in LADDER if x < top * .9]      # a step within 10 % of the top adds weight and no sharpness
    return w + [top]


def fit_colour(img, ref):
    """per-channel gain and offset that maps img (downscaled to ref's size) onto ref: keeps the site file's grade"""
    a = np.asarray(img.convert('RGB').resize(ref.size, Image.LANCZOS), dtype=np.float64).reshape(-1, 3)
    b = np.asarray(ref.convert('RGB'), dtype=np.float64).reshape(-1, 3)
    out = np.asarray(img.convert('RGB'), dtype=np.float64)
    for c in range(3):
        g, o = np.polyfit(a[:, c], b[:, c], 1)
        out[..., c] = out[..., c] * g + o
    return Image.fromarray(np.clip(out, 0, 255).round().astype(np.uint8)), float(np.abs(a - b).mean())


def master(name):
    kind, f = SOURCE[name].split(':', 1)
    p = (ORIG if kind == 'o' else MASTERS) + f
    return p if os.path.exists(p) else None


def export(name, dry=False):
    p = master(name)
    if not p:
        return f'{name}: no master yet ({SOURCE[name]})'
    if name in NEW and not os.path.exists(IMG + name):
        n = Image.open(p).convert('RGB'); n.resize((1280, round(n.height * 1280 / n.width)), Image.LANCZOS).save(IMG + name, quality=84, method=6)
    m, ref = Image.open(p), Image.open(IMG + name)
    if (m.width > m.height) != (ref.width > ref.height):
        return f'{name}: master {m.size} does not match the site file {ref.size}'
    need = int(needed(name) * 1.05)          # 5 % for the slow Ken Burns zoom the measure may have caught short of its peak
    ws = widths(need, m.width)
    if dry:
        return f'{name}: master {m.size}, need {need} px -> {ws}'
    m = m.convert('RGB')
    if SOURCE[name].startswith('o:') or SOURCE[name].endswith('-clean.jpg'):
        m = m.filter(ImageFilter.GaussianBlur(GRAIN_BLUR))
    fitted, before = fit_colour(m, ref)
    if before < 20:
        m = fitted                            # the same picture: keep the site file's grade
    elif name.startswith('om-menu-'):
        # a new picture (a menu guest redone): only M, G and S use these, so their fallback file is replaced too
        m.resize(ref.size, Image.LANCZOS).save(IMG + name, quality=84, method=6)
    else:
        return f'{name}: master differs from the site file (mean {before:.1f}) and is not a menu picture: not exported'
    os.makedirs(IMG + 'hd', exist_ok=True)
    stem = name[:-5]
    for w in ws:
        h = round(m.height * w / m.width)
        (m if w == m.width else m.resize((w, h), Image.LANCZOS)).save(f'{IMG}hd/{stem}-{w}.webp', quality=QUALITY, method=6)
    json.dump(dict(json.load(open(V + 'photo_exports.json')) if os.path.exists(V + 'photo_exports.json') else {}, **{name: ws}),
              open(V + 'photo_exports.json', 'w'), indent=1, sort_keys=True)
    open(V + 'photo_exports.json', 'a').write('\n')
    return f'{name}: {m.size} need {need} -> {ws} (colour fit, mean diff before {before:.1f})'


if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if not a.startswith('--')] or list(SOURCE)
    for n in names:
        print(export(n, dry='--dry' in sys.argv))
