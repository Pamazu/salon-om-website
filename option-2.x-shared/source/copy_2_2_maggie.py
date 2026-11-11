"""Maggie's approved words, word for word, from her two decks of 2 Nov 2026 (resources/maggie/):
salon-om-website-copy-progress-update-2026-11.pdf (SO) and inner-work-progress-update-2026-11.pdf (IW).
Owned by Design Business Copywriter 1 (task febe2c3a); the three copy versions (copy_2_2_m / _g / _s) compose from it.
Her rules: no em dashes, exclamation points or semicolons; Becoming, Journey and Grow capitalised; keep the ® marks;
guests at the salon, clients in Inner Work; testimonials initials only. Never edit a line here without her deck."""

# ---- the first screen, locked (SO p.3)
FIRST = dict(name='Maggie Woodward', tagline='Where Beauty and Inner Work Belong', pair='One Source. Two Practices.',
             doors=('Salon OM', 'Inner Work with Maggie'), close='Change begins with you.')
OPENING = 'Beauty from the inside out.'          # SO p.4, the salon page's opening key line

# ---- the pause (SO p.5)
PAUSE = dict(text='Take a breath. When did you last give yourself time to be cared for?', after='You deserve this moment.')

# ---- OM · Oneness (SO p.4)
OM = 'All that was, is, and will be. OM.'
OM_LINE = 'The first sound, the breath of everything.'   # her direction deck, Oct 2026 ("OUR OM LINE"), reference/salon-om-copy-direction-2026-10.pdf

# ---- the visit, in five steps (SO p.6): (rail name, step name, line, what happens, feel)
VISIT_LINE = 'Welcome. Release. Transform. Breathe. Shine.'
STEPS = [
  ('Arrive', '01 · Arrive', 'Welcome', 'Comforting Tea, coffee, matcha or MUD\\WTR, and a real conversation.', 'Welcomed'),
  ('Unwind', '02 · Unwind', 'Release', 'A sensory experience and scalp ritual with Stress-Fix oil.', 'Lighter'),
  ('Renew', '03 · Renew', 'Transform', 'Cut, color, blonding or extensions, designed for you alone.', 'Radiant'),
  ('Unhurried', '04 · Unhurried', 'Breathe', 'Time shaped around you and the service you choose.', 'Free'),
  ('Carry it home', '05 · Carry it home', 'Shine', 'We teach you to recreate your style at home.', 'Confident'),
]

# ---- Why Aveda (SO p.4)
AVEDA = 'Beauty that is kind to you and to the earth.'

# ---- the team (SO p.7)
TEAM_LINE = 'Maggie, Katie and Chesney'
TEAM = [
  dict(name='Maggie Woodward', role='Founder and Stylist',
       desc='Maggie created Salon OM as a place to be seen, heard and cared for. It begins with your hair and often becomes something more. You are held in OM.'),
  dict(name='Katie Paonessa', role='Stylist',
       desc='A Central Coast native with over 14 years of experience in lived-in color, low-maintenance blonding, precision cutting and luxury extensions.'),
  dict(name='Chesney Missamore', role='Salon Concierge',
       desc='Welcomes you with your favorite drink and a warm smile. She is beginning cosmetology training and will soon join us as a Salon OM stylist.'),
]

# ---- services made around you (SO p.8): (service, triplet, pricing)
MENU_LINE = 'Services made around you.'
SERVICES = [
  ('Signature Color', 'Rich. Dimensional. You.', 'Root Refresh $110 · Full $135 · Gloss $125'),
  ('Blonding', 'Bright. Seamless. Effortless.', 'Partial $175 · Full $250 · Balayage $280+'),
  ('Color Correction', 'Transform with Confidence.', '$150 per hour'),
  ('Cut and Style', 'Polished. Modern. You.', 'Haircut $105 · Blowout $75'),
  ('Luxury Extensions', 'Length. Volume. Freedom.', 'Tape $195+ · Hidden Bead $300+ · Move-Up $150+/row'),
  ('Finishing Touches', 'Refined. Effortless. You.', 'Brow Wax $30'),
]

# ---- voices (SO p.4 key line; the four guest quotes Maggie chose earlier, initials only)
VOICES_LINE = 'Lighter, inside and out.'
QUOTES = [('Seeing you is magic for my mind, body, and soul.', 'L.T.', 'Guest'),
          ('I come away feeling lighter in spirit and sporting a great haircut.', 'C.M.', 'Guest'),
          ('She truly makes your time with her your own.', 'G.A.', 'Guest'),
          ('Maggie is a great listener and skilled with unique hair and what I needed and wanted.', 'S.', 'Guest')]

# ---- the second door, on the Salon OM page (IW p.10)
DOOR = dict(title='What could change for you?',
            paras=['Sometimes the change you’re looking for goes deeper than your hair. In Inner Work with Maggie, I am your guide to a deeper knowing of yourself, uncovering the patterns and beliefs that may be holding you back, so you can step into your fullest potential with clarity, confidence and calm.',
                   'Our journey begins with a complimentary Connection Call, a simple conversation to explore what you’re looking for.',
                   'Change begins with you.'],
            btns=('Explore Inner Work', 'Book a Connection Call'))

