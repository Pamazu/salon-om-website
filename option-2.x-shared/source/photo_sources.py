"""Where every picture and film on M, G and S comes from (films: FILMS, task 2a3f89d3), and the check that no picture shows a place the client asked cleaned in
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
    # the shoot's photo 16, a stylist by her mirror: Inner Work's second door from 7fdb392 (task 69006a72) until 20 Nov, when the door
    # took J's cleaned-up basins picture, real-shampoo-basins.webp (task 95e37a41); on no page now
    'real-stylist-mirror.webp': 'o:16-portrait-team-member-mirror-5B3A1438.jpg',
    'real-maggie-salon-wide.webp': 'o:iw-5B3A1300.jpg',
    'real-maggie-outdoor-steps.webp': 'o:iw-5B3A1385.jpg',
    'real-maggie-product-wall.webp': 'o:1-portrait-standing-product-wall-5B3A1307-2.jpg',   # Inner Work step 05 (task 7a3c013b); its img/ copy is the shoot's 1280 export, not sharpened
    'real-color-bar.webp': 'm:10-color-bar-clean.jpg',
    # the salon's step 02 (task a8c429a3, J 18 Nov 18:16 Z: "Why don't we go with the option I prefered? My favorite one 25 oct"):
    # the photographer's original with J's 25 Oct edit where the edit changed the room (was the 18 Nov real-bottles master)
    'real-shampoo-basins.webp': 'm:6-shampoo-basins-25oct.jpg',     # J's 25 Oct picture itself at full size (task 69006a72)
    'real-styling-stations.webp': 'm:11-styling-stations-clean.jpg',
    'om-menu-signature-color.webp': 'm:om-menu-signature-color-clean.png',   # the bin and the vacuum hose removed (task a8c429a3)
    'om-menu-blonding.webp': 'm:om-menu-blonding-j25.png',     # on J's 25 Oct picture (task 69006a72)
    'om-pause-rest.webp': 'm:om-pause-guest-j25.png',     # the pause's picture A, under Shift+V (task 279db527), on J's 25 Oct picture
    # the pause's other candidates under Shift+V (tasks e1a1e009, 279db527), at the model's review size until J picks one
    'om-pause-exhale.webp': 'm:om-pause-exhale-j25.png',     # S1, on J's 25 Oct picture
    'om-pause-window.webp': 'm:om-pause-window.png',         # S2
    'iw-pause-fire-tea.webp': 'm:iw-pause-fire-tea.png',     # I1
    'iw-pause-coach-fire.webp': 'm:iw-pause-coach-fire-graded.png',     # I2, her own photo re-lit
    'iw-pause-shelves.webp': 'm:iw-pause-shelves.png',       # I3
    'om-menu-color-correction.webp': 'm:om-menu-color-correction.png',
    # service candidates under Shift+V (task b1dd24c9), at the model's review size until J picks one
    'om-menu-color-correction-cc11a1.webp': 'm:om-menu-color-correction-cc11a1.png',     # Color Correction CC11A seed 1
    'om-menu-extensions-ex11a2.webp': 'm:om-menu-extensions-ex11a2.png',         # Extensions EX11A seed 2
    'om-menu-cut-and-style.webp': 'm:om-menu-cut-and-style-clean.png',
    'om-menu-extensions.webp': 'm:om-menu-extensions.png',
    'om-menu-finishing-touches.webp': 'm:om-menu-finishing-touches.png',
    'om-menu-finishing-touches-ft12a1.webp': 'm:om-menu-finishing-touches-ft12a1.png',     # its Shift+V candidate FT12A seed 1
    'om-menu-blonding-bl9b4.webp': 'm:om-menu-blonding-bl9b4.png',             # Blonding BL9B seed 4
    'om-menu-blonding-bl10a2.webp': 'm:om-menu-blonding-bl10a2-j25.png',       # Blonding BL10A seed 2, at the basin of J's 25 Oct picture
    # the five steps' candidates under Shift+V, both worlds (task f748d06c), at the model's 1248 px until J picks one
    'om-step-arrive-arb1.webp': 'm:om-step-arrive-arb1.png',
    'om-step-unwind-uwa42.webp': 'm:om-step-unwind-uwa42.png',
    'om-step-unwind-uwb2k2.webp': 'm:om-step-unwind-uwb2k2.png',
    'om-step-renew-rnb42.webp': 'm:om-step-renew-rnb42.png',
    'om-step-unhurried-uha1.webp': 'm:om-step-unhurried-uha1.png',
    'om-step-unhurried-uhb3.webp': 'm:om-step-unhurried-uhb3.png',
    'om-step-home-hmb3.webp': 'm:om-step-home-hmb3.png',
    'om-step-home-hmd2.webp': 'm:om-step-home-hmd2.png',
    'iw-step-connect-cna1.webp': 'm:iw-step-connect-cna1.png',
    'iw-step-connect-cnb1.webp': 'm:iw-step-connect-cnb1.png',
    'iw-step-revisit-rva2k42.webp': 'm:iw-step-revisit-rva2k42.png',
    'iw-step-revisit-rvb1.webp': 'm:iw-step-revisit-rvb1.png',
    'iw-step-witness-wta1.webp': 'm:iw-step-witness-wta1.png',
    'iw-step-witness-wtb2.webp': 'm:iw-step-witness-wtb2.png',
    'iw-step-choose-cha2.webp': 'm:iw-step-choose-cha2.png',
    'om-step-arrive-ara2k42.webp': 'm:om-step-arrive-ara2k42.png',
    'om-step-renew-rna2k1.webp': 'm:om-step-renew-rna2k1.png',
    'iw-step-choose-chb42.webp': 'm:iw-step-choose-chb42.png',
    'iw-step-become-chb1.webp': 'm:iw-step-become-chb1.png',
    'iw-step-become-bcc2.webp': 'm:iw-step-become-bcc2.png',
    'meadow.webp': 'm:meadow.png',
    # the two heroes' stills while the films are off (build.FILMS_SHOWN, task 5479dd6c): the sharpest frame of the film, upscaled
    # x4 (SeedVR2 or Real-ESRGAN on the Mac Studio); the master PNG lives with the other masters, not in git
    'film-hero-forest.webp': 'm:film-hero-forest.png',
    'film-air-curtains.webp': 'm:film-air-curtains.png',
    # om-pause-guest.webp (the 19 Nov pause guest, made on the tidied room) is on no page since the pause became the door
    # (task a78e6208); undeclared so it cannot come back without being built on J's 25 Oct picture (task 69006a72)
    # the pause's door (task a78e6208, J 19 Nov: "I need the one I approved"): the empty styling chair by the window, photo 4 with
    # the bin and the hair vacuum's hose removed (the 20 Oct clean copy's pixels only there; clean_master.py 4)
    'real-chair-window.webp': 'm:4-styling-chair-window-clean.jpg',
}

# every photographer's original a picture may come from, and the place question answered: None = it shows no place on the
# client's clean-up list; a file = it shows one, and this cleaned master of it is used instead; '' = it shows one and no
# cleaned master of this view exists, so it is never used (the place's cleaned view is used instead)
ORIGINALS = {
    '1-portrait-standing-product-wall-5B3A1307-2.jpg': None,
    '2-lounge-fireplace-5B3A1048.jpg': None,
    '3-portrait-arms-crossed-5B3A1343.jpg': None,
    '4-styling-chair-window-5B3A1068.jpg': '4-styling-chair-window-clean.jpg',   # the bin by the window, the hair vacuum's hose (clean_master.py 4, task a78e6208)
    '5-portrait-seated-fireplace-5B3A1413.jpg': None,
    '6-shampoo-basins-5B3A1072.jpg': '6-shampoo-basins-25oct.jpg',   # the halo lamp, bin, hair vacuum, the bottles: J's 25 Oct picture (task 69006a72)
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

# J's 25 Oct picture of the basins room (task 69006a72; J 19 Nov 12:01 Z: "You have not yet used the approved image the one with
# the organized and cleaned up beauty products, I've reapeated this a million times"): resources/salon-photos/J25_PICTURE, at
# full size masters/J25 (clean_master.py 6e, then basins_labels.py). EVERY picture that shows the basins room is built on it: a
# picture whose sources reach a photo of that room (BASINS_ORIGINALS) without passing through J25 is refused. A name proves
# nothing (19 Nov: the tidied photo had been saved as '6-shampoo-basins-25oct-clean.jpg' and declared as J's), so
# export_photos.py also measures each basins picture's pixels against J's picture (room_check) and stamps the files it wrote
# (photo_checks.json); the deploy gate (row 23) refuses a basins picture whose shipped files carry no passing stamp.
J25 = '6-shampoo-basins-25oct.jpg'
J25_PICTURE = '6-shampoo-basins-edit.png'
BASINS_ORIGINALS = {'6-shampoo-basins-5B3A1072.jpg', '12-shampoo-basins-backbar-5B3A1067.jpg', '17-shampoo-basins-wide-5B3A1065.jpg',
                    'iw-5B3A1059.jpg'}
# the bottle zones of J's picture (1280 px x0,y0,x1,y1: left shelf, left basket, right shelf, right basket): what makes it his
J25_ZONES = [(590, 180, 740, 292), (600, 290, 732, 402), (860, 90, 1085, 218), (888, 232, 1038, 368)]
# a picture made on J25 and cut from it: the box it was cut from (full-size px), so its pixels can be measured against his
ROOM_CROP = {'om-menu-blonding-j25.png': (4850, 450, 7050, 3750), 'om-pause-guest-j25.png': (3100, 300, 8000, 3567),
             'om-pause-exhale-j25.png': (4650, 1250, 7350, 3050),      # S1: cut there, then drawn at the model's 1248 px
             'om-menu-blonding-bl10a2-j25.png': (4623, 761, 6807, 4037),      # BL10A seed 2 (task b1dd24c9): cut there, drawn at 832 px
             'om-step-unwind-uwa42.png': (2458, 437, 8192, 4260), 'om-step-unwind-uwb2k2.png': (3441, 1339, 7537, 4070)}   # task f748d06c, 1248 px

# every generated master -> what it was made on: 'o:<original>', 'm:<cleaned master>', or None (no photo: a mood film's frame,
# the meadow). A picture made on the raw original of a cleaned place and then cleaned itself names what was removed in
# CLEANED_IN_PLACE, so the answer is written where the picture is declared
BUILT_ON = {
    'om-menu-signature-color-clean.png': 'o:4-styling-chair-window-5B3A1068.jpg',
    'om-menu-blonding-25oct.png': 'm:6-shampoo-basins-tidied.jpg',     # NOT J's picture: made on the tidied photo (task 69006a72)
    # Blonding (task 69006a72): a generated guest seated at the right basin of J's 25 Oct picture, his rows behind her (FLUX.2 Klein
    # 4B, BL69 seed 42; pasted by her own outline, align_paste.py), cut at ROOM_CROP and graded (cine_grade.py)
    'om-menu-blonding-j25.png': 'm:6-shampoo-basins-25oct.jpg',
    # the pause (task 69006a72): the 19 Nov pause guest (PZ5) with J's 25 Oct room laid under her by her own outline
    # (salon-om-pictures/tools/room_under_guest.py), cut at ROOM_CROP and graded (cine_grade.py)
    'om-pause-guest-j25.png': 'm:6-shampoo-basins-25oct.jpg',
    # the pause's candidates (task e1a1e009; Qwen-Image-Edit 2511 on the Mac Studio, her own outline laid on the real room,
    # salon-om-pictures/tools/cine_try.sh; every try: record ac8238bb)
    'om-pause-exhale-j25.png': 'm:6-shampoo-basins-25oct.jpg',             # S1: a guest lying back at the basin
    'om-pause-window.png': 'm:4-styling-chair-window-clean.jpg',           # S2: a guest in the chair by the window
    'iw-pause-fire-tea.png': 'o:2-lounge-fireplace-5B3A1048.jpg',          # I1: a guest with tea by the fire
    'iw-pause-shelves.png': 'o:iw-5B3A1044.jpg',                           # I3: a guest by the fire, through the shelves
    'iw-pause-coach-fire-graded.png': 'o:5-portrait-seated-fireplace-5B3A1413.jpg',     # I2: her photo, re-lit (GRADED)
    'om-menu-color-correction.png': 'o:15-aveda-plant-artwork-5B3A1081.jpg',
    # service candidates (task b1dd24c9; Qwen-Image-Edit 2511 on the Mac Studio, then salon-om-pictures/tools/room_restore.py: the
    # model's picture with the photographer's pixels laid back wherever the two rooms agree; every try in Test Lab EXP-salonom-menu-guest-1)
    'om-menu-color-correction-cc11a1.png': 'm:10-color-bar-clean.jpg',        # a guest in profile at the colour bar
    'om-menu-extensions-ex11a2.png': 'o:7-aveda-product-shelves-5B3A1050.jpg',    # a guest from behind between the Aveda shelves
    'om-menu-cut-and-style-clean.png': 'm:11-styling-stations-clean.jpg',
    'om-menu-extensions.png': 'o:2-lounge-fireplace-5B3A1048.jpg',
    'om-menu-finishing-touches.png': 'o:8-glo-skincare-display-5B3A1070.jpg',
    # FT12A (task b1dd24c9): J's liked guest restaged by her own outline into a portrait crop of photo 8
    # (salon-om-pictures/tools/guest_restage.py), blended in by the model, then room_restore.py
    'om-menu-finishing-touches-ft12a1.png': 'o:8-glo-skincare-display-5B3A1070.jpg',
    'om-menu-blonding-bl9b4.png': 'm:11-styling-stations-clean.jpg',          # a guest in the styling chair under the blonde poster
    'om-menu-blonding-bl10a2-j25.png': 'm:6-shampoo-basins-25oct.jpg',        # a guest reclined at the right basin of J's 25 Oct picture
    # the five steps' candidates (task f748d06c): FLUX.2 Klein 4B on the Mac Studio drew the whole picture from the room's photo
    # (no paste, J 20 Nov 08:55 Z); every try in Test Lab EXP-salonom-step-pictures-1, its arm the shot named here
    'om-step-arrive-arb1.png': 'm:4-styling-chair-window-clean.jpg',     # AR-b seed 1
    'om-step-unwind-uwa42.png': 'm:6-shampoo-basins-25oct.jpg',     # UW-a seed 42
    'om-step-unwind-uwb2k2.png': 'm:6-shampoo-basins-25oct.jpg',     # UW-b2 seed 2 (framed lower than UW-b: her face clear of the words on a phone)
    'om-step-renew-rnb42.png': 'm:10-color-bar-clean.jpg',     # RN-b seed 42
    'om-step-unhurried-uha1.png': 'm:4-styling-chair-window-clean.jpg',     # UH-a seed 1
    'om-step-unhurried-uhb3.png': 'o:2-lounge-fireplace-5B3A1048.jpg',     # UH-b seed 3
    'om-step-home-hmb3.png': 'o:7-aveda-product-shelves-5B3A1050.jpg',     # HM-b seed 3
    'om-step-home-hmd2.png': 'o:iw-5B3A1044.jpg',     # HM-d seed 2
    'iw-step-connect-cna1.png': 'o:2-lounge-fireplace-5B3A1048.jpg',     # CN-a seed 1
    'iw-step-connect-cnb1.png': 'o:7-aveda-product-shelves-5B3A1050.jpg',     # CN-b seed 1
    'iw-step-revisit-rva2k42.png': 'o:iw-5B3A1044.jpg',     # RV-a2 seed 42 (framed tighter than RV-a: her face clear of the words on a desktop)
    'iw-step-revisit-rvb1.png': 'o:iw-5B3A1044.jpg',     # RV-b seed 1
    'iw-step-witness-wta1.png': 'o:7-aveda-product-shelves-5B3A1050.jpg',     # WT-a seed 1
    'iw-step-witness-wtb2.png': 'm:4-styling-chair-window-clean.jpg',     # WT-b seed 2
    'iw-step-choose-cha2.png': 'o:iw-5B3A1381.jpg',     # CH-a seed 2
    'om-step-arrive-ara2k42.png': 'o:iw-5B3A1044.jpg',     # AR-a2 seed 42
    'om-step-renew-rna2k1.png': 'm:11-styling-stations-clean.jpg',     # RN-a2 seed 1
    'iw-step-choose-chb42.png': 'o:iw-5B3A1385.jpg',     # CH-b seed 42
    'iw-step-become-chb1.png': 'o:iw-5B3A1385.jpg',     # CH-b seed 1
    'iw-step-become-bcc2.png': 'o:iw-5B3A1381.jpg',     # BC-c seed 2 (a woman unlike the coach, whose photo it was made on)
    'om-pause-guest-25oct.png': 'm:6-shampoo-basins-tidied.jpg',       # NOT J's picture: made on the tidied photo (task 69006a72)
    # photo 6 with the lamp, bin and vacuum removed and its own small items tidied away (cdfa655, T6/assemble.sh): saved on 19 Nov
    # as '6-shampoo-basins-25oct-clean.jpg', but it is not J's 25 Oct picture (its bottles are the photo's, not his rows)
    '6-shampoo-basins-tidied.jpg': 'o:6-shampoo-basins-5B3A1072.jpg',
    'meadow.png': None,
    'film-hero-forest.png': None,
    'film-air-curtains.png': None,
}
# a master that is a photo only re-lit or graded, nothing drawn into it: a real photo, never a generated picture (no AI label)
GRADED = {'iw-pause-coach-fire-graded.png'}
CLEANED_IN_PLACE = {
    'om-menu-signature-color-clean.png': 'the bin by the window and the hair vacuum hose removed, as on the clean copy of photo 4',
}

# pictures of the basins room no page may show again (task 69006a72): what they were and why; build.py and row 23 refuse them
RETIRED = {
    'real-basins-poster.webp': "photo 1059's basins wall with its own bottles tidied, not J's 25 Oct picture (Inner Work's door is photo 16)",
    'om-pause-guest.webp': "the 19 Nov pause guest on the tidied basins photo, not J's 25 Oct picture",
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


def chain(src):
    """every source a picture comes from, nearest first ('o:' / 'm:'), following generated masters to what they were made on and
    a cleaned master to its original"""
    back = {v: k for k, v in ORIGINALS.items() if v}
    out = []
    while src and len(out) < 12:
        out.append(src)
        kind, f = src.split(':', 1)
        if kind == 'o':
            break
        src = ('o:' + back[f]) if f in back else BUILT_ON.get(f)
    return out


def shows_basins(src):
    return any(s.startswith('o:') and s[2:] in BASINS_ORIGINALS for s in chain(src))


def basins(source=None):
    """every site picture that shows the basins room -> its master"""
    source = SOURCE if source is None else source
    return {n: s for n, s in list(source.items()) + list(OTHER.items()) if shows_basins(s)}


def basins_problems(source=None):
    out = []
    for name, src in sorted(basins(source).items()):
        if 'm:' + J25 not in chain(src):
            out.append(f'{name}: shows the basins room but is not built on J\'s 25 Oct picture ({J25_PICTURE}): build it on m:{J25} '
                       '(task 69006a72)')
    return out


# room_check (task 69006a72): of the bottle-zone pixels that match one of the two rooms, the share that match J's picture rather
# than the photographer's raw photo of the same frame (J25_PHOTO); a guest, a grade or a crop matches neither and does not vote
J25_PHOTO = '6-shampoo-basins.jpg'
# measured 19 Nov: J25 itself 0.97, Blonding on it (a guest, a grade) 0.78; the tidied photo 0.07, the cleaned 18 Nov master 0.12,
# the 19 Nov Blonding on the tidied photo 0.18, the pause guest on it 0.10
ROOM_BAR = 0.6


def room_check(master_path, picture_path, crop=None, photo_path=None):
    """the share (0-1) of a basins master's bottle-zone pixels that are J's 25 Oct picture rather than the raw photo: each zone of
    the master (or, cut from J25 at crop, the part of the frame it shows) brought to J's picture's scale, its colour fitted to each
    room (a grade is not a different room), and each pixel counted for the room it is clearly nearer. Needs numpy and PIL
    (export_photos.py runs it; build.py and the gate do not)."""
    import os
    import numpy as np
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    J = Image.open(picture_path).convert('RGB')
    R = Image.open(photo_path or os.path.join(os.path.dirname(picture_path), J25_PHOTO)).convert('RGB').resize(J.size, Image.LANCZOS)
    M = Image.open(master_path).convert('RGB')
    if crop is None:
        crop = (0, 0, M.width, M.height)
        kf = M.width / J.width
    else:
        kf = 8192 / J.width                                     # J25 is the photographer's 8192 frame
    x0, y0, x1, y1 = crop
    k = M.width * kf / (x1 - x0)          # the master's px per px of J's picture: kf when it is at full size, less when drawn smaller
    m = np.asarray(M.resize((round(M.width / k), round(M.height / k)), Image.LANCZOS), dtype=np.float64)
    rooms = [np.asarray(J, dtype=np.float64), np.asarray(R, dtype=np.float64)]
    votes = [0, 0]
    for zx0, zy0, zx1, zy1 in J25_ZONES:
        a, b = max(zx0, x0 / kf), max(zy0, y0 / kf)
        c, d = min(zx1, x1 / kf), min(zy1, y1 / kf)
        if c - a < 20 or d - b < 20:
            continue
        mz = m[round(b - y0 / kf):round(d - y0 / kf), round(a - x0 / kf):round(c - x0 / kf)]
        diffs = []
        for room in rooms:
            rz = room[round(b):round(b) + mz.shape[0], round(a):round(a) + mz.shape[1]]
            fz = mz[:rz.shape[0], :rz.shape[1]].copy()
            for ch in range(3):
                g, o = np.polyfit(fz[..., ch].ravel(), rz[..., ch].ravel(), 1)
                fz[..., ch] = fz[..., ch] * g + o
            diffs.append(np.abs(fz - rz).max(2))
        dj, dr = diffs[0], diffs[1][:diffs[0].shape[0], :diffs[0].shape[1]]
        near = np.minimum(dj, dr) < 25                         # the pixel is one of the two rooms (not the guest)
        votes[0] += int((near & (dj + 10 < dr)).sum())
        votes[1] += int((near & (dr + 10 < dj)).sum())
    return votes[0] / max(1, sum(votes)) if sum(votes) else None


def check(source=None, used=()):
    """every problem, as sentences; [] = every picture shows each cleaned place cleaned"""
    source = SOURCE if source is None else source
    out = []
    for name, src in sorted(source.items()):
        out += _base(src, name)
    for name, src in sorted(OTHER.items()):
        out += _base(src, name)
    out += basins_problems(source)
    for name in sorted(set(used) - set(source) - set(OTHER)):
        out.append(f'{name}: shown on the page but declared nowhere (photo_sources.SOURCE or OTHER): name its master')
    return out


def check_page(body, source=None):
    """build.py: stop the build when a page shows a picture of a cleaned place raw, or a picture nobody declared"""
    used = set(re.findall(r'img/([a-z0-9-]+\.webp)', body))
    bad = check(source, used - set(RETIRED)) + [f'{n}: retired: {RETIRED[n]}' for n in sorted(used & set(RETIRED))]
    if bad:
        raise SystemExit('photo_sources: a picture shows a cleaned place raw, or is undeclared (task a8c429a3):\n  ' + '\n  '.join(bad))


# Where every film on M, G and S comes from (AI Act Art 50; task 2a3f89d3): whether it is made with AI, what made it, the record
# that says so, and the sha256 of every file of it the pages name (the film and its lighter HEVC twin, task 5cb93228).
# build.film() puts "Made with AI" on every film made with AI (StoryLegal, 18 Nov, "Made with AI labels on a client's website":
# on the film itself, as text on the page, visible with no hover or tap the whole time it plays); approved_gate.py refuses a
# film the pages name with no line here, or whose staged file is not the one recorded, so a new film, or new bytes under an
# old name, never goes live before its origin is written. Read, never guessed: the six films are byte-identical to Option 2's
# (option-2/site/media, committed 13 Oct, 9ed8955), whose Films README records each one ("generated on the client's Magnific
# account", with its model), its durations those of the files (hero 13.6 s, earth 16.5 s, the elements 17.4 s); each HEVC twin
# is made from its film. A clip from StoryForge's job service (MiniMax H3) takes its line from the json returned with it
# ("Machine-generated with MiniMax H3."); filmed or licensed footage is ai=False with its source.
FILM_RECORD = 'option-2/design-system/assets/Films/README.md'
FILMS = {
    'hero': dict(ai=True, made='Seedance 2.5: a slow push through a misty rainforest with light shafts', record=FILM_RECORD,
               files={'hero.mp4': 'a6babba4a6205c1524528ae72cec4ef07e1bee931895a8e6693afa96ab9a0fcf',
                      'hero-hevc.mp4': '48db7a5c1d5955e5096b00213be10cb5d47526d9e79889bf268e23993179a914'}),
    'earth': dict(ai=True, made='Seedance 2.5: driftwood grain under a sweep of golden light', record=FILM_RECORD,
               files={'earth.mp4': '565945ea501ea18848801737a18dbd916bac2e40dff326e692dd36409112ab98',
                      'earth-hevc.mp4': '0750d1762d8e8d7cd766d83fb866ca64b9f803a397ef2d9ef24bbae1d037faf7'}),
    'water': dict(ai=True, made='Kling 2.5: turquoise water over sand, from above', record=FILM_RECORD,
               files={'water.mp4': '46c77c103cd7e76e9761027a23eb7c1909d446b8aecdf4c2f7b0bba54b3911d7'}),
    'fire': dict(ai=True, made='Kling 2.5: candle flames and embers in darkness', record=FILM_RECORD,
               files={'fire.mp4': '7eedcf6076e717a051780a6b34a50122284d30385bed283eb5658532ebc95f80',
                      'fire-hevc.mp4': '98abcf11e90fc0f34d32cd082b899eabff6df7363961ac59780566382aa2774f'}),
    'air': dict(ai=True, made='Kling 2.5: linen curtains breathing in sunlight', record=FILM_RECORD,
               files={'air.mp4': '94bbb2044ddbe193b7f87cc292649789ec43185eda6ca3648711be3d7e9585d9',
                      'air-hevc.mp4': 'ddeb9ee468eee4496df858dfb95d299fbef0e61f6a2825140038d8d407420931'}),
    'ether': dict(ai=True, made='Kling 2.5: incense smoke through a beam of light', record=FILM_RECORD,
               files={'ether.mp4': '2745ccb7a7b6d03f4b806f8dfbb24def4769b8753cea1bd30789f6d82b059bb2',
                      'ether-hevc.mp4': '40a6cb7113063deca97fb1e75d13e8843f618ba43cd5cc60a545d3b44dc1a7a1'}),
}


def film_of(src):
    """the FILMS line a film file belongs to (src as a page names it: folder and ?v= dropped), or None"""
    f = src.split('?')[0].rsplit('/', 1)[-1]
    return next((k for k, v in FILMS.items() if f in v['files']), None)
