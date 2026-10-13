import json, os, re
R = '/home/claude/ds2/project/'
L = json.load(open('/home/claude/logo/opt3.json'))
logo = {k: L[k] for k in ('stacked', 'inline', 'om', 'stacked_parts')}
src = open('/home/claude/ds2/src/bundle.src.js').read().replace('__LOGO__', json.dumps(logo))
src = src.encode('ascii', 'backslashreplace').decode()
assert '</script' not in src.lower() and '<!--' not in src
open(R + 'components/bundle.js', 'w').write(src)

# ---- bundle.css: the live page's stylesheet, fonts come from the tokens ----
page = open('/home/claude/opt2/site/page.src.html').read()
css = re.search(r'<style>\n([\s\S]*?)</style>', page).group(1)
css = re.sub(r'@font-face \{[^}]*\}\n', '', css)
css = css.replace('--serif: "Cormorant Garamond", "Cormorant", Garamond, "Times New Roman", serif;', '--serif: var(--font-serif, "Cormorant Garamond", Garamond, serif);')
css = css.replace('--sans: "Instrument Sans", "Helvetica Neue", Arial, sans-serif;', '--sans: var(--font-sans, "Instrument Sans", Arial, sans-serif);')
css += '''
/* ---------- design-system previews ---------- */
.hdr.ds-static { position: relative; animation: none; }
.ds-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; padding: 28px; }
.ds-pad { padding: 28px; }
.offers.ds-static { height: auto; min-height: 0; }
.om2-logo .mk-om, .om2-logo .mk-salon { animation-iteration-count: 1; }
'''
for a, b in [('—', '-'), ('–', '-'), ('→', '->'), ('≥', '>='), ('·', '.'), ('│', '|')]:
    css = css.replace(a, b)
assert all(ord(c) < 128 for c in css), [c for c in css if ord(c) >= 128][:5]
open(R + 'components/bundle.css', 'w').write(css)

B = {'p_hero': '8f0b80ce69e867a493163d3f75aadc77', 'p_earth': 'fb34c930afe41c4898eb0e0b0df3fc74', 'p_water': 'e29e31233cff2bf1433c585e78864659', 'p_fire': '3988ec404db571a8d9f20f0baaf3a3fd', 'p_air': 'abcf8754473038860b134242ea6eba90', 'p_ether': 'b69a0659aa945e3970fc6dde84008c28',
     'v_hero': 'cf0637c031e306378a719eef25490b77', 'v_earth': '2fdf683859b2da866c90f9538d934d5e', 'v_water': 'b7acc801eb41220adbafcd470f1ba98a', 'v_fire': '5dc6df5d2f431edeeb1649f2f985f67d', 'v_air': '61854850a3b465be51021189ae4291c1', 'v_ether': '2e0b0670b07b1c044b0b5ba4efdef135',
     'coach': 'faed6f4b356ec6f8d0f0cc19d33f26f8', 'salon': '719b094a585d3d6820a29cb5bfd26b60', 'circle': '3a5189a29ff9b8337c34fb7f9fe513e4', 'shore': 'b8dbb9e12d8b78a23ed61e48bcfc49a4'}
U = {k: '/_blob/' + v for k, v in B.items()}

def card(name, group, height, js, width=None, body_style=''):
    attrs = f'group="{group}" height={height}' + (f' width={width}' if width else '')
    html = f'''<!-- @dsCard {attrs} -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>{name} - preview</title></head>
<body style="margin:0;{body_style}">
<div id="root"></div>
<script>
  var S = window.SalonOM2, h = React.createElement;
  ReactDOM.createRoot(document.getElementById('root')).render({js});
</script>
</body>
</html>
'''
    os.makedirs(R + f'components/{name}', exist_ok=True); open(R + f'components/{name}/preview.html', 'w').write(html)

card('Logo', 'Brand', 400, """h('div', {style:{display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:12, padding:12, background:'var(--umber)'}},
  h('div', {style:{background:'linear-gradient(rgba(10,7,5,.35),rgba(10,7,5,.35)), url(%s) center/cover', color:'var(--ivory)', display:'flex', alignItems:'center', justifyContent:'center', minHeight:376}}, h(S.Logo, {variant:'stacked', width:340, draw:true})),
  h('div', {style:{display:'grid', gap:12}},
    h('div', {style:{background:'var(--clay)', color:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center'}}, h(S.Logo, {variant:'inline', height:38})),
    h('div', {style:{background:'var(--clay)', color:'var(--forest)', display:'flex', alignItems:'center', justifyContent:'center'}}, h(S.Logo, {variant:'stacked', width:210})),
    h('div', {style:{background:'var(--bark)', color:'var(--ivory)', display:'flex', alignItems:'center', justifyContent:'center', gap:40}}, h(S.Logo, {variant:'inline', height:26}), h(S.Logo, {variant:'om', height:40}))))""" % U['p_hero'])
