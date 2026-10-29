# SPDX-License-Identifier: GPL-3.0-or-later
# Rooted v13 look (J 29 Oct, task 63623d0c), exec'd by v10_build_render.py --v13 right after v11_look.py:
#   1. NO PHOTO IN THE RENDER. J: the wall, the poster and the bottles "look very flat ... because the video includes a flat
#      image". The photo stays the REFERENCE only: every room surface becomes a plain solid shape whose colour is read from
#      the photo (6-shampoo-basins-edit.png through its solved camera), and only things the photos show are built.
#      The bottles become real bottles (cylinders, caps, pumps; one colour each, read from the photo; no labels, no words),
#      the low shelves become the wire baskets the photos show, the colour poster a black frame round a plain panel.
#   2. THE WATER, FROM ITS SOURCE. The photos (12, 17) show a chrome gooseneck tap at the back of each bowl. It is built at
#      the back of her bowl, swung a little toward the camera, and a slow clear stream falls from it onto her hair on the
#      camera's side and runs down the hair into the bowl. Its streaks drift down slowly (slow motion, calm).
#   3. SLOW, GENTLE HANDS. J: the hands felt "robotic and a bit creepy". The stylist's fingers stay at the scalp (test 5)
#      and now draw one slow small circle each (1 cm, 5 s a turn, the two hands half a turn apart), shape-keyed every
#      4 frames, linear between: no jerks, no fast moves.
import bpy, bmesh, math
import numpy as np
from mathutils import Vector, Matrix, Quaternion

sc = bpy.context.scene
bpy.context.preferences.edit.keyframe_new_interpolation_type = 'LINEAR'   # every key below: linear, no ease, no overshoot
G = V11                                   # the v11 look's namespace (helpers, the stylist's place), passed by the runner
shaded, _ellipsoid, _limb, ik = G['shaded'], G['_ellipsoid'], G['_limb'], G['ik']
SX, SY, Y = G['SX'], G['SY'], G['Y']
XW = -2.665
FR = FRAMES

# ---------------------------------------------------------------- colours, read from the photo (reference only)
im = bpy.data.images.load(PHOTO_PATH, check_existing=True)
PX = np.array(im.pixels[:], dtype=np.float32).reshape(im.size[1], im.size[0], 4)[::-1, :, :3]
PC = bpy.data.objects['cam_photo'].matrix_world.inverted(); PF, PW, PH = 1072.0, 1280, 854
def photo_colour(P, r=4, fallback=(0.7, 0.65, 0.58)):
    q = PC @ Vector(P)
    if q.z >= 0: return fallback
    u = int(PW / 2 + PF * q.x / -q.z); v = int(PH / 2 - PF * q.y / -q.z)
    if not (r <= u < PW - r and r <= v < PH - r): return fallback
    c = np.median(PX[v - r:v + r + 1, u - r:u + r + 1].reshape(-1, 3), axis=0)
    return tuple(float(x) ** 2.2 for x in c)
def at_px(u, v, r=6):
    return tuple(float(x) ** 2.2 for x in np.median(PX[v - r:v + r, u - r:u + r].reshape(-1, 3), axis=0))
CREAM, TILE = at_px(1110, 560), at_px(820, 800)
WOOD = at_px(505, 400)                                  # the drawer unit's front in the photo (as v11)
M_CREAM = shaded('V13_cream', CREAM, lo=0.62); M_WOOD = shaded('V13_wood', WOOD, lo=0.5); M_TILE = shaded('V13_tile', TILE, lo=0.6)
M_BLACK = shaded('V13_black', (0.02, 0.02, 0.022), gloss=0.25); M_GLASS = shaded('V13_glass', (0.50, 0.58, 0.56), gloss=0.3, lo=0.7)
M_METAL = shaded('V13_metal', (0.42, 0.42, 0.44), gloss=0.6, lo=0.55); M_CHROME = shaded('V13_chrome', (0.55, 0.56, 0.60), gloss=0.9, lo=0.35)
M_CAP = shaded('V13_cap', (0.80, 0.79, 0.76), lo=0.6)

