"""Shared parts of the three copy versions on the 2.2 design (task cf7dd8fd, study febe2c3a section 8):
M = Maggie's order, G = Guided, S = Short. Words come only from copy_2_2_maggie.py (Maggie, word for word) and,
in G and S, the study's [draft] lines, wrapped in draft() so they show a dotted underline. This file holds layout
choices (films, photos, ids), never new words."""
import os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import copy_2_2_maggie as M
import mgs_sections as S
from build import btn, draft, ph, E

BOOK = 'Book your visit'                 # the salon's one action, the same words everywhere (study section 7, Q1)
CALL = M.CTA_IW                          # Inner Work's one action
# where each action really goes (task 0ab956d4): the salon books online through GlossGenius (study Q2); Inner Work has
# no booking page yet, so a Connection Call starts with an email to the address Maggie gave for it (her deck, 2 Nov)
# her 11 Nov document books by call or email from Begin ('Call the salon', 'Email us'), so every 'Book your visit' leads there
BOOK_URL = '#begin'
BOOK_ONLINE_URL = 'https://maggiewoodward.glossgenius.com/book'   # her booking page: in G and S only, a second way beside call and email
CALL_URL = 'mailto:connect@maggiewoodward.com?subject=Connection%20Call'
LEGEND = 'Words with a dotted underline are new, for Maggie to approve. Words in [square brackets] are still to come.'
LEGEND_M = ('Every line of copy here is Maggie’s own: her website copy of 11 Nov and her Inner Work deck. Lines with a dotted '
            'underline are from her answers of 11 Nov, for her to approve. Words in [square brackets] are still to come.')
# Maggie's answers of 11 Nov 2026 (voice message to J, transcribed in the brain: build-salon-om-website/record/
# record-2026-11-11-maggie-answers-to-the-website-questions.md; task d7b789ee). Dotted for her yes, since none is in her decks.
#  - the Connection Call: "typically 30 to 45 minutes", "I don't ever do a hard stop"
#  - Inner Work: "in the salon privately when we are not open for business ... and it also can happen online ... you don't
#    have to be a client of the salon to be an inner work client" (salon people are guests, Inner Work people clients: her rule)
#  - adjustments: never advertised, said to every first-time guest at the end of the visit, in her words; never "guarantee"
#    or "free". Shown in G and S only: M is her approved copy, and she has never put this in it
#  - service lengths: not answered and not on her public booking page (no services listed), so left out, never asked again
#  - reviews: her booking-service reviews, quoted with initials (the quotes already on the page); no Google rating
A11 = dict(
  call='About 30 to 45 minutes, never rushed.',
  where='Sessions happen privately at Salon OM, outside salon hours, or online. You don’t have to be a salon guest to be an Inner Work client.',
  adjust='What Maggie tells every new guest: “Please let me know if there are any challenges or concerns. I’m happy to get you in within the first two weeks.”',
)

# the study's [draft] lines (section 4, 6, 3b), word for word; Maggie's rule (no semicolons) applied to step 04
D = dict(
  proof='Maggie has listened in the chair for 28 years.',   # round 5: her opening now says Aveda Concept Salon and Avila Beach
  preview='Your visit, in five steps.',
  benefits=['You are heard before anything is done to your hair.', 'The week’s tension lets go.',
            'Hair that suits you, from plant-based Aveda color.', 'Nothing is rushed. The time is yours.',
            'It still looks right next week.'],
  begin='Care and attention made around you, from your first cup of tea.',   # J 10 Nov 08:56: no "unhurried time" in new lines
)
# Q10/Q11 (Copywriter 1, 4 Nov): not in Maggie's decks, so left out of M and shown as [draft] in G and S
# each checked on aveda.com, 10 Nov 2026 (task df14fa0d): 100% vegan since 2021 (aveda.com/living-aveda-article-vegan-haircare-beauty);
# first beauty company to manufacture with 100% wind power at its primary facility, 2007 (aveda.com/carbon-neutrality-green-initiatives);
# Certified B Corporation, 2023 (aveda.com/b-corp-certification); founded 1978 by Horst Rechelbacher (aveda.com/horst-rechelbacher-aveda-history).
# A year never counts up (third field off).
AVEDA_FACTS = [(n, t, True) if n == '100%' else (n, t) for n, t in M.AVEDA_FACTS]   # hers, 11 Nov; only 100% counts up
# Why Aveda's picture (task a749167b, reference page section 9): the photographer's original 7, her Aveda shelves around a
# living plant in the window light, sharp at J's 6K window (export_photos.py); S shows it small beside its Aveda line
AVEDA_PHOTO = ('real-aveda-shelves.webp', 'Aveda products on the glass shelves at Salon OM, around a fiddle-leaf fig in the window light')
# the salon's public details, 10 Nov 2026 (task df14fa0d): address and hours from Maggie's own booking page
# (maggiewoodward.glossgenius.com/about), phone from salonom.com, email from maggiewoodward.glossgenius.com/services,
# Instagram @salonomavilabeach (both). salonom.com: "Open by appointment only".
SALON_INFO = dict(address=M.FOOTER['address'], hours=M.FOOTER['hours'], hours_note=M.FOOTER['hours_note'],   # her 11 Nov footer
                  phone=f'<a href="tel:+18056271550">{M.FOOTER["phone"]}</a>',
                  email=f'<a href="mailto:{M.FOOTER["email"]}">{M.FOOTER["email"]}</a>')
TEAM_NOTE = 'I’m the backdrop. It’s not about me, it’s about you. This is your time, your space.'

# one real photo per step (study section 6: a picture now, the film of that moment later), over its element film
# each checked against its step's feature: 01 the welcome (the team who greet you; no photo shows the tea, and the lounge
# photos carry the clock), 02 the basins of the scalp ritual, 03 the color bar, 04 unhurried time (the lounge clock), 05 the styling stations
STEP_IMG = ['real-team-of-three.webp', 'real-shampoo-basins.webp', 'real-color-bar.webp', 'real-lounge.webp', 'real-styling-stations.webp']
STEP_ALT = ['Maggie, Katie and Chesney at Salon OM', 'The shampoo basins at Salon OM', 'The color bar at Salon OM',
            'The lounge by the fireplace at Salon OM', 'The styling stations at Salon OM']
