# SPDX-License-Identifier: GPL-3.0-or-later
# Salon OM backwash v2 (J 19:20): a STILL three-quarter view, close to a side view; the real basin shape
# (open bowl with a neck cradle), the blond guest's head resting in it, her hair spread in the bowl.
# Opens v1 (salon_om_backwash.blend) and replaces the basin, the people and the camera.
import bpy, bmesh, math, os, sys
from mathutils import Vector
argv = sys.argv[sys.argv.index('--') + 1:]
OUT = argv[0]; os.makedirs(OUT, exist_ok=True)
sc = bpy.context.scene
M = bpy.data.materials

for n in ['bw_front_basin', 'bw_front_back', 'guest_legs', 'guest_torso', 'guest_head', 'guest_hair', 'stylist_body',
          'stylist_torso', 'stylist_head', 'stylist_arm_l', 'stylist_arm_r', 'cam_path', 'cam_start_mark', 'cam_end_mark', 'view_cone']:
    if n in bpy.data.objects: bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True)

def activate(o):
    for x in bpy.context.selected_objects: x.select_set(False)
    o.select_set(True); bpy.context.view_layer.objects.active = o
def box(name, size, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size; o.data.materials.append(M[m]); return o
def sph(name, r, loc, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object; o.name = name; o.scale = scale; o.data.materials.append(M[m])
    bpy.ops.object.shade_smooth(); return o
def limb(name, a, b, r, m):
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=(b - a).length, location=(a + b) / 2, vertices=24)
    o = bpy.context.object; o.name = name; o.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler()
    o.data.materials.append(M[m]); bpy.ops.object.shade_smooth(); return o

# ---- the basin: an open oval bowl, 60 x 48 cm, 18 cm deep, with a U-shaped neck cradle in the front rim ----
BX, BY, BZ = 2.85, 3.62, 0.92          # rim centre, against the back wall
bpy.ops.mesh.primitive_uv_sphere_add(radius=1, segments=64, ring_count=32, location=(BX, BY, BZ))
bowl = bpy.context.object; bowl.name = 'bw_front_basin'
bm = bmesh.new(); bm.from_mesh(bowl.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z > 0.001], context='VERTS')
bm.to_mesh(bowl.data); bm.free()
bowl.scale = (0.30, 0.24, 0.18); activate(bowl); bpy.ops.object.transform_apply(scale=True)
sol = bowl.modifiers.new('wall', 'SOLIDIFY'); sol.thickness = 0.03; sol.offset = 1
bpy.ops.object.modifier_apply(modifier='wall')
bpy.ops.mesh.primitive_cylinder_add(radius=0.075, depth=0.2, location=(BX, BY - 0.24, BZ + 0.035), rotation=(math.radians(90), 0, 0))
cut = bpy.context.object; cut.name = 'neck_cut'
activate(bowl); b = bowl.modifiers.new('neck', 'BOOLEAN'); b.object = cut; b.operation = 'DIFFERENCE'
bpy.ops.object.modifier_apply(modifier='neck'); bpy.data.objects.remove(cut, do_unlink=True)
bowl.data.materials.append(M['basin']); bpy.ops.object.shade_smooth()
import mathutils
bowl.rotation_euler = (math.radians(-6), 0, 0)   # tips slightly toward the chair, as backwash bowls do
bpy.context.view_layer.update()
zs = [(bowl.matrix_world @ v.co).z for v in bowl.data.vertices]
bowl.location.z += BZ - max(zs)                   # rim exactly at BZ (0.92 m), measured on the vertices
bpy.context.view_layer.update()
box('bw_front_basin_post', (0.26, 0.20, 0.72), (BX, 3.80, 0.36), 'leather')

# ---- the chair back, reclined to meet the bowl ----
HIP, SHO = Vector((BX, 2.74, 0.56)), Vector((BX, 3.27, 0.86))
ang = math.atan2(SHO.z - HIP.z, SHO.y - HIP.y)
box('bw_front_back', (0.58, (SHO - HIP).length + 0.05, 0.10), ((HIP + SHO) / 2) + Vector((0, 0.02, -0.12)), 'leather', rot=(ang, 0, 0))

