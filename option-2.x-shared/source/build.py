"""Salon OM, Option 2.x: three variations (2.2, 2.3, 2.4) of the salon site, each with a parallel
coaching world. Shared engine (Option 2 base.css + add.css + engine.js); copy and structure per variation."""
import json, re, os, html, sys
V = os.path.dirname(os.path.abspath(__file__)) + '/'          # option-2.x-shared/source/
REPO = os.path.abspath(V + '../..') + '/'
sys.modules.setdefault('build', sys.modules[__name__])       # copy_*.py does `from build import btn`
# logo paths, recovered byte-exact from the published pages (the original generator lived outside this repo)
L = json.load(open(V + 'logo.json'))
BASE_CSS = open(V + 'base.css').read()
ADD_CSS = open(V + 'add.css').read()
JS = open(V + 'engine.js').read()
TW_JS = open(V + 'tweaks.js').read()
TW_CSS = open(V + 'tweaks.css').read()
E = html.escape

def svg(key):
    return f'<svg viewBox="{L[key]["vb"]}" aria-hidden="true" focusable="false"><path fill="currentColor" d="{L[key]["d"]}"/></svg>'
P = L['stacked_parts']
HERO_SVG = f'<svg viewBox="{P["vb"]}" aria-hidden="true" focusable="false"><path class="mk-salon" d="{P["salon"]}"/><path class="mk-om" pathLength="1" d="{P["om"]}"/></svg>'

SOUND_CTA = '<button class="sound-cta sound-btn is-sound" type="button" aria-pressed="true"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span><span class="sound-label">Sound on</span></button>'
def btn(label, href='#', kind='', arrow=False, world=None):
    cls = 'btn' + (f' btn--{kind}' if kind else '')
    a = f' data-to-world="{world}"' if world else ''
    return f'<a class="{cls}" href="{href}"{a}>{E(label)}' + (' <span class="arr" aria-hidden="true">→</span>' if arrow else '') + '</a>'
def film(name, lazy=False):
    if name.endswith('.webp'):
        return f'<div class="s__media"><div class="s__zoom"><img src="img/{name}" alt="" decoding="async"></div></div>'
    return (f'<div class="s__media"><div class="s__zoom"><img src="media/{name}-poster.webp" alt="" decoding="async">'
            f'<video data-src="media/{name}.mp4" muted playsinline loop preload="none" aria-hidden="true"></video></div></div>')

# ---------------------------------------------------------------- slide renderers
def hero_mark(d):
    return f'''<section class="s hero" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-label="Salon OM">
    {film(d['film'])}
    <div class="s__scrim hero__scrim"></div>
    <div class="s__leave hero__lv">
      <h1 class="hero__mark"><span class="sr">Salon OM</span>{HERO_SVG}<span class="hero__hook intro" style="--d:2.3s">{d['hook']}</span></h1>
      <div class="hero__foot">
        <p class="hero__line intro" style="--d:2.6s"><b>{d['eyebrow']}</b>{d['line']}<br>{SOUND_CTA}</p>
        <div class="hero__cta intro" style="--d:2.8s">{d['ctas']}</div>
        <a class="hero__cue label intro" style="--d:3s" href="#{d['next']}"><i aria-hidden="true"></i>Scroll</a>
      </div>
    </div>
    <div class="hero__veil"></div><div class="s__shade"></div>
  </section>'''

def hero_words(d):
    stop = f' data-stop="{d["stop"]}"' if d.get('stop') else ''
    vid = film(d['film']).replace('<video ', f'<video{stop} ', 1)
    return f'''<section class="s hero hero--words" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-h">
    {vid}
    <div class="s__scrim hero__scrim"></div>
    <div class="s__leave hero__lv">
      <div class="hero__words">
        <p class="eyebrow intro" style="--d:.6s">{d['eyebrow']}</p>
        <h1 id="{d['id']}-h" data-write="words" style="--wd-at:{d.get('at','1.1s')};--wd-gap:{d.get('gap','260ms')}">{d['title']}</h1>
        <p class="sub intro" style="--d:{d.get('sub_at','2.2s')}">{d['sub']}</p>
      </div>
      <div class="hero__foot">
        <p class="hero__line intro" style="--d:{d.get('foot_at','2.5s')}">{SOUND_CTA}</p>
        <div class="hero__cta intro" style="--d:{d.get('foot_at','2.5s')}">{d['ctas']}</div>
        <a class="hero__cue label intro" style="--d:{d.get('foot_at','2.5s')}" href="#{d['next']}"><i aria-hidden="true"></i>Scroll</a>
      </div>
    </div>
    <div class="hero__veil"></div><div class="s__shade"></div>
  </section>'''

