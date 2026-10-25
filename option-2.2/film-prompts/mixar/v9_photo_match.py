# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted film previz v9 (task cc1fec01, J 25 Oct 18:22 + 18:33): the set rebuilt in the CAMERA OF THE REAL PHOTO
# resources/salon-photos/6-shampoo-basins-edit.png (1280 x 854), the client stand-in in the LEFT backwash chair, and a
# slow left-to-right PAN from the photo's own camera position, so every frame shows only what the photo shows.
#
# How the camera was solved (no EXIF in the photo): straight-line detection (OpenCV LSD) -> three vanishing points
#   back-wall horizontals (-381, 512) px, left-wall horizontals (1774, 524) px, verticals (720, -10855) px.
#   Their orthocentre lands at (657, 416), 20 px from the image centre, so the centre is used: focal 1072 px
#   = 30.15 mm on a 36 mm-wide sensor; pitch +5.1 deg, the two walls meet at 90.0 deg (check passed).
# Scale: the colour Aveda poster's frame read as 0.58 x 0.73 m (a 22 x 28 in poster) at camera height 0.47 m;
#   ottomans then measure 0.37 m tall and 0.35 m across, the chair seat 0.44 m, arm 0.66 m, ceiling 2.86 m.
# World: metres, camera at (0, 0, 0.47); basins wall = plane x = -2.665; left wall = plane y = -4.681; z up.
# Run through Mixar (free): mixar-run.sh v9_photo_match.py  (inside mixar-lock.sh), then previz_grid_set.py.
import bpy, math
from mathutils import Matrix, Vector

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
col = bpy.data.collections.get("Set") or bpy.data.collections.new("Set")
if col.name not in [c.name for c in sc.collection.children]:
    sc.collection.children.link(col)

def box(name, x0, x1, y0, y1, z0, z1, rot_z=0.0):
    bpy.ops.mesh.primitive_cube_add(size=1, location=((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2))
    o = bpy.context.object; o.name = name; o.scale = (abs(x1 - x0), abs(y1 - y0), abs(z1 - z0)); o.rotation_euler.z = rot_z
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o); return o
def cyl(name, x, y, r, z0, z1):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=z1 - z0, location=(x, y, (z0 + z1) / 2), vertices=32)
    o = bpy.context.object; o.name = name
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o); return o