card('Button', 'Actions', 190, """h('div', null,
  h('div', {className:'ds-row', style:{background:'linear-gradient(rgba(10,7,5,.45),rgba(10,7,5,.45)), url(%s) center/cover'}}, h(S.Button, {variant:'light', arrow:true}, 'Book a session'), h(S.Button, {variant:'ghost'}, 'Begin the journey'), h(S.Button, {size:'small'}, 'Book'), h(S.Button, {size:'small', variant:'ghost'}, 'Learn more')),
  h('div', {className:'ds-row', style:{background:'var(--clay)'}}, h(S.Button, {arrow:true}, 'Book a session'), h(S.Button, {variant:'ink'}, 'Subscribe'), h(S.Button, {variant:'line', arrow:true}, 'Work with me')))""" % U['p_hero'])
card('SiteHeader', 'Navigation', 200, """h('div', null,
  h('div', {style:{background:'linear-gradient(rgba(10,7,5,.4),rgba(10,7,5,0)), url(%s) center 30%%/cover', height:100}}, h(S.SiteHeader, {className:'ds-static', links:[{label:'Elements',href:'#'},{label:'Offerings',href:'#'},{label:'Story',href:'#'},{label:'Letters',href:'#'}], cta:{label:'Book', href:'#'}})),
  h('div', {style:{background:'var(--clay)', height:100}}, h(S.SiteHeader, {className:'ds-static', tone:'light', links:[{label:'Elements',href:'#'},{label:'Offerings',href:'#'},{label:'Story',href:'#'},{label:'Letters',href:'#'}], cta:{label:'Book', href:'#'}})))""" % U['p_hero'], width=1280)
card('Slide', 'Sections', 600, """h(S.Slide, {className:'cta', active:true, video:'%s', poster:'%s', scrim:'cta__scrim', label:'Begin'},
  h('div', {className:'cta__in s__leave'},
    h('p', {className:'label a-up', style:{'--d':'.2s'}}, 'Your first step'),
    h('h2', null, h('span', {className:'mask'}, h('span', {className:'mask__in', style:{'--d':'.35s'}}, 'Begin.'))),
    h('p', {className:'a-up', style:{'--d':'.8s'}}, 'Online booking opens soon. Join the letters list and you will be the first to know.'),
    h(S.Button, {variant:'light', arrow:true, href:'#', className:'a-up'}, 'Join the list')))""" % (U['v_hero'], U['p_hero']), width=1280)
card('Manifesto', 'Sections', 600, """h(S.Manifesto, {active:true, eyebrow:'OM \\u00b7 Unity', accents:['OM','everything.','one.','all.'], text:'OM is the first sound, the breath of everything. Earth, water, fire, air and space, held as one. And you are part of it all.'})""", width=1280)
card('ElementChapter', 'Sections', 720, """h(S.ElementChapter, {active:true, element:'earth', index:1, name:'Earth', sanskrit:'Prithvi', title:'Ground', video:'%s', poster:'%s', body:'We begin with your roots. Feeling safe, steady and supported gives change somewhere to stand.', specs:[{label:'Focus', value:'Safety & roots'},{label:'Practice', value:'Grounding breath'},{label:'You feel', value:'Steady'}]})""" % (U['v_earth'], U['p_earth']), width=1280)
card('OfferTile', 'Content', 600, """h('section', {className:'offers is-active ds-static', style:{padding:14}},
  h('div', {className:'tiles', style:{minHeight:572}},
  h(S.OfferTile, {image:'%s', alt:'Two linen armchairs and herbal tea in a sunlit room', tag:'Coaching \\u00b7 60 min', title:'One-to-one coaching', text:'A private space to release limiting beliefs and reconnect with your inner wisdom.', primary:{label:'Book', href:'#'}, secondary:{label:'Learn more', href:'#'}}),
  h(S.OfferTile, {image:'%s', alt:'A calm salon with an arched mirror', tag:'Salon \\u00b7 90 min', title:'The ritual', text:'Unhurried care for body and spirit, in natural light and quiet.', primary:{label:'Book', href:'#'}, secondary:{label:'Learn more', href:'#'}}),
  h(S.OfferTile, {image:'%s', alt:'Floor cushions in a circle around a candle', tag:'Group \\u00b7 6 weeks', title:'Rise circle', text:'Grow alongside others who are choosing joy, peace and purpose.', primary:{label:'Join the waitlist', href:'#'}, secondary:{label:'Learn more', href:'#'}})))""" % (U['coach'], U['salon'], U['circle']), width=1280)
card('Quote', 'Content', 520, """h(S.Quote, {active:true, text:'I came in carrying years of doubt. I left believing in myself again.', name:'Client name', note:'Sample testimonial, to be replaced'})""", width=1280)
json.dump(U, open('/home/claude/ds2/src/blobs.json', 'w'))
print('ok')
