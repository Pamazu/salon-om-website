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


class Basins(unittest.TestCase):
    """Every picture of the basins room is built on J's 25 Oct picture (task 69006a72, J 19 Nov 12:01 Z). Red = the declarations
    live on 19 Nov (4547068): the tidied photo saved as '6-shampoo-basins-25oct-clean.jpg' and standing for photo 6, Blonding and
    the pause made on it, Inner Work's picture on photo 1059; the old check passed them all, trusting the name."""
    RED_19_NOV = {'real-shampoo-basins.webp': 'm:6-shampoo-basins-25oct-clean.jpg',
                  'om-menu-blonding.webp': 'm:om-menu-blonding-25oct.png',
                  'om-pause-guest.webp': 'm:om-pause-guest-25oct.png',
                  'real-basins-poster.webp': 'm:iw-5B3A1059-clean.jpg'}

    def test_red_the_pictures_j_saw_on_19_nov_are_refused(self):
        saved_o, saved_b = dict(P.ORIGINALS), dict(P.BUILT_ON)
        P.ORIGINALS['6-shampoo-basins-5B3A1072.jpg'] = '6-shampoo-basins-25oct-clean.jpg'
        P.BUILT_ON.update({'om-menu-blonding-25oct.png': 'm:6-shampoo-basins-25oct-clean.jpg',
                           'om-pause-guest-25oct.png': 'm:6-shampoo-basins-25oct-clean.jpg'})
        P.CLEANED.add('6-shampoo-basins-25oct-clean.jpg')
        try:
            bad = '\n'.join(P.basins_problems(self.RED_19_NOV))
        finally:
            P.ORIGINALS.clear(); P.ORIGINALS.update(saved_o); P.BUILT_ON.clear(); P.BUILT_ON.update(saved_b)
            P.CLEANED.discard('6-shampoo-basins-25oct-clean.jpg')
        for name in self.RED_19_NOV:
            self.assertIn(f'{name}: shows the basins room but is not built on J\'s 25 Oct picture', bad)

    def test_green_every_basins_picture_today_is_built_on_his_picture(self):
        self.assertEqual(P.basins_problems(), [])
        self.assertEqual(set(P.basins()), {'real-shampoo-basins.webp', 'om-menu-blonding.webp', 'om-pause-rest.webp', 'om-pause-exhale.webp',
                                           'om-pause-rest-lit.webp', 'om-menu-blonding-bl10a2.webp'})   # Shift+V candidates (e1a1e009, b1dd24c9)
        with self.assertRaises(SystemExit):                       # a retired basins picture back on a page stops the build
            P.check_page('<img src="img/real-shampoo-basins.webp"><img src="img/real-basins-poster.webp">')

    def test_a_new_picture_of_that_room_is_refused_until_built_on_his_picture(self):
        for src in ('o:17-shampoo-basins-wide-5B3A1065.jpg', 'o:12-shampoo-basins-backbar-5B3A1067.jpg', 'm:6-shampoo-basins-tidied.jpg'):
            self.assertTrue(any('not built on J\'s 25 Oct picture' in m for m in P.check({'new.webp': src})), src)

    def test_the_measure_tells_his_room_from_the_tidied_one(self):
        """room_check on the masters (outside Git, on the Studio): his picture at full size under the bar, the tidied photo and
        the 19 Nov Blonding made on it over it"""
        m = os.environ.get('SALON_MASTERS', '/Users/j/all-worktrees/salon-om-pictures/masters/')
        j = os.path.join(HERE, '../../resources/salon-photos', P.J25_PICTURE)
        if not os.path.exists(m + P.J25):
            raise unittest.SkipTest(f'no masters on this machine ({m}): run on the Studio')
        try:
            import numpy  # noqa: F401
        except ImportError:
            raise unittest.SkipTest('room_check needs numpy and PIL (~/StoryForge/ComfyUI/.venv/bin/python)')
        self.assertGreaterEqual(P.room_check(m + P.J25, j), P.ROOM_BAR)
        self.assertLess(P.room_check(m + '6-shampoo-basins-tidied.jpg', j), P.ROOM_BAR)
        b = 'om-menu-blonding-j25.png'
        self.assertGreaterEqual(P.room_check(m + b, j, P.ROOM_CROP[b]), P.ROOM_BAR)
        if os.path.exists(m + 'om-menu-blonding-25oct.png'):                      # the 19 Nov Blonding on the tidied photo
            self.assertLess(P.room_check(m + 'om-menu-blonding-25oct.png', j, (4950, 500, 7150, 3800)), P.ROOM_BAR)


if __name__ == '__main__':
    unittest.main(verbosity=2)
