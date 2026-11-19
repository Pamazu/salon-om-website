"""Section options (task e5325977, J 19 Nov 2026: "the options just give them to me in the page directly, so I can do shift v
and see a option switcher, shift v again hides it. The option swicher changes based on the section I'm in").

ONE block for every section, naming none. A section declares its options in its copy dict:

    options=[dict(key='door', label='The door', note='...', **changed keys), dict(key='a', label='...', kind=other_renderer, ...)]
    option_label='...'   the live default's name in the panel; option_note='...' its line there; option_name='...' the section's
                         (else its label or eyebrow)

Each option is a named variant of that section (its layout, its picture, its effect): the SAME section drawn again by its own
renderer (or the renderer the option names in `kind`) with the option's keys changed, so its words and pictures stay the
section's own and Inner Work's twin (mgs_parts.twin copies the dict) gets the same options in its own words and pictures.
The section on the page stays the live default; every other option is drawn into a <template> kept outside the two <main>s
(inert until chosen, so it loads nothing; the build's picture checks still read it). options.js swaps a chosen option into
the same <section> element in place (the engine keeps tracking it), remembers it per section and puts it in the address.

render() is called by build.render_world for a section that declares options; store() returns the templates once the page's
worlds are drawn and empties the collection. A page whose sections declare none gets nothing, byte for byte.

A PICTURE's options are the same block (task 279db527; J 19 Nov 18:15 Z: "shift v to shift between options of all images
that are in view also please"): pictures() gives every copy of a declared picture data-pic and keeps its candidates as
<template data-pic-for> in the same store; options.js lists them under the section's options and swaps the picture in place."""
import html
import json
import re

E = html.escape
_STORE = []          # the templates of the page being built: (section id, option key, world, attributes, inner html)
DEFAULT = dict(key='live', label='Today’s version')
OPTION_KEYS = {'key', 'label', 'note', 'kind'}       # the option's own words; every other key changes the section's dict


def _split(section_html):
    """'<section a="1" ...>inner</section>' -> ({a: 1, ...}, inner)"""
    m = re.match(r'\s*<section\b([^>]*)>(.*)</section>\s*$', section_html, re.S)
    assert m, 'section_options: a renderer drew something other than one <section>'
    attrs = dict((k, html.unescape(v)) for k, v in re.findall(r'\s([\w:-]+)="([^"]*)"', m.group(1)))
    for k in re.findall(r'\s([\w:-]+)(?=\s|$)', re.sub(r'\s[\w:-]+="[^"]*"', ' ', m.group(1))):
        attrs[k] = ''
    return attrs, m.group(2)


def render(draw, kind_of, d, world):
    """the section's live html, carrying its options; the other options' templates kept for store().
    draw(kind, d) draws one section; kind_of is the section's own kind."""
    opts = d['options']
    keys = [o['key'] for o in opts]
    assert DEFAULT['key'] not in keys and len(set(keys)) == len(keys) and all(re.fullmatch(r'[a-z0-9-]+', k) for k in keys), \
        f'section_options: "{d["id"]}" option keys must be unique, lowercase, and never "{DEFAULT["key"]}": {keys}'
    base = {k: v for k, v in d.items() if k not in ('options', 'option_label', 'option_note', 'option_name')}
    live = draw(kind_of, base)
    attrs, inner = _split(live)
    sid = attrs.get('id')
    assert sid, 'section_options: a section with options needs an id'
    key = sid[len(world_prefix(world)):] if world_prefix(world) and sid.startswith(world_prefix(world)) else sid
    menu = [dict(k=DEFAULT['key'], n=d.get('option_label') or DEFAULT['label'], **({'d': d['option_note']} if d.get('option_note') else {}))]
    for o in opts:
        changed = {k: v for k, v in o.items() if k not in OPTION_KEYS}
        if world == 'coaching':      # the twin copies the salon's options: a picture named there would be the salon's own
            import mgs_parts as MP
            assert not set(changed) & MP.TWIN_PICTURES, f'section_options: option "{o["key"]}" of "{sid}" names a picture its Inner Work twin would show as its own: {sorted(set(changed) & MP.TWIN_PICTURES)}'
        a, i = _split(draw(o.get('kind', kind_of), dict(base, **changed)))
        assert a.get('id') == sid, f'section_options: option "{o["key"]}" of "{sid}" draws a section with another id'
        _STORE.append((sid, o['key'], world, a, None if (a == attrs and i == inner) else i))
        menu.append(dict(k=o['key'], n=o['label'], **({'d': o['note']} if o.get('note') else {})))
    name = re.sub(r'<[^>]+>|\[|\]', '', str(d.get('option_name') or d.get('label') or d.get('eyebrow') or '')).strip()   # the panel's short name for it
    extra = (f' data-opt-key="{E(key)}" data-opt="{DEFAULT["key"]}" data-opts="{E(json.dumps(menu, ensure_ascii=False, separators=(",", ":")))}"'
             + (f' data-opt-name="{E(name)}"' if name else ''))
    return re.sub(r'<section\b', '<section' + extra, live, count=1)