STEP_FILM = ['earth', 'water', 'fire', 'air', 'ether']
STEP_ID = ['arrive', 'unwind', 'renew', 'unhurried', 'home']
# round 3 (task a2e5a9d0): each service shows its result on a guest. J, 11 Nov (handbook section 6 item 7): no more photo asks
# to Maggie; each picture is one of her real salon photos, the room kept exactly, with ONE generated guest (gpt-image-2, only
# the guest's zone pasted back by region_edit, Test Lab EXP-salonom-menu-guest-1), never captioned as a real result.
# (file, alt, focus point for the panel's crop); None keeps the [photo to come] frame
SERVICE_PHOTO = [
  # round 5 (task 2846db82, J 13 Nov: "She's turning her head a bit too much. Those chairs can turn a little bit ... Nothing in
  # the location is getting invented"): Signature Color is the salon's photo 4, the styling chair by the window (no other menu
  # picture uses that corner; daylight shows colour true), the guest seated on the seat, back to the chair, boots on the
  # footrest, her body turned with the chair and her head only a little more. Qwen-Image-Edit 2511 on the Mac Studio (SC5
  # seed 3) re-rendered the whole frame at the photo's own camera; every object checked against photo 4, none invented, not
  # pixel-exact (a paste left seams: Qwen moves the room a little). Round 4's view of photo 11 changed the real room.
  # Blonding (task a8c429a3, J 18 Nov 17:26 Z: "you used the wrong image and the guest has her shoes in teh chair and the camera
  # angle is boring (also the lighting)"): the cleaned basins wall (step 02's master, J's 25 Oct look), photo 6's low angle,
  # the guest leaning back at the basin under the poster, her bright blonde hair down the chair back, her legs out of frame;
  # Qwen-Image-Edit 2511 (BL2 seed 3) aligned and pasted by her own outline (the poster's words and the room stay the
  # photographer's), light graded in code (cine_grade.py). Task 69006a72 (J 19 Nov 12:01 Z: "You have not yet used the approved
  # image the one with the organized and cleaned up beauty products"): now on J's 25 Oct picture itself, his rows of bottles
  # behind her, every label on them real; seated after her rinse, three-quarters to the camera, legs out of frame (FLUX.2
  # Klein 4B, BL69 seed 42; photo_sources.ROOM_CROP)
  ('om-menu-signature-color.webp', 'A generated guest with rich, dimensional brunette colour in the styling chair by the window at Salon OM', '62% 45%'),
  ('om-menu-blonding.webp', 'A generated guest with bright, seamless blonde hair seated at a shampoo basin below shelves of Aveda bottles, in a photo of Salon OM', '48% 40%'),
  # Color Correction (round 5, task 2846db82): the salon's photo 15, the guest in the doorway beside the Aveda canvas, facing
  # the camera with body and head together, her hair an even, glossy warm brown from root to end; Qwen-Image-Edit 2511 (CC3
  # seed 8), whole frame, canvas, switches, counter and lights checked against photo 15 (the color bar sits behind her)
  ('om-menu-color-correction.webp', 'A generated guest with even, glossy warm brown hair in the doorway beside the Aveda canvas at Salon OM', '22% 42%'),
  # Cut and Style (task 1c6ed2aa, StoryLegal 17 Nov 2026: no real team member beside a generated guest until her own written
  # yes): the salon's photo 11, the styling stations, no team member; the guest seated back in the styling chair, shoes on
  # its footrest, a sleek chin-length bob. Qwen-Image-Edit 2511 on the Mac Studio (CS6 seed 8), then only the guest pasted
  # back on the real photo by her own person outline: 0 px changed outside her, the real poster and chair kept. The
  # visit's styling step shows the same room empty; here the crop centres on the guest
  ('om-menu-cut-and-style.webp', 'A generated guest with a sleek, freshly cut bob in a styling chair, in a photo of Salon OM', '44% 50%'),
  # Luxury Extensions (task 1c6ed2aa, StoryLegal 17 Nov 2026: no real team member beside a generated guest until her own
  # written yes): the salon's photo 2, the lounge by the fireplace, no team member; the guest seated on the striped bench,
  # long full warm-brown waves down her back. Qwen-Image-Edit 2511 on the Mac Studio (EX6 seed 3), then only the guest pasted
  # back on the real photo by her own person outline (salon-om-pictures/tools/guest_paste.sh): 0 px changed outside her,
  # the real fire and bench kept. The visit's lounge step shows the same room empty; here the crop centres on the guest
  ('om-menu-extensions.webp', 'A generated guest with long, full, wavy hair on the bench by the fireplace, in a photo of Salon OM', '30% 52%'),
  # round 5 (task 2846db82): Finishing Touches was a pasted cut-out (a hard edge under the sweater, no shadow, front light
  # against the window); now the salon's photo 8 with the guest standing at the glo display, three-quarter profile, brows
  # shown, a tube in her hands, lit from the window like the room (Qwen-Image-Edit 2511, FT5 seed 4, whole frame; the display
  # and its products checked against photo 8, none invented). J, 19 Nov 2026 12:01 Z, liked it: "the one on finishing
  # touches is cropping too much the subject": the same picture, its focus moved to her side so the tall desktop panel
  # (about 40% of its width at 1440x900) holds her whole head, bun, hands and the tube (task b1dd24c9)
  ('om-menu-finishing-touches.webp', 'A generated guest with softly shaped brows holding a glo tube at the skincare display at Salon OM', '14% 32%'),
]
# every menu picture is a real salon photo with one generated guest, so each says so in its corner, as text on the page
# (StoryLegal, 17 Nov 2026, msg 7d0dc68d: "\"Guest made with AI\" in a corner of the picture ... as text on the page";
# not a footer line, a hover or tap icon, or a mark only in the file; task 1c6ed2aa)
AI_GUEST = 'Guest made with AI'
AI_MADE = 'Made with AI'   # the meadow: a generated person not made from her photos (CEO MA, 18 Nov; StoryLegal asked for its words)
# the pause (task a8c429a3): the cleaned basins wall (step 02's master, J's 25 Oct look) at photo 6's low angle, one generated guest
# resting at the basin below the poster, legs out of frame (no feet on the footstool), light graded in code; was photo 17 raw
PAUSE_ALT = 'A generated guest resting at a shampoo basin at Salon OM, eyes closed, a towel round her shoulders, below the Aveda poster'
# the pause is the door again (task a78e6208; J 19 Nov 08:01 Z: "I explicitly requested the one with the door", 08:03 Z: "I need the
# one I approved"): the empty styling chair by the window, the salon's photo 4 cleaned as the client asked (no bin, no hair
# vacuum: photo_sources, clean_master.py 4). A real photo with clutter removed, as the colour bar and the stations: no AI label
PAUSE_DOOR = 'real-chair-window.webp'
PAUSE_DOOR_ALT = 'The empty styling chair by the window at Salon OM, daylight on the leather'
# the pause's picture is J's pick (task e1a1e009; J 20 Nov 07:12 Z, on A in his screenshot StoryShot 2026-11-20 at 08.00.20: "This
# image, I think, is the best, but you can use cinematic lighting to stage it better so that the focal point is the relaxed woman";
# qa/j-picks.json): A, the guest at the basin in his 25 Oct picture of the room. PAUSE_PICK_POS is where she is (her face and the
# towel, read from her outline): the frame keeps her in view there and the page's light falls on her there (mgs.css .ps__light)
PAUSE_PICK = 'om-pause-rest.webp'
PAUSE_PICK_ALT = 'A generated guest resting at a shampoo basin at Salon OM, eyes closed, a towel round her shoulders, below shelves of Aveda bottles'
PAUSE_PICK_POS = '51% 60%'