def set_mat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
def box(name, x0, x1, y0, y1, z0, z1, m):
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
    for v in bm.verts: v.co = Vector(((x0 + x1) / 2 + v.co.x * (x1 - x0), (y0 + y1) / 2 + v.co.y * (y1 - y0), (z0 + z1) / 2 + v.co.z * (z1 - z0)))
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free(); me.materials.append(m)
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); return o
def mesh_obj(name, build, m, smooth=True):
    old = bpy.data.objects.get(name)
    if old: bpy.data.objects.remove(old, do_unlink=True)
    bm = bmesh.new(); build(bm)
    for f in bm.faces: f.smooth = smooth
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    for mm in (m if isinstance(m, list) else [m]): me.materials.append(mm)
    o = bpy.data.objects.new(name, me); sc.collection.objects.link(o); o.visible_shadow = False; return o

# ---------------------------------------------------------------- 1. the room: solid shapes, photo colours, no photo
FURN = ('bw_', 'ottoman_')
for o in list(bpy.data.objects):
    if o.type != 'MESH' or o.name.startswith(FURN) or o.name.startswith(('PV_', 'V13_')): continue
    n = o.name
    if n.startswith('bottles_'): o.hide_render = True; o.hide_viewport = True; continue      # rebuilt as bottles below
    if n.startswith(('console', 'mirror', 'cabinet_wood')): m = M_WOOD
    elif n == 'floor': m = M_TILE
    elif n.startswith(('poster_', 'shelf_black', 'styling_', 'blind_base')): m = M_BLACK
    elif n.startswith('shelf_L_low') or n.startswith('shelf_R_low'): m = M_METAL
    elif n.startswith('shelf_'): m = M_GLASS
    elif n == 'cabinets_upper': m = shaded('V13_cabinets', photo_colour(o.matrix_world.translation + Vector((0.18, 0, 0))), lo=0.55)
    elif n == 'blind': m = shaded('V13_blind', photo_colour(o.matrix_world.translation), lo=0.6)
    elif n == 'fg_chair': m = bpy.data.materials.get('PV_m_leather') or M_BLACK
    else: m = M_CREAM
    set_mat(o, m)
# the colour poster: its black frame (poster_colour) + a plain panel in the poster's own mean colour, proud of the frame
pan_col = photo_colour((XW + 0.03, -2.06, 1.27), r=40)
box('V13_poster_panel', XW + 0.030, XW + 0.034, -2.33, -1.79, 0.93, 1.60, shaded('V13_poster_panel', pan_col, lo=0.6))
box('V13_poster_bw_panel', -2.60, -2.14, -4.681 + 0.030, -4.681 + 0.034, 1.13, 1.88, shaded('V13_poster_bw', (0.30, 0.30, 0.30), lo=0.6))
# the low shelves are wire baskets in the photos: a front rail and two end rails
for side, (y0, y1, z0) in (('L', (-2.83, -2.41, 0.97)), ('R', (-1.65, -1.29, 0.97))):
    box(f'V13_basket_{side}_front', XW + 0.115, XW + 0.125, y0, y1, z0 + 0.06, z0 + 0.075, M_METAL)
    for y in (y0, y1 - 0.01): box(f'V13_basket_{side}_end{y:.2f}', XW, XW + 0.125, y, y + 0.01, z0 + 0.06, z0 + 0.075, M_METAL)
# bottles: one per 6.5 cm along each old block, each one colour read from the photo at its own middle
BOTTLE_MATS = {}
def bottle_row(tag, y0, y1, z0, z1, pumps):
    n = max(1, int((y1 - y0) / 0.065)); dy = (y1 - y0) / n; parts = []
    for k in range(n):
        y = y0 + dy * (k + 0.5); h = (z1 - z0) * (0.80, 1.0, 0.90, 0.97, 0.85)[k % 5] - 0.03; r = min(0.029, dy * 0.44)
        col = photo_colour((XW + 0.05, y, z0 + h * 0.5), r=3)
        key = tuple(round(c, 2) for c in col)
        if key not in BOTTLE_MATS: BOTTLE_MATS[key] = shaded(f'V13_bottle_{len(BOTTLE_MATS)}', col, gloss=0.15, lo=0.5)
        parts.append((y, h, r, BOTTLE_MATS[key]))
    for k, (y, h, r, m) in enumerate(parts):
        cx = XW + 0.05
        def build(bm, y=y, h=h, r=r):
            bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=r, radius2=r, depth=h, matrix=Matrix.Translation((cx, y, z0 + h / 2)))
            bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=r * 0.75, radius2=r * 0.35, depth=0.02, matrix=Matrix.Translation((cx, y, z0 + h + 0.01)))   # shoulder
        mesh_obj(f'V13_bottle_{tag}_{k}', build, m)
        def cap(bm, y=y, h=h, r=r):
            bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.010, radius2=0.010, depth=0.03, matrix=Matrix.Translation((cx, y, z0 + h + 0.035)))
            if pumps: bmesh.ops.create_cube(bm, size=1.0, matrix=Matrix.Translation((cx + 0.012, y, z0 + h + 0.052)) @ Matrix.Diagonal((0.035, 0.009, 0.008, 1)))
        mesh_obj(f'V13_cap_{tag}_{k}', cap, M_CAP)
