# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v10 runner (headless Mixar, free): builds the v9 room (v9_build_render.py, no render flags), adds the v10 stylist
# and close-up camera (v10_scene.py), then on request:
#   --search       try camera poses, print the invented-background share per pose (v10_projection.py), pick nothing
#   --pose JSON    the pose to use (keys r, az, z, lens, aim, stylist), as found by --search
#   --proj         projection proof: frames first / mid / last, photo projected from its own camera, MAGENTA = invented
#                  -> OUT/proj_####.png, and the invented share for EVERY 10th frame -> PROJ_FRAMES line
#   --check        render frames first / mid / last -> OUT/v_####.png ;  --full  render all frames
#   --frames N     360 (15 s, default) or 120 (5 s)
#   --photocam     render frame 1 from cam_photo (OUT/photocam.png), to lay over the photo
#   --shotcheck    run 0_Global/scripts/mixar-shot-check.py (subject PV_Head, camera cam_v10)
#   --v11          the readable look: human mannequins, the basins photo projected on the room, real furniture shapes
# Run: Mixar -b --factory-startup -P v10_build_render.py -- OUT [--frames 120] [--pose '{...}'] [--search|--proj|--check|--full]
import bpy, os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[sys.argv.index('--') + 1:]
OUT = args[0]; os.makedirs(OUT, exist_ok=True)
FRAMES = int(args[args.index('--frames') + 1]) if '--frames' in args else 360
POSE = json.loads(args[args.index('--pose') + 1]) if '--pose' in args else {}
# 1) the v9 room, exactly as committed (the v9 script reads only OUT and --frames from argv; no v9 render flag is passed)
sys.argv = [sys.argv[0], '--', OUT, '--frames', str(FRAMES)]
exec(compile(open(os.path.join(HERE, 'v9_build_render.py')).read(), 'v9_build_render.py', 'exec'), {'__file__': os.path.join(HERE, 'v9_build_render.py'), '__name__': 'v9b'})
L = {'HERE': HERE}
exec(compile(open(os.path.join(HERE, 'v10_projection.py')).read(), 'v10_projection.py', 'exec'), L)
def scene(pose):
    exec(compile(open(os.path.join(HERE, 'v10_scene.py')).read(), 'v10_scene.py', 'exec'), {'POSE': pose, 'FRAMES': FRAMES, '__name__': 'v10'})
sc = bpy.context.scene
def in_frame(cam, pts):
    from bpy_extras.object_utils import world_to_camera_view
    from mathutils import Vector
    return all(0 <= c.x <= 1 and 0 <= c.y <= 1 and c.z > 0 for c in (world_to_camera_view(sc, cam, Vector(p)) for p in pts))
HAIRPTS = [(-2.45, -2.59, 0.80), (-2.30, -2.59, 0.86), (-2.55, -2.60, 0.74)]
mid = (FRAMES + 1) // 2

def hair_seen(cam):
    from mathutils import Vector
    dg = bpy.context.evaluated_depsgraph_get(); O = cam.matrix_world.translation; ok = 0
    for h in HAIRPTS:
        d = Vector(h) - O; hit, loc, n, i, ob, m = sc.ray_cast(dg, O, d.normalized(), distance=d.length - 0.04)
        ok += (not hit) or ob.name in ('PV_Client', 'bw_left_basin')
    return ok / len(HAIRPTS)
def near_share(cam, lim=0.35):
    dg = bpy.context.evaluated_depsgraph_get(); O = cam.matrix_world.translation; near = 0; n = 0
    for i, j, d in L['cam_rays'](cam, 32, 18):
        hit, loc, nn, k, ob, m = sc.ray_cast(dg, O, d, distance=lim); n += 1; near += bool(hit) and ob.name not in ('PV_Client', 'PV_Stylist')
    return near / n
GROUP = {'PV_Head': 'head', 'PV_Hair': 'hair', 'bw_left_basin': 'basin', 'PV_Stylist': 'stylist', 'console_wood': 'console', 'PV_Client': 'body'}
def shares(cam, w=64, h=36):
    """Per-block share of the frame (first hit), and the horizontal extent (0..1) of the subject (head+hair+basin) and stylist."""
    dg = bpy.context.evaluated_depsgraph_get(); O = cam.matrix_world.translation; c = {}; xs = {'subj': [], 'stylist': [], 'console': []}
    for i, j, d in L['cam_rays'](cam, w, h):
        hit, loc, n, k, ob, m = sc.ray_cast(dg, O, d, distance=30.0)
        g = GROUP.get(ob.name, 'room') if hit else 'sky'; c[g] = c.get(g, 0) + 1
        if g in ('head', 'hair', 'basin'): xs['subj'].append((i + 0.5) / w)
        if g in ('stylist', 'console'): xs[g].append((i + 0.5) / w)
    n = w * h; return {k: v / n for k, v in c.items()}, {k: (min(v), sum(v) / len(v), max(v)) if v else None for k, v in xs.items()}