def hero_arch(d):
    return f'''<section class="s hero--arch" id="{d['id']}" data-tone="light" data-sound="{d.get('sound','air')}" aria-labelledby="{d['id']}-h">
    <div class="s__leave hero__copy">
      <p class="eyebrow a-left" style="--d:.3s">{d['eyebrow']}</p>
      <h1 id="{d['id']}-h"><span class="mask"><span class="mask__in" style="--d:.5s">{d['title']}</span></span></h1>
      <p class="sub a-up" style="--d:1s">{d['sub']}</p>
      <div class="hero__cta a-up" style="--d:1.2s;justify-content:flex-start">{d['ctas']}</div>
      <p class="a-up" style="--d:1.4s">{SOUND_CTA}</p>
    </div>
    <div class="arch ph"><img src="img/{d['img']}" alt="{E(d['alt'])}" decoding="async"></div>
    <div class="s__shade"></div>
  </section>'''

def tease(d):
    ring = '<div class="mani__ring" aria-hidden="true"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="49.5" pathLength="1"/><circle cx="50" cy="50" r="43" pathLength="1"/></svg></div>'
    after = f'<p class="lead a-up" style="--d:{d.get("after_at","4.6s")};margin-top:clamp(20px,3.5vh,40px);color:var(--ink-soft)">{d["after"]}</p>' if d.get('after') else ''
    return f'''<section class="s mani{' dark' if d.get('dark') else ''}" id="{d['id']}" data-tone="{'dark' if d.get('dark') else d.get('tone','light')}" data-sound="{d.get('sound','bed')}" aria-label="{E(d['label'])}">
    {ring}
    <div class="s__leave mani__in">
      <p class="mani__label label a-left" style="--d:.1s">{d['label']}</p>
      <p class="mani__text" data-write="letters" data-accents="{'|'.join(d.get('accents',[]))}">{d['text']}</p>
      {after}
    </div>
    <div class="s__shade"></div>
  </section>'''

def chapter(d, i, n):
    specs = ''.join(f'<div class="a-up" style="--d:{0.95 + k * 0.12:.2f}s"><dt>{a}</dt><dd>{b}</dd></div>' for k, (a, b) in enumerate(d['specs']))
    cls = ' style="grid-template-columns:repeat(2,minmax(0,1fr))"' if len(d['specs']) == 2 else ''
    chap = f' data-chapter="{d["chapter"]}"' if 'chapter' in d else ''
    return f'''<section class="s ch" id="{d['id']}" data-tone="dark" data-sound="{d['sound']}"{chap} style="--acc: var(--{d['acc']})" aria-labelledby="{d['id']}-t">
    {film(d['film'])}
    <div class="s__scrim ch__scrim"></div><div class="s__veil"></div>
    <div class="s__leave ch__copy">
      <p class="ch__meta a-left" style="--d:.2s"><span class="ch__num">{d['num']}<small>{d['of']}</small></span><span class="label"><b>{d['name']}</b>{(' · ' + d['sub']) if d.get('sub') else ''}</span></p>
      <h2 class="ch__title" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.35s">{d['title']}<em>.</em></span></span></h2>
      <div class="ch__side">
        <p class="ch__body a-up" style="--d:.75s">{d['body']}</p>
        <dl class="ch__specs"{cls}>{specs}</dl>
      </div>
    </div>
    <div class="s__shade"></div>
  </section>'''

