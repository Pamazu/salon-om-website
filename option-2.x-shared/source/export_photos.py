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

  ~/StoryForge/ComfyUI/.venv/bin/python option-2.x-shared/source/export_photos.py [name ...] [--dry] [--cuts] [--previews]
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
import photo_sources
PHOTOS = os.path.abspath(V + '../../resources/salon-photos') + '/'
CHECKS = V + 'photo_checks.json'


def room(name, p):
    """a basins-room picture: its measure against J's 25 Oct picture (photo_sources.room_check), None for any other picture"""
    if name not in photo_sources.basins():
        return None
    f = SOURCE[name].split(':', 1)[1]
    return photo_sources.room_check(p, PHOTOS + photo_sources.J25_PICTURE, photo_sources.ROOM_CROP.get(f))


def stamp(name, d, files):
    """photo_checks.json: the files this export wrote for a basins picture, with their measure, read by the deploy gate (row 23)"""
    import hashlib
    c = json.load(open(CHECKS)) if os.path.exists(CHECKS) else {}
    c[name] = {'room': photo_sources.J25, 'measure': round(d, 3), 'bar': photo_sources.ROOM_BAR,
               'files': {os.path.relpath(f, IMG + '..'): hashlib.sha256(open(f, 'rb').read()).hexdigest() for f in sorted(files)}}
    json.dump(c, open(CHECKS, 'w'), indent=1, sort_keys=True)
    open(CHECKS, 'a').write('\n')
NEW = {'film-hero-forest.webp', 'film-air-curtains.webp', 'om-pause-rest.webp'}      # no site file yet: the 1280 fallback is made from the master first
# a master that is a real photo (a cleaned copy '-clean.jpg', or a generated guest pasted onto it '-on-photo.png') keeps the
# photo's grain, so it gets the same blur as an original
PHOTO_MASTER = ('-clean.jpg', '-on-photo.png', '-25oct.jpg')     # -25oct.jpg: J's basins picture on the photographer's frame, his grain
# a photo's own sensor grain costs half its bytes at 45 MP: a 0.9 px blur on the full-size original removes the grain and keeps
# every edge and label sharp at 1:1 (lounge at 3840: 6.2 -> 2.9 MB, 17 Nov side by side); generated masters have no grain
GRAIN_BLUR = 0.9
QUALITY = 78
LADDER = [640, 960, 1280, 1920, 2560, 3840, 5120, 6400, 8192]
DPR = {'w3230': 2, 'w1440': 2, 'w390': 3}
# a picture drawn in a frame of another shape ships only what the frame shows (task 1ff4c3f4): a step's portrait photo fills a
# landscape screen by its width (next.css .ch__top img: cover, object-position 50% 30%), so a screen 3:2 or wider shows at most
# its 4:3 band, cut where that object-position keeps it (top = 30 % of the height left over), which then frames exactly as the
# whole picture does at every such shape; mgs_parts.CUT_MEDIA gives it to those screens (measured at 3230 on 4G: the lounge's
# 4.6 MB came 9.6 s after its step). name -> (cut, its aspect, the object-position's y)
CUTS = {'real-lounge.webp': ('landscape', 4 / 3, .30), 'real-styling-stations.webp': ('landscape', 4 / 3, .30)}


def candidates():
    """a picture's Shift+V candidate -> the picture it stands in for (mgs_parts.PICTURE_OPTIONS, task 279db527)"""
    import mgs_parts
    return {o['img']: p.get('file', name) for name, p in mgs_parts.PICTURE_OPTIONS.items() for o in p.get('options') or []}     # file=: a step's entry (task f748d06c)


def needed(name):
    """the widest file the pages need: the widest drawn CSS width on any page and viewport, times that screen's ratio; a
    candidate is drawn at the size of the picture it stands in for"""
    sizes = json.load(open(V + 'photo_sizes.json'))
    name = candidates().get(name, name) if name not in {n for v in sizes.values() for n in v} else name
    # a section's other options count too (o3230 ...: sharpness.mjs measures each option the switcher offers, task a78e6208)
    return max((e[p + k[1:]] * DPR[k] for v in sizes.values() for n, e in v.items() if n == name for k in DPR for p in 'wo' if p + k[1:] in e), default=0)


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


# a picture's soft preview, carried inside the page (task 1ff4c3f4, J 20 Nov: "images take too long to load in the 5 steps section
# it needs to be instant"): on one 4G line the fourth step's photo alone needs 2 s or more, and on J's 6K a step's photo is
# decoded again as its step arrives (150 ms of black, filmed 20 Nov), so the photo stands on this, which is there from the
# page's first paint with no request; made from the picture's own smallest export, so it keeps its grade
PREVIEWS = V + 'photo_previews.json'
PREVIEW_W = 64                 # 64 px, softened and kept at quality 85: smooth at 6K (40 px at 55 showed blocks), ~1 KB


def preview(name):
    import base64, io
    src = next((p for p in (f'{IMG}hd/{name[:-5]}-640.webp', IMG + name) if os.path.exists(p)), None)
    if not src:
        return f'{name}: no file to preview'
    im = Image.open(src).convert('RGB')
    im = im.resize((PREVIEW_W, max(1, round(im.height * PREVIEW_W / im.width))), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.5))
    b = io.BytesIO()
    im.save(b, 'WEBP', quality=85, method=6)
    d = json.load(open(PREVIEWS)) if os.path.exists(PREVIEWS) else {}
    d[name] = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
    json.dump(d, open(PREVIEWS, 'w'), indent=1, sort_keys=True)
    open(PREVIEWS, 'a').write('\n')
    return f', preview {len(b.getvalue())} B'


