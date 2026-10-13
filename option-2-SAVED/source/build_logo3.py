"""Salon OM, Option 2 logo v3: "SALON" tracked small ABOVE a lean classical "OM".
Outlined from Cormorant Garamond (SIL OFL): OM in Light 300 (master) or Regular 400 (small cut),
SALON in Medium 500 / SemiBold 600. The O is opened to a true circle (unity). Single unioned paths."""
import json, os
from fontTools.ttLib import TTFont
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
import pathops
FS = '/home/claude/fontsrc/node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-%d-normal.woff'
class Face:
    def __init__(self, w):
        f = TTFont(FS % w); self.gs = f.getGlyphSet(); self.cmap = f.getBestCmap()
    def g(self, ch): return self.gs[self.cmap[ord(ch)]]
    def path(self, ch, tf):
        p = pathops.Path(); self.g(ch).draw(TransformPen(p.getPen(glyphSet=self.gs), tf)); return p
    def bounds(self, ch):
        bp = BoundsPen(self.gs); self.g(ch).draw(bp); return bp.bounds
    def adv(self, ch): return self.g(ch).width
def union(ps):
    out = pathops.Path(); pathops.union(ps, out.getPen()); return out
def d(p):
    pen = SVGPathPen(None, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.')); p.draw(pen); return pen.getCommands()

def om_mark(face):
    capH = face.bounds('M')[3]
    ox0, oy0, ox1, oy1 = face.bounds('O'); o_w, o_h = ox1 - ox0, oy1 - oy0
    widen = (o_h * 0.99) / o_w
    # O is optically centred on cap height (its overshoot sits evenly above and below)
    O = face.path('O', (widen, 0, 0, -1, -ox0 * widen, capH))
    mx0 = face.bounds('M')[0]
    gap = capH * 0.16
    M = face.path('M', (1, 0, 0, -1, o_w * widen + gap - mx0, capH))
    return union([O, M]), capH

def word(face, text, cap, track, y_base, x_left=None, center_x=None):
    fc = face.bounds('M')[3]; s = cap / fc
    ws = [face.adv(c) * s for c in text]
    # tracking measured in cap heights; drop trailing side bearing on the last letter for optical centring
    total = sum(ws) + track * cap * (len(text) - 1)
    x = (center_x - total / 2) if center_x is not None else x_left
    parts = []
    for c, w in zip(text, ws):
        parts.append(face.path(c, (s, 0, 0, -s, x, y_base))); x += w + track * cap
    p = union(parts); return p

L300, L400, L500, L600 = Face(300), Face(400), Face(500), Face(600)

# ---- stacked: SALON above OM (master, OM Light) ----
om, capH = om_mark(L300); b = om.bounds; cx = (b[0] + b[2]) / 2
s_cap = capH * 0.09
salon = word(L500, 'SALON', s_cap, 0.95, 0, center_x=0)
sb = salon.bounds
# centre on the visible ink (not advance), sitting 0.34 capH above the OM top
dx = cx - (sb[0] + sb[2]) / 2; top_of_om = b[1]
dy = top_of_om - capH * 0.2 - sb[3]
salon_st = word(L500, 'SALON', s_cap, 0.95, dy, center_x=dx)
stacked = union([om, salon_st])

# ---- inline: SALON | OM (small cut, OM Regular, SALON SemiBold) ----
om4, capH4 = om_mark(L400); b4 = om4.bounds
i_cap = capH4 * 0.33
salon_in = word(L600, 'SALON', i_cap, 0.5, 0, x_left=0)
si = salon_in.bounds; sw = si[2] - si[0]
# SALON vertically centred on the OM cap height
y_base = capH4 / 2 + i_cap / 2
salon_in = word(L600, 'SALON', i_cap, 0.5, y_base, x_left=b4[0] - sw - capH4 * 0.92 - si[0])
si = salon_in.bounds
rule_x = b4[0] - capH4 * 0.46 - capH4 * 0.007
rule = pathops.Path(); r0, r1 = capH4 * 0.1, capH4 * 0.9; rw = capH4 * 0.014
rule.moveTo(rule_x, r0); rule.lineTo(rule_x + rw, r0); rule.lineTo(rule_x + rw, r1); rule.lineTo(rule_x, r1); rule.close()
inline = union([salon_in, rule, om4])

def svg(path, fill, title='Salon OM', pad_ratio=0.06):
    x0, y0, x1, y1 = path.bounds; pad = (y1 - y0) * pad_ratio
    vb = f'{x0 - pad:.1f} {y0 - pad:.1f} {x1 - x0 + 2 * pad:.1f} {y1 - y0 + 2 * pad:.1f}'
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}"><title>{title}</title><path fill="{fill}" d="{d(path)}"/></svg>\n', vb
OUT = '/home/claude/opt2/brand3/'; os.makedirs(OUT, exist_ok=True)
inks = {'ivory': '#F5EEE4', 'umber': '#15100C', 'forest': '#276B45'}
out = {}
for name, path in [('stacked', stacked), ('inline', inline), ('om', om), ('om-small', om4)]:
    for ink, hexv in inks.items():
        s_, vb = svg(path, hexv); open(OUT + f'salon-om-{name}-{ink}.svg', 'w').write(s_)
    out[name] = {'d': d(path), 'vb': vb}
out['stacked_parts'] = {'om': d(om), 'salon': d(salon_st), 'vb': out['stacked']['vb']}
json.dump(out, open('/home/claude/logo/opt3.json', 'w'))
print({k: v['vb'] for k, v in out.items()})