# ---- the guest (blond): seated and reclined, nape in the neck cradle, head inside the bowl, never the body ----
box('guest_torso', (0.40, (SHO - HIP).length, 0.20), (HIP + SHO) / 2, 'cape', rot=(ang, 0, 0))
limb('guest_thigh_l', (BX - 0.09, 2.74, 0.56), (BX - 0.09, 2.30, 0.58), 0.075, 'cape')
limb('guest_thigh_r', (BX + 0.09, 2.74, 0.56), (BX + 0.09, 2.30, 0.58), 0.075, 'cape')
limb('guest_shin_l', (BX - 0.09, 2.30, 0.58), (BX - 0.07, 1.90, 0.47), 0.055, 'cape')
limb('guest_shin_r', (BX + 0.09, 2.30, 0.58), (BX + 0.07, 1.90, 0.47), 0.055, 'cape')
limb('guest_neck', (BX, 3.27, 0.87), (BX, 3.40, 0.91), 0.05, 'guest_skin')
HEAD = Vector((BX, 3.50, 0.93))
sph('guest_head', 0.105, HEAD, 'guest_skin', scale=(0.9, 1.15, 1.0))
sph('guest_hair_crown', 0.112, HEAD + Vector((0, 0.03, -0.01)), 'hair_blond', scale=(0.95, 1.12, 0.9))
sph('guest_hair_bowl', 0.17, (BX, 3.66, 0.81), 'hair_blond', scale=(1.0, 1.05, 0.22))   # hair spread inside the bowl
for k, dx in enumerate((-0.07, -0.03, 0.01, 0.05)):
    limb(f'guest_hair_strand{k}', (BX + dx, 3.56, 0.90), (BX + dx * 1.5, 3.76, 0.80), 0.02, 'hair_blond')

# ---- the stylist: standing between the bowl and the right wall, facing the guest's head ----
SX, SY = 3.42, 3.52
limb('stylist_legs', (SX, SY, 0.0), (SX, SY, 0.95), 0.16, 'stylist_black')
box('stylist_torso', (0.24, 0.38, 0.58), (SX, SY, 1.25), 'stylist_black')
sph('stylist_head', 0.1, (SX, SY, 1.68), 'guest_skin')
for side, dy in (('l', -0.13), ('r', 0.13)):
    limb(f'stylist_upper_{side}', (SX, SY + dy * 1.4, 1.48), (SX - 0.20, SY + dy, 1.18), 0.04, 'stylist_black')
    limb(f'stylist_fore_{side}', (SX - 0.20, SY + dy, 1.18), (BX + 0.10, HEAD.y + dy * 0.6, HEAD.z + 0.07), 0.033, 'stylist_black')
    sph(f'stylist_hand_{side}', 0.045, (BX + 0.08, HEAD.y + dy * 0.55, HEAD.z + 0.08), 'guest_skin', scale=(1, 1.3, 0.6))

# ---- light: warm low key from frame right, a soft rim behind the hair ----
for n in ('key_warm_right', 'fill_soft'):
    if n in bpy.data.objects: bpy.data.objects[n].data.energy *= 0.35
def area(name, loc, at, energy, color, size):
    bpy.ops.object.light_add(type='AREA', location=loc); l = bpy.context.object; l.name = name
    l.data.energy = energy; l.data.color = color; l.data.size = size
    l.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler(); return l
area('key_side_warm', (2.2, 2.6, 1.45), HEAD, 45, (1.0, 0.70, 0.42), 0.9)
area('rim_hair', (3.2, 3.95, 1.6), HEAD, 30, (1.0, 0.80, 0.55), 0.5)

# ---- camera: STILL, three-quarter, close to a side view, from the guest's left, at head height ----
def cam(name, loc, lens, at=HEAD + Vector((0.05, 0.05, -0.02))):
    bpy.ops.object.camera_add(location=loc); c = bpy.context.object; c.name = name
    c.data.lens = lens; c.data.sensor_width = 36
    c.rotation_euler = (Vector(at) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    c.data.dof.use_dof = True; c.data.dof.focus_distance = (Vector(at) - Vector(loc)).length; c.data.dof.aperture_fstop = 2.0
    return c
# from the guest's left, past the second chair, ~22 deg off a pure side view; looks toward the right wall (photographed)
# HAIR-FIRST (J 19:30): low, at bowl height, from the gap between the chairs, near side view (~25 deg off).
# Frame: the bowl + the hair in it fill the centre; the stylist's hands enter from the top; her face and the guest's legs stay out.
BOWL = Vector((BX, BY - 0.04, BZ - 0.04))
A = cam('cam_hair_50', (2.18, 3.05, 1.06), 50, at=BOWL)   # the shot: bowl, hair, head, hands, a little wall
B = cam('cam_hair_35', (2.08, 2.98, 1.10), 35, at=BOWL)   # a touch wider, more of the room
sc.camera = A
if 'cam_photo' in bpy.data.objects: bpy.data.objects['cam_photo'].animation_data_clear()

sc.render.engine = 'BLENDER_EEVEE'; sc.eevee.taa_render_samples = 32
sc.render.resolution_x, sc.render.resolution_y = 1280, 854
for c, n in ((A, 'v3_hair_50mm.png'), (B, 'v3_hair_35mm.png')):
    sc.camera = c; sc.render.filepath = os.path.join(OUT, n); bpy.ops.render.render(write_still=True)
sc.camera = bpy.data.objects['cam_plan']; sc.render.filepath = os.path.join(OUT, 'v2_plan.png'); bpy.ops.render.render(write_still=True)
sc.camera = A
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'salon_om_backwash_v3_hair.blend'))
print('V2_DONE')