def cut(name, m, ws):
    """the cut's ladder (CUTS), from the same prepared master as the picture's own, at the same widths; listed in
    photo_exports.json as '<name> <cut>'"""
    k, asp, oy = CUTS[name]
    ch = round(m.width / asp)
    y0 = round(oy * (m.height - ch))
    c = m.crop((0, y0, m.width, y0 + ch))
    for w in ws:
        (c if w == c.width else c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)).save(f'{IMG}hd/{name[:-5]}-{k}-{w}.webp', quality=QUALITY, method=6)
    json.dump(dict(json.load(open(V + 'photo_exports.json')), **{f'{name} {k}': ws}), open(V + 'photo_exports.json', 'w'), indent=1, sort_keys=True)
    open(V + 'photo_exports.json', 'a').write('\n')
    return f', {k} cut rows {y0}-{y0 + ch} of {m.height}'


def export(name, dry=False, cuts_only=False):
    p = master(name)
    if not p:
        return f'{name}: no master yet ({SOURCE[name]})'
    m = Image.open(p)
    if not os.path.exists(IMG + name) and (name in NEW or name.startswith('om-') or name in candidates()):
        # a new picture only M, G and S show (a film's still, a new generated picture): its master makes its 1280 fallback first
        m.convert('RGB').resize((1280, round(m.height * 1280 / m.width)), Image.LANCZOS).save(IMG + name, quality=84, method=6)
    ref = Image.open(IMG + name)
    if (m.width > m.height) != (ref.width > ref.height):
        return f'{name}: master {m.size} does not match the site file {ref.size}'
    need = int(needed(name) * 1.05)          # 5 % for the slow Ken Burns zoom the measure may have caught short of its peak
    ws = widths(need, m.width)
    d = room(name, p)
    if d is not None and not d >= photo_sources.ROOM_BAR:
        return (f'{name}: NOT exported: it shows the basins room and only {d:.0%} of its bottles are J\'s 25 Oct picture (bar '
                f'{photo_sources.ROOM_BAR:.0%}; task 69006a72)')
    if dry:
        return f'{name}: master {m.size}, need {need} px -> {ws}' + (f', room {d:.0%} J\'s' if d is not None else '')
    m = m.convert('RGB')
    if SOURCE[name].startswith('o:') or SOURCE[name].endswith(PHOTO_MASTER):
        m = m.filter(ImageFilter.GaussianBlur(GRAIN_BLUR))
    fitted, before = fit_colour(m, ref)
    frozen = name in used_by_frozen()
    if before < 20:
        m = fitted                            # the same picture: keep the site file's grade
    elif frozen:
        return f'{name}: master differs from the site file (mean {before:.1f}) and 2.2-2.4 show that file: not exported'
    if cuts_only:                             # --cuts: only the cut's ladder; the picture's own files stay as they are
        return f'{name}: {m.size} -> {ws}' + (cut(name, m, ws) if name in CUTS else ', no cut')
    if not frozen:
        # only M, G and S show this picture, so its fallback is the new picture too (task a8c429a3: a cleaned picture's 1280
        # file kept the clutter while its ladder had none); 2.2-2.4's files never change
        m.resize(ref.size, Image.LANCZOS).save(IMG + name, quality=84, method=6)
    os.makedirs(IMG + 'hd', exist_ok=True)
    stem = name[:-5]
    wrote = [] if frozen else [IMG + name]          # 2.2-2.4's own file is never rewritten, so never stamped
    for w in ws:
        h = round(m.height * w / m.width)
        (m if w == m.width else m.resize((w, h), Image.LANCZOS)).save(f'{IMG}hd/{stem}-{w}.webp', quality=QUALITY, method=6)
        wrote.append(f'{IMG}hd/{stem}-{w}.webp')
    if d is not None:
        stamp(name, d, wrote)
    json.dump(dict(json.load(open(V + 'photo_exports.json')) if os.path.exists(V + 'photo_exports.json') else {}, **{name: ws}),
              open(V + 'photo_exports.json', 'w'), indent=1, sort_keys=True)
    open(V + 'photo_exports.json', 'a').write('\n')
    return f'{name}: {m.size} need {need} -> {ws} (colour fit, mean diff before {before:.1f})' + (cut(name, m, ws) if name in CUTS else '') + preview(name)


if __name__ == '__main__':
    bad = check_clean()
    if bad:
        sys.exit('not exported: a picture shows a cleaned place raw, or is undeclared (task a8c429a3):\n  ' + '\n  '.join(bad))
    names = [a for a in sys.argv[1:] if not a.startswith('--')] or list(SOURCE)
    if '--previews' in sys.argv:              # --previews: only the soft previews, from the files already exported
        for n in [a for a in sys.argv[1:] if not a.startswith('--')] or [k for k in json.load(open(V + 'photo_exports.json')) if ' ' not in k]:
            print(n + preview(n))
        sys.exit(0)
    for n in names:
        print(export(n, dry='--dry' in sys.argv, cuts_only='--cuts' in sys.argv))
