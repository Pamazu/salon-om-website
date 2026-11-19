#!/usr/bin/env python3
"""Red/green proof for approved_gate.py (tasks 448f6e27, 6328eca1): python3 option-2.x-shared/source/test_approved_gate.py
Red = the M page of commit 2fe0c558 (the films switched off); green = the pages of commit 23a1df7 (the films back) for rows 1,
2, 16 and 19, and the live pages of ea42af6 for every row; each row's red is that live page with the row broken.
A commit that is not in this clone makes its tests skip, loudly, never pass."""
import contextlib
import io
import os
import re
import subprocess
import sys
import unittest

sys.path.insert(0, os.path.dirname(__file__))
import approved_gate as g

RED, GREEN, LIVE = '2fe0c558', '23a1df7', 'ea42af6'
FIRST = {1, 2, 16, 19}          # the rows the gate checked before task 6328eca1


def page(commit, letter):
    r = subprocess.run(['git', '-C', g.ROOT, 'show', f'{commit}:option-2.2-mgs/{letter}/index.html'], capture_output=True, text=True)
    if r.returncode:
        raise unittest.SkipTest(f'commit {commit} is not in this clone: {r.stderr.strip()}')
    return r.stdout


class RedGreen(unittest.TestCase):
    def test_red_is_refused_on_rows_1_16_19(self):
        off = g.check({'m': page(RED, 'm')})
        self.assertEqual(sorted(set(off) & FIRST), [1, 16, 19], off)   # row 2 (the photos) held in red: not flagged

    def test_green_passes_on_all_three_pages(self):
        pages = {l: page(GREEN, l) for l in 'mgs'}
        self.assertEqual(set(g.check(pages)) & FIRST, set())

    def test_live_passes_every_row_on_all_three_pages(self):
        self.assertEqual(g.check({l: page(LIVE, l) for l in 'mgs'}), {})

    def test_s_has_only_its_two_film_spots(self):
        self.assertEqual(sorted(set(g.check({'s': re.sub(r'<video data-src="media/hero.mp4"[^>]*></video>', '', page(GREEN, 's'))})) & FIRST), [19])


class Mutations(unittest.TestCase):
    def setUp(self):
        self.m = page(GREEN, 'm')

    def test_one_film_removed_names_that_step(self):
        html = self.m.replace('<video data-src="media/water.mp4" muted playsinline loop preload="none" aria-hidden="true"></video>', '', 1)
        off = g.check({'m': html})
        self.assertEqual(sorted(set(off) & FIRST), [1, 16])
        self.assertIn('"unwind"', off[1][0])

    def test_a_still_class_is_caught(self):
        off = g.check({'m': self.m.replace('class="s ch ch--stack" id="renew"', 'class="s ch ch--stack ch--still" id="renew"')})
        self.assertEqual(sorted(set(off) & FIRST), [1]); self.assertIn('ch--still', off[1][0])

    def test_a_shared_sound_is_caught(self):
        off = g.check({'m': self.m.replace('data-sound="fire"', 'data-sound="water"', 1)})
        self.assertEqual(sorted(set(off) & FIRST), [1])

    def test_a_missing_film_file_is_caught(self):
        self.assertEqual(sorted(set(g.check({'m': self.m}, site='/nonexistent')) & FIRST), [1, 16, 19])

    def test_a_repeated_photo_is_caught(self):
        b = 'img/real-team-of-three.webp'
        html = re.sub(r'(id="unwind".*?<div class="ch__top" aria-hidden="true"><img src=")[^"]*', lambda m: m.group(1) + b, self.m, count=1, flags=re.S)
        self.assertEqual(sorted(set(g.check({'m': html})) & FIRST), [2])

    def test_a_film_inside_a_script_is_not_a_film(self):
        html = self.m.replace('</body>', "<script>var t='<video data-src=\"media/x.mp4\"></video>'</script></body>")
        self.assertEqual(set(g.check({'m': html})) & FIRST, set())