# THE PICTURES J SWITCHES WITH SHIFT+V (task 279db527; J 19 Nov 18:15 Z: "shift v to shift between options of all images that
# are in view also please"): {the picture on the page today: its name in the panel, today's label, its candidates}, drawn by
# section_options.pictures. A candidate becomes the picture on the page only once J picks it there: the deploy gate's row 27
# refuses a generated picture he has not picked (qa/j-picks.json, written by `approved_gate.py pick` from his words). A service
# picture's candidates (task b1dd24c9) join here, one line each, under its file.
PICTURE_OPTIONS = {
    # today's is J's pick, A (task 69006a72, 5e79645: the 19 Nov pause guest with his 25 Oct basins room laid under her by her outline)
    PAUSE_PICK: dict(name='The pause’s picture', live='Today’s: A · The guest at the basin, your pick', options=[
        # (task e1a1e009; J 20 Nov 07:12 Z: "use cinematic lighting to stage it better so that the focal point is the relaxed woman"):
        # A's own pixels, the light staged on her and the room flagged down in the picture itself; the page's shade eases (light)
        dict(key='lit', label='A, re-lit', img='om-pause-rest-lit.webp', ai=AI_GUEST, pos=PAUSE_PICK_POS, light=.4,
             alt='A generated guest resting at a shampoo basin at Salon OM, eyes closed, warm light on her face and towel, the room in shade',
             note='Your pick, lit like a film still: the light on her face and the towel, the room falling into shade.'),
        # (task e1a1e009, every try on record ac8238bb): at the model's 1248 px, sharpened only once J picks (J 18 Nov); pos = her face
        dict(key='exhale', label='S1 · The exhale at the basin', img='om-pause-exhale.webp', ai=AI_GUEST, pos='46.2% 49.9%',
             alt='A generated guest lying back at a shampoo basin at Salon OM, eyes closed, a towel over her black cape, her hair falling to the bowl',
             note='Lying back at the basin, eyes closed, in your 25 Oct picture of the basins room.'),
        dict(key='window', label='S2 · Face to the window', img='om-pause-window.webp', ai=AI_GUEST, pos='61.1% 23.9%',
             alt='A generated guest sitting back in a styling chair by the window at Salon OM, her face lifted to the daylight, eyes closed',
             note='Sitting back in the chair by the window, her face lifted to the daylight.'),
        # (msg 3d46766e to the CEO MA): the salon's own photo 2, no one in it
        dict(key='lounge', label='The lounge by the fire', img='real-lounge.webp', alt=STEP_ALT[3], pos='55% 55%',
             note='The real lounge by the fireplace, no one in it.'),
        # the pause's picture before J's pick (task a78e6208): the salon's photo 4, cleaned as the client asked
        dict(key='chair', label='The empty chair by the window', img=PAUSE_DOOR, alt=PAUSE_DOOR_ALT, pos='55% 55%',
             note='The empty styling chair by the window, daylight on the leather: the pause before your pick.'),
    ]),
    # Inner Work's pause (task e1a1e009): its picture today is her photo by the fire (IW_PHOTO lounge_seated)
    'real-maggie-lounge-seated.webp': dict(name='The pause’s picture', live='Today’s: the coach seated by the fire', options=[
        dict(key='fire-tea', label='I1 · Tea by the fire', img='iw-pause-fire-tea.webp', ai=AI_GUEST, pos='38.4% 19%',
             alt='A generated guest on the striped bench by the lit fireplace, a mug of tea in both hands, eyes closed',
             note='A guest on the bench by the lit fire, tea in both hands, eyes closed.'),
        dict(key='coach-fire', label='I2 · By the fire, re-lit', img='iw-pause-coach-fire.webp', pos='47% 28%',
             alt='The coach sitting by the fireplace in the lounge, warm light on her face',
             note='Her own photo by the fireplace, re-lit with warm light on her face.'),
        dict(key='shelves', label='I3 · A quiet moment by the fire', img='iw-pause-shelves.webp', ai=AI_GUEST, pos='18.5% 22.6%',
             alt='A generated guest leaning back on the striped bench by the lit fireplace, eyes closed, a notebook on her lap, seen through the shelves',
             note='A guest leaning back by the fire, a notebook on her lap, seen through the shelves.'),
    ]),
    # the service pictures' candidates (task b1dd24c9; J 19 Nov 18:15 Z: "think like a professional photographer"): each one
    # Qwen-Image-Edit 2511 on the Mac Studio, finished with salon-om-pictures/tools/room_restore.py (the model's picture, the
    # photographer's pixels laid back wherever the two rooms agree), checked at 1:1 (face, hands, every contact, light against
    # the room); every try in Test Lab EXP-salonom-menu-guest-1
    'om-menu-blonding.webp': dict(name='Blonding', live='Today’s: the guest at the basin', options=[
        dict(key='chair', label='In the styling chair, under the blonde poster', img='om-menu-blonding-bl9b4.webp', ai=AI_GUEST, pos='42% 38%',
             alt='A generated guest with long golden-blonde hair in a styling chair under an Aveda poster at Salon OM, seen from behind',
             note='Seen from behind in the chair, her long golden hair lit by the blind; the real poster and room.'),
        dict(key='basin', label='At the rinse, in your 25 Oct basins room', img='om-menu-blonding-bl10a2.webp', ai=AI_GUEST, pos='50% 43%',
             alt='A generated guest reclined at a shampoo basin at Salon OM, eyes closed, a towel round her shoulders, below shelves of Aveda bottles',
             note='Reclined at the basin, her hair falling back into the bowl, below the tidy shelves of your 25 Oct picture.'),
    ]),
    'om-menu-color-correction.webp': dict(name='Color Correction', live='Today’s: the guest by the Aveda canvas', options=[
        dict(key='bar', label='At the colour bar', img='om-menu-color-correction-cc11a1.webp', ai=AI_GUEST, pos='62% 45%',
             alt='A generated guest with even, glossy medium-brown hair in profile at the colour bar at Salon OM',
             note='Chest up in profile at the colour wall, her hair one even glossy brown.'),
    ]),
    'om-menu-extensions.webp': dict(name='Luxury Extensions', live='Today’s: the guest on the bench by the fire', options=[
        dict(key='shelves', label='Between the Aveda shelves, by the window', img='om-menu-extensions-ex11a2.webp', ai=AI_GUEST, pos='50% 45%',
             alt='A generated guest with very long, full, warm-brown waves, seen from behind between the Aveda shelves at Salon OM',
             note='Seen from behind, long full waves down her back lit by the windows; the real shelves and products.'),
    ]),
    # Finishing Touches (J 19 Nov 18:15 Z: "not showing enough the products on the right"): a framing per width. Its options
    # swap the tall desktop panel only (only='mn__img'); the phone row keeps the liked picture, which its 3:2 shows whole
    'om-menu-finishing-touches.webp': dict(name='Finishing Touches, desktop', live='Today’s: your liked picture, framed on her', only='mn__img', options=[
        dict(key='portrait', label='The same guest, framed for the tall panel', img='om-menu-finishing-touches-ft12a1.webp', ai=AI_GUEST, pos='45% 50%',
             alt='A generated guest with softly shaped brows holding a glo tube beside the glo skincare display at Salon OM',
             note='The woman you liked, placed by the display for the tall panel: her whole head and the glo products beside her. The phone keeps your liked picture.'),
    ]),
}


# THE FILMS SWITCH (build.FILMS_SHOWN; J 18 Nov, task 5479dd6c). With the films off, a film spot on M, G and S shows a still:
# a step shows its own real photo (build.chapter drops the film layer, the photo stays whole); the two heroes show the
# sharpest frame of their film (a mood film: no person, no salon), upscaled x4 on the Mac Studio and drawn like any picture here
# (img/, srcset). StoryLegal, 18 Nov (msg a091eaf1, 65 %): a frame of today's mood films needs no label; the footer's AI line
# (mgs_sections.FOOT_AI_LINE) says every other picture is made with AI
FILM_STILLS = {'hero': ('film-hero-forest.webp', 'a misty forest with sun rays'), 'air': ('film-air-curtains.webp', 'sunlight through white curtains at a window')}


def film_still(name):
    """the picture that stands where a film plays (build.film calls it when the films are off). A film with no still of its
    own (a step's element film: the step's photo is its picture) leaves an empty frame"""
    if name not in FILM_STILLS:
        return '<div class="s__media"><div class="s__zoom"></div></div>'
    f, alt = FILM_STILLS[name]
    return f'<div class="s__media"><div class="s__zoom"><img src="img/{f}" alt="" decoding="async"></div></div>'
# Begin has its own photo, used nowhere else on the page: Maggie by the Aveda shelves (round 4: the empty chair by the
# window moved to the pause)
CLOSE_IMG = {'begin': ('real-maggie-standing-shelves.webp', '50% 28%')}    # Inner Work's: its words' close_img (copy_2_2_iw.py)
FOOT_VISIT = 'Salon OM in person'   # round 4 (task 0fea0949, J "GO GO" 11 Nov): where Inner Work happens stays unsaid until Maggie says it
TEAM_IMG = [('real-maggie-arms-crossed.webp', 'Maggie Woodward in front of the Aveda shelves at Salon OM'),
            ('real-katie.webp', 'Katie Paonessa at Salon OM'),
            ('real-chesney.webp', 'Chesney Missamore at Salon OM')]   # cut from 9-team-of-three.jpg by elimination (J, 11 Nov): Katie left, Maggie centre, Chesney right


def cfg(letter, name, salon, coaching, menu_salon, menu_coaching, steps=True):
    rail = [(s[0], STEP_ID[k] if steps else 'visit') for k, s in enumerate(M.STEPS)]
    chs = [d for kind, d in coaching if kind == 'ch']      # the twin's five steps name the rail in Inner Work
    return {
      'title': f'Salon OM · An Aveda Concept Salon · Option 2.2-{letter}', 'theme': 'dawn', 'draft': f'Option 2.2 · {name}',
      'desc': 'Where Beauty and Inner Work Belong. Salon OM, an Aveda Concept Salon, and Inner Work with Maggie, both with Maggie Woodward.',
      'book_salon': 'begin', 'book_coaching': 'c-begin', 'book_salon_href': BOOK_URL, 'book_coaching_href': CALL_URL,
      'worlds': {'salon': 'Salon OM', 'coaching': 'Inner Work with Maggie'},
      'book_salon_label': BOOK, 'book_coaching_label': CALL,
      'menu_salon_btn': BOOK, 'menu_coaching_btn': CALL,
      'foot_visit': FOOT_VISIT,
      'rail': rail,
      'rail_coaching': [(chs[k]['name'] if chs else t, TWIN + h) for k, (t, h) in enumerate(rail)],
      'menu': {'salon': menu_salon, 'coaching': menu_coaching},
      'salon': _close(salon), 'coaching': _close(coaching),
    }


def _close(slides):
    """Begin is drawn as the closing screen (mgs_sections.close) wherever it stands, and the footer sits inside the slide it
    follows, the world's last (mgs_sections.with_foot; approved feature 14): Begin's own on M, the second door's on G and S,
    where each world's last call to action comes before its door to the other world (task d9a90616; J 19 Nov 12:06 Z: "the
    call to action ... should be before the gate to the other world ... Otherwise, the user will not get to the final call
    to action before being tempted to move away to the other world"). A section's options (Shift+V) carry the footer too."""
    out = []
    for kind, d in slides:
        if kind == 'cta':
            out.append((S.close, dict(cta=d, img=d.get('close_img') or CLOSE_IMG[d['id']])))
        elif kind == 'end' and out:
            k, last = out.pop()
            last = dict(last, foot=dict(d, foot_visit=FOOT_VISIT))
            if last.get('options'):
                last['options'] = [dict(o, kind=S.with_foot(o['kind'])) if 'kind' in o else o for o in last['options']]
            out.append((S.with_foot(k), last))
        else:
            out.append((kind, d))
    return out