def split(d):
    cls = 's split' + (' flip' if d.get('flip') else '') + (' dark' if d.get('dark') else '')
    paras = ''.join(f'<p class="a-right{" more" if k else ""}" style="--d:{1.0 + k * .12:.2f}s">{p}</p>' for k, p in enumerate(d.get('paras', [])))
    ticks = ('<ul class="ticks a-right" style="--d:1.2s">' + ''.join(f'<li>{t}</li>' for t in d['ticks']) + '</ul>') if d.get('ticks') else ''
    b = f'<div class="a-right" style="--d:1.35s">{d["btn"]}</div>' if d.get('btn') else ''
    tag = f'<span class="tag label">{d["tag"]}</span>' if d.get('tag') else ''
    return f'''<section class="{cls}" id="{d['id']}" data-tone="{'dark' if d.get('dark') else 'light'}" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="ph"><img src="img/{d['img']}" alt="{E(d['alt'])}" decoding="async">{tag}</div>
    <div class="split__copy s__leave">
      <p class="eyebrow a-right" style="--d:.5s">{d['eyebrow']}</p>
      <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.6s">{d['title']}</span></span></h2>
      <p class="lead a-right" style="--d:.85s">{d['lead']}</p>
      {paras}{ticks}{b}
    </div>
    <div class="s__shade"></div>
  </section>'''

def facts(d):
    def fact(f, k):
        num, label = f[0], f[1]
        countable = len(f) > 2 and f[2]
        m = re.match(r'^(\d+)(.*)$', num)
        inner = f'<span data-count="{m.group(1)}">0</span>{m.group(2)}' if (m and countable) else num
        return f'<div class="fact a-up" style="--d:{0.7 + k * .14:.2f}s"><b>{inner}</b><span>{label}</span></div>'
    paras = ''.join(f'<p class="a-up{" more" if k else ""}" style="--d:{0.6 + k * .12:.2f}s">{p}</p>' for k, p in enumerate(d['paras']))
    q = f'<blockquote class="a-up" style="--d:.95s">“{d["quote"]}”<cite>{d["cite"]}</cite></blockquote>' if d.get('quote') else ''
    return f'''<section class="s facts{' light' if d.get('light') else ''}" id="{d['id']}" data-tone="{'light' if d.get('light') else 'dark'}" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="facts__in s__leave">
      <div>
        <p class="eyebrow a-left" style="--d:.15s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.3s">{d['title']}</span></span></h2>
        {paras}{q}
      </div>
      <div>
        <div class="facts__grid">{''.join(fact(f, k) for k, f in enumerate(d['facts']))}</div>
        <small class="src a-fade" style="--d:1.5s">{d['src']}</small>
      </div>
    </div>
    <div class="s__shade"></div>
  </section>'''

def team(d):
    if d.get('layout') in TEAM_LAYOUTS: return TEAM_LAYOUTS[d['layout']](d)
    people = ''.join(f'''<article class="person a-up" style="--d:{0.6 + k * .18:.2f}s"><div class="portrait" style="--d:{0.4 + k * .18:.2f}s"><i aria-hidden="true">{p['initial']}</i><span class="tag label">Portrait to come</span></div>
        <div><h3>{p['name']}</h3><p class="role label">{p['role']}</p><p class="desc">{p['desc']}</p></div></article>''' for k, p in enumerate(d['people']))
    return f'''<section class="s team" id="{d['id']}" data-tone="light" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="team__head s__leave">
      <div><p class="eyebrow a-left" style="--d:.1s">{d['eyebrow']}</p><h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.25s">{d['title']}</span></span></h2></div>
      <p class="a-up" style="--d:.55s">{d['intro']}</p>
    </div>
    <div class="team__grid">{people}</div>
    <div class="s__shade"></div>
  </section>'''

def steps(d):
    row = ''.join(f'<div class="step a-up" style="--d:{0.55 + k * .16:.2f}s"><b>{s[0]}</b><h3>{s[1]}</h3><p>{s[2]}</p></div>' for k, s in enumerate(d['steps']))
    return f'''<section class="s steps{' light' if d.get('light') else ''}" id="{d['id']}" data-tone="{'light' if d.get('light') else 'dark'}" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="steps__head s__leave"><p class="eyebrow a-left" style="--d:.1s">{d['eyebrow']}</p><h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.25s">{d['title']}</span></span></h2></div>
    <div class="steps__row" style="--n:{len(d['steps'])}">{row}</div>
    <div class="s__shade"></div>
  </section>'''