class Waiver(unittest.TestCase):
    def test_a_quote_names_its_row(self):
        msg = 'Films off\n\nJ names row 16: "switch the step films off for now"\nJ names row 1: "short"\n'
        self.assertEqual(g.waivers(msg), {16: 'switch the step films off for now'})   # under 15 characters is no quote

    def test_a_placeholder_is_no_quote(self):
        self.assertEqual(g.waivers('J names row 1: "<his words, at least 15 characters>"'), {})

    def test_the_message_is_read_from_the_head_commit_of_a_repo(self):
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            git = lambda *a: subprocess.run(['git', '-C', d, '-c', 'user.name=t', '-c', 'user.email=t@t', *a], check=True, capture_output=True)
            git('init', '-q'); git('commit', '-q', '--allow-empty', '-m', 'one', '-m', 'J names row 19: "bring the hero film off"')
            self.assertEqual(g.waivers(g.head_message(d)), {19: 'bring the hero film off'})
            git('commit', '-q', '--allow-empty', '-m', 'two')                        # the quote must be on the deployed commit itself
            self.assertEqual(g.waivers(g.head_message(d)), {})

    def gate(self, pages, message):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = g.main(list(pages), pages=pages, message=message, rows=list(range(1, 20)), measured_off={})
        return code, out.getvalue(), err.getvalue()

    def test_red_is_refused_and_the_refusal_prints_the_line_to_add(self):
        code, out, err = self.gate({'m': page(RED, 'm')}, 'Films off for now')
        self.assertEqual(code, 1)
        for n in (1, 16, 19):
            self.assertIn(f'J names row {n}: "<his words', err)
        self.assertIn('Nothing was deployed', err)

    def test_red_passes_only_with_a_quote_for_every_row_it_turns_off(self):
        two = 'x\n\nJ names row 1: "turn the nature films off"\nJ names row 16: "turn the nature films off"\n'
        self.assertEqual(self.gate({'m': page(RED, 'm')}, two)[0], 1)         # row 19 still unquoted
        three = two + 'J names row 19: "turn the hero films off too"\n'
        three += ''.join(f'J names row {n}: "the rows of that older page too"\n' for n in g.check({'m': page(RED, 'm')}) if n not in FIRST)
        code, out, _ = self.gate({'m': page(RED, 'm')}, three)
        self.assertEqual(code, 0); self.assertIn('is off on purpose, J: "turn the hero films off too"', out)

    def test_green_passes_and_lists_what_it_does_not_check(self):
        code, out, _ = self.gate({l: page(LIVE, l) for l in 'mgs'}, 'Anything')
        self.assertEqual(code, 0); self.assertIn('QA walks row 11', out); self.assertNotIn('NOT machine-checked', out)


