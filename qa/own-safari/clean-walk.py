#!/usr/bin/env python3
# Task b36dde1f (J 17 Nov 08:40 Z: "check in my macbook safari"): a clean person's walk in J's own Safari, live M.
# No page JavaScript while the page lives (AppleScript's "do JavaScript" may count as a user action and unlock media),
# real wheel scrolls (peekaboo; a wheel is no user activation, as for a person scrolling), window frames 1.5 s and 6 s
# after each stop (peekaboo see --window-id). After the walk ONE read of every film's played ranges. Window closed,
# focus given back to the app that had it.
import json, os, subprocess, sys, time
PK = '/opt/homebrew/bin/peekaboo'
V = sys.argv[1] if len(sys.argv) > 1 else 'm'
STOPS, TICKS = int(os.environ.get('STOPS', '24')), os.environ.get('TICKS', '10')
OUT = f'/Users/j/tmp/2ff6066f/b36dde1f-clean-{V}'
os.makedirs(OUT + '/frames', exist_ok=True)
logf = open(OUT + '/walk.log', 'w')
def log(s): logf.write(s + '\n'); logf.flush(); print(s, flush=True)
def sh(*a, t=60): r = subprocess.run(a, capture_output=True, text=True, timeout=t); return r.returncode, (r.stdout or '') + (r.stderr or '')
def osa(s, lang=None):
    a = ['osascript'] + (['-l', lang] if lang else []) + ['-e', s]; return sh(*a)[1].strip()
res = {'version': V, 'started': time.strftime('%Y-%m-%dT%H:%M:%S'), 'stops': []}
res['front'] = osa('tell application "System Events" to get name of first process whose frontmost is true')
url = f'https://salon-om-2-2-{V}.web.app/?clean={int(time.time())}'
sid = osa(f'tell application "Safari"\nactivate\nmake new document with properties {{URL:"{url}"}}\nreturn id of front window\nend tell')
res['safariWindow'] = sid
time.sleep(1.0)
rc, wl = sh(PK, 'window', 'list', '--app', 'Safari', '--json')
wid = None
try:
    j = json.loads(wl); ws = []
    def walk(o):
        if isinstance(o, dict):
            if 'window_id' in o: ws.append(o)
            for x in o.values(): walk(x)
        elif isinstance(o, list):
            for x in o: walk(x)
    walk(j)
    res['windows'] = [{k: w.get(k) for k in ('window_id', 'title', 'window_title', 'index', 'window_index', 'is_on_screen') if k in w} for w in ws]
    pick = [w for w in ws if 'salon' in json.dumps(w).lower()] or ws
    wid = str(pick[0]['window_id'])
except Exception as e:
    log(f'window list: {e} {wl[:300]}')
res['cgWindow'] = wid
log(f'safari window {sid} cg {wid} windows {res.get("windows")}')
def cap(name):
    t = time.time(); rc, o = sh('/usr/sbin/screencapture', '-x', '-o', '-t', 'jpg', f'-l{sid}', f'{OUT}/frames/{name}.jpg')
    if rc != 0: log(f'cap {name} rc {rc}: {o[-200:]}')
    return round(time.time() - t, 2)
try:
    for k in range(STOPS):
        if k > 0:
            rc, o = sh(PK, 'scroll', '--window-id', wid, '--direction', 'down', '--amount', TICKS, '--foreground')
            if rc != 0: log(f'scroll {k} rc {rc}: {o[-200:]}'); break
        t0 = time.time()
        time.sleep(1.5); ta = time.time() - t0; ca = cap(f'{V}-{k:02d}-a')
        time.sleep(max(0, 6 - (time.time() - t0))); tb = time.time() - t0; cb = cap(f'{V}-{k:02d}-b')
        res['stops'].append({'k': k, 'a': round(ta, 2), 'b': round(tb, 2), 'capA': ca, 'capB': cb})
        log(f'stop {k} frames at {ta:.1f}s and {tb:.1f}s (capture {ca}s, {cb}s)')
    # after the walk: one read of every film (it cannot change what already happened)
    js = ("JSON.stringify({y:Math.round(scrollY),h:document.documentElement.scrollHeight,vh:innerHeight,films:[...document.querySelectorAll('video')].map(v=>{const r=v.getBoundingClientRect();"
          "return {src:(v.currentSrc||v.getAttribute('data-src')||'').split('/').pop(),t:Math.round(v.currentTime*100)/100,paused:v.paused,ready:v.readyState,on:v.classList.contains('is-on'),"
          "played:[...Array(v.played.length).keys()].map(i=>[Math.round(v.played.start(i)*10)/10,Math.round(v.played.end(i)*10)/10]),top:Math.round(r.top+scrollY)}})})")
    out = osa(f'Application("Safari").doJavaScript({json.dumps(js)}, {{in: Application("Safari").windows.byId({sid}).currentTab}})', 'JavaScript')
    try: res['after'] = json.loads(out)
    except Exception: res['after'] = out[:2000]
    log('after ' + json.dumps(res['after'])[:3000])
except Exception as e:
    res['error'] = repr(e); log('error ' + repr(e))
finally:
    osa(f'tell application "Safari" to close (every window whose id is {sid})')
    if res.get('front'): osa(f'tell application "{res["front"]}" to activate')
    res['ended'] = time.strftime('%Y-%m-%dT%H:%M:%S')
    json.dump(res, open(OUT + '/walk.json', 'w'), indent=1)
    log('DONE')
