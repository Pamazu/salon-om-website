# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v14 (task 63623d0c), exec'd by v10_build_render.py --boxes ARM after v13_look.py (so with --v11 --v13 ...).
# J 17 Nov (ask 332b1711): "we already learned we need to use the 3D of the box ... A real 3D of a subject makes movement look
# unnatural and robotic." J 17 Nov 14:08Z, the hypothesis this file tests: "when the camera is so much of a closeup maaybe
# single boxes for the whole subjects would get the ai model confused. You might need smaller boxes for the things your doing
# closeups". The four figure meshes (PV_Client, PV_Head, PV_Hair, PV_Stylist) leave the render; plain boxes take their place,
# built from the SAME joints v11_look.py / v13_look.py place the figures by, still (a stand-in only slides and turns, and
# nobody travels here: the hands' motion is carried by the words). The room, the tap, the water and the camera are untouched.
# Colour code (previz-for-video-models): front red, sides and top green, rear light blue; each box's front = the side its
# person faces (her face, up; the stylist's chest, toward her head; a hand's palm, into the hair).
#   ARM A  one box per person (her hair inside hers).
#   ARM B  part boxes for what the close-up shows: her head, her hair in the bowl, her chest and shoulders; the stylist's
#          hands, forearms, upper arms, chest and shoulders, head; the rest of each body one box.
#   ARM C  B + rough capsules (not boxes) for her neck and the stylist's arms (only if A and B both fail).
#   ARM list  print every object's world bounds at frame 1.
import bpy, bmesh, math
from mathutils import Vector, Quaternion
sc = bpy.context.scene
def bounds(o):
    pts = [o.matrix_world @ Vector(c) for c in o.bound_box]
    return [round(min(p[i] for p in pts), 3) for i in range(3)], [round(max(p[i] for p in pts), 3) for i in range(3)]
if ARM == 'list':
    sc.frame_set(1)
    for o in sorted(bpy.data.objects, key=lambda o: o.name):
        if o.type in ('MESH', 'CURVE', 'META', 'SURFACE') and not o.hide_render:
            lo, hi = bounds(o); print('OBJ', o.name, lo, hi)
