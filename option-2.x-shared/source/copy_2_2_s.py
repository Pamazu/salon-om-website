"""Option 2.2 · S, Short (study febe2c3a, section 8): one screen per stage, about a third of the scroll. Salon OM in
six screens, Inner Work in five. Maggie's words only, shortened by cutting whole sentences, never rewording (the cuts
go to her); the proof line and the Begin summary are the study's [draft] lines. Left out: the pause, OM, the full step
screens, the full credentials, Why Aveda (its one line moves into the proof screen)."""
from mgs_parts import *


def dict_with(sec, **kw):
    kind, d = sec
    return (kind, dict(d, **kw))

# round 3 (task df14fa0d): one Aveda proof line (aveda.com, 100% vegan since 2021), the salon hook with its ROT line as G,
# and on Inner Work her Credentials, cut to her first three items (whole items, never reworded), and her Voices placeholder
S_AVEDA = '100% vegan formulas.'   # round 5: her own fact line (11 Nov), no longer new words
S_ROT = 'Hair that finally feels like you, in one visit, with Maggie’s full attention.'   # as G (round 4: the T of ROT back)
S_STACK = 'Every hair visit includes your favorite drink, a real conversation, a scalp ritual with Stress-Fix oil and time shaped around you.'
CRED_S = iw_credentials(n=3)          # her first three credentials, on the same card as M and G (task a2e5a9d0)

# round 4 (task 2846db82): the five steps with their real photos (mgs_sections.visit), the words unchanged
# round 5 (task c446e8ba): each step's first sentence of her 11 Nov description, cut by whole sentences, never reworded
VISIT = (S.visit, dict(id='visit', eyebrow='The visit', title=M.VISIT_LINE,
                       steps=[(f'0{k + 1}', s[0], f'{s[2]}. ' + s[3].split('. ')[0].rstrip('.') + '.', STEP_IMG[k], STEP_ALT[k]) for k, s in enumerate(M.STEPS)],
                       btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))
PROOF = ('proof', dict(id='hosts', eyebrow='Meet the team', title=M.TEAM_LINE,
                       people=[dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in range(3)],
                       quotes=M.QUOTES[:2], line_k='Why Aveda', line=M.AVEDA + ' ' + S_AVEDA))
SALON = [dict_with(salon_hero(proof=True, visit='visit'), rot=draft(S_ROT)), VISIT, PROOF, services(), door(short=True), dict_with(begin(summary=True, online=True), answer=draft(A11['adjust'])), salon_end(LEGEND, visit='visit')]
COACHING = [iw_hero(short_cred=True), iw_deeper(short=True), iw_how(cta=False, short=True), CRED_S, iw_path(cta=True), iw_voices_placeholder(), iw_begin(), iw_end(LEGEND)]

CFG = cfg('s', 'Short', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'The team', 'hosts'), ('03', 'The menu', 'services'), ('04', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'Credentials', 'c-cred'), ('04', 'The path', 'c-path'), ('05', 'Begin', 'c-begin')], steps=False)