bottle_row('L_top', -2.92, -2.35, 1.34, 1.62, True); bottle_row('L_low', -2.80, -2.44, 0.97, 1.26, False)
bottle_row('R_top', -1.69, -1.18, 1.34, 1.63, True); bottle_row('R_low', -1.62, -1.32, 0.97, 1.23, False)

# ---------------------------------------------------------------- 2. the tap and the water
BACK = Vector((-2.530, Y - 0.03, 0.85))               # the back rim of her bowl (the tap in photos 12 and 17), just clear of the low shelf
LAND = Vector((-2.470, Y - 0.045, 0.0))               # where the stream meets her hair: on the crown, between the hands, seen against the bottles
# the hair surface under LAND: cast down onto PV_Hair
dg = bpy.context.evaluated_depsgraph_get()
hit, loc, nrm, _, ob, _ = sc.ray_cast(dg, Vector((LAND.x, LAND.y, 1.20)), Vector((0, 0, -1)), distance=0.6)   # in front of the shelves: straight down onto the hair
LAND = loc if hit else Vector((LAND.x, LAND.y, 0.86))
print('V13 water lands on', ob.name if hit else None, tuple(round(c, 3) for c in LAND))
TIP = Vector((LAND.x, LAND.y, LAND.z + 0.10))         # 10 cm of gentle fall, above her hair line: the camera sees the stream
V13B = globals().get('V13B', False)                  # v13b (test 7, CEO bd151538): test 6 drew the water stand-in as a tall chrome column and no water.
if V13B:                                             # so: NO water stand-in, and the tap at the photos' size (12, 17): a short gooseneck
    BACK = Vector((-2.555, Y - 0.03, 0.85))           # on the back rim, ~11 cm tall, its spout curving over the bowl toward her crown
    TIP = Vector((-2.505, Y - 0.035, 0.925))
def tap(bm):
    _limb(bm, BACK + Vector((0, 0, -0.01)), BACK + Vector((0, 0, 0.04)), 0.017)                  # body
    top = Vector((BACK.x, BACK.y, TIP.z + (0.035 if V13B else 0.03))); _limb(bm, BACK + Vector((0, 0, 0.04)), top, 0.011)   # riser
    arc = [top]
    for k in range(1, 9):                             # gooseneck from the riser over to the tip, ending pointing down
        t = k / 8; a = math.pi * t
        p = top.lerp(Vector((TIP.x, TIP.y, top.z)), 0.5 - 0.5 * math.cos(a)) + Vector((0, 0, 0.012 * math.sin(a)))
        p.z = p.z + (TIP.z + 0.012 - top.z) * t * t
        arc.append(p)
    for a_, b_ in zip(arc, arc[1:]): _limb(bm, a_, b_, 0.010)
    _limb(bm, arc[-1], TIP, 0.012, 0.010)                                                       # spray head
    _limb(bm, BACK + Vector((0.0, 0.0, 0.03)), BACK + Vector((-0.04, 0.0, 0.05)), 0.006)          # lever, toward the wall