def offers(d):
    if d.get('layout') in OFFER_LAYOUTS: return OFFER_LAYOUTS[d['layout']](d)
    tiles = ''.join(f'''<article class="tile" style="--d:{0.35 + k * .15:.2f}s">
        <img src="img/{t['img']}" alt="{E(t['alt'])}" decoding="async">
        <div class="tile__in"><p class="tile__tag label">{t['tag']}</p><h3>{t['title']}</h3><p>{t['text']}</p>
        <div class="tile__btns">{t['btns']}</div></div></article>''' for k, t in enumerate(d['tiles']))
    return f'''<section class="s offers" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="s__leave offers__head">
      <div><p class="label a-left" style="--d:.1s">{d['eyebrow']}</p><h2 id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.2s">{d['title']}</span></span></h2></div>
      <p class="a-up" style="--d:.5s">{d['intro']}</p>
    </div>
    <div class="tiles">{tiles}</div>
    <p class="tiles__hint label a-fade" style="--d:1s">Swipe to see all three</p>
    <div class="s__shade"></div>
  </section>'''

# ---------------------------------------------------------------- hosts, one layout per variation
PH_TAG = '<span class="tag label">Placeholder portrait</span>'
def head(d, cls, intro_cls, d0=.15):
    return (f'<p class="eyebrow a-left" style="--d:{d0:.2f}s">{d["eyebrow"]}</p>'
            f'<h2 class="mid" id="{d["id"]}-t"><span class="mask"><span class="mask__in" style="--d:{d0 + .15:.2f}s">{d["title"]}</span></span></h2>'
            + (f'<p class="{intro_cls} tx a-up" style="--d:{d0 + .45:.2f}s">{d["intro"]}</p>' if d.get('intro') else ''))

def team_letter(d):
    """2.2: a tall portrait of Maggie beside a short letter from her, with her support person signed in below."""
    m, w = d['people']
    return f'''<section class="s team-letter" id="{d['id']}" data-tone="light" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <figure class="tl__ph"><img src="img/{m['img']}" alt="{E(m['alt'])}" decoding="async">{PH_TAG}</figure>
    <div class="tl__copy s__leave">
      {head(d, 'tl', 'tl__intro', .35)}
      <blockquote class="tl__note a-up" style="--d:1.05s"><span class="tx">“{d['note']}”</span><cite class="tx">{d['sign']}</cite></blockquote>
      <div class="tl__with a-up" style="--d:1.35s">
        <img class="tl__avatar" src="img/{w['img']}" alt="{E(w['alt'])}" decoding="async">
        <div><p class="label">With</p><h3>{w['name']}</h3><p class="tl__role tx">{w['role']}</p><p class="tl__desc tx">{w['desc']}</p></div>
      </div>
    </div>
    <div class="s__shade"></div>
  </section>'''

def team_arches(d):
    """2.3: two arched doorways that open on the hosts, Maggie tall, her support person beside her."""
    m, w = d['people']
    def fig(p, cls, delay):
        return (f'<figure class="ta__p {cls}"><div class="ta__arch" style="--d:{delay:.2f}s"><img src="img/{p["img"]}" alt="{E(p["alt"])}" decoding="async"></div>'
                f'<figcaption class="a-up" style="--d:{delay + .9:.2f}s"><h3>{p["name"]}</h3><p class="label tx">{p["role"]}</p></figcaption></figure>')
    return f'''<section class="s team-arches" id="{d['id']}" data-tone="light" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="ta__copy s__leave">
      {head(d, 'ta', 'ta__intro', .15)}
      <p class="ta__desc tx a-up" style="--d:.8s">{m['desc']}</p>
      <p class="ta__tag label a-fade" style="--d:1.6s">Placeholder portraits</p>
    </div>
    {fig(m, 'ta__p--main', .35)}
    {fig(w, 'ta__p--with', .7)}
    <div class="s__shade"></div>
  </section>'''

