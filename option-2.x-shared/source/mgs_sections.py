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
        return f'<img class="mn__img{on}" src="img/{t["img"]}" alt="{E(t["alt"])}" decoding="async" loading="lazy" data-i="{k}">'
    return f'<div class="mn__img mn__none{on}" data-i="{k}"><p class="ph-copy">[{t["missing"]}]</p></div>'


def menu(d, world):
    """The menu as a price list (Spoke & Weal, JUUT): each row has its number, the serif name with Maggie's triplet in
    italic under it, and her prices one per line with the price at the right. One row is open at a time (engine.js's
    [data-menu] rows) and the photo panel shows its photo: beside the list on a laptop, above it on a phone, so rows
    never change height while the menu moves on by itself."""
    rows = []
    for k, t in enumerate(d['tiles']):
        lines = ''.join(f'<li><span>{a}</span><b>{b}</b></li>' for a, b in _prices(t['price']))
        rows.append(f'''<li class="om__row mn__row a-up{' is-on' if k == 0 else ''}" style="--d:{0.45 + k * .08:.2f}s" data-i="{k}" tabindex="0" aria-expanded="{'true' if k == 0 else 'false'}">
          <span class="mn__n">0{k + 1}</span>
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
        <div><h3 class="label">Visit</h3><ul>{visit}</ul></div>
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