def salon_hero(proof=False, visit='arrive', line=None):
    """line (G, S; task b9a04e51): the version's own short line under the name, so its ROT hook is read in the first
    seconds instead of after five of her sentences; M keeps her full opening words."""
    f = M.FIRST
    o = M.SALON_OPEN   # her salon opening screen (11 Nov); `open` and `aveda` let the design give it its own screen
    line = line or (f['pair'] + ' ' + o['title'] + ' ' + ' '.join(o['lines']) + ((' ' + draft(D['proof'])) if proof else ''))
    # one action per world from the first screen (J 4 Nov; task b9a04e51): M's first button is her own opening screen's
    # "Book your visit" (her 11 Nov copy), not the "Salon OM" door, which only scrolled into the page it was already on
    ctas = btn(BOOK if proof else o['btns'][0], BOOK_URL, 'light', arrow=True) + btn(f['doors'][1], '#coaching', 'ghost', world='coaching')
    return ('hero_mark', dict(id='top', film='hero', next='pause' if not proof else visit, hook=f['tagline'],
                              eyebrow=f['name'], line=line, ctas=ctas, note=f['close'], aveda=M.FIRST_AVEDA,
                              open=dict(o, btns=btn(o['btns'][0], BOOK_URL, 'light', arrow=True) + btn(o['btns'][1], '#pause', 'ghost'))))


# the five steps' ways to scroll (task bfbe9e35; J 20 Nov 07:18 Z: "I don't like any of the effects on the 5 steps scroll
# triggered, do something really beautiful and clean, simple and beautfiul and clean. Give more ideas but first remove the
# current ones"): one choice for all five (option_key), in both worlds; each draws the same step with move= (build.chapter:
# only its class changes), today's stays the default until J picks. Reference page: option-2.2-mgs/refs/#steps-scroll.
# Never reuse the keys breath, fade or sheet: a browser may still remember them for the three effects he had removed
STEP_OPTIONS = [
    dict(key='still', label='A · Still pictures', move='still',
         note='Each step’s picture stands still. Only the edge between two steps travels, and the words travel with it.'),
    dict(key='sheets', label='B · Sheets', move='sheets',
         note='The next step is laid over the last like a sheet, its picture and words together. The one before stays and dims.'),
    dict(key='room', label='C · One room', move='room',
         note='Nothing travels. The picture dissolves into the next step’s and the words change in place.'),
    dict(key='focus', label='D · Into focus', move='focus',
         note='Each step arrives soft and comes into focus as it settles, the picture and then its title.'),
]
STEP_OPTION_WORDS = dict(option_key='steps', option_name='The five steps', option_label='Today’s: the photo, then its film',
                         option_note='Each step’s photo, giving way to its nature film a few seconds after it arrives.')


def step(k, extra=None, cta=False, specs_more=None):
    rail, name, line, what, feel = M.STEPS[k]
    body = what + ((' ' + draft(extra)) if extra else '')
    d = dict(id=STEP_ID[k], chapter=k, sound=STEP_FILM[k], film=STEP_FILM[k], acc=STEP_FILM[k], num=f'0{k + 1}', of='/ 05',
             name=rail, sub=name.split(' · ')[-1], title=line, body=body, specs=M.STEP_DETAILS[k] + (specs_more or []),
             film_top=dict(poster='img/' + STEP_IMG[k]), options=STEP_OPTIONS, **STEP_OPTION_WORDS)
    if cta: d['btn'] = btn(BOOK, BOOK_URL, 'light', arrow=True)
    return ('ch', d)


def team(note=False, sid='hosts'):
    m = dict(M.TEAM[0], img=TEAM_IMG[0][0], alt=TEAM_IMG[0][1])
    people = [m] + [dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in (1, 2)]
    d = dict(id=sid, layout='letter', ph_tag=False, eyebrow='Meet the team', title=M.TEAM_LINE,
             intro=M.TEAM[0]['desc'], people=people, with_label='With', lead=True)   # her card's name and role (11 Nov)
    if note: d.update(note=draft(TEAM_NOTE), sign='Maggie')
    return ('team', d)


def services(eyebrow=M.MENU_EYEBROW, sid='services'):
    # one booking button under the menu: the booking page has no link per service, so six buttons would all go to one place
    tiles = [dict(img=(SERVICE_PHOTO[k] or (None, '', ''))[0], alt=(SERVICE_PHOTO[k] or (None, '', ''))[1], pos=(SERVICE_PHOTO[k] or (None, '', ''))[2],
                  ai=AI_GUEST if SERVICE_PHOTO[k] else None,
                  missing=f'Photo to come: {svc} at Salon OM', tag=trip, price=price, title=svc)
             for k, (svc, trip, price) in enumerate(M.SERVICES)]
    return (S.menu, dict(id=sid, layout='menu', eyebrow=eyebrow, title=M.MENU_LINE, intro=M.MENU_INTRO, tiles=tiles,
                           note=M.MENU_NOTE, beneath=M.MENU_BENEATH,
                           btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))


def voices(cta=False, n=None):
    d = dict(id='kind', eyebrow=M.VOICES_EYEBROW, title=M.VOICES_LINE, quotes=M.QUOTES if n is None else M.QUOTES[:n])
    if cta: d['btn'] = btn(BOOK, BOOK_URL, arrow=True)
    # round 5 (J 13 Nov: "the layout was better in the previous iteration, the center testimonial, the nice animation ...
    # not color I like this background color"): round 3's centred voices slide and its motion, on round 4's forest ground
    # (mgs.css, salon world). S.voices_row (round 4's sideways row) is no longer used.
    return ('voices', d)


def door(short=False, exact=False):
    d = M.DOOR
    b = btn(d['btns'][0], '#coaching', 'light', arrow=True, world='coaching')
    call = btn(d['btns'][1], CALL_URL, 'ghost')
    # J 18 Nov: "It's very hard to read the text ... Maybe the thing we're doing of lenticular sheet could help here" (task 95e37a41)
    sheet = dict(sheet=S.DOOR_SHEET, options=S.DOOR_OPTIONS, option_label=S.DOOR_LIVE_LABEL)
    if short:
        return (S.door_sheet, dict(id='deeper', img='meadow.webp', mark=S.ai_mark(AI_MADE), eyebrow='The second door', title=d['title'], text=d['paras'][2], btn=b, **sheet))
    b += call
    return (S.door_sheet, dict(id='deeper', img='meadow.webp', mark=S.ai_mark(AI_MADE), eyebrow='The second door', title=d['title'], text=d['paras'][0],
                               more=([d['paras'][1]] if exact else [d['paras'][1] + ' ' + draft(A11['call'])]) + d['paras'][2:], btn=b, **sheet))


def begin(summary=False, online=False):
    # her 11 Nov Begin: her text, "Begin." as the last word, her two buttons (summary kept for callers). online (G, S; CEO MA
    # review of c446e8ba): 'Book online' to her booking page as a third button, dotted for her approval. M stays call and email.
    # Since task b9a04e51 no version passes online=True: her booking page shows "No services available" (checked 17 Nov
    # 2026), so the button led nowhere, and a third button split the one action at the moment it is taken
    calls = btn(M.BEGIN_BTNS[0][0], M.BEGIN_BTNS[0][1], 'light', arrow=True) + btn(M.BEGIN_BTNS[1][0], M.BEGIN_BTNS[1][1], 'ghost')
    if online:
        calls += btn('Book online', BOOK_ONLINE_URL, 'ghost').replace('>Book online<', '>' + draft('Book online') + '<')   # btn() escapes its label
    return ('cta', dict(id='begin', film='hero', cls='cta--long', label='Begin', title=M.BEGIN, text=M.BEGIN_TEXT,
                        last=M.BEGIN_LAST, btn=calls))


IW_BLOCK = M.FOOTER['iw'][:2] + [f'<a href="mailto:{M.FOOTER["iw"][2]}">{M.FOOTER["iw"][2]}</a>']


