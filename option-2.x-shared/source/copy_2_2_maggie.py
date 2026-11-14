"""Maggie's approved words, word for word. The SALON page is her own "Salon OM Website Copy" document of 11 Nov 2026
(brain: build-salon-om-website/reference/maggie-website-copy-2026-11-11.md, her claude.ai artifact JHNyrgmBCzpv7uGeiHpzf8):
"Every line below is approved copy ... ready to go onto the website exactly as written ... Please check with Maggie before
changing any wording to fit the design." The INNER WORK page is still her deck of 2 Nov (resources/maggie/
inner-work-progress-update-2026-11.pdf, IW). Owned by Design Business Copywriter 1 (tasks febe2c3a, c446e8ba); M, G and
S compose from it. Her writing rules: no em dashes, exclamation points or semicolons; salon visitors are guests, people
in Inner Work are clients; the first coaching step is always the Connection Call, never a free or discovery call;
testimonials show initials only; Becoming, Journey and Grow capitalised; keep the ® marks. Never edit a line here
without her document."""

# ---- the first screen, two equal doors (her doc, "The first screen")
FIRST = dict(name='Maggie Woodward', tagline='Where Beauty and Inner Work Belong', pair='One Source. Two Practices.',
             doors=('Salon OM', 'Inner Work with Maggie'), close='Change begins with you.')
FIRST_AVEDA = 'An Aveda Concept Salon'   # "Also on the first screen and in the page title", so Aveda searchers know they are right

# ---- the Salon OM opening screen (her doc)
SALON_OPEN = dict(eyebrow='Salon OM · An Aveda Concept Salon', title='Beauty from the inside out.',
                  lines=['Leave held, seen and beautifully cared for.',
                         'An Avila Beach salon where artistry is mastered and time is yours.'],
                  btns=('Book your visit', 'Step inside'))
OPENING = SALON_OPEN['title']

# ---- the pause (her doc)
PAUSE = dict(text='Take a breath. When did you last give yourself time to be cared for?', after='You deserve this moment.')

# ---- OM · Oneness: the quiet version on the Salon OM page, the full one for the Meet Maggie page (her doc)
OM_QUIET = ['A sacred sound and a gift for all, whatever your path or belief.',
            'Like a pebble in a pond, its ripples reach outward, lifting the spirit of all.',
            'Simply by being here, you are part of the kindness.']
OM_FULL = ['OM is the sacred sound, honored across centuries as the sound of all that is.',
           'I named my salon OM as a gift to the world, for every person, whatever their path or belief.',
           'Like a pebble in a pond, each OM sends ripples outward, spreading peace and goodwill to all.',
           'Whether you walk through our door or simply pass by and see Salon OM, you receive this gift, and with each breath, the ripple continues.',
           'All that was, is, and will be. OM.']
OM = ' '.join(OM_QUIET)                    # the quiet version, one paragraph, for the Salon OM page
OM_LINE = OM_QUIET[2]                      # its own closing line

# ---- the visit, in five steps (her doc): (rail name, label, heading word, description, feel) + three details each
VISIT_LINE = 'Welcome. Release. Transform. Breathe. Shine.'
STEPS = [
  ('Arrive', '01 · Arrive · The welcome', 'Welcome',
   'Choose your comfort: Aveda Comforting Tea, coffee, matcha or MUD\\WTR, with a little something to snack on. Then we begin with a real conversation about your hair, your life, and how you want to feel when you leave.', 'Welcomed'),
  ('Unwind', '02 · Unwind · The ritual', 'Release',
   'Every visit begins with a sensory experience. Then, during your scalp and shoulder ritual with Aveda Stress-Fix Composition Oil, the tension you’ve been carrying begins to soften.', 'Lighter'),
  ('Renew', '03 · Renew · Your service', 'Transform',
   'Cut, color, blonding or extensions, each service is designed for you alone. From the precision of a wet cut to the finesse of a dry cut, we work with your hair’s natural movement and plant-powered Aveda color for results that are healthy, dimensional and beautifully you.', 'Radiant'),
  ('Unhurried', '04 · Unhurried · Your time', 'Breathe',
   'Your visit is made around you and the service you choose. Laugh, cry, talk or rest in silence. This is your space.', 'Free'),
  ('Carry it home', '05 · Carry it home · The finish', 'Shine',
   'Before you leave, we show you how to recreate your style at home, so the confidence you feel today stays with you long after your visit. Every head of hair is unique, and we take time to learn the nuances of yours. We teach you, you teach us, and together we bring out its best.', 'Confident'),
]
STEP_DETAILS = [   # (her label, her value), three per step, in her order
  [('What happens', 'Personal consultation'), ('Included', 'Your drink and snack of choice'), ('You’ll feel', 'Welcomed')],
  [('What happens', 'Sensory experience'), ('Included', 'Scalp and shoulder ritual'), ('You’ll feel', 'Lighter')],
  [('What happens', 'Your personalized service'), ('Included', 'Plant-powered Aveda color'), ('You’ll feel', 'Radiant')],
  [('What happens', 'Time shaped around you'), ('Included', 'Your pace, your needs'), ('You’ll feel', 'Free')],
  [('What happens', 'Your styling lesson'), ('Included', 'At-home styling tips'), ('You’ll feel', 'Confident')],
]

