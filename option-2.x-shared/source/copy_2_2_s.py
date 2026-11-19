"""Option 2.2 · S, Short (study febe2c3a, section 8): one screen per stage, about a third of the scroll. Salon OM in
six screens, Inner Work in five. Maggie's words only, shortened by cutting whole sentences, never rewording (the cuts
go to her); the proof line and the Begin summary are the study's [draft] lines. Left out: the pause, OM, the full step
screens, the full credentials, Why Aveda (its one line moves into the proof screen)."""
from mgs_parts import *
import copy_2_2_iw as IW


def dict_with(sec, **kw):
    kind, d = sec
    return (kind, dict(d, **kw))

# round 3 (task df14fa0d): one Aveda proof line (aveda.com, 100% vegan since 2021), the salon hook with its ROT line as G,
# and on Inner Work her Credentials, cut to her first three items (whole items, never reworded), and her Voices placeholder
S_AVEDA = '100% vegan formulas.'   # round 5: her own fact line (11 Nov), no longer new words
S_ROT = 'Hair that finally feels like you, in one visit, with Maggie’s full attention.'   # as G (round 4: the T of ROT back)
S_STACK = 'Every hair visit includes your favorite drink, a real conversation, a scalp ritual with Stress-Fix oil and time shaped around you.'

# round 4 (task 2846db82): the five steps with their real photos (mgs_sections.visit), the words unchanged
# round 5 (task c446e8ba): each step's first sentence of her 11 Nov description, cut by whole sentences, never reworded
VISIT = (S.visit, dict(id='visit', eyebrow='The visit', title=M.VISIT_LINE,
                       steps=[(f'0{k + 1}', s[0], f'{s[2]}. ' + s[3].split('. ')[0].rstrip('.') + '.', STEP_IMG[k], STEP_ALT[k]) for k, s in enumerate(M.STEPS)],
                       btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))
# round 6 (task b9a04e51): S's hooks where it had only a label or a [placeholder], each as G's line (dotted): the team
# opens on a claim, not three names; Inner Work's opening gets its ROT line, the path its heading, Begin its heading
# (her own first-screen close) and its reward. The opening line is cut to three as in G. No 'Book online' (her booking
# page lists no services) and no Inner Work block in the salon footer (J 4 Nov: the other world only at the top and in
# its own section)
S_HERO_LINE = M.SALON_OPEN['title'] + ' An Avila Beach salon. ' + draft(D['proof'])
S_TEAM_HOOK = 'The people who listen first.'    # as G
S_ROT_IW = 'Uncover the beliefs that may be holding you back, without reliving the past. It starts with one Connection Call.'   # as G
S_PATH_HOOK = 'Four steps, and the first is a conversation.'   # as G
S_IW_REWARD = 'You leave the call knowing your next step, and whether Maggie is the one to walk it with you.'   # as G
PROOF = ('proof', dict(id='hosts', eyebrow=M.TEAM_LINE, title=draft(S_TEAM_HOOK),
                       people=[dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in range(3)],
                       quotes=M.QUOTES[:2], line_k='Why Aveda', line=M.AVEDA + ' ' + S_AVEDA, line_img=AVEDA_PHOTO,   # its picture: task a749167b
                       photo=TEAM_PHOTO, options=S.TEAM_OPTIONS, option_label='Today’s: three cards and two quotes'))   # task 1a6089ec
SALON = [dict_with(salon_hero(proof=True, visit='visit', line=S_HERO_LINE), rot=draft(S_ROT)), VISIT, PROOF, services(), door(short=True),
         dict_with(begin(summary=True), answer=draft(A11['adjust'])), salon_end(LEGEND, visit='visit', iw=False)]
COACHING = twin(SALON, iw_entries('s', SALON))   # J 18 Nov: only the words change (task 7a3c013b)

CFG = cfg('s', 'Short', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'The team', 'hosts'), ('03', 'The menu', 'services'), ('04', 'Begin', 'begin')],
  IW.NAV['s'], steps=False)
