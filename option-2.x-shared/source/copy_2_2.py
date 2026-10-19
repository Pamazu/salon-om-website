"""Option 2.2 — "This is your space."  Maggie is the source: Salon OM (an Aveda Concept Salon, for guests) and
Inner Work with Maggie (coaching, for clients), two equal doors. The five element films become the five
moments of a visit; Inner Work is a light, airy parallel world ("Dawn").

Copy: CRO pass of 19 Oct 2026 (task 1c45dcbb), in Maggie's voice and to her October 2026 copy direction.
Every slide follows J's CRO stages inside Maggie's journey (hook, understanding, authority, story and care,
the offer, begin); the stage is noted above each slide. Rules: option-2.2/writing.md.
Placeholders stay in [square brackets] until the fact is confirmed. Never invent one."""
from build import btn

SPECS = ('What happens', 'Included', 'Guests often feel')
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
    'salon': [('01', 'Maggie', 'hosts'), ('02', 'The visit', 'arrive'), ('03', 'Aveda', 'aveda'), ('04', 'Salon rituals', 'time'), ('05', 'Book', 'begin')],
    'coaching': [('01', 'Maggie', 'c-maggie'), ('02', 'How it works', 'c-how'), ('03', 'What often changes', 'c-lighter'), ('04', 'Paths', 'c-sessions'), ('05', 'Connection Call', 'c-begin')],
  },
  'salon': [
    # HOOK. Maggie's first screen: the locked tagline, the locked pairing line, two equal doors.
    ('hero_doors', dict(id='top', film='hero', next='pause',
      eyebrow='Maggie Woodward', title='Where Beauty and Inner Work Belong', sub='One Source. Two Practices.',
      doors=[dict(world='salon', href='#pause', label='An Aveda Concept Salon', who='For guests', title='Salon OM',
                  text='Up to three unhurried hours of Aveda care, made around you.', go='Step inside'),
             dict(world='coaching', label='Coaching', who='For clients', title='Inner Work with Maggie',
                  text='Room to grow and reconnect with your inner wisdom, at your pace.', go='Enter')])),
    # HOOK → UNDERSTANDING. One gentle question that names what guests carry.
    ('tease', dict(id='pause', label='A gentle question', accents=['care'],
      text='When did someone last take care of you, without rushing you or needing anything back?',
      after='At Salon OM, that is the whole point of your visit.', after_at='3.6s')),
    # HOOK (meaning). The locked OM line.
    ('tease', dict(id='om', label='OM · Unity', dark=True, accents=['everything.', 'one.', 'all.'],
      text='OM is the first sound, the breath of everything. Earth, water, fire, air, and space, held as one. And you are part of it all.')),
    # ESTABLISH AUTHORITY. Moved up from after the rituals: trust before features (Maggie's step 03).
    ('team', dict(id='hosts', layout='letter', eyebrow='Founder, stylist, and guide', title='28 years in the chair.',
      note='This is your space. Talk, laugh, or simply rest. For as long as you are here, I am holding it for you.', sign='Maggie',
      intro='Maggie Woodward is the founder of Salon OM and of Inner Work with Maggie. [Her training and origin story, in her words, from the copy interview.]',
      people=[dict(name='Maggie Woodward', img='portrait-maggie.webp', alt='Placeholder portrait of Maggie, smiling in the salon', role='Founder · stylist and guide', desc='Founder of Salon OM and Inner Work with Maggie. Stylist and guide.'),
              dict(name='Katie Paonessa', role='Stylist', desc='A full part of Salon OM. [Her page and services to come.]', img=None),
              dict(name='Chesney', role='Salon Concierge', desc='Holds every detail, so you receive Maggie’s full attention.', img=None)])),
    # STORYTELLING. Five moments, each answering one quiet worry with warmth (Maggie's step 04).
    # Moment 01 is ROOTED (J, 19 Oct 16:39): hair roots, rooted in yourself, in nature, in care kind to the earth.
    # Ayurveda is NOT claimed: not found on aveda.com (19 Oct). Add it only with a source.
    ('ch', dict(id='arrive', chapter=0, sound='earth', film='earth', acc='earth', num='01', of='/ 05', name='Arrive', sub='The consultation', title='Rooted',
      body='Beautiful hair begins at the root, and so do you. Over tea, we talk about your hair, your life, and how you would like to feel.',
      specs=[(SPECS[0], 'Consultation over tea'), (SPECS[1], 'Plant-based Aveda care'), (SPECS[2], 'Grounded')])),
    ('ch', dict(id='unwind', chapter=1, sound='water', film='water', acc='water', num='02', of='/ 05', name='Unwind', sub='The rituals', title='Release',
      body='Choose your scent on an Aveda aroma journey, then settle into a slow scalp and shoulder ritual. Tension you may not know you carry often begins to let go.',
      specs=[(SPECS[0], 'Aroma journey'), (SPECS[1], 'Scalp & shoulder ritual'), (SPECS[2], 'Lighter')])),
    ('ch', dict(id='renew', chapter=2, sound='fire', film='fire', acc='fire', num='03', of='/ 05', name='Renew', sub='Cut & color', title='Transform',
      body='A cut and color made for you alone, with plant-powered Aveda color and 100% vegan formulas. Beauty that is kind to you, and to the earth.',
      specs=[(SPECS[0], 'Bespoke cut & color'), (SPECS[1], 'Plant-based, vegan'), (SPECS[2], 'Radiant')])),
    ('ch', dict(id='unhurried', chapter=3, sound='air', film='air', acc='air', num='04', of='/ 05', name='Unhurried', sub='Your time', title='Breathe',
      body='Your visit may last up to three hours, because real care takes its time. Talk, laugh, or rest in silence. This time is yours.',
      specs=[(SPECS[0], 'One to three hours'), (SPECS[1], 'Your pace, your needs'), (SPECS[2], 'At ease')])),
    ('ch', dict(id='whole', chapter=4, sound='ether', film='ether', acc='ether', num='05', of='/ 05', name='Leave whole', sub='The finish', title='Glow',
      body='Finished by hand, with simple rituals to carry the feeling into your week. Guests often leave lighter in spirit, and it shows.',
      specs=[(SPECS[0], 'Finish & styling tips'), (SPECS[1], 'Aftercare ritual'), (SPECS[2], 'Cared for')])),
    # FEATURES AND BENEFITS (why us). The locked signature line meets Aveda's founding idea.
    ('facts', dict(id='aveda', eyebrow='Why Aveda', title='Beauty from the inside out.',
      paras=['Salon OM is an Aveda Concept Salon. Aveda was founded in 1978 by Horst Rechelbacher to create holistic beauty through wellness. Its name means “knowledge of the whole,” which is what OM means to us.',
             'Guests often come for the scents, the rituals, and the results, and stay for what Aveda stands for.'],
      quote='Care for the world we live in.', cite='Aveda’s mission',
      facts=[('100%', 'vegan formulas', True), ('1st', 'beauty company to manufacture with 100% wind power (2007)'), ('B Corp', 'certified for people and planet (2023)'), ('1978', 'the year plant-based, holistic beauty began', True)],
      src='Facts from aveda.com. Aveda is a trademark of Aveda Corporation.')),
    # FEATURES AND BENEFITS (the offer). Salon rituals, clearly laid out (Maggie's step 05).
    ('offers', dict(id='time', layout='menu', eyebrow='Salon rituals', title='Choose your visit.',
      intro='Every visit begins with tea and a conversation. [Services, times, and prices to confirm.]',
      tiles=[dict(img='scalp-ritual.webp', alt='A scalp massage at a stone wash basin in a sunlit salon', tag='Up to 3 hours', title='The Sanctuary', text='Consultation, aroma journey, scalp and shoulder ritual, cut and color, and a slow finish.', btns=btn('Book', '#begin', 'sm') + btn('Learn more', '#arrive', 'ghost btn--sm')),
             dict(img='styling.webp', alt='Hands cutting long hair in a calm, plant-filled salon', tag='90 minutes', title='Cut & Ritual', text='A bespoke cut, with the aroma journey and a scalp ritual.', btns=btn('Book', '#begin', 'sm') + btn('Learn more', '#renew', 'ghost btn--sm')),
             dict(img='colour.webp', alt='A stone bowl of plant-based hair color with a brush and herbs', tag='2 to 3 hours', title='Color Ritual', text='Plant-powered Aveda color, with hand and scalp rituals while it develops.', btns=btn('Book', '#begin', 'sm') + btn('Learn more', '#renew', 'ghost btn--sm'))])),
    # FEATURES AND BENEFITS (the second practice). Moved before the voices, so both doors sit in the offer.
    ('bridge', dict(id='deeper', img='meadow.webp', eyebrow='One Source. Two Practices.', title='Some things go deeper than hair.',
      text='Inner Work with Maggie is coaching for anyone, guest or not: room to grow, reconnect with yourself, and move forward with clarity.',
      btn=btn('Enter Inner Work', '#coaching', 'light', arrow=True, world='coaching'))),
    # SUMMARIZE (social proof). Maggie's chosen guest words, verbatim, initials only.
    ('voices', dict(id='kind', quotes=[('Seeing you is magic for my mind, body, and soul.', 'L.T.', 'Guest'),
                                       ('I come away feeling lighter in spirit and sporting a great haircut.', 'C.M.', 'Guest'),
                                       ('She truly makes your time with her your own.', 'G.A.', 'Guest'),
                                       ('Maggie is a great listener and skilled with unique hair and what I needed and wanted.', 'S.', 'Guest')])),
    # SUMMARIZE → CTA. One line recaps the visit, then one calm next step. "Begin." is locked.
    ('cta', dict(id='begin', film='hero', label='Your visit, made around you', title='Begin.',
      text='Tea, a real conversation, and up to three unhurried hours of care. [Booking link to confirm.]', btn=btn('Book your visit', '#letters', 'light', arrow=True))),
    ('end', dict(id='letters', title='Letters for the journey', tagline='Beauty from the inside out',
      explore=[('Maggie', 'hosts'), ('The visit', 'arrive'), ('Aveda', 'aveda'), ('Salon rituals', 'time')])),
  ],
  'coaching': [
    # HOOK. The practice's real name and the locked button.
    ('hero_words', dict(id='c-top', film='air', sound='air', next='c-pause', at='.5s', sub_at='1.4s', foot_at='1.7s', eyebrow='Inner Work with Maggie', title='Return to yourself.',
      sub='Coaching for anyone ready to grow, reconnect with their inner wisdom, and create a life that feels more aligned. In person or online.',
      ctas=btn('Book a Connection Call', '#c-begin', arrow=True) + btn('How it works', '#c-how', 'ghost'))),
    # UNDERSTANDING. Names what clients carry, without assuming their story.
    ('tease', dict(id='c-pause', sound='air', label='Perhaps this is you', accents=['within'],
      text='You may have carried a great deal, for a long time. What if the strength you are looking for already exists within you?')),
    # ESTABLISH AUTHORITY. Moved up from after the outcomes: clients choose the guide before the method.
    ('split', dict(id='c-maggie', sound='air', flip=True, img='salon-om-shoreline-walk.webp', alt='A woman walking the shoreline at golden hour, seen from behind', tag='Placeholder image',
      eyebrow='Your guide, Maggie Woodward', title='Rooted in lived experience.',
      lead='My work as a Coach is deeply rooted in my own life experience, personal growth, and the challenges I have walked through and overcome.',
      paras=['Through both hardship and healing, I have learned that transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage.',
             'Maggie brings 28 years of listening in the chair, [her coaching training, to confirm], and her own story to every conversation.'],
      btn=btn('Book a Connection Call', '#c-begin', arrow=True))),
    # STORYTELLING. What happens, met with warmth (the quiet worry: "what will it be like?").
    ('steps', dict(id='c-how', light=True, sound='air', eyebrow='How it works', title='Three gentle steps',
      steps=[('01', 'Listen', 'We begin with your story, at your pace, with room to be fully heard.'),
             ('02', 'Release', 'Together we name the beliefs that may be holding you back, and let them soften.'),
             ('03', 'Rise', 'Small, courageous steps, held with compassion, toward more Joy, peace, and purpose.')])),
    # FEATURES AND BENEFITS. What people often experience, never a promise.
    ('ch', dict(id='c-lighter', sound='water', film='water', acc='water', num='01', of='/ 03', name='What often changes', sub='Feeling', title='Lighter',
      body='Old weight, set down. Emotions given room to move, so they may clear.', specs=[('Focus', 'Release'), ('Often felt', 'Lighter')])),
    ('ch', dict(id='c-clear', sound='ether', film='ether', acc='ether', num='02', of='/ 03', name='What often changes', sub='Clarity', title='Clear',
      body='Room to hear your own inner wisdom again, and to trust what it says.', specs=[('Focus', 'Inner wisdom'), ('Often felt', 'At peace')])),
    ('ch', dict(id='c-brave', sound='air', film='meadow.webp', acc='earth', num='03', of='/ 03', name='What often changes', sub='Courage', title='Brave',
      body='Breaking free from limiting beliefs, and acting on what truly matters to you.', specs=[('Focus', 'Limiting beliefs'), ('Often felt', 'Empowered')])),
    # FEATURES AND BENEFITS (the offer). The Inner Work path, clearly laid out; the Connection Call is the way in.
    ('offers', dict(id='c-sessions', sound='air', eyebrow='The Inner Work path', title='Ways to work together',
      intro='Open to everyone, guest of Salon OM or not. Every path begins with a complimentary Connection Call. [Formats and prices to confirm.]',
      tiles=[dict(img='coaching-room.webp', alt='Two linen armchairs, tea and an open journal by a window', tag='60 minutes · in person', title='One-to-one', text='A private space to release limiting beliefs and reconnect with your inner wisdom.', btns=btn('Book', '#c-begin', 'sm') + btn('Learn more', '#c-how', 'ghost btn--sm')),
             dict(img='meadow.webp', alt='A woman standing in a misty meadow at dawn', tag='60 minutes · online', title='Online', text='The same care, wherever you are.', btns=btn('Book', '#c-begin', 'sm') + btn('Learn more', '#c-how', 'ghost btn--sm')),
             dict(img='salon-om-circle.webp', alt='Floor cushions in a circle around a candle', tag='Group · 6 weeks', title='Rise circle', text='Grow alongside others who are choosing Joy, peace, and purpose.', btns=btn('Join the waitlist', '#c-letters', 'sm') + btn('Learn more', '#c-how', 'ghost btn--sm'))])),
    # Client voices: hidden until real Inner Work words arrive ("Words from Inner Work clients are on their way").
    # Put back here, unchanged in form, with real quotes and initials only:
    # ('voices', dict(id='c-kind', sound='air', quotes=[('<quote>', '<initials>', 'Inner Work client')])),
    # FEATURES AND BENEFITS (the second practice). The other equal door.
    ('bridge', dict(id='c-salon', sound='air', img='scalp-ritual.webp', eyebrow='One Source. Two Practices.', title='Let yourself be cared for.',
      text='Salon OM is Maggie’s Aveda Concept Salon, where up to three unhurried hours of care are made around you.',
      btn=btn('Enter Salon OM', '#', 'light', arrow=True, world='salon'))),
    # SUMMARIZE → CTA. The three steps in one line, then the locked button and its locked line.
    ('cta', dict(id='c-begin', sound='air', film='air', label='A calm first step', title='Begin.',
      text='Listen, release, rise, at your own pace. Begin with your complimentary conversation.', btn=btn('Book a Connection Call', '#c-letters', 'light', arrow=True))),
    ('end', dict(id='c-letters', sound='air', title='Letters for the journey', tagline='Where Beauty and Inner Work Belong',
      explore=[('Maggie', 'c-maggie'), ('How it works', 'c-how'), ('Paths', 'c-sessions'), ('Connection Call', 'c-begin')])),
  ],
}