def salon_end(legend, visit='arrive', explore=None, iw=True):
    # her 11 Nov footer, on every page: brand, salon details, contact, the Inner Work block, disclaimer, her copyright.
    # iw=False (G, S; task b9a04e51): no Inner Work block in the salon footer. J 4 Nov: the other world only "at the top
    # and in the section that is specific for that"; the bottom link goes to this world's own action (Begin)
    return ('end', dict(id='letters', title='', name=M.FOOTER['name'], tagline=M.FOOTER['tagline'], no_letters=True, disclaimer=M.DISCLAIMER, legend=legend,
                        brand_lines=[M.FOOTER['salon']], iw_block=IW_BLOCK if iw else None, copyright=M.FOOTER['copyright'],
                        connect=[SALON_INFO['phone'], SALON_INFO['email']],
                        visit=[SALON_INFO['address'], SALON_INFO['hours'], SALON_INFO['hours_note']],
                        explore=explore or [('The visit', visit), ('The team', 'hosts'), ('The menu', 'services'), ('Begin', 'begin')]))


# ---------------------------------------------------------------- Inner Work with Maggie: the salon world's twin
# J, 18 Nov 2026 (task 7a3c013b): "I said both would follow the same style, only the copy is what is going to change. Same
# sections, same color" and "Not only that but also the secuence of sections. Only the copy is what changes." So the
# Inner Work world IS the salon world of the same version (M, G or S): its sections in their order, with their films,
# sounds, tones, colours, layouts and motion. J, 18 Nov, 15:4x Z: "oh sorry, yeah the pictures change, only the pictures. The
# sequence, sections, colors, style, films stay the same. So pictures and copy change". twin() lays Inner Work's words and
# pictures (copy_2_2_iw.py) over it and nothing else.
TWIN = 'c-'          # every Inner Work section id is its salon twin's, with this in front
# the fields that carry words (and the links of their buttons), and those that carry pictures (with their alt text, crop
# and AI label). Anything else (a film, sound, tone, layout flag) stays the salon section's; an entry naming one stops the build
TWIN_WORDS = {'hook', 'eyebrow', 'line', 'rot', 'ctas', 'note', 'aveda', 'open', 'aria', 'label', 'text', 'after', 'accents',
              'proof_line', 'btn', 'reward', 'answer', 'title', 'rows', 'name', 'sub', 'body', 'specs', 'paras', 'quote', 'cite',
              'facts', 'src', 'intro', 'people', 'with_label', 'sign', 'tiles', 'beneath', 'quotes', 'more', 'last', 'tagline',
              'disclaimer', 'legend', 'brand_lines', 'iw_block', 'copyright', 'connect', 'visit', 'explore', 'steps', 'line_k'}
TWIN_PICTURES = {'breath', 'breath_alt', 'breath_mark', 'breath_pos', 'film_top', 'photo', 'line_img', 'img', 'mark', 'close_img'}
# lists of cards: each card takes its words, and its picture
TWIN_CARD_WORDS = {'people': {'name', 'role', 'desc', 'img', 'alt'}, 'tiles': {'title', 'tag', 'price', 'missing', 'img', 'alt', 'pos', 'ai'}}


def twin(salon, words):
    """the Inner Work world: each salon section (kind, d) in order, its id (and the id it scrolls to) prefixed TWIN, its word
    and picture fields replaced by words[<salon id>]. Every salon section needs an entry; S's visit steps are
    (n, name, line, img, alt): three fields keep the salon's picture, five give Inner Work's"""
    ids = [d['id'] for _, d in salon]
    missing, extra = [i for i in ids if i not in words], [i for i in words if i not in ids]
    assert not missing and not extra, f'twin: Inner Work words missing for {missing}, or for no salon section: {extra}'
    out = []
    for kind, d in salon:
        w, nd = words[d['id']], dict(d)
        bad = sorted(set(w) - TWIN_WORDS - TWIN_PICTURES)
        assert not bad, f'twin: the entry for "{d["id"]}" sets {bad}; films, sounds, colours and layout stay the salon\'s'
        left = sorted(k for k in TWIN_WORDS if d.get(k) and k not in w)
        assert not left, f'twin: "{d["id"]}" would keep the salon\'s words for {left}: give each Inner Work words, or None'
        for k, v in w.items():
            if k in TWIN_CARD_WORDS and isinstance(d.get(k), list):
                assert 0 < len(v) <= len(d[k]), f'twin: "{d["id"]}" has {len(d[k])} {k}, its words give {len(v)}'
                for a, c in zip(d[k], v):
                    assert set(c) <= TWIN_CARD_WORDS[k], f'twin: a card in "{d["id"]}" sets {sorted(set(c) - TWIN_CARD_WORDS[k])}'
                    left = sorted(f for f in TWIN_CARD_WORDS[k] if a.get(f) and f not in c)
                    assert not left, f'twin: a card in "{d["id"]}" would keep the salon\'s words for {left}'
                nd[k] = [dict(a, **b) for a, b in zip(d[k], v)]
            elif k == 'steps' and d.get('steps') and len(d['steps'][0]) == 5:
                assert len(v) == len(d['steps']), f'twin: "{d["id"]}" has {len(d["steps"])} steps, its words give {len(v)}'
                nd[k] = [tuple(b) + tuple(a[len(b):]) for a, b in zip(d['steps'], v)]
            else:
                nd[k] = v
        nd['id'] = TWIN + d['id']
        if d.get('next'): nd['next'] = TWIN + d['next']
        out.append((kind, nd))
    return out


# ---- Inner Work's pictures and the words' adapter (task 7a3c013b) --------------------------------------------------------
# J, 18 Nov: "pictures and copy change". The words are Copywriter 1's (copy_2_2_iw.IW, task 51b1c84d); the pictures are
# placed here, all her own photos of the February shoot (CEO MA, 18 Nov: her own portraits first): Maggie in the white
# blazer she wears in her Inner Work pictures (by the fire, outdoors) where the salon shows her in black, the lounge, and
# the salon's styling chair for the door that leads back to the salon. Each is placed by its frame's shape, and never where
# the salon shows the same original photo (check_one_design compares originals). The nine added 18 Nov are the shoot's
# originals 1401, 1387, 1368, 1410, 1292-2, 1403, 1279-2, 1373 and 1381, downscaled to 1280 (not sharpened).
IW_PHOTO = dict(
    portrait=('real-maggie-portrait-iw.webp', 'Maggie Woodward with her arms crossed, smiling, at Salon OM'),
    fire=('real-maggie-fireplace.webp', 'Maggie Woodward seated by the fireplace at Salon OM, in a white blazer'),
    outdoor=('real-maggie-outdoor.webp', 'Maggie Woodward outside, in a white blazer'),
    wall=('real-maggie-product-wall.webp', 'Maggie Woodward standing in the window light at Salon OM'),
    lounge=('real-lounge-iw.webp', 'The lounge at Salon OM: a fireplace, a clock and a striped bench in warm light'),
    chair=('real-styling-chair.webp', 'The styling chair by the window at Salon OM'),
    # the second door, back to the salon: J's own cleaned-up picture of the basins room, the Aveda products organised on the wall
    # (task 95e37a41; J 18 Nov 17:24 Z: "we already had a cleanup version of this image and you used the one that's not cleaned up.
    # The one in which we removed some things and organized the beauty products on the wall"; CEO MA 20 Nov: photo 16 leaves the
    # door). The same file as step 02, built on his 25 Oct picture at full size and measured against it (photo_sources, row 23)
    salon_door=('real-shampoo-basins.webp', 'The shampoo basins at Salon OM, the Aveda products organised on the wall'),
    lounge_seated=('real-maggie-lounge-seated.webp', 'Maggie Woodward seated by the fireplace in the lounge at Salon OM, in a white blazer'),
    outdoor_chin=('real-maggie-outdoor-chin.webp', 'Maggie Woodward outside in a white blazer, her hand at her chin'),
    outdoor_portrait=('real-maggie-outdoor-portrait.webp', 'Maggie Woodward outside in a white blazer, smiling'),
    fireside_close=('real-maggie-fireside-close.webp', 'Maggie Woodward seated by the fireplace at Salon OM, smiling, in a white blazer'),
    warm=('real-maggie-warm.webp', 'Maggie Woodward smiling, her hand at her cheek, at Salon OM'),
    fireside=('real-maggie-fireside.webp', 'Maggie Woodward seated by the fireplace at Salon OM, in a white blazer'),
    smile=('real-maggie-smile.webp', 'Maggie Woodward with her arms crossed, smiling, at Salon OM'),
    outdoor_turn=('real-maggie-outdoor-turn.webp', 'Maggie Woodward outside in a white blazer, turned a little, her hand at her chin'),
    outdoor_wide=('real-maggie-outdoor-wide.webp', 'Maggie Woodward outside in a white blazer, by a flight of steps'),
    lounge_wide=('real-lounge-wide.webp', 'The lounge at Salon OM: the fireplace, the clock and the Aveda shelves'),
    salon_wide=('real-maggie-salon-wide.webp', 'Maggie Woodward with her arms crossed, smiling, at Salon OM'),
    outdoor_steps=('real-maggie-outdoor-steps.webp', 'Maggie Woodward outside in a white blazer by the steps, her hand at her chin'))