WHY = {}
def framing_ok(s, x):
    def no(k): WHY[k] = WHY.get(k, 0) + 1; return False
    if s.get('hair', 0) < 0.02 or x['subj'] is None: return no('hair')
    if not (1/3 - 0.06 <= x['subj'][1] <= 2/3 + 0.06): return no('centre')     # subject centred: its mean in the centre third
    if not (0.08 <= x['subj'][0] and x['subj'][2] <= 0.92): return no('extent') # head + hair + basin about the centre third
    if not (0.10 <= s.get('head', 0) + s.get('hair', 0) + s.get('basin', 0) <= 0.45): return no('size')
    if not (0.04 <= s.get('stylist', 0) <= 0.25): return no('stylist_size')     # the stylist seen, at the right edge
    if x['stylist'] is None or x['stylist'][0] < 0.58: return no('stylist_x')   # stylist on the right side, never over the head
    return s.get('console', 0) <= 0.04 or (s.get('console', 0) <= 0.12 and x['console'][2] <= 0.16) or no('console')   # a sliver at the LEFT edge
if '--frame' in args:            # v10b: search start poses + a small move (right, closer) that keep the CEO MA's framing every frame
    import itertools
    from mathutils import Vector
    AIMP = Vector(POSE.get('aim', (-2.42, -2.58, 0.86))); res = []; SAMPLE = []
    XS = POSE.get('xs', (-2.00, -1.85, -1.70, -1.55, -1.40, -1.25)); YS = POSE.get('ys', (-3.60, -3.45, -3.30, -3.15, -3.00))
    for x, y, z, lens, stp, mv in itertools.product(XS, YS, POSE.get('zs', (1.00, 1.10, 1.20)), POSE.get('lenses', (35, 50)), POSE.get('stylists', ((-2.42, -2.06, 0.0),)), POSE.get('moves', ((0.10, 0.10, 0.0),))):
        p0 = Vector((x, y, z)); fwd = (AIMP - p0); fwd.z = 0; fwd.normalize()
        right = fwd.cross(Vector((0, 0, 1))).normalized()       # camera right, looking along fwd with z up
        p1 = p0 + right * mv[0] + fwd * mv[1] + Vector((0, 0, mv[2]))   # move: right, closer, up (metres)
        pose = dict(POSE, p0=tuple(p0), p1=tuple(p1), aim=tuple(AIMP), lens=lens, stylist=stp); scene(pose); cam = bpy.data.objects['cam_v10']
        ok = True; worst = 0; rows = []
        for f in (1, mid, FRAMES):
            sc.frame_set(f); s, xx = shares(cam)
            if not framing_ok(s, xx):
                ok = False
                if f == 1 and len(SAMPLE) < 400: SAMPLE.append(((x, y, z, lens), {k: round(v, 3) for k, v in s.items()}, {k: [round(a, 2) for a in v] for k, v in xx.items() if v}))
                break
            cnt, bad, _ = L['projection_frame'](cam, 48, 27, image=False); nn = sum(cnt.values())
            worst = max(worst, (cnt['bg'] + cnt['sky']) / nn); rows.append(dict({k: round(v, 3) for k, v in s.items()}, x={k: [round(a, 2) for a in v] for k, v in xx.items() if v}))
        if ok: res.append((round(worst, 4), [round(v, 3) for v in p0], [round(v, 3) for v in p1], lens, stp, mv, rows[1]))
    res.sort(key=lambda r: r[0])
    print('FRAME_N', len(res), 'WHY', json.dumps(WHY))
    for row in SAMPLE[::12]: print('MISS', json.dumps(row))
    for row in res[:15]: print('FRAME', json.dumps(row))
elif '--grid' in args:
    import itertools
    res = []
    for x, y, z in itertools.product((-2.30, -2.15, -2.00, -1.85, -1.70, -1.55, -1.40, -1.25, -1.10), (-3.55, -3.35, -3.15, -2.95, -2.75), (0.65, 0.80, 0.95, 1.10, 1.30, 1.50)):
        for lens in (35, 50):
            pose = dict(POSE, p0=(x, y, z), p1=(x, y, z), lens=lens); scene(pose); cam = bpy.data.objects['cam_v10']; sc.frame_set(1)
            if not in_frame(cam, HAIRPTS): continue
            seen = hair_seen(cam); near = near_share(cam)
            if seen < 1.0 or near > 0.10: continue
            cnt, bad, _ = L['projection_frame'](cam, 48, 27, image=False); nn = sum(cnt.values())
            res.append((round((cnt['bg'] + cnt['sky']) / nn, 4), round(cnt['own'] / nn, 3), round(cnt['body'] / nn, 2), (x, y, z), lens, sorted(bad.items(), key=lambda kv: -kv[1])[:3]))
    res = [r for r in res if 0.55 <= r[2] <= 0.85]   # a close-up: the two people fill most of the frame, the room is a background band
    res.sort()
    print('GRID_N', len(res))
    for row in res[:20]: print('GRID', json.dumps(row))
