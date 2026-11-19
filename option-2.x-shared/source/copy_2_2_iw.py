"""Inner Work with Maggie: the coaching world's WORDS for each of the salon world's sections, in the same order, doing the
same job (task 51b1c84d; Designer 2 builds the twin on task 7a3c013b). Owned by Copywriter 1.

J, 18 Nov 2026 (ask a99a17ac): "I said both would follow the same style, only the copy is what is going to change. Same
sections, same color, remember I requested that?" and "Not only that but also the secuence of sections. Only the copy is
what changes." First asked 19 Oct 2026, live with the client: "I want this alone to have the same sections ... In that way
we show the parallel natures of the two".

HOW TO READ IT. IW[version][salon section id] holds only word fields, named as the salon section's own fields in
copy_2_2_m/g/s.py and mgs_parts.py (title, text, after, label, eyebrow, line, rot, note, intro, paras, quote, cite, facts,
rows, tiles, people, quotes, more, reward, answer, last, and for a step: name, sub, title, body, specs). Pictures, films,
sounds, tones and layouts are never here: they stay the salon section's. A nested list (rows, tiles, people, quotes, facts,
specs) gives the words of each item in the salon item's order; a SHORTER list means the coaching world has fewer of them
(see NOTES). Buttons are B(label, to): to = 'call' (Inner Work's one action, the Connection Call), 'book' (the salon's),
'salon' (the switch to the salon world) or '#id' (a coaching section, ids as the salon's with c-).

WHERE THE WORDS COME FROM. Her Inner Work deck of 2 Nov (resources/maggie/inner-work-progress-update-2026-11.pdf, pages
4 to 12), her 11 Nov website copy (the second door, the footer, her rules), and her answers of 11 Nov (mgs_parts.A11),
all as copied word for word into copy_2_2_maggie.py; nothing here is invented about her practice. M uses every approved
sentence of her Inner Work page exactly once, in the salon's order; the only new words in M are short labels and the step
details' shortened forms, each wrapped in draft() (dotted, for her approval). G and S keep their own hooks and rewards
(draft), on her facts, as their salon pages do. Her rules kept: no em dashes, exclamation points or semicolons; people in
Inner Work are clients; the first step is always the Connection Call; Becoming, Journey and Grow capitalised; the ® marks;
no outcome promised (the step detail 'You'll feel' becomes 'Toward' here, a direction, never a promise: her deck, p.13,
"No outcome can be guaranteed")."""
import copy_2_2_maggie as M
from build import draft, ph


def B(label, to, kind='', world=None, new=False):
    """a button's words and where it goes; new=True: the label is new words (dotted when drawn)"""
    return dict(label=label, to=to, kind=kind, world=world, new=new)


CALL = M.CTA_IW                                     # 'Book a Connection Call', Inner Work's one action (her deck)
BOOK = 'Book your visit'                            # the salon's one action, on the second door only
O, D, H = M.IW_OPEN, M.DEEPER, M.HOW
P1, P2, P3 = D['paras']                             # her three paragraphs of "Look a little deeper"
H1, H2 = H['paras']                                 # her two paragraphs of "How we work together"


def sent(p):
    """her paragraph cut into its sentences, never reworded"""
    out, cur = [], ''
    for w in p.split(' '):
        cur = (cur + ' ' + w).strip()
        if w.endswith('.'):
            out.append(cur); cur = ''
    return out + ([cur] if cur else [])


# her answers of 11 Nov, the same words as mgs_parts.A11 (kept here because mgs_parts reads this file): dotted, for her yes
A11_CALL = 'About 30 to 45 minutes, never rushed.'
A11_WHERE = 'Sessions happen privately at Salon OM, outside salon hours, or online. You don’t have to be a salon guest to be an Inner Work client.'


