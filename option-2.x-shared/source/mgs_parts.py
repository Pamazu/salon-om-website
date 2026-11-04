"""Shared parts of the three copy versions on the 2.2 design (task cf7dd8fd, study febe2c3a section 8):
M = Maggie's order, G = Guided, S = Short. Words come only from copy_2_2_maggie.py (Maggie, word for word) and,
in G and S, the study's [draft] lines, wrapped in draft() so they show a dotted underline. This file holds layout
choices (films, photos, ids), never new words."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import copy_2_2_maggie as M
from build import btn, draft, ph

BOOK = 'Book your visit'                 # the salon's one action, the same words everywhere (study section 7, Q1)
CALL = M.CTA_IW                          # Inner Work's one action
LEGEND = 'Words with a dotted underline are new, for Maggie to approve. Words in [square brackets] are still to come.'
LEGEND_M = 'Every word here is from Maggie’s approved decks. Words in [square brackets] are still to come.'

# the study's [draft] lines (section 4, 6, 3b), word for word; Maggie's rule (no semicolons) applied to step 04
D = dict(
  proof='An Aveda Concept Salon in Avila Beach. Maggie has listened in the chair for 28 years.',
  preview='Your visit, in five steps.',
  benefits=['You are heard before anything is done to your hair.', 'The week’s tension lets go.',
            'Hair that suits you, from plant-based Aveda color.', 'Nothing is rushed. The time is yours.',
            'It still looks right next week.'],
  begin='Tea, a real conversation and unhurried time, made around you.',
)
# Q10/Q11 (Copywriter 1, 4 Nov): not in Maggie's decks, so left out of M and shown as [draft] in G and S
AVEDA_FACTS = [('100%', 'vegan formulas', True), ('1st', 'beauty company to manufacture with 100% wind power (2007)'),
               ('B Corp', 'certified for people and planet (2023)'), ('1978', 'the year plant-based, holistic beauty began', True)]
TEAM_NOTE = 'I’m the backdrop. It’s not about me, it’s about you. This is your time, your space.'

# one real photo per step (study section 6: a picture now, the film of that moment later), over its element film
STEP_IMG = ['real-lounge.webp', 'real-shampoo-basins.webp', 'real-color-bar.webp', 'real-maggie-fireplace.webp', 'real-styling-stations.webp']
STEP_FILM = ['earth', 'water', 'fire', 'air', 'ether']
STEP_ID = ['arrive', 'unwind', 'renew', 'unhurried', 'home']
SERVICE_IMG = ['real-color-bar.webp', 'real-katie.webp', 'real-aveda-shelves.webp', 'real-styling-chair.webp',
               'real-styling-stations.webp', 'real-shampoo-basins.webp']
SERVICE_ALT = ['The Aveda color bar at Salon OM', 'Katie Paonessa at Salon OM', 'The Aveda shelves at Salon OM',
               'A styling chair at Salon OM', 'The styling stations at Salon OM', 'The shampoo basins at Salon OM']
TEAM_IMG = [('real-maggie-arms-crossed.webp', 'Maggie Woodward in front of the Aveda shelves at Salon OM'),
            ('real-katie.webp', 'Katie Paonessa at Salon OM'), (None, '')]


def cfg(letter, name, salon, coaching, menu_salon, menu_coaching, steps=True):
    return {
      'title': f'Salon OM Option 2.2-{letter}', 'theme': 'dawn', 'draft': f'Option 2.2 · {name}',
      'desc': 'Where Beauty and Inner Work Belong. Salon OM, an Aveda Concept Salon, and Inner Work with Maggie, both with Maggie Woodward.',
      'book_salon': 'begin', 'book_coaching': 'c-begin',
      'worlds': {'salon': 'Salon OM', 'coaching': 'Inner Work with Maggie'},
      'book_salon_label': 'Book', 'book_coaching_label': 'Connection Call',
      'menu_salon_btn': BOOK, 'menu_coaching_btn': CALL,
      'foot_visit': 'Salon OM in person · Inner Work in person and online',
      'rail': [(s[0], STEP_ID[k] if steps else 'visit') for k, s in enumerate(M.STEPS)],
      'menu': {'salon': menu_salon, 'coaching': menu_coaching},
      'salon': salon, 'coaching': coaching,
    }


def salon_hero(proof=False):
    f = M.FIRST
    line = f['pair'] + ' ' + M.OPENING + ((' ' + draft(D['proof'])) if proof else '')
    ctas = (btn(BOOK, '#begin', 'light', arrow=True) + btn(f['doors'][1], '#coaching', 'ghost', world='coaching')) if proof else \
           (btn(f['doors'][0], '#pause', 'light', arrow=True) + btn(f['doors'][1], '#coaching', 'ghost', world='coaching'))
    return ('hero_mark', dict(id='top', film='hero', next='pause' if not proof else 'arrive', hook=f['tagline'],
                              eyebrow=f['name'], line=line, ctas=ctas, note=f['close']))


def step(k, extra=None, cta=False, specs_more=None):
    rail, name, line, what, feel = M.STEPS[k]
    body = what + ((' ' + draft(extra)) if extra else '')
    d = dict(id=STEP_ID[k], chapter=k, sound=STEP_FILM[k], film=STEP_FILM[k], acc=STEP_FILM[k], num=f'0{k + 1}', of='/ 05',
             name=rail, sub='', title=line, body=body, specs=[('Feel', feel)] + (specs_more or []),
             film_top=dict(poster='img/' + STEP_IMG[k]))
    if cta: d['btn'] = btn(BOOK, '#begin', 'light', arrow=True)
    return ('ch', d)


def team(note=False, sid='hosts'):
    m = dict(M.TEAM[0], img=TEAM_IMG[0][0], alt=TEAM_IMG[0][1])
    people = [m] + [dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in (1, 2)]
    d = dict(id=sid, layout='letter', ph_tag=False, eyebrow='Meet the team', title=M.TEAM_LINE,
             intro=M.TEAM[0]['desc'], people=people, with_label='With')
    if note: d.update(note=draft(TEAM_NOTE), sign='Maggie')
    return ('team', d)


def services(per_service_cta=True, sid='services'):
    tiles = []
    for k, (svc, trip, price) in enumerate(M.SERVICES):
        tiles.append(dict(img=SERVICE_IMG[k], alt=SERVICE_ALT[k], tag=trip, price=price, title=svc, text='',
                          btns=btn(BOOK, '#begin', 'sm') if per_service_cta else ''))
    return ('offers', dict(id=sid, layout='menu', eyebrow='Team and menu' if not per_service_cta else 'The menu',
                           title=M.MENU_LINE, intro='', tiles=tiles))


def voices(cta=False, n=4):
    d = dict(id='kind', title=M.VOICES_LINE, quotes=M.QUOTES[:n])
    if cta: d['btn'] = btn(BOOK, '#begin', 'light', arrow=True)
    return ('voices', d)


def door(short=False):
    d = M.DOOR
    b = btn(d['btns'][0], '#coaching', 'light', arrow=True, world='coaching')
    if short:
        return ('bridge', dict(id='deeper', img='meadow.webp', eyebrow='The second door', title=d['title'], text=d['paras'][2], btn=b))
    b += btn(d['btns'][1], '#coaching', 'ghost', world='coaching')
    return ('bridge', dict(id='deeper', img='meadow.webp', eyebrow='The second door', title=d['title'], text=d['paras'][0],
                           more=d['paras'][1:], btn=b))


def begin(summary=False):
    return ('cta', dict(id='begin', film='hero', cls='cta--long', label='Begin', title=M.BEGIN,
                        text=draft(D['begin']) if summary else '', btn=btn(BOOK, '#letters', 'light', arrow=True)))


def salon_end(legend):
    return ('end', dict(id='letters', title='', tagline=M.OPENING, no_letters=True, disclaimer=M.DISCLAIMER, legend=legend,
                        explore=[('The visit', 'arrive' if legend != 'S' else 'visit'), ('The team', 'hosts'), ('The menu', 'services'), ('Begin', 'begin')]))


# ---------------------------------------------------------------- Inner Work with Maggie
def iw_hero(short_cred=False):
    o = M.IW_OPEN
    d = dict(id='c-top', film='air', sound='air', next='c-deeper', at='.5s', sub_at='1.4s', foot_at='1.7s', cls='hero--long',
             eyebrow=M.IW_TITLE, title=o['title'], sub=o['sub'] + ' ' + o['line'],
             ctas=btn(o['btns'][0], '#c-begin', arrow=True) + btn(o['btns'][1], '#c-how', 'ghost'), note=o['note'])
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
    if cta: d['btn'] = btn(CALL, '#c-begin', arrow=True)
    return ('prose', d)


def iw_credentials():
    return ('prose', dict(id='c-cred', sound='air', eyebrow='Credentials', title='Maggie Woodward', list=[(c, '') for c in M.CREDENTIALS]))


def iw_path(cta=False):
    return ('steps', dict(id='c-path', sound='air', light=True, eyebrow='The path', title=ph(M.TO_COME['path_title']),
                          steps=[(f'0{k + 1}', n, t) for k, (_, n, t) in enumerate(M.PATH)], after=M.PRICING,
                          btn=btn(CALL, '#c-begin', arrow=True) if cta else ''))


def iw_voices_placeholder():
    return ('tease', dict(id='c-voices', sound='air', label='Voices', text=M.TO_COME['voices']))


def iw_begin():
    return ('cta', dict(id='c-begin', sound='air', film='air', cls='cta--long', label='Begin', title=ph(M.TO_COME['closing']),
                        text='', btn=btn(CALL, '#c-letters', 'light', arrow=True)))


def iw_end(legend):
    return ('end', dict(id='c-letters', sound='air', title='', tagline=M.FIRST['tagline'], no_letters=True, connect=M.FOOT_IW,
                        disclaimer=M.DISCLAIMER, legend=legend,
                        explore=[('Look a little deeper', 'c-deeper'), ('How we work together', 'c-how'), ('The path', 'c-path'), ('Begin', 'c-begin')]))
