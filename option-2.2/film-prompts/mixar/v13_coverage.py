# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v13, step 1 (J 29 Oct): "is anything in this camera NOT in the photos?" for two camera spots, measured against ALL
# THREE basin photos, not only the one v10-v12 used:
#   6-shampoo-basins-edit.png (camera solved in v9_photo_match.py: cam_photo, f 1072 px)
#   12-shampoo-basins-backbar.jpg and 17-shampoo-basins-wide.jpg (cameras solved HERE from hand-picked pixels of fixed
#   things the set already has: the colour poster's frame, the two top glass shelves' outer ends, the upper cabinets'
#   front bottom edge; homography on the poster for the start, then Levenberg-Marquardt on all points, focal free).
# A camera ray that lands on room geometry no photo camera can see (outside its frame, or hidden behind something that
# was in that photo) is UNSEEN = the video model would invent it. Bodies never count and never hide the room.
#   spot A  between test 4's camera (v11c) and test 5's (v12); J likes test 5's angle more
#   spot B  at the wood two-drawer unit left of the left basin, the unit taken away (J: "treat that drawer ... as
#           removable"): the unit is invisible to the shot camera, but it still hides the wall behind it from the photos
#           (it was there when they were taken)
# Run: Mixar -b --factory-startup -P v13_coverage.py -- OUT      (prints SOLVE, COVER lines; writes OUT/cover_<spot>.png)
import bpy, os, sys, json, math
import numpy as np
from mathutils import Vector, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[sys.argv.index('--') + 1]; os.makedirs(OUT, exist_ok=True)
PHOTOS_DIR = os.path.normpath(os.path.join(HERE, '..', '..', '..', 'resources', 'salon-photos'))
V12 = {"p0": [-2.05, -2.98, 0.98], "p1": [-2.08, -2.971, 0.974], "aim": [-2.38, -2.60, 0.85], "lens": 31}
V11C = {"p0": [-1.30, -3.05, 0.95], "p1": [-1.427, -3.064, 0.95], "aim": [-2.40, -2.55, 0.95], "lens": 30}

# ---- the v12 scene (room, mannequins, cameras), nothing rendered ----
sys.argv = [sys.argv[0], '--', os.path.join(OUT, 'scene'), '--frames', '120', '--pose', json.dumps(V12), '--v11']
G = {'__file__': os.path.join(HERE, 'v10_build_render.py'), '__name__': 'v13cov'}
exec(compile(open(os.path.join(HERE, 'v10_build_render.py')).read(), 'v10_build_render.py', 'exec'), G)
sc = bpy.context.scene; L = G['L']
BODY = set(L['BODY']) | {'PV_Hair', 'PV_Head'}

# ---- solve a photo camera from picked pixels ----
XW = -2.665
PICK = {   # world point (metres, the v9 set) -> pixel (u right, v down), read on a 25 px grid over each photo
    '17-shampoo-basins-wide.jpg': (1280, 854, [
        ((XW, -2.35, 1.63), (395, 137)), ((XW, -1.77, 1.63), (538, 141)),        # poster frame, top corners
        ((XW, -2.35, 0.90), (398, 401)), ((XW, -1.77, 0.90), (537, 386)),        # poster frame, bottom corners
        ((XW + 0.12, -2.95, 1.32), (225, 252)), ((XW + 0.12, -1.15, 1.32), (677, 238)),   # top shelves, outer front ends
        ((XW + 0.35, -2.84, 1.71), (240, 95)), ((XW + 0.35, -1.09, 1.71), (727, 104))]),   # upper cabinets, front bottom
    '12-shampoo-basins-backbar.jpg': (854, 1280, [
        ((XW, -2.35, 1.63), (255, 300)), ((XW, -1.77, 1.63), (414, 300)),
        ((XW, -2.35, 0.90), (258, 597)), ((XW, -1.77, 0.90), (415, 581)),
        ((XW + 0.12, -2.95, 1.32), (65, 431)), ((XW + 0.12, -1.15, 1.32), (572, 407)),
        ((XW + 0.35, -2.84, 1.71), (80, 252)), ((XW + 0.35, -1.09, 1.71), (625, 260))]),
}
def rodrigues(r):
    th = np.linalg.norm(r)
    if th < 1e-12: return np.eye(3)
    k = r / th; Kx = np.array([[0, -k[2], k[1]], [k[2], 0, -k[0]], [-k[1], k[0], 0]])
    return np.eye(3) + math.sin(th) * Kx + (1 - math.cos(th)) * Kx @ Kx
