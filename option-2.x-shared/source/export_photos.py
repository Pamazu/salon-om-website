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

# site picture -> its master, and the check that no picture shows a cleaned place raw: photo_sources.py (task a8c429a3)
from photo_sources import SOURCE, check as check_clean
NEW = {'film-hero-forest.webp', 'film-air-curtains.webp'}      # no site file yet: the 1280 fallback is made from the master first
# a master that is a real photo (a cleaned copy '-clean.jpg', or a generated guest pasted onto it '-on-photo.png') keeps the
# photo's grain, so it gets the same blur as an original
PHOTO_MASTER = ('-clean.jpg', '-on-photo.png')
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


def used_by_frozen():
    """every img/ file the frozen pages 2.2-2.4 show: those files never change"""
    import re
    out = set()
    for k in ('2.2', '2.3', '2.4'):
        p = REPO + f'option-{k}/site/index.html'
        if os.path.exists(p):
            out |= set(re.findall(r'img/([a-z0-9-]+\.webp)', open(p).read()))
    return out


def master(name):
    kind, f = SOURCE[name].split(':', 1)
    p = (ORIG if kind == 'o' else MASTERS) + f
    return p if os.path.exists(p) else None


def export(name, dry=False):
    p = master(name)
    if not p:
        return f'{name}: no master yet ({SOURCE[name]})'
    m = Image.open(p)
    if not os.path.exists(IMG + name) and (name in NEW or name.startswith('om-')):
        # a new picture only M, G and S show (a film's still, a new generated picture): its master makes its 1280 fallback first
        m.convert('RGB').resize((1280, round(m.height * 1280 / m.width)), Image.LANCZOS).save(IMG + name, quality=84, method=6)
    ref = Image.open(IMG + name)
    if (m.width > m.height) != (ref.width > ref.height):
        return f'{name}: master {m.size} does not match the site file {ref.size}'
    need = int(needed(name) * 1.05)          # 5 % for the slow Ken Burns zoom the measure may have caught short of its peak
    ws = widths(need, m.width)
    if dry:
        return f'{name}: master {m.size}, need {need} px -> {ws}'
    m = m.convert('RGB')
    if SOURCE[name].startswith('o:') or SOURCE[name].endswith(PHOTO_MASTER):
        m = m.filter(ImageFilter.GaussianBlur(GRAIN_BLUR))
    fitted, before = fit_colour(m, ref)
    frozen = name in used_by_frozen()
    if before < 20:
        m = fitted                            # the same picture: keep the site file's grade
    elif frozen:
        return f'{name}: master differs from the site file (mean {before:.1f}) and 2.2-2.4 show that file: not exported'
    if not frozen:
        # only M, G and S show this picture, so its fallback is the new picture too (task a8c429a3: a cleaned picture's 1280
        # file kept the clutter while its ladder had none); 2.2-2.4's files never change
        m.resize(ref.size, Image.LANCZOS).save(IMG + name, quality=84, method=6)
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
    bad = check_clean()
    if bad:
        sys.exit('not exported: a picture shows a cleaned place raw, or is undeclared (task a8c429a3):\n  ' + '\n  '.join(bad))
    names = [a for a in sys.argv[1:] if not a.startswith('--')] or list(SOURCE)
    for n in names:
        print(export(n, dry='--dry' in sys.argv))
