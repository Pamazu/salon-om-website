# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v11 (J 28 Oct 15:24: the v10b reference "looks like so abstract ... massively unclear" for the video model).
# A previz a video model can READ, same camera A and move (v10_scene.py, v10b pose):
#   1. the people are human mannequins (head, neck, torso, arms, hands, legs): the client lying back with her head in the
#      left basin and her hair a separate blond mass falling into the bowl; the stylist standing at her right, hands in the
#      hair, face out of frame. Two clearly different tones (client light, stylist dark slate), hair blond.
#   2. the room wears the basins photo itself, projected from its solved camera (cam_photo, v9_photo_match.py), so the
#      background IS the real salon seen from the new angle. Where the photo cannot see (outside its frame, or hidden
#      behind something in the photo) the surface gets a plain colour sampled from the photo (cream wall, wood, tile):
#      never magenta. Visibility is exact: a red point light sits at the photo camera, the bodies cast no shadow, and a
#      surface lit by it is a surface the photo sees (same rule as v10_projection.py's ray casts).
#   3. basins, chairs, cushions as real shapes with soft shading: the bowl (v10c), chairs with rounded edges, glossy black.
# Exec'd by v10_build_render.py --v11, after v10_scene.py. Every surface is emission (the light only feeds the mask).
import bpy, bmesh, math
from mathutils import Vector, Matrix, Quaternion

sc = bpy.context.scene
PHOTO = PHOTO_PATH                       # passed in by the runner (the repo's resources/salon-photos/6-shampoo-basins-edit.png)
PW, PH, PF = 1280, 854, 1072.0
KEY = Vector((0.55, -0.55, 0.65)).normalized()     # soft key from above, on the camera's side

# ---------------------------------------------------------------- materials
def _out(nt, shader):
    o = nt.nodes.new("ShaderNodeOutputMaterial"); nt.links.new(shader, o.inputs[0])
def shaded(name, col, gloss=0.0, lo=0.42):
    """Soft lambert from KEY, done in the shader (no lights needed), + an optional grazing sheen for glossy black."""
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    geo = nt.nodes.new("ShaderNodeNewGeometry")
    dot = nt.nodes.new("ShaderNodeVectorMath"); dot.operation = 'DOT_PRODUCT'; dot.inputs[1].default_value = KEY
    nt.links.new(geo.outputs['Normal'], dot.inputs[0])
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs['From Min'].default_value = -1.0; mr.inputs['From Max'].default_value = 1.0
    mr.inputs['To Min'].default_value = lo; mr.inputs['To Max'].default_value = 1.15; nt.links.new(dot.outputs['Value'], mr.inputs['Value'])
    mul = nt.nodes.new("ShaderNodeMix"); mul.data_type = 'RGBA'; mul.blend_type = 'MULTIPLY'; mul.inputs['Factor'].default_value = 1.0
    mul.inputs[6].default_value = (*col, 1); nt.links.new(mr.outputs['Result'], mul.inputs[7])
    last = mul.outputs[2]
    if gloss:
        lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs['Blend'].default_value = 0.35
        pw = nt.nodes.new("ShaderNodeMath"); pw.operation = 'POWER'; pw.inputs[1].default_value = 2.0; nt.links.new(lw.outputs['Facing'], pw.inputs[0])
        sh = nt.nodes.new("ShaderNodeMath"); sh.operation = 'MULTIPLY'; sh.inputs[1].default_value = gloss; nt.links.new(pw.outputs[0], sh.inputs[0])
        add = nt.nodes.new("ShaderNodeMix"); add.data_type = 'RGBA'; add.blend_type = 'ADD'; add.inputs['Factor'].default_value = 1.0
        nt.links.new(last, add.inputs[6]); nt.links.new(sh.outputs[0], add.inputs[7]); last = add.outputs[2]
    em = nt.nodes.new("ShaderNodeEmission"); nt.links.new(last, em.inputs[0]); _out(nt, em.outputs[0]); return m