# the path's four offers (the menu's twin), one portrait each: (photo, focus point)
IW_PATH_PICS = [('warm', '50% 24%'), ('fireside', '50% 40%'), ('smile', '50% 26%'), ('outdoor_turn', '50% 24%')]
# the five steps of the Journey, five different photos (approved-features row 2), each a landscape original, so a step's
# full-width frame stays sharp on J's 6K window (row 18; QA 18 Nov: portrait originals there drew at 1.5x): (photo, focus)
IW_STEP_PICS = [('fire', None), ('lounge_wide', None), ('salon_wide', '50% 26%'), ('outdoor_steps', None), ('wall', None)]
# each place that still shows a repeat or a frame, and the coaching picture it waits for (next on task 7a3c013b)
IW_PICTURES_TO_MAKE = []      # none: every Inner Work picture place shows one of her own photos, none repeated within a section
IW_LEFT_OPEN = ['the drawn word mark of the first screen stays SALON OM, the site\'s mark in both worlds (copy_2_2_iw.NOTES asks for INNER WORK)']


def _iw_btn(b):
    """a button of copy_2_2_iw (B: label, to, kind, world, new) as the page draws it"""
    href = {'call': CALL_URL, 'book': BOOK_URL, 'salon': '#'}.get(b['to'], b['to'])
    h = btn(b['label'], href, b.get('kind') or '', arrow=b.get('kind') != 'ghost', world=b.get('world'))
    return h.replace('>' + E(b['label']), '>' + draft(b['label']), 1) if b.get('new') else h


def _iw_pic(key):
    return IW_PHOTO[key]


def iw_entries(v, salon):
    """Copywriter 1's words for version v (copy_2_2_iw.IW[v]) with Inner Work's pictures, in twin()'s shape: buttons drawn,
    the footer's unchanged lines named as kept, each picture place given its picture"""
    import copy_2_2_iw as IW
    out, k = {}, 0
    for kind, d in salon:
        sid, w = d['id'], dict(IW.IW[v][d['id']])
        w.pop('mark', None)                                            # IW_LEFT_OPEN
        for f in ('btns', 'ctas'):
            if isinstance(w.get(f), list): w['btn' if f == 'btns' else 'ctas'] = ''.join(_iw_btn(b) for b in w.pop(f))
        if isinstance(w.get('btn'), dict): w['btn'] = _iw_btn(w['btn'])
        if isinstance(w.get('open'), dict) and isinstance(w['open'].get('btns'), list):
            w['open'] = dict(w['open'], btns=''.join(_iw_btn(b) for b in w['open']['btns']))
        if kind == 'hero_mark':
            w['aria'] = M.IW_TITLE
        elif kind in ('tease', S.pause_scene) and d.get('breath'):   # the pause, whichever block draws its default (task 95ac520e)
            f, alt = _iw_pic('lounge_seated'); w.update(breath=f, breath_alt=alt, breath_mark='', breath_pos='')
        elif kind == 'ch':
            f, pos = IW_STEP_PICS[k]; k += 1; w['film_top'] = dict(d.get('film_top') or {}, poster='img/' + IW_PHOTO[f][0], pos=pos)
        elif kind is S.visit:
            w['steps'] = [tuple(x) + IW_PHOTO[IW_STEP_PICS[i][0]] for i, x in enumerate(w['steps'])]
        elif kind in (S.aveda, S.aveda_sheet):
            w['photo'] = _iw_pic('outdoor_chin')
        elif kind in ('team', 'proof'):
            w['people'] = [dict(c, img=_iw_pic('outdoor_portrait')[0], alt=_iw_pic('outdoor_portrait')[1]) for c in w['people']]
            if kind == 'proof': w['line_img'] = _iw_pic('outdoor_wide')
        elif kind is S.menu:
            w['tiles'] = [dict(t, img=IW_PHOTO[IW_PATH_PICS[i][0]][0], alt=IW_PHOTO[IW_PATH_PICS[i][0]][1], pos=IW_PATH_PICS[i][1], ai=None,
                               missing=f'Photo to come: {re.sub("<[^>]+>", "", t["title"])}') for i, t in enumerate(w['tiles'])]
        elif kind in ('bridge', S.door_sheet):
            w.update(img=_iw_pic('salon_door')[0], mark='')     # landscape, so its full-bleed frame stays sharp at 3230 (the chair drew at 1.42x)
        elif kind == 'cta':
            w['close_img'] = (_iw_pic('fireside_close')[0], '50% 30%')
        elif kind == 'end':     # the footer is the salon's, its legend and its links Inner Work's (copy_2_2_iw: legend None = the salon page's)
            keep = {f: d[f] for f in TWIN_WORDS if d.get(f)}
            w = dict(keep, **{f: x for f, x in w.items() if x is not None}, explore=[(t, h) for _, t, h in IW.NAV[v]])
        out[sid] = w
    return out


# ---- one look for both worlds, and the check that keeps it so (task 7a3c013b) ---------------------------------------------
# The CSS and scripts M, G and S share with 2.2 (add.css, next.css, next.js, engine.js) still give Inner Work a palette of
# its own and keep some looks and the step rail to the salon; 2.2-2.4 must stay byte-identical, so those files are left as
# they are and their M/G/S copy is rewritten at build: a rule scoped to one world may only decide what shows; a salon-only
# look is every world's; a rule on a salon section's id also covers its twin.
WORLD_PROPS = {'display', 'visibility', 'pointer-events', 'transform'}   # what shows, and the switch pill's side


def _css_items(css):
    """top-level items of a stylesheet: (prelude, body) for each block, (text, None) for whatever lies between"""
    out, i, n, start = [], 0, len(css), 0
    while i < n:
        if css.startswith('/*', i):
            i = css.index('*/', i + 2) + 2
        elif css[i] == '{':
            j, depth = i + 1, 1
            while depth:
                if css.startswith('/*', j): j = css.index('*/', j + 2) + 2; continue
                depth += (css[j] == '{') - (css[j] == '}'); j += 1
            out.append((css[start:i], css[i + 1:j - 1])); i = start = j
        else:
            i += 1
    if start < n: out.append((css[start:], None))
    return out


def _lead(prelude):
    """(comments and space before the selector, the selector)"""
    import re
    m = re.match(r'((?:\s|/\*.*?\*/)*)(.*)$', prelude, re.S)
    return m.group(1), m.group(2).strip()


def _decls(body):
    out, depth, cur = [], 0, ''
    for ch in body:
        depth += (ch == '(') - (ch == ')')
        if ch == ';' and depth == 0: out.append(cur); cur = ''
        else: cur += ch
    return [d for d in out + [cur] if d.strip()]


def _prop(decl):
    import re
    return re.sub(r'/\*.*?\*/', '', decl, flags=re.S).split(':', 1)[0].strip().lower()


def _twin_ids(sel, ids):
    import re
    return [x for x in ids if re.search(rf'#{re.escape(x)}(?![\w-])', sel)]


def one_design_css(css, ids, shared=True):
    """css with both worlds on one look. shared=True (the 2.2 files): a coaching look rule is dropped, a world-scoped rule
    keeps only its WORLD_PROPS. shared=False (mgs.css, M/G/S's own): such a rule stops the build instead, so a new one
    is never silently lost. Both: main[data-world="salon"] becomes main[data-world]; a selector on a salon section id
    gains its TWIN copy."""
    import re
    out = []
    for prelude, body in _css_items(css):
        if body is None:
            out.append(prelude); continue
        lead, sel = _lead(prelude)
        if sel.startswith('@'):
            nested = sel.split()[0] in ('@media', '@supports', '@container', '@layer')
            out.append(prelude + '{' + (one_design_css(body, ids, shared) if nested else body) + '}'); continue
        full, world = [], []
        for s in _split_selectors(sel):
            s = s.replace('main[data-world="salon"]', 'main[data-world]')
            if 'data-world="' in s:
                look = 'main[data-world="coaching"]' in s or not all(_prop(d) in WORLD_PROPS for d in _decls(body))
                assert shared or not look, f'mgs.css gives one world a look of its own: {s}'
                if 'main[data-world="coaching"]' not in s: world.append(s)
                continue
            full.append(s)
            for x in _twin_ids(s, ids):
                full.append(re.sub(rf'#{re.escape(x)}(?![\w-])', '#' + TWIN + x, s))
        if full == _split_selectors(sel) and not world:
            out.append(prelude + '{' + body + '}'); continue
        rules = []
        if full: rules.append(', '.join(full) + ' {' + body + '}')
        kept = [d for d in _decls(body) if _prop(d) in WORLD_PROPS]
        if world and kept: rules.append(', '.join(world) + ' {' + ';'.join(kept).strip() + '; }')
        out.append(lead + '\n'.join(rules))
    return ''.join(out)