S1, S2, S3 = sent(P1), sent(P2), sent(P3)           # Look a little deeper, by sentence
T1, T2 = sent(H1), sent(H2)                         # How we work together, by sentence
assert len(S2) == 3 and len(S3) == 4 and len(T1) == 4 and len(T2) == 3, 'her paragraphs changed: re-place every sentence'

# ---- shared pieces: her words, placed ------------------------------------------------------------------------------
# THE JOURNEY, in five steps: the twin of the visit's five steps. Every description is her own sentences, in her order:
# How we work together (T) and Look a little deeper (S), plus the Connection Call line of her second door.
# (rail name, sub, heading word, description, details)
JOURNEY_LINE = 'Connect. Revisit. Witness. Choose. Become.'      # each word hers: Connection Call, revisit, witness, choose, Becoming
STEPS = [
  ('Reach out', 'The Connection Call', 'Connect',
   T1[0] + ' ' + M.DOOR['paras'][1],
   [('What happens', 'A simple conversation'), ('Included', 'Complimentary'), (draft('Toward'), 'Clarity')]),
  ('Look deeper', draft('Reviewing, not reliving'), 'Revisit',
   S2[0] + ' ' + T1[2],
   [('What happens', draft('Revisiting the moments that shaped you')), ('Included', 'Curiosity and compassion'), (draft('Toward'), 'Understanding')]),
  ('Soften', 'A gentle distance', 'Witness',
   S2[1] + ' ' + S2[2],
   [('What happens', draft('Witnessing the past')), ('Included', 'Compassion and understanding'), (draft('Toward'), 'Freedom')]),
  ('Take root', 'A new pathway', 'Choose',
   T1[3] + ' ' + ' '.join(S3[:3]),
   [('What happens', 'New ways of thinking'), ('Included', 'Practical tools and support'), (draft('Toward'), 'New choices')]),
  ('Yours to keep', 'Becoming', 'Become',
   S3[3] + ' ' + T2[2],
   [('What happens', 'Your own agency'), ('Included', draft('Insights and tools to keep')), (draft('Toward'), 'Becoming')]),
]
STEP_IDS = ['arrive', 'unwind', 'renew', 'unhurried', 'home']   # the salon's step ids, in order


def journey_step(k, btn=None):
    rail, sub, word, body, specs = STEPS[k]
    d = dict(name=rail, sub=sub, title=word, body=body, specs=specs)
    if btn: d['btn'] = btn
    return d


# her six practices (How we work together, continued): the twin of Why Aveda's facts, what the work draws on
PRACTICES = list(H['practices'])
# her path (decided, 2 Nov deck p.10): the twin of the menu, what a client can choose; prices stay off the site by her choice
PATH_TILES = [dict(title=n, tag=t.split('. ', 1)[1] if k == 0 else t, price='Complimentary' if k == 0 else '')
              for k, (_, n, t) in enumerate(M.PATH)]
CRED_PEOPLE = [dict(name=M.FIRST['name'], role='Coach and hypnotherapist',   # her deck p.13: "Maggie is a coach and hypnotherapist"
                    desc=M.CREDENTIALS)]                                    # her six credentials, exact; a list, one per line
GUIDE = M.DOOR['paras'][0].split('. ', 1)[1]          # "In Inner Work with Maggie, I am your guide ..." (her second door)
VOICES_TO_COME = [(ph(M.TO_COME['voices']), '', '')]   # no client words yet: her placeholder, never invented
PROOF_IW = 'Maggie has listened to people’s stories for nearly three decades.'   # her credentials line, as G's salon proof line

# the second door, from the coaching world back to the salon: her own salon opening words (11 Nov)
DOOR_TITLE = M.SALON_OPEN['title']                    # 'Beauty from the inside out.'
DOOR_TEXT, DOOR_MORE = M.SALON_OPEN['lines']          # 'Leave held, seen ...', 'An Avila Beach salon where artistry ...'
DOOR_BTNS = [B('Explore Salon OM', 'salon', 'light', world='salon', new=True), B(BOOK, 'book', 'ghost', world='salon')]

