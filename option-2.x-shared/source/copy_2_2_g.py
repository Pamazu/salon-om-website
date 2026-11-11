"""Option 2.2 · G, Guided (study febe2c3a, round 2 of 6 Nov 2026, task 9456424d; round 3 of 10 Nov, task df14fa0d): every section is one cycle,
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
  # round 3 (CEO MA critique 10 Nov, section 5.3): the hook names the pain. J 10 Nov 08:56: less emphasis on time ("unhurried
  # time" can make a visit sound long), so the objection is answered with attention, in Maggie's phrase from her direction deck
  rot_salon='Hair that finally feels like you, with Maggie’s full attention.',
  rot_iw='Uncover the beliefs that may be holding you back, without reliving the past. It starts with one Connection Call.',
  preview='Your visit, from the first sip to the last look, in five steps.',
  preview_reward='You know what happens, and in what order, before you book.',
  benefits=['You are heard before anything is done to your hair.', 'The week’s tension lets go.',
            'Planned around your hair and the upkeep you want.',     # round 3: the Aveda product claim cut (Aveda's own figures vary by line)
            None,                                                     # round 3: the promise cut; Maggie's own line says it
            None],                                                    # round 3: Shine is Maggie's line alone
  om_reward='Your hair, your rest and you, cared for as one.',
  aveda_hook='What is in your color?',
  aveda_reward='Care for your hair and care for the earth, in the same visit.',
  team_hook='The people who listen first.',
  voices_reward='A great haircut, and a lighter spirit. Both are part of the visit.',
  menu_hook='Every service, and every price, before you book.',
  menu_answer='Not sure which to choose? Your visit begins with a real conversation, and your service is shaped with you there.',
  # round 3 (critique 5.1): the value stack beside the prices. Whether every hair visit includes all of it is Maggie's to confirm
  menu_reward='Every hair visit includes your favorite drink, a real conversation, a scalp ritual with Stress-Fix oil and time shaped around you.',
  # round 3: the stack in Maggie's own step lines, "lesson" cut (her words: "We teach you to recreate your style at home.")
  begin_stack='Comforting Tea and a real conversation. A scalp ritual with Stress-Fix oil. Cut, color, blonding or extensions, designed for you alone. We teach you to recreate your style at home.',
  begin_reward='Hair that feels like you, and attention that is only on you.',
  cred_hook='Who will walk beside you?',
  # round 3: the reworded disclaimer and "trained in each method she uses" cut (compliance words exactly or not at all;
  # neuroscience is study, EMDR education only). Her exact disclaimer stays in the footer.
  how_reward='The aim is to meet old patterns with more calm, and more choice.',   # round 3 (critique 5.7): the outcome, in her gentle register
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
  ('tease', dict(id='pause', label='The pause', tone='dark', accents=['moment.'], text=M.PAUSE['text'], after=M.PAUSE['after'], after_at='3.4s',
                 proof_line=f'“{PAUSE_QUOTE[0]}” {PAUSE_QUOTE[1]}')),
  (S.preview_line, dict(id='visit', eyebrow='The visit', title=draft(G['preview']), reward=draft(G['preview_reward']),
                   rows=[(f'0{k + 1}', s[0], s[2] + '.') for k, s in enumerate(M.STEPS)])),
  # round 4 (task 2846db82; J 11 Nov: "having the services that down I'm unsure", the CEO MA's order): the menu comes 4th,
  # once the visit preview has framed the value, then the five steps, team, voices, Why Aveda, OM, the second door, Begin
  _with(services(), eyebrow='The menu', title=draft(G['menu_hook']), intro=M.MENU_LINE,
        answer=draft(G['menu_answer']), reward=draft(G['menu_reward']), btn=btn(BOOK, BOOK_URL, arrow=True)),
] + [step(k, extra=G['benefits'][k]) for k in range(5)] + [
  _with(team(note=True), eyebrow=M.TEAM_LINE, title=draft(G['team_hook']), btn=btn(BOOK, BOOK_URL, arrow=True)),
  (S.voices_row, dict(id='kind', title=M.VOICES_LINE, quotes=VOICE_QUOTES, reward=draft(G['voices_reward']),
                  btn=btn(BOOK, BOOK_URL, arrow=True))),
  ('facts', dict(id='aveda', light=True, eyebrow='Why Aveda', title=draft(G['aveda_hook']), paras=[M.AVEDA],
                 facts=[(n, draft(t), *c) for n, t, *c in AVEDA_FACTS], src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.',
                 reward=draft(G['aveda_reward']), btn=btn(BOOK, BOOK_URL, arrow=True))),
  ('tease', dict(id='om', label='OM · Oneness', dark=True, accents=['OM.'], text=M.OM, proof_line=M.VISIT_LINE,
                 reward=draft(G['om_reward']), btn=btn(BOOK, BOOK_URL, arrow=True))),
  door(short=False),
  _with(begin(), text=draft(G['begin_stack']), reward=draft(G['begin_reward'])),
  salon_end(LEGEND, explore=[('The visit', 'visit'), ('The menu', 'services'), ('The team', 'hosts'), ('Begin', 'begin')]),
]

COACHING = [
  _with(iw_hero(short_cred=True), rot=draft(G['rot_iw'])),
  _with(iw_deeper(), btn=btn(CALL, CALL_URL, arrow=True)),
  _with(iw_how(cta=True), reward=draft(G['how_reward'])),
  _with(iw_credentials(), title=draft(G['cred_hook']), lead='Maggie Woodward'),
  _with(iw_path(cta=True), title=draft(G['path_hook']), answer=draft(G['path_answer']), reward=draft(G['path_reward'])),
  iw_voices_placeholder(),                           # round 3: her section 5, client words still being gathered
  _with(iw_begin(), title=M.FIRST['close'], text=draft(G['iw_begin_text']), reward=draft(G['iw_begin_reward'])),
  iw_end(LEGEND),
]

CFG = cfg('g', 'Guided', SALON, COACHING,
  [('01', 'The visit', 'visit'), ('02', 'The menu', 'services'), ('03', 'The team', 'hosts'), ('04', 'Why Aveda', 'aveda'), ('05', 'Begin', 'begin')],
  [('01', 'Look a little deeper', 'c-deeper'), ('02', 'How we work together', 'c-how'), ('03', 'Credentials', 'c-cred'), ('04', 'The path', 'c-path'), ('05', 'Begin', 'c-begin')])