class EveryRow(unittest.TestCase):
    """each row the built page shows: the live page passes, the live page with that row broken is refused on that row"""
    def setUp(self):
        self.m, self.s = page(LIVE, 'm'), page(LIVE, 's')

    def off(self, html, letter='m'):
        return g.check({letter: html})

    def red(self, row, html, letter='m', why=None):
        off = self.off(html, letter)
        self.assertIn(row, off, f'row {row} not refused: {off}')
        if why:
            self.assertTrue(any(why in m for m in off[row]), off[row])

    def test_3_a_step_that_loses_the_2_2_layout(self):
        self.red(3, self.m.replace('<dl class="ch__specs">', '<dl class="specs">', 1), why='.ch__specs')

    def test_4_a_preview_with_four_stops(self):
        i = self.m.index('class="ln__stop"')
        self.red(4, self.m[:i] + 'class="ln__gone"' + self.m[i + len('class="ln__stop"'):], why='4 stops')

    def test_4_no_step_rail(self):
        self.red(4, self.m.replace('id="rail"', 'id="r"', 1), why='step rail')

    def test_4_the_preview_moved_away_from_the_steps(self):
        a = re.search(r'<section class="s lnsec" id="visit".*?</section>\s*', self.m, re.S)
        html = self.m[:a.start()] + self.m[a.end():]
        html = html.replace('<section class="s s--auto av" id="aveda"', a.group(0) + '<section class="s s--auto av" id="aveda"', 1)
        self.red(4, html, why='not step 01')

    def test_6_no_photo_panel(self):
        self.red(6, self.m.replace('<div class="om__ph mn__ph"', '<div class="om__ph"', 1), why='photo panel')

    def test_7_two_menu_pictures_from_one_corner(self):
        self.red(7, self.m.replace('img/om-menu-extensions.webp', 'img/om-pause-guest.webp'), why='same corner')

    def test_7_a_generated_guest_without_its_mark(self):
        self.red(7, self.m.replace('class="mn__img is-ai"', 'class="mn__img"', 1), why='AI mark')

    def test_8_voices_without_testimonials(self):
        a = re.search(r'id="kind".*?</section>', self.m, re.S)
        self.red(8, self.m[:a.start()] + a.group(0).replace('class="q"', 'class="quote"') + self.m[a.end():], why='no testimonial')

    def test_10_an_inner_work_section_in_another_colour(self):
        self.red(10, self.m.replace('id="c-aveda" data-tone="light"', 'id="c-aveda" data-tone="dark"', 1), why='"aveda"')

    def test_12_two_light_neighbours_in_one_shape(self):
        html = self.m.replace('class="s team-letter" id="hosts"', 'class="s s--auto av" id="hosts"', 1)
        self.red(12, html, why='"aveda" and "hosts"')

    def test_13_a_button_with_another_action(self):
        a = re.search(r'id="services".*?</section>', self.m, re.S)
        self.red(13, self.m[:a.start()] + a.group(0).replace('Book your visit', 'Call us now', 1) + self.m[a.end():], why='"Call us now"')

    def test_13_the_footer_anchor_to_another_place(self):
        self.red(13, self.m.replace('<a href="#begin">Begin<', '<a href="#top">Begin<', 1), why='"Begin"')

    def test_13_the_other_world_in_a_middle_section(self):
        a = re.search(r'id="services".*?</section>', self.m, re.S)
        self.red(13, self.m[:a.start()] + a.group(0).replace('Book your visit', 'Book a Connection Call', 1) + self.m[a.end():], why='other world')

    def test_14_the_footer_out_of_the_closing_slide(self):
        html = self.m.replace('<footer class="foot cl__foot" id="letters">', '<div class="foot cl__foot" id="letters">', 1)
        self.red(14, html, why='closing slide')

    def test_15_a_heading_that_no_longer_writes_itself_in(self):
        self.red(15, self.m.replace('<p class="mani__text" data-write="letters" data-accents="moment.">Take', '<p class="mani__text">Take', 1), why='letter by letter')

    def test_15_the_heading_swapped(self):
        self.red(15, self.m.replace('data-accents="moment.">Take a breath.', 'data-accents="moment.">Slow down now.', 1), why='Take a breath')

    def test_18_a_picture_whose_widest_file_is_missing(self):
        html = re.sub(r'img/hd/om-menu-blonding-1171\.webp', 'img/hd/om-menu-blonding-9999.webp', self.m, count=1)
        self.red(18, html, why='404')

    def test_s_passes_and_breaks_on_its_own_rows(self):
        self.assertEqual(self.off(self.s, 's'), {})
        self.red(13, self.s.replace('Explore Inner Work', 'Go elsewhere', 1), letter='s')