def world_prefix(world):
    import mgs_parts as MP
    return MP.TWIN if world == 'coaching' else ''


def store():
    """the templates collected since the last call, as one hidden block; '' when no section declared options"""
    global _STORE
    out, _STORE = _STORE, []
    if not out:
        return ''
    rows = []
    for sid, k, world, a, inner in out:
        same = ' data-same' if inner is None else ''
        rows.append(f'<template data-opt-for="{E(sid)}" data-opt="{E(k)}" data-attrs="{E(json.dumps(a, ensure_ascii=False, separators=(",", ":")))}"{same}>{inner or ""}</template>')
    return '<div id="opt-store" hidden>' + ''.join(rows) + '</div>\n'


def pictures(body, declared):
    """The page with its pictures' options (task 279db527). declared: {the picture on the page today (its file): dict(name=its
    name in the panel, live=today's label, options=[dict(key, label, img, alt, note=, pos=, ai=)])}, where ai is the words its
    corner carries ("Guest made with AI") when the candidate is generated. Every <img> of a declared picture (in either world and
    in the sections' option templates) gets data-pic, so a choice changes every copy of it (the menu's panel and its phone row);
    each candidate is drawn as an <img> in a template of the store, so the build gives it its srcset and photo_sources checks it
    like any picture. A picture with no candidate, or not on the page, gets nothing; a page with none is unchanged, byte for byte.
    A candidate goes live as the picture only once J picks it there (approved_gate.py row 27)."""
    marks = sorted([(m.start(), m.group(1)) for m in re.finditer(r'<section\b[^>]*\sid="([^"]+)"', body)] +
                   [(m.start(), m.group(1)) for m in re.finditer(r'<template data-opt-for="([^"]+)"', body)])
    tp, rows = world_prefix('coaching'), []
    for name, p in declared.items():
        opts = p.get('options') or []
        tag = re.compile(r'<img\b(?=[^>]*\ssrc="img/' + re.escape(name) + r'")')
        at = [m.start() for m in tag.finditer(body)]
        if not opts or not at:
            continue
        keys = [o['key'] for o in opts]
        assert DEFAULT['key'] not in keys and len(set(keys)) == len(keys) and all(re.fullmatch(r'[a-z0-9-]+', k) for k in keys), \
            f'section_options: picture "{name}": option keys must be unique, lowercase, and never "{DEFAULT["key"]}": {keys}'
        where = {next((sid for i, sid in reversed(marks) if i < a), '') for a in at}
        where = {w[len(tp):] if tp and w.startswith(tp) else w for w in where}
        assert len(where) == 1 and '' not in where, f'section_options: picture "{name}" sits in more than one section ({sorted(where)}): ' \
            'a choice would change another section too; give it a file of its own there'
        body = tag.sub(f'<img data-pic="{E(name)}"', body)
        rows.append(f'<template data-pic-for="{E(name)}" data-opt="{DEFAULT["key"]}" data-name="{E(p["name"])}" data-n="{E(p["live"])}"></template>')
        for o in opts:
            rows.append(f'<template data-pic-for="{E(name)}" data-opt="{E(o["key"])}" data-n="{E(o["label"])}"'
                        + (f' data-d="{E(o["note"])}"' if o.get('note') else '') + (f' data-ai="{E(o["ai"])}"' if o.get('ai') else '')
                        + f'><img src="img/{o["img"]}" alt="{E(o["alt"])}" data-cand' + (f' style="--pos:{o["pos"]}"' if o.get('pos') else '')
                        + '></template>')
    if not rows:
        return body
    if '<div id="opt-store" hidden>' in body:
        return body.replace('<div id="opt-store" hidden>', '<div id="opt-store" hidden>' + ''.join(rows), 1)
    return body.replace('<main id="main-salon"', '<div id="opt-store" hidden>' + ''.join(rows) + '</div>\n<main id="main-salon"', 1)
