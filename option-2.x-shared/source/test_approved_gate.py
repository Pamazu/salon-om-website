#!/usr/bin/env python3
"""Red/green proof for approved_gate.py (task 448f6e27): python3 option-2.x-shared/source/test_approved_gate.py
Red = the M page of commit 2fe0c558 (the films switched off); green = the pages of commit 23a1df7 (the films back).
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

RED, GREEN = '2fe0c558', '23a1df7'


def page(commit, letter):
    r = subprocess.run(['git', '-C', g.ROOT, 'show', f'{commit}:option-2.2-mgs/{letter}/index.html'], capture_output=True, text=True)
    if r.returncode:
        raise unittest.SkipTest(f'commit {commit} is not in this clone: {r.stderr.strip()}')
    return r.stdout


class RedGreen(unittest.TestCase):
    def test_red_is_refused_on_rows_1_16_19(self):
        off = g.check({'m': page(RED, 'm')})
        self.assertEqual(sorted(off), [1, 16, 19], off)          # row 2 (the photos) held in red: not flagged

    def test_green_passes_on_all_three_pages(self):
        pages = {l: page(GREEN, l) for l in 'mgs'}
        self.assertEqual(g.check(pages), {})

    def test_s_has_only_its_two_film_spots(self):
        self.assertEqual(sorted(g.check({'s': re.sub(r'<video data-src="media/hero.mp4"[^>]*></video>', '', page(GREEN, 's'))})), [19])


class Mutations(unittest.TestCase):
    def setUp(self):
        self.m = page(GREEN, 'm')

    def test_one_film_removed_names_that_step(self):
        html = self.m.replace('<video data-src="media/water.mp4" muted playsinline loop preload="none" aria-hidden="true"></video>', '', 1)
        off = g.check({'m': html})
        self.assertEqual(sorted(off), [1, 16])
        self.assertIn('"unwind"', off[1][0])

    def test_a_still_class_is_caught(self):
        off = g.check({'m': self.m.replace('class="s ch ch--stack" id="renew"', 'class="s ch ch--stack ch--still" id="renew"')})
        self.assertEqual(sorted(off), [1]); self.assertIn('ch--still', off[1][0])

    def test_a_shared_sound_is_caught(self):
        off = g.check({'m': self.m.replace('data-sound="fire"', 'data-sound="water"', 1)})
        self.assertEqual(sorted(off), [1])

    def test_a_missing_film_file_is_caught(self):
        self.assertEqual(sorted(g.check({'m': self.m}, site='/nonexistent')), [1, 16, 19])

    def test_a_repeated_photo_is_caught(self):
        b = 'img/real-team-of-three.webp'
        html = re.sub(r'(id="unwind".*?<div class="ch__top" aria-hidden="true"><img src=")[^"]*', lambda m: m.group(1) + b, self.m, count=1, flags=re.S)
        self.assertEqual(sorted(g.check({'m': html})), [2])

    def test_a_film_inside_a_script_is_not_a_film(self):
        html = self.m.replace('</body>', "<script>var t='<video data-src=\"media/x.mp4\"></video>'</script></body>")
        self.assertEqual(g.check({'m': html}), {})


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
            code = g.main(list(pages), pages=pages, message=message)
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
        code, out, _ = self.gate({'m': page(RED, 'm')}, three)
        self.assertEqual(code, 0); self.assertIn('is off on purpose, J: "turn the hero films off too"', out)

    def test_green_passes_and_lists_what_it_does_not_check(self):
        code, out, _ = self.gate({l: page(GREEN, l) for l in 'mgs'}, 'Anything')
        self.assertEqual(code, 0); self.assertIn('NOT machine-checked', out); self.assertIn('rows 3, 4, 5', out)


if __name__ == '__main__':
    unittest.main(verbosity=2)
