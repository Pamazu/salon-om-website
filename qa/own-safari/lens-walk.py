#!/usr/bin/env python3
# Task 9b13c4b2 (J 18 Nov 19:5x Z, his yes to "one minute of his own Safari, once, on r5": one window, frames, closed, nothing
# clicked or typed): the lenticular options in J's own desktop Safari. One window at his default size: r3 for a few seconds
# (did his Safari fail on r3, or his screenshot tool? J: "test it yourself"), then each r5 option alone (?only=X) with five
# window frames 0.5 s apart (screencapture -l), then the same window at 1440 wide, two frames each. The page's own report
# (window.__lens: drawn frames, failure) is read once per page. The window is closed and focus given back to the app that had it.
# Usage (on J's Mac): python3 lens-walk.py <older round url, or - for none> <new round url> <outdir>
import json, os, subprocess, sys, time
R3, R5, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(OUT, exist_ok=True)
logf = open(os.path.join(OUT, 'walk.log'), 'w')
def log(s): logf.write(s + '\n'); logf.flush(); print(s, flush=True)
def sh(*a, t=60): r = subprocess.run(a, capture_output=True, text=True, timeout=t); return r.returncode, (r.stdout or '') + (r.stderr or '')
def osa(s): return sh('osascript', '-e', s)[1].strip()
res = {'started': time.strftime('%Y-%m-%dT%H:%M:%S'), 'r3': R3, 'r5': R5, 'pages': []}
res['front'] = osa('tell application "System Events" to get name of first process whose frontmost is true')
stamp = int(time.time())
first = f'{R3}?n={stamp}' if R3 != '-' else f'{R5}?only=A&n={stamp}'
sid = osa(f'tell application "Safari"\nactivate\nmake new document with properties {{URL:"{first}"}}\nreturn id of front window\nend tell')
res['window'] = sid
def setb(w):
    b = osa(f'tell application "Safari" to get bounds of (first window whose id is {sid})').replace(' ', '').split(',')
    if w and len(b) == 4: osa(f'tell application "Safari" to set bounds of (first window whose id is {sid}) to {{{b[0]}, {b[1]}, {int(b[0]) + w}, {b[3]}}}')
    return osa(f'tell application "Safari" to get bounds of (first window whose id is {sid})')
def go(url): osa(f'tell application "Safari" to set URL of current tab of (first window whose id is {sid}) to "{url}"')
def cap(name):
    rc, o = sh('/usr/sbin/screencapture', '-x', '-o', '-t', 'jpg', f'-l{sid}', os.path.join(OUT, name + '.jpg'))
    if rc != 0: log(f'cap {name} rc {rc}: {o[-200:]}')
def report():
    js = 'JSON.stringify({w:innerWidth,h:innerHeight,dpr:devicePixelRatio,lens:window.__lens?window.__lens():null,fails:[...document.querySelectorAll(".stage.broken .fail")].map(f=>f.textContent)})'
    out = osa(f'tell application "Safari" to do JavaScript {json.dumps(js)} in current tab of (first window whose id is {sid})')
    try: return json.loads(out)
    except Exception: return out[:500]
try:
    res['bounds'] = setb(0); log(f'window {sid} bounds {res["bounds"]} (J\'s default size)')
    if R3 != '-':                                   # '-' = no older round to look at this time
        time.sleep(4.0); cap('r3-0'); time.sleep(2.0); cap('r3-1')
        r = report(); res['pages'].append({'page': 'r3', 'report': r}); log('r3 ' + json.dumps(r)[:600])
    for size in ('own', 1440):
        if size == 1440: res['bounds1440'] = setb(1440); log(f'bounds {res["bounds1440"]}')
        for id in 'ABCDE':
            go(f'{R5}?only={id}&n={stamp}'); time.sleep(2.5 if size == 'own' else 1.6)
            t0 = time.time(); n = 5 if size == 'own' else 2; at = []
            for i in range(n):
                time.sleep(max(0, i * 0.5 - (time.time() - t0))); at.append(round(time.time() - t0, 2)); cap(f'r5-{size}-{id}-{i}')
            r = report(); res['pages'].append({'page': f'r5-{size}-{id}', 'at': at, 'report': r}); log(f'r5 {size} {id} at {at} ' + json.dumps(r)[:400])
except Exception as e:
    res['error'] = repr(e); log('error ' + repr(e))
finally:
    osa(f'tell application "Safari" to close (every window whose id is {sid})')
    if res.get('front'): osa(f'tell application "{res["front"]}" to activate')
    res['ended'] = time.strftime('%Y-%m-%dT%H:%M:%S')
    json.dump(res, open(os.path.join(OUT, 'walk.json'), 'w'), indent=1); log('done')
