"""Inner Work's words and pictures for each section of the salon world (task 7a3c013b). J, 18 Nov 2026: "I said both would
follow the same style, only the copy is what is going to change. Same sections, same color", "Not only that but also the
secuence of sections. Only the copy is what changes." and then "oh sorry, yeah the pictures change, only the pictures. The
sequence, sections, colors, style, films stay the same. So pictures and copy change for [the client] inner work coaching".

One dict per version (M, G, S), keyed by the id of the salon section it stands in for, in the salon world's order.
mgs_parts.twin() lays these over that version's salon world, which keeps its films, sounds, colours, layouts and motion.
Every word field of a salon section needs its Inner Work words here, or None, and every picture place its Inner Work
picture: the build stops otherwise, and it stops too if an entry names a film or layout field.

PICTURES (Designer 2, 18 Nov): her own photos first (the February shoot: Maggie seated by the fire, arms crossed, outdoors in
the white blazer; the lounge), the salon's styling chair for the door that leads back to the salon. With four photos for
about thirteen places some repeat for now, and the six practices show a [Photo to come] frame: each such place gets its own
coaching picture next (a generated client only, labelled as StoryLegal ruled, made on our local models): see PICTURES_TO_MAKE.

SKELETON (Designer 2, 18 Nov): only the Inner Work words already on the site (her deck of 2 Nov; G's and S's own [draft]
lines), placed by the parallels on Copywriter 1's task 51b1c84d: the five steps carry her path, the menu her six practices,
Why Aveda her credentials, the team How we work together, the second door leads back to the salon. Words in [square
brackets] are still to come. Not placed yet: the three paragraphs of "Look a little deeper". Copywriter 1 replaces these
entries with each section's words (task 51b1c84d)."""
from mgs_parts import *

O, H, P = M.IW_OPEN, M.HOW, M.PATH
CALL_BTN = btn(CALL, CALL_URL, arrow=True)
CALL_LIGHT = btn(CALL, CALL_URL, 'light', arrow=True)
TO_SALON = btn(M.FIRST['doors'][0], '#', 'ghost', world='salon')     # J 4 Nov: the other world only at the top and in its own section
VOICES_TO_COME = [(M.TO_COME['voices'], '', '')]
STEP_NAMES = [n for _, n, _ in P] + ['[Still to come]']      # her path has four steps; the salon's visit has five

# ---- her photos (export_photos.py SOURCE: originals 3, 5, 13, 2 and 4 of the February shoot)
PORTRAIT = ('real-maggie-portrait-iw.webp', 'Maggie Woodward with her arms crossed, smiling, at Salon OM')
FIRE = ('real-maggie-fireplace.webp', 'Maggie Woodward seated by the fireplace at Salon OM, in a white blazer')
OUTDOOR = ('real-maggie-outdoor.webp', 'Maggie Woodward outside, in a white blazer')
LOUNGE = ('real-lounge-iw.webp', 'The lounge at Salon OM: a fireplace, a clock and a striped bench in warm light')
CHAIR = ('real-styling-chair.webp', 'The styling chair by the window at Salon OM')
# Placed by the frame's shape (QA 18 Nov: her arms-crossed portrait in a wide step frame cut her at the forehead), and
# never in the place where the salon shows the same original photo (the build check compares originals, not files).
# The five steps of her path: the Connection Call by the fire, a session in the lounge, Becoming steps outside
STEP_PICS = [FIRE, LOUNGE, FIRE, OUTDOOR, LOUNGE]
# each place still showing a repeat or a frame, with the coaching picture it waits for (made next, task 7a3c013b)
PICTURES_TO_MAKE = [
    ('the pause', 'the lounge (also steps 02, 05)', 'a client resting, eyes closed, in the lounge (her photo 2): generated client, labelled'),
    ('step 03 Three sessions', 'Maggie by the fire, again (step 01)', 'a session by the fire, the client seen from behind: generated client, labelled'),
    ('step 05', 'the lounge, again', 'its picture with its words (Copywriter 1)'),
    ('How we work together, Maggie', 'Maggie outdoors, again (credentials, step 04)', 'another of her own portraits from the shoot folder (69 unused photos, task c7892a3c)'),
    ('the six practices', '[Photo to come] frames', 'one picture per practice: a generated client in her real lounge or by the fire, labelled'),
]