def photo_material():
    m = bpy.data.materials.get("PV_photo") or bpy.data.materials.new("PV_photo"); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    N = nt.nodes.new; Lk = nt.links.new
    tc = N("ShaderNodeTexCoord"); tc.object = bpy.data.objects['cam_photo']
    sp = N("ShaderNodeSeparateXYZ"); Lk(tc.outputs['Object'], sp.inputs[0])
    def math_(op, a, b=None, val=None):
        n = N("ShaderNodeMath"); n.operation = op
        Lk(a, n.inputs[0]) if not isinstance(a, float) else n.inputs[0].__setattr__('default_value', a)
        if b is not None: Lk(b, n.inputs[1])
        if val is not None: n.inputs[1].default_value = val
        return n.outputs[0]
    negz = math_('MULTIPLY', sp.outputs['Z'], val=-1.0)
    u = math_('ADD', math_('MULTIPLY', math_('DIVIDE', sp.outputs['X'], negz), val=PF / PW), val=0.5)
    v = math_('ADD', math_('MULTIPLY', math_('DIVIDE', sp.outputs['Y'], negz), val=PF / PH), val=0.5)
    cv = N("ShaderNodeCombineXYZ"); Lk(u, cv.inputs[0]); Lk(v, cv.inputs[1])
    tex = N("ShaderNodeTexImage"); tex.image = bpy.data.images.load(PHOTO, check_existing=True); tex.extension = 'EXTEND'
    tex.interpolation = 'Cubic'; Lk(cv.outputs[0], tex.inputs[0])
    inside = math_('MULTIPLY', math_('MULTIPLY', math_('GREATER_THAN', u, val=0.0), math_('LESS_THAN', u, val=1.0)),
                   math_('MULTIPLY', math_('GREATER_THAN', v, val=0.0), math_('LESS_THAN', v, val=1.0)))
    inside = math_('MULTIPLY', inside, math_('GREATER_THAN', negz, val=0.0))
    dif = N("ShaderNodeBsdfDiffuse"); dif.inputs[0].default_value = (1, 1, 1, 1)
    s2r = N("ShaderNodeShaderToRGB"); Lk(dif.outputs[0], s2r.inputs[0])
    sep = N("ShaderNodeSeparateColor"); Lk(s2r.outputs['Color'], sep.inputs[0])
    seen = math_("MULTIPLY", inside, math_("GREATER_THAN", sep.outputs[0], val=0.05))
    fill = N("ShaderNodeAttribute"); fill.attribute_type = 'OBJECT'; fill.attribute_name = 'fill'
    mix = N("ShaderNodeMix"); mix.data_type = 'RGBA'; Lk(seen, mix.inputs['Factor'])
    Lk(fill.outputs['Color'], mix.inputs[6]); Lk(tex.outputs['Color'], mix.inputs[7])
    em = N("ShaderNodeEmission"); Lk(mix.outputs[2], em.inputs[0]); _out(nt, em.outputs[0]); return m

# ---------------------------------------------------------------- mannequins (bmesh primitives, smooth, one object each)
def _ellipsoid(bm, c, r, rot=Quaternion()):
    M = Matrix.Translation(c) @ rot.to_matrix().to_4x4() @ Matrix.Diagonal((*r, 1))
    bmesh.ops.create_uvsphere(bm, u_segments=28, v_segments=18, radius=1.0, matrix=M)
def _limb(bm, a, b, ra, rb=None):
    """A tapered capsule from a to b (radius ra -> rb): a cone body + a sphere at each end."""
    a, b = Vector(a), Vector(b); rb = ra if rb is None else rb; d = b - a; L = d.length
    q = Vector((0, 0, 1)).rotation_difference(d.normalized())
    M = Matrix.Translation((a + b) / 2) @ q.to_matrix().to_4x4()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=24, radius1=ra, radius2=rb, depth=L, matrix=M)
    _ellipsoid(bm, a, (ra, ra, ra)); _ellipsoid(bm, b, (rb, rb, rb))
def _obj(name, build, mat):
    old = bpy.data.objects.get(name)
    if old: bpy.data.objects.remove(old, do_unlink=True)
    bm = bmesh.new(); build(bm)
    for f in bm.faces: f.smooth = True
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(mat)
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.visible_shadow = False; return o
def _tilt(deg):            # rotation about +y (her body reclines: head end low toward the wall, -x)
    return Quaternion((0, 1, 0), math.radians(deg))

