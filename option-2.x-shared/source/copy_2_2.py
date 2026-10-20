"""Option 2.2 — "This is your space."  Maggie is the source: Salon OM (an Aveda Concept Salon, for guests) and
Inner Work with Maggie (coaching, for clients), two equal doors. The five element films become the five
moments of a visit; Inner Work is a light, airy parallel world ("Dawn").

Copy: CRO pass of 19 Oct 2026 (task 1c45dcbb), in Maggie's voice and to her October 2026 copy direction.
Every slide follows J's CRO stages inside Maggie's journey (hook, understanding, authority, story and care,
the offer, begin); the stage is noted above each slide. Rules: option-2.2/writing.md.
Placeholders stay in [square brackets] until the fact is confirmed. Never invent one."""
from build import btn

SPECS = ('What happens', 'Included', 'Guests often feel')
CSPECS = ('What happens', 'Focus', 'Clients often feel')
CFG = {
  'title': 'Salon OM Option 2.2', 'theme': 'dawn', 'draft': 'Option 2.2 draft',
  'desc': 'Where Beauty and Inner Work Belong. Salon OM, an Aveda Concept Salon, and Inner Work with Maggie, both with Maggie Woodward.',
  'book_salon': 'begin', 'book_coaching': 'c-begin',
  # Names of the two worlds (header switch, phone dock, menu, footer link). Contract with Designer 1, task cf7dd8fd.
  'worlds': {'salon': 'Salon OM', 'coaching': 'Inner Work with Maggie'},
  # Labels build.py still hardcodes (asked of Designer 1 as CFG keys; harmless until read).
  'book_coaching_label': 'Connection Call',
  'menu_salon_btn': 'Book your visit', 'menu_coaching_btn': 'Book a Connection Call',
  'foot_visit': 'Salon OM in person · Inner Work in person and online',
  'rail': [('Arrive', 'arrive'), ('Unwind', 'unwind'), ('Renew', 'renew'), ('Unhurried', 'unhurried'), ('Leave whole', 'whole')],
  'menu': {
    'salon': [('01', 'The visit', 'arrive'), ('02', 'Maggie', 'hosts'), ('03', 'Salon rituals', 'time'), ('04', 'Aveda', 'aveda'), ('05', 'Book', 'begin')],
    'coaching': [('01', 'The path', 'c-rooted'), ('02', 'Maggie', 'c-maggie'), ('03', 'Paths', 'c-sessions'), ('04', 'Why Inner Work', 'c-facts'), ('05', 'Connection Call', 'c-begin')],
  },
  'salon': [
    # HOOK. Maggie's first screen: the locked tagline, the locked pairing line, two equal doors.
    ('hero_mark', dict(id='top', film='hero', next='arrive',
      hook='Where Beauty and Inner Work Belong',
      eyebrow='An Aveda Concept Salon',
      line='Only Aveda: plant-based, 100% vegan, and giving back, with clean water worldwide and the Yawanawá of Brazil.',  # sources: aveda.com/mission-giving-back, /about (19 Oct 2026)
      ctas=btn('Book your time', '#begin', 'light', arrow=True) + btn('Step inside', '#arrive', 'ghost'))),
    # HOOK → UNDERSTANDING. One gentle question that names what guests carry.
    ('tease', dict(id='pause', parked='J 19 Oct 17:23: remove, park for later', looks=dict(photo='rest.webp', frame='real-styling-chair.webp'), label='A gentle question', accents=['care'],
      text='When did someone last take care of you, without rushing you or needing anything back?',
      after='At Salon OM, that is the whole point of your visit.', after_at='3.6s')),
    # STORYTELLING. Five moments, each answering one quiet worry with warmth (Maggie's step 04).
    # Moment 01 is ROOTED (J, 19 Oct 16:39): hair roots, rooted in yourself, in nature, in care kind to the earth.
    # Ayurveda is NOT claimed: not found on aveda.com (19 Oct). Add it only with a source.
    ('ch', dict(id='arrive', chapter=0, sound='earth', film='earth',
      film_top=dict(poster='img/scalp-ritual.webp', stand='Stand-in: the salon hair-care film comes here'),  # J 17:20, Designer 1: two films stacked
      acc='earth', num='01', of='/ 05', name='Arrive', sub='The consultation', title='Rooted',
      body='Chesney welcomes you with tea. Beautiful hair begins at the root, and so do you, so first we talk: your hair, your life, how you would like to feel.',
      specs=[(SPECS[0], 'Consultation over tea'), (SPECS[1], 'Plant-based Aveda care'), (SPECS[2], 'Grounded')])),
    ('ch', dict(id='unwind', chapter=1, sound='water', film='water', acc='water', num='02', of='/ 05', name='Unwind', sub='The rituals', title='Release',
      body='At the shampoo basins: warm water and slow hands, the way a river smooths a stone. You choose your scent on an Aveda aroma journey, and tension often lets go.',
      specs=[(SPECS[0], 'Aroma journey at the basin'), (SPECS[1], 'Scalp & shoulder ritual'), (SPECS[2], 'Lighter')])),
    ('ch', dict(id='renew', chapter=2, sound='fire', film='fire', acc='fire', num='03', of='/ 05', name='Renew', sub='Cut & color', title='Transform',
      body='At the Aveda color bar, your color is mixed from plants, 100% vegan. Then a cut that follows the way your hair naturally grows. Kind to you, and to the earth.',
      specs=[(SPECS[0], 'Bespoke cut & color'), (SPECS[1], 'Plant-based, vegan'), (SPECS[2], 'Radiant')])),
    ('ch', dict(id='unhurried', chapter=3, sound='air', film='air', acc='air', num='04', of='/ 05', name='Unhurried', sub='Your time', title='Breathe',
      body='A visit may last up to three hours, because real care takes its time. Rest by the fireplace in the lounge while your color develops. This time is yours.',
      specs=[(SPECS[0], 'One to three hours'), (SPECS[1], 'Your pace, your needs'), (SPECS[2], 'At ease')])),
    ('ch', dict(id='whole', chapter=4, sound='ether', film='ether', acc='ether', num='05', of='/ 05', name='Leave whole', sub='The finish', title='Glow',
      body='Finished by hand at the styling chair, your hair catches the light like late-afternoon sun. Simple rituals carry the feeling into your week.',
      specs=[(SPECS[0], 'Finish & styling tips'), (SPECS[1], 'Aftercare ritual'), (SPECS[2], 'Cared for')])),
    # ESTABLISH AUTHORITY. Moved up from after the rituals: trust before features (Maggie's step 03).
    ('team', dict(id='hosts', layout='letter', ph_tag=False, eyebrow='Founder, stylist, and guide', title='28 years in the chair.',
      note='I’m the backdrop. It’s not about me, it’s about you. This is your time, your space.', sign='Maggie',  # Maggie verbatim, stream 19 Oct 2:30:13-2:30:21
      intro='Maggie Woodward is the founder of Salon OM and of Inner Work with Maggie. The team dresses in black, as Aveda salons do, so the focus stays on you. [Her training and origin story, in her words, from the copy interview.]',
      people=[dict(name='Maggie Woodward', img='real-maggie-arms-crossed.webp', alt='Maggie Woodward in front of the Aveda shelves at Salon OM', role='Founder · stylist and guide', desc='Founder of Salon OM and Inner Work with Maggie. Stylist and guide.'),
              dict(name='Katie Paonessa', role='Stylist', desc='A full part of Salon OM. [Her page and services to come.]', img=None),
              dict(name='Chesney', role='Salon Concierge', desc='Welcomes every guest, from booking to tea, coffee, or water.', img=None)])),
    # FEATURES AND BENEFITS (the offer). Salon rituals, clearly laid out (Maggie's step 05).
    ('offers', dict(id='time', layout='menu', eyebrow='Salon rituals', title='Choose your visit.',
      intro='Every visit begins with tea and a conversation. [Services, times, and prices to confirm.]',
      tiles=[dict(img='real-shampoo-basins.webp', alt='The shampoo basins at Salon OM', tag='Up to 3 hours', title='The Sanctuary', text='Consultation, aroma journey, scalp and shoulder ritual, cut and color, and a slow finish.', btns=btn('Book', '#begin', 'sm') + btn('Learn more', '#arrive', 'ghost btn--sm')),
             dict(img='real-styling-stations.webp', alt='A styling station with a mirror at Salon OM', tag='90 minutes', title='Cut & Ritual', text='A bespoke cut, with the aroma journey and a scalp ritual.', btns=btn('Book', '#begin', 'sm') + btn('Learn more', '#renew', 'ghost btn--sm')),
             dict(img='real-color-bar.webp', alt='The Aveda color bar at Salon OM', tag='2 to 3 hours', title='Color Ritual', text='Plant-powered Aveda color, with hand and scalp rituals while it develops.', btns=btn('Book', '#begin', 'sm') + btn('Learn more', '#renew', 'ghost btn--sm'))])),
    # SUMMARIZE (social proof). Maggie's chosen guest words, verbatim, initials only.
    ('voices', dict(id='kind', quotes=[('Seeing you is magic for my mind, body, and soul.', 'L.T.', 'Guest'),
                                       ('I come away feeling lighter in spirit and sporting a great haircut.', 'C.M.', 'Guest'),
                                       ('She truly makes your time with her your own.', 'G.A.', 'Guest'),
                                       ('Maggie is a great listener and skilled with unique hair and what I needed and wanted.', 'S.', 'Guest')])),
    # FEATURES AND BENEFITS (why us). The locked signature line meets Aveda's founding idea.
    ('facts', dict(id='aveda', eyebrow='Why Aveda', title='Beauty from the inside out.',
      paras=['Salon OM is an Aveda Concept Salon. Aveda was founded in 1978 by Horst Rechelbacher to create holistic beauty through wellness. Its name means “knowledge of the whole,” which is what OM means to us.',
             'Guests often come for the scents, the rituals, and the results, and stay for what Aveda stands for.'],
      quote='Care for the world we live in.', cite='Aveda’s mission',
      facts=[('100%', 'vegan formulas', True), ('1st', 'beauty company to manufacture with 100% wind power (2007)'), ('B Corp', 'certified for people and planet (2023)'), ('1978', 'the year plant-based, holistic beauty began', True)],
      src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.')),
    # HOOK (meaning). The locked OM line.
    # After Aveda ('knowledge of the whole'), the label bridges to the salon's own name; the OM line stays locked and first.
    ('tease', dict(id='om', label='The whole, in one word · OM', dark=True, accents=['everything.', 'one.', 'all.'],
      text='OM is the first sound, the breath of everything. Earth, water, fire, air, and space, held as one. And you are part of it all.',
      after='That is why we are Salon OM.', after_at='5.2s')),
    # FEATURES AND BENEFITS (the second practice). Moved before the voices, so both doors sit in the offer.
    ('bridge', dict(id='deeper', img='meadow.webp', eyebrow='One Source. Two Practices.', title='Some things go deeper than hair.',
      text='Each practice stands on its own, and they also work together. Inner Work with Maggie is coaching for anyone, guest or not: room to grow and reconnect with yourself.',
      btn=btn('Enter Inner Work', '#coaching', 'light', arrow=True, world='coaching'))),
    # SUMMARIZE → CTA. One line recaps the visit, then one calm next step. "Begin." is locked.
    ('cta', dict(id='begin', film='hero', label='Your visit, made around you', title='Begin.',
      text='Tea, a real conversation, and up to three unhurried hours of care. [Booking link to confirm.]', btn=btn('Book your visit', '#letters', 'light', arrow=True))),
    ('end', dict(id='letters', title='Letters for the journey', tagline='Beauty from the inside out',
      explore=[('The visit', 'arrive'), ('Maggie', 'hosts'), ('Salon rituals', 'time'), ('Aveda', 'aveda')])),
  ],
  'coaching': [
    # Mirrors the salon list slot for slot, same kinds and order (J, 19 Oct 16:50). Same element film per slot = the parallel.
    # 1 HOOK. The same first screen and two doors; here the Inner Work door is the one you are on.
    ('hero_words', dict(id='c-top', film='air', sound='air', next='c-rooted', at='.5s', sub_at='1.4s', foot_at='1.7s', eyebrow='Inner Work with Maggie', title='Return to yourself.',
      sub='Room to grow and reconnect with your inner wisdom, at your pace. In person or online.',
      ctas=btn('Book a Connection Call', '#c-begin', arrow=True) + btn('Step inside', '#c-rooted', 'ghost'))),
    # 2 HOOK → UNDERSTANDING. What clients may carry, without assuming their story.
    ('tease', dict(id='c-pause', parked='mirror of the parked salon pause (J 16:50: same sections, same order)', looks=dict(photo='coaching-room.webp', frame='real-maggie-fireplace.webp'), sound='air', label='Perhaps this is you', accents=['within'],
      text='You may have carried a great deal, for a long time. What if the strength you are looking for already exists within you?')),
    # 5-9 STORYTELLING → BENEFITS. The same five moments, from the inside: each pairs the work with nature, never forced.
    ('ch', dict(id='c-rooted', chapter=0, sound='earth', film='earth', acc='earth', num='01', of='/ 05', name='Begin', sub='Your story', title='Rooted',
      body='Lasting change grows from the root, from who you already are. We begin with your story, at your pace, with room to be fully heard.',
      specs=[(CSPECS[0], 'Listening'), (CSPECS[1], 'Your story'), (CSPECS[2], 'Grounded')])),
    ('ch', dict(id='c-release', chapter=1, sound='water', film='water', acc='water', num='02', of='/ 05', name='Let go', sub='Old beliefs', title='Release',
      body='Like water around a stone, old weight can soften and move. Together we name the beliefs that may be holding you back, and let them ease.',
      specs=[(CSPECS[0], 'Naming beliefs'), (CSPECS[1], 'Limiting beliefs'), (CSPECS[2], 'Lighter')])),
    ('ch', dict(id='c-transform', chapter=2, sound='fire', film='fire', acc='fire', num='03', of='/ 05', name='Grow', sub='Change', title='Transform',
      body='Growth, the way a plant grows: toward the light, at its own pace. Small, courageous steps, held with compassion.',
      specs=[(CSPECS[0], 'Small steps'), (CSPECS[1], 'Courage'), (CSPECS[2], 'Empowered')])),
    ('ch', dict(id='c-breathe', chapter=3, sound='air', film='air', acc='air', num='04', of='/ 05', name='Pause', sub='Your pace', title='Breathe',
      body='Room to breathe, and to hear your own inner wisdom again. Sessions may be in person or online. This time is yours.',
      specs=[(CSPECS[0], 'Space to reflect'), (CSPECS[1], 'Inner wisdom'), (CSPECS[2], 'Clear')])),
    ('ch', dict(id='c-glow', chapter=4, sound='ether', film='ether', acc='ether', num='05', of='/ 05', name='Carry it forward', sub='After', title='Glow',
      body='Keep growing, in every aspect of your life: choosing Joy, peace, and purpose, and carrying them into your week. Clients often leave lighter.',
      specs=[(CSPECS[0], 'Next steps'), (CSPECS[1], 'Your own practice'), (CSPECS[2], 'Aligned')])),
    # 4 ESTABLISH AUTHORITY. Maggie alone (Katie and Chesney belong to the salon). The letter is her own words, verbatim.
    ('team', dict(id='c-maggie', layout='letter', ph_tag=False, sound='air', eyebrow='Your guide, Maggie Woodward', title='Rooted in lived experience.',
      intro='After 28 years of listening in the chair, Maggie guides from her own story. [Her coaching training, to confirm.]',
      note='Through both hardship and healing, I have learned that transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage.', sign='Maggie',
      people=[dict(name='Maggie Woodward', img='real-maggie-standing-shelves.webp', alt='Maggie Woodward standing by the Aveda shelves at Salon OM', role='Founder · guide', desc='Founder of Inner Work with Maggie and Salon OM.')])),
    # 11 FEATURES AND BENEFITS (the offer). The Inner Work path, clearly laid out; the Connection Call is the way in.
    ('offers', dict(id='c-sessions', layout='menu', sound='air', eyebrow='The Inner Work path', title='Choose your path.',
      intro='Open to everyone, guest of Salon OM or not. Every path begins with a complimentary Connection Call. [Formats and prices to confirm.]',
      tiles=[dict(img='coaching-room.webp', alt='Two linen armchairs, tea and an open journal by a window', tag='60 minutes · in person', title='One-to-one', text='A private space to release limiting beliefs and reconnect with your inner wisdom.', btns=btn('Book', '#c-begin', 'sm') + btn('Learn more', '#c-rooted', 'ghost btn--sm')),
             dict(img='meadow.webp', alt='A woman standing in a misty meadow at dawn', tag='60 minutes · online', title='Online', text='The same care, wherever you are.', btns=btn('Book', '#c-begin', 'sm') + btn('Learn more', '#c-rooted', 'ghost btn--sm')),
             dict(img='salon-om-circle.webp', alt='Floor cushions in a circle around a candle', tag='Group · 6 weeks', title='Rise circle', text='Grow alongside others who are choosing Joy, peace, and purpose.', btns=btn('Join the waitlist', '#c-letters', 'sm') + btn('Learn more', '#c-rooted', 'ghost btn--sm'))])),
    # 13 Client voices: left out until real Inner Work words arrive. Put back here with real quotes, initials only:
    # ('voices', dict(id='c-kind', sound='air', quotes=[('<quote>', '<initials>', 'Client')])),
    # 10 FEATURES AND BENEFITS (why Maggie). Her own sentence, verbatim; unconfirmed facts in brackets.
    ('facts', dict(id='c-facts', sound='air', eyebrow='Why Inner Work', title='Where the work comes from.',
      paras=['Inner Work with Maggie grows from the same place as Salon OM: deep listening, and care for the whole person.',
             'Clients often come for clarity, and stay for the way it feels to be heard.'],
      quote='I am passionate about supporting people in breaking free from limiting beliefs, reconnecting with their inner wisdom, and discovering the strength and potential that already exists within them.', cite='Maggie Woodward',
      facts=[('28', 'years of listening in the chair', True), ('1:1', 'in person or online'), ('[Training]', 'coaching training, to confirm'), ('[Year]', 'Inner Work began, to confirm')],
      src='Facts in brackets are placeholders until Maggie confirms them.')),
    # 3 HOOK (meaning). The OM line, turned inward. The locked phrase stays word for word.
    ('tease', dict(id='c-om', sound='air', label='The whole, in one word · OM', dark=True, accents=['everything.', 'all.'],
      text='OM is the first sound, the breath of everything. The same breath moves in you, steady through every season. And you are part of it all.')),
    # 12 FEATURES AND BENEFITS (the second practice). The other equal door, and the stand-alone line.
    ('bridge', dict(id='c-salon', sound='air', img='real-lounge.webp', eyebrow='One Source. Two Practices.', title='Let yourself be cared for.',
      text='Each practice stands on its own, and they also work together. Salon OM is Maggie’s Aveda Concept Salon, where up to three unhurried hours of care are made around you.',
      btn=btn('Enter Salon OM', '#', 'light', arrow=True, world='salon'))),
    # 14 SUMMARIZE → CTA. The locked button and its locked line.
    ('cta', dict(id='c-begin', sound='air', film='air', label='A calm first step', title='Begin.',
      text='Rooted, release, transform, at your own pace. Begin with your complimentary conversation.', btn=btn('Book a Connection Call', '#c-letters', 'light', arrow=True))),
    # 15
    ('end', dict(id='c-letters', sound='air', title='Letters for the journey', tagline='Where Beauty and Inner Work Belong',
      explore=[('The path', 'c-rooted'), ('Maggie', 'c-maggie'), ('Paths', 'c-sessions'), ('Why Inner Work', 'c-facts'), ('Connection Call', 'c-begin')])),
  ],
}
