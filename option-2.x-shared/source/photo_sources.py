"""Where every picture on M, G and S comes from, and the check that no picture shows a place the client asked cleaned in
its raw state (task a8c429a3).

J, 18 Nov 2026 17:24 Z, on Inner Work's door built on the raw basins photo 1059: "we already had a cleanup version of this
image and you used the one that's not cleaned up ... Why you did that against the work we already did?" The cleanup existed
for one photo of the basins wall; three other photos of the same wall (1059, 17, 12) were used raw, and nothing in the build
knew a raw photo shows a place we cleaned. Now the build knows: every photographer's original declares whether it shows a
place on the client's clean-up list (her 19 Oct stream: the halo lamp, the bins and hair vacuum, the brooms and mop, the
bottles, the colour bar tidied) and, if it does, which cleaned master stands for it; every generated master declares the
photo it was made on. check() refuses a picture whose original, or whose generated master's photo, is a raw original of a
cleaned place, and refuses anything undeclared, so a new photo or a new generated picture cannot slip in without the
question being answered. build.py runs it on every M/G/S page (the build stops); export_photos.py runs it before exporting.

No image libraries here: build.py runs on the plain python3.
"""
import re

# site picture -> its master. 'o:' = the photographer's original (originals/README.md maps the numbers), 'm:' = a master made
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
    # Inner Work (task 7a3c013b): nine more of her portraits from the shoot folder, their originals saved beside the 17 as iw-<file>
    'real-maggie-lounge-seated.webp': 'o:iw-5B3A1401.jpg',
    'real-maggie-outdoor-chin.webp': 'o:iw-5B3A1387.jpg',
    'real-maggie-outdoor-portrait.webp': 'o:iw-5B3A1368.jpg',
    'real-maggie-fireside-close.webp': 'o:iw-5B3A1410.jpg',
    'real-maggie-warm.webp': 'o:iw-5B3A1292-2.jpg',
    'real-maggie-fireside.webp': 'o:iw-5B3A1403.jpg',
    'real-maggie-smile.webp': 'o:iw-5B3A1279-2.jpg',
    'real-maggie-outdoor-turn.webp': 'o:iw-5B3A1373.jpg',
    'real-maggie-outdoor-wide.webp': 'o:iw-5B3A1381.jpg',
    'real-lounge-wide.webp': 'o:iw-5B3A1044.jpg',
    # Inner Work's door (task a8c429a3): photo 1059 with the lamp and the mop removed (was the raw 1059)
    'real-basins-poster.webp': 'm:iw-5B3A1059-clean.jpg',
    'real-maggie-salon-wide.webp': 'o:iw-5B3A1300.jpg',
    'real-maggie-outdoor-steps.webp': 'o:iw-5B3A1385.jpg',
    'real-maggie-product-wall.webp': 'o:1-portrait-standing-product-wall-5B3A1307-2.jpg',   # Inner Work step 05 (task 7a3c013b); its img/ copy is the shoot's 1280 export, not sharpened
    'real-color-bar.webp': 'm:10-color-bar-clean.jpg',
    # the salon's step 02 (task a8c429a3, J 18 Nov 18:16 Z: "Why don't we go with the option I prefered? My favorite one 25 oct"):
    # the photographer's original with J's 25 Oct edit where the edit changed the room (was the 18 Nov real-bottles master)
    'real-shampoo-basins.webp': 'm:6-shampoo-basins-25oct-clean.jpg',
    'real-styling-stations.webp': 'm:11-styling-stations-clean.jpg',
    'om-menu-signature-color.webp': 'm:om-menu-signature-color-clean.png',   # the bin and the vacuum hose removed (task a8c429a3)
    'om-menu-blonding.webp': 'm:om-menu-blonding-25oct.png',
    'om-menu-color-correction.webp': 'm:om-menu-color-correction.png',
    'om-menu-cut-and-style.webp': 'm:om-menu-cut-and-style-clean.png',
    'om-menu-extensions.webp': 'm:om-menu-extensions.png',
    'om-menu-finishing-touches.webp': 'm:om-menu-finishing-touches.png',
    'meadow.webp': 'm:meadow.png',
    # the two heroes' stills while the films are off (build.FILMS_SHOWN, task 5479dd6c): the sharpest frame of the film, upscaled
    # x4 (SeedVR2 or Real-ESRGAN on the Mac Studio); the master PNG lives with the other masters, not in git
    'film-hero-forest.webp': 'm:film-hero-forest.png',
    'film-air-curtains.webp': 'm:film-air-curtains.png',
    'om-pause-guest.webp': 'm:om-pause-guest-25oct.png',      # the pause (task a8c429a3): a guest in J's 25 Oct basins room
}