def ik(root, end, l1, l2, pole):
    """Two-bone joint: the knee/elbow between root and end for bone lengths l1, l2, bent toward `pole`."""
    root, end, pole = Vector(root), Vector(end), Vector(pole); d = end - root; L = min(d.length, l1 + l2 - 1e-4); u = d.normalized()
    a = (l1 * l1 - l2 * l2 + L * L) / (2 * L); h = math.sqrt(max(0.0, l1 * l1 - a * a))
    side = (pole - root) - u * (pole - root).dot(u); side.normalize()
    return root + u * a + side * h, root + u * L

# v11 (CEO MA addendum, J 15:34 "the anatomy of the woman is very wrong"): adult female proportions, ~1.65 m.
# Bone lengths (m): upper arm 0.29, forearm 0.25, hand 0.18, thigh 0.43, shin 0.40, foot 0.24, shoulder-to-hip 0.50,
# shoulders 0.38 wide, hips 0.36, head 0.22 long. She lies back in the photo's LEFT chair (y -2.49 set, her line y -2.59 =
# the left basin's centre): hips in the seat against the backrest, back on the cushion, neck in the basin's neck rest,
# head in the bowl (crown toward the wall, -x), legs toward the room (+x), knees softly bent, bare heels on the left ottoman.
Y = -2.59                  # her centre line (the left basin)
HIP, SHO, NECK = Vector((-1.74, Y, 0.53)), Vector((-2.13, Y, 0.80)), Vector((-2.27, Y, 0.85))
def client(bm):
    _limb(bm, SHO + Vector((0.02, 0, 0.0)), NECK, 0.058, 0.052)                              # neck, into the neck rest
    t = (SHO - HIP); ang = -math.degrees(math.atan2(t.z, -t.x))                              # torso tilt (head end up)
    _ellipsoid(bm, SHO.lerp(HIP, 0.22) + Vector((0, 0, -0.01)), (0.15, 0.19, 0.105), _tilt(ang))   # chest + shoulders
    _ellipsoid(bm, SHO.lerp(HIP, 0.60), (0.13, 0.145, 0.090), _tilt(ang))                    # waist
    _ellipsoid(bm, HIP + Vector((0.01, 0, 0.02)), (0.15, 0.18, 0.105), _tilt(ang * 0.6))     # hips
    for s in (-1, 1):
        sh = SHO + Vector((0.04, s * 0.19, -0.03)); wr = Vector((-1.66, Y + s * 0.12, 0.66))  # hands rest on her lap
        el, wr = ik(sh, wr, 0.29, 0.25, sh + Vector((0.1, s * 0.4, -0.3)))
        _limb(bm, sh, el, 0.048, 0.040); _limb(bm, el, wr, 0.038, 0.030)
        _ellipsoid(bm, wr + Vector((0.07, -s * 0.01, 0.0)), (0.085, 0.04, 0.020))             # hand
        hp = HIP + Vector((0.04, s * 0.09, -0.02)); an = Vector((-1.10, -2.73 + s * 0.07, 0.43))   # heels on the left ottoman
        kn, an = ik(hp, an, 0.43, 0.40, hp + Vector((0.3, 0, 0.5)))
        _limb(bm, hp, kn, 0.078, 0.055); _limb(bm, kn, an, 0.052, 0.035)
        _ellipsoid(bm, an + Vector((0.06, 0, 0.03)), (0.11, 0.040, 0.045), Quaternion((0, 1, 0), math.radians(-60)))   # bare foot, toes up
def head(bm):              # face up: crown toward the wall (into the bowl), chin toward her chest; seen in profile
    _ellipsoid(bm, (-2.37, Y, 0.875), (0.110, 0.078, 0.098), _tilt(-12))                     # skull + face (0.22 m long)
    _ellipsoid(bm, (-2.33, Y, 0.972), (0.026, 0.014, 0.020), _tilt(20))                     # nose, pointing up
    _ellipsoid(bm, (-2.385, Y, 0.958), (0.030, 0.050, 0.012))                                # brow
    _ellipsoid(bm, (-2.275, Y, 0.925), (0.032, 0.042, 0.024), _tilt(-30))                    # chin + jaw
    for s in (-1, 1): _ellipsoid(bm, (-2.385, Y + s * 0.078, 0.870), (0.026, 0.010, 0.032))  # ears
