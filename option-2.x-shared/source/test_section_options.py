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


if __name__ == '__main__':
    unittest.main()
