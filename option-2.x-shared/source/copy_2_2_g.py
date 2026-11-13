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

# ---- THE CYCLE MAP (round 4, task 0fea0949; J 4 Nov: the whole page is one Hook, Proof, Retain, Reward, CTA with nested
# cycles; a CTA right after a payoff). One line per section, in Designer 1's round 4 order: HOOK / PROOF / RETAIN / REWARD / CTA.
# Salon OM, the page: HOOK the opening and its ROT line / PROOF the proof line / RETAIN the sections below / REWARD Begin's
#   "attention that is only on you" / CTA Book your visit.
#  hero      Maggie's locked words + ROT "in one visit, with Maggie's full attention" / proof line (Aveda Concept Salon,
#            28 years) / the doors / the promise itself / Book your visit
#  pause     "Take a breath. When did you last ...?" / none, by design (the story's turn; proof follows in the steps) /
#            story, one open question / "You deserve this moment." / none, by design (it follows the opening's button)
#  (round 5, Designer 1: the menu moved to right after the five steps; the lines below follow that order)
#  preview   "Your visit, from the first sip to the last look, in five steps." / the five real steps / a list that
#            becomes the rail / "You know what happens, and in what order, before you book." / none, by design (the steps follow)
#  menu      "Every service, and every price, before you book." / her consultation line + the value stack ABOVE the prices,
#            then six services with her prices, her note and G.A. beneath / the menu list / "Choose yours." + her days / Book your visit
#  steps     each name and word / her description / the rail, 01 to 05 / her three details (What happens, Included, You'll feel) /
#            none inside a step, by design (the menu's button came just before, Team's comes after)
#  team      "The people who listen first." / Maggie's story (28 years, a place to be seen, heard and cared for, the
#            team in black) + three cards / cards / Maggie: "I'm the backdrop ... your time, your space." / Book your visit
#  voices    "Lighter, inside and out." / her eight guest quotes / quotes / "A great haircut, and a lighter spirit ..." /
#            Book your visit
#  aveda     "What is in your color?" / her line, her quote and her four facts / the facts / "Care for your hair and
#            care for the earth, in the same visit." / Book your visit
#  om        "OM · Oneness" / her quiet version, "A sacred sound and a gift for all ..." / story / her own last line,
#            "Simply by being here, you are part of the kindness." / Book your visit
#  door      "What could change for you?" / her two practices / story / her Connection Call line / its own two buttons
#  begin     "Your moment awaits." / her text ("from your first sip of tea to your final style") + her two-week word / "Begin." / "Hair that feels like you, and
#            attention that is only on you." / Book your visit
# Inner Work, the page: HOOK "Explore who you are Becoming." + ROT / PROOF her short credentials / RETAIN below /
#   REWARD Begin's "You leave the call knowing your next step" / CTA Book a Connection Call.
#  deeper    "Look a little deeper." + her lead / Hebb, in her text / story / "You get to choose again." / Book a Connection Call
#  how       "Grounded in research. Space to Grow." / six practices / list / "The aim is to meet old patterns with more
#            calm, and more choice." / Book a Connection Call
#  cred      "Who will walk beside you?" / her credentials, exact / list / none, by design (the list is the payoff;
#            round 3 cut the overclaim) / none, by design (the path follows with its button)
#  path      "Four steps, and the first is a conversation." / her four steps + pricing line / steps / "The first step is
#            complimentary, and every step after it is your choice." / Book a Connection Call
#  voices    her placeholder, client words still being gathered / none yet / none yet / none yet / none, by design
#  begin     "Change begins with you." / one complimentary call / summary / "You leave the call knowing your next step
#            ..." / Book a Connection Call