HERO_COMMON = dict(hook=M.FIRST['tagline'], eyebrow=M.FIRST['name'], mark='Inner Work',   # the drawn word mark: see NOTES
                   aveda='Coaching and hypnotherapy',                                       # the twin of 'An Aveda Concept Salon'
                   ctas=[B(CALL, 'call', 'light'), B(M.FIRST['doors'][0], 'salon', 'ghost', world='salon')],
                   open=dict(eyebrow=M.IW_TITLE, title=O['title'], lines=[O['sub'], O['line']], note=O['note'],
                             btns=[B(O['btns'][0], 'call', 'light'), B(O['btns'][1], '#c-visit', 'ghost')]))

LEGEND_M_IW = ('Every line of copy here is Maggie’s own: her Inner Work deck of 2 Nov, in the same sections as the salon page. '
               'Lines with a dotted underline are new or from her answers of 11 Nov, for her to approve. Words in [square brackets] '
               'are still to come.')

# ================================================================ M · her order (the salon page's 15 sections)
IW_M = {
  'top': dict(HERO_COMMON, line=M.FIRST['pair'] + ' ' + O['title'] + ' ' + O['sub'] + ' ' + O['line'],
              note=M.FIRST['close']),
  'pause': dict(label='The pause', text=D['lead'], after=D['title'], accents=['roots.']),
  'om': dict(label=draft('Inner Work · Becoming'), text=P1 + ' ' + D['close'], accents=['again.']),
  'visit': dict(eyebrow=draft('The Journey'), title=draft(JOURNEY_LINE),
                rows=[(f'0{k + 1}', s[0], s[1]) for k, s in enumerate(STEPS)]),
  **{STEP_IDS[k]: journey_step(k, btn=B(CALL, 'call', 'light') if k == 4 else None) for k in range(5)},
  'aveda': dict(eyebrow=H['eyebrow'], title=H['title'], paras=[' '.join(T2[:2]) + ' ' + T1[1]],
                quote=H['cred_line'], cite='Maggie', facts=PRACTICES, src='', reward=H['close'], btn=B(CALL, 'call')),
  'hosts': dict(eyebrow='Credentials', title=M.FIRST['name'], intro=GUIDE, people=CRED_PEOPLE, with_label=''),
  'services': dict(eyebrow='The path', title=ph(M.TO_COME['path_title']), intro=M.PRICING, tiles=PATH_TILES,
                   note=draft(A11_WHERE), beneath=None, btn=B(CALL, 'call', 'light')),
  'kind': dict(eyebrow=draft('Words from our clients'), title=ph(M.TO_COME['voices']), quotes=VOICES_TO_COME, btn=B(CALL, 'call')),
  'deeper': dict(eyebrow='The second door', title=DOOR_TITLE, text=DOOR_TEXT, more=[DOOR_MORE, M.FIRST['close']], btns=DOOR_BTNS),
  'begin': dict(label='Begin', title=ph(M.TO_COME['closing']), text=O['note'], last=M.BEGIN_LAST, btns=[B(CALL, 'call', 'light')]),
  'letters': dict(legend=LEGEND_M_IW),
}
NAV_M = [('01', 'The pause', 'c-pause'), ('02', 'The Journey', 'c-arrive'), ('03', 'Credentials and the path', 'c-hosts'),
         ('04', 'Voices', 'c-kind'), ('05', 'Begin', 'c-begin')]