def hero(line, rot=None):
    return dict(aria=M.IW_TITLE, hook=M.FIRST['tagline'], eyebrow=M.FIRST['name'], line=line, rot=rot, aveda=None,
                ctas=btn(O['btns'][0], CALL_URL, 'light', arrow=True) + TO_SALON, note=O['note'], open=dict(eyebrow=M.IW_TITLE))


def steps(last_btn=False):
    out = {}
    for k, sid in enumerate(STEP_ID):
        if k < len(P):
            w = dict(name=P[k][1], sub=None, title=P[k][1], body=P[k][2], specs=[])
        else:
            w = dict(name=STEP_NAMES[k], sub=None, title=ph('[Step five, to come]'), body=ph('[Its words, still to write]'), specs=[])
        w['film_top'] = dict(poster='img/' + STEP_PICS[k][0])
        if last_btn and k == len(STEP_ID) - 1: w['btn'] = CALL_LIGHT
        out[sid] = w
    return out


# her "Look a little deeper." leads (the pause's first sentence is its heading), her lead line follows; 'Recognition' was
# the section's label on the Inner Work page before (task a2e5a9d0)
PAUSE = dict(label='Recognition', text=M.DEEPER['title'] + ' ' + M.DEEPER['lead'], after=M.DEEPER['close'], accents=['deeper roots.'],
             breath=LOUNGE[0], breath_alt=LOUNGE[1], breath_mark='')
OM = dict(label='Becoming', text=H['close'], accents=['Becoming'])
ROWS = [(f'0{k + 1}', n, None) for k, n in enumerate(STEP_NAMES)]
CRED_FACTS = [(f'0{k + 1}', c) for k, c in enumerate(M.CREDENTIALS)]
AVEDA = dict(eyebrow='Credentials', title=M.FIRST['name'], paras=[], quote=H['cred_line'], cite='Maggie', facts=CRED_FACTS, src='',
             btn=CALL_BTN, photo=OUTDOOR)
# the salon's three team cards: Maggie, then the two practices she is certified in (her credentials 1 and 2, in her words),
# each with one of her own portraits: Inner Work has no team, and no salon team member is shown in it
PEOPLE = [dict(name=M.FIRST['name'], role=M.CRED_SHORT, desc=H['paras'][1], img=OUTDOOR[0], alt=OUTDOOR[1]),
          dict(name=H['practices'][0][0], role=M.CREDENTIALS[0], desc=None, img=PORTRAIT[0], alt=PORTRAIT[1]),
          dict(name=H['practices'][1][0], role=M.CREDENTIALS[1], desc=None, img=FIRE[0], alt=FIRE[1])]
TEAM = dict(eyebrow=H['eyebrow'], title=H['title'], intro=H['paras'][0], people=PEOPLE, with_label='Coaching and hypnotherapy')
IDENTITY = H['paras'][1].split('. ', 1)       # "This is identity-level work." and the rest of her paragraph
MENU = dict(eyebrow='Inner Work', title=IDENTITY[0] + '.', intro=IDENTITY[1],
            tiles=[dict(title=n, tag=t[0].upper() + t[1:], price='', missing=f'Photo to come: {n}', img=None, alt='', pos='', ai=None)
                   for n, t in H['practices']],
            note=M.PRICING, beneath=None, btn=CALL_BTN)
DOOR = dict(eyebrow='The second door', title=M.SALON_OPEN['title'], text=M.SALON_OPEN['lines'][0], more=[M.SALON_OPEN['lines'][1]],
            img=CHAIR[0], mark='',
            btn=btn(M.FIRST['doors'][0], '#', 'light', arrow=True, world='salon') + btn(M.BEGIN_BTNS[0][0], M.BEGIN_BTNS[0][1], 'ghost'))
BEGIN = dict(label='Begin', title=ph(M.TO_COME['closing']), text='', last=None, btn=CALL_LIGHT, close_img=(PORTRAIT[0], '50% 24%'))
FOOT_EXACT = dict(name=M.FOOTER['name'], tagline=M.FOOTER['tagline'], brand_lines=[M.FOOTER['salon']], copyright=M.FOOTER['copyright'],
                  disclaimer=M.DISCLAIMER, legend=LEGEND_M, visit=[SALON_INFO['address'], SALON_INFO['hours'], SALON_INFO['hours_note']],
                  connect=[SALON_INFO['phone'], SALON_INFO['email']], iw_block=IW_BLOCK)