def team_cinema(d):
    """2.4: Maggie full screen, in the light of the window; her support person signed in below the words."""
    m, w = d['people']
    return f'''<section class="s team-cinema" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="s__media"><div class="s__zoom"><img src="img/{d['img']}" alt="{E(d['alt'])}" decoding="async"></div></div>
    <div class="tc__scrim"></div>
    <span class="tc__tag label a-fade" style="--d:1.6s">Placeholder portraits</span>
    <div class="tc__copy s__leave">
      {head(d, 'tc', 'tc__intro', .5)}
      <p class="tc__who a-up" style="--d:1.15s"><b>{m['name']}</b><span class="label tx">{m['role']}</span></p>
      <div class="tc__card a-up" style="--d:1.4s">
        <img src="img/{w['img']}" alt="{E(w['alt'])}" decoding="async">
        <div><p class="label">With</p><h3>{w['name']}</h3><p class="tc__role tx">{w['role']}</p><p class="tc__desc tx">{w['desc']}</p></div>
      </div>
    </div>
    <div class="s__shade"></div>
  </section>'''

TEAM_LAYOUTS = {'letter': team_letter, 'arches': team_arches, 'cinema': team_cinema}

# ---------------------------------------------------------------- rituals, one layout per variation
def offers_menu(d):
    """2.2: a quiet menu. One ritual opens at a time and the photo beside it changes with it."""
    rows = ''.join(f'''<li class="om__row a-up{' is-on' if k == 0 else ''}" style="--d:{0.65 + k * .14:.2f}s" data-i="{k}" tabindex="0">
          <p class="om__dur label"><span class="tx">{t['tag']}</span><small class="tx">{t.get('price', 'Price to confirm')}</small></p>
          <h3>{t['title']}</h3><span class="om__arr" aria-hidden="true">→</span>
          <div class="om__more"><div><p class="tx">{t['text']}</p><div class="om__btns">{t['btns']}</div></div></div>
        </li>''' for k, t in enumerate(d['tiles']))
    ims = ''.join(f'<img src="img/{t["img"]}" alt="{E(t["alt"])}" decoding="async" data-i="{k}"{" class=" + chr(34) + "is-on" + chr(34) if k == 0 else ""}>' for k, t in enumerate(d['tiles']))
    return f'''<section class="s offers-menu" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" data-menu aria-labelledby="{d['id']}-t">
    <div class="om__head s__leave">
      <p class="label a-left" style="--d:.1s">{d['eyebrow']}</p>
      <h2 id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.2s">{d['title']}</span></span></h2>
      <p class="om__intro tx a-up" style="--d:.5s">{d['intro']}</p>
    </div>
    <ol class="om__list">{rows}</ol>
    <div class="om__ph">{ims}</div>
    <div class="s__shade"></div>
  </section>'''

def offers_hours(d):
    """2.3: the visit measured in time. Each ritual is a bar on a three-hour line that fills as you arrive."""
    marks = ''.join(f'<span style="--x:{x}">{t}</span>' for x, t in [(0, '0'), (1/3, '1 h'), (2/3, '2 h'), (1, '3 h')])
    tiles = sorted(d['tiles'], key=lambda t: t['mins'])
    rows = ''.join(f'''<li class="oh__row a-up" style="--d:{0.7 + k * .16:.2f}s;--w:{t['mins'] / 180:.3f}">
          <div class="oh__bar" aria-hidden="true"><i style="--d:{1.0 + k * .22:.2f}s"></i></div>
          <div class="oh__name"><h3>{t['title']}</h3><span class="label tx">{t['tag']}</span></div>
          <p class="tx">{t['text']}</p>
          <div class="oh__btns">{t['btns']}</div>
        </li>''' for k, t in enumerate(tiles))
    return f'''<section class="s offers-hours" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <figure class="oh__ph"><img src="img/{d['img']}" alt="{E(d['alt'])}" decoding="async"></figure>
    <div class="oh__main s__leave">
      <p class="label a-left" style="--d:.1s">{d['eyebrow']}</p>
      <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.2s">{d['title']}</span></span></h2>
      <p class="oh__intro tx a-up" style="--d:.5s">{d['intro']}</p>
      <div class="oh__scale label a-fade" style="--d:.8s" aria-hidden="true">{marks}</div>
      <ol class="oh__rows">{rows}</ol>
    </div>
    <div class="s__shade"></div>
  </section>'''

