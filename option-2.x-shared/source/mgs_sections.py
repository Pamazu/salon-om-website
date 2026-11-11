"""M/G/S sections of their own (round 3, task a2e5a9d0; references: record/salon-om-mgs-refs-round-3-2026-11-10).
Each function draws one section from the data mgs_parts.py gives it and is passed to build.render_world as the slide's
kind, so 2.2, 2.3 and 2.4 never see them. Layout only: every word arrives in d, from copy_2_2_maggie.py or a [draft]."""
import re
from build import E, svg, cycle


def _prices(s):
    """'Root Refresh $110 · Full $135' -> [('Root Refresh', '$110'), ('Full', '$135')]; '$150 per hour' -> [('', ...)]"""
    out = []
    for part in s.split(' · '):
        m = re.match(r'^(.*?)\s*(\$.*)$', part.strip())
        out.append((m.group(1), m.group(2)) if m else (part.strip(), ''))
    return out


def _photo(t, k):
    """the row's photo: a real photo of that service's result, or a quiet frame saying it is still to come"""
    on = ' is-on' if k == 0 else ''
    if t.get('img'):
        pos = f' style="object-position:{t["pos"]}"' if t.get('pos') else ''
        return f'<img class="mn__img{on}" src="img/{t["img"]}" alt="{E(t["alt"])}" decoding="async" loading="lazy" data-i="{k}"{pos}>'
    return f'<div class="mn__img mn__none{on}" data-i="{k}"><p class="ph-copy">[{t["missing"]}]</p></div>'


def _row_photo(t):
    """the same photo in the row itself, shown on a phone only (round 4: the picture sits with its row there)"""
    if t.get('img'):
        pos = f' style="object-position:{t["pos"]}"' if t.get('pos') else ''
        return f'<figure class="mn__rph" aria-hidden="true"><img src="img/{t["img"]}" alt="" decoding="async" loading="lazy"{pos}></figure>'
    return f'<figure class="mn__rph" aria-hidden="true"><div class="mn__none"><p class="ph-copy">[{t["missing"]}]</p></div></figure>'


def menu(d, world):
    """The menu as a price list (Spoke & Weal, JUUT): each row has its number, the serif name with Maggie's triplet in
    italic under it, and her prices one per line with the price at the right. One row is open at a time (engine.js's
    [data-menu] rows) and the photo panel shows its photo: beside the list on a laptop, above it on a phone, so rows
    never change height while the menu moves on by itself."""
    rows = []
    for k, t in enumerate(d['tiles']):
        lines = ''.join(f'<li><span>{a}</span><b>{b}</b></li>' for a, b in _prices(t['price']))
        rows.append(f'''<li class="om__row mn__row a-up{' is-on' if k == 0 else ''}" style="--d:{0.45 + k * .08:.2f}s" data-i="{k}" tabindex="0" aria-expanded="{'true' if k == 0 else 'false'}">
          {_row_photo(t)}<span class="mn__n">0{k + 1}</span>
          <div class="mn__name"><h3>{t['title']}</h3><p class="mn__trip">{t['tag']}</p></div>
          <ul class="mn__prices">{lines}</ul>
        </li>''')
    panel = ''.join(_photo(t, k) for k, t in enumerate(d['tiles']))
    intro = f'<p class="mn__intro a-up" style="--d:.4s">{d["intro"]}</p>' if d.get('intro') else ''
    after = cycle(d, 1.0) + (f'<div class="om__btn a-up" style="--d:1.1s">{d["btn"]}</div>' if d.get('btn') else '')
    return f'''<section class="s s--auto offers-menu mn" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound', 'bed')}" data-menu aria-labelledby="{d['id']}-t">
    <div class="mn__in s__leave">
      <div class="mn__head">
        <p class="label a-left" style="--d:.1s">{d['eyebrow']}</p>
        <h2 id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.2s">{d['title']}</span></span></h2>{intro}
      </div>
      <ol class="om__list mn__list">{''.join(rows)}</ol>
      <div class="mn__after">{after}</div>
      <div class="om__ph mn__ph" aria-hidden="true">{panel}</div>
    </div>
    <div class="s__shade"></div>
  </section>'''