# G and S (Maggie, 11 Nov, task d7b789ee): where Inner Work happens, and its own contact
FOOT_OWN = dict(FOOT_EXACT, tagline=M.FIRST['tagline'], legend=LEGEND, visit=['Privately at Salon OM, outside salon hours', 'Online, wherever you are'],
                connect=M.FOOT_IW, iw_block=None)


def explore(*pairs):
    return [(t, TWIN + h) for t, h in pairs]


# ---------------------------------------------------------------- M: her order, her words
M_WORDS = dict(
    top=hero(M.FIRST['pair'] + ' ' + O['title'] + ' ' + O['sub'] + ' ' + O['line']),
    pause=PAUSE, om=OM,
    visit=dict(eyebrow='The path', title=ph(M.TO_COME['path_title']), rows=ROWS),
    **steps(last_btn=True),
    aveda=AVEDA, hosts=TEAM, services=MENU,
    kind=dict(eyebrow='Voices', title=None, quotes=VOICES_TO_COME, btn=CALL_BTN),
    deeper=DOOR, begin=BEGIN,
    letters=dict(FOOT_EXACT, explore=explore(('The path', 'arrive'), ('How we work together', 'hosts'), ('Inner Work', 'services'), ('Begin', 'begin'))),
)
M_MENU = [('01', 'Look a little deeper', 'c-pause'), ('02', 'The path', 'c-arrive'), ('03', 'How we work together', 'c-hosts'),
          ('04', 'Voices', 'c-kind'), ('05', 'Begin', 'c-begin')]

# ---------------------------------------------------------------- G: Guided, its own [draft] lines for Inner Work (copy_2_2_g.G)
def g_words(G):
    return dict(
        top=hero(O['title'] + ' ' + M.CRED_SHORT, rot=draft(G['rot_iw'])),
        pause=PAUSE,
        early=dict(eyebrow='Voices', title=None, quotes=VOICES_TO_COME, reward=None),
        visit=dict(eyebrow='The path', title=draft(G['path_hook']), reward=draft(G['path_reward']), rows=ROWS),
        **steps(),
        services=dict(MENU, reward=None),
        hosts=dict(TEAM, note=None, sign=None, btn=CALL_BTN),
        kind=dict(title='Voices', quotes=VOICES_TO_COME, reward=None, btn=CALL_BTN),
        aveda=dict(AVEDA, title=draft(G['cred_hook']), paras=[M.CRED_SHORT], reward=None),
        om=dict(OM, btn=CALL_BTN),
        deeper=DOOR,
        begin=dict(BEGIN, title=M.FIRST['close'], text=draft(G['iw_begin_text']), answer=None, reward=draft(G['iw_begin_reward'])),
        letters=dict(FOOT_OWN, explore=explore(('The path', 'visit'), ('Inner Work', 'services'), ('How we work together', 'hosts'), ('Begin', 'begin'))),
    )
G_MENU = [('01', 'The path', 'c-visit'), ('02', 'Inner Work', 'c-services'), ('03', 'How we work together', 'c-hosts'),
          ('04', 'Credentials', 'c-aveda'), ('05', 'Begin', 'c-begin')]

# ---------------------------------------------------------------- S: Short
def s_words(rot, path_hook, reward):
    return dict(
        top=hero(O['title'] + ' ' + M.CRED_SHORT, rot=draft(rot)),
        visit=dict(eyebrow='The path', title=draft(path_hook), btn=CALL_LIGHT,
                   steps=[(f'0{k + 1}', n, (P[k][2] if k < len(P) else ph('[Its words, still to write]'))) + STEP_PICS[k] for k, n in enumerate(STEP_NAMES)]),
        hosts=dict(eyebrow='Credentials', title=M.FIRST['name'], quotes=VOICES_TO_COME, line_k=H['eyebrow'], line=H['title'],
                   people=[dict(p) for p in PEOPLE], line_img=OUTDOOR),
        services=MENU,
        deeper={k: v for k, v in DOOR.items() if k != 'more'},     # S's door is the short one: no second paragraph
        begin=dict(BEGIN, title=M.FIRST['close'], answer=None, reward=draft(reward)),
        letters=dict(FOOT_OWN, explore=explore(('The path', 'visit'), ('Credentials', 'hosts'), ('Inner Work', 'services'), ('Begin', 'begin'))),
    )
S_MENU = [('01', 'The path', 'c-visit'), ('02', 'Credentials', 'c-hosts'), ('03', 'Inner Work', 'c-services'), ('04', 'Begin', 'c-begin')]