def short_spout(bm):         # v13b (J 29 Oct 10:00): the real tap in photos 12/17 is a SHORT, LOW chrome spout on the back rim, not a gooseneck:
    B = SPOUT                 # a flat base ring, a ~6 cm round body, a squat lever head with two small wings, a 3 cm stub spout over the bowl
    _limb(bm, B, B + Vector((0, 0, 0.008)), 0.024, 0.024)                                      # base ring on the rim
    _limb(bm, B + Vector((0, 0, 0.008)), B + Vector((0, 0, 0.058)), 0.016, 0.015)              # body
    _ellipsoid(bm, B + Vector((0, 0, 0.064)), (0.019, 0.019, 0.010))                           # head
    for s_ in (-1, 1): _limb(bm, B + Vector((0, s_ * 0.010, 0.068)), B + Vector((0.004, s_ * 0.020, 0.080)), 0.004)   # lever wings
    _limb(bm, B + Vector((0.008, 0, 0.040)), B + Vector((0.038, 0, 0.032)), 0.007, 0.006)       # stub spout, toward her crown
SPOUT = Vector((-2.578, Y - 0.085, 0.85))     # back rim, left of the bowl's centre as in photo 12 (the camera's side)
def plain_cylinder(bm):      # v13b-b (CEO 675d5797): Dreamina refused v13b's upload; the tap as ONE plain low chrome cylinder, same place, same height
    _limb(bm, SPOUT, SPOUT + Vector((0, 0, 0.070)), 0.017, 0.017)
V13B_TAP = globals().get('V13B_TAP', 'spout')   # spout (v13b) | none (v13b-a) | cylinder (v13b-b)
if V13B and V13B_TAP == 'none': pass
elif V13B and V13B_TAP == 'cylinder': mesh_obj('V13_tap', plain_cylinder, M_CHROME)
elif V13B and V13B_TAP == 'faucet':          # v13f (CEO 646a8174): a SMALL recognisable faucet, top below her crown: short curved neck,
    def small_faucet(bm):                     # a downturned spout whose mouth is where the v13c/d stream starts, and a lever
        _limb(bm, SPOUT, SPOUT + Vector((0, 0, 0.008)), 0.020, 0.020)                              # base ring
        _limb(bm, SPOUT + Vector((0, 0, 0.008)), SPOUT + Vector((0, 0, 0.060)), 0.011, 0.010)      # neck
        pts = [SPOUT + Vector((0, -0.022 * (0.5 - 0.5 * math.cos(math.pi * t)), 0.060 + 0.022 * math.sin(math.pi * t) + (0.069 - 0.060) * t - 0.009 * t)) for t in [k / 8 for k in range(9)]]
        for a_, b_ in zip(pts, pts[1:]): _limb(bm, a_, b_, 0.0095, 0.0095)                       # the curve over and down, toward the camera side
        _limb(bm, pts[-1], pts[-1] + Vector((0, 0, -0.008)), 0.011, 0.010)                        # downturned mouth
        _limb(bm, SPOUT + Vector((0, 0, 0.040)), SPOUT + Vector((-0.030, 0, 0.055)), 0.005)       # lever, toward the wall
    mesh_obj('V13_tap', small_faucet, M_CHROME)
elif V13B: mesh_obj('V13_tap', short_spout, M_CHROME)
else: mesh_obj('V13_tap', tap, M_CHROME)
box('V13_basin_deck', -2.64, -2.56, Y - 0.16, Y + 0.16, 0.80, 0.85, bpy.data.materials.get('PV_m_basin') or M_BLACK)

