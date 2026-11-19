"""Option 2.2 · M, Maggie's order (study febe2c3a, section 8; round 5, task c446e8ba): the salon page is her website copy
of 11 Nov 2026 word for word and in her order (first screen, opening, the pause, OM quiet version, the five steps with
their three details, Why Aveda with her quote and four facts, Meet the Team, the menu with G.A.'s line beneath, voices,
the second door, Begin, her footer). Inner Work is her deck of 2 Nov, as before.
Salon OM (SO deck p.4): Opening, The pause, OM · Oneness, The visit, Why Aveda, Team and menu, Voices, The second door,
Begin. Inner Work (IW deck p.3): Opening, Look a little deeper, How we work together (+ credentials), The path, Voices,
Begin, Footer. Where her words are still to come, a visible [placeholder]. Nothing here is new copy: the only added
words are the one action of each world ('Book your visit', 'Book a Connection Call'), placed as in G (J: "just 1 for
each salon and coaching ... but throughout the site"; task 0ab956d4)."""
from mgs_parts import *
import copy_2_2_iw as IW

SALON = [
  salon_hero(proof=False),
  ('tease', dict(id='pause', label='The pause', accents=['moment.'], breath='om-pause-guest.webp', breath_alt=PAUSE_ALT, breath_mark=S.ai_mark(AI_GUEST), text=M.PAUSE['text'], after=M.PAUSE['after'], after_at='4.4s',
                 options=S.PAUSE_OPTIONS, option_label=S.PAUSE_LIVE_LABEL)),
  ('tease', dict(id='om', label='OM · Oneness', dark=True, accents=['kindness.'], text=M.OM)),   # her quiet version
  # task 59b17d9c (J 17 Nov): her visit opens with the same preview as G, so its five stops can fly into the step rail;
  # every word is hers: her visit line, then each step's name and its own heading ("01 · Arrive · The welcome")
  # task 20529935: her headings as she writes them, with no full stop added ("The welcome", not "The welcome.")
  (S.preview_line, dict(id='visit', eyebrow='The visit', title=M.VISIT_LINE,
                        rows=[(f'0{k + 1}', s[0], s[1].split(' · ')[-1]) for k, s in enumerate(M.STEPS)])),
] + [step(k, cta=(k == 4)) for k in range(5)] + [
  (S.aveda, dict(id='aveda', eyebrow=M.AVEDA_EYEBROW, title=M.AVEDA, paras=[], quote=M.AVEDA_QUOTE, cite=M.AVEDA_CITE,
                 facts=AVEDA_FACTS, src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.', photo=AVEDA_PHOTO,
                 btn=btn(BOOK, BOOK_URL, arrow=True))),   # her heading, her quote, her four facts (11 Nov); the label (task a749167b)
  team(note=False),
  services(),
  voices(cta=True),
  door(short=False, exact=True),
  begin(summary=False),
  salon_end(LEGEND_M),
]
COACHING = twin(SALON, iw_entries('m', SALON))      # J 18 Nov: the salon world's sections, in its order; only the words are Inner Work's (task 7a3c013b)

CFG = cfg('m', "Maggie's order", SALON, COACHING,
  [('01', 'The pause', 'pause'), ('02', 'The visit', 'arrive'), ('03', 'Team and menu', 'hosts'), ('04', 'Voices', 'kind'), ('05', 'Begin', 'begin')],
  IW.NAV['m'])