# ---- Why Aveda (her doc): heading, her quote, four facts she checked ("Please keep 'at its primary facility'")
AVEDA_EYEBROW = 'Why Aveda'
AVEDA = 'Beauty that is kind to you and to the earth.'
AVEDA_QUOTE = ('For nearly three decades, I have worked exclusively with Aveda. I believe in the integrity they pour into every '
               'product, their mission to care for the world we live in, and their partnerships with the communities who grow and '
               'harvest their ingredients. At Salon OM, we carry that same care to every guest and to the world we share.')
AVEDA_CITE = 'Maggie'
AVEDA_FACTS = [('100%', 'vegan formulas'),
               ('1st', 'beauty company to manufacture with 100% wind power at its primary facility (2007)'),
               ('B Corp', 'certified for people and planet (2023)'),
               ('1978', 'the year holistic beauty through wellness began')]

# ---- Meet the Team (her doc): three cards; Maggie's name opens Meet Maggie, Katie's her own page
TEAM_LINE = 'Maggie, Katie and Chesney'
TEAM = [
  dict(name='Maggie Woodward', role='Founder and Stylist',
       desc='Maggie created Salon OM as a place to be seen, heard and cared for. It begins with your hair and often becomes something more. You are held in OM.'),
  dict(name='Katie Paonessa', role='Stylist',
       desc='A Central Coast native with over 14 years of experience, Katie specializes in lived-in color, low-maintenance blonding, precision cutting and luxury extensions. She creates hair that feels luxurious, natural and effortlessly you.'),
  dict(name='Chesney Missamore', role='Salon Concierge',
       desc='Chesney welcomes you with your favorite drink and a warm smile, and takes care of every detail, so your time in the chair is yours alone. She is beginning her cosmetology training and will soon join our team as a Salon OM stylist.'),
]
KATIE_PAGE = dict(title='Meet Katie Paonessa', paras=[
  'With over 14 years in the beauty industry, Katie is a Central Coast native and passionate stylist who creates personalized hair that helps her guests feel confident and effortlessly themselves.',
  'She specializes in lived-in color, low-maintenance blonding, precision cutting and luxury hair extensions. Katie believes great hair should complement your lifestyle as beautifully as it frames your face. Certified in multiple extension methods, she takes pride in helping each guest find the right method for their hair type and goals, for results that look seamless and feel natural.',
  'Katie’s approach blends technical expertise with a love for detail, creating dimensional color and extensions that feel both luxurious and true to you. She values genuine relationships with her guests and an experience where every person feels comfortable, heard and cared for.',
  'Away from the chair, Katie enjoys staying active, spending time at the beach, getting creative and making memories with her loved ones.',
  'Katie looks forward to welcoming you to Salon OM and creating hair that feels like you at your most confident.'])