def water_material():
    m = bpy.data.materials.get('V13_water') or bpy.data.materials.new('V13_water'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear()
    N = nt.nodes.new; Lk = nt.links.new
    tc = N('ShaderNodeTexCoord'); mp = N('ShaderNodeMapping'); Lk(tc.outputs['Object'], mp.inputs['Vector'])
    mp.inputs['Scale'].default_value = (140, 140, 6)
    nz = N('ShaderNodeTexNoise'); nz.inputs['Scale'].default_value = 1.0; nz.inputs['Detail'].default_value = 3.0; Lk(mp.outputs[0], nz.inputs['Vector'])
    ramp = N('ShaderNodeValToRGB'); Lk(nz.outputs['Fac'], ramp.inputs['Fac'])
    ramp.color_ramp.elements[0].position = 0.40; ramp.color_ramp.elements[0].color = (0.55, 0.70, 0.80, 1)
    ramp.color_ramp.elements[1].position = 0.55; ramp.color_ramp.elements[1].color = (1.0, 1.0, 1.0, 1)
    lw = N('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.4
    a = N('ShaderNodeMath'); a.operation = 'MULTIPLY_ADD'; a.inputs[1].default_value = 0.25; a.inputs[2].default_value = 0.70   # mostly opaque, white streaks: reads as running water, not a glass rod (blind check v13)
    Lk(lw.outputs['Fresnel'], a.inputs[0]); a.use_clamp = True
    em = N('ShaderNodeEmission'); Lk(ramp.outputs['Color'], em.inputs['Color'])
    tr = N('ShaderNodeBsdfTransparent'); mix = N('ShaderNodeMixShader'); Lk(a.outputs[0], mix.inputs['Fac'])
    Lk(tr.outputs[0], mix.inputs[1]); Lk(em.outputs[0], mix.inputs[2])
    out = N('ShaderNodeOutputMaterial'); Lk(mix.outputs[0], out.inputs[0])
    try: m.surface_render_method = 'BLENDED'
    except Exception: m.blend_method = 'BLEND'
    loc = mp.inputs['Location']                        # streaks drift down ~4 cm a second: slow motion
    loc.default_value = (0, 0, 0); loc.keyframe_insert('default_value', frame=1)
    loc.default_value = (0, 0, 0.12 * (FR - 1) / 24); loc.keyframe_insert('default_value', frame=FR)
    return m
M_WATER = water_material()
def hair_path(start, n=9, step=0.022):
    """From `start`, walk down the hair's surface toward the bowl (gravity along the surface), a few mm proud of it."""
    pts = [start]; p = start.copy()
    for _ in range(n):
        q = p + Vector((-0.35, -0.10, -1.0)).normalized() * step + Vector((0, 0, 0.06))
        h, l, nn, _, o, _ = sc.ray_cast(dg, q, Vector((0, 0, -1)), distance=0.3)
        if not h or l.z < 0.70: break
        p = l + nn * 0.004; pts.append(p)
    return pts
def water(bm):
    _limb(bm, TIP, LAND + Vector((0, 0, 0.004)), 0.0070, 0.0095)                                 # the falling stream
    for dy, r in ((0.0, 0.0065), (0.012, 0.0045), (-0.012, 0.0045)):                              # running down the hair into the bowl
        pts = hair_path(LAND + Vector((0, dy, 0.004)))
        for a_, b_ in zip(pts, pts[1:]): _limb(bm, a_, b_, r, r * 0.9)
    _ellipsoid(bm, LAND + Vector((0, 0, 0.004)), (0.016, 0.016, 0.004))                          # where it meets the hair
if not V13B and not globals().get('V13_NOWATER'): mesh_obj('V13_water', water, M_WATER).visible_shadow = False   # v13e (CEO 646a8174): --nowater = v13 with the column removed, the tall tap kept   # v13b: no stand-in; the prompt's words carry the water
# v13c (CEO 402ab8d3): Dreamina refused every previz WITHOUT water (v13b, -a, -b), approved v13 WITH it. So: the plain cylinder tap
# + ONE short thin clear arc from its mouth, curving down onto the back of her head and on into the bowl. ~1 cm thick, pale blue,
# half see-through, never higher than the tap's top (test 6 copied v13's tall glassy column as a chrome pipe).
if V13B and globals().get('V13C'):
    def arc_material():
        m = bpy.data.materials.new('V13c_water'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); N = nt.nodes.new; Lk = nt.links.new
        em = N('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.62, 0.80, 0.95, 1)
        tr = N('ShaderNodeBsdfTransparent'); mix = N('ShaderNodeMixShader'); mix.inputs['Fac'].default_value = 0.55
        Lk(tr.outputs[0], mix.inputs[1]); Lk(em.outputs[0], mix.inputs[2]); out = N('ShaderNodeOutputMaterial'); Lk(mix.outputs[0], out.inputs[0])
        try: m.surface_render_method = 'BLENDED'
        except Exception: m.blend_method = 'BLEND'
        return m
    TOPZ = SPOUT.z + 0.070
    P0 = SPOUT + Vector((0.0, -0.017, 0.064))                       # the mouth: the top edge of the cylinder, on the camera's side
    if V13B_TAP == 'faucet': P0 = SPOUT + Vector((0.0, -0.022, 0.052))   # v13f: the small faucet's downturned mouth
    aim = Vector((-2.530, Y - 0.110, 0.0))                          # the back of her head, camera side: the only landing the stylist's near hand does not hide (searched, 100 % of the arc visible)
    h, LND, _, _, o_, _ = sc.ray_cast(dg, Vector((aim.x, aim.y, TOPZ - 0.002)), Vector((0, 0, -1)), distance=0.4)
    LND = LND if h else Vector((aim.x, aim.y, 0.86))
    print('V13c arc lands on', o_.name if h else None, tuple(round(c, 3) for c in LND))
    C1 = Vector((P0.x + (LND.x - P0.x) * 0.65, P0.y + (LND.y - P0.y) * 0.65, P0.z))   # quadratic arc: leaves level, falls (top = P0.z < TOPZ)
    ARC = [(1 - t) ** 2 * P0 + 2 * (1 - t) * t * C1 + t * t * (LND + Vector((0, 0, 0.003))) for t in [k / 10 for k in range(11)]]
    ARC += hair_path(LND + Vector((0, 0, 0.003)))[1:]                # then on down the hair into the bowl
    assert max(p.z for p in ARC) <= TOPZ, 'arc above the tap'
    V13D = globals().get('V13D', False)        # v13d (J 'Yes continue' 10:56, CEO bd901926): v13's water LOOK at the low tap's height
    RW = 0.0095 if V13D else 0.005             # v13d: as thick and glassy as v13's stand-in (r 7-9.5 mm, its streaky material)
    def arc_mesh(bm):
        for k, (a_, b_) in enumerate(zip(ARC, ARC[1:])): _limb(bm, a_, b_, RW if k < 10 else RW * 0.75, RW if k < 9 else RW * 0.75)
        if V13D: _ellipsoid(bm, LND + Vector((0, 0, 0.004)), (0.018, 0.018, 0.005))      # where it meets her hair
    mesh_obj('V13c_water_arc', arc_mesh, M_WATER if V13D else arc_material()).visible_shadow = False
    if V13D:                                   # clear pale water pooled in the black bowl around her hair
        def pool_mat():
            m = bpy.data.materials.new('V13d_pool'); m.use_nodes = True; nt = m.node_tree; nt.nodes.clear(); N = nt.nodes.new; Lk = nt.links.new
            lw = N('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.3
            mp = N('ShaderNodeMapRange'); mp.inputs['To Min'].default_value = 0.35; mp.inputs['To Max'].default_value = 0.85; Lk(lw.outputs['Facing'], mp.inputs['Value'])
            em = N('ShaderNodeEmission'); em.inputs['Color'].default_value = (0.60, 0.78, 0.90, 1)
            tr = N('ShaderNodeBsdfTransparent'); mix = N('ShaderNodeMixShader'); Lk(mp.outputs['Result'], mix.inputs['Fac'])
            Lk(tr.outputs[0], mix.inputs[1]); Lk(em.outputs[0], mix.inputs[2]); out = N('ShaderNodeOutputMaterial'); Lk(mix.outputs[0], out.inputs[0])
            try: m.surface_render_method = 'BLENDED'
            except Exception: m.blend_method = 'BLEND'
            return m
        POOL = globals().get('POOL', (-2.437, Y - 0.01, 0.818, 0.118, 0.225, 0.006))   # just under the rim, so the camera sees it around her hair (at 0.775 the near rim hid it)
        def pool(bm): _ellipsoid(bm, POOL[:3], POOL[3:])
        mesh_obj('V13d_pool', pool, pool_mat()).visible_shadow = False

# v13g (CEO be49598a): Dreamina's review refused the cartoon face (round head, eyes, blush on a reclining figure read as a child);
# the same video with the face covered was approved. So her head is a plain FACELESS ADULT mannequin head: the v11 skull, jaw and
# ears only (adult 0.22 m head), one skin tone: no eyes, brows, lips, blush or nose bump. Hair unchanged. The stylist's head was
# already a plain oval (and is out of frame).
if globals().get('V13G'):
    G['_obj']('PV_Head', G['head'], G['shaded']("PV_m_client", G['C_CLIENT']))

# ---------------------------------------------------------------- 3. the stylist, hands circling slowly
HANDS = [(-1, Vector((-2.465, -2.678, 0.885))), (1, Vector((-2.465, -2.502, 0.895)))]     # test 5: at the scalp, behind the ears
R_CIRCLE, PERIOD = 0.010, 120.0                        # 1 cm, 5 s a turn
def hand_offsets(f):
    out = []
    for k, (s, _) in enumerate(HANDS):
        a = 2 * math.pi * (f - 1) / PERIOD + k * math.pi
        out.append(Vector((R_CIRCLE * math.cos(a), 0.0, R_CIRCLE * 0.7 * math.sin(a))))    # in the plane of the side of her head
    return out
def stylist_at(f):
    offs = hand_offsets(f)
    def build(bm):
        for s in (-1, 1):
            _limb(bm, (SX + s * 0.09, SY + 0.02, 0.07), (SX + s * 0.09, SY, 0.49), 0.055, 0.065)
            _limb(bm, (SX + s * 0.09, SY, 0.49), (SX + s * 0.10, SY - 0.03, 0.91), 0.068, 0.090)
            _ellipsoid(bm, (SX + s * 0.09, SY - 0.07, 0.035), (0.05, 0.12, 0.035))
        _ellipsoid(bm, (SX, SY - 0.04, 0.96), (0.18, 0.11, 0.12))
        _ellipsoid(bm, (SX, SY - 0.10, 1.12), (0.15, 0.10, 0.13), Quaternion((1, 0, 0), math.radians(22)))
        _ellipsoid(bm, (SX, SY - 0.19, 1.27), (0.19, 0.11, 0.15), Quaternion((1, 0, 0), math.radians(32)))
        _limb(bm, (SX, SY - 0.25, 1.38), (SX, SY - 0.29, 1.47), 0.05)
        _ellipsoid(bm, (SX, SY - 0.32, 1.57), (0.075, 0.095, 0.11), Quaternion((1, 0, 0), math.radians(30)))
        for (s, hand), d in zip(HANDS, offs):
            sh = Vector((SX + s * 0.19, SY - 0.22, 1.32)); hd = hand + d
            el, hd2 = ik(sh, hd + Vector((0, 0.07, 0.02)), 0.29, 0.25, sh + Vector((s * 0.4, -0.1, -0.4)))
            _limb(bm, sh, el, 0.048, 0.040); _limb(bm, el, hd2, 0.038, 0.030)
            _ellipsoid(bm, hd, (0.085, 0.042, 0.020), Quaternion((0, 1, 0), math.radians(35)))
    bm = bmesh.new(); build(bm); co = [v.co.copy() for v in bm.verts]; return bm, co
bm0, _ = stylist_at(1)
st = mesh_obj('PV_Stylist', lambda bm: None, bpy.data.materials.get('PV_m_stylist'))
me = st.data; bm0.to_mesh(me); bm0.free()
for p in me.polygons: p.use_smooth = True
st.shape_key_add(name='Basis', from_mix=False)
STEP = 4; samples = list(range(1, FR + 1, STEP)) + ([FR] if (FR - 1) % STEP else [])
keys = []
for f in samples[1:]:
    bm, co = stylist_at(f); bm.free(); k = st.shape_key_add(name=f'f{f}', from_mix=False)
    k.data.foreach_set('co', [c for v in co for c in v]); keys.append((f, k))
allf = samples
for i, (f, k) in enumerate(keys):
    j = i + 1; prev = allf[j - 1]; nxt = allf[j + 1] if j + 1 < len(allf) else None
    k.value = 0.0; k.keyframe_insert('value', frame=prev); k.value = 1.0; k.keyframe_insert('value', frame=f)
    if nxt: k.value = 0.0; k.keyframe_insert('value', frame=nxt)

# ---------------------------------------------------------------- the light: no photo, no visibility light; a soft dark world
lt = bpy.data.objects.get('PV_photo_light')
if lt: bpy.data.objects.remove(lt, do_unlink=True)
w = bpy.data.worlds.new('V13_world'); w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.02, 0.018, 0.016, 1); sc.world = w
left = [o.name for o in bpy.data.objects if o.type == 'MESH' and any(s.material and s.material.name == 'PV_photo' for s in o.material_slots) and not o.hide_render]
print('V13_LOOK ok: photo on %d objects (must be 0), %d bottle colours, stylist %d shape keys, water + tap built' % (len(left), len(BOTTLE_MATS), len(keys)))
