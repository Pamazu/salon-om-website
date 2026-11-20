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


# a picture's AI label, wherever the picture shows (task a8c429a3): StoryLegal (msg a091eaf1, 18 Nov) rules that a retouch which
# adds to or changes the room, or redraws the whole photo, says "Made with AI from real salon photos"; a retouch that only
# removes clutter says nothing. StoryLegal, 18 Nov (on a8c429a3): J's 25 Oct edit of the basins wall (step 02) owes none, so
# no picture carries one today; the footer's AI line says some photos are retouched with AI
AI_FROM_REAL = 'Made with AI from real salon photos'
PICTURE_AI = {}


def ai_mark(text):
    """the words that say a picture or film was made with AI, as text on the page in a corner of it, always visible (no
    hover, tap or icon): StoryLegal's ruling of 17 Nov 2026 (msg 7d0dc68d, task 1c6ed2aa). One block for every generated
    picture or film on these pages; its parent is the positioned frame of the picture or film it labels (mgs.css .ai-mark)"""
    return f'<p class="ai-mark">{E(text)}</p>'


# the footer's AI line, true to every picture on M, G and S (task 5ae04e42): it names what is real and says the rest is
# AI, so it holds whichever still stands in a film's place. One line per state of Designer 1's films switch (task
# 5479dd6c), picked by FILMS_SHOWN in build.py: True = the films play, False = stills in their places.
FOOT_AI_LINE = {
    True: 'The photos of the salon and its people are real, a few retouched with AI to remove clutter. '
          'Every other picture and film is made with AI, including the menu pictures with their guests.',
    False: 'The photos of the salon and its people are real, a few retouched with AI to remove clutter. '
           'Every other picture is made with AI, including the menu pictures with their guests.',
}


def foot_ai_line():
    import build
    return FOOT_AI_LINE[bool(getattr(build, 'FILMS_SHOWN', True))]


def _photo(t, k):
    """the row's photo: a real photo of that service's result, or a quiet frame saying it is still to come.
    A generated picture (t['ai']) carries is-ai, which shows the panel's one AI mark while it is the open photo"""
    on = ' is-on' if k == 0 else ''
    if t.get('img'):
        pos = f' style="--pos:{t["pos"]}"' if t.get('pos') else ''
        ai = ' is-ai' if t.get('ai') else ''
        return f'<img class="mn__img{on}{ai}" src="img/{t["img"]}" alt="{E(t["alt"])}" decoding="async" loading="lazy" data-i="{k}"{pos}>'
    return f'<div class="mn__img mn__none{on}" data-i="{k}"><p class="ph-copy">[{t["missing"]}]</p></div>'