def offers_feature(d):
    """2.4: the signature ritual large, the two shorter rituals stacked beside it."""
    def tile(t, k):
        cls = 'of__main' if k == 0 else 'of__side'
        badge = f'<span class="of__badge label">{d.get("badge", "Signature")}</span>' if k == 0 else ''
        return f'''<article class="tile {cls}" style="--d:{0.35 + k * .18:.2f}s">
        <img src="img/{t['img']}" alt="{E(t['alt'])}" decoding="async">
        <div class="tile__in">{badge}<p class="tile__tag label">{t['tag']}</p><h3>{t['title']}</h3><p>{t['text']}</p>
        <div class="tile__btns">{t['btns']}</div></div></article>'''
    return f'''<section class="s offers offers-feature" id="{d['id']}" data-tone="light" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="s__leave offers__head">
      <div><p class="label a-left" style="--d:.1s">{d['eyebrow']}</p><h2 id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.2s">{d['title']}</span></span></h2></div>
      <p class="a-up" style="--d:.5s">{d['intro']}</p>
    </div>
    <div class="of__grid">{''.join(tile(t, k) for k, t in enumerate(d['tiles']))}</div>
    <div class="s__shade"></div>
  </section>'''

OFFER_LAYOUTS = {'menu': offers_menu, 'hours': offers_hours, 'feature': offers_feature}

def voices(d):
    qs = ''.join(f'<figure class="q"><blockquote>{q[0]}</blockquote><figcaption><b>{q[1]}</b>{q[2]}</figcaption></figure>' for q in d['quotes'])
    return f'''<section class="s voices" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-label="Kind words">
    <div class="voices__aura" aria-hidden="true"></div>
    <div class="s__leave">
      <span class="voices__mark a-fade" style="--d:.1s" aria-hidden="true">“</span>
      <div class="qs a-up" style="--d:.4s" data-quotes>{qs}</div>
    </div>
    <div class="s__shade"></div>
  </section>'''

def bridge(d):
    return f'''<section class="s bridge" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="ph-bg"><img src="img/{d['img']}" alt="" decoding="async"></div>
    <div class="bridge__scrim"></div>
    <div class="bridge__in s__leave">
      <p class="eyebrow a-up" style="--d:.2s">{d['eyebrow']}</p>
      <h2 class="big" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.35s">{d['title']}</span></span></h2>
      <p class="a-up" style="--d:.8s">{d['text']}</p>
      <div class="a-up" style="--d:1s">{d['btn']}</div>
    </div>
    <div class="s__shade"></div>
  </section>'''

def doors(d):
    def door(x, k):
        attrs = f' data-to-world="{x["world"]}"' if x.get('world') else ''
        return f'''<a class="door a-up" style="--d:{0.3 + k * .2:.2f}s" href="{x.get('href','#')}"{attrs}><img src="img/{x['img']}" alt="" decoding="async">
        <p class="eyebrow">{x['eyebrow']}</p><h3>{x['title']}</h3><p>{x['text']}</p><span class="go">{x['go']} →</span></a>'''
    return f'''<section class="s doors" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-label="{E(d['label'])}">
    {''.join(door(x, k) for k, x in enumerate(d['doors']))}
    <div class="s__shade"></div>
  </section>'''

def walkin(d):
    return f'''<section class="s walkin" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    <div class="ph-bg"><img src="img/{d['img']}" alt="{E(d['alt'])}" decoding="async"></div>
    <div class="walkin__scrim"></div>
    <div class="walkin__in s__leave">
      <p class="eyebrow a-left" style="--d:.4s">{d['eyebrow']}</p>
      <h2 class="big" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.6s">{d['title']}</span></span></h2>
      <p class="a-up" style="--d:1.2s">{d['text']}</p>
    </div>
    <div class="s__shade"></div>
  </section>'''

def cta(d):
    return f'''<section class="s cta" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound','bed')}" aria-labelledby="{d['id']}-t">
    {film(d['film'])}
    <div class="s__scrim cta__scrim"></div><div class="s__veil"></div>
    <div class="cta__in s__leave">
      <p class="label a-up" style="--d:.2s">{d['label']}</p>
      <h2 id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.35s">{d['title']}</span></span></h2>
      <p class="a-up" style="--d:.8s">{d['text']}</p>
      <div class="a-up" style="--d:1s">{d['btn']}</div>
    </div>
    <div class="s__shade"></div>
  </section>'''

