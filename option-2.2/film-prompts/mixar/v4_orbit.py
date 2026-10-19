# SPDX-License-Identifier: GPL-3.0-or-later
# v4 (J 19:40): close to a SIDE view, with a living camera move. A slow 10 s arc around the guest's head,
# from a three-quarter (35 deg) to a pure side view, rising a little so it looks down into the bowl at the hair.
# The camera stays in the gap between the two chairs and only ever looks toward the photographed right wall.
import bpy, math, os, sys
from mathutils import Vector
args = sys.argv[sys.argv.index('--') + 1:]
out = args[0]; CHECK = '--check' in args; os.makedirs(out, exist_ok=True)
sc = bpy.context.scene; M = bpy.data.materials
BX, BY = 2.85, 3.62
HEAD = bpy.data.objects['guest_head'].location.copy()

# fuller, longer blond hair: strands from the crown falling over the cradle and fanning into the bowl
for o in [o for o in bpy.data.objects if o.name.startswith('guest_hair_strand')]:
    bpy.data.objects.remove(o, do_unlink=True)
def limb(name, a, b, r):
    a, b = Vector(a), Vector(b)
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=(b - a).length, location=(a + b) / 2, vertices=16)
    o = bpy.context.object; o.name = name; o.rotation_euler = (b - a).to_track_quat('Z', 'Y').to_euler()
    o.data.materials.append(M['hair_blond']); bpy.ops.object.shade_smooth()
for k in range(11):
    dx = (k - 5) * 0.017
    top = (BX + dx, HEAD.y + 0.06, HEAD.z + 0.02)
    mid = (BX + dx * 1.25, HEAD.y + 0.15, HEAD.z - 0.05)
    end = (BX + dx * 1.6, BY + 0.16, 0.80)
    limb(f'guest_hair_strand{k}a', top, mid, 0.014); limb(f'guest_hair_strand{k}b', mid, end, 0.012)

# the camera: an arc around the head, centre C, radius R
for n in [o.name for o in bpy.data.objects if o.type == 'CAMERA' and o.name != 'cam_plan']:
    bpy.data.objects.remove(bpy.data.objects[n], do_unlink=True)
bpy.ops.object.camera_add(); cam = bpy.context.object; cam.name = 'cam_hair_orbit'; sc.camera = cam
cam.data.lens = 35; cam.data.sensor_width = 36
cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = 2.2
C = Vector((BX, 3.58, 0.0)); R = 0.68
AIM = Vector((BX + 0.02, 3.60, 0.90))           # the hair in the bowl, just below the cradle
def ease(t): return 0.5 - 0.5 * math.cos(math.pi * t)
sc.frame_start, sc.frame_end = 1, 240; sc.render.fps = 24
for f in range(1, 241, 8):
    t = ease((f - 1) / 239)
    ang = math.radians(35 * (1 - t))            # 35 deg (three-quarter) -> 0 deg (pure side)
    p = Vector((C.x - R * math.cos(ang), C.y - R * math.sin(ang), 1.10 + 0.08 * t))
    cam.location = p
    cam.rotation_euler = (AIM - p).to_track_quat('-Z', 'Y').to_euler()
    cam.data.dof.focus_distance = (AIM - p).length
    cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f)
    cam.data.dof.keyframe_insert('focus_distance', frame=f)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out, 'salon_om_backwash_side_orbit.blend'))

sc.render.resolution_x, sc.render.resolution_y = 960, 640; sc.eevee.taa_render_samples = 12
sc.render.image_settings.file_format = 'PNG'
frames = (1, 120, 240) if CHECK else range(1, 241)
for f in frames:
    sc.frame_set(f); sc.render.filepath = os.path.join(out, f'o_{f:04d}.png'); bpy.ops.render.render(write_still=True)
print('V4_DONE')