# the study's round 2 [draft] lines, word for word (section 3b); everything else comes from copy_2_2_maggie.py
G = dict(
  # round 3 (CEO MA critique 10 Nov, section 5.3): the hook names the pain. J 10 Nov 08:56: less emphasis on time ("unhurried
  # time" can make a visit sound long), so the objection is answered with attention, in Maggie's phrase from her direction deck
  # round 4 (CEO MA QA item 4): the T of ROT back. "in one visit" is speed, not length
  rot_salon='Hair that finally feels like you, in one visit, with Maggie’s full attention.',
  rot_iw='Uncover the beliefs that may be holding you back, without reliving the past. It starts with one Connection Call.',
  preview='Your visit, from the first sip to the last look, in five steps.',
  preview_reward='You know what happens, and in what order, before you book.',   # round 5 order: the steps follow the preview again
  # round 5: no benefit lines. Her 11 Nov steps carry a full description and three details each (What happens,
  # Included, You'll feel): each step's proof and reward, in her words
  benefits=[None] * 5,
  om_reward='Your hair, your rest and you, cared for as one.',
  aveda_hook='What is in your color?',
  aveda_reward='Care for your hair and care for the earth, in the same visit.',
  team_hook='The people who listen first.',
  voices_reward='A great haircut, and a lighter spirit. Both are part of the visit.',
  menu_hook='Every service, and every price, before you book.',
  menu_answer='Not sure which to choose? Your visit begins with a real conversation, and your service is shaped with you there.',
  # round 3 (critique 5.1): the value stack beside the prices. Whether every hair visit includes all of it is Maggie's to confirm
  menu_stack='Every visit includes your drink and snack of choice, a scalp and shoulder ritual and at-home styling tips.',   # her step details, stacked
  # round 4: value before price (the stack sits ABOVE the prices) and one honest scarcity line, her booking page's days
  menu_reward='Choose yours. Salon OM welcomes guests by appointment, Monday to Friday.',   # round 5: her hours (11 Nov footer)
  # round 4 (J 4 Nov, storytelling): Maggie's story in her own words, from her decks and the 19 Oct call ("at Aveda, we only
  # wear black ... because the focus is the client"); her card's line stays hers, the two short lines around it are new
  story_open='Maggie has spent 28 years in the chair.',
  story_close='The team wears black, because the focus is always you.',
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
  iw_begin_text='In one complimentary call of about 30 to 45 minutes, never rushed, Maggie learns what you are looking for, and together you see if she is the right fit. Investment is shared there too.',
  iw_begin_reward='You leave the call knowing your next step, and whether Maggie is the one to walk it with you.',
)
# round 5: G.A.'s "She truly makes your time with her your own." sits beneath the menu, where her 11 Nov document puts it


def _with(sec, **kw):
    kind, d = sec
    return (kind, dict(d, **kw))


SALON = [
  _with(salon_hero(proof=True), rot=draft(G['rot_salon'])),
  ('tease', dict(id='pause', label='The pause', tone='dark', accents=['moment.'], text=M.PAUSE['text'], after=M.PAUSE['after'], after_at='3.4s',
                 )),                                 # round 4: G.A.'s words move to Breathe (step 04), their proof
  (S.preview_line, dict(id='visit', eyebrow='The visit', title=draft(G['preview']), reward=draft(G['preview_reward']),
                   rows=[(f'0{k + 1}', s[0], s[2] + '.') for k, s in enumerate(M.STEPS)])),
] + [step(k, extra=G['benefits'][k]) for k in range(5)] + [
  # round 5 (task 2846db82, CEO MA 11 Nov): the menu comes right after the five steps, so the visit preview becomes the
  # step rail again (J's 4 Nov ask, a feature never traded away); still far earlier than its old 13th place
  # her intro ("Every service begins with a personal consultation ...") answers "which one do I need?" in her words, so
  # round 3's answer line is cut; the value stack follows her intro, above the prices
  _with(services(), title=draft(G['menu_hook']), intro=M.MENU_LINE + ' ' + M.MENU_INTRO + ' ' + draft(G['menu_stack']),
        reward=draft(G['menu_reward']), btn=btn(BOOK, BOOK_URL, arrow=True)),
  _with(team(note=True), eyebrow=M.TEAM_LINE, title=draft(G['team_hook']), btn=btn(BOOK, BOOK_URL, arrow=True),
        intro=draft(G['story_open']) + ' ' + M.TEAM[0]['desc'] + ' ' + draft(G['story_close'])),
  (S.voices_row, dict(id='kind', eyebrow=M.VOICES_EYEBROW, title=M.VOICES_LINE, quotes=M.QUOTES, reward=draft(G['voices_reward']),
                  btn=btn(BOOK, BOOK_URL, arrow=True))),
  ('facts', dict(id='aveda', light=True, eyebrow=M.AVEDA_EYEBROW, title=draft(G['aveda_hook']), paras=[M.AVEDA],
                 quote=M.AVEDA_QUOTE, cite=M.AVEDA_CITE, facts=AVEDA_FACTS, src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.',
                 reward=draft(G['aveda_reward']), btn=btn(BOOK, BOOK_URL, arrow=True))),
  ('tease', dict(id='om', label='OM · Oneness', dark=True, accents=['kindness.'], text=M.OM,   # her quiet version; its last line is the payoff
                 btn=btn(BOOK, BOOK_URL, arrow=True))),
  door(short=False),
  _with(begin(), answer=draft(A11['adjust']), reward=draft(G['begin_reward'])),   # her Begin text and buttons; her two-week word (11 Nov)
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
