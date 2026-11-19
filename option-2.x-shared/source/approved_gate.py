#!/usr/bin/env python3
"""Deploy gate (tasks 448f6e27, 6328eca1): a deploy never turns off, changes or loses a feature J approved.

J, 19 Nov 2026 08:01 Z: "someone brought back this section when I explicitly requested the one with the door, I requested to
improve the layout come on this is very annoying when you keep doing reversions."

Every row of reference/approved-features.md (Salon OM brain folder) has its check here, of one of three kinds:
  - read from the built page itself (a tag, a class, a section's place, a file): ROWS below, run on every deploy;
  - measured on the rendered page in WebKit (a computed colour, a panel that stays, a quote that changes in place, a letter
    coming into focus, a picture's pixels at J's 6K window): MEASURED, by qa/gate-rows.mjs, whose result for these exact
    built pages is read here, and fetched from the pool (sDelegate) for the pushed commit when it is missing;
  - a QA step, only where a machine truly cannot judge (QA_ONLY, one line why).
A row of the list with none of the three refuses the deploy: a new row J approves comes with its check.

A failed row refuses the deploy unless the deployed commit (HEAD) quotes J's own words naming that row, one line per row:

    J names row 16: "<his words, at least 15 characters>"

    python3 option-2.x-shared/source/approved_gate.py [m g s]        # default: all three; exit 1 = refused
To lift this into another product: replace ROWS, MEASURED, QA_ONLY and the list's path.
"""
import glob
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = os.path.join(ROOT, 'option-2.2', 'site')          # the films and pictures live here; the deploy stages them from it
REF_22 = os.path.join(SITE, 'index.html')                # salon-om-2-2.web.app: the steps' approved layout (row 3)
STEPS = ('arrive', 'unwind', 'renew', 'unhurried', 'home')
VOID = {'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'track', 'wbr', 'area', 'base', 'col', 'embed'}
LIST = os.environ.get('APPROVED_FEATURES') or os.path.join(
    os.environ.get('ALL_KERNEL') or '/Users/j/All',
    'Business & Career', 'Salon OM & Coaching', 'projects', 'build-salon-om-website', 'reference', 'approved-features.md')
MEASURE = [os.path.join(ROOT, 'qa', 'gate-rows.mjs'), os.path.join(ROOT, 'qa', 'lib.mjs')]
OUT = os.path.join(ROOT, 'qa', 'gate-out')               # the measured results, kept in the repo so no machine measures twice
WORLDS = (('salon', '', 'Salon OM'), ('coaching', 'c-', 'Inner Work'))
ACTION = {'salon': ('Book your visit', '#begin'), 'coaching': ('Book a Connection Call', 'mailto:connect@maggiewoodward.com')}
DOORS = {'salon': ('Inner Work with Maggie', 'Explore Inner Work', 'Book a Connection Call'),
         'coaching': ('Salon OM', 'Explore Salon OM', 'Book your visit')}     # the other world, allowed at the top and in its own section


class Page(HTMLParser):
    """Per section id: its attributes, films, pictures (with the classes above each), every class in it (counted), its words,
    its links (text, href, class), whether a footer sits in it; and per world (<main>) the order of its sections."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections, self.order, self.stack, self.cur, self.main, self.link = {}, {}, [], None, None, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'main' and a.get('id'):
            self.main = a['id']
        if tag == 'section' and a.get('id'):
            self.cur = self.sections[a['id']] = {'attrs': a, 'films': [], 'pics': [], 'classes': {}, 'words': 0, 'links': [],
                                                 'footer': False, 'heads': []}
            self.order.setdefault(self.main, []).append(a['id'])
        if self.cur is not None:
            for c in (a.get('class') or '').split():
                self.cur['classes'][c] = self.cur['classes'].get(c, 0) + 1
            if tag in ('video', 'img'):
                above = {c for _, cl in self.stack for c in cl}
                self.cur['films' if tag == 'video' else 'pics'].append({'attrs': a, 'above': above})
            if tag == 'footer':
                self.cur['footer'] = True
            if tag == 'a':
                self.link = {'href': a.get('href') or '', 'cls': a.get('class') or '', 'text': ''}
            if 'mani__text' in (a.get('class') or '').split():
                self.cur['heads'].append(a)
        if tag not in VOID:
            self.stack.append((tag, (a.get('class') or '').split()))

    def handle_data(self, d):
        if self.cur is not None:
            self.cur['words'] += len(d.split())
            if self.link is not None:
                self.link['text'] += d
            for h in self.cur['heads']:
                if 'text' not in h or len(h.get('text', '')) < 40:
                    h['text'] = (h.get('text', '') + d)[:80]

    def handle_endtag(self, tag):
        if tag == 'a' and self.link is not None and self.cur is not None:
            self.link['text'] = ' '.join(self.link['text'].replace('→', '').split())
            self.cur['links'].append(self.link)
            self.link = None
        if tag == 'section':
            self.cur = None
        if tag == 'main':
            self.main = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


def parse(html):
    p = Page()
    p.feed(html)
    p.sections['__order__'] = p.order
    return p.sections


def worlds(sections):
    """(world, id prefix, name, its sections in order) for each world the page has."""
    order = sections.get('__order__', {})
    return [(w, P, W, order.get(f'main-{w}', [])) for w, P, W in WORLDS if order.get(f'main-{w}')]


def film_ok(f, site):
    """A film tag with a data-src to an .mp4 that is in the staged site folder (a missing file is a film that 404s)."""
    src = (f['attrs'].get('data-src') or '').split('?')[0]     # the address without its content version (?v=, task 01849ea5)
    return src.endswith('.mp4') and (site is None or os.path.exists(os.path.join(site, src)))


def has_film(section, site):
    return any(film_ok(f, site) for f in section['films'])


def steps(sections):
    return [(s, sections.get(s)) for s in STEPS]


def row1(sections, letter, site):      # each step has its own film, moving, with its own sound
    out, sounds = [], []
    for sid, sec in steps(sections):
        if sec is None:
            out.append(f'step "{sid}" is missing'); continue
        why = []
        if 'ch--still' in (sec['attrs'].get('class') or '').split():
            why.append('switched to a still (class ch--still)')
        if not has_film(sec, site):
            why.append('no film (a <video data-src="media/….mp4"> whose file is staged)')
        if why:
            out.append(f'step "{sid}": ' + '; '.join(why))
        sounds.append(sec['attrs'].get('data-sound') or '')
    if not out and (not all(sounds) or len(set(sounds)) != len(sounds)):
        out.append(f'the five steps do not each carry their own sound (data-sound: {sounds})')
    return out


def row2(sections, letter, site):      # each step shows its own real photo
    out, srcs = [], []
    for sid, sec in steps(sections):
        photos = [p['attrs'].get('src') for p in (sec or {'pics': []})['pics'] if 'ch__top' in p['above']]
        if not photos:
            out.append(f'step "{sid}" has no photo')
        srcs += photos[:1]
    if not out and len(set(srcs)) != len(srcs):
        out.append('a photo repeats across the five steps')
    return out


_REF = {}


def step_layout():
    """the classes every one of 2.2's five steps carries: the steps' approved layout and entrance motion (row 3)"""
    if 'steps' not in _REF:
        with open(REF_22, encoding='utf-8') as f:
            ref = parse(f.read())                                 # 2.2's own five steps: Arrive, Unwind, Renew, Unhurried, Whole
        sets = [set(sec['classes']) for sid in ref['__order__'].get('main-salon', [])
                for sec in [ref[sid]] if 'ch' in (sec['attrs'].get('class') or '').split()]
        _REF['steps'] = set.intersection(*sets) if len(sets) == len(STEPS) else None
    return _REF['steps']


def row3(sections, letter, site):      # the five steps keep the 2.2 layout and motion
    common, out = step_layout(), []
    if common is None:
        return ['the 2.2 reference page (option-2.2/site/index.html) does not have its five steps']
    for w, P, W, ids in worlds(sections):
        for sid in STEPS:
            sec = sections.get(P + sid)
            if sec is None:
                out.append(f'{W} step "{P + sid}" is missing'); continue
            gone = sorted(common - set(sec['classes']))
            if gone:
                out.append(f'{W} step "{P + sid}" lost the 2.2 layout or motion: no {", ".join("." + c for c in gone)}')
    return out


def row4(sections, letter, site):      # the visit preview sits straight before the five steps; its line has five stops; the rail
    out = []
    for w, P, W, ids in worlds(sections):
        if P + 'visit' not in ids:
            out.append(f'{W}: no visit preview ("{P}visit")'); continue
        i = ids.index(P + 'visit')
        if i + 1 >= len(ids) or ids[i + 1] != P + 'arrive':
            out.append(f'{W}: the visit preview is followed by "{ids[i + 1] if i + 1 < len(ids) else "nothing"}", not step 01')
        c = sections[P + 'visit']['classes']
        if c.get('ln__stop', 0) != 5 or not c.get('ln__path'):
            out.append(f'{W}: the preview\'s line has {c.get("ln__stop", 0)} stops and {c.get("ln__path", 0)} line, not five stops on one line')
    if 'rail' not in sections.get('__html_ids__', set()):
        out.append('the page has no step rail (id="rail") for the stops to travel into')
    return out


def row6(sections, letter, site):      # the menu: a price list with its photo panel; each row its own photo (the phone's)
    out = []
    for w, P, W, ids in worlds(sections):
        sec = sections.get(P + 'services')
        if sec is None:
            out.append(f'{W}: no menu ("{P}services")'); continue
        panel = [p for p in sec['pics'] if 'mn__ph' in p['above']]
        rows = sec['classes'].get('mn__rph', 0)
        row_pics = [p['attrs'].get('src', '').split('?')[0] for p in sec['pics'] if 'mn__rph' in p['above']]
        if not panel:
            out.append(f'{W}: the menu has no photo panel (.mn__ph with a picture)')
        if not rows or len(row_pics) < rows:
            out.append(f'{W}: {rows - len(row_pics) if rows else "no"} menu rows without their own photo (.mn__rph)')
        elif len(set(row_pics)) != len(row_pics):
            out.append(f'{W}: two menu rows show the same photo')
    return out


def _sources():
    sys.path.insert(0, os.path.dirname(__file__))
    import photo_sources
    return photo_sources


def _base_photo(PS, name):
    """the photographer's original a site picture comes from (a cleaned master stands for its original), or None"""
    src, seen = PS.SOURCE.get(name) or PS.OTHER.get(name), 0
    back = {v: k for k, v in PS.ORIGINALS.items() if v}
    while src and seen < 8:
        kind, f = src.split(':', 1)
        if kind == 'o':
            return f
        if f in back:
            return back[f]
        src, seen = PS.BUILT_ON.get(f), seen + 1
    return None


def _generated(PS, name):
    src = PS.SOURCE.get(name) or ''
    return src.startswith('m:') and src[2:] in PS.BUILT_ON and src[2:] not in PS.CLEANED


def row7(sections, letter, site):      # menu pictures: no two from the same corner; a generated guest is labelled, never a real result
    PS, out = _sources(), []
    for w, P, W, ids in worlds(sections):
        sec = sections.get(P + 'services')
        if sec is None:
            continue
        names = []
        for p in sec['pics']:
            m = re.match(r'img/([a-z0-9-]+\.webp)', p['attrs'].get('src') or '')
            if m and m[1] not in names:
                names.append(m[1])
        bases = {}
        for n in names:
            b = _base_photo(PS, n)
            if b and b in bases:
                out.append(f'{W}: menu pictures {bases[b]} and {n} are both made from photo {b} (the same corner)')
            bases.setdefault(b, n)
        for p in sec['pics']:
            m = re.match(r'img/([a-z0-9-]+\.webp)', p['attrs'].get('src') or '')
            if not (m and _generated(PS, m[1])):
                continue
            if 'mn__ph' in p['above'] and 'is-ai' not in (p['attrs'].get('class') or '').split():
                out.append(f'{W}: the panel shows the generated {m[1]} without its AI mark (class is-ai)')
        if sec['classes'].get('ai-mark', 0) < sec['classes'].get('mn__rph', 0) and any(_generated(PS, n) for n in names):
            out.append(f'{W}: {sec["classes"].get("mn__rph", 0)} menu rows with generated guests but {sec["classes"].get("ai-mark", 0)} "made with AI" marks')
    return out


def row8(sections, letter, site):      # the voices are there with their testimonials (one at a time, changing: measured)
    out = []
    for w, P, W, ids in worlds(sections):
        for sid in ids:
            sec = sections[sid]
            if 'voices' in (sec['attrs'].get('class') or '').split() and sid.endswith('kind') and not sec['classes'].get('q', 0):
                out.append(f'{W}: the voices ("{sid}") hold no testimonial')
        if not any(sid.endswith('kind') for sid in ids if 'voices' in (sections[sid]['attrs'].get('class') or '')):
            if letter in 'mg':
                out.append(f'{W}: no voices section ("{P}kind")')
    return out


def _layout(sec):
    return ' '.join(sorted(c for c in (sec['attrs'].get('class') or '').split() if c not in ('s', 's--auto')))


def row10(sections, letter, site):     # Inner Work has the salon world's colours, section by section
    ws = {w: ids for w, P, W, ids in worlds(sections)}
    if 'salon' not in ws or 'coaching' not in ws:
        return ['the page does not have both worlds']
    S, C, out = ws['salon'], ws['coaching'], []
    if ['c-' + s for s in S] != C:
        out.append(f'Inner Work\'s sections {C} are not the salon\'s {S}, in order')
    for s in S:
        c = sections.get('c-' + s)
        if c is None:
            continue
        a, b = sections[s]['attrs'], c['attrs']
        if a.get('data-tone') != b.get('data-tone') or _layout(sections[s]) != _layout(c):
            out.append(f'"{s}" is {a.get("data-tone")} {_layout(sections[s])}, its Inner Work twin {b.get("data-tone")} {_layout(c)}')
    return out


def row12(sections, letter, site):     # the light sections are each their own idea; no text-only wall
    out = []
    for w, P, W, ids in worlds(sections):
        light = [(sid, sections[sid]) for sid in ids if sections[sid]['attrs'].get('data-tone') == 'light']
        for i, sid in enumerate(ids[1:], 1):
            a, b = sections[ids[i - 1]], sections[sid]
            if a['attrs'].get('data-tone') == b['attrs'].get('data-tone') == 'light' and _layout(a) == _layout(b):
                out.append(f'{W}: light sections "{ids[i - 1]}" and "{sid}" sit together in one shape ({_layout(a)})')
        for sid, sec in light:
            if sec['words'] >= 100 and not (sec['pics'] or sec['films']):
                out.append(f'{W}: the light section "{sid}" is {sec["words"]} words with no picture')
    return out


def row13(sections, letter, site):     # one call to action per world, throughout; the footer's anchor goes to that world's close
    out = []
    for w, P, W, ids in worlds(sections):
        own, href = ACTION[w]
        for sid in ids:
            bare = sid[len(P):]
            for l in sections[sid]['links']:
                t, h = l['text'], l['href']
                if bare == 'begin':
                    if t == 'Begin' and h != f'#{P}begin':
                        out.append(f'{W}: the footer\'s "Begin" goes to {h}, not this world\'s close #{P}begin')
                    continue
                if 'btn' not in l['cls'].split() and t != own:
                    continue
                if t == own:
                    if not h.startswith(href):
                        out.append(f'{W} "{sid}": "{t}" goes to {h}, not {href}')
                elif t in DOORS[w]:
                    if bare not in ('top', 'deeper'):
                        out.append(f'{W} "{sid}": the other world\'s "{t}" appears outside the top and its own section')
                else:
                    out.append(f'{W} "{sid}": a button reads "{t}", not this world\'s one action "{own}"')
        top = [l for l in sections.get(P + 'top', {'links': []})['links'] if 'btn' in l['cls'].split()]
        if not top or top[0]['text'] != own:
            out.append(f'{W}: the opening\'s first button is "{top[0]["text"] if top else "missing"}", not "{own}"')
    return out


def row14(sections, letter, site):     # the footer sits inside the closing slide
    return [f'{W}: the footer is not inside the closing slide ("{P}begin")' for w, P, W, ids in worlds(sections)
            if not (sections.get(P + 'begin') or {}).get('footer')]


def row15(sections, letter, site):     # the pause's heading writes itself in, out of focus into focus
    out = []
    for w, P, W, ids in worlds(sections):
        sec = sections.get(P + 'pause')
        if sec is None:
            out.append(f'{W}: no pause ("{P}pause")'); continue
        heads = sec['heads']
        if not heads or heads[0].get('data-write') != 'letters':
            out.append(f'{W}: the pause\'s heading does not write itself in letter by letter (data-write="letters"), so it cannot come into focus')
        elif not P and not ' '.join((heads[0].get('text') or '').split()).startswith('Take a breath.'):
            out.append(f'{W}: the pause\'s heading reads "{heads[0].get("text", "")[:30]}", not "Take a breath."')
    return out


def row16(sections, letter, site):     # the film sits in the step's stack with its photo, so it plays alongside it
    out = []
    for sid, sec in steps(sections):
        if sec is None:
            out.append(f'step "{sid}" is missing'); continue
        in_stack = [f for f in sec['films'] if 'ch__stack' in f['above'] and film_ok(f, site)]
        if not in_stack:
            out.append(f'step "{sid}": no film in the step stack beside its photo')
    return out


def row18(sections, letter, site):     # every picture's files are staged: its own and its widest size (the pixels: measured)
    out = []
    for w, P, W, ids in worlds(sections):
        for sid in ids:
            for p in sections[sid]['pics']:
                a = p['attrs']
                files = [(a.get('src') or '').split('?')[0]] + [c.split()[0].split('?')[0] for c in (a.get('srcset') or '').split(',') if c.strip()]
                for f in files:
                    if f.startswith('img/') and site is not None and not os.path.exists(os.path.join(site, f)):
                        out.append(f'{W} "{sid}": {f} is not in the staged site (a picture that 404s)')
    return out


def row19(sections, letter, site):     # the hero film, and the Inner Work hero film
    out = []
    for sid, what in (('top', 'the hero'), ('c-top', 'the Inner Work hero')):
        sec = sections.get(sid)
        if sec is None or not has_film(sec, site):
            out.append(f'{what} (section "{sid}") has no film')
    return out


# number: (what it keeps, the pages it applies to, the check over the built page). M and G have the pause, the visit preview,
# the five steps and the voices; S is the short version (the opening, the visit, the team, the menu, the second door, the close).
ROWS = {
    1: ('each step has its own film, moving, with its own sound', 'mg', row1),
    2: ('each step shows its own real photo', 'mg', row2),
    3: ('the five steps keep the 2.2 layout and motion', 'mg', row3),
    4: ('the visit preview straight before the steps, its line to all five stops, into the step rail', 'mg', row4),
    6: ('the menu is a price list with its photo panel; on a phone each row has its own photo', 'mgs', row6),
    7: ('menu pictures: never two from the same corner, a generated guest always labelled', 'mgs', row7),
    8: ('the voices: one centred testimonial at a time, on the forest ground', 'mg', row8),
    10: ('Inner Work has the salon world\'s colours, section by section', 'mgs', row10),
    12: ('the light sections are each their own idea, no text-only wall', 'mgs', row12),
    13: ('one call to action per world, throughout', 'mgs', row13),
    14: ('the footer sits inside the closing slide, with no empty band under it', 'mgs', row14),
    15: ('the pause\'s "Take a breath." comes into focus as it arrives', 'mg', row15),
    16: ('the film plays alongside the photo in each step', 'mg', row16),
    18: ('every picture sharp at its display size on J\'s 6K window', 'mgs', row18),
    19: ('the hero film and the Inner Work hero film', 'mgs', row19),
}
# measured in WebKit by qa/gate-rows.mjs, on the pages it applies to (what it measures is written there, row by row)
MEASURED = {4: 'mg', 5: 'mgs', 6: 'mgs', 8: 'mg', 9: 'mgs', 10: 'mgs', 12: 'mgs', 14: 'mgs', 15: 'mg', 17: 'mg', 18: 'mgs'}
# a machine cannot judge these; each stays a QA step, and says why
QA_ONLY = {
    11: 'it is about what the words do (a hook in result, objection and time form, its proof, its reward); M carries only '
        'Maggie\'s own lines by design, so no markup can tell a hook from a heading: the copy walk reads it',
}
# what a row's checks leave to the QA walk (the row is machine-checked; this part is read by eye)
QA_PART = {
    1: 'the sound heard', 5: 'the pull between slides felt on a trackpad', 7: 'anatomy, pose and nothing invented in the place',
    18: 'composition and no visible crop',
}

WAIVER = re.compile(r'^J names row (\d+): "(.{15,})"\s*$', re.M)


def waivers(message):
    """Row number -> J's quoted words, from the lines of the deployed commit's message (a placeholder is no quote)."""
    return {int(n): q for n, q in WAIVER.findall(message) if not re.fullmatch(r'<.*>', q.strip())}


def check(pages, site=SITE):
    """pages: {letter: html}. Returns {row: [what is off, ...]} for every row whose built-page check fails."""
    off = {}
    for letter, html in pages.items():
        sections = parse(html)
        sections['__html_ids__'] = set(re.findall(r'\sid="([^"]+)"', html))
        for n, (_, on, fn) in ROWS.items():
            if letter in on:
                off.setdefault(n, []).extend(f'{letter.upper()}: {m}' for m in fn(sections, letter, site))
    return {n: m for n, m in off.items() if m}


def list_rows(path=LIST):
    """the row numbers of the approved-features list, or None when it cannot be read"""
    try:
        with open(path, encoding='utf-8') as f:
            text = f.read()
    except OSError:
        return None
    return sorted({int(n) for n in re.findall(r'^\|\s*(\d+)\s*\|', text, re.M)})


def unchecked(rows):
    return [n for n in rows if n not in ROWS and n not in MEASURED and n not in QA_ONLY]


def measure_key(html_bytes, measure=MEASURE):
    """the key gate-rows.mjs writes its result under: sha256(built page + gate-rows.mjs + lib.mjs), first 12 hex"""
    h = hashlib.sha256(html_bytes)
    for f in measure:
        with open(f, 'rb') as fh:
            h.update(fh.read())
    return h.hexdigest()[:12]


def page_path(letter):
    return os.path.join(ROOT, 'option-2.2-mgs', letter, 'index.html')


def git(*a):
    return subprocess.run(['git', '-C', ROOT, *a], capture_output=True, text=True)


def fetch_measured(letters, keys):
    """run gate-rows.mjs on the pool for the pushed HEAD; returns '' or why it could not"""
    if git('diff', '--quiet', 'HEAD', '--', 'option-2.2-mgs', 'qa/gate-rows.mjs', 'qa/lib.mjs').returncode:
        return ('the built pages or the measuring scripts differ from HEAD: commit and push them, so what is measured and '
                'deployed is one pushed commit')
    sha = git('rev-parse', 'HEAD').stdout.strip()
    if not git('branch', '-r', '--contains', sha).stdout.strip():
        return f'HEAD {sha[:10]} is not pushed: push it (storymind link push-back), so the pool can measure it'
    if os.environ.get('GATE_LOCAL') == '1':
        cmd = ['node', os.path.join(ROOT, 'qa', 'gate-rows.mjs'), OUT, ','.join(letters)]
    else:
        if not shutil.which('sdelegate'):
            return 'sdelegate is not on this machine (GATE_LOCAL=1 measures here instead)'
        tmp = os.path.join(OUT, f'pool-{sha[:10]}')
        cmd = ['sdelegate', 'run-at-ref', '--team', 'salon-om', '--task', os.environ.get('GATE_TASK', '6328eca1-8fad-414a-9578-8bad78014a8e'),
               '--repo', 'salon-om-website', '--ref', sha, '--asset', 'WEBKIT', '--install', 'npm', '--install-dir', 'qa',
               '--needs', 'macos', '--out', tmp, '--output-dir', 'gate-out', '--timeout', '25m',
               '--', 'node', 'qa/gate-rows.mjs', 'gate-out', ','.join(letters)]
    print(f'approved-features gate: measuring {" ".join(letters)} in WebKit ({" ".join(cmd[:2])} at {sha[:10]}) ...', flush=True)
    r = subprocess.run(cmd, capture_output=True, text=True)
    for f in glob.glob(os.path.join(OUT, '**', 'gate-rows-*.json'), recursive=True):
        if os.path.dirname(f) != OUT:
            shutil.copy(f, OUT)
    if not all(os.path.exists(os.path.join(OUT, f'gate-rows-{l}-{keys[l]}.json')) for l in letters):
        return f'the measuring run left no result for every page (exit {r.returncode}):\n' + (r.stdout + r.stderr)[-1500:]
    return ''


def measured(letters, pages_bytes):
    """{row: [what is off]} from gate-rows.mjs for these exact built pages, fetched when missing; or a reason it is not known"""
    keys = {l: measure_key(pages_bytes[l]) for l in letters}
    missing = [l for l in letters if not os.path.exists(os.path.join(OUT, f'gate-rows-{l}-{keys[l]}.json'))]
    if missing:
        why = fetch_measured(missing, keys)
        if why:
            return None, why
    off = {}
    for l in letters:
        with open(os.path.join(OUT, f'gate-rows-{l}-{keys[l]}.json'), encoding='utf-8') as f:
            res = json.load(f)
        for n, msgs in res.get('off', {}).items():
            if l in MEASURED.get(int(n), ''):
                off.setdefault(int(n), []).extend(f'{l.upper()} (measured): {m}' for m in msgs)
    return off, ''


def head_message(root=ROOT):
    return subprocess.run(['git', '-C', root, 'log', '-1', '--format=%B'], capture_output=True, text=True, check=True).stdout


def main(argv, pages=None, message=None, rows=None, measured_off=None):
    """pages, message, rows and measured_off are for the test; the deploy reads the built pages, the HEAD message, the list
    and the measured result."""
    letters = argv or ['m', 'g', 's']
    if pages is None:
        raw = {}
        for l in letters:
            with open(page_path(l), 'rb') as f:
                raw[l] = f.read()
        pages = {l: b.decode('utf-8') for l, b in raw.items()}
    else:
        raw = {l: h.encode('utf-8') for l, h in pages.items()}
    rows = list_rows() if rows is None else rows
    if rows is None:
        print(f'REFUSED: the approved-features list cannot be read at {LIST} (APPROVED_FEATURES= or ALL_KERNEL= points to it), '
              'so nobody can tell every row J approved is checked. Nothing was deployed.', file=sys.stderr)
        return 1
    bare = unchecked(rows)
    if bare:
        print(f'REFUSED: row(s) {", ".join(map(str, bare))} of the approved-features list have no check. A row J approves comes '
              'with its check in approved_gate.py (ROWS or MEASURED, or QA_ONLY with one line why). Nothing was deployed.', file=sys.stderr)
        return 1
    off = check(pages)
    if measured_off is None:
        m_off, why = measured(letters, raw)
        if m_off is None:
            print(f'REFUSED: the rows measured in WebKit ({", ".join(map(str, sorted(MEASURED)))}) are not known for these built '
                  f'pages: {why}\nNothing was deployed.', file=sys.stderr)
            return 1
    else:
        m_off = measured_off
    for n, msgs in m_off.items():
        off.setdefault(n, []).extend(msgs)
    said = waivers(head_message() if message is None else message)
    refused = {n: m for n, m in off.items() if n not in said}
    for n, quote in said.items():
        if n in off:
            print(f'approved-features gate: row {n} is off on purpose, J: "{quote}" (the deployed commit says so)')
    if refused:
        print('REFUSED: this deploy turns off or changes a feature J approved (reference/approved-features.md).', file=sys.stderr)
        for n, msgs in sorted(refused.items()):
            what = ROWS[n][0] if n in ROWS else f'row {n}'
            print(f'\n  Row {n}, {what}:', file=sys.stderr)
            for m in msgs:
                print(f'    - {m}', file=sys.stderr)
        names = ' / '.join(f'row {n}' for n in sorted(refused))
        print('\nNever switch off or bring back an older version of a live, approved feature: ask J which feature he means.\n'
              'If J did name it, put his own words on the deployed commit (amend it) as a line, one per row:', file=sys.stderr)
        for n in sorted(refused):
            print(f'    J names row {n}: "<his words, at least 15 characters>"', file=sys.stderr)
        print(f'\nOtherwise bring {names} back and build again. Nothing was deployed.', file=sys.stderr)
        return 1
    held = sorted(n for n in rows if n not in QA_ONLY)
    print(f'approved-features gate: rows {", ".join(map(str, held))} hold on {" ".join(letters)} (machine-checked; measured in '
          f'WebKit: {", ".join(map(str, sorted(MEASURED)))}); QA walks row {", ".join(map(str, sorted(QA_ONLY)))} and '
          + '; '.join(f'row {n}: {t}' for n, t in sorted(QA_PART.items())) + ' (reference/approved-features.md).')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
