# SPDX-License-Identifier: GPL-3.0-or-later
# v5 (J 19:55): a real backwash bowl whose rim never cuts through her head.
# A deeper oval bowl with a wide, rounded U-shaped neck cradle in the front rim; her neck rests IN the cradle,
# her head lies inside the bowl. The head is moved until the bowl and the head share no faces (measured, BVH).
import bpy, bmesh, math, os, sys
from mathutils import Vector
from mathutils.bvhtree import BVHTree
args = sys.argv[sys.argv.index('--') + 1:]
OUT = args[0]; CHECK = '--check' in args; os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene; M = bpy.data.materials
BX, BY, BZ = 2.85, 3.64, 0.92          # rim centre
AX, AY, DEPTH = 0.31, 0.26, 0.21       # bowl half-width, half-length, depth (62 x 52 x 21 cm)

def kill(prefix):
    for o in [o for o in bpy.data.objects if o.name.startswith(prefix)]: bpy.data.objects.remove(o, do_unlink=True)
for p in ('bw_front_basin', 'guest_head', 'guest_hair', 'guest_neck'): kill(p)
def activate(o):
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o

# ---- the bowl: half-ellipsoid shell, rounded rim, built at the origin then placed by measurement ----
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=72, ring_count=36, location=(0, 0, 0))
bowl = bpy.context.object; bowl.name = 'bw_front_basin'
bm = bmesh.new(); bm.from_mesh(bowl.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 1e-4], context='VERTS')
for v in bm.verts: v.co = Vector((v.co.x * AX, v.co.y * AY, v.co.z * DEPTH))
bm.to_mesh(bowl.data); bm.free()
activate(bowl)
s = bowl.modifiers.new('wall', 'SOLIDIFY'); s.thickness = 0.03; s.offset = 1; bpy.ops.object.modifier_apply(modifier='wall')
# the neck cradle: a wide U cut into the front rim (axis along Y), 17 cm wide, 9 cm deep
bpy.ops.mesh.primitive_cylinder_add(radius=0.085, depth=0.30, location=(0, -AY, 0.0), rotation=(math.radians(90), 0, 0), vertices=64)
cut = bpy.context.object
activate(bowl); b = bowl.modifiers.new('neck', 'BOOLEAN'); b.object = cut; b.operation = 'DIFFERENCE'
bpy.ops.object.modifier_apply(modifier='neck'); bpy.data.objects.remove(cut, do_unlink=True)
bv = bowl.modifiers.new('soft', 'BEVEL'); bv.width = 0.008; bv.segments = 3; bv.limit_method = 'ANGLE'; bv.angle_limit = math.radians(40)
bowl.data.materials.append(M['basin']); bpy.ops.object.shade_smooth()
bowl.location = (BX, BY, BZ); bowl.rotation_euler = (math.radians(-5), 0, 0)
bpy.context.view_layer.update()
dz = BZ - max((bowl.matrix_world @ v.co).z for v in bowl.data.vertices); bowl.location.z += dz
bpy.context.view_layer.update()
post = bpy.data.objects.get('bw_front_basin_post')
if post: post.location = (BX, BY + 0.14, 0.36)

# the cradle's lowest point, measured on the mesh (front of the bowl, near x = BX)
front = [bowl.matrix_world @ v.co for v in bowl.data.vertices]
cr = [p for p in front if abs(p.x - BX) < 0.02 and p.y < BY - AY + 0.05]
CRADLE_Z = min(p.z for p in cr) if cr else BZ - 0.085
CRADLE_Y = BY - AY

# ---- the guest's neck and head ----
def sph(name, r, loc, m, scale):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object; o.name = name; o.scale = scale; o.data.materials.append(M[m]); bpy.ops.object.shade_smooth(); return o
def limb(name, a, b, r, m):
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=(b - a).length, location=(a + b) / 2, vertices=24)
    o = bpy.context.object; o.name = name; o.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler()
    o.data.materials.append(M[m]); bpy.ops.object.shade_smooth(); return o