# ================================================================ G · Guided (the salon page's 16 sections, each one cycle)
# Her words are the proof and the body, as on G's salon page; the hooks and rewards are G's own (draft). G's Inner Work
# lines of rounds 3 to 6 (copy_2_2_g.G: rot_iw, cred_hook, path_hook, path_reward, iw_begin_text, iw_begin_reward) are
# kept word for word, so nothing J or the CEO MA already passed is reworded.
G_IW = dict(
  rot='Uncover the beliefs that may be holding you back, without reliving the past. It starts with one Connection Call.',
  preview='Your Journey, from the first call to the person you are Becoming, in five steps.',
  preview_reward='You know how the work unfolds, and in what order, before your first call.',
  rows=['A simple conversation, and whether Maggie is the right fit.', 'The moments that shaped you, reviewed, never relived.',
        'The past, seen from a gentle distance.', 'New thoughts and new pathways, one choice at a time.',
        'Insights and tools that are yours to keep.'],
  path_hook='Four steps, and the first is a conversation.',
  path_stack='Every session is met with curiosity and compassion, and the insights and tools you gain are yours to keep.',
  path_reward='The first step is complimentary, and every step after it is your choice.',
  becoming='Maggie walks beside you for twelve weeks, reinforcing new thought patterns and building new habits and pathways.',  # her deck p.11
  cred_hook='Who will walk beside you?',
  story_open='Nearly three decades of listening.',
  how_hook='What is in the work?',
  begin_text='In one complimentary call of about 30 to 45 minutes, never rushed, Maggie learns what you are looking for, and together you see if she is the right fit. Investment is shared there too.',
  begin_reward='You leave the call knowing your next step, and whether Maggie is the one to walk it with you.',
  hours='By appointment, Monday to Friday, 9 to 5.',   # her footer's salon hours, for the door's one fact
)
TEAM_NOTE = 'I’m the backdrop. It’s not about me, it’s about you. This is your time, your space.'   # hers (19 Oct), as G's salon note
HERO_LINE_IW = O['title'] + ' Coaching and hypnotherapy. ' + draft(PROOF_IW)   # her title, her practice, the proof (as G's salon line)

IW_G = {
  'top': dict(HERO_COMMON, line=HERO_LINE_IW, rot=draft(G_IW['rot']), note=O['note'],
              ctas=[B(CALL, 'call', 'light'), B(M.FIRST['doors'][0], 'salon', 'ghost', world='salon')]),
  'pause': dict(label='The pause', text=D['lead'], after=D['title'], accents=['roots.']),
  'early': dict(eyebrow='Kind words', title=draft('Words from our clients'), quotes=VOICES_TO_COME, reward=''),
  'visit': dict(eyebrow=draft('The Journey'), title=draft(G_IW['preview']), reward=draft(G_IW['preview_reward']),
                rows=[(f'0{k + 1}', s[0], draft(G_IW['rows'][k])) for k, s in enumerate(STEPS)]),
  **{STEP_IDS[k]: journey_step(k) for k in range(5)},
  'services': dict(eyebrow='The path', title=draft(G_IW['path_hook']), intro=M.PRICING + ' ' + draft(G_IW['path_stack']),
                   tiles=[dict(t, price=(t['price'] + ' · ' + draft(A11_CALL.rstrip('.').lower())) if k == 0
                               else draft(G_IW['becoming']) if k == 3 else '') for k, t in enumerate(PATH_TILES)],
                   note='', beneath=None, reward=draft(G_IW['path_reward']), btn=B(CALL, 'call')),
  'hosts': dict(eyebrow='Credentials', title=draft(G_IW['cred_hook']), intro=draft(G_IW['story_open']) + ' ' + GUIDE,
                people=CRED_PEOPLE, with_label='', note=draft(TEAM_NOTE), sign='Maggie', btn=B(CALL, 'call')),
  'aveda': dict(eyebrow=H['eyebrow'], title=draft(G_IW['how_hook']), paras=[H['title'] + ' ' + T1[1]],
                quote=H['cred_line'], cite='Maggie', facts=PRACTICES, src='', reward=H['close'], btn=B(CALL, 'call')),
  'om': dict(label=draft('Inner Work · Becoming'), text=P1 + ' ' + D['close'], accents=['again.'], btn=B(CALL, 'call')),
  'deeper': dict(eyebrow='The second door', title=DOOR_TITLE, text=DOOR_TEXT, more=[DOOR_MORE + ' ' + draft(G_IW['hours'])],
                 btns=DOOR_BTNS),
  'begin': dict(label='Begin', title=M.FIRST['close'], text=draft(G_IW['begin_text']), last=M.BEGIN_LAST,
                answer=draft(A11_WHERE), reward=draft(G_IW['begin_reward']), btns=[B(CALL, 'call', 'light')]),
  'letters': dict(legend=None),   # G's own legend, as on its salon page
}
NAV_G = [('01', 'The Journey', 'c-visit'), ('02', 'The path', 'c-services'), ('03', 'Credentials', 'c-hosts'),
         ('04', 'How we work together', 'c-aveda'), ('05', 'Begin', 'c-begin')]