def _foot(e, draft):
    expl = ''.join(f'<li><a href="#{h}">{t}</a></li>' for t, h in e['explore'])
    conn = ''.join(f'<li>{c}</li>' for c in e['connect'])
    # the salon's and Inner Work's real lines (Copywriter 1, task df14fa0d); 2.2's placeholders only when a world has none
    visit = ''.join(f'<li>{v}</li>' for v in e['visit']) if e.get('visit') else \
        f'<li>Address to confirm</li><li>Opening hours to confirm</li><li>{e["foot_visit"]}</li>'
    legal = ''.join(f'<p class="foot__legal">{t}</p>' for t in [e.get('disclaimer'), e.get('legend')] if t)
    return f'''<footer class="foot cl__foot" id="{e['id']}">
      <div class="foot__in">
        <div class="foot__brand">{svg('stacked')}<p>{e['tagline']}</p></div>
        <div><h3 class="label">Explore</h3><ul>{expl}</ul></div>
        {'' if ('visit' in e and not e['visit']) else '<div><h3 class="label">Visit</h3><ul>' + visit + '</ul></div>'}
        <div><h3 class="label">Connect</h3><ul>{conn}</ul></div>
      </div>{legal}
      <div class="foot__base"><span>© 2026 Salon OM · an Aveda concept salon · {draft}</span><span>Aveda is a trademark of Aveda Corporation. Films and photos generated with Magnific as placeholders.</span></div>
    </footer>'''


def close(d, world):
    """Begin and the footer as ONE closing screen (Spoke & Weal's "Not sure what to book?" over its footer; Heyday's photo
    beside the details): the call to action on the left, Begin's own photo framed whole on the right, the details in a
    short band under both. On a phone: the photo, the action, the band."""
    c, e = d['cta'], d['end']
    img, pos = d['img']
    text = f'<p class="cl__text a-up" style="--d:.7s">{c["text"]}</p>' if c.get('text') else ''
    return f'''<section class="s s--auto cl" id="{c['id']}" data-tone="dark" data-sound="{c.get('sound', 'bed')}" aria-labelledby="{c['id']}-t">
    <div class="cl__cta s__leave">
      <div class="cl__words">
        <p class="label a-up" style="--d:.2s">{c['label']}</p>
        <h2 id="{c['id']}-t"><span class="mask"><span class="mask__in" style="--d:.35s">{c['title']}</span></span></h2>
        {text}{cycle(c, .85)}
        <div class="cl__btn a-up" style="--d:1s">{c['btn']}</div>
      </div>
      <figure class="cl__ph" aria-hidden="true"><img src="img/{img}" alt="" decoding="async" loading="lazy" style="object-position:{pos}"></figure>
    </div>
    {_foot(e, d['draft'])}
  </section>'''


def cred(d, world):
    """Inner Work's credentials as a card laid over Maggie's portrait (Esalen), so the third text section of Inner Work
    has a shape of its own."""
    items = ''.join(f'<li class="a-up" style="--d:{0.55 + k * .07:.2f}s">{c}</li>' for k, (c, _) in enumerate(d['list']))
    lead = f'<p class="cr__lead a-up" style="--d:.45s">{d["lead"]}</p>' if d.get('lead') else ''
    small = f'<p class="cr__small a-up" style="--d:1s">{d["small"]}</p>' if d.get('small') else ''
    close_ = f'<p class="pr__close a-up" style="--d:1.1s">{d["close"]}</p>' if d.get('close') else ''
    return f'''<section class="s s--auto cr" id="{d['id']}" data-tone="light" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    <div class="cr__in s__leave">
      <figure class="cr__ph"><img src="img/{d['img']}" alt="{E(d['alt'])}" decoding="async" loading="lazy"></figure>
      <div class="cr__card">
        <p class="eyebrow a-left" style="--d:.15s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.3s">{d['title']}</span></span></h2>{lead}
        <ul class="cr__list">{items}</ul>{small}{close_}
      </div>
    </div>
    <div class="s__shade"></div>
  </section>'''