def end(d, world):
    expl = ''.join(f'<li><a href="#{h}">{t}</a></li>' for t, h in d['explore'])
    return f'''<section class="s s--auto end" data-tone="light" data-sound="{d.get('sound','bed')}" aria-label="Letters and contact">
    <div class="letters" id="{d['id']}">
      <div class="letters__in">
        <div><p class="label a-left" style="--d:.1s">Letters</p><h2><span class="mask"><span class="mask__in" style="--d:.2s">{d['title']}</span></span></h2></div>
        <form class="a-up" style="--d:.5s" data-letters novalidate>
          <div class="field"><label for="{d['id']}-email">Email address</label><input id="{d['id']}-email" name="email" type="email" autocomplete="email" placeholder="you@example.com"></div>
          <button class="btn btn--ink" type="submit">Subscribe</button>
          <p class="letters__msg" role="status"></p>
        </form>
      </div>
    </div>
    <footer class="foot">
      <div class="foot__in">
        <div class="foot__brand a-up" style="--d:.6s">{svg('stacked')}<p>{d['tagline']}</p></div>
        <div class="a-up" style="--d:.7s"><h3 class="label">Explore</h3><ul>{expl}</ul></div>
        <div class="a-up" style="--d:.8s"><h3 class="label">Visit</h3><ul><li>Address to confirm</li><li>Opening hours to confirm</li><li>Salon in person · coaching in person and online</li></ul></div>
        <div class="a-up" style="--d:.9s"><h3 class="label">Connect</h3><ul><li>Instagram (link to come)</li><li>Email (to confirm)</li><li><a href="#" data-to-world="{'coaching' if world == 'salon' else 'salon'}">{'Coaching with Maggie' if world == 'salon' else 'The salon'}</a></li></ul></div>
      </div>
      <div class="foot__base"><span>© 2026 Salon OM · an Aveda concept salon · {d['draft']}</span><span>Aveda is a trademark of Aveda Corporation. Films and photos generated with Magnific as placeholders.</span></div>
    </footer>
  </section>'''

R = {'hero_mark': hero_mark, 'hero_words': hero_words, 'hero_arch': hero_arch, 'tease': tease, 'split': split, 'facts': facts, 'team': team,
     'steps': steps, 'offers': offers, 'voices': voices, 'bridge': bridge, 'doors': doors, 'walkin': walkin, 'cta': cta}

def render_world(world, slides, draft):
    out, chs = [], [s for s in slides if s[0] == 'ch']
    ci = 0
    for kind, d in slides:
        if kind == 'ch': out.append(chapter(d, ci, len(chs))); ci += 1
        elif kind == 'end': out.append(end(dict(d, draft=draft), world))
        else: out.append(R[kind](d))
    return '\n  '.join(out)

