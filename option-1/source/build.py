import json, os, re
ROOT = '/home/claude/ds/project/'
lg = json.load(open('/home/claude/logo/final2.json'))
src = open('/home/claude/ds/src/bundle.src.js').read()
src = (src.replace('__W__', str(lg['w'])).replace('__H__', str(lg['h']))
          .replace('__MASTER_D__', lg['full_d']).replace('__SMALL_D__', lg['small_d']))
# serve-safe: escape every non-ASCII character so the bundle reads the same under any charset
src = src.encode('ascii', 'backslashreplace').decode('ascii')
assert '</script' not in src.lower() and '<!--' not in src
open(ROOT + 'components/bundle.js', 'w').write(src)
css = open(ROOT + 'components/bundle.css').read()
css = css.replace('≥', '>=').replace('–', '-').replace('—', '-')
assert all(ord(c) < 128 for c in css), [c for c in css if ord(c) >= 128][:5]
open(ROOT + 'components/bundle.css', 'w').write(css)

def card(name, group, height, js, width=None, subtitle=None, root_cls='om-pv'):
    attrs = f'group="{group}" height={height}' + (f' width={width}' if width else '') + (f' subtitle="{subtitle}"' if subtitle else '')
    html = f'''<!-- @dsCard {attrs} -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>{name} - preview</title></head>
<body>
<div id="root" class="{root_cls}"></div>
<script>
  var S = window.SalonOM, h = React.createElement;
  function frame(label, w, el) {{ return h('div', {{ key: label }}, h('span', {{ className: 'om-pv-frame__label' }}, label), h('div', {{ className: 'om-pv-frame', style: {{ width: w }} }}, el)); }}
  function frames(make) {{
    return h('div', {{ className: 'om-pv-frames' }},
      frame('Desktop \\u2265 1024px', 1280, make('d')),
      h('div', {{ className: 'om-pv-frames__row' }}, frame('Tablet 640\\u20131023px', 820, make('t')), frame('Mobile < 640px', 390, make('m'))));
  }}
  ReactDOM.createRoot(document.getElementById('root')).render({js});
</script>
</body>
</html>
'''
    d = ROOT + f'components/{name}/'
    os.makedirs(d, exist_ok=True)
    open(d + 'preview.html', 'w').write(html)

NAV = "[{label:'Salon',href:'#salon'},{label:'Coaching',href:'#coaching'},{label:'About',href:'#about'},{label:'Journal',href:'#journal'},{label:'Contact',href:'#contact'}]"
F = 1330  # frames layout width

card('Logo', 'Brand', 340, """h('div', {className:'om-pv-row', style:{gap:56, alignItems:'flex-end'}},
    h('div', null, h(S.Logo, {size:300}), h('p', {className:'om-pv-frame__label', style:{marginTop:12}}, 'Master \\u00b7 240px and up')),
    h('div', null, h(S.Logo, {cut:'small', height:128}), h('p', {className:'om-pv-frame__label', style:{marginTop:12}}, 'Small cut \\u00b7 header 128px')),
    h('div', null, h(S.Logo, {cut:'small', height:84, tone:'ink'}), h('p', {className:'om-pv-frame__label', style:{marginTop:12}}, 'Small cut \\u00b7 ink 84px')),
    h('div', null, h('div', {style:{background:'var(--forest)', padding:28}}, h(S.Logo, {cut:'small', height:140, tone:'ivory'})), h('p', {className:'om-pv-frame__label', style:{marginTop:12}}, 'Ivory on forest')))""")

card('Button', 'Actions', 96, """h('div', {className:'om-pv-row'},
    h(S.Button, null, 'Book a session'),
    h(S.Button, {variant:'outline'}, 'Read my story'),
    h(S.Button, {variant:'text'}, 'Explore offerings'),
    h(S.Button, {size:'small'}, 'Book'))""")