# every photographer's original a picture may come from, and the place question answered: None = it shows no place on the
# client's clean-up list; a file = it shows one, and this cleaned master of it is used instead; '' = it shows one and no
# cleaned master of this view exists, so it is never used (the place's cleaned view is used instead)
ORIGINALS = {
    '1-portrait-standing-product-wall-5B3A1307-2.jpg': None,
    '2-lounge-fireplace-5B3A1048.jpg': None,
    '3-portrait-arms-crossed-5B3A1343.jpg': None,
    '4-styling-chair-window-5B3A1068.jpg': '',                  # the bin by the window, the hair vacuum's hose
    '5-portrait-seated-fireplace-5B3A1413.jpg': None,
    '6-shampoo-basins-5B3A1072.jpg': '6-shampoo-basins-25oct-clean.jpg',   # the halo lamp, bin, hair vacuum; J's 25 Oct edit
    '7-aveda-product-shelves-5B3A1050.jpg': None,
    '8-glo-skincare-display-5B3A1070.jpg': None,
    '9-team-of-three-5B3A1134.jpg': None,
    '10-color-bar-5B3A1078.jpg': '10-color-bar-clean.jpg',      # the mop, the counter's clutter
    '11-styling-stations-5B3A1083.jpg': '11-styling-stations-clean.jpg',   # the cart
    '12-shampoo-basins-backbar-5B3A1067.jpg': '',               # the basins wall: halo lamp, mop, baskets
    '13-portrait-outdoor-white-blazer-5B3A1353.jpg': None,
    '14-portrait-standing-shelves-5B3A1319.jpg': None,
    '15-aveda-plant-artwork-5B3A1081.jpg': None,
    '16-portrait-team-member-mirror-5B3A1438.jpg': None,
    '17-shampoo-basins-wide-5B3A1065.jpg': '',                  # the basins wall: halo lamp, mop, baskets
    'iw-5B3A1044.jpg': None,
    'iw-5B3A1059.jpg': 'iw-5B3A1059-clean.jpg',                 # the basins wall and the colour bar: halo lamp, mop
    'iw-5B3A1279-2.jpg': None,
    'iw-5B3A1292-2.jpg': None,
    'iw-5B3A1300.jpg': None,
    'iw-5B3A1368.jpg': None,
    'iw-5B3A1373.jpg': None,
    'iw-5B3A1381.jpg': None,
    'iw-5B3A1385.jpg': None,
    'iw-5B3A1387.jpg': None,
    'iw-5B3A1401.jpg': None,
    'iw-5B3A1403.jpg': None,
    'iw-5B3A1410.jpg': None,
}
CLEANED = {v for v in ORIGINALS.values() if v}

# every generated master -> what it was made on: 'o:<original>', 'm:<cleaned master>', or None (no photo: a mood film's frame,
# the meadow). A picture made on the raw original of a cleaned place and then cleaned itself names what was removed in
# CLEANED_IN_PLACE, so the answer is written where the picture is declared
BUILT_ON = {
    'om-menu-signature-color-clean.png': 'o:4-styling-chair-window-5B3A1068.jpg',
    'om-menu-blonding-25oct.png': 'm:6-shampoo-basins-25oct-clean.jpg',
    'om-menu-color-correction.png': 'o:15-aveda-plant-artwork-5B3A1081.jpg',
    'om-menu-cut-and-style-clean.png': 'm:11-styling-stations-clean.jpg',
    'om-menu-extensions.png': 'o:2-lounge-fireplace-5B3A1048.jpg',
    'om-menu-finishing-touches.png': 'o:8-glo-skincare-display-5B3A1070.jpg',
    'om-pause-guest-25oct.png': 'm:6-shampoo-basins-25oct-clean.jpg',
    'meadow.png': None,
    'film-hero-forest.png': None,
    'film-air-curtains.png': None,
}
CLEANED_IN_PLACE = {
    'om-menu-signature-color-clean.png': 'the bin by the window and the hair vacuum hose removed, as on the clean copy of photo 4',
}

# pictures the pages show that are not exported from a master here: what they were cut from
OTHER = {
    'real-katie.webp': 'o:9-team-of-three-5B3A1134.jpg',
    'real-chesney.webp': 'o:9-team-of-three-5B3A1134.jpg',
}


def _base(src, name):
    """the problems with one source ('o:' or 'm:'), following a generated master to what it was made on"""
    kind, f = src.split(':', 1)
    if kind == 'o':
        if f not in ORIGINALS:
            return [f'{name}: original {f} is not declared in photo_sources.ORIGINALS: say whether it shows a place on the '
                    'client\'s clean-up list (and which cleaned master stands for it)']
        clean = ORIGINALS[f]
        if clean is None:
            return []
        return [f'{name}: built on the raw original {f}, which shows a place the client asked cleaned: use '
                + (f'm:{clean}' if clean else 'the cleaned view of that place (no cleaned master of this view exists)')]
    if f in CLEANED:
        return []
    if f not in BUILT_ON:
        return [f'{name}: master {f} is not declared in photo_sources.BUILT_ON: name the photo it was made on']
    base = BUILT_ON[f]
    if base is None or f in CLEANED_IN_PLACE:
        return []
    return _base(base, name)


def check(source=None, used=()):
    """every problem, as sentences; [] = every picture shows each cleaned place cleaned"""
    source = SOURCE if source is None else source
    out = []
    for name, src in sorted(source.items()):
        out += _base(src, name)
    for name, src in sorted(OTHER.items()):
        out += _base(src, name)
    for name in sorted(set(used) - set(source) - set(OTHER)):
        out.append(f'{name}: shown on the page but declared nowhere (photo_sources.SOURCE or OTHER): name its master')
    return out


def check_page(body, source=None):
    """build.py: stop the build when a page shows a picture of a cleaned place raw, or a picture nobody declared"""
    used = set(re.findall(r'img/([a-z0-9-]+\.webp)', body))
    bad = check(source, used)
    if bad:
        raise SystemExit('photo_sources: a picture shows a cleaned place raw, or is undeclared (task a8c429a3):\n  ' + '\n  '.join(bad))
