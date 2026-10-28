# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v10 (J 28 Oct 13:49): the hair close-up from the side, in the v9 room (same solved photo camera and set).
# "I was imagining the camera from the left and the person that is providing the hair service (another tall box) to the
# right of the person laying down on the left seat." Left / right = as seen in the photo (left = toward the left wall, -y).
# Adds: the stylist stand-in (a tall plain box, red = the side she faces) standing to the client's right, between the
#       left basin and the right chair, facing the hair; and cam_v10, close on the client's left at about head height,
#       aimed at the hair in the left basin, moving slowly left to right (a small arc around the head, constant lens).
# Exec'd after v9_photo_match.py (+ grid). Pose parameters come from POSE (globals) so v10_search.py can try candidates.
import bpy, bmesh, math
from mathutils import Vector, Matrix

HAIR = Vector((-2.45, -2.59, 0.80))           # the hair in the left basin (v9 head end, basin fitted to the photo)
P = globals().get('POSE', {})
R0, R1 = P.get('r', (0.62, 0.62))             # distance from the hair, start / end
A0, A1 = P.get('az', (-75.0, -55.0))          # azimuth around the hair, degrees; 0 = +x (toward the room), -90 = -y (left)
Z0, Z1 = P.get('z', (1.02, 1.02))             # camera height, start / end
LENS = P.get('lens', 50.0)
AIM = Vector(P.get('aim', (-2.47, -2.50, 0.78)))   # a little past the hair, toward the stylist's hands
FR = globals().get('FRAMES', 360)

def emat(nm, c):
    m = bpy.data.materials.get(nm) or bpy.data.materials.new(nm); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    e = nt.nodes.new("ShaderNodeEmission"); e.inputs[0].default_value = (*c, 1)
    o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(e.outputs[0], o.inputs[0]); return m

# ---- the stylist: plain box at true size (0.36 deep x 0.46 wide x 1.70 tall), red face toward the client's hair ----
old = bpy.data.objects.get('PV_Stylist')
if old: bpy.data.objects.remove(old, do_unlink=True)
Lb, Wd, Ht = 0.36, 0.46, 1.70
bm = bmesh.new()
v = [bm.verts.new(p) for p in [(-Lb, -Wd/2, 0), (0, -Wd/2, 0), (0, Wd/2, 0), (-Lb, Wd/2, 0), (-Lb, -Wd/2, Ht), (0, -Wd/2, Ht), (0, Wd/2, Ht), (-Lb, Wd/2, Ht)]]
for idx, mi in [((0, 3, 2, 1), 0), ((4, 5, 6, 7), 0), ((0, 1, 5, 4), 0), ((2, 3, 7, 6), 0), ((1, 2, 6, 5), 1), ((0, 4, 7, 3), 2)]:
    f = bm.faces.new([v[i] for i in idx]); f.material_index = mi
me = bpy.data.meshes.new('PV_Stylist'); bm.to_mesh(me); bm.free()
for m in (emat("PV_green", (0.16, 0.50, 0.17)), emat("PV_red", (0.62, 0.07, 0.08)), emat("PV_blue", (0.45, 0.66, 0.92))):
    me.materials.append(m)
st = bpy.data.objects.new('PV_Stylist', me); bpy.context.scene.collection.objects.link(st)
SPOS = Vector(P.get('stylist', (-2.42, -2.06, 0.0)))          # her front face just right of the basin's right rim
st.location = SPOS; st.rotation_euler = (0, 0, math.radians(-90))   # +x (her front, red) turned to face -y: the hair

# ---- cam_v10 ----
old = bpy.data.objects.get('cam_v10')
if old: bpy.data.objects.remove(old, do_unlink=True)
cam = bpy.data.objects.new('cam_v10', bpy.data.cameras.new('cam_v10')); bpy.context.scene.collection.objects.link(cam)
cam.data.lens = LENS; cam.data.sensor_fit = 'HORIZONTAL'; cam.data.sensor_width = 36; cam.data.clip_start = 0.03
cam.data.dof.use_dof = False; cam.rotation_mode = 'QUATERNION'
def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
PS, PE = P.get('p0'), P.get('p1')            # explicit start / end positions (preferred); else the arc above
def pose(t):
    e = ease(t)
    if PS:
        p = Vector(PS).lerp(Vector(PE), e)
    else:
        a = math.radians(A0 + (A1 - A0) * e); r = R0 + (R1 - R0) * e; z = Z0 + (Z1 - Z0) * e
        p = Vector((HAIR.x + r * math.cos(a), HAIR.y + r * math.sin(a), z))
    return p, (AIM - p).to_track_quat('-Z', 'Y')
for f in range(1, FR + 1):
    p, q = pose((f - 1) / (FR - 1)); cam.location = p; cam.rotation_quaternion = q
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_quaternion', frame=f)
sc = bpy.context.scene; sc.camera = cam; sc.frame_start, sc.frame_end = 1, FR
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
print('v10 scene ok: stylist at', tuple(round(x, 2) for x in SPOS), 'cam', PS or (A0, A1, R0, R1, Z0, Z1), '->', PE, 'lens', LENS, 'frames', FR)