card('Section', 'Layout', 420, """h('div', null,
    h(S.Section, {tone:'surface'}, h(S.SectionHeading, {eyebrow:'Section \\u00b7 surface', title:'Ivory carries most of the page', lead:'Sections alternate between surface and linen so the page breathes.'})),
    h(S.Section, {tone:'linen'}, h(S.SectionHeading, {eyebrow:'Section \\u00b7 linen', title:'Linen marks a change of subject'})))""", root_cls='')

card('SectionHeading', 'Content', 260, """h('div', {className:'om-pv-grid', style:{gap:48}},
    h(S.SectionHeading, {eyebrow:'Coaching', title:'Ways we can work together', lead:'Gentle, honest guidance for the season you are in.'}),
    h(S.SectionHeading, {eyebrow:'Philosophy', title:'Healing begins in stillness', size:'large', align:'center'}))""")

card('SiteHeader', 'Navigation', 980, """frames(function (k) {
    if (k === 'd') return h('div', null,
      h(S.SiteHeader, {links:""" + NAV + """, current:'#coaching', cta:{label:'Book', href:'#book'}}),
      h('div', {style:{height:24, background:'var(--surface-sunken)'}}),
      h(S.SiteHeader, {compact:true, links:""" + NAV + """, cta:{label:'Book', href:'#book'}}));
    return h(S.SiteHeader, {defaultOpen: k === 'm', links:""" + NAV + """, cta:{label:'Book', href:'#book'}});
  })""", width=F, root_cls='')

HERO = """h(S.Hero, {eyebrow:'Salon \\u00b7 Coaching', title:'Come home to yourself',
      lead:'Transformation is possible when we reconnect with ourselves with honesty, compassion and courage.',
      primary:{label:'Book a session', href:'#book'}, secondary:{label:'Read my story', href:'#about'},
      media: h(S.Shoreline, {still: k !== 'd'}), footnote: h(S.WaveSound)})"""
card('Hero', 'Sections', 2000, "frames(function (k) { return " + HERO + "; })", width=F, root_cls='')

card('ArchImage', 'Content', 360, """h('div', {className:'om-pv-row', style:{alignItems:'flex-end'}},
    h('div', {style:{width:200}}, h(S.ArchImage, {tone:'sand', label:'Sand'})),
    h('div', {style:{width:200}}, h(S.ArchImage, {tone:'stone', label:'Plaster'})),
    h('div', {style:{width:240}}, h(S.ArchImage, {tone:'linen', label:'Linen', shape:'square', ratio:'1 / 1'})))""")

card('Shoreline', 'Media', 520, """h('div', {style:{display:'grid', gap:16}},
    h('div', {style:{height:420}}, h(S.Shoreline)),
    h('div', {className:'om-pv-row'}, h(S.WaveSound)))""")

card('WaveSound', 'Media', 96, """h('div', {className:'om-pv-row'}, h(S.WaveSound))""")

OFFERS = """h('div', {className:'om-grid om-grid--3'},
      h(S.OfferingCard, {meta:'Coaching \\u00b7 60 min', title:'One-to-one coaching', description:'A private space to release limiting beliefs and reconnect with your inner wisdom.', price:'Price on request', href:'#', tone:'sand', imageLabel:'Sand'}),
      h(S.OfferingCard, {meta:'Salon \\u00b7 90 min', title:'The ritual', description:'Unhurried care for hair and spirit, in natural light and quiet.', price:'Price on request', href:'#', tone:'stone', imageLabel:'Plaster'}),
      h(S.OfferingCard, {meta:'Group \\u00b7 6 weeks', title:'Rise circle', description:'Grow alongside others choosing joy, peace and purpose.', href:'#', actionLabel:'Join the waitlist', tone:'sage', imageLabel:'Leaves'}))"""
card('OfferingCard', 'Content', 2100, "frames(function (k) { return h(S.Section, {tone:'surface'}, " + OFFERS + "); })", width=F, root_cls='')

card('Affirmation', 'Content', 860, """frames(function (k) { return h('div', {className:'om-section', style:{}}, h('div', {className:'om-row'},
    h(S.Affirmation, {text:'Feel it to heal it.', tone:'sand'}),
    h(S.Affirmation, {text:'Soft & strong.', tone:'linen'}),
    h(S.Affirmation, {text:'You are allowed to begin again.', attribution:'Salon OM', tone:'sage'}))); })""", width=F, root_cls='')

