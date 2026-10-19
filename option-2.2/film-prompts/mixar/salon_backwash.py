# SPDX-License-Identifier: GPL-3.0-or-later
# Salon OM backwash area: real-scale blockout from "Salon OM edit.png" (= OM Salon 6, cleaned).
# Only what the photo shows. Units: metres. +X = toward the right wall, +Y = toward the back wall, +Z = up.
# Run: Mixar -b --factory-startup -P salon_backwash.py -- --out DIR [--anim]
import bpy, math, sys, os
from mathutils import Vector

argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[argv.index('--out') + 1] if '--out' in argv else os.path.dirname(os.path.abspath(__file__))
ANIM = '--anim' in argv
os.makedirs(OUT, exist_ok=True)

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
sc = bpy.context.scene
sc.unit_settings.system = 'METRIC'

def mat(name, rgb, rough=0.6, metal=0.0, emit=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough
    b.inputs['Metallic'].default_value = metal
    return m
M = dict(wall=mat('wall', (0.78, 0.70, 0.57)), floor=mat('floor', (0.62, 0.48, 0.34), 0.45),
         leather=mat('leather', (0.10, 0.07, 0.06), 0.35), basin=mat('basin', (0.02, 0.02, 0.02), 0.08),
         wood=mat('wood', (0.45, 0.28, 0.14)), poster=mat('poster', (0.30, 0.38, 0.22)), glass=mat('glass', (0.7, 0.8, 0.8), 0.1),
         guest=mat('guest_skin', (0.85, 0.66, 0.55)), hair=mat('hair_blond', (0.80, 0.64, 0.38), 0.4),
         cape=mat('cape', (0.12, 0.12, 0.13)), stylist=mat('stylist_black', (0.03, 0.03, 0.03)), blind=mat('blind', (0.85, 0.70, 0.42)))

def box(name, size, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.object; o.name = name; o.scale = size; o.data.materials.append(M[m]); return o
def cyl(name, r, h, loc, m, rot=(0, 0, 0), verts=40):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts)
    o = bpy.context.object; o.name = name; o.data.materials.append(M[m]); return o
def sph(name, r, loc, m, scale=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc)
    o = bpy.context.object; o.name = name; o.scale = scale; o.data.materials.append(M[m]); return o

# ---- room (only the two walls the photo shows) ----
box('floor', (6, 5, 0.02), (1.5, 1.5, -0.01), 'floor')
box('wall_back', (6, 0.1, 2.8), (1.5, 4.05, 1.4), 'wall')          # behind the basins
box('wall_right', (0.1, 5, 2.8), (4.05, 1.5, 1.4), 'wall')         # right wall, small shelf
box('blind_left', (0.02, 1.4, 1.6), (-1.0, 3.0, 1.5), 'blind')     # bamboo blind, far left
box('cabinets', (1.6, 0.35, 0.55), (2.5, 3.83, 2.3), 'wood')       # wall cabinets above
box('poster_right', (0.02 + 0.6, 0.02, 0.85), (2.6, 3.99, 1.45), 'poster')
box('poster_left', (0.5, 0.02, 0.65), (0.2, 3.99, 1.45), 'poster')
box('mirror_cabinet', (0.6, 0.45, 0.8), (1.0, 3.75, 0.4), 'wood')
box('shelf_right_wall', (0.02, 0.35, 0.02), (4.0, 2.4, 1.0), 'glass')
box('shelf_bottles', (0.8, 0.12, 0.02), (3.2, 3.94, 1.75), 'glass')

# ---- backwash units: chair faces -Y (toward camera side), basin at its back (+Y), against the back wall ----
def backwash(prefix, x):
    box(prefix + '_base', (0.62, 1.05, 0.42), (x, 2.95, 0.21), 'leather')
    box(prefix + '_seat', (0.58, 0.55, 0.12), (x, 2.75, 0.48), 'leather')
    box(prefix + '_back', (0.58, 0.12, 0.62), (x, 3.12, 0.78), 'leather', rot=(math.radians(-28), 0, 0))
    box(prefix + '_arm_l', (0.10, 0.62, 0.20), (x - 0.34, 2.85, 0.62), 'leather')
    box(prefix + '_arm_r', (0.10, 0.62, 0.20), (x + 0.34, 2.85, 0.62), 'leather')
    b = cyl(prefix + '_basin', 0.30, 0.22, (x, 3.62, 0.92), 'basin'); b.scale = (1.0, 0.85, 1)
    box(prefix + '_basin_post', (0.30, 0.25, 0.80), (x, 3.75, 0.40), 'leather')
backwash('bw_front', 2.85)     # the one we film (right, nearest the right wall)
backwash('bw_second', 1.75)
box('styling_chair', (0.55, 0.55, 0.9), (0.45, 2.7, 0.45), 'leather')
cyl('footstool_front', 0.22, 0.45, (2.85, 1.85, 0.225), 'leather')   # in front of the front chair
cyl('footstool_left', 0.22, 0.45, (0.85, 2.05, 0.225), 'leather')

# ---- the guest (blond): SEATED, back on the backrest, neck in the basin cradle, legs to the footstool ----
gx = 2.85
box('guest_legs', (0.30, 0.95, 0.14), (gx, 2.22, 0.56), 'cape', rot=(math.radians(8), 0, 0))
box('guest_torso', (0.38, 0.22, 0.62), (gx, 2.98, 0.82), 'cape', rot=(math.radians(-55), 0, 0))
sph('guest_head', 0.11, (gx, 3.44, 1.03), 'guest', scale=(1, 1.15, 1))
sph('guest_hair', 0.13, (gx, 3.55, 0.99), 'hair', scale=(1, 1.5, 0.75))

# ---- the stylist: standing BEHIND the basin, between basin and right wall, facing the guest's head ----
sx, sy = 3.35, 3.55
cyl('stylist_body', 0.17, 1.15, (sx, sy, 0.575 + 0.0), 'stylist')
box('stylist_torso', (0.38, 0.24, 0.55), (sx, sy, 1.42), 'stylist', rot=(0, 0, math.radians(90)))
sph('stylist_head', 0.11, (sx, sy, 1.80), 'guest')
box('stylist_arm_l', (0.08, 0.08, 0.50), (3.12, 3.47, 1.20), 'stylist', rot=(0, math.radians(-55), 0))
box('stylist_arm_r', (0.08, 0.08, 0.50), (3.12, 3.63, 1.20), 'stylist', rot=(0, math.radians(-55), 0))

# ---- light: warm low key from the right, as J asked ----
bpy.ops.object.light_add(type='AREA', location=(3.9, 1.2, 1.6)); key = bpy.context.object; key.name = 'key_warm_right'
key.data.energy = 900; key.data.color = (1.0, 0.72, 0.45); key.data.size = 1.2
key.rotation_euler = (math.radians(80), 0, math.radians(110))
bpy.ops.object.light_add(type='AREA', location=(0.5, -0.5, 2.4)); fill = bpy.context.object; fill.name = 'fill_soft'
fill.data.energy = 120; fill.data.color = (1.0, 0.92, 0.82); fill.data.size = 3
sc.world = bpy.data.worlds.new('w'); sc.world.use_nodes = True
sc.world.node_tree.nodes['Background'].inputs['Strength'].default_value = 0.05

# ---- camera: the photo's angle (low, from the left-front, looking toward the back-right corner) ----
bpy.ops.object.camera_add(); cam = bpy.context.object; cam.name = 'cam_photo'; sc.camera = cam
cam.data.lens = 26; cam.data.sensor_width = 36
start = Vector((1.6, 0.5, 0.80)); look = Vector((3.1, 3.6, 0.95))
end = start + (look - start) * 0.15   # ~0.5 m slow push-in toward the guest's head   # slow push-in, ~12% of the distance, never turning to the unseen side
def aim(c, at):
    c.rotation_euler = (at - c.location).to_track_quat('-Z', 'Y').to_euler()
cam.location = start; aim(cam, look)
sc.frame_start, sc.frame_end = 1, 240; sc.render.fps = 24
if ANIM:
    for f, p in ((1, start), (240, end)):
        cam.location = p; aim(cam, look)
        cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
    # Bezier keys are the default and already ease in and out (Blender 5 API: no action.fcurves)

# a second, overhead camera for the plan view
bpy.ops.object.camera_add(location=(1.8, 1.8, 8.5)); top = bpy.context.object; top.name = 'cam_plan'
top.data.type = 'ORTHO'; top.data.ortho_scale = 6.2; top.rotation_euler = (0, 0, 0)

sc.render.engine = 'BLENDER_EEVEE'; sc.render.resolution_x, sc.render.resolution_y = 1280, 854
sc.view_settings.view_transform = 'Filmic' if 'Filmic' in [i.identifier for i in sc.view_settings.bl_rna.properties['view_transform'].enum_items] else sc.view_settings.view_transform

def shot(c, name, frame=1):
    sc.camera = c; sc.frame_set(frame); sc.render.filepath = os.path.join(OUT, name); bpy.ops.render.render(write_still=True)
shot(cam, 'blockout_start.png', 1)
if ANIM: shot(cam, 'blockout_end.png', 240)
shot(top, 'blockout_plan.png', 1)
# camera path drawn into the plan view: a line from start to end plus a frustum marker
if ANIM:
    bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=(end - start).length, location=(start + end) / 2)
    pth = bpy.context.object; pth.name = 'cam_path'
    pth.rotation_euler = (end - start).to_track_quat('Z', 'Y').to_euler()
    pm = mat('path', (0.9, 0.1, 0.1)); pth.data.materials.append(pm)
    for nm, p in (('cam_start_mark', start), ('cam_end_mark', end)):
        o = sph(nm, 0.09, (p.x, p.y, 2.6), 'guest'); o.data.materials[0] = pm
    bpy.ops.mesh.primitive_cone_add(radius1=0.0, radius2=0.9, depth=3.2, location=start + (look - start).normalized() * 1.6)
    fr = bpy.context.object; fr.name = 'view_cone'; fr.rotation_euler = (look - start).to_track_quat('-Z', 'Y').to_euler()
    fr.rotation_euler.rotate_axis('X', math.radians(180)); fr.display_type = 'WIRE'; fr.hide_render = False
    cm = mat('cone', (0.9, 0.2, 0.2)); cm.blend_method = 'BLEND' if hasattr(cm, 'blend_method') else None
    cm.node_tree.nodes['Principled BSDF'].inputs['Alpha'].default_value = 0.18; fr.data.materials.append(cm)
    fr.hide_viewport = False
    shot(top, 'blockout_plan_path.png', 1)
    fr.hide_render = True
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'salon_om_backwash.blend'))
if '--cams' in argv:
    sc.render.resolution_x, sc.render.resolution_y = 640, 427
    C = [((1.7, 0.7, 0.45), (3.3, 3.8, 1.05), 22), ((1.5, 0.3, 0.50), (3.2, 3.8, 1.05), 24),
         ((1.9, 0.9, 0.55), (3.2, 3.7, 1.00), 22), ((1.6, 0.5, 0.80), (3.1, 3.6, 0.95), 26)]
    for i, (p0, at, lens) in enumerate(C):
        sc.camera = cam; cam.animation_data_clear(); cam.location = Vector(p0); aim(cam, Vector(at)); cam.data.lens = lens
        sc.render.filepath = os.path.join(OUT, f'cand{i}.png'); bpy.ops.render.render(write_still=True)
print('SALON_DONE', OUT)