XW, YL, ZC = -2.665, -4.681, 2.86
# ---- room shell (only what the photo shows; the rest is never in frame) ----
box("floor", -2.7, 0.6, -4.7, 0.6, -0.02, 0.0)
box("wall_basins", XW - 0.1, XW, -4.7, 0.6, 0.0, ZC)
box("wall_left", -2.7, 0.6, YL - 0.1, YL, 0.0, ZC)
box("ceiling", -2.7, 0.6, -4.7, 0.6, ZC, ZC + 0.05)
box("baseboard", XW, XW + 0.015, -4.68, 0.6, 0.0, 0.134)
for i, (y, z) in enumerate(((-4.35, 2.33), (-4.45, 2.62), (-4.25, 2.75))):      # ceiling pipes along the left wall
    bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=2.4, location=(-1.6, y, z), rotation=(0, math.pi / 2, 0), vertices=24)
    o = bpy.context.object; o.name = f"pipe_{i}"
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o)
# ---- left wall: bamboo blind, black-and-white Aveda poster ----
box("blind", -1.83, 0.6, YL, YL + 0.04, 0.30, 2.34)
box("blind_base_dark", -1.83, 0.6, YL, YL + 0.20, 0.0, 0.30)
box("poster_bw", -2.62, -2.12, YL, YL + 0.03, 1.10, 1.91)
# ---- basins wall: mirror, small wood console, upper cabinets, colour poster, glass shelves + bottles ----
box("mirror_frame", XW, XW + 0.06, -4.34, -3.55, 0.75, 2.07)
box("console_wood", XW, XW + 0.40, -3.48, -2.90, 0.0, 1.06)     # ends at the left basin, which hides its right end in the photo
box("cabinets_upper", XW, XW + 0.35, -2.84, -1.09, 1.71, 2.30)     # depth 0.35 m from its side edge; right end at photo x 1045
box("poster_colour", XW, XW + 0.03, -2.35, -1.77, 0.90, 1.63)
box("shelf_L_top", XW, XW + 0.12, -2.95, -2.32, 1.32, 1.34); box("bottles_L_top", XW, XW + 0.09, -2.92, -2.35, 1.34, 1.62)
box("shelf_L_low", XW, XW + 0.12, -2.83, -2.41, 0.95, 0.97); box("bottles_L_low", XW, XW + 0.09, -2.80, -2.44, 0.97, 1.26)
box("shelf_R_top", XW, XW + 0.12, -1.72, -1.15, 1.32, 1.34); box("bottles_R_top", XW, XW + 0.09, -1.69, -1.18, 1.34, 1.63)
box("shelf_R_low", XW, XW + 0.12, -1.65, -1.29, 0.95, 0.97); box("bottles_R_low", XW, XW + 0.09, -1.62, -1.32, 0.97, 1.23)
box("shelf_black_small", XW, XW + 0.10, -1.28, -1.04, 0.69, 0.71)
box("cabinet_wood_right", XW, XW + 0.50, -0.78, -0.55, 0.0, 1.50)   # the wood edge at photo x 1200-1280
# ---- two backwash units, basins at the wall, chairs facing +x (toward the camera side) ----
def backwash(p, yc):       # sizes fitted to the photo's own edges (CEO MA QA 25 Oct: the first blocks rose ~100 px too high)
    box(p + "_basin", XW + 0.05, XW + 0.45, yc - 0.24, yc + 0.24, 0.66, 0.88)
    box(p + "_pedestal", XW, XW + 0.30, yc - 0.12, yc + 0.12, 0.0, 0.66)
    box(p + "_base", -2.25, -1.50, yc - 0.25, yc + 0.25, 0.0, 0.30)
    box(p + "_seat", -2.10, -1.55, yc - 0.28, yc + 0.28, 0.30, 0.44)
    box(p + "_arm_a", -2.10, -1.52, yc - 0.36, yc - 0.27, 0.30, 0.64)
    box(p + "_arm_b", -2.10, -1.52, yc + 0.27, yc + 0.36, 0.30, 0.64)
    box(p + "_back", -2.25, -2.10, yc - 0.28, yc + 0.28, 0.40, 0.72)
    box(p + "_pillow", -2.20, -2.08, yc - 0.20, yc + 0.20, 0.62, 0.86)
backwash("bw_left", -2.49)       # THE CLIENT'S CHAIR (J: "on the seat on the left")
backwash("bw_right", -1.37)
# basins and pillows re-solved against the photo's pixel edges (fit to within 2-21 px; CEO MA QA 25 Oct item 2)
FIT = {"bw_right_basin": [-2.545, -2.425, -1.71, -1.23, 0.66, 0.85], "bw_left_basin": [-2.565, -2.305, -2.83, -2.35, 0.68, 0.85], "bw_right_pillow": [-1.82, -1.74, -1.68, -1.26, 0.48, 0.76], "bw_left_pillow": [-1.84, -1.78, -2.7, -2.28, 0.6, 0.78]}
for n, (x0, x1, y0, y1, z0, z1) in FIT.items():
    bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True); box(n, x0, x1, y0, y1, z0, z1)
for side, yc in (("bw_left", -2.49), ("bw_right", -1.37)):      # the backrest sits right behind its pillow
    px1 = FIT[side + "_pillow"][0]
    bpy.data.objects.remove(bpy.data.objects[side + "_back"], do_unlink=True); box(side + "_back", px1 - 0.14, px1, yc - 0.28, yc + 0.28, 0.40, 0.70)
bpy.data.objects.remove(bpy.data.objects["bw_left_pillow"], do_unlink=True)   # the client lies on the left chair: its cushion is under her back, not in front of her
cyl("ottoman_left", -1.24, -2.77, 0.18, 0.0, 0.375)
cyl("ottoman_front", -1.25, -1.60, 0.175, 0.0, 0.375)
# ---- styling chair at the far left, and the out-of-focus styling chair in the right foreground ----
cyl("styling_mat", -1.55, -3.95, 0.45, 0.0, 0.01)
cyl("styling_post", -1.60, -3.95, 0.05, 0.0, 0.45)
box("styling_seat", -1.90, -1.30, -4.25, -3.65, 0.45, 0.58)
box("styling_back", -1.95, -1.85, -4.20, -3.70, 0.58, 1.05)
box("fg_chair", -0.86, -0.70, -0.27, -0.05, 0.22, 0.88)            # the blurred chair: its left edge on the photo x 1210-1215 rays, 0.9 m out