elif '--search' in args:
    import itertools
    res = []
    for r, z, (a0, a1), lens in itertools.product((0.6, 0.7, 0.8), (0.92, 1.0, 1.08), ((-85, -70), (-80, -65), (-78, -60), (-75, -55)), (40, 50)):
        pose = dict(POSE, r=(r, r), z=(z, z), az=(a0, a1), lens=lens); scene(pose); cam = bpy.data.objects['cam_v10']
        worst = 0; own = 0; ok_frame = True; seen = 1; near = 0; objs = {}
        for f in (1, (FRAMES + 3) // 4, mid, (3 * FRAMES) // 4, FRAMES):
            sc.frame_set(f)
            if not in_frame(cam, HAIRPTS): ok_frame = False
            seen = min(seen, hair_seen(cam)); near = max(near, near_share(cam))
            cnt, bad, _ = L['projection_frame'](cam, 48, 27, image=False)
            nn = sum(cnt.values()); worst = max(worst, (cnt['bg'] + cnt['sky']) / nn); own = max(own, cnt['own'] / nn)
            for k, vv in bad.items(): objs[k] = objs.get(k, 0) + vv
        res.append((round(worst, 4), round(own, 3), ok_frame, round(seen, 2), round(near, 2), pose, sorted(objs.items(), key=lambda kv: -kv[1])[:3]))
    good = list(res)
    good.sort(key=lambda r: (not r[2], -r[3], r[4], r[0]))
    print('SEARCH_N', len(res), 'usable', len(good))
    for row in good[:12]: print('SEARCH', json.dumps(row))
else:
    scene(POSE); cam = bpy.data.objects['cam_v10']
    if '--v11' in args:          # v11: mannequins, the photo projected on the room, real furniture shapes (v11_look.py)
        exec(compile(open(os.path.join(HERE, 'v11_look.py')).read(), 'v11_look.py', 'exec'), {'PHOTO_PATH': L['PHOTO'], '__name__': 'v11'})
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'salon_om_rooted_previz_v10.blend'))
    if '--photocam' in args:     # orientation check: the scene seen from the photo's own solved camera, beside / over the photo
        pc = bpy.data.objects['cam_photo']; sc.camera = pc; rx, ry = sc.render.resolution_x, sc.render.resolution_y
        sc.render.resolution_x, sc.render.resolution_y = 1280, 854; sc.frame_set(1)
        sc.render.filepath = os.path.join(OUT, 'photocam.png'); bpy.ops.render.render(write_still=True)
        sc.camera = cam; sc.render.resolution_x, sc.render.resolution_y = rx, ry
    if '--shotcheck' in args:    # 0_Global/scripts/mixar-shot-check.py on her head (the subject) and cam_v10, every frame
        SC = os.path.expanduser('~/All/0_Global/scripts/mixar-shot-check.py')
        exec(compile(open(SC).read(), 'mixar-shot-check.py', 'exec'), {'CFG': {'subject': 'PV_Head', 'camera': 'cam_v10', 'frames': [1, FRAMES]}, '__name__': 'chk'})
    if '--proj' in args or '--labels' in args:
        LG = dict(GROUP, wall_basins='wall', PV_Client='her body')
        dg = bpy.context.evaluated_depsgraph_get()
        for f in (1, mid, FRAMES):            # label anchors for the contact sheet: the block's own pixel nearest its centroid
            sc.frame_set(f); O = cam.matrix_world.translation; acc = {}
            for i, j, d in L['cam_rays'](cam, 64, 36):
                hit, loc, n, k, ob, m = sc.ray_cast(dg, O, d, distance=30.0)
                g = LG.get(ob.name) if hit else None
                if g: acc.setdefault(g, []).append((i, j))
            lab = {}
            for g, px in acc.items():
                cx = sum(a for a, b in px) / len(px); cy = sum(b for a, b in px) / len(px)
                inner = [(a, b) for a, b in px if sum((a + da, b + db) in set(px) for da in (-2, 0, 2) for db in (-1, 0, 1)) == 9] or px
                a, b = min(inner, key=lambda q: (q[0] - cx) ** 2 + (q[1] - cy) ** 2)
                lab[g] = [round((a + 0.5) / 64, 3), round((b + 0.5) / 36, 3), round(len(px) / 2304, 3)]
            print('LABELS', f, json.dumps(lab))
    if '--proj' in args:
        rows = []
        for f in range(1, FRAMES + 1, 10 if FRAMES > 120 else 4):
            sc.frame_set(f); cnt, bad, _ = L['projection_frame'](cam, 96, 54, image=False); n = sum(cnt.values())
            rows.append((f, round((cnt['bg'] + cnt['sky']) / n, 4), round(cnt['own'] / n, 3), bad))
        print('PROJ_FRAMES', json.dumps(rows))
        for f in (1, mid, FRAMES):
            sc.frame_set(f); cnt, bad, img = L['projection_frame'](cam, 640, 360)
            L['save_png'](img, os.path.join(OUT, f'proj_{f:04d}.png')); print('PROJ_IMG', f, json.dumps(cnt), json.dumps(bad))
    fr = range(1, FRAMES + 1) if '--full' in args else ((1, mid, FRAMES) if '--check' in args else ())
    for f in fr:
        sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'v_{f:04d}.png'); bpy.ops.render.render(write_still=True)
print('V10_DONE', OUT)