def project(p, R0, X, cx, cy):
    f = math.exp(p[0]); R = rodrigues(p[1:4]) @ R0; Xc = X @ R.T + p[4:7]
    return np.stack([cx + f * Xc[:, 0] / Xc[:, 2], cy + f * Xc[:, 1] / Xc[:, 2]], 1), Xc
def solve(W, H, pts):
    X = np.array([p[0] for p in pts], float); U = np.array([p[1] for p in pts], float); cx, cy = W / 2, H / 2
    A = []                                              # homography: plane x = XW, coords (y, z) -> pixels, poster corners
    for (x, y, z), (u, v) in pts[:4]:
        A += [[y, z, 1, 0, 0, 0, -u * y, -u * z, -u], [0, 0, 0, y, z, 1, -v * y, -v * z, -v]]
    Hm = np.linalg.svd(np.array(A))[2][-1].reshape(3, 3)
    best = None
    for f in np.arange(300, 4000, 2.0):
        Hn = np.linalg.inv(np.array([[f, 0, cx], [0, f, cy], [0, 0, 1]])) @ Hm; h1, h2 = Hn[:, 0], Hn[:, 1]
        c = (h1 @ h2) ** 2 / (h1 @ h1) / (h2 @ h2) + ((np.linalg.norm(h1) - np.linalg.norm(h2)) / (np.linalg.norm(h1) + np.linalg.norm(h2))) ** 2
        if best is None or c < best[0]: best = (c, f, Hn)
    _, f, Hn = best
    lam = 2 / (np.linalg.norm(Hn[:, 0]) + np.linalg.norm(Hn[:, 1]))
    for sgn in (1, -1):
        c1, c2 = sgn * lam * Hn[:, 0], sgn * lam * Hn[:, 1]; R = np.stack([np.cross(c1, c2), c1, c2], 1)
        u_, _, vt = np.linalg.svd(R); R = u_ @ vt; t = sgn * lam * Hn[:, 2] - R @ np.array([XW, 0, 0])
        if (X @ R.T + t)[:, 2].mean() > 0: break
    p = np.array([math.log(f), 0, 0, 0, *t]); R0 = R; mu = 1e-3
    def res(p): return (project(p, R0, X, cx, cy)[0] - U).ravel()
    for _ in range(200):                                # Levenberg-Marquardt, numeric Jacobian
        r = res(p); J = np.zeros((r.size, 7))
        for k in range(7):
            d = np.zeros(7); d[k] = 1e-6; J[:, k] = (res(p + d) - r) / 1e-6
        A_ = J.T @ J; g = J.T @ r
        step = -np.linalg.solve(A_ + mu * np.diag(np.diag(A_) + 1e-9), g)
        if (res(p + step) ** 2).sum() < (r ** 2).sum(): p = p + step; mu = max(mu / 3, 1e-9)
        else: mu *= 4
    R = rodrigues(p[1:4]) @ R0; t = p[4:7]; f = math.exp(p[0]); rms = math.sqrt((res(p) ** 2).mean())
    C = -R.T @ t; right, down, fwd = R[0], R[1], R[2]
    M = Matrix(((right[0], -down[0], -fwd[0], C[0]), (right[1], -down[1], -fwd[1], C[1]), (right[2], -down[2], -fwd[2], C[2]), (0, 0, 0, 1)))
    return f, M, rms, C
CAMS = [('6', bpy.data.objects['cam_photo'].matrix_world.copy(), 1072.0, 1280, 854)]
for name, (W, H, pts) in PICK.items():
    f, M, rms, C = solve(W, H, pts)
    CAMS.append((name.split('-')[0], M, f, W, H))
    print('SOLVE', name, 'f %.0f px' % f, 'centre (%.2f, %.2f, %.2f)' % tuple(C), 'rms %.1f px' % rms)

# ---- visibility ----
CONSOLE = 'console_wood'
def cast_skip(dg, o, d, maxd, skip):
    start = o.copy(); left = maxd; first_body = None
    for _ in range(8):
        hit, loc, n, i, ob, m = sc.ray_cast(dg, start, d, distance=left)
        if not hit: return None, None, first_body
        if ob.name in skip:
            if ob.name in BODY and first_body is None: first_body = ob.name
            step = (loc - start).length + 1e-3; start = loc + d * 1e-3; left -= step; continue
        return loc, ob.name, first_body
    return None, None, first_body
