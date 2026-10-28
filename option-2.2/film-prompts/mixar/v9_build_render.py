# SPDX-License-Identifier: GPL-3.0-or-later
# Headless Mixar runner for the v9 previz: builds the set (v9_photo_match.py), applies the shared grid look
# (0_Global/skills/previz-for-video-models/scripts/previz_grid_set.py), saves the .blend, renders.
# Run: Mixar -b --factory-startup -P v9_build_render.py -- OUT_DIR [--overlay] [--check] [--full] [--frames 120]
#   --overlay  one 1280x854 frame through cam_photo (the photo's own camera) -> OUT/v9_photo_cam.png
#   --check    frames 1, 180, 360 of cam_pan -> OUT/p_####.png
#   --full     all 360 frames of cam_pan -> OUT/p_####.png (encode with ffmpeg afterwards)
import bpy, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[sys.argv.index('--') + 1:]
OUT = args[0]; os.makedirs(OUT, exist_ok=True)
FRAMES = int(args[args.index('--frames') + 1]) if '--frames' in args else 360   # --frames 120 = the 5 s test
exec(compile(open(os.path.join(HERE, 'v9_photo_match.py')).read(), 'v9_photo_match.py', 'exec'), {'FRAMES': FRAMES, '__name__': 'v9'})
GRID = os.path.expanduser('~/All/0_Global/skills/previz-for-video-models/scripts/previz_grid_set.py')
CFG = {"collection": "Set", "camera": "cam_pan", "name": "PV_unused", "res": [1280, 720], "fps": 24, "frames": FRAMES,
       "cell": 0.5, "line": 0.012,
       "tints": {"floor": [0.86, 0.78, 0.62], "wall": [0.93, 0.88, 0.76], "ceiling": [0.80, 0.80, 0.78], "baseboard": [0.70, 0.62, 0.52],
                 "pipe": [0.88, 0.88, 0.86], "blind": [0.90, 0.78, 0.50], "poster": [0.55, 0.62, 0.80], "mirror": [0.62, 0.48, 0.36],
                 "console": [0.72, 0.55, 0.36], "cabinet": [0.60, 0.60, 0.64], "shelf": [0.75, 0.88, 0.90], "bottles": [0.80, 0.70, 0.90],
                 "bw_": [0.56, 0.48, 0.44], "ottoman": [0.50, 0.46, 0.50], "styling": [0.58, 0.50, 0.46], "fg_": [0.45, 0.42, 0.40]}}
NS = {"CFG": dict(CFG, collection="__none__"), "__name__": "grid"}      # the script's own loop stopped after 2 meshes here
exec(compile(open(GRID).read(), 'previz_grid_set.py', 'exec'), NS)       # so: its camera/output setup, then its gridmat per mesh
for o in list(bpy.data.collections["Set"].all_objects):
    if o.type != 'MESH': continue
    k = next((p for p in CFG["tints"] if o.name.startswith(p)), None)
    m = NS["gridmat"](k or "default", CFG["tints"].get(k, [0.80, 0.90, 0.76]), CFG["cell"], CFG["line"])
    o.data.materials.clear(); o.data.materials.append(m)
for cn in ("cam_pan", "cam_photo"):                 # the grid script sets rotation_mode XYZ, which drops the quaternion keys
    cc = bpy.data.objects[cn]; cc.rotation_mode = 'QUATERNION'; cc.data.sensor_fit = 'HORIZONTAL'; cc.data.sensor_width = 36
u = bpy.data.objects.get("PV_unused")
if u: bpy.data.objects.remove(u, do_unlink=True)
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE_NEXT' if 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties['engine'].enum_items] else 'BLENDER_EEVEE'
sc.eevee.taa_render_samples = 16
sc.render.image_settings.file_format = 'PNG'
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'salon_om_rooted_previz_v9.blend'))
if '--overlay' in args:
    sc.camera = bpy.data.objects['cam_photo']; sc.render.resolution_x, sc.render.resolution_y = 1280, 854
    sc.frame_set(1); sc.render.filepath = os.path.join(OUT, 'v9_photo_cam.png'); bpy.ops.render.render(write_still=True)
    sc.camera = bpy.data.objects['cam_pan']; sc.render.resolution_x, sc.render.resolution_y = 1280, 720
frames = range(1, FRAMES + 1) if '--full' in args else ((1, (FRAMES + 1) // 2, FRAMES) if '--check' in args else ())
for f in frames:
    sc.frame_set(f); sc.render.filepath = os.path.join(OUT, f'p_{f:04d}.png'); bpy.ops.render.render(write_still=True)
print('V9_DONE', OUT)