EXPLORE_G = [('The Journey', 'c-visit'), ('The path', 'c-services'), ('Credentials', 'c-hosts'), ('Begin', 'c-begin')]

# ================================================================ S · Short (the salon page's 6 sections)
# Her words cut by whole sentences, never reworded; S's hooks as G's (dotted), as on S's salon page
S_PICK = [0, 0, 1, 0, 0]   # each step's one whole sentence that stands alone (step 3's first opens on "As we do", which needs step 2)
IW_S = {
  'top': dict(HERO_COMMON, line=HERO_LINE_IW, rot=draft(G_IW['rot']), note=O['note'],
              ctas=[B(CALL, 'call', 'light'), B(M.FIRST['doors'][0], 'salon', 'ghost', world='salon')]),
  'visit': dict(eyebrow=draft('The Journey'), title=draft(JOURNEY_LINE),
                steps=[(f'0{k + 1}', s[0], f'{s[2]}. ' + sent(s[3])[S_PICK[k]]) for k, s in enumerate(STEPS)], btn=B(CALL, 'call', 'light')),
  'hosts': dict(eyebrow='Credentials', title=draft(G_IW['cred_hook']),
                people=[dict(CRED_PEOPLE[0], desc=M.CRED_SHORT)],          # her short version "for tight spaces"
                quotes=VOICES_TO_COME, line_k=H['eyebrow'], line=H['title'] + ' ' + T1[1]),
  'services': dict(IW_M['services']),                                     # S's salon menu is M's, word for word: so is its twin
  'deeper': dict(eyebrow='The second door', title=DOOR_TITLE, text=DOOR_TEXT, btns=DOOR_BTNS[:1]),
  'begin': dict(label='Begin', title=M.FIRST['close'], text=O['note'], last=M.BEGIN_LAST, answer=draft(A11_WHERE),
                btns=[B(CALL, 'call', 'light')]),
  'letters': dict(legend=None),
}
NAV_S = [('01', 'The Journey', 'c-visit'), ('02', 'Credentials', 'c-hosts'), ('03', 'The path', 'c-services'), ('04', 'Begin', 'c-begin')]

IW = {'m': IW_M, 'g': IW_G, 's': IW_S}
NAV = {'m': NAV_M, 'g': NAV_G, 's': NAV_S}
RAIL = [(s[0], 'c-' + STEP_IDS[k]) for k, s in enumerate(STEPS)]   # the step rail's names in the coaching world

