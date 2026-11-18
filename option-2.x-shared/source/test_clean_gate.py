#!/usr/bin/env python3
"""Red/green proof for photo_sources.check (task a8c429a3): python3 option-2.x-shared/source/test_clean_gate.py
Red = the picture list of commit c309448, the pages J saw on 18 Nov (Inner Work's door on the raw basins photo 1059, the pause
on raw 17, Blonding on raw 12, Cut and Style on raw 11, step 02 on the real-bottles master he did not pick), with each old
generated master declared on the photo it was really made on; green = today's list. A commit not in this clone skips, loudly."""
import os
import subprocess
import sys
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import photo_sources as P

RED = 'c309448'
# what the old generated masters were really made on (their comments in mgs_parts.py and export_photos.py at RED)
OLD_BUILT_ON = {
    '17-pause-guest-on-photo.png': 'o:17-shampoo-basins-wide-5B3A1065.jpg',
    'om-menu-blonding.png': 'o:12-shampoo-basins-backbar-5B3A1067.jpg',
    'om-menu-cut-and-style.png': 'o:11-styling-stations-5B3A1083.jpg',
}


def red_source():
    r = subprocess.run(['git', '-C', HERE, 'show', f'{RED}:option-2.x-shared/source/export_photos.py'], capture_output=True, text=True)
    if r.returncode:
        raise unittest.SkipTest(f'commit {RED} is not in this clone: {r.stderr.strip()}')
    s = r.stdout
    a = s.index('SOURCE = {')
    b = s.index('\n}\n', a) + 3
    ns = {}
    exec(s[a:b], ns)
    return ns['SOURCE']


class CleanGate(unittest.TestCase):
    def test_red_the_pages_j_saw_are_refused(self):
        saved = dict(P.BUILT_ON)
        P.BUILT_ON.update(OLD_BUILT_ON)
        try:
            bad = '\n'.join(P.check(red_source()))
        finally:
            P.BUILT_ON.clear(); P.BUILT_ON.update(saved)
        for name, why in [('real-basins-poster.webp', 'iw-5B3A1059.jpg'),            # the door J saw (18.22.40)
                          ('om-menu-blonding.webp', '12-shampoo-basins-backbar'),     # the picture J saw (18.25.55)
                          ('om-pause-guest.webp', '17-shampoo-basins-wide'),
                          ('om-menu-cut-and-style.webp', '11-styling-stations'),
                          ('real-styling-chair.webp', '4-styling-chair-window')]:
            self.assertRegex(bad, f'{name}: built on the raw original {why}', name)
        # the 18 Nov real-bottles master is not the cleaned version J picked: refused until declared
        self.assertIn('real-shampoo-basins.webp: master 6-shampoo-basins-clean.jpg is not declared', bad)

    def test_green_today(self):
        self.assertEqual(P.check(), [])

    def test_undeclared_original_or_master_is_refused(self):
        bad = P.check({'x.webp': 'o:99-new-photo.jpg', 'y.webp': 'm:new-guest.png'})
        self.assertEqual(len(bad), 2)
        self.assertIn('99-new-photo.jpg is not declared', bad[0])
        self.assertIn('new-guest.png is not declared', bad[1])

    def test_a_page_picture_declared_nowhere_stops_the_build(self):
        with self.assertRaises(SystemExit):
            P.check_page('<img src="img/real-shampoo-basins.webp"><img src="img/brand-new.webp">')
        P.check_page('<img src="img/real-shampoo-basins.webp"><img src="img/real-katie.webp">')


if __name__ == '__main__':
    unittest.main(verbosity=2)
