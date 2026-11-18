#!/usr/bin/env python3
"""Deploy gate (task 448f6e27): a deploy never turns off a feature J approved.

Each row of reference/approved-features.md (Salon OM brain folder) that can be read from the built page has a check
below. A failed check refuses the deploy unless the deployed commit (HEAD) quotes J's own words naming that row:

    J names row 16: "<his words, at least 15 characters>"

The rows with no check here are listed on every run as "not machine-checked", so nobody reads a pass as a full walk.
A check reads structure (a film tag, a sound attribute, a class), never behaviour: playing, sound and look stay with QA.

    python3 option-2.x-shared/source/approved_gate.py [m g s]        # default: all three; exit 1 = refused
To lift this into another product: replace ROWS (a number, a name, the pages it applies to, a check over the parsed page).
"""
import os
import re
import subprocess
import sys
from html.parser import HTMLParser

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SITE = os.path.join(ROOT, 'option-2.2', 'site')          # the films live here; the deploy stages them from it
STEPS = ('arrive', 'unwind', 'renew', 'unhurried', 'home')
LAST_ROW = 19                                            # the last row of approved-features.md
VOID = {'img', 'br', 'hr', 'input', 'meta', 'link', 'source', 'track', 'wbr', 'area', 'base', 'col', 'embed'}


class Page(HTMLParser):
    """Per section id: its attributes, its films (<video> attributes) and its pictures, with the classes above each."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections, self.stack, self.cur = {}, [], None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'section' and a.get('id'):
            self.cur = self.sections[a['id']] = {'attrs': a, 'films': [], 'pics': []}
        if self.cur is not None and tag in ('video', 'img'):
            above = {c for _, cl in self.stack for c in cl}
            self.cur['films' if tag == 'video' else 'pics'].append({'attrs': a, 'above': above})
        if tag not in VOID:
            self.stack.append((tag, (a.get('class') or '').split()))

    def handle_endtag(self, tag):
        if tag == 'section':
            self.cur = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                break


def parse(html):
    p = Page()
    p.feed(html)
    return p.sections


def film_ok(f, site):
    """A film tag with a data-src to an .mp4 that is in the staged site folder (a missing file is a film that 404s)."""
    src = f['attrs'].get('data-src') or ''
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


def row16(sections, letter, site):     # the film sits in the step's stack with its photo, so it plays alongside it
    out = []
    for sid, sec in steps(sections):
        if sec is None:
            out.append(f'step "{sid}" is missing'); continue
        in_stack = [f for f in sec['films'] if 'ch__stack' in f['above'] and film_ok(f, site)]
        if not in_stack:
            out.append(f'step "{sid}": no film in the step stack beside its photo')
    return out


def row19(sections, letter, site):     # the hero film, and the Inner Work hero film
    out = []
    for sid, what in (('top', 'the hero'), ('c-top', 'the Inner Work hero')):
        sec = sections.get(sid)
        if sec is None or not has_film(sec, site):
            out.append(f'{what} (section "{sid}") has no film')
    return out


# number: (what it keeps, the pages it applies to, the check). A step has a film on M and G only; S has two film spots.
ROWS = {
    1: ('each step has its own film, moving, with its own sound', 'mg', row1),
    2: ('each step shows its own real photo', 'mg', row2),
    16: ('the film plays alongside the photo in each step', 'mg', row16),
    19: ('the hero film and the Inner Work hero film', 'mgs', row19),
}

WAIVER = re.compile(r'^J names row (\d+): "(.{15,})"\s*$', re.M)


def waivers(message):
    """Row number -> J's quoted words, from the lines of the deployed commit's message (a placeholder is no quote)."""
    return {int(n): q for n, q in WAIVER.findall(message) if not re.fullmatch(r'<.*>', q.strip())}


def check(pages, site=SITE):
    """pages: {letter: html}. Returns {row: [what is off, ...]} for every row whose check fails."""
    off = {}
    for letter, html in pages.items():
        sections = parse(html)
        for n, (_, on, fn) in ROWS.items():
            if letter in on:
                off.setdefault(n, []).extend(f'{letter.upper()}: {m}' for m in fn(sections, letter, site))
    return {n: m for n, m in off.items() if m}


def head_message(root=ROOT):
    return subprocess.run(['git', '-C', root, 'log', '-1', '--format=%B'], capture_output=True, text=True, check=True).stdout


def main(argv, pages=None, message=None):
    """pages and message are for the test; the deploy reads the built pages and the HEAD message."""
    letters = argv or ['m', 'g', 's']
    if pages is None:
        pages = {l: open(os.path.join(ROOT, 'option-2.2-mgs', l, 'index.html'), encoding='utf-8').read() for l in letters}
    off, said = check(pages), waivers(head_message() if message is None else message)
    refused = {n: m for n, m in off.items() if n not in said}
    for n, quote in said.items():
        if n in off:
            print(f'approved-features gate: row {n} is off on purpose, J: "{quote}" (the deployed commit says so)')
    if refused:
        print('REFUSED: this deploy turns off a feature J approved (reference/approved-features.md).', file=sys.stderr)
        for n, msgs in sorted(refused.items()):
            print(f'\n  Row {n}, {ROWS[n][0]}:', file=sys.stderr)
            for m in msgs:
                print(f'    - {m}', file=sys.stderr)
        rows = ' / '.join(f'row {n}' for n in sorted(refused))
        print('\nNever switch off a live, approved feature to follow a priority call: ask J which feature he means.\n'
              'If J did name it, put his own words on the deployed commit (amend it) as a line, one per row:', file=sys.stderr)
        for n in sorted(refused):
            print(f'    J names row {n}: "<his words, at least 15 characters>"', file=sys.stderr)
        print(f'\nOtherwise bring {rows} back and build again. Nothing was deployed.', file=sys.stderr)
        return 1
    checked = sorted(n for n in ROWS if any(l in ROWS[n][1] for l in letters))
    unchecked = [n for n in range(1, LAST_ROW + 1) if n not in ROWS]
    print(f'approved-features gate: rows {", ".join(map(str, checked))} hold on {" ".join(letters)}; '
          f'rows {", ".join(map(str, unchecked))} are NOT machine-checked, walk them in QA (reference/approved-features.md).')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