class TheList(unittest.TestCase):
    """every row of the list has a check, or the deploy is refused; the measured rows count like the others"""
    def gate(self, rows, measured_off=None, message='x'):
        out, err = io.StringIO(), io.StringIO()
        pages = {'m': page(LIVE, 'm')}
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = g.main(['m'], pages=pages, message=message, rows=rows, measured_off={} if measured_off is None else measured_off)
        return code, out.getvalue(), err.getvalue()

    def test_every_row_of_the_list_today_has_a_check(self):
        rows = g.list_rows()
        if rows is None:
            raise unittest.SkipTest(f'the list is not on this machine: {g.LIST}')
        self.assertEqual(rows, list(range(1, 20)))
        self.assertEqual(g.unchecked(rows), [])

    def test_a_new_row_without_its_check_is_refused(self):
        code, _, err = self.gate(list(range(1, 21)))
        self.assertEqual(code, 1); self.assertIn('row(s) 20', err)

    def test_an_unreadable_list_is_refused(self):
        keep = g.list_rows
        g.list_rows = lambda: None
        try:
            code, _, err = self.gate(None)
        finally:
            g.list_rows = keep
        self.assertEqual(code, 1); self.assertIn('cannot be read', err)

    def test_a_measured_row_off_is_refused_and_a_quote_lifts_it(self):
        off = {17: ['M (measured): Salon OM: 2 ring line(s) are drawn in the pause']}
        code, _, err = self.gate(list(range(1, 20)), off)
        self.assertEqual(code, 1); self.assertIn('Row 17', err); self.assertIn('ring line', err)
        code, out, _ = self.gate(list(range(1, 20)), off, 'x\n\nJ names row 17: "bring the rings back around it"\n')
        self.assertEqual(code, 0); self.assertIn('row 17 is off on purpose', out)

    def test_the_key_is_the_page_and_the_measuring_scripts(self):
        a = g.measure_key(b'<html>1</html>'); b = g.measure_key(b'<html>2</html>')
        self.assertNotEqual(a, b); self.assertEqual(len(a), 12); self.assertEqual(a, g.measure_key(b'<html>1</html>'))

    def test_results_are_read_from_the_pool_archive_and_nothing_else(self):
        import tarfile
        import tempfile
        with tempfile.TemporaryDirectory() as d:
            src = os.path.join(d, 'src'); os.makedirs(src)
            for n, body in (('gate-rows-m-abcdef012345.json', '{"ok": 1}'), ('evil.json', '{}')):
                open(os.path.join(src, n), 'w').write(body)
            os.makedirs(os.path.join(d, 'pool-x'))
            with tarfile.open(os.path.join(d, 'pool-x', 'output.tar'), 'w') as tf:
                tf.add(os.path.join(src, 'gate-rows-m-abcdef012345.json'), arcname='./gate-rows-m-abcdef012345.json')
                tf.add(os.path.join(src, 'evil.json'), arcname='../gate-rows-m-000000000000.json')
            out = os.path.join(d, 'out'); os.makedirs(out)
            os.rename(os.path.join(d, 'pool-x'), os.path.join(out, 'pool-x'))
            g.take_results(out, 'gate-rows')
            self.assertTrue(os.path.exists(os.path.join(out, 'gate-rows-m-abcdef012345.json')))
            self.assertFalse(os.path.exists(os.path.join(d, 'gate-rows-m-000000000000.json')))
            self.assertFalse(os.path.exists(os.path.join(out, 'gate-rows-m-000000000000.json')))

    def test_the_measured_result_is_read_for_its_own_rows_only(self):
        import tempfile
        html = b'<html>k</html>'
        with tempfile.TemporaryDirectory() as d:
            keep = g.OUT; g.OUT = d
            try:
                k = g.measure_key(html)
                json_ = '{"v": "s", "key": "%s", "off": {"15": ["x"], "14": ["y"]}}' % k
                open(os.path.join(d, f'gate-rows-s-{k}.json'), 'w').write(json_)
                off, why = g.measured(['s'], {'s': html})
            finally:
                g.OUT = keep
        self.assertEqual(why, ''); self.assertEqual(sorted(off), [14])    # row 15 is not measured on S (no pause)


