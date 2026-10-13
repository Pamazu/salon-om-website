"""Assemble the Salon OM homepage from the design system: tokens -> CSS (light + dark),
bundle.css, bundle.js and the page script. Output: /home/claude/site/salon-om.html"""
import json
P = '/home/claude/ds/project/'
t = json.load(open(P + 'tokens.json'))
first = t['color']['themes'][0]['id']

def theme_vars(theme):
    out = []
    for fam in ('color', 'shadow'):
        for tok in t[fam]['tokens']:
            v = tok['value']; v = v if isinstance(v, str) else v.get(theme, v[first])
            out.append(f"  --{tok['name']}: {v};")
    return '\n'.join(out)

static = []
for fam in ('spacing', 'radius', 'layout'):
    for tok in t[fam]['tokens']:
        static.append(f"  --{tok['name']}: {tok['value']};")
for k, v in t['type']['families'].items():
    static.append(f"  --font-{k}: {v};")

tokens_css = f""":root {{
  color-scheme: light;
{theme_vars('light')}
{chr(10).join(static)}
}}
@media (prefers-color-scheme: dark) {{
  :root:not([data-theme="light"]) {{
    color-scheme: dark;
{theme_vars('dark')}
  }}
}}
:root[data-theme="dark"] {{
  color-scheme: dark;
{theme_vars('dark')}
}}
"""

page_css = """
/* page: a sticky white header, full-bleed bands, a floating sound control */
html { scroll-padding-top: 132px; }
@media (prefers-reduced-motion: no-preference) { html { scroll-behavior: smooth; } }
body { background: var(--surface); color: var(--ink); overflow-x: hidden; }
.draft-note { margin: 0; padding: var(--space-2) var(--space-4); background: var(--surface-sunken); color: var(--ink-muted); font-size: 12px; letter-spacing: .08em; text-align: center; }
.page-header { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 30; }
.om-section__inner--bleed { padding-block: 0 !important; }
.sound-fab { position: fixed; right: max(16px, env(safe-area-inset-right, 0px)); bottom: calc(16px + env(safe-area-inset-bottom, 0px)); z-index: 40; opacity: 0; transform: translateY(8px); pointer-events: none; transition: opacity .35s ease, transform .35s ease; }
.sound-fab.is-shown { opacity: 1; transform: none; pointer-events: auto; }
.hero-note { margin: var(--space-3) 0 0; font-size: 13px; color: var(--ink-muted); max-width: 40ch; }
@media (prefers-reduced-motion: reduce) { .sound-fab { transition: none; } }
"""

bundle_css = open(P + 'components/bundle.css').read()
# drop the preview-only helpers from the page
bundle_css = bundle_css.split('/* preview helpers')[0]
bundle_js = open(P + 'components/bundle.js').read()