# ---- the parallels, one line each (also on task 51b1c84d) ---------------------------------------------------------------
MAP = [
  ('top', 'the first screen', 'her Inner Work opening: Explore who you are Becoming., her two buttons and her note'),
  ('pause', 'the pause', 'a breath and a question: her lead "Sometimes ... deeper roots." and "Look a little deeper."'),
  ('early', 'early guest words (G)', 'client words: none yet, her placeholder (initials only, being gathered)'),
  ('om', 'OM · Oneness, the meaning behind the name', 'Inner Work · Becoming: how beliefs form (her 1st paragraph) and "You get to choose again."'),
  ('visit', 'the visit in five steps', 'the Journey in five steps: Connect. Revisit. Witness. Choose. Become.'),
  ('arrive..home', 'the five steps of a visit', 'the five steps of the work, each made of her own sentences, her order kept'),
  ('aveda', 'Why Aveda: what the visit draws on, her quote, four facts', 'How we work together: what the work draws on, her credentials line, her six practices'),
  ('hosts', 'Meet the team (three cards)', 'Credentials: Maggie, her guide line and her six credentials (one card)'),
  ('services', 'the menu: what you can book, with prices', 'the path: Connection Call, one session, three sessions, Becoming, her pricing line'),
  ('kind', 'words from our guests', 'words from our clients: none yet, her placeholder'),
  ('deeper', 'the second door, to Inner Work', 'the second door, to Salon OM, in her own salon opening words'),
  ('begin', 'Begin: call or email', 'Begin: the Connection Call (her closing invitation still to write, M)'),
]

# ---- for Designer 2 and the CEO MA: where the words alone cannot make the twin honest ------------------------------------
NOTES = [
  'The first screen draws the word mark SALON OM: in the coaching world those are words too, so its twin is INNER WORK (field mark).',
  'Meet the team has three cards; Inner Work is Maggie alone. Katie’s and Chesney’s pictures beside coaching words would say they coach, so the coaching card list is Maggie only.',
  'The menu has six tiles; her path has four offers (Connection Call, one session, three sessions, Becoming). Her six practices are not offers, so four tiles.',
  'The six menu pictures are generated guests with new hair: beside coaching offers they would show a hair result as a coaching result. J ruled same pictures; whether these six stay is for J (recommend asking).',
  'Why Aveda shows four facts; its twin shows her six practices, all six (none of hers left out).',
  'A step’s third detail reads Toward, not You’ll feel: her deck (p.13) promises no outcome.',
  'Begin has one button in the coaching world: her copy gives Inner Work an email and no phone.',
  'Discover the Journey (her second opening button) goes to The Journey, the five steps (#c-visit). Her deck sent it to How we work together, which in her old order came next.',
  'Credentials go one per line (desc is a list): her six exact lines, never run together.',
]


def side_by_side():
    """the two worlds' section lists, laid side by side (J: 'Before building either world, lay the two section lists side by side')"""
    import copy_2_2_m as VM, copy_2_2_g as VG, copy_2_2_s as VS
    out = []
    for v, mod in (('m', VM), ('g', VG), ('s', VS)):
        ids = [d['id'] for _, d in mod.SALON]
        missing = [i for i in ids if i not in IW[v]]
        extra = [i for i in IW[v] if i not in ids]
        assert not missing and not extra, f'{v}: salon sections without words {missing}, words without a section {extra}'
        assert list(IW[v]) == ids, f'{v}: the order differs from the salon page'
        out.append(f'{v.upper()}: {len(ids)} sections, same order: ' + ', '.join(ids))
    return out


def her_sentences_once():
    """M uses every approved sentence of her Inner Work page exactly once (opening, Look a little deeper, How we work together)"""
    import json, re
    blob = json.dumps(IW_M, ensure_ascii=False, default=str)
    blob = re.sub(r'<[^>]+>', '', blob)
    hers = sent(P1) + sent(P2) + sent(P3) + sent(H1) + sent(H2) + [D['lead'], D['close'], H['cred_line'], H['close'], O['title'], O['sub'], O['line'], M.PRICING]
    missing = [s for s in hers if s not in blob]
    twice = [s for s in sent(P1) + sent(P2) + sent(P3) + sent(H1) + sent(H2) if blob.count(s) > 1]
    pr = [n for n, t in H['practices'] if n not in blob or t not in blob]
    return missing, twice, pr


if __name__ == '__main__':
    print('\n'.join(side_by_side()))
    m, t, p = her_sentences_once()
    print('her sentences missing in M:', m or 'none', '| used twice:', t or 'none', '| practices missing:', p or 'none')