def _row_photo(t):
    """the same photo in the row itself, shown on a phone only (round 4: the picture sits with its row there)"""
    if t.get('img'):
        pos = f' style="--pos:{t["pos"]}"' if t.get('pos') else ''
        mark = ai_mark(t['ai']) if t.get('ai') else ''
        return f'<figure class="mn__rph" aria-hidden="true"><img src="img/{t["img"]}" alt="" decoding="async" loading="lazy"{pos}>{mark}</figure>'
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
    # the panel's AI mark comes after its pictures, outside engine.js's 'img' list and mgs.js's '[data-i]' list, and shows
    # while a generated picture is the open one (mgs.css: .mn__ph > .is-ai.is-on ~ .ai-mark)
    ai = next((t['ai'] for t in d['tiles'] if t.get('ai') and t.get('img')), None)
    panel = ''.join(_photo(t, k) for k, t in enumerate(d['tiles'])) + (ai_mark(ai) if ai else '')
    intro = f'<p class="mn__intro a-up" style="--d:.4s">{d["intro"]}</p>' if d.get('intro') else ''
    note = f'<p class="mn__note a-up" style="--d:.95s">{d["note"]}</p>' if d.get('note') else ''
    bq = d.get('beneath')
    beneath = (f'<blockquote class="mn__beneath a-up" style="--d:1s">“{bq[0]}”<cite>{bq[1]}, {bq[2]}</cite></blockquote>') if bq else ''
    after = note + beneath + cycle(d, 1.0) + (f'<div class="om__btn a-up" style="--d:1.1s">{d["btn"]}</div>' if d.get('btn') else '')
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
        <div class="foot__brand">{svg('stacked')}{('<p>' + e['name'] + '</p>') if e.get('name') else ''}<p>{e['tagline']}</p>{''.join(f'<p>{b}</p>' for b in e.get('brand_lines', []))}</div>
        <div><h3 class="label">Explore</h3><ul>{expl}</ul></div>
        {'' if ('visit' in e and not e['visit']) else '<div><h3 class="label">Visit</h3><ul>' + visit + '</ul></div>'}
        <div><h3 class="label">Connect</h3><ul>{conn}</ul></div>{('<div><h3 class="label">' + e['iw_block'][0] + '</h3><ul>' + ''.join(f'<li>{x}</li>' for x in e['iw_block'][1:]) + '</ul></div>') if e.get('iw_block') else ''}
      </div>{legal}
      <div class="foot__base"><span>{e.get('copyright', '© 2026 Salon OM · an Aveda concept salon')} · {draft}</span><span>Aveda is a trademark of Aveda Corporation. {foot_ai_line()}</span></div>
    </footer>'''


def with_foot(kind):
    """The footer sits inside the slide that closes its world, whichever section that is (approved feature 14; J 10 Nov:
    "the footer looks terrible ... maybe having two sections in one whole slide"). ONE block for every closing slide: the
    section as its own block draws it (`kind`: a renderer here, or one of build.R's by name), then the footer (_foot, from
    d['foot']), last inside the same <section>. mgs_parts._close() gives the footer to the section it follows: Begin on M,
    the second door on G and S (task d9a90616)."""
    def draw(d, world):
        import build
        own = {k: v for k, v in d.items() if k != 'foot'}
        html = kind(own, world) if callable(kind) else build.R[kind](own)
        m = re.search(r'(\n[ \t]*<div class="s__shade"></div>)?\n[ \t]*</section>\s*$', html)
        assert m, 'with_foot: a renderer drew something other than one <section>'
        return html[:m.start()] + '\n    ' + _foot(d['foot'], d['draft']) + html[m.start():]
    return draw


def close(d, world):
    """Begin as the closing screen (Spoke & Weal's "Not sure what to book?" over its footer; Heyday's photo beside the
    details): the call to action on the left, Begin's own photo framed whole on the right. Where Begin closes its world
    (M) the footer's details sit in a short band under both, in the same slide (with_foot); on a phone: the photo, the
    action, the band. Where a section follows it (G, S: the second door, task d9a90616) it is a slide of its own."""
    c = d['cta']
    img, pos = d['img']
    text = f'<p class="cl__text a-up" style="--d:.7s">{c["text"]}</p>' if c.get('text') else ''
    return f'''<section class="s s--auto cl" id="{c['id']}" data-tone="dark" data-sound="{c.get('sound', 'bed')}" aria-labelledby="{c['id']}-t">
    <div class="cl__cta s__leave">
      <div class="cl__words">
        <p class="label a-up" style="--d:.2s">{c['label']}</p>
        <h2 id="{c['id']}-t"><span class="mask"><span class="mask__in" style="--d:.35s">{c['title']}</span></span></h2>
        {text}{cycle(c, .85)}{(f'<p class="cl__last a-up" style="--d:.95s">' + c['last'] + '</p>') if c.get('last') else ''}
        <div class="cl__btn a-up" style="--d:1s">{c['btn']}</div>
      </div>
      <figure class="cl__ph" aria-hidden="true"><img src="img/{img}" alt="" decoding="async" loading="lazy" style="--pos:{pos}"></figure>
    </div>
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
          <figure class="vs__ph" style="--d:{0.35 + k * .12:.2f}s"><img src="img/{img}" alt="{E(alt)}" decoding="async" loading="lazy">{ai_mark(PICTURE_AI[img]) if img in PICTURE_AI else ""}</figure>
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
    <div class="lnsec__in">
      <div class="lnsec__head s__leave">
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
        <p class="label a-left" style="--d:.1s">{d.get('eyebrow', 'Kind words')}</p>
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
    fig = f'<figure class="pr__ph pr__ph--{kind} a-fade" style="--d:.5s"><img src="img/{f}" alt="{E(alt)}" decoding="async" loading="lazy" style="--pos:{pos}"></figure>'
    html = prose(d).replace('class="s s--auto prose"', 'class="s s--auto prose prose--photo"', 1)
    if kind == 'side':
        html = html.replace('</div>\n      <div class="pr__body">', fig + '</div>\n      <div class="pr__body">', 1)
    else:
        html = html.replace('      <div class="pr__body">', '      ' + fig + '\n      <div class="pr__body">', 1)
    return html