# ---- the service menu (her doc): (service, triplet line, prices in USD)
MENU_EYEBROW = 'Your time'
MENU_LINE = 'Services made around you.'
MENU_INTRO = 'Every service begins with a personal consultation, so your time is shaped around your hair, your goals and your life.'
SERVICES = [
  ('Signature Color', 'Rich. Dimensional. You.', 'Root Refresh 110 · Full Color 135 · Signature Gloss 125'),
  ('Blonding', 'Bright. Seamless. Effortless.', 'Partial 175 · Full 250 · Signature Balayage 280+'),
  ('Color Correction', 'Transform with Confidence.', '150 per hour · Begins with a personal consultation'),
  ('Cut and Style', 'Polished. Modern. You.', 'Signature Haircut 105 · Luxury Blowout 75'),
  ('Luxury Extensions', 'Length. Volume. Freedom.', 'Tape Install 195+ · Hidden Bead 300+ · Maintenance or Move-Up 150+ per row'),
  ('Finishing Touches', 'Refined. Effortless. You.', 'Brow Wax 30'),
]
MENU_NOTE = 'A “+” means the service starts at that price. Extension hair is quoted separately during your consultation.'
MENU_BENEATH = ('She truly makes your time with her your own.', 'G.A.', 'guest of Maggie')

# ---- voices (her doc): initials only, always; Katie's guests to be woven in, marked "guest of Katie"
VOICES_EYEBROW = 'Words from our guests'
VOICES_LINE = 'Lighter, inside and out.'
QUOTES = [('Always brings joy to my day. Friendly and expert cosmetologists.', 'T.C.', 'guest of Salon OM'),
          ('Seeing you is magic for my mind, body, and soul.', 'L.T.', 'guest of Maggie'),
          ('I come away feeling lighter in spirit and sporting a great haircut.', 'C.M.', 'guest of Maggie'),
          ('I leave feeling beautiful on the inside and out.', 'A.G.', 'guest of Maggie'),
          ('Maggie is a great listener and skilled with unique hair and what I needed and wanted. Best cut and color I have had in decades.', 'S.', 'guest of Maggie'),
          ('There is nobody like Maggie. She listens, she loves and is as passionate at helping you look and feel the way that makes you your best.', 'G.A.', 'guest of Maggie'),
          ('Maggie is a gifted artist and a complete joy to spend time with.', 'K.S.', 'guest of Maggie'),
          ('She has many years of experience and is amazing with color. I would not go to anyone else.', 'N.W.', 'guest of Maggie')]

# ---- the second door, on the Salon OM page (her doc: "clarity, calm and confidence", in that order)
DOOR = dict(eyebrow='The second door', title='What could change for you?',
            paras=['Sometimes the change you’re looking for goes deeper than your hair. In Inner Work with Maggie, I am your guide to a deeper knowing of yourself, uncovering the patterns and beliefs that may be holding you back, so you can step into your fullest potential with clarity, calm and confidence.',
                   'Our journey begins with a complimentary Connection Call, a simple conversation to explore what you’re looking for.',
                   'Change begins with you.'],
            btns=('Explore Inner Work', 'Book a Connection Call'))

# ---- Begin, the last moment of the Salon OM page ("Begin." stays the last word)
BEGIN = 'Your moment awaits.'
BEGIN_TEXT = ('Call or email to book your visit, and we’ll take care of the rest, from your first sip of tea to your final style. '
              'If we’re with a guest when you call, we’ll return your call personally.')
BEGIN_LAST = 'Begin.'
BEGIN_BTNS = (('Call the salon', 'tel:+18056271550'), ('Email us', 'mailto:contact@salonomavilabeach.com'))

# ---- the footer, at the bottom of every page (her doc; Instagram left out until posting resumes)
FOOTER = dict(name='Maggie Woodward', tagline='Beauty from the inside out.', salon='Salon OM · An Aveda Concept Salon',
              address='56 Landing Passage, Avila Beach, CA 93424', hours='By appointment · Monday to Friday, 9 to 5',
              hours_note='As our hours vary with each day’s guests, please call ahead before visiting.',
              phone='805-627-1550', email='contact@salonomavilabeach.com',
              iw=['Inner Work with Maggie', 'Begin with a complimentary Connection Call', 'connect@maggiewoodward.com'],
              copyright='© 2026 Maggie Woodward')

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