def hair(bm):              # long hair: from the crown over the basin rim and down into the bowl, wider than the head
    _ellipsoid(bm, (-2.43, Y, 0.875), (0.080, 0.095, 0.085), _tilt(-12))                     # over the crown
    _ellipsoid(bm, (-2.49, Y, 0.80), (0.075, 0.13, 0.060), _tilt(-35))                       # spilling into the bowl
    _ellipsoid(bm, (-2.50, Y, 0.755), (0.060, 0.15, 0.030))                                  # lying in the bowl
# The stylist (J 13:49: "to the right of the person laying down on the left seat"): she stands on the photo's RIGHT of the
# client, in the gap between the left basin (y -2.35) and the right basin (y -1.71), beside the basin (not behind it, not
# between the camera and her head), facing the client's head (-y), leaning in, both hands in the hair. ~1.68 m.
SX, SY = -2.40, -2.06
def stylist(bm):
    for s in (-1, 1):
        _limb(bm, (SX + s * 0.09, SY + 0.02, 0.07), (SX + s * 0.09, SY, 0.49), 0.055, 0.065)  # shin (0.42)
        _limb(bm, (SX + s * 0.09, SY, 0.49), (SX + s * 0.10, SY - 0.03, 0.91), 0.068, 0.090)  # thigh (0.42)
        _ellipsoid(bm, (SX + s * 0.09, SY - 0.07, 0.035), (0.05, 0.12, 0.035))               # shoe, toes toward her
    _ellipsoid(bm, (SX, SY - 0.04, 0.96), (0.18, 0.11, 0.12))                                # hips
    _ellipsoid(bm, (SX, SY - 0.10, 1.12), (0.15, 0.10, 0.13), Quaternion((1, 0, 0), math.radians(22)))   # waist, leaning in
    _ellipsoid(bm, (SX, SY - 0.19, 1.27), (0.19, 0.11, 0.15), Quaternion((1, 0, 0), math.radians(32)))   # chest + shoulders
    _limb(bm, (SX, SY - 0.25, 1.38), (SX, SY - 0.29, 1.47), 0.05)                            # neck
    _ellipsoid(bm, (SX, SY - 0.32, 1.57), (0.075, 0.095, 0.11), Quaternion((1, 0, 0), math.radians(30)))  # head (out of frame)
    for s, hand in ((-1, (-2.47, -2.655, 0.915)), (1, (-2.47, -2.525, 0.935))):              # both hands cupping the back of her head, in the hair
        sh = Vector((SX + s * 0.19, SY - 0.22, 1.32)); hd = Vector(hand)
        el, hd2 = ik(sh, hd + Vector((0, 0.07, 0.02)), 0.29, 0.25, sh + Vector((s * 0.4, -0.1, -0.4)))   # elbows out and down
        _limb(bm, sh, el, 0.048, 0.040); _limb(bm, el, hd2, 0.038, 0.030)
        _ellipsoid(bm, hd, (0.085, 0.042, 0.020), Quaternion((0, 1, 0), math.radians(35)))   # hand, fingers toward the wall, into the hair

C_CLIENT, C_HAIR, C_STYLIST = (0.66, 0.46, 0.34), (0.86, 0.68, 0.30), (0.20, 0.22, 0.27)   # warm skin tone, blond, dark slate
for n in ('PV_Client', 'PV_Head', 'PV_Hair', 'PV_Stylist'):
    o = bpy.data.objects.get(n)
    if o: bpy.data.objects.remove(o, do_unlink=True)
_obj('PV_Client', client, shaded("PV_m_client", C_CLIENT))
_obj('PV_Head', head, shaded("PV_m_client", C_CLIENT))
_obj('PV_Hair', hair, shaded("PV_m_hair", C_HAIR, lo=0.55))
_obj('PV_Stylist', stylist, shaded("PV_m_stylist", C_STYLIST, lo=0.55))