def photo_deep_prose(d, world):
    """photo_prose on Inner Work's deeper sand (How we work together)"""
    return photo_prose(d, world).replace('class="s s--auto prose prose--photo"', 'class="s s--auto prose prose--photo prose--deep"', 1)

# early_proof (G's ivory two-quote proof, round 5) was retired by task 6e4ee413: G's early proof is the voices block now


def aveda(d, world):
    """Why Aveda as a label (task a749167b; J 17 Nov: "much more creative in terms of layout", "think like professional
    photographer, designer, marketer, storyteller"; reference page section 9). The real Aveda shelves at Salon OM run
    full-bleed into the right edge, sharp from the photographer's original at every size (approved features row 18); an
    ivory label card overlaps the photo's left edge and answers the heading the way a label does: her four facts as rows,
    the number then the words, a hairline drawn between, the source as the label's small print. Below, her quote set as a
    letter, signed, then the reward (G) and the one button. On a phone: the heading, the photo, the card pulled up over the
    photo's lower edge, the letter. d: eyebrow, title, paras (G: her line under the question), facts, src, quote, cite,
    reward, btn, photo = (file, alt)."""
    f, alt = d['photo']

    def row(x, k):
        num, label = x[0], x[1]
        m = re.match(r'^(\d+)(.*)$', num)
        inner = f'<span data-count="{m.group(1)}">0</span>{m.group(2)}' if (m and len(x) > 2 and x[2]) else num
        return f'<div class="av__row a-up" style="--d:{0.75 + k * .16:.2f}s"><dt>{inner}</dt><dd>{label}</dd></div>'
    sub = ''.join(f'<p class="av__sub a-up" style="--d:{0.55 + k * .1:.2f}s">{p}</p>' for k, p in enumerate(d.get('paras', [])))
    # a label whose rows are named by words, not numbers (Inner Work's six practices, task 7a3c013b): each name over its line
    words = any(not re.match(r'^[\d$]', re.sub(r'<[^>]+>', '', x[0])) and len(re.sub(r'<[^>]+>', '', x[0])) > 7 for x in d['facts'])
    btn = f'<div class="av__btn a-up" style="--d:.5s">{d["btn"]}</div>' if d.get('btn') else ''
    return f'''<section class="s s--auto av" id="{d['id']}" data-tone="light" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    <div class="av__in s__leave">
      <figure class="av__ph"><img src="img/{f}" alt="{E(alt)}" decoding="async" loading="lazy"></figure>
      <div class="av__label">
        <div class="av__head">
          <p class="eyebrow a-left" style="--d:.15s">{d['eyebrow']}</p>
          <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.3s">{d['title']}</span></span></h2>
          {sub}
        </div>
        <div class="av__card">
          <dl class="av__rows{' av__rows--words' if words else ''}">{''.join(row(x, k) for k, x in enumerate(d['facts']))}</dl>
          <small class="av__src a-fade" style="--d:1.5s">{d['src']}</small>
        </div>
      </div>
      <div class="av__letter">
        <blockquote class="a-up" style="--d:.2s">“{d['quote']}”<cite>{d['cite']}</cite></blockquote>
        {cycle(d, .35)}{btn}
      </div>
    </div>
    <div class="s__shade"></div>
  </section>'''


def _head_rest(text):
    """a text's first sentence (its heading) and the rest: 'Take a breath.' / 'When did you last ...'"""
    m = re.match(r'^(.*?[.?!])\s+(.+)$', text.strip(), re.S)
    return (m.group(1), m.group(2)) if m else (text.strip(), '')


