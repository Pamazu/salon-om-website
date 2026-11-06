"""Option 2.2 · S, Short (study febe2c3a, section 8): one screen per stage, about a third of the scroll. Salon OM in
six screens, Inner Work in five. Maggie's words only, shortened by cutting whole sentences, never rewording (the cuts
go to her); the proof line and the Begin summary are the study's [draft] lines. Left out: the pause, OM, the full step
screens, the full credentials, Why Aveda (its one line moves into the proof screen)."""
from mgs_parts import *

VISIT = ('steps', dict(id='visit', eyebrow='The visit', title=M.VISIT_LINE,
                       steps=[(f'0{k + 1}', s[0], f'{s[2]}. {s[3]}') for k, s in enumerate(M.STEPS)],
                       btn=btn(BOOK, BOOK_URL, 'light', arrow=True)))
PROOF = ('proof', dict(id='hosts', eyebrow='Meet the team', title=M.TEAM_LINE,
                       people=[dict(M.TEAM[i], img=TEAM_IMG[i][0], alt=TEAM_IMG[i][1]) for i in range(3)],
                       quotes=M.QUOTES[:2], line_k='Why Aveda', line=M.AVEDA))
SALON = [salon_hero(proof=True), VISIT, PROOF, services(), door(short=True), begin(summary=True), salon_end(LEGEND)]
COACHING = [iw_hero(short_cred=True), iw_deeper(short=True), iw_how(cta=False, short=True), iw_path(cta=True), iw_begin(), iw_end(LEGEND)]

CFG = cfg('s', 'Short', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'The team', 'hosts'), ('03', 'The menu', 'services'), ('04', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'The path', 'c-path'), ('04', 'Begin', 'c-begin')], steps=False)