else:
    assert ARM in ('A', 'B', 'C'), ARM
    ik, Y = V11['ik'], V11['Y']
    SX, SY = V11['SX'], V11['SY']
    HIP, SHO, NECK = V11['HIP'], V11['SHO'], V11['NECK']
    for n in ('PV_Client', 'PV_Head', 'PV_Hair', 'PV_Stylist'):
        o = bpy.data.objects.get(n)
        if o: o.hide_render = True; o.hide_viewport = True
    shaded = V11['shaded']                                  # the figures' own self-lit material (v11_look.py), so the boxes read as they did
    M = [shaded('V14_front_red', (0.80, 0.05, 0.04), lo=0.55), shaded('V14_side_green', (0.10, 0.58, 0.14), lo=0.55),
         shaded('V14_rear_blue', (0.50, 0.72, 0.95), lo=0.55)]
    COL = bpy.data.collections.get('Set') or sc.collection
    made = []
    def obox(name, c, F, U, depth, height, width):
        """A box centred at c: depth along F (front face red, back light blue), height along U, width along S = U x F (green)."""
        F = Vector(F).normalized(); U = (Vector(U) - Vector(U).dot(F) * F).normalized(); S = U.cross(F)
        c = Vector(c); bm = bmesh.new(); vs = {}
        for i in (-1, 1):
            for j in (-1, 1):
                for k in (-1, 1): vs[i, j, k] = bm.verts.new(c + F * (i * depth / 2) + U * (j * height / 2) + S * (k * width / 2))
        faces = [((1, -1, -1), (1, 1, -1), (1, 1, 1), (1, -1, 1), 0), ((-1, -1, -1), (-1, -1, 1), (-1, 1, 1), (-1, 1, -1), 2)]
        faces += [((-1, 1, -1), (-1, 1, 1), (1, 1, 1), (1, 1, -1), 1), ((-1, -1, -1), (1, -1, -1), (1, -1, 1), (-1, -1, 1), 1)]
        faces += [((-1, -1, 1), (1, -1, 1), (1, 1, 1), (-1, 1, 1), 1), ((-1, -1, -1), (-1, 1, -1), (1, 1, -1), (1, -1, -1), 1)]
        for *q, mi in faces:
            f = bm.faces.new([vs[t] for t in q]); f.material_index = mi
        bm.normal_update()
        for f in bm.faces:                                   # outward normals
            if f.normal.dot(f.calc_center_median() - c) < 0: f.normal_flip()
        me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
        for m in M: me.materials.append(m)
        o = bpy.data.objects.new(name, me); COL.objects.link(o); made.append(o); return o
    def limb_box(name, a, b, face, thick):
        """A box from a to b (top = toward a, the end nearer the body), its front turned toward `face` as far as the limb allows."""
        a, b = Vector(a), Vector(b); U = (a - b).normalized(); F = Vector(face) - Vector(face).dot(U) * U
        return obox(name, (a + b) / 2, F, U, thick, (a - b).length + thick * 0.5, thick)
    def capsule(name, a, b, r):
        a, b = Vector(a), Vector(b); bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=r, depth=(b - a).length, location=(a + b) / 2)
        o = bpy.context.active_object; o.name = name; o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(b - a)
        for e in (a, b):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, radius=r, location=e); s = bpy.context.active_object
            s.name = name + '_end'; s.data.materials.append(M[1]); made.append(s)
        o.data.materials.append(M[1]); made.append(o); return o
    def tilt_y(deg, v): return Quaternion((0, 1, 0), math.radians(deg)) @ Vector(v)
    def tilt_x(deg, v): return Quaternion((1, 0, 0), math.radians(deg)) @ Vector(v)
    # --- the client, lying face up (front = up), head toward the wall (-x)
    if ARM == 'A':
        crown, heel = Vector((-2.56, Y, 0.86)), Vector((-1.02, Y, 0.45))     # her hair in the bowl to her heels on the ottoman
        U = (crown - heel).normalized(); F = Vector((U.z, 0, -U.x))
        obox('BX_client', (crown + heel) / 2, F, U, 0.25, (crown - heel).length, 0.45)
    else:
        obox('BX_head', (-2.37, Y, 0.875), tilt_y(-12, (0, 0, 1)), tilt_y(-12, (-1, 0, 0)), 0.196, 0.22, 0.156)
        obox('BX_hair', (-2.53, Y, 0.80), tilt_y(-30, (0, 0, 1)), tilt_y(-30, (-1, 0, 0)), 0.13, 0.15, 0.36)
        t = SHO - HIP; ang = -math.degrees(math.atan2(t.z, -t.x))
        obox('BX_client_chest', SHO.lerp(HIP, 0.22) + Vector((0, 0, -0.01)), tilt_y(ang, (0, 0, 1)), tilt_y(ang, (-1, 0, 0)), 0.21, 0.30, 0.46)
        top, heel = SHO.lerp(HIP, 0.42), Vector((-1.02, Y, 0.45))
        U = (top - heel).normalized(); F = Vector((U.z, 0, -U.x))
        obox('BX_client_body', (top + heel) / 2, F, U, 0.25, (top - heel).length, 0.42)
        if ARM == 'C': capsule('BX_client_neck', SHO + Vector((0.02, 0, 0)), NECK, 0.055)
    # --- the stylist, standing at the right of her head between the basins, facing her head (-y), leaning in
    if ARM == 'A':
        obox('BX_stylist', (SX, SY - 0.10, 0.84), (0, -1, 0), (0, 0, 1), 0.30, 1.68, 0.45)
    else:
        obox('BX_stylist_head', (SX, SY - 0.32, 1.57), tilt_x(30, (0, -1, 0)), tilt_x(30, (0, 0, 1)), 0.19, 0.22, 0.15)
        obox('BX_stylist_chest', (SX, SY - 0.19, 1.27), tilt_x(32, (0, -1, 0)), tilt_x(32, (0, 0, 1)), 0.22, 0.30, 0.42)
        obox('BX_stylist_body', (SX, SY - 0.05, 0.585), (0, -1, 0), (0, 0, 1), 0.26, 1.17, 0.40)
        HANDS = [(-1, Vector((-2.465, -2.678, 0.885))), (1, Vector((-2.465, -2.502, 0.895)))]
        for s, hd in HANDS:
            sh = Vector((SX + s * 0.19, SY - 0.22, 1.32))
            el, wr = ik(sh, hd + Vector((0, 0.07, 0.02)), 0.29, 0.25, sh + Vector((s * 0.4, -0.1, -0.4)))
            side = 'L' if s < 0 else 'R'
            q = Quaternion((0, 1, 0), math.radians(35))
            obox('BX_hand_' + side, hd, q @ Vector((0, 0, -1)), q @ Vector((1, 0, 0)), 0.04, 0.17, 0.084)
            if ARM == 'C':
                capsule('BX_upperarm_' + side, sh, el, 0.045); capsule('BX_forearm_' + side, el, wr, 0.036)
            else:
                limb_box('BX_upperarm_' + side, sh, el, (0, -1, 0), 0.09)
                limb_box('BX_forearm_' + side, el, wr, (0, -1, 0), 0.075)
    sc.frame_set(1)
    for o in made: print('BOX', o.name, *bounds(o))
    print('V14_BOXES', ARM, len(made))