def pause_scene(d, world):
    """the pause drawn as one of Designer 3's three layouts (task a78e6208, page salon-om-pause-options r1), offered to J
    in the page by the option switcher (task e5325977, section_options.py): d['scene'] is
      room    A, Into the room: the picture is the whole section, slowly drifting; the words written into the scene, a fluted
              glass strip behind them that bends the room as you scroll (mgs.js draws its slats from the picture);
      breath  B, The breath: scroll-driven; the room opens from a thin line as you breathe in, the question arrives on the
              exhale, then the last line (mgs.js);
      cinema  C, Cinema: the room as a wide film frame opening from its centre, the heading set huge above and below it;
      through D2, Step through: the door as the default draws it, growing as you scroll until you stand in the room.
    Every word is the section's own (its label, text, after; d['cue'] the two breath words); the picture is the section's
    (breath, breath_alt) with its AI label (breath_mark); the letters come into focus as on the live pause (base.css ink)."""
    head, rest = _head_rest(d['text'])
    long = ' is-long' if len(head) > 30 else ''      # a long opening sentence (Inner Work's) is set a size smaller, on its heading
    sc, f, alt, mark = d['scene'], d['breath'], E(d.get('breath_alt', '')), d.get('breath_mark', '')
    acc = '|'.join(d.get('accents', []))
    # where the picture's subject is (breath_pos, task e1a1e009): the frame keeps her there, and B sets its words beside her
    pos = d.get('breath_pos', '')
    at = f' style="--pos:{pos}"' if pos else ''
    pic = f'<img src="img/{f}" alt="{alt}"{at} sizes="{"100vw" if sc in ("room", "breath") else "(max-width: 1023px) 100vw, 86vw" if sc == "through" else "(max-width: 760px) 100vw, 92vw"}" decoding="async">'
    sub = (lambda cls, at: f'<p class="ps__sub{cls}" data-write="letters" style="--at:{at}">{rest}</p>' if rest else '')
    coda = (lambda cls, at: f'<p class="ps__coda{cls}" data-write="letters" data-accents="{acc}" style="--at:{at}">{d["after"]}</p>' if d.get('after') else '')
    if sc == 'room':
        inner = f'''<div class="ps__pic">{pic}</div><div class="ps__shade" aria-hidden="true"></div><div class="ps__lens" aria-hidden="true" data-flute="14"></div>
    <div class="ps__words s__leave">
      <p class="ps__eyebrow label a-left" style="--d:.1s">{d['label']}</p>
      <p class="ps__head{long}" data-write="letters" style="--at:.3s">{head}</p>
      {sub('', '1.6s')}{coda('', '3.2s')}
    </div>{mark}'''
    elif sc == 'breath':
        a, b = d.get('cue', ('', ''))
        inner = f'''<div class="ps__stick">
      <div class="ps__pic">{pic}</div><div class="ps__dim" aria-hidden="true"></div>
      <p class="ps__cue label" aria-hidden="true" data-in="{E(a)}" data-out="{E(b)}">{a}</p>
      <div class="ps__words">
        <p class="ps__head{long}" data-write="letters" style="--at:.3s">{head}</p>
        {f'<p class="ps__sub">{rest}</p>' if rest else ''}
      </div>
      {f'<p class="ps__coda">{d["after"]}</p>' if d.get('after') else ''}{mark}
    </div>'''
    elif sc == 'cinema':
        w = head.split(' ')
        top, low = ' '.join(w[:max(1, len(w) // 2)]), ' '.join(w[max(1, len(w) // 2):])
        inner = f'''<div class="ps__cine s__leave">
      <p class="ps__take{long}" data-write="letters" style="--at:.3s">{top}</p>
      <figure class="ps__band">{pic}{mark}</figure>
      <p class="ps__breath{long}" data-write="letters" style="--at:1.2s">{low}</p>
      <div class="ps__side">{f'<p class="ps__sub a-fade" style="--d:2.2s">{rest}</p>' if rest else ''}{f'<p class="ps__coda a-fade" style="--d:3.2s">{d["after"]}</p>' if d.get('after') else ''}</div>
    </div>'''
    elif sc == 'through':
        # D2, Step through (task a78e6208): the door as the default draws it; scrolling, you walk up to it until it fills the
        # screen and you stand in the room, the last line on a strip of fluted glass at its foot (mgs.js drives --p)
        inner = f'''<div class="ps__stick">
      <div class="ps__door"><div class="ps__pic">{pic}</div>{f'<div class="ps__strip" aria-hidden="true" data-flute="16"></div><p class="ps__coda" aria-hidden="true">{d["after"]}</p>' if d.get('after') else ''}</div>
      <div class="ps__words">
        <p class="ps__eyebrow label">{d['label']}</p>
        <p class="ps__head{long}" data-write="letters" style="--at:.3s">{head}</p>
        {sub('', '1.6s')}{f'<p class="ps__last">{d["after"]}</p>' if d.get('after') else ''}
      </div>{mark}
    </div>'''
    else:
        raise AssertionError(f'pause_scene: no scene "{sc}"')
    split = ' data-split' if sc == 'breath' and pos and d.get('layout') != 'centre' else ''
    return f'''<section class="s ps ps--{sc}" id="{d['id']}"{split} data-tone="dark" data-sound="{d.get('sound', 'bed')}" aria-label="{E(re.sub(r'<[^>]+>', '', d['label']))}">
    {inner}
    <div class="s__shade"></div>
  </section>'''


# the pause's options (task e5325977). Its default is J's pick, B · The breath (task 95ac520e; J 19 Nov 11:50 Z: "Options that I
# choose", screenshot 12.46.46 on "B · The breath"): the copy draws the pause with pause_scene and PAUSE_DEFAULT; the door versions
# and the rest stay under Shift+V, J's words for each in the notes. One list for every page that has the pause (M, G); Inner
# Work's twin draws the same options in its own words and picture.
PAUSE_DEFAULT = dict(scene='breath', cue=('breathe in', 'breathe out'))
PAUSE_OPTIONS = [
    # (task 3c02d47d; J 20 Nov 12:43 Z: "I need ASAP fast like quick the option of this section that was centered with the scroll
    # triggered interaction"): B as it ran before 4e3a4a4, the words centred over the room, on today's picture
    dict(key='centred', label='B · The breath, centred', note='As before 20 Nov: the room opens from a thin line as you breathe in, the words centred over it; the question arrives on the exhale.', scene='breath', layout='centre'),
    dict(key='standing', label='The door, standing in the room', note='Her words beside a tall arched door on the empty chair by the window (before 19 Nov).', kind='tease'),
    dict(key='glass', label='D1 · The glass door', note='The door again, behind two leaves of fluted glass that slide apart as it arrives.', kind='tease', glass=True),
    dict(key='through', label='D2 · Step through', note='Scroll slowly: you walk up to the door until it fills the screen and you stand in the room.', scene='through'),
    dict(key='door', label='The door, centred', note='Her words either side of a tall arched door in the middle, as on 18 Nov.', kind='tease'),
    dict(key='room', label='A · Into the room', note='The picture is the whole section, slowly drifting; the words written into it over a fluted glass strip.', scene='room'),
    dict(key='cinema', label='C · Cinema', note='The room as a wide film frame; the heading huge above and below it.', scene='cinema'),
]
PAUSE_LIVE_LABEL = 'B · The breath'
PAUSE_LIVE_NOTE = 'Scroll slowly: the room opens as you breathe in; the question arrives on the exhale.'


# where each sheet picture's subject stands, as fractions of the picture (left top right bottom), read from the picture itself
# (task 4739f125; J 19 Nov 14:25 Z: "you can actually place the subject more toward the visible area, the one that doesn't have
# the effect"): sheet.js opens the clear window around it, wherever the picture's crop puts it on the screen
SUBJECTS = {'meadow.webp': '.44 .31 .56 .93',                     # the woman in linen, walking into the meadow
            'real-aveda-shelves.webp': '.58 .30 .82 .86',         # the shelves of Aveda products (J 19 Nov 18:05 Z: "is not highlighting the products"), the fig at its edge as at cd23c7c
            'real-maggie-outdoor-chin.webp': '.44 .08 .70 .80',   # Maggie, her face and shoulders
            'real-shampoo-basins.webp': '.46 .10 .84 .50'}        # the Aveda products organised on the wall, the poster between them (Inner Work's second door, task 95e37a41)


def sheet_stage(img, alt, preset, words, mark=''):
    """ONE block for words on a picture (task 95e37a41; J 18 Nov: "never have cards that are simple on top like that, use the
    lenticular sheet and glass effects if you need something on top"): the picture fills the screen under the lenticular sheet
    (sheet.js draws the sheet, preset `preset`), the words ride on its frost. Any section that puts words on a picture draws
    them through this; mark is the picture's AI label (ai_mark), kept on the picture above the sheet."""
    subject = SUBJECTS.get(img.split('?')[0].rsplit('/', 1)[-1])
    return f'''<div class="sh" data-sheet="{preset}"{f' data-subject="{subject}"' if subject else ''}>
      <div class="sh__ph"><img src="img/{img}" alt="{E(alt)}" sizes="100vw" decoding="async" loading="lazy"></div>{mark}
      <div class="sh__words">
        {words}
      </div>
    </div>'''


def _on_light(btns):
    """buttons made for a dark photo (ivory fill, white outline) on the sheet's light frost: the forest fill and the ink line"""
    return btns.replace('class="btn btn--light"', 'class="btn"').replace('class="btn btn--ghost"', 'class="btn btn--line"')


def aveda_sheet(d, world):
    """Why Aveda under the lenticular sheet (task e5325977; Designer 3's options r6 A-E and r7 F-I, task 9b13c4b2): the
    section's own photo fills the screen under the sheet (sheet_stage, preset d['sheet']), the heading and the label's rows
    riding on its frost instead of a card; below, her quote as the letter, the reward and the button, on the ground the
    sheet melts into (J 19 Nov: "I don't like having such a strong separation between the image with the lenticular effect and
    the text below it"; mgs.css). Every word and the photo are the section's own (aveda()'s d)."""
    f, alt = d['photo']
    rows = ''.join(f'<div class="av__row a-up" style="--d:{0.55 + k * .14:.2f}s"><dt>{x[0]}</dt><dd>{x[1]}</dd></div>' for k, x in enumerate(d['facts']))
    sub = ''.join(f'<p class="av__sub a-up" style="--d:{0.45 + k * .1:.2f}s">{p}</p>' for k, p in enumerate(d.get('paras', [])))
    btn = f'<div class="av__btn a-up" style="--d:.5s">{d["btn"]}</div>' if d.get('btn') else ''
    words = any(not re.match(r'^[\d$]', re.sub(r'<[^>]+>', '', x[0])) and len(re.sub(r'<[^>]+>', '', x[0])) > 7 for x in d['facts'])
    stage = sheet_stage(f, alt, d['sheet'], f'''<p class="eyebrow a-left" style="--d:.15s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.3s">{d['title']}</span></span></h2>
        {sub}<dl class="av__rows{' av__rows--words' if words else ''}">{rows}</dl>
        <small class="av__src a-fade" style="--d:1.4s">{d['src']}</small>''')
    return f'''<section class="s s--auto av av--sheet" id="{d['id']}" data-tone="light" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    {stage}
    <div class="av__letter">
      <blockquote class="a-up" style="--d:.2s">“{d['quote']}”<cite>{d['cite']}</cite></blockquote>
      {cycle(d, .35)}{btn}
    </div>
    <div class="s__shade"></div>
  </section>'''


# Why Aveda's list (J 19 Nov 18:06 Z via the CEO MA, msg 09802a6b, task 4739f125): F, its clear window drifting around the shelves
# of Aveda products (J's pick of 19 Nov 11:50 Z, screenshot 12.47.37), is the section on the page; its ONE option is F synced with the
# scroll (FS). The label card and the sheets G, H, I and A to E are gone from the list; gate row 26 keeps them out.
AVEDA_SHEET = 'F'
AVEDA_LIVE_LABEL = 'F · A clear window drifts'
SYNCED = dict(label='F · synced with the scroll', note='The clear window opens around its subject as the section rises into view and moves with the page; still while the page is still.')
AVEDA_OPTIONS = [dict(key='sheet-fs', kind=aveda_sheet, sheet='FS', **SYNCED)]


def door_sheet(d, world):
    """The second door under the same sheet as Why Aveda (task 95e37a41; J 18 Nov 17:24 Z: "It's very hard to read the text.
    The same section is very hard to read also in the Salon Om variation or Otherworld. Maybe the thing we're doing of lenticular
    sheet could help here."; CEO MA 19 Nov: the same F sheet). The door's own picture fills the screen under the sheet
    (sheet_stage), its words in ink on the frost, its buttons the light-ground pair. Words and picture are the door's own
    (mgs_parts.door(), Inner Work's through the twin); the words straight on the photo stay in the switcher (DOOR_OPTIONS)."""
    more = ''.join(f'<p class="sh__more a-up" style="--d:{.75 + k * .1:.2f}s">{t}</p>' for k, t in enumerate(d.get('more', [])))
    return f'''<section class="s s--auto dr" id="{d['id']}" data-tone="light" data-sound="{d.get('sound', 'bed')}" aria-labelledby="{d['id']}-t">
    {sheet_stage(d['img'], d.get('alt', ''), d.get('sheet', DOOR_SHEET), f"""<p class="eyebrow a-left" style="--d:.15s">{d['eyebrow']}</p>
        <h2 class="mid" id="{d['id']}-t"><span class="mask"><span class="mask__in" style="--d:.3s">{d['title']}</span></span></h2>
        <p class="sh__text a-up" style="--d:.6s">{d['text']}</p>{more}
        <div class="sh__btns a-up" style="--d:.95s">{_on_light(d['btn'])}</div>""", d.get('mark', ''))}
    <div class="s__shade"></div>
  </section>'''


# the second door opens on FS (J 19 Nov 14:25 Z: every section with the effect synced with the scroll, like the pause's breath)
DOOR_SHEET = 'FS'
DOOR_OPTIONS = [dict(key='photo', label='The words on the photo (before 19 Nov)', note='White words straight on the photo under a dark shade.', kind='bridge')]
DOOR_LIVE_LABEL = SYNCED['label']