# the shared scripts, the same way: exact lines, each found once or the build stops (so a change to them is noticed)
ONE_DESIGN_JS = [
    # engine.js: the step rail shows in whichever world's steps are on screen, not only the salon's
    ("rail.classList.toggle('is-on', chapter >= 0 && world === 'salon');", "rail.classList.toggle('is-on', chapter >= 0);"),
    # next.js: Inner Work's own header tone over its films (.hdr.is-film) has no look left to switch; it finds no films now
    ("""document.querySelectorAll('main[data-world="coaching"] :is(.s.hero, .s.ch, .s.cta)')""", '[]'),
    # next.js: Shift+V belongs to the option switcher (options.js, task e5325977); the world switch it cycled is listed there,
    # as the page's own options, so nothing it did is lost (?switch= links keep working: PRE_PAINT reads them)
    ("    if (!e.shiftKey || e.metaKey || e.ctrlKey || e.altKey || (e.key !== 'V' && e.key !== 'v' && e.code !== 'KeyV')) return;",
     "    return;   // M/G/S: Shift+V opens the option switcher (options.js)"),
]


def one_design_js(js):
    for a, b in ONE_DESIGN_JS:
        if a in js: js = js.replace(a, b)
    return js.replace('main[data-world="salon"]', 'main[data-world]')      # next.js: the salon's light-tone sections, both worlds


def _original(pic):
    """the photo a site picture is made from (export_photos.SOURCE: 'real-lounge-iw.webp' and 'real-lounge.webp' are both
    original 2), so a regraded copy of the salon's photo never passes for Inner Work's own"""
    import re
    global _SOURCES
    if '_SOURCES' not in globals():
        txt = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'export_photos.py')).read()
        _SOURCES = dict(re.findall(r"'([\w.-]+\.webp)':\s*'([om]:[^']+)'", txt))
    name = pic.split('/')[-1]
    return _SOURCES.get(name, name)


def check_one_design(body, css):
    """the build check (task 7a3c013b): the shipped page's two worlds have the same sections in the same order, each of the
    same type and layout, tone, sound and chapter, with the same films and the same number of picture places, and no salon
    picture shown in its Inner Work twin's place (J 18 Nov: "pictures and copy change"); and no CSS rule gives one world a
    look of its own. Any difference stops the build with what differs."""
    import re
    sig = {}
    for w in ('salon', 'coaching'):
        m = re.search(rf'<main id="main-{w}" data-world="{w}"[^>]*>(.*?)</main>', body, re.S)
        assert m, f'one design: no {w} world on the page'
        rows = []
        for s in re.split(r'(?=<section )', m.group(1))[1:]:
            tag = re.match(r'<section [^>]*>', s).group(0)
            sid = re.search(r' id="([^"]*)"', tag)
            a = {k: (re.search(rf' {k}="([^"]*)"', tag) or [None, None])[1] for k in ('class', 'data-tone', 'data-sound', 'data-chapter', 'style')}
            media = re.findall(r'(?<=\s)(?:src|data-src|data-src-top|poster)="([^"]+)"', s)
            films = [x for x in media if x.startswith('media/') or x.startswith('img/film-')]   # a film, or the still in its place
            fixed = re.sub(r'<figure class="mn__rph".*?</figure>|<article class="pf__p.*?</article>|<div class="om__ph mn__ph".*?</div>\s*</div>', '', s, flags=re.S)
            fixed = re.sub(r'<img class="tl__avatar[^>]*>', '', fixed)
            pics = [x for x in re.findall(r'(?<=\s)src="([^"]+)"', fixed) if x not in films]
            items = [x for x in media if x not in films and x not in pics]
            rows.append(((sid[1] if sid else '?'), (a, films, pics, items)))
        sig[w] = rows
    S_, C_ = sig['salon'], sig['coaching']
    bad = [f'{len(S_)} salon sections, {len(C_)} Inner Work sections'] if len(S_) != len(C_) else []
    for k, ((si, sv), (ci, cv)) in enumerate(zip(S_, C_)):
        if ci != TWIN + si: bad.append(f'section {k + 1}: salon "{si}", Inner Work "{ci}" (not its twin)')
        for name, x, y in (('layout', sv[0], cv[0]), ('films', sv[1], cv[1])):
            if x != y: bad.append(f'section {k + 1} ("{si}"): {name} differ: salon {x} / Inner Work {y}')
        if len(sv[2]) != len(cv[2]): bad.append(f'section {k + 1} ("{si}"): {len(sv[2])} picture places in the salon, {len(cv[2])} in Inner Work')
        same = sorted({x for x, y in zip(sv[2], cv[2]) if _original(x) == _original(y)} | {y for y in cv[3] if _original(y) in {_original(x) for x in sv[3]}})
        if same: bad.append(f'section {k + 1} ("{si}"): Inner Work shows the salon\'s own picture in its place: {same}')
    ids = [i for i, _ in S_]

    def rules(css):
        for prelude, b in _css_items(css):
            if b is None: continue
            sel = _lead(prelude)[1]
            if sel.startswith('@'):
                if sel.split()[0] in ('@media', '@supports', '@container', '@layer'): yield from rules(b)
                continue
            yield sel, b
    for sel, b in rules(css):
        for s in _split_selectors(sel):
            if 'data-world="' in s and ('main[data-world="' in s or not all(_prop(d) in WORLD_PROPS for d in _decls(b))):
                bad.append(f'CSS gives one world a look of its own: {s}')
        for x in _twin_ids(sel, ids):
            if '#' + TWIN + x not in sel: bad.append(f'CSS styles the salon\'s #{x} without its twin #{TWIN}{x}: {sel[:120]}')
    if "world === 'salon'" in body.split('/* ---- the frame loop', 1)[-1][:3000]: bad.append('the step rail still shows only in the salon')
    for w in ('salon', 'coaching'):     # a script that styles or marks one world's sections only
        if f'main[data-world="{w}"]' in body: bad.append(f'a script on the page still treats only the {w} world\'s sections: main[data-world="{w}"]')
    assert not bad, 'one design (J 18 Nov: only the copy changes):\n  ' + '\n  '.join(bad[:40])


# ---- one motion switch (task b36dde1f; CEO MA 17 Nov, under J's direction) ----------------------------------------------
# The review hosts (*.web.app, *.firebaseapp.com, loopback, a file) play full motion whatever the device asks; the launched
# site honours Reduce Motion ("calm": fades instead of movement). Every gated motion reads this one switch: the page's CSS
# through html[data-motion] (motion_css rewrites every prefers-reduced-motion block at build), its scripts through
# matchMedia, which on a review host answers the reduced-motion questions as "no preference". M/G/S only.
MOTION_HEAD = '''<script>(function () {
  var d = document.documentElement, h = location.hostname, mm = window.matchMedia && window.matchMedia.bind(window);
  var review = /(^|\\.)(web\\.app|firebaseapp\\.com)$/.test(h) || h === 'localhost' || /^127\\./.test(h) || h === '';
  var asks = !!(mm && mm('(prefers-reduced-motion: reduce)').matches);
  d.setAttribute('data-motion', asks && !review ? 'calm' : 'full');
  if (asks && review) window.matchMedia = function (q) {
    return mm(/prefers-reduced-motion:\\s*reduce/.test(q) ? 'not all' : /prefers-reduced-motion:\\s*no-preference/.test(q) ? 'all' : q);
  };
})();</script>
'''


def _split_selectors(sel):
    out, depth, cur = [], 0, ''
    for ch in sel:
        depth += (ch == '(') - (ch == ')')
        if ch == ',' and depth == 0: out.append(cur.strip()); cur = ''
        else: cur += ch
    return out + ([cur.strip()] if cur.strip() else [])