# ---- the stand-in: the client reclining in the LEFT chair. Plain box, true size; red = the side her face looks at (up) ----
import bmesh
L, W, T = 1.25, 0.42, 0.24      # head-in-bowl to feet-on-ottoman, measured in the set
bm = bmesh.new()
v = [bm.verts.new(p) for p in [(0, -W/2, 0), (L, -W/2, 0), (L, W/2, 0), (0, W/2, 0), (0, -W/2, T), (L, -W/2, T), (L, W/2, T), (0, W/2, T)]]
for idx, mi in [((0, 3, 2, 1), 2), ((4, 5, 6, 7), 1), ((0, 1, 5, 4), 0), ((2, 3, 7, 6), 0), ((1, 2, 6, 5), 0), ((0, 4, 7, 3), 0)]:
    f = bm.faces.new([v[i] for i in idx]); f.material_index = mi
me = bpy.data.meshes.new("PV_Client"); bm.to_mesh(me); bm.free()
def emat(nm, c):
    m = bpy.data.materials.get(nm) or bpy.data.materials.new(nm); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (*c, 1)
    o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(e.outputs[0], o.inputs[0]); return m
for m in (emat("PV_green", (0.16, 0.50, 0.17)), emat("PV_red", (0.62, 0.07, 0.08)), emat("PV_blue", (0.45, 0.66, 0.92))):
    me.materials.append(m)
cl = bpy.data.objects.new("PV_Client", me); sc.collection.objects.link(cl)
head = Vector((-2.42, -2.59, 0.80)); feet = Vector((-1.15, -2.62, 0.40))      # head in the left bowl, feet on the ottoman
d = (feet - head).normalized()
cl.matrix_world = Matrix.Translation(head) @ d.to_track_quat('X', 'Z').to_matrix().to_4x4() @ Matrix.Translation((0, 0, -T / 2))

# ---- cameras: Blender camera looks down -Z with +Y up; columns = the photo camera's right, up, back axes ----
R = Matrix(((-0.725212, -0.066125, -0.685343), (0.688497, -0.060558, -0.722706), (0.006286, -0.995972, 0.089444)))  # cam(x right, y down, z fwd) -> world
B = Matrix(((R[0][0], -R[0][1], -R[0][2]), (R[1][0], -R[1][1], -R[1][2]), (R[2][0], -R[2][1], -R[2][2])))
POS = Vector((0.0, 0.0, 0.47))
def make_cam(name, lens):
    c = bpy.data.objects.new(name, bpy.data.cameras.new(name)); sc.collection.objects.link(c)
    c.data.lens = lens; c.data.sensor_fit = 'HORIZONTAL'; c.data.sensor_width = 36; c.data.clip_start = 0.05; c.data.dof.use_dof = False
    c.rotation_mode = 'QUATERNION'; c.matrix_world = Matrix.Translation(POS) @ B.to_4x4(); return c
photo = make_cam("cam_photo", 30.15)                  # the photo itself (1280 x 854): the overlay check
pan = make_cam("cam_pan", 42.0)                       # the film (16:9): a 42 mm window panning inside the photo
A0, A1 = math.radians(7.0), math.radians(-0.5)       # 7.0 deg left -> 0.5 deg right: every 16:9 frame inside the photo (limit 7.2)
                                                      # AND the client fully in frame (her feet reach the left edge at -1.0; shot check SUBJECT_OUT 198-360 at -7, 255-360 at -3)
FR = 360                                              # 15 s at 24 fps
def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
for f in range(1, FR + 1):
    a = A0 + (A1 - A0) * ease((f - 1) / (FR - 1))     # left -> right, one continuous move, soft start and stop
    pan.matrix_world = Matrix.Translation(POS) @ (Matrix.Rotation(a, 3, 'Z') @ B).to_4x4()
    pan.keyframe_insert('rotation_quaternion', frame=f); pan.keyframe_insert('location', frame=f)
sc.camera = pan; sc.frame_start, sc.frame_end = 1, FR; sc.render.fps = 24
sc.render.resolution_x, sc.render.resolution_y, sc.render.resolution_percentage = 1280, 720, 100
print("v9 set ok:", len(col.objects), "set objects; cams cam_photo 30.15mm, cam_pan 42mm +7 -> -0.5 deg over", FR, "frames")