def visit(d, world):
    """S's visit (round 4, J 11 Nov: "it doesn't have any image so it's just words"): the five steps as five pictures, each
    the same real photo its long step uses in M and G, with its number, name and line under it. The heading and the one
    button share the top row. On a phone the five become a row you swipe, the next one peeking in."""
    cards = ''.join(f'''<li class="vs__step a-up" style="--d:{0.45 + k * .12:.2f}s">
          <figure class="vs__ph" style="--d:{0.35 + k * .12:.2f}s"><img src="img/{img}" alt="{E(alt)}" decoding="async" loading="lazy"></figure>
          <p class="vs__n"><b>{n}</b>{name}</p>
          <p class="vs__t">{line}</p>
        </li>''' for k, (n, name, line, img, alt) in enumerate(d['steps']))
    return f'''<section class="s vs" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    <div class="vs__in s__leave">
      <div class="vs__head">
        <div><p class="eyebrow a-left" style="--d:.1s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.25s">{d['title']}</span></span></h2></div>
        <div class="vs__btn a-up" style="--d:1.2s">{d['btn']}</div>
      </div>
      <ol class="vs__row">{cards}</ol>
    </div>
    <div class="s__shade"></div>
  </section>'''


def _wave(n, hi=18, lo=46):
    """the line through n stops: one smooth wave in a 1000 x 100 box, the stops alternating high and low, flat at each
    stop so a dot sits on it exactly. Returns the SVG path and each stop's (x %, y %)."""
    pts = [((k + .5) * 1000 / n, hi if k % 2 == 0 else lo) for k in range(n)]
    d = f'M0,{pts[0][1]} L{pts[0][0]:.1f},{pts[0][1]}'
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        dx = (x1 - x0) / 2
        d += f' C{x0 + dx:.1f},{y0} {x1 - dx:.1f},{y1} {x1:.1f},{y1}'
    d += f' L1000,{pts[-1][1]}'
    return d, [(x / 10, y) for x, y in pts]


def line(stops):
    """ONE block for every set of steps read in order (round 4, task 2846db82; Heyday's process line): the steps sit as
    stops on a drawn line that draws itself in when its section arrives, a dot on the line at each stop, the number, name
    and words under it. Used by G's visit preview and by Inner Work's path. On a phone the line runs down the left."""
    path, pos = _wave(len(stops))
    items = ''.join(f'''<li class="ln__stop" style="--y:{y / 100:.2f};--k:{k}">
          <i class="ln__dot" aria-hidden="true"></i>
          <div class="ln__words a-up" style="--d:{0.9 + k * .32:.2f}s"><b class="ln__n">{n}</b><h3 class="ln__name">{name}</h3>{f'<p class="ln__t">{t}</p>' if t else ''}</div>
        </li>''' for k, ((n, name, t), (x, y)) in enumerate(zip(stops, pos)))
    return f'''<div class="ln" style="--n:{len(stops)}">
      <svg class="ln__svg" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true"><path class="ln__path" d="{path}" pathLength="1"/></svg>
      <ol class="ln__stops">{items}</ol>
    </div>'''


def preview_line(d, world):
    """G's visit preview (round 4): the heading and its reward, then the five steps of the visit as stops on the line."""
    return f'''<section class="s lnsec" id="{d['id']}" data-tone="light" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    <div class="lnsec__in s__leave">
      <div class="lnsec__head">
        <p class="eyebrow a-left" style="--d:.15s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.3s">{d['title']}</span></span></h2>{cycle(d, .7)}
      </div>
      {line(d['rows'])}
    </div>
    <div class="s__shade"></div>
  </section>'''


