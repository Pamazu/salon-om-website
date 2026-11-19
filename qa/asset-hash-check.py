#!/usr/bin/env python3
"""Every file a built page names carries its content's version (task 01849ea5).

J's Safari showed the pause's old picture after it was replaced (19 Nov): Firebase caches pictures, films and sounds for a
week under the same address, so a changed file must be a new address. This check reads each built page (M, G, S, or the
pages of a commit) and lists every picture, film, sound, font and icon it names; each must carry ?v= equal to the first
10 hex of the sha-256 of the file in option-2.2/site as it is now. Then it proves the mechanism on a scratch folder: a
file whose bytes change gets a new address, a file that does not keeps its own.

    python3 qa/asset-hash-check.py                 # the built pages in this checkout
    python3 qa/asset-hash-check.py --ref a7da0ba   # the pages as committed at a commit (red before the fix)
Exit 1 = a page names a file without its current version.
"""
import os, re, subprocess, sys, tempfile
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.join(REPO, 'option-2.x-shared', 'source'))
import mgs_parts as MP   # noqa: E402

SITE = os.path.join(REPO, 'option-2.2', 'site')
REF = re.compile(r'(?<![\w/.:-])((?:[a-z0-9_-]+/)+[\w.%-]+\.(?:webp|jpe?g|png|svg|gif|avif|mp4|webm|mp3|m4a|wav|woff2?|ttf|otf|css|js|json|vtt))(\?v=[0-9a-f]+)?(?![\w/])')

ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else None
bad = 0
for v in 'mgs':
    path = f'option-2.2-mgs/{v}/index.html'
    doc = subprocess.run(['git', '-C', REPO, 'show', f'{ref}:{path}'], capture_output=True, text=True, check=True).stdout if ref else open(os.path.join(REPO, path)).read()
    refs = [(m.group(1), (m.group(2) or '')[3:]) for m in REF.finditer(doc)]
    wrong = [(name, ver) for name, ver in refs if ver != MP.asset_hash(os.path.join(SITE, name))]
    ends = re.findall(r'\[src\$="[^"]+"\]', doc)
    print(f'{v.upper()}: {len(refs)} file names, {len(refs) - len(wrong)} with their current version, {len(wrong)} without'
          + (f'; {len(ends)} selector(s) matching an address ending' if ends else ''))
    for name, ver in wrong[:4]:
        print(f'    {name}' + (f'?v={ver} (file is now {MP.asset_hash(os.path.join(SITE, name))})' if ver else ' (no version)'))
    pause = [(n, x) for n, x in refs if 'om-pause-guest-2906' in n]
    if pause: print(f'    the pause picture J saw: {pause[0][0]}' + (f'?v={pause[0][1]}' if pause[0][1] else ' (no version: a cached copy stays a week)'))
    bad += bool(wrong) + bool(ends)

# the mechanism itself, on a scratch folder: change one file's bytes, keep another's
with tempfile.TemporaryDirectory() as d:
    os.makedirs(os.path.join(d, 'img'))
    a, b = os.path.join(d, 'img', 'a.webp'), os.path.join(d, 'img', 'b.webp')
    open(a, 'wb').write(b'one'); open(b, 'wb').write(b'same')
    page = '<img src="img/a.webp"><img src="img/b.webp">'
    first = MP.hash_assets(page, d)
    open(a, 'wb').write(b'two')
    second = MP.hash_assets(page, d)
    va = re.findall(r'a\.webp\?v=(\w+)', first + second); vb = re.findall(r'b\.webp\?v=(\w+)', first + second)
    moved, kept = va[0] != va[1], vb[0] == vb[1]
    print(f'mechanism: a changed file gets a new address: {"yes" if moved else "NO"}; an unchanged file keeps its own: {"yes" if kept else "NO"}')
    bad += (not moved) + (not kept)
sys.exit(1 if bad else 0)
