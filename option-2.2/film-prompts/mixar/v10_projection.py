# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v10: "is anything in this camera NOT in the photo?" (J 28 Oct 13:49: "ensure that what is in the camera is not
# something the video model would invent so it should be what the picture shows").
# The basins photo is projected from its solved camera (cam_photo, v9_photo_match.py) onto the room geometry. A camera ray
# that lands on a surface the photo camera cannot see (outside its frame, or hidden behind another object) is MAGENTA.
# The client and the stylist are bodies the video model draws itself: they never count, and they never hide the room
# from the photo camera (they are not in the photo).
# Library: exec'd by v10_build_render.py inside Mixar (bpy + numpy). Pure functions over the open scene.
import bpy, math
import numpy as np
from mathutils import Vector

PHOTO = '/Users/j/all-worktrees/salon-om-previz-v9/resources/salon-photos/6-shampoo-basins-edit.png'
BODY = {'PV_Client', 'PV_Stylist', 'bw_left_pillow'}   # + her cushion: under her in the film, not in the photo's view of the wall
OWN = ('bw_left_',)                       # the client's own chair and basin: reported apart from the background
PW, PH, PF, PC = 1280, 854, 1072.0, (640.0, 427.0)

_img = None
def photo_pixels():
    global _img
    if _img is None:
        im = bpy.data.images.load(PHOTO, check_existing=True)
        a = np.array(im.pixels[:], dtype=np.float32).reshape(im.size[1], im.size[0], 4)[::-1, :, :3]   # top row first
        _img = a
    return _img

def _cast(dg, o, d, dist):
    return bpy.context.scene.ray_cast(dg, o, d, distance=dist)

def first_room_hit(dg, o, d, maxd=30.0):
    """First hit along a ray, passing through the bodies. Returns (loc, obj name, hit_body_first)."""
    body_first = None; start = o.copy(); left = maxd
    for _ in range(6):
        hit, loc, n, i, ob, m = _cast(dg, start, d, left)
        if not hit: return None, None, body_first
        if ob.name in BODY:
            if body_first is None: body_first = ob.name
            step = (loc - start).length + 1e-3; start = loc + d * 1e-3; left -= step; continue
        return loc, ob.name, body_first
    return None, None, body_first

def photo_sees(dg, P):
    """(visible, u, v): P lies inside the photo frame and nothing but the bodies stands between it and the photo camera."""
    cam = bpy.data.objects['cam_photo']; O = cam.matrix_world.translation
    q = cam.matrix_world.inverted() @ P
    if q.z >= -1e-4: return False, 0, 0
    u = PC[0] + PF * q.x / -q.z; v = PC[1] - PF * q.y / -q.z
    if not (0 <= u < PW and 0 <= v < PH): return False, u, v
    d = P - O; dist = d.length; d.normalize()
    loc, name, _ = first_room_hit(dg, O, d, dist + 0.05)
    if loc is None or (loc - O).length >= dist - 0.015: return True, u, v
    return False, u, v

def cam_rays(cam, w, h):
    """World-space ray directions for a w x h grid through camera `cam` (horizontal sensor fit, 16:9)."""
    sw = cam.data.sensor_width; L = cam.data.lens; R = cam.matrix_world.to_3x3()
    out = []
    for j in range(h):
        for i in range(w):
            x = ((i + 0.5) / w - 0.5) * sw / L
            y = (0.5 - (j + 0.5) / h) * sw * h / w / L
            out.append((i, j, (R @ Vector((x, y, -1.0))).normalized()))
    return out

def projection_frame(cam, w, h, image=True):
    """Classify every ray: 'body', 'own' (client's own chair/basin, unseen), 'bg' (room, unseen = invented), 'ok' (seen).
    Returns counts and, if image, an (h, w, 3) array: photo colour where seen, MAGENTA where invented,
    ORANGE where only her own chair/basin is unseen, grey for the bodies."""
    dg = bpy.context.evaluated_depsgraph_get(); O = cam.matrix_world.translation
    px = photo_pixels() if image else None
    img = np.zeros((h, w, 3), np.float32) if image else None
    cnt = {'ok': 0, 'bg': 0, 'own': 0, 'body': 0, 'sky': 0}; bad_objs = {}
    for i, j, d in cam_rays(cam, w, h):
        hit, loc, n, k, ob, m = _cast(dg, O, d, 30.0)
        if not hit: cnt['sky'] += 1; c = (1, 0, 1); kind = 'sky'
        elif ob.name in BODY:
            cnt['body'] += 1; kind = 'body'; c = (0.55, 0.55, 0.55) if ob.name == 'PV_Stylist' else (0.35, 0.6, 0.35)
        else:
            vis, u, v = photo_sees(dg, loc)
            if vis:
                cnt['ok'] += 1; kind = 'ok'; c = px[int(v), int(u)] if image else None
            elif ob.name.startswith(OWN):
                cnt['own'] += 1; kind = 'own'; c = (1.0, 0.55, 0.0)
            else:
                cnt['bg'] += 1; kind = 'bg'; c = (1, 0, 1); bad_objs[ob.name] = bad_objs.get(ob.name, 0) + 1
        if image: img[j, i] = c
    return cnt, bad_objs, img

def save_png(arr, path):
    h, w, _ = arr.shape
    im = bpy.data.images.new("v10_proj_out", w, h, alpha=False)
    rgba = np.ones((h, w, 4), np.float32); rgba[:, :, :3] = arr[::-1]
    im.pixels[:] = rgba.ravel(); im.filepath_raw = path; im.file_format = 'PNG'; im.save()
    bpy.data.images.remove(im)