def path_line(d, world):
    """Inner Work's path (round 4): the four steps as stops on the same line as G's preview, then the pricing line, the
    answer and reward where the version has them, and its one button."""
    after = f'<p class="lnsec__after">{d["after"]}</p>' if d.get('after') else ''
    foot = (f'<div class="lnsec__foot a-up" style="--d:2.2s">{after}{cycle(d, 2.3)}{d.get("btn", "")}</div>') if (after or d.get('btn') or d.get('answer') or d.get('reward')) else ''
    return f'''<section class="s s--auto lnsec lnsec--path lnsec--deep" id="{d['id']}" data-tone="light" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    <div class="lnsec__in s__leave">
      <div class="lnsec__head">
        <p class="eyebrow a-left" style="--d:.1s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.25s">{d['title']}</span></span></h2>
      </div>
      {line(d['steps'])}{foot}
    </div>
    <div class="s__shade"></div>
  </section>'''


def voices_row(d, world):
    """Voices (round 4; The Well): one guest's words at a time, large, on the forest ground, in a row you scroll sideways
    with arrows and a count; the next card peeks in so the reader sees there is more. No auto-advance: the reader moves it."""
    cards = ''.join(f'''<figure class="vo__card" data-i="{k}"><blockquote>“{q[0]}”</blockquote><figcaption><b>{q[1]}</b>{(' ' + q[2]) if len(q) > 2 and q[2] else ''}</figcaption></figure>'''
                    for k, q in enumerate(d['quotes']))
    n = len(d['quotes'])
    btn = f'<div class="vo__btn a-up" style="--d:1s">{d["btn"]}</div>' if d.get('btn') else ''
    return f'''<section class="s s--auto vo" id="{d['id']}" data-tone="dark" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    <div class="vo__in s__leave">
      <div class="vo__head">
        <p class="label a-left" style="--d:.1s">Kind words</p>
        <h2 class="vo__t" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.25s">{d['title']}</span></span></h2>
        <div class="vo__nav a-fade" style="--d:.6s"><button class="vo__arr" type="button" data-dir="-1" aria-label="Previous words">←</button><span class="vo__count" aria-live="polite"><b>1</b> / {n}</span><button class="vo__arr" type="button" data-dir="1" aria-label="Next words">→</button></div>
      </div>
      <div class="vo__row a-up" style="--d:.45s" tabindex="0" aria-label="Kind words from guests">{cards}</div>
      <div class="vo__foot">{cycle(d, .85)}{btn}</div>
    </div>
    <div class="s__shade"></div>
  </section>'''


def deep_prose(d, world):
    """How we work together on Inner Work's deeper sand, its practices as cards (round 4). Inner Work's text sections stay
    light (J, 19 Oct: only its film slides go dark), so they differ by ground and shape, never by going dark"""
    from build import prose
    return prose(d).replace('class="s s--auto prose"', 'class="s s--auto prose prose--deep"', 1)


def photo_prose(d, world):
    """A long-text section with a real photo of Maggie's salon beside or above its words (round 5, CEO MA 11 Nov: people
    connect in more than one way, so no text-only wall). d['photo'] = (file, alt, 'side' | 'band', focus). 'side' sits the
    photo under the heading and lead (the heading column stays put while the words scroll); 'band' lays it across the
    section between the heading and the words."""
    from build import prose
    f, alt, kind, pos = d['photo']
    fig = f'<figure class="pr__ph pr__ph--{kind} a-fade" style="--d:.5s"><img src="img/{f}" alt="{E(alt)}" decoding="async" loading="lazy" style="object-position:{pos}"></figure>'
    html = prose(d).replace('class="s s--auto prose"', 'class="s s--auto prose prose--photo"', 1)
    if kind == 'side':
        html = html.replace('</div>\n      <div class="pr__body">', fig + '</div>\n      <div class="pr__body">', 1)
    else:
        html = html.replace('      <div class="pr__body">', '      ' + fig + '\n      <div class="pr__body">', 1)
    return html


def photo_deep_prose(d, world):
    """photo_prose on Inner Work's deeper sand (How we work together)"""
    return photo_prose(d, world).replace('class="s s--auto prose prose--photo"', 'class="s s--auto prose prose--photo prose--deep"', 1)
