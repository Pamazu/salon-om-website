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
S_AVEDA = 'Every Aveda formula is 100% vegan.'
S_ROT = 'Hair that finally feels like you, in one visit, with no one rushing you.'
CRED_S = ('prose', dict(id='c-cred', sound='air', eyebrow='Credentials', title='Maggie Woodward', list=[(c, '') for c in M.CREDENTIALS[:3]]))

VISIT = ('steps', dict(id='visit', eyebrow='The visit', title=M.VISIT_LINE,
                       steps=[(f'0{k + 1}', s[0], f'{s[2]}. {s[3]}') for k, s in enumerate(M.STEPS)],
                       btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))
PROOF = ('proof', dict(id='hosts', eyebrow='Meet the team', title=M.TEAM_LINE,
                       people=[dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in range(3)],
                       quotes=M.QUOTES[:2], line_k='Why Aveda', line=M.AVEDA + ' ' + draft(S_AVEDA)))
SALON = [dict_with(salon_hero(proof=True, visit='visit'), rot=draft(S_ROT)), VISIT, PROOF, services(), door(short=True), begin(summary=True), salon_end(LEGEND, visit='visit')]
COACHING = [iw_hero(short_cred=True), iw_deeper(short=True), iw_how(cta=False, short=True), CRED_S, iw_path(cta=True), iw_voices_placeholder(), iw_begin(), iw_end(LEGEND)]

CFG = cfg('s', 'Short', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'The team', 'hosts'), ('03', 'The menu', 'services'), ('04', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'Credentials', 'c-cred'), ('04', 'The path', 'c-path'), ('05', 'Begin', 'c-begin')], steps=False)
