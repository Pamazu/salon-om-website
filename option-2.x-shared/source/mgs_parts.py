"""Shared parts of the three copy versions on the 2.2 design (task cf7dd8fd, study febe2c3a section 8):
M = Maggie's order, G = Guided, S = Short. Words come only from copy_2_2_maggie.py (Maggie, word for word) and,
in G and S, the study's [draft] lines, wrapped in draft() so they show a dotted underline. This file holds layout
choices (films, photos, ids), never new words."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import copy_2_2_maggie as M
import mgs_sections as S
from build import btn, draft, ph

BOOK = 'Book your visit'                 # the salon's one action, the same words everywhere (study section 7, Q1)
CALL = M.CTA_IW                          # Inner Work's one action
# where each action really goes (task 0ab956d4): the salon books online through GlossGenius (study Q2); Inner Work has
# no booking page yet, so a Connection Call starts with an email to the address Maggie gave for it (her deck, 2 Nov)
BOOK_URL = 'https://maggiewoodward.glossgenius.com/book'
CALL_URL = 'mailto:connect@maggiewoodward.com?subject=Connection%20Call'
LEGEND = 'Words with a dotted underline are new, for Maggie to approve. Words in [square brackets] are still to come.'
LEGEND_M = 'Every word here is from Maggie’s approved decks. Words in [square brackets] are still to come.'

# the study's [draft] lines (section 4, 6, 3b), word for word; Maggie's rule (no semicolons) applied to step 04
D = dict(
  proof='An Aveda Concept Salon in Avila Beach. Maggie has listened in the chair for 28 years.',
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
AVEDA_FACTS = [('100%', 'vegan formulas, since 2021', True), ('1st', 'beauty company to manufacture with 100% wind power, at its primary facility (2007)'),
               ('B Corp', 'Certified B Corporation since 2023'), ('1978', 'the year Aveda began, with botanical products kind to people and the earth')]
# the salon's public details, 10 Nov 2026 (task df14fa0d): address and hours from Maggie's own booking page
# (maggiewoodward.glossgenius.com/about), phone from salonom.com, email from maggiewoodward.glossgenius.com/services,
# Instagram @salonomavilabeach (both). salonom.com: "Open by appointment only".
SALON_INFO = dict(address='56 Landing Passage, Avila Beach, CA 93424',
                  hours='Tuesday and Wednesday, 10 am to 4:30 pm. Thursday, 12:30 to 5 pm. By appointment.',
                  phone='<a href="tel:+18056271550">805 627 1550</a>',
                  email='<a href="mailto:contact@salonomavilabeach.com">contact@salonomavilabeach.com</a>',
                  instagram='<a href="https://www.instagram.com/salonomavilabeach/" target="_blank" rel="noopener">Instagram @salonomavilabeach</a>')
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
  # round 4 (task 2846db82, J 11 Nov: "She's sat in a pretty weird way ... give more variety to the angles"): Signature Color is
  # a new view of the real styling stations made from Maggie's photo 11, the guest seated in a styling chair; Blonding is
  # her photo 12 with the guest reclined at the basin, neck at the bowl, only the guest's zone pasted back (0 px outside)
  ('om-menu-signature-color.webp', 'A generated guest with rich, dimensional brunette colour in a styling chair, in a view of Salon OM made from its photos', '42% 52%'),
  ('om-menu-blonding.webp', 'A generated guest with bright, seamless blonde hair reclining at a shampoo basin, in a photo of Salon OM', '45% 58%'),
  None,     # Color Correction: its backdrop (15) was refused three times by the safety system (Test Lab), still to make
  ('om-menu-cut-and-style.webp', 'A generated guest with a polished bob beside stylist Katie Paonessa, in a photo of Salon OM', '33% 50%'),
  ('om-menu-extensions.webp', 'A generated guest with long, full hair beside Maggie Woodward, in a photo of Salon OM', '22% 40%'),
  ('om-menu-finishing-touches.webp', 'A generated guest with softly shaped brows beside the skincare display at Salon OM', '6% 40%'),
]
# Begin has its own photo, used nowhere else on the page: the empty chair by the window (salon), Maggie by the fire (Inner Work)
# round 4: the empty chair by the window moves to the pause (M, G), so the salon's Begin shows Maggie by the Aveda shelves
CLOSE_IMG = {'begin': ('real-maggie-standing-shelves.webp', '50% 28%'), 'c-begin': ('real-maggie-fireplace.webp', '72% 40%')}
CRED_IMG = ('real-maggie-outdoor.webp', 'Maggie Woodward outside, in a white blazer')
FOOT_VISIT = 'Salon OM in person · Inner Work in person and online'
TEAM_IMG = [('real-maggie-arms-crossed.webp', 'Maggie Woodward in front of the Aveda shelves at Salon OM'),
            ('real-katie.webp', 'Katie Paonessa at Salon OM'),
            ('real-chesney.webp', 'Chesney Missamore at Salon OM')]   # cut from 9-team-of-three.jpg by elimination (J, 11 Nov): Katie left, Maggie centre, Chesney right


def cfg(letter, name, salon, coaching, menu_salon, menu_coaching, steps=True):
    return {
      'title': f'Salon OM Option 2.2-{letter}', 'theme': 'dawn', 'draft': f'Option 2.2 · {name}',
      'desc': 'Where Beauty and Inner Work Belong. Salon OM, an Aveda Concept Salon, and Inner Work with Maggie, both with Maggie Woodward.',
      'book_salon': 'begin', 'book_coaching': 'c-begin', 'book_salon_href': BOOK_URL, 'book_coaching_href': CALL_URL,
      'worlds': {'salon': 'Salon OM', 'coaching': 'Inner Work with Maggie'},
      'book_salon_label': BOOK, 'book_coaching_label': CALL,
      'menu_salon_btn': BOOK, 'menu_coaching_btn': CALL,
      'foot_visit': FOOT_VISIT,
      'rail': [(s[0], STEP_ID[k] if steps else 'visit') for k, s in enumerate(M.STEPS)],
      'menu': {'salon': menu_salon, 'coaching': menu_coaching},
      'salon': _close(salon), 'coaching': _close(coaching),
    }


def _close(slides):
    """Begin and the footer become one closing screen (mgs_sections.close): an adjacent cta + end pair is merged."""
    out = []
    for kind, d in slides:
        if kind == 'end' and out and out[-1][0] == 'cta':
            c = out.pop()[1]
            out.append((S.close, dict(cta=c, end=dict(d, foot_visit=FOOT_VISIT), img=CLOSE_IMG[c['id']])))
        else:
            out.append((kind, d))
    return out


def salon_hero(proof=False, visit='arrive'):
    f = M.FIRST
    line = f['pair'] + ' ' + M.OPENING + ((' ' + draft(D['proof'])) if proof else '')
    ctas = (btn(BOOK, BOOK_URL, 'light', arrow=True) + btn(f['doors'][1], '#coaching', 'ghost', world='coaching')) if proof else \
           (btn(f['doors'][0], '#pause', 'light', arrow=True) + btn(f['doors'][1], '#coaching', 'ghost', world='coaching'))
    return ('hero_mark', dict(id='top', film='hero', next='pause' if not proof else visit, hook=f['tagline'],
                              eyebrow=f['name'], line=line, ctas=ctas, note=f['close']))


def step(k, extra=None, cta=False, specs_more=None):
    rail, name, line, what, feel = M.STEPS[k]
    body = what + ((' ' + draft(extra)) if extra else '')
    d = dict(id=STEP_ID[k], chapter=k, sound=STEP_FILM[k], film=STEP_FILM[k], acc=STEP_FILM[k], num=f'0{k + 1}', of='/ 05',
             name=rail, sub='', title=line, body=body, specs=[('Feel', feel)] + (specs_more or []),
             film_top=dict(poster='img/' + STEP_IMG[k]))
    if cta: d['btn'] = btn(BOOK, BOOK_URL, 'light', arrow=True)
    return ('ch', d)


def team(note=False, sid='hosts'):
    m = dict(M.TEAM[0], img=TEAM_IMG[0][0], alt=TEAM_IMG[0][1])
    people = [m] + [dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in (1, 2)]
    d = dict(id=sid, layout='letter', ph_tag=False, eyebrow='Meet the team', title=M.TEAM_LINE,
             intro=M.TEAM[0]['desc'], people=people, with_label='With')
    if note: d.update(note=draft(TEAM_NOTE), sign='Maggie')
    return ('team', d)


def services(eyebrow='The menu', sid='services'):
    # one booking button under the menu: the booking page has no link per service, so six buttons would all go to one place
    tiles = [dict(img=(SERVICE_PHOTO[k] or (None, '', ''))[0], alt=(SERVICE_PHOTO[k] or (None, '', ''))[1], pos=(SERVICE_PHOTO[k] or (None, '', ''))[2],
                  missing=f'Photo to come: {svc} at Salon OM', tag=trip, price=price, title=svc)
             for k, (svc, trip, price) in enumerate(M.SERVICES)]
    return (S.menu, dict(id=sid, layout='menu', eyebrow=eyebrow, title=M.MENU_LINE, intro='', tiles=tiles,
                           btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))


def voices(cta=False, n=4):
    d = dict(id='kind', title=M.VOICES_LINE, quotes=M.QUOTES[:n])
    if cta: d['btn'] = btn(BOOK, BOOK_URL, arrow=True)          # forest: Voices sits on light clay in the salon world
    return (S.voices_row, d)


def door(short=False):
    d = M.DOOR
    b = btn(d['btns'][0], '#coaching', 'light', arrow=True, world='coaching')
    call = btn(d['btns'][1], CALL_URL, 'ghost')
    if short:
        return ('bridge', dict(id='deeper', img='meadow.webp', eyebrow='The second door', title=d['title'], text=d['paras'][2], btn=b))
    b += call
    return ('bridge', dict(id='deeper', img='meadow.webp', eyebrow='The second door', title=d['title'], text=d['paras'][0],
                           more=d['paras'][1:], btn=b))


def begin(summary=False):
    return ('cta', dict(id='begin', film='hero', cls='cta--long', label='Begin', title=M.BEGIN,
                        text=draft(D['begin']) if summary else '', btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))


def salon_end(legend, visit='arrive', explore=None):
    return ('end', dict(id='letters', title='', tagline=M.OPENING, no_letters=True, disclaimer=M.DISCLAIMER, legend=legend,
                        connect=[f'<a href="{BOOK_URL}" target="_blank" rel="noopener">Book online</a>', SALON_INFO['phone'], SALON_INFO['email'], SALON_INFO['instagram']],
                        visit=[SALON_INFO['address'], SALON_INFO['hours']],
                        explore=explore or [('The visit', visit), ('The team', 'hosts'), ('The menu', 'services'), ('Begin', 'begin')]))


# ---------------------------------------------------------------- Inner Work with Maggie
def iw_hero(short_cred=False):
    o = M.IW_OPEN
    d = dict(id='c-top', film='air', sound='air', next='c-deeper', at='.5s', sub_at='1.4s', foot_at='1.7s', cls='hero--long',
             eyebrow=M.IW_TITLE, title=o['title'], sub=o['sub'] + ' ' + o['line'],
             ctas=btn(o['btns'][0], CALL_URL, arrow=True) + btn(o['btns'][1], '#c-how', 'ghost'), note=o['note'])
    if short_cred: d['line'] = M.CRED_SHORT
    return ('hero_words', d)


def iw_deeper(short=False):
    d = M.DEEPER
    paras = [d['paras'][0], d['paras'][2]] if short else d['paras']
    return ('prose', dict(id='c-deeper', sound='air', eyebrow='Recognition', title=d['title'], lead=d['lead'], paras=paras, close=d['close']))


def iw_how(cta=False, short=False):
    h = M.HOW
    d = dict(id='c-how', sound='air', eyebrow=h['eyebrow'], title=h['title'], paras=[] if short else h['paras'],
             list=h['practices'], small='' if short else h['cred_line'], close=h['close'])
    if cta: d['btn'] = btn(CALL, CALL_URL, arrow=True)
    return (S.dark_prose, d)


def iw_credentials(n=None):
    """n: only her first n credentials (S)"""
    return (S.cred, dict(id='c-cred', sound='air', eyebrow='Credentials', title='Maggie Woodward', list=[(c, '') for c in M.CREDENTIALS[:n]],
                         img=CRED_IMG[0], alt=CRED_IMG[1]))


def iw_path(cta=False):
    return (S.path_line, dict(id='c-path', sound='air', light=True, eyebrow='The path', title=ph(M.TO_COME['path_title']),
                          steps=[(f'0{k + 1}', n, t) for k, (_, n, t) in enumerate(M.PATH)], after=M.PRICING,
                          btn=btn(CALL, CALL_URL, arrow=True) if cta else ''))


def iw_voices_placeholder():
    return ('tease', dict(id='c-voices', sound='air', label='Voices', text=M.TO_COME['voices']))


def iw_begin():
    return ('cta', dict(id='c-begin', sound='air', film='air', cls='cta--long', label='Begin', title=ph(M.TO_COME['closing']),
                        text='', btn=btn(CALL, CALL_URL, 'light', arrow=True)))


def iw_end(legend):
    # where Inner Work sessions happen is not public: the town only, the rest is a question for Maggie (task df14fa0d)
    return ('end', dict(id='c-letters', sound='air', title='', tagline=M.FIRST['tagline'], no_letters=True, connect=M.FOOT_IW,
                        visit=['Avila Beach, California', 'Inner Work in person and online'],
                        disclaimer=M.DISCLAIMER, legend=legend,
                        explore=[('Look a little deeper', 'c-deeper'), ('How we work together', 'c-how'), ('The path', 'c-path'), ('Begin', 'c-begin')]))
