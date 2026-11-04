"""Option 2.2 · G, Guided (study febe2c3a, sections 3b to 7): Maggie's words in every section; the only new words are the
study's [draft] lines (dotted underline). The page is one Hook, Proof, Retain, Reward, CTA cycle with nested section
cycles: a proof line under the hook, a five-step preview that becomes the step rail, Team and Voices before the menu,
'Book your visit' where a reward has just landed. Inner Work: short credentials under the opening, a CTA after the
practices and on the path; client voices left out until real words arrive."""
from mgs_parts import *

PREVIEW = ('preview', dict(id='visit', eyebrow='The visit', title=draft(D['preview']),
                           rows=[(f'0{k + 1}', s[0], s[2] + '.') for k, s in enumerate(M.STEPS)]))
AVEDA = ('facts', dict(id='aveda', light=True, eyebrow='Why Aveda', title=M.AVEDA, paras=[],
                       facts=[(n, draft(t), *c) for n, t, *c in AVEDA_FACTS], src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.',
                       btn=btn(BOOK, '#begin', arrow=True)))
SALON = [
  salon_hero(proof=True),
  ('tease', dict(id='pause', label='The pause', accents=['moment.'], text=M.PAUSE['text'], after=M.PAUSE['after'], after_at='3.4s')),
  PREVIEW,
] + [step(k, extra=D['benefits'][k], cta=(k == 4)) for k in range(5)] + [
  ('tease', dict(id='om', label='OM · Oneness', dark=True, accents=['OM.'], text=M.OM)),
  AVEDA,
  team(note=True),
  voices(cta=True),
  services(per_service_cta=True),
  door(short=False),
  begin(summary=True),
  salon_end(LEGEND),
]
COACHING = [iw_hero(short_cred=True), iw_deeper(), iw_how(cta=True), iw_credentials(), iw_path(cta=True), iw_begin(), iw_end(LEGEND)]

CFG = cfg('g', 'Guided', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'Why Aveda', 'aveda'), ('03', 'The team', 'hosts'), ('04', 'The menu', 'services'), ('05', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'Credentials', 'c-cred'), ('04', 'The path', 'c-path'), ('05', 'Begin', 'c-begin')])