def page(cfg):
    worlds_btns = '<button type="button" data-to-world="salon" aria-pressed="true">Salon</button><button type="button" data-to-world="coaching" aria-pressed="false">Coaching</button><i class="worlds__pill" aria-hidden="true"></i>'
    menu_lists = ''.join(f'<ul data-world-list="{w}">' + ''.join(f'<li style="--i:{k}"><a href="#{h}"><small>{n}</small>{t}</a></li>' for k, (n, t, h) in enumerate(items)) + '</ul>' for w, items in cfg['menu'].items())
    rail = ''.join(f'<a href="#{h}"><span>{t}</span><b>0{k + 1}</b></a>' for k, (t, h) in enumerate(cfg['rail']))
    body = f'''<a class="skip" href="#main-salon">Skip to content</a>
<header class="hdr" id="hdr">
  <div class="hdr__in">
    <a class="hdr__logo" href="#" aria-label="Salon OM, back to the top" onclick="window.scrollTo({{top:0,behavior:'smooth'}});return false;">{svg('inline')}</a>
    <div class="hdr__mid"><div class="worlds" role="group" aria-label="Choose: salon or coaching">{worlds_btns}</div></div>
    <div class="hdr__end">
      <button class="hdr__icon sound-btn is-sound" type="button" aria-pressed="true" aria-label="Mute sound"><span class="bars" aria-hidden="true"><i></i><i></i><i></i></span></button>
      <button class="hdr__icon" id="films-toggle" type="button" aria-pressed="false" aria-label="Pause the films">
        <svg class="i-pause" viewBox="0 0 14 14" aria-hidden="true"><rect x="3" y="2" width="2" height="10" fill="currentColor"/><rect x="9" y="2" width="2" height="10" fill="currentColor"/></svg>
        <svg class="i-play" viewBox="0 0 14 14" aria-hidden="true"><path d="M4 2.2v9.6L11.6 7z" fill="currentColor"/></svg>
      </button>
      <a class="btn btn--sm hdr__book w-salon" href="#{cfg['book_salon']}">Book</a><a class="btn btn--sm hdr__book w-coaching" href="#{cfg['book_coaching']}">Free call</a>
      <button class="hdr__icon hdr__menu" type="button" aria-expanded="false" aria-controls="menu" aria-label="Open menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<div class="dock"><div class="worlds" role="group" aria-label="Choose: salon or coaching">{worlds_btns}</div></div>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu">
  <div><div class="menu__worlds"><button type="button" data-to-world="salon" aria-pressed="true">Salon</button><button type="button" data-to-world="coaching" aria-pressed="false">Coaching</button></div>{menu_lists}</div>
  <div class="menu__end"><a class="btn w-salon" href="#{cfg['book_salon']}">Book your time</a><a class="btn w-coaching" href="#{cfg['book_coaching']}">Book a free call</a></div>
</div>
<nav class="rail" id="rail" aria-label="The visit">{rail}</nav>
<div class="wveil" id="wveil" aria-hidden="true">{svg('om')}</div>
<main id="main-salon" data-world="salon">
  {render_world('salon', cfg['salon'], cfg['draft'])}
</main>
<main id="main-coaching" data-world="coaching" hidden>
  {render_world('coaching', cfg['coaching'], cfg['draft'])}
</main>
<script>
{TW_JS}</script>
<script>
{JS}</script>
'''
    css = BASE_CSS + '\n' + ADD_CSS + '\n' + TW_CSS
    title = f'<title>{cfg["title"]}</title>\n'
    art = title + '<style>\n' + css + '</style>\n' + body
    assert 'home' not in re.sub(r'<[^>]+>', ' ', body).lower().replace('homepage', ''), 'no "home" in copy'
    key = cfg['title'].split()[-1]
    doc = ('<!doctype html>\n<html lang="en" data-theme="' + cfg['theme'] + '" data-world="salon" data-variant="' + key + '">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + title +
           f'<meta name="description" content="{E(cfg["desc"])}">\n<meta name="theme-color" content="#15100C">\n'
           '<link rel="icon" type="image/svg+xml" href="brand/salon-om-om-small-forest.svg">\n'
           '<style>\n' + css + '</style>\n</head>\n<body>\n' + body + '</body>\n</html>\n')
    # the artifact page has no <html> of its own: set the theme from script before paint
    art = art.replace('<script>\n', f'<script>document.documentElement.setAttribute("data-theme","{cfg["theme"]}");document.documentElement.setAttribute("data-world","salon");document.documentElement.setAttribute("data-variant","{key}");</script>\n<script>\n', 1)
    return art, doc

if __name__ == '__main__':
    # python3 option-2.x-shared/source/build.py [2.2 2.3 2.4] [--check]
    #   writes option-<key>/site/index.html; --check only compares with the file on disk and writes nothing.
    # 2.3 and 2.4 are frozen at tag checkpoint-2026-10-19: build them only with --check.
    import importlib.util
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    check = '--check' in sys.argv
    bad = 0
    for key in args or ['2.2']:
        spec = importlib.util.spec_from_file_location('c', V + f'copy_{key.replace(".", "_")}.py'); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m)
        art, doc = page(m.CFG)
        out = REPO + f'option-{key}/site/index.html'
        if check:
            same = open(out).read() == doc
            bad += not same
            print(key, 'identical to', os.path.relpath(out, REPO) if same else 'DIFFERS from ' + os.path.relpath(out, REPO))
            continue
        open(out, 'w').write(doc)
        print(key, len(doc) // 1024, 'KB ->', os.path.relpath(out, REPO))
    sys.exit(1 if bad else 0)
