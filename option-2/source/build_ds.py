import json, re
L = json.load(open('/home/claude/logo/opt3.json'))
def svg(key, cls=''):
    return f'<svg viewBox="{L[key]["vb"]}" aria-hidden="true" focusable="false"{(" class=%s" % cls) if cls else ""}><path fill="currentColor" d="{L[key]["d"]}"/></svg>'
P = L['stacked_parts']
hero = (f'<svg viewBox="{P["vb"]}" aria-hidden="true" focusable="false">'
        f'<path class="mk-salon" d="{P["salon"]}"/><path class="mk-om" pathLength="1" d="{P["om"]}"/></svg>')
src = open('/home/claude/opt2/site/page.src.html').read()
src = src.replace('{{INLINE_SVG}}', svg('inline')).replace('{{STACKED_SVG}}', svg('stacked')).replace('{{HERO_SVG}}', hero)
assert '{{' not in src
assert 'home' not in re.sub(r'<[^>]+>', ' ', src).lower().replace('homepage',''), 'the word "home" must not appear in copy'
open('/home/claude/opt2/site/salon-om-option-2.html', 'w').write(src)          # artifact page (wrapped at publish)
title = re.search(r'<title>.*?</title>\n', src).group(0)
body = src[len(title):]
style = re.match(r'(<style>[\s\S]*?</style>\n)', body).group(1)
rest = body[len(style):]
doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
       + title + '<meta name="description" content="Salon OM: OM is everything. Coaching, healing and growth through earth, water, fire, air and ether.">\n'
       '<meta name="theme-color" content="#15100C">\n'
       '<link rel="icon" type="image/svg+xml" href="brand/salon-om-om-small-forest.svg">\n'
       + style + '</head>\n<body>\n' + rest + '</body>\n</html>\n')
open('/home/claude/opt2/site/index.html', 'w').write(doc)
print(len(src) // 1024, 'KB')
