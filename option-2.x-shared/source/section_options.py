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
worlds are drawn and empties the collection. A page whose sections declare none gets nothing, byte for byte."""
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