def seen_by(dg, P, M, f, W, H):
    q = M.inverted() @ P
    if q.z >= -1e-4: return False
    u = W / 2 + f * q.x / -q.z; v = H / 2 - f * q.y / -q.z
    if not (0 <= u < W and 0 <= v < H): return False
    O = M.translation; d = P - O; dist = d.length; d.normalize()
    loc, name, _ = cast_skip(dg, O, d, dist + 0.05, BODY)          # bodies were not in the photos; the console WAS
    return loc is None or (loc - O).length >= dist - 0.015
def cover(cam, w, h, drawer_removed, image=False):
    dg = bpy.context.evaluated_depsgraph_get(); O = cam.matrix_world.translation
    skip = BODY | ({CONSOLE} if drawer_removed else set())
    cnt = {'seen': 0, 'unseen': 0, 'body': 0, 'nothing': 0}; by = {}; img = np.zeros((h, w, 3), np.float32) if image else None
    for i, j, d in L['cam_rays'](cam, w, h):
        loc, name, body = cast_skip(dg, O, d, 30.0, skip)
        if body: k = 'body'; c = (0.35, 0.6, 0.35)
        elif loc is None: k = 'nothing'; c = (1, 0, 1)
        elif any(seen_by(dg, loc, M, f, W, H) for _, M, f, W, H in CAMS): k = 'seen'; c = (0.82, 0.80, 0.76)
        else: k = 'unseen'; c = (1, 0, 1); by[name] = by.get(name, 0) + 1
        cnt[k] += 1
        if image: img[j, i] = c
    return cnt, by, img

# ---- the two spots, each over its whole 5 s move ----
def lerp(a, b, s): return [x + (y - x) * s for x, y in zip(a, b)]
S = 0.6                                                    # 60 % of the way from test 4 toward test 5 (J prefers test 5)
SPOTS = {
    'A_between': (dict(p0=lerp(V11C['p0'], V12['p0'], S), p1=lerp(V11C['p1'], V12['p1'], S), aim=lerp(V11C['aim'], V12['aim'], S),
                       lens=V11C['lens'] + (V12['lens'] - V11C['lens']) * S), False),
    'B_drawer': (dict(p0=[-2.42, -3.12, 0.98], p1=[-2.45, -3.111, 0.974], aim=[-2.36, -2.60, 0.86], lens=31), True),
    'v12_ref': (V12, False),
}
cam = bpy.data.objects.new('cam_v13cov', bpy.data.cameras.new('cam_v13cov')); sc.collection.objects.link(cam)
cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36; cam.data.clip_start = 0.03; cam.rotation_mode = 'QUATERNION'
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
def place(P, t):
    p = Vector(P['p0']).lerp(Vector(P['p1']), ease(t)); cam.location = p
    cam.rotation_quaternion = (Vector(P['aim']) - p).to_track_quat('-Z', 'Y'); cam.data.lens = P['lens']; bpy.context.view_layer.update()
from bpy_extras.object_utils import world_to_camera_view
for name, (P, drawer) in SPOTS.items():
    rows = []
    for fr in list(range(1, 121, 10)) + [120]:
        place(P, (fr - 1) / 119); cnt, by, _ = cover(cam, 96, 54, drawer); n = sum(cnt.values())
        rows.append((fr, round(100 * (cnt['unseen'] + cnt['nothing']) / n, 1), round(100 * cnt['nothing'] / n, 1), by))
    place(P, 0.5); hb = [world_to_camera_view(sc, cam, bpy.data.objects['PV_Head'].matrix_world @ Vector(c)) for c in bpy.data.objects['PV_Head'].bound_box]
    head_in = all(0 <= q.x <= 1 and 0 <= q.y <= 1 for q in hb)
    cnt, by, img = cover(cam, 320, 180, drawer, image=True); L['save_png'](img, os.path.join(OUT, f'cover_{name}.png'))
    if drawer: bpy.data.objects[CONSOLE].hide_render = True
    sc.camera = cam; sc.render.filepath = os.path.join(OUT, f'look_{name}.png'); bpy.ops.render.render(write_still=True)
    bpy.data.objects[CONSOLE].hide_render = False
    v = [r[1] for r in rows]; tot = {}
    for r in rows:
        for k, c in r[3].items(): tot[k] = tot.get(k, 0) + c
    print('COVER', name, json.dumps({'pose': P, 'drawer_removed': drawer, 'unseen_min': min(v), 'unseen_max': max(v),
          'unseen_mean': round(sum(v) / len(v), 1), 'no_geometry_max': max(r[2] for r in rows), 'head_in_frame_mid': head_in,
          'unseen_by_object': sorted(tot.items(), key=lambda kv: -kv[1])[:6]}))
print('V13_COVER_DONE', OUT)
