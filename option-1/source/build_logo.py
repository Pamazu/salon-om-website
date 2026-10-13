"""Vector redraw of the Salon OM logo.
Coordinates are in the half-resolution frame of the supplied logo (1286 x 1071).
Outputs single-path SVGs (all strokes outlined and unioned) so the mark scales,
cuts (vinyl / laser / embroidery) and recolours cleanly."""
import math, sys
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import pathops

FS = '/home/claude/fontsrc/node_modules/@fontsource/'

def glyph_path(font_file, ch, transform):
    f = TTFont(font_file)
    gs = f.getGlyphSet(); g = gs[f.getBestCmap()[ord(ch)]]
    p = pathops.Path()
    pen = p.getPen(glyphSet=gs)
    g.draw(TransformPen(pen, transform))
    return p, g, gs

def glyph_bounds(font_file, ch):
    f = TTFont(font_file)
    gs = f.getGlyphSet(); g = gs[f.getBestCmap()[ord(ch)]]
    bp = BoundsPen(gs); g.draw(bp); return bp.bounds

# ---------- variable-width stroke outliner ----------
def catmull(pts, n=16):
    out = []
    P = [pts[0]] + pts + [pts[-1]]
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i-1], P[i], P[i+1], P[i+2]
        for k in range(n):
            t = k / n; t2, t3 = t*t, t*t*t
            x = 0.5*((2*p1[0]) + (-p0[0]+p2[0])*t + (2*p0[0]-5*p1[0]+4*p2[0]-p3[0])*t2 + (-p0[0]+3*p1[0]-3*p2[0]+p3[0])*t3)
            y = 0.5*((2*p1[1]) + (-p0[1]+p2[1])*t + (2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t2 + (-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t3)
            w = p1[2] + (p2[2]-p1[2])*t
            out.append((x, y, w))
    out.append(pts[-1])
    return out

HW = 1.0          # hairline boost for the small-size (optical) cut; 1.0 = master
SALON_WEIGHT = 300

def adj(w):
    return w * (1 + (HW - 1) * max(0.0, 1 - w / 12.0))

def stroke(pts, n=16, round_ends=True):
    """pts: list of (x, y, width). Returns a closed pathops.Path."""
    pts = [(x, y, adj(w)) for (x, y, w) in pts]
    s = catmull(pts, n)
    left, right = [], []
    for i, (x, y, w) in enumerate(s):
        a = s[max(i-1, 0)]; b = s[min(i+1, len(s)-1)]
        dx, dy = b[0]-a[0], b[1]-a[1]; L = math.hypot(dx, dy) or 1
        nx, ny = -dy/L, dx/L
        left.append((x+nx*w/2, y+ny*w/2)); right.append((x-nx*w/2, y-ny*w/2))
    p = pathops.Path()
    poly = left + right[::-1]
    p.moveTo(*poly[0])
    for q in poly[1:]: p.lineTo(*q)
    p.close()
    if round_ends:
        for (x, y, w) in (s[0], s[-1]):
            if w > 1.2: p = union(p, circle(x, y, w/2))
    return p

def circle(cx, cy, r, n=32):
    p = pathops.Path(); k = 0.5523*r
    p.moveTo(cx+r, cy)
    p.cubicTo(cx+r, cy+k, cx+k, cy+r, cx, cy+r)
    p.cubicTo(cx-k, cy+r, cx-r, cy+k, cx-r, cy)
    p.cubicTo(cx-r, cy-k, cx-k, cy-r, cx, cy-r)
    p.cubicTo(cx+k, cy-r, cx+r, cy-k, cx+r, cy)
    p.close(); return p

def union(*ps):
    out = pathops.Path()
    pathops.union(list(ps), out.getPen())
    return out

def arc(cx, cy, r, a0, a1, w, taper=10, steps=80):
    """clockwise (screen) arc from angle a0 to a1 in degrees, tapering ends."""
    if a1 < a0: a1 += 360
    pts = []
    for i in range(steps+1):
        t = i/steps; a = math.radians(a0 + (a1-a0)*t)
        e = min(i, steps-i) / taper
        ww = w * min(1.0, 0.25 + 0.75*e)
        pts.append((cx + r*math.cos(a), cy + r*math.sin(a), ww))
    return stroke(pts, n=2, round_ends=False)

def ang(x, y, cx, cy): return math.degrees(math.atan2(y-cy, x-cx)) % 360

CX, CY, R = 662, 522, 390

def build(hw=1.0, salon_weight=300, salon_em=66.0):
    global HW, SALON_WEIGHT
    HW, SALON_WEIGHT = hw, salon_weight
    parts = {}
    # ----- circle (two arcs, gaps for SALON and the flourish) -----
    ringA = arc(CX, CY, R, ang(572, 148, CX, CY), ang(1055, 540, CX, CY), 4.2, taper=14)
    ringB = arc(CX, CY, R, ang(1008, 697, CX, CY), ang(268, 495, CX, CY), 4.2, taper=14)
    parts['ring'] = union(ringA, ringB)

    # ----- O : Cormorant Garamond SemiBold, condensed to the logo's oval -----
    ofile = FS + 'cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff'
    x0, y0, x1, y1 = glyph_bounds(ofile, 'O')
    bx0, by0, bx1, by1 = 377, 320, 712, 675
    sx = (bx1-bx0)/(x1-x0); sy = (by1-by0)/(y1-y0)
    O, _, _ = glyph_path(ofile, 'O', (sx, 0, 0, -sy, bx0 - x0*sx, by1 + y0*sy))
    parts['O'] = O

    # ----- m : drawn as calligraphic strokes -----
    leg1 = pathops.Path()
    for poly in [
        # stem
        [(746, 476), (777, 470), (777, 622), (782, 628), (797, 629), (797, 632), (728, 632), (728, 629), (741, 628), (746, 622)],
        # top-left flag serif
        [(737, 475), (750, 470), (777, 466), (777, 478), (746, 480)],
    ]:
        q = pathops.Path(); q.moveTo(*poly[0]); [q.lineTo(*pt) for pt in poly[1:]]; q.close()
        leg1 = union(leg1, q)
    arch1 = stroke([(777, 516, 2.6), (790, 494, 2.8), (808, 478, 4), (828, 471, 10), (843, 478, 18), (848, 492, 22),
                    (849, 530, 23), (849, 575, 23), (848, 596, 21)], n=12)
    arch2 = stroke([(862, 556, 2.4), (874, 530, 2.6), (890, 503, 3.2), (906, 488, 6), (922, 486, 14), (931, 498, 20),
                    (934, 530, 21), (937, 572, 20), (946, 606, 15), (962, 630, 9), (982, 644, 5), (1005, 650, 3.6),
                    (1040, 655, 3.6), (1072, 650, 4), (1089, 630, 4.4), (1078, 608, 4), (1048, 604, 3.4),
                    (1018, 618, 2.8), (992, 636, 2.0)], n=14)
    parts['m'] = union(leg1, arch1, arch2)

    # ----- tail: the long hairline sweeping down-left across the ring -----
    tail = stroke([(974, 648, 2.4), (952, 672, 2.6), (925, 712, 2.8), (902, 765, 3.2), (887, 820, 4.2),
                   (874, 858, 5.2), (858, 896, 6.4), (830, 932, 7.0), (792, 960, 6.4), (745, 983, 4.6),
                   (712, 994, 2.4), (694, 997, 0.8)], n=14)
    parts['tail'] = tail

    # ----- SALON along the ring (Jost Light, outlined) -----
    sfile = FS + 'jost/files/jost-latin-%d-normal.woff' % SALON_WEIGHT
    em = salon_em; s = em/1000
    letters = 'SALON'
    a_start, a_end = 196.5, 243.0
    salon = pathops.Path()
    for i, ch in enumerate(letters):
        a = a_start + (a_end-a_start)*i/(len(letters)-1)
        rr = R - 37
        bx, by, ex, ey = glyph_bounds(sfile, ch)
        gw = ex - bx
        # place glyph so its horizontal centre sits on the radius, baseline on circle rr
        th = math.radians(a + 90)  # tangent direction (letters upright, reading clockwise)
        cos, sin = math.cos(th), math.sin(th)
        px = CX + rr*math.cos(math.radians(a)); py = CY + rr*math.sin(math.radians(a))
        # glyph coords (gx, gy) -> local (u = (gx - bx - gw/2)*s, v = -gy*s), then rotate by th, translate
        # x' = px + u*cos - v*sin ; y' = py + u*sin + v*cos
        a_ = s*cos; b_ = s*sin; c_ = s*sin; d_ = -s*cos
        e_ = px - (bx + gw/2)*s*cos; f_ = py - (bx + gw/2)*s*sin
        # affine (a b c d e f) in fontTools order: x' = a*x + c*y + e ; y' = b*x + d*y + f
        g, _, _ = glyph_path(sfile, ch, (a_, b_, c_, d_, e_, f_))
        salon = union(salon, g)
    parts['salon'] = salon
    return parts

def svg_d(p):
    from fontTools.pens.svgPathPen import SVGPathPen
    pen = SVGPathPen(None, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    p.draw(pen); return pen.getCommands()

if __name__ == '__main__':
    parts = build()
    allp = union(*parts.values())
    import json
    json.dump({k: svg_d(v) for k, v in parts.items()} | {'all': svg_d(allp)}, open('paths.json', 'w'))
    b = allp.bounds; print('bounds', b)