# ---- begin (SO p.4)
BEGIN = 'Your moment awaits.'

# ================================================================ Inner Work with Maggie (IW)
IW_TITLE = 'Inner Work with Maggie Woodward'
IW_OPEN = dict(title='Explore who you are Becoming.', sub='For the part of you ready to grow.',
               line='Coaching and hypnotherapy for lasting, identity-level change.',
               btns=('Book a Connection Call', 'Discover the Journey'), note='Begin with your complimentary conversation.')

DEEPER = dict(title='Look a little deeper.', lead='Sometimes what feels like today’s challenge has deeper roots.',
  paras=['The beliefs that guide our choices are formed all along the way: in childhood, in relationships, through loss, success and life’s turning points. Some still serve us. Others were simply the best we knew how, given our age, environment and circumstances at the time.',
         'In Inner Work, we gently revisit the moments that shaped you and draw out the wisdom they hold, reviewing them rather than reliving them. As we do, the emotional charge they once carried has the opportunity to soften. You can witness the past from a gentle distance, with compassion and understanding, and step into the present with a new sense of freedom.',
         'From there, new ways of thinking can take root. Each time you choose a new thought or response, you begin creating a new pathway, and with every repetition, it grows clearer and easier to follow. Neuroscientist Donald Hebb described this process, often summarized as neurons that fire together, wire together. What once took courage now begins to feel natural, and with each step, you grow into the person you are Becoming.'],
  close='You get to choose again.')

HOW = dict(eyebrow='How we work together', title='Grounded in research. Space to Grow.',
  paras=['Your courage to reach out is where it all begins. Our evidence-informed work draws on coaching, hypnotherapy, Rapid Transformational Therapy®, somatic practices, IFS-informed parts work and neuroscience. Together, we explore how your thoughts, emotions, beliefs and past experiences may shape the way you see yourself and move through life. Every part of you is welcome here, met with curiosity and compassion, so new understanding and new choices can emerge.',
         'This is identity-level work. It reaches beyond surface change to the core of who you are and how you meet the world. As you discover your own agency over your patterns and habits, the insights and tools you gain become yours to keep, so you move forward feeling empowered, with change designed to last.'],
  practices=[('Coaching', 'gives you clear goals, practical tools and support to put new insights into action.'),
             ('Hypnotherapy', 'guides you into a deeply relaxed, focused state, where new thoughts and habits can take root more easily.'),
             ('Rapid Transformational Therapy® (RTT®)', 'uses hypnosis to reach the subconscious mind, where many patterns and beliefs are formed, and helps you understand and reframe them.'),
             ('Somatic practices', 'help you notice where emotions live in the body and build a greater sense of calm and steadiness.'),
             ('IFS-informed parts work', 'helps you get to know the different parts of yourself with kindness and understanding.'),
             ('Neuroscience', 'explains how the brain forms habits and creates new pathways, so the changes you make can last.')],
  cred_line='I am certified through The School of Rapid Transformational Therapy®, with ongoing study through The Embody Lab and the IFS Institute, and nearly three decades of listening to people’s stories.',
  close='Knowing yourself is where Becoming begins.')

CREDENTIALS = ['Certified Rapid Transformational Coach, including ICF-approved coach training, The School of Rapid Transformational Therapy®',
               'Certified Hypnotherapist, The School of Rapid Transformational Therapy®',
               'Certified in Rapid Transformational Therapy® (RTT®)',
               'Somatic EMDR Therapy Certificate, The Embody Lab',
               'IFS-informed, with ongoing study through the IFS Institute',
               'Ongoing education as a member of The Embody Lab, with live trainings led by licensed therapists and PhDs, and the study of neuroscience and human behavior']
CRED_SHORT = 'Certified Rapid Transformational Coach. Certified RTT Hypnotherapist. IFS-informed and somatic practitioner.'

# the client path: decided; its wording is still to write (Maggie and Sage)
PATH = [('Step 1', 'Connection Call', 'Complimentary. Maggie learns your goals and needs, and together you see if she is the right fit.'),
        ('Step 2', 'One session', 'Available for a focused need.'),
        ('Step 3', 'Three sessions', 'Recommended to begin, so a real shift has room to unfold.'),
        ('Step 4', 'Becoming', 'A 12-Week Journey of Inner Knowing, for deeper belief patterns.')]
PRICING = 'Investment is shared during your Connection Call, where together we’ll find the path that fits you.'
CTA_IW = 'Book a Connection Call'

FOOT_IW = ['Inner Work with Maggie', 'Begin with a complimentary Connection Call',
           '<a href="mailto:connect@maggiewoodward.com">connect@maggiewoodward.com</a>']
DISCLAIMER = 'Inner Work with Maggie Woodward offers coaching and hypnotherapy for personal growth. It is not medical or psychological treatment and is not a substitute for care from a licensed healthcare professional.'

# still to come (Maggie and Sage): shown as visible placeholders, never invented
TO_COME = dict(path_title='[The path heading, still to write]', voices='[Client words, initials only, still being gathered]',
               closing='[The closing invitation, still to write]')
