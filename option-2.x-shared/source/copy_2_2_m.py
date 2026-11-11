"""Option 2.2 · M, Maggie's order (study febe2c3a, section 8): her sections, in her order, in her approved words only.
Salon OM (SO deck p.4): Opening, The pause, OM · Oneness, The visit, Why Aveda, Team and menu, Voices, The second door,
Begin. Inner Work (IW deck p.3): Opening, Look a little deeper, How we work together (+ credentials), The path, Voices,
Begin, Footer. Where her words are still to come, a visible [placeholder]. Nothing here is new copy: the only added
words are the one action of each world ('Book your visit', 'Book a Connection Call'), placed as in G (J: "just 1 for
each salon and coaching ... but throughout the site"; task 0ab956d4)."""
from mgs_parts import *

SALON = [
  salon_hero(proof=False),
  ('tease', dict(id='pause', label='The pause', accents=['moment.'], text=M.PAUSE['text'], after=M.PAUSE['after'], after_at='3.4s')),
  ('tease', dict(id='om', label='OM · Oneness', dark=True, accents=['OM.'], text=M.OM)),
] + [step(k, cta=(k == 4)) for k in range(5)] + [
  ('tease', dict(id='aveda', label='Why Aveda', dark=True, accents=['earth.'], text=M.AVEDA, btn=btn(BOOK, BOOK_URL, arrow=True))),   # forest: the strong button on light clay
  team(note=False),
  services(eyebrow='Team and menu'),
  voices(cta=True),
  door(short=False),
  begin(summary=False),
  salon_end(LEGEND_M),
]
COACHING = [iw_hero(), iw_deeper(), iw_how(cta=True), iw_credentials(), iw_path(cta=True), iw_voices_placeholder(), iw_begin(), iw_end(LEGEND_M)]

CFG = cfg('m', "Maggie's order", SALON, COACHING,
  [('01', 'The pause', 'pause'), ('02', 'The visit', 'arrive'), ('03', 'Team and menu', 'hosts'), ('04', 'Voices', 'kind'), ('05', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'Credentials', 'c-cred'), ('04', 'The path', 'c-path'), ('05', 'Begin', 'c-begin')])
