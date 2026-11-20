"""section_options.pictures (task 279db527): a picture's options mark every copy of it, and a picture in two sections is refused.
Run: python3 -m unittest test_section_options (from option-2.x-shared/source)."""
import unittest
import section_options as SO

OPT = lambda k: dict(name=k, live='Today', options=[dict(key='x', label='X', img=k + '-x.webp', alt='x')])


class Pictures(unittest.TestCase):
    def page(self, pics_a, pics_b=()):
        img = lambda f: f'<img class="i" src="img/{f}" alt="">'
        return ('<main id="main-salon"><section class="s" id="a">' + ''.join(map(img, pics_a)) + '</section>'
                '<section class="s" id="b">' + ''.join(map(img, pics_b)) + '</section></main>')

    def test_three_pictures_in_one_section(self):
        # task b1dd24c9: three service pictures in the menu, the last with two copies (its panel and its phone row). Each
        # picture before it gains data-pic, which moved its copies past the next section's start: the block read the second
        # copy as section b's and refused the build
        body = self.page(['one.webp', 'two.webp', 'three.webp', 'one.webp', 'two.webp', 'three.webp'])
        out = SO.pictures(body, {k: OPT(k.split('.')[0]) for k in ('one.webp', 'two.webp', 'three.webp')})
        for k in ('one.webp', 'two.webp', 'three.webp'):
            self.assertEqual(out.count(f'data-pic="{k}"'), 2, k)

    def test_a_picture_in_two_sections_is_refused(self):
        body = self.page(['one.webp'], ['one.webp'])
        with self.assertRaises(AssertionError):
            SO.pictures(body, {'one.webp': OPT('one')})


    def test_section_swaps_only_its_own_section(self):
        # task f748d06c: a step's photo shows in the salon's step and again in Inner Work's twin step (c-arrive), and on M the
        # basins photo once more in Inner Work's door; each world's step declares its own options under its own key
        body = ('<main id="main-salon"><section id="arrive"><img src="img/a.webp"></section></main>'
                '<main><section id="c-arrive"><img src="img/a.webp"></section><section id="c-door"><img src="img/a.webp"></section></main>')
        out = SO.pictures(body, {'step-a': dict(OPT('a'), file='a.webp', section='arrive'),
                                 'c-step-a': dict(OPT('a'), file='a.webp', section='c-arrive')})
        self.assertIn('<section id="arrive"><img data-pic="step-a" src="img/a.webp">', out)
        self.assertIn('<section id="c-arrive"><img data-pic="c-step-a" src="img/a.webp">', out)
        self.assertIn('<section id="c-door"><img src="img/a.webp">', out)
        self.assertEqual(out.count('data-pic-for="step-a"'), 2)
        self.assertEqual(out.count('data-pic-for="c-step-a"'), 2)

    def test_only_swaps_the_one_copy_it_names(self):
        # task b1dd24c9: Finishing Touches' options swap the tall desktop panel (mn__img) only; its phone row (mn__rph) keeps
        # today's picture, whose 3:2 already shows it whole
        body = ('<main id="main-salon"><section class="s" id="a"><img class="mn__img is-on" src="img/ft.webp" alt="">'
                '<figure class="mn__rph"><img src="img/ft.webp" alt=""></figure></section></main>')
        out = SO.pictures(body, {'ft.webp': dict(OPT('ft'), only='mn__img')})
        self.assertEqual(out.count('data-pic="ft.webp"'), 1)
        self.assertIn('<img data-pic="ft.webp" class="mn__img', out)


if __name__ == '__main__':
    unittest.main()