class Known(unittest.TestCase):
    """a fault already on the live pages is held only by the open task that fixes it, and is printed on every run"""
    T = '6328eca1-8fad-414a-9578-8bad78014a8e'
    OFF = {18: ['M (measured): Salon OM: "unhurried": img/hd/real-lounge-5330.webp (5330 px wide) is enlarged 1.21x on J\'s 6K window, so it is soft']}

    def gate(self, known, off, status=lambda t: 'in-progress'):
        out, err = io.StringIO(), io.StringIO()
        with contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):
            code = g.main(['m'], pages={'m': page(LIVE, 'm')}, message='x', rows=list(range(1, 20)), measured_off=off,
                          known=known, status=status)
        return code, out.getvalue(), err.getvalue()

    def line(self, **k):
        return dict({'row': 18, 'pages': 'mg', 'match': 'real-lounge-5330', 'task': self.T}, **k)

    def test_with_no_line_the_fault_is_refused(self):
        code, _, err = self.gate([], self.OFF)
        self.assertEqual(code, 1); self.assertIn('qa/gate-known.json', err)

    def test_a_line_with_its_open_task_holds_it_and_says_so(self):
        code, out, _ = self.gate([self.line()], self.OFF)
        self.assertEqual(code, 0); self.assertIn('held by its task ' + self.T, out); self.assertIn('real-lounge-5330', out)

    def test_a_closed_task_holds_nothing(self):
        code, _, err = self.gate([self.line()], self.OFF, status=lambda t: 'done')
        self.assertEqual(code, 1); self.assertIn('is done', err)

    def test_a_short_task_id_or_match_holds_nothing(self):
        for bad in (self.line(task='6328eca1'), self.line(match='real'), self.line(pages='x')):
            code, _, err = self.gate([bad], self.OFF)
            self.assertEqual(code, 1, bad); self.assertIn('holds nothing', err)

    def test_another_fault_on_the_same_row_is_refused(self):
        off = {18: self.OFF[18] + ['M (measured): Salon OM: "hosts": img/hd/real-team-640.webp (640 px wide) is enlarged 2.10x on J\'s 6K window, so it is soft']}
        code, out, err = self.gate([self.line()], off)
        self.assertEqual(code, 1); self.assertIn('real-team-640', err); self.assertIn('held by its task', out)

    def test_a_page_the_line_does_not_name_is_refused(self):
        code, _, _ = self.gate([self.line(pages='g')], self.OFF)
        self.assertEqual(code, 1)

    def test_a_line_whose_fault_is_gone_is_named(self):
        code, out, _ = self.gate([self.line()], {})
        self.assertEqual(code, 0); self.assertIn('no longer off: take the line out', out)

    def test_status_unread_still_holds_and_says_it_was_not_read(self):
        code, out, _ = self.gate([self.line()], self.OFF, status=lambda t: None)
        self.assertEqual(code, 0); self.assertIn('not read', out)


class RedControls(unittest.TestCase):
    """every measured row goes red in WebKit when it is broken on purpose (qa/gate-red.mjs, run in the pool)"""
    def test_every_measured_row_went_red_when_broken(self):
        import hashlib
        import json
        h = hashlib.sha256()
        for f in (g.page_path('m'), *(os.path.join(g.ROOT, 'qa', n) for n in ('gate-rows.mjs', 'lib.mjs', 'gate-red.mjs'))):
            with open(f, 'rb') as fh:
                h.update(fh.read())
        k = h.hexdigest()[:12]
        f = os.path.join(g.OUT, f'gate-red-{k}.json')
        if not os.path.exists(f):
            raise unittest.SkipTest(f'no red-control run for these pages and checks ({k}): run qa/gate-red.mjs in the pool')
        with open(f, encoding='utf-8') as fh:
            rows = json.load(fh)['rows']
        self.assertEqual(sorted(map(int, rows)), sorted(g.MEASURED))
        self.assertEqual([n for n, r in rows.items() if not r['red']], [])


if __name__ == '__main__':
    unittest.main(verbosity=2)