app_js = r"""
(function () {
  var S = window.SalonOM, h = React.createElement;
  var NAV = [
    { label: 'Offerings', href: '#offerings' },
    { label: 'Approach', href: '#approach' },
    { label: 'About', href: '#about' },
    { label: 'Letters', href: '#letters' },
    { label: 'Contact', href: '#contact' }
  ];

  function App() {
    var c = React.useState(false), compact = c[0], setCompact = c[1];
    var f = React.useState(false), fab = f[0], setFab = f[1];
    React.useEffect(function () {
      function onScroll() { var y = window.scrollY || 0; setCompact(y > 40); setFab(y > 760); }
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return function () { window.removeEventListener('scroll', onScroll); };
    }, []);

    return h(React.Fragment, null,
      h('p', { className: 'draft-note' }, 'Homepage draft · services, prices, testimonial and photos are placeholders'),
      h('div', { className: 'page-header' },
        h(S.SiteHeader, { links: NAV, compact: compact, homeHref: '#top', cta: { label: 'Book', href: '#book' } })),

      h('main', { id: 'top' },
        h(S.Hero, {
          eyebrow: 'Coaching · Healing · Growth',
          title: 'Come home to yourself',
          lead: 'Transformation is possible when we are willing to reconnect with ourselves with honesty, compassion and courage.',
          primary: { label: 'Book a session', href: '#book' },
          secondary: { label: 'Read my story', href: '#about' },
          media: h(S.Shoreline, { fallbackSrc: 'img/shore-still.webp', label: 'Gentle waves washing in and out over pale sand' }),
          footnote: h('div', null,
            h(S.WaveSound, null),
            h('p', { className: 'hero-note' }, 'Generated waves, ebbing and flowing in real time. Sound starts only when you choose.'))
        }),

        h(S.Section, { tone: 'surface', width: 'text', id: 'welcome' },
          h(S.SectionHeading, {
            align: 'center', size: 'large', eyebrow: 'Welcome',
            title: 'A place to heal, grow and transform',
            lead: 'Here you can slow down and meet yourself again. Together we loosen the beliefs that hold you back and make room for joy, peace and purpose.'
          })),

        h(S.Section, { tone: 'linen', id: 'offerings' },
          h('div', { className: 'om-stack' },
            h(S.SectionHeading, { eyebrow: 'Offerings', title: 'Ways we can work together', lead: 'Each offering moves at your pace, in a space that feels safe, warm and unhurried.' }),
            h('div', { className: 'om-grid om-grid--3' },
              h(S.OfferingCard, { eager: true, meta: 'Coaching · 60 min', title: 'One-to-one coaching', description: 'A private space to release limiting beliefs and reconnect with your inner wisdom.', price: 'Price on request', href: '#book', actionLabel: 'Ask about it', image: 'img/salon-om-coaching.webp', imageAlt: 'Two linen armchairs and cups of herbal tea in a sunlit room' }),
              h(S.OfferingCard, { eager: true, meta: 'Salon · 90 min', title: 'The ritual', description: 'Unhurried care for body and spirit, in natural light and quiet.', price: 'Price on request', href: '#book', actionLabel: 'Ask about it', image: 'img/salon-om-salon.webp', imageAlt: 'A calm salon with an arched mirror, a stone basin and dried pampas grass' }),
              h(S.OfferingCard, { eager: true, meta: 'Group · 6 weeks', title: 'Rise circle', description: 'Grow alongside others who are choosing joy, peace and purpose.', href: '#letters', actionLabel: 'Join the waitlist', image: 'img/salon-om-circle.webp', imageAlt: 'Linen floor cushions arranged in a circle around a lit candle' })))),

        h(S.Section, { tone: 'surface', flush: true, width: 'bleed', label: 'Affirmations' },
          h('div', { className: 'om-row' },
            h(S.Affirmation, { text: 'Feel it to heal it.', tone: 'sand', image: 'img/salon-om-sand.webp' }),
            h(S.Affirmation, { text: 'Soft & strong.', tone: 'linen', image: 'img/salon-om-linen.webp' }),
            h(S.Affirmation, { text: 'You are allowed to begin again.', tone: 'stone', image: 'img/salon-om-plaster-palm.webp' }))),

        h(S.Section, { tone: 'surface', id: 'about' },
          h(S.AboutStory, {
            eager: true, eyebrow: 'My story', title: 'Rooted in lived experience',
            image: 'img/salon-om-shoreline-walk.webp', imageAlt: 'A woman in a linen dress walking along the shoreline at golden hour, seen from behind',
            paragraphs: [
              'My work as a coach is deeply rooted in my own life experience, personal growth, and the challenges I have walked through and overcome.',
              'Through both hardship and healing, I have learned that transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage. I know firsthand what it means to navigate difficult seasons and still choose growth, joy, peace, and purpose on the other side.',
              'Because of this, I guide others not only through education and training, but through lived understanding, deep empathy, and a genuine desire to help people create meaningful and lasting change in their lives.'
            ],
            signature: 'With love', action: { label: 'Work with me', href: '#book' }
          })),

        h(S.Section, { tone: 'linen', id: 'approach' },
          h('div', { className: 'om-stack' },
            h(S.SectionHeading, { eyebrow: 'Approach', title: 'How the work unfolds', lead: 'Not simply surviving life’s challenges, but learning to thrive through them.' }),
            h(S.JourneySteps, { steps: [
              { title: 'Reconnect', text: 'Return to yourself with honesty and compassion.' },
              { title: 'Release', text: 'Break free from the limiting beliefs you have outgrown.' },
              { title: 'Grow', text: 'Discover the strength and potential already within you.' },
              { title: 'Thrive', text: 'Create a life that feels aligned, empowered and authentic.' }
            ] }))),

        h(S.Section, { tone: 'surface', width: 'text', label: 'Kind words' },
          h(S.Testimonial, { quote: 'I came in carrying years of doubt. I left believing in myself again, and that has changed everything.', name: 'Client name', detail: 'Sample testimonial, to be replaced' })),

        h('div', { id: 'book' },
          h(S.CTABand, { tone: 'sand', eyebrow: 'Begin', title: 'Ready to choose growth?', text: 'Online booking opens soon. Join the letters list below and you’ll be the first to know.', action: { label: 'Join the list', href: '#letters' } })),

        h(S.Section, { tone: 'surface', id: 'letters' },
          h(S.NewsletterForm, { fieldId: 'letters-email', eyebrow: 'Letters', title: 'Letters for the journey', text: 'Occasional notes on healing, growth and coming home to yourself.',
            onSubmit: function () { return new Promise(function (r) { setTimeout(r, 700); }); },
            doneText: '✓ Thank you. This is a preview, so nothing was sent yet.' }))),

      h('div', { id: 'contact' },
        h(S.SiteFooter, {
          tagline: 'Heal, grow and transform, gently.',
          note: 'Placeholder photos generated with Magnific (Nano Banana 2). The sea and its sound are generated live.',
          columns: [
            { title: 'Explore', links: [{ label: 'Offerings', href: '#offerings' }, { label: 'Approach', href: '#approach' }, { label: 'About', href: '#about' }, { label: 'Letters', href: '#letters' }] },
            { title: 'Visit', links: [{ label: 'Address to confirm' }, { label: 'Opening hours to confirm' }, { label: 'In person and online (to confirm)' }] },
            { title: 'Connect', links: [{ label: 'Instagram (link to come)' }, { label: 'Pinterest (link to come)' }, { label: 'Email (to confirm)' }] }
          ]
        })),

      h('div', { className: 'sound-fab' + (fab ? ' is-shown' : ''), 'aria-hidden': fab ? undefined : true },
        h(S.WaveSound, { compact: true }))
    );
  }

  ReactDOM.createRoot(document.getElementById('app')).render(h(App));
})();
"""

assert '</script' not in bundle_js.lower() and '</script' not in app_js.lower()
html = f"""<title>Salon OM</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Jost:wght@300;400;500&display=swap">
<style>
/* Salon OM homepage. Tokens come from the Salon OM design system (Daylight / Evening).
   Layout: a tall white header around the full logo, then alternating ivory and linen bands;
   neutrals carry ~85% of the page, sage/gold/forest are accents. */
{tokens_css}
{bundle_css}
{page_css}
</style>
<div id="app"></div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js"></script>
<script>
{bundle_js}
</script>
<script>
{app_js}
</script>
"""
open('/home/claude/site/salon-om.html', 'w').write(html)
print(len(html) // 1024, 'KB')