# ---------------------------------------------------------------- furniture: real shapes, soft shading
BLACK = shaded("PV_m_basin", (0.03, 0.03, 0.035), gloss=0.30)
LEATHER = shaded("PV_m_leather", (0.17, 0.11, 0.09), gloss=0.10)
CUSHION = shaded("PV_m_cushion", (0.30, 0.26, 0.33))
def rounded(o, w):
    if o.type != 'MESH' or o.get('v11r'): return
    o.data.transform(Matrix.Diagonal((*o.scale, 1))); o.scale = (1, 1, 1)
    b = o.modifiers.new('round', 'BEVEL'); b.width = w; b.segments = 4; b.limit_method = 'ANGLE'; o['v11r'] = 1
    for p in o.data.polygons: p.use_smooth = True
FURN = {}
for o in list(bpy.data.objects):
    if o.type != 'MESH' or not o.name.startswith(('bw_', 'ottoman_')): continue
    part = 'ottoman' if o.name.startswith('ottoman_') else o.name.split('_', 2)[2]
    if part in ('basin', 'pedestal'):
        mat = BLACK
        for p_ in o.data.polygons: p_.use_smooth = True
        if part == 'pedestal': rounded(o, 0.04)
    elif part == 'pillow': mat = CUSHION; rounded(o, 0.05)
    elif part == 'ottoman': mat = LEATHER; rounded(o, 0.03)
    else: mat = LEATHER; rounded(o, 0.035 if part in ('arm_a', 'arm_b', 'back', 'seat') else 0.02)
    o.data.materials.clear(); o.data.materials.append(mat); FURN[o.name] = part
bl = bpy.data.objects.get('bw_left_pillow')
if bl: bl.visible_shadow = False          # under her in the film; never in the photo's view of the wall (v10_projection BODY)

# ---------------------------------------------------------------- the room: the photo, projected
import numpy as np
im = bpy.data.images.load(PHOTO, check_existing=True)
px = np.array(im.pixels[:], dtype=np.float32).reshape(im.size[1], im.size[0], 4)[::-1, :, :3]    # top row first, sRGB
def sample(u, v, r=6):
    a = px[max(0, v - r):v + r, max(0, u - r):u + r].reshape(-1, 3); c = np.median(a, axis=0)
    return tuple(float(x) ** 2.2 for x in c)                     # to linear, for an emission colour
CREAM, WOOD, TILE = sample(1110, 560), sample(505, 400), sample(820, 800)
PM = photo_material()
for o in list(bpy.data.objects):
    if o.type != 'MESH' or o.name in FURN or o.name.startswith('PV_'): continue
    o.data.materials.clear(); o.data.materials.append(PM)
    o['fill'] = WOOD if o.name.startswith(('console', 'mirror', 'cabinet_wood')) else TILE if o.name == 'floor' else CREAM

# the visibility light: red, a point at the photo camera, hard shadows; the world black
lt = bpy.data.objects.get('PV_photo_light')
if lt: bpy.data.objects.remove(lt, do_unlink=True)
ld = bpy.data.lights.new('PV_photo_light', 'POINT'); ld.energy = 5000.0; ld.color = (1, 0, 0); ld.shadow_soft_size = 0.0
ld.use_shadow = True
lt = bpy.data.objects.new('PV_photo_light', ld); sc.collection.objects.link(lt)
lt.location = bpy.data.objects['cam_photo'].matrix_world.translation
w = bpy.data.worlds.new('PV_v11_world'); w.use_nodes = True
w.node_tree.nodes['Background'].inputs[0].default_value = (0, 0, 0, 1); sc.world = w
sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'None'
try: sc.eevee.use_shadows = True
except Exception: pass
try: sc.eevee.taa_render_samples = 32
except Exception: pass
print('V11_LOOK ok: mannequins, photo room (fill cream %s), furniture %d parts' % (tuple(round(c, 3) for c in CREAM), len(FURN)))