def motion_css(css):
    """Every @media (prefers-reduced-motion: reduce|no-preference) block becomes rules under html[data-motion]."""
    import re
    mq, out, i = re.compile(r'@media \(prefers-reduced-motion: (reduce|no-preference)\)\s*\{'), [], 0
    while True:
        m = mq.search(css, i)
        if not m: out.append(css[i:]); break
        out.append(css[i:m.start()])
        j, depth = m.end(), 1
        while depth: depth += (css[j] == '{') - (css[j] == '}'); j += 1
        body = re.sub(r'/\*.*?\*/', '', css[m.end():j - 1], flags=re.S)
        assert '@' not in body, 'motion_css: an at-rule inside a reduced-motion block'
        cond = '[data-motion="calm"]' if m.group(1) == 'reduce' else ':not([data-motion="calm"])'
        rules = []
        for sel, decl in re.findall(r'([^{}]+)\{([^{}]*)\}', body):
            sels = []
            for s in _split_selectors(sel):
                if s.startswith(':root'): s = 'html' + cond + s[5:]
                elif re.match(r'html(?![\w-])', s): s = 'html' + cond + s[4:]
                else: s = 'html' + cond + ' ' + s
                sels.append(s)
            rules.append(', '.join(sels) + ' {' + decl.strip() + '}')
        out.append(f'/* motion switch (was prefers-reduced-motion: {m.group(1)}) */\n' + '\n'.join(rules))
        i = j
    return ''.join(out)

def srcset(body, v):
    """Every picture on M, G and S at the size the screen needs (task b1dd24c9, approved features row 18): an <img> whose file
    has exports in img/hd/ (export_photos.py, listed in photo_exports.json) gets srcset with each width and sizes from the
    widest the page draws it (photo_sizes.json, measured by qa/sharpness.mjs --manifest at 390, 1440 and 3230, 5 % over
    for the slow zoom). src stays the 1280 file, the fallback. Only M, G and S call this; 2.2-2.4 never do."""
    import json, math, re
    here = os.path.dirname(os.path.abspath(__file__)) + '/'
    if not os.path.exists(here + 'photo_exports.json'):
        return body
    ex, sz = json.load(open(here + 'photo_exports.json')), json.load(open(here + 'photo_sizes.json')).get(v, {})

    def vw(e, k, w):
        return math.ceil(e[k] / w * 105) if e.get(k) else None

    def one(m):
        tag, name = m.group(0), m.group(1)
        # a picture with no measured size still gets its files where its place names how wide it draws it (sizes=: the pause's
        # full-bleed picture, J's pick A, task e1a1e009) or where it is a candidate
        if name not in ex or ' srcset=' in tag or (name not in sz and ' data-cand' not in tag and ' sizes=' not in tag):
            return tag
        stem = name[:-5]
        set_ = ', '.join(f'img/hd/{stem}-{w}.webp {w}w' for w in ex[name])
        # a place that names how wide it draws the picture keeps it (a full-bleed option, task e5325977); a picture's candidate
        # (section_options.pictures, task 279db527) is drawn at the size of the picture it stands in for, so it takes only its files
        if ' sizes=' in tag or ' data-cand' in tag:
            return tag.replace(f'src="img/{name}"', f'src="img/{name}" srcset="{set_}"', 1)
        e = sz[name]
        sizes = ', '.join(x for x in (f'(max-width: 700px) {vw(e, "w390", 390)}vw' if e.get('w390') else '',
                                      f'(max-width: 2000px) {vw(e, "w1440", 1440)}vw' if e.get('w1440') else '',
                                      f'{vw(e, "w3230", 3230)}vw') if x)
        return tag.replace(f'src="img/{name}"', f'src="img/{name}" srcset="{set_}" sizes="{sizes}"', 1)
    return re.sub(r'<img [^>]*?src="img/([^"/]+\.webp)"[^>]*>', one, body)


def low_after_first(body):
    """The opening loads first (task 5cb93228, J 18 Nov: "Ensure films, music all is extremely fast"): measured on a
    throttled 4G line (HTTP/2, one line shared as a phone's is), the opening film took 6-8 s to move because the page
    asked at once for some 3.3 MB of pictures, the hidden world's included. A world hidden at load loads its pictures
    as it is shown and the reader comes near them (loading="lazy", the page's own way for 16 pictures already; the
    engine reveals a photo only once it is decoded); the shown world's pictures after its first section still load
    from the start, at low priority, so they are there before the reader (measured: lazy there made a step's film wait
    for them, 7-9 s). A picture that already names how it loads keeps it."""
    import re
    def later(seg, hidden):
        if hidden: seg = re.sub(r'<img (?![^>]*loading=)', '<img loading="lazy" ', seg)
        return re.sub(r'<img (?![^>]*fetchpriority)', '<img fetchpriority="low" ', seg)
    out, pos = [], 0
    for m in re.finditer(r'<main[^>]*data-world="\w+"[^>]*>', body):
        hidden = re.search(r'\shidden(\s|>|=)', m.group(0)) is not None
        start = m.end() if hidden else body.find('</section>', m.end())
        if start < 0: continue
        out.append(body[pos:start])
        nxt = body.find('</main>', start)
        seg = body[start:nxt if nxt > 0 else len(body)]
        out.append(later(seg, hidden)); pos = start + len(seg)
    out.append(body[pos:])
    return ''.join(out)


# the film a browser plays best, one function for the page (task 5cb93228): the lighter HEVC twin where the browser
# plays HEVC, else the H.264 file; mgs.js asks it
FILM_HEAD = ("<script>window.omFilmSrc = function (v) { var h = v.getAttribute('data-src-hevc');"
             " return h && v.canPlayType && v.canPlayType('video/mp4; codecs=\"hvc1.1.6.L120.90\"') ? h : v.getAttribute('data-src'); };</script>\n")
def hevc_twins(body, media_dir):
    """Each film with a lighter HEVC twin beside it (media/<name>-hevc.mp4) names it (task 5cb93228, J 18 Nov: "Ensure
    films, music all is extremely fast"): WebKit plays a film only once some 2 s of it have arrived, so a film at half
    the bytes starts sooner on a slow line. Made from the same film, checked frame by frame at 100 % against it; a
    browser that cannot play HEVC keeps the H.264 file (mgs.js chooses, FILM_HEAD)."""
    import os, re
    def one(m):
        stem = m.group(1)
        if not os.path.exists(os.path.join(media_dir, stem + '-hevc.mp4')): return m.group(0)
        return m.group(0) + f' data-src-hevc="media/{stem}-hevc.mp4"'
    return re.sub(r'<video data-src="media/([\w-]+)\.mp4"', one, body)


# Every file a page names, at an address that changes with its content (task 01849ea5; J 19 Nov 08:01 Z, his Safari showing the
# pause's old picture after it was replaced: "someone brought back this section"). Firebase gives pictures, films and sounds a
# week's cache (fonts a month) under the same address while their bytes change, so a returning visitor keeps the old copy.
ASSET_REF = re.compile(r'(?<![\w/.:-])((?:[a-z0-9_-]+/)+[\w.%-]+\.(?:webp|jpe?g|png|svg|gif|avif|mp4|webm|mp3|m4a|aac|wav|woff2?|ttf|otf|css|js|json|vtt))(?![\w/?])')
_HASHES = {}


def asset_hash(path):
    """The first 10 hex of a file's sha-256, kept per (path, size, mtime) so a build hashes each file once."""
    import hashlib
    st = os.stat(path); key = (path, st.st_size, st.st_mtime_ns)
    if key not in _HASHES:
        h = hashlib.sha256()
        with open(path, 'rb') as f:
            for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
        _HASHES[key] = h.hexdigest()[:10]
    return _HASHES[key]


def hash_assets(doc, site):
    """Each picture, film, sound, font and icon the finished document names (in an attribute, a srcset, a CSS url() or a
    script's string) gets ?v=<its content's hash>: a changed file is a new address, so every browser fetches it at once,
    and an unchanged one keeps its address and its cached copy. A name with no file behind it stops the build (a broken
    picture). Firebase and the QA servers serve the file whatever the query, so nothing is renamed or staged differently.
    A CSS selector that matches an address's ending ([src$="name.webp"]) would no longer match, so it matches the name
    followed by its version instead. Only M, G and S call this; 2.2-2.4 never do."""
    def one(m):
        rel = m.group(1); f = os.path.join(site, rel)
        assert os.path.isfile(f), f'hash_assets: the page names {rel}, which is not in {site}'
        return f'{rel}?v={asset_hash(f)}'
    doc = ASSET_REF.sub(one, doc)
    return re.sub(r'\[src\$="([\w.%-]+)"\]', r'[src*="\1?v="]', doc)