NECK_R = 0.05
def build(head_y, head_z):
    for p in ('guest_head', 'guest_hair', 'guest_neck'): kill(p)
    neck_z = CRADLE_Z + NECK_R + 0.004                     # resting on the cradle, 4 mm clear
    limb('guest_neck', (BX, 3.27, 0.87), (BX, CRADLE_Y + 0.06, neck_z), NECK_R, 'guest_skin')
    H = Vector((BX, head_y, head_z))
    h = sph('guest_head', 0.105, H, 'guest_skin', (0.9, 1.15, 1.0))
    c = sph('guest_hair_crown', 0.112, H + Vector((0, 0.03, -0.01)), 'hair_blond', (0.95, 1.12, 0.9))
    for k in range(11):
        dx = (k - 5) * 0.017
        top = (BX + dx, H.y + 0.06, H.z - 0.02)
        end = (BX + dx * 1.5, min(H.y + 0.20, BY + AY - 0.06), H.z - 0.10)
        limb(f'guest_hair_strand{k}', top, end, 0.013, 'hair_blond')
    return h, c
def overlaps(o):
    dg = bpy.context.evaluated_depsgraph_get()
    return len(BVHTree.FromObject(bowl, dg).overlap(BVHTree.FromObject(o, dg)))

hy, hz = CRADLE_Y + 0.13, CRADLE_Z + 0.105
for step in range(25):
    h, c = build(hy, hz)
    bpy.context.view_layer.update()
    n = overlaps(h) + overlaps(c)
    print(f'STEP {step} head y={hy:.3f} z={hz:.3f} overlap={n}')
    if n == 0: break
    hz += 0.006
neck = bpy.data.objects['guest_neck']
print(f'FINAL head y={hy:.3f} z={hz:.3f} head/crown overlap={overlaps(h) + overlaps(c)} neck overlap={overlaps(neck)} cradle_z={CRADLE_Z:.3f}')

# ---- the stylist's hands ON THE HAIR (J 20:00): fingertips on the crown and in the hair spread in the bowl,
# never on her face (the face is the head's front, toward -Y and +Z). Rebuilt from the shoulders each time.
for o in [o for o in bpy.data.objects if o.name.startswith(('stylist_upper', 'stylist_fore', 'stylist_hand'))]:
    bpy.data.objects.remove(o, do_unlink=True)
H = Vector((BX, hy, hz))
TARGETS = {'l': H + Vector((-0.06, 0.07, 0.07)),     # left hand: on the crown, behind the hairline
           'r': H + Vector((0.06, 0.14, 0.02))}      # right hand: at the back of the head, fingers into the lengths
SX, SY = 3.42, 3.52
for side, dy in (('l', -0.13), ('r', 0.13)):
    sh = Vector((SX, SY + dy * 1.4, 1.48)); hand = TARGETS[side]
    elbow = (sh + hand) / 2 + Vector((0.08, 0, -0.10))
    limb(f'stylist_upper_{side}', sh, elbow, 0.04, 'stylist_black')
    limb(f'stylist_fore_{side}', elbow, hand + Vector((0.03, 0, 0.03)), 0.033, 'stylist_black')
    sph(f'stylist_hand_{side}', 0.045, hand + Vector((0, 0, 0.012)), 'guest_skin', (1.0, 1.3, 0.55))
# check: each hand is closer to the hair than to the face
face = H + Vector((0, -0.11, 0.03))
for side in ('l', 'r'):
    p = bpy.data.objects[f'stylist_hand_{side}'].location
    print(f'HAND {side}: to face {(p - face).length:.3f} m, to crown {(p - (H + Vector((0, 0.08, 0.02)))).length:.3f} m')

# keep the camera aimed at the hair in the bowl
cam = bpy.data.objects.get('cam_hair_orbit'); sc.camera = cam
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'salon_om_backwash_side_orbit_v5.blend'))
sc.render.resolution_x, sc.render.resolution_y = 960, 640; sc.eevee.taa_render_samples = 12
sc.render.image_settings.file_format = 'PNG'
for f in ((1, 120, 240) if CHECK else range(1, 241)):
    sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'o_{f:04d}.png'); bpy.ops.render.render(write_still=True)
print('V5_DONE')
