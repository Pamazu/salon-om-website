"""Option 2.2 · G, Guided (study febe2c3a, round 2 of 6 Nov 2026, task 9456424d): every section is one cycle,
Hook, Proof, Retain, Reward, CTA (study section 3b), inside one page cycle per world. Maggie's words in every section;
new words are the study's [draft] lines (dotted underline), kept in G below.
Fields the build already shows carry what they can: title = the written hook, close/after = the reward, small = an
answer, btn = the world's one action. Round 2 adds five fields, for Designer 1 to render (task 0ab956d4):
  rot        the ROT line under Maggie's locked opening (hero only)
  proof_line a line of proof under the hook (the pause, OM)
  reward     the line that pays off the section's hook, right before its button
  answer     an objection answered where it comes up (the menu, the path)
  btn        the world's one action on sections that had none (OM, Team, the menu, Look a little deeper)"""
from mgs_parts import *

# the study's round 2 [draft] lines, word for word (section 3b); everything else comes from copy_2_2_maggie.py
G = dict(
  rot_salon='Hair that feels like you, in one visit, without the rush.',
  rot_iw='Uncover the beliefs that may be holding you back, without reliving the past. It starts with one Connection Call.',
  preview='Your visit, from the first sip to the last look, in five steps.',
  preview_reward='You know what happens, and in what order, before you book.',
  benefits=['You are heard before anything is done to your hair.', 'The week’s tension lets go.',
            'Planned around your hair and the upkeep you want, with plant-based Aveda color.',
            'Nothing is rushed, and nothing runs longer than your service needs.',
            'You leave knowing how to style it yourself, so it still looks right next week.'],
  om_reward='Your hair, your rest and your time, cared for in one visit.',
  aveda_hook='What is in your color?',
  aveda_reward='You never have to choose between hair you love and products you trust.',
  team_hook='The people who listen first.',
  voices_reward='A great haircut, and a lighter spirit. Both are part of the visit.',
  menu_hook='Every service, and every price, before you book.',
  menu_answer='Not sure which to choose? Your visit begins with a real conversation, and your service is shaped with you there.',
  menu_reward='Choose yours, and the visit is shaped around it.',
  begin_stack='Comforting Tea and a real conversation. A scalp ritual with Stress-Fix oil. Color and a cut made for you. A lesson to carry it home.',
  begin_reward='Hair that feels like you, and time that is only yours.',
  cred_hook='Who will walk beside you?',
  cred_reward='Maggie Woodward, coach and hypnotherapist, trained in each method she uses.',
  cred_answer='Inner Work is coaching and hypnotherapy for personal growth. It is not a substitute for care from a licensed healthcare professional.',
  path_hook='Four steps, and the first is a conversation.',
  path_answer='How many sessions you need is something you decide together, in your Connection Call.',
  path_reward='The first step is complimentary, and every step after it is your choice.',
  iw_begin_text='In one complimentary call, Maggie learns what you are looking for, and together you see if she is the right fit. Investment is shared there too.',
  iw_begin_reward='You leave the call knowing your next step, and whether Maggie is the one to walk it with you.',
)
PAUSE_QUOTE = M.QUOTES[2]                # G.A., moved from Voices into the pause as its proof (study 3b, salon 1)
VOICE_QUOTES = [q for q in M.QUOTES if q is not PAUSE_QUOTE]


def _with(sec, **kw):
    kind, d = sec
    return (kind, dict(d, **kw))


SALON = [
  _with(salon_hero(proof=True), rot=draft(G['rot_salon'])),
  ('tease', dict(id='pause', label='The pause', accents=['moment.'], text=M.PAUSE['text'], after=M.PAUSE['after'], after_at='3.4s',
                 proof_line=f'“{PAUSE_QUOTE[0]}” {PAUSE_QUOTE[1]}')),
  ('preview', dict(id='visit', eyebrow='The visit', title=draft(G['preview']), reward=draft(G['preview_reward']),
                   rows=[(f'0{k + 1}', s[0], s[2] + '.') for k, s in enumerate(M.STEPS)])),
] + [step(k, extra=G['benefits'][k]) for k in range(5)] + [
  ('tease', dict(id='om', label='OM · Oneness', dark=True, accents=['OM.'], text=M.OM, proof_line=M.VISIT_LINE,
                 reward=draft(G['om_reward']), btn=btn(BOOK, BOOK_URL, arrow=True))),
  ('facts', dict(id='aveda', light=True, eyebrow='Why Aveda', title=draft(G['aveda_hook']), paras=[M.AVEDA],
                 facts=[(n, draft(t), *c) for n, t, *c in AVEDA_FACTS], src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.',
                 reward=draft(G['aveda_reward']), btn=btn(BOOK, BOOK_URL, arrow=True))),
  _with(team(note=True), eyebrow=M.TEAM_LINE, title=draft(G['team_hook']), btn=btn(BOOK, BOOK_URL, arrow=True)),
  ('voices', dict(id='kind', title=M.VOICES_LINE, quotes=VOICE_QUOTES, reward=draft(G['voices_reward']),
                  btn=btn(BOOK, BOOK_URL, arrow=True))),
  _with(services(), eyebrow='The menu', title=draft(G['menu_hook']), intro=M.MENU_LINE,
        answer=draft(G['menu_answer']), reward=draft(G['menu_reward']), btn=btn(BOOK, BOOK_URL, arrow=True)),
  door(short=False),
  _with(begin(), text=draft(G['begin_stack']), reward=draft(G['begin_reward'])),
  salon_end(LEGEND),
]

COACHING = [
  _with(iw_hero(short_cred=True), rot=draft(G['rot_iw'])),
  _with(iw_deeper(), btn=btn(CALL, CALL_URL, arrow=True)),
  iw_how(cta=True),
  _with(iw_credentials(), title=draft(G['cred_hook']), close=draft(G['cred_reward']), small=draft(G['cred_answer'])),
  _with(iw_path(cta=True), title=draft(G['path_hook']), answer=draft(G['path_answer']), reward=draft(G['path_reward'])),
  _with(iw_begin(), title=M.FIRST['close'], text=draft(G['iw_begin_text']), reward=draft(G['iw_begin_reward'])),
  iw_end(LEGEND),
]

CFG = cfg('g', 'Guided', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'Why Aveda', 'aveda'), ('03', 'The team', 'hosts'), ('04', 'The menu', 'services'), ('05', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'Credentials', 'c-cred'), ('04', 'The path', 'c-path'), ('05', 'Begin', 'c-begin')])