card('Testimonial', 'Content', 340, """h(S.Testimonial, {quote:'I came in carrying years of doubt. I left believing in myself again, and that has changed everything.', name:'Client name', detail:'One-to-one coaching'})""")

ABOUT = """h(S.Section, {tone:'surface'}, h(S.AboutStory, {eyebrow:'My story', title:'Rooted in lived experience', imageTone:'stone', imageLabel:'Portrait', paragraphs:[
      'My work as a coach is deeply rooted in my own life experience, personal growth, and the challenges I have walked through and overcome.',
      'Through both hardship and healing, I have learned that transformation is possible when we are willing to reconnect with ourselves with honesty, compassion, and courage.'],
    signature:'With love', action:{label:'Work with me', href:'#coaching'}}))"""
card('AboutStory', 'Sections', 2000, "frames(function (k) { return " + ABOUT + "; })", width=F, root_cls='')

STEPS = """h(S.Section, {tone:'surface'}, h(S.JourneySteps, {steps:[
    {title:'Reconnect', text:'Return to yourself with honesty and compassion.'},
    {title:'Release', text:'Break free from the limiting beliefs you have outgrown.'},
    {title:'Grow', text:'Discover the strength that already lives within you.'},
    {title:'Thrive', text:'Create a life that feels aligned, empowered and authentic.'}]}))"""
card('JourneySteps', 'Content', 1100, "frames(function (k) { return " + STEPS + "; })", width=F, root_cls='')

card('MoodStrip', 'Brand', 420, """h(S.MoodStrip, {height:240})""")

CTA = """h(S.CTABand, {eyebrow:'Begin', title:'Ready to choose growth?', text:'Book a first conversation. No pressure, just presence.', action:{label:'Book a session', href:'#book'}})"""
card('CTABand', 'Sections', 1500, "frames(function (k) { return " + CTA + "; })", width=F, root_cls='')

card('TextField', 'Forms', 330, """h('div', {className:'om-pv-grid'},
    h(S.TextField, {label:'Your name', placeholder:'First name', hint:'So I know what to call you.'}),
    h(S.TextField, {label:'Email', type:'email', defaultValue:'maya@', error:'Please enter an email address like name@example.com.'}),
    h(S.TextField, {label:'What brings you here?', multiline:true}))""")

NEWS = """h(S.Section, {tone:'linen'}, h(S.NewsletterForm, {fieldId:'nl-'+k, eyebrow:'Letters', title:'Letters for the journey', text:'Occasional notes on healing, growth and coming home to yourself.'}))"""
card('NewsletterForm', 'Forms', 1100, "frames(function (k) { return " + NEWS + "; })", width=F, root_cls='')

card('FAQ', 'Content', 380, """h(S.FAQ, {openFirst:true, items:[
    {q:'Do I need to know what I want to work on?', a:'Not at all. Many people arrive with a feeling rather than a plan. We begin there, together.'},
    {q:'Are sessions in person or online?', a:'Placeholder answer. Confirm session formats and location before launch.'},
    {q:'How do I book?', a:'Placeholder answer. Connect to the chosen booking tool.'}]})""")

FOOT = """h(S.SiteFooter, {tagline:'Heal, grow and transform, gently.', note:'Made with care.', columns:[
    {title:'Explore', links:[{label:'Salon', href:'#salon'},{label:'Coaching', href:'#coaching'},{label:'About', href:'#about'},{label:'Journal', href:'#journal'}]},
    {title:'Visit', links:[{label:'Address to confirm'},{label:'Opening hours to confirm'}]},
    {title:'Connect', links:[{label:'Instagram', href:'#'},{label:'Pinterest', href:'#'},{label:'Contact', href:'#contact'}]}]})"""
card('SiteFooter', 'Navigation', 1500, "frames(function (k) { return " + FOOT + "; })", width=F, root_cls='')
print('ok')
