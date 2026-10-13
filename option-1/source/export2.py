import json, sys
sys.path.insert(0, '.')
from build_logo import build, union
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
def d(p, dx, dy, s=1):
    pen = SVGPathPen(None, ntos=lambda v: ('%.1f' % v).rstrip('0').rstrip('.'))
    p.draw(TransformPen(pen, (s, 0, 0, s, dx*s, dy*s))); return pen.getCommands()
master = union(*build().values())
small = union(*build(hw=2.3, salon_weight=500, salon_em=74.0).values())
# one shared frame so both cuts swap without shifting
b1, b2 = master.bounds, small.bounds
x0 = min(b1[0], b2[0]); y0 = min(b1[1], b2[1]); x1 = max(b1[2], b2[2]); y1 = max(b1[3], b2[3])
pad = 24; W = round(x1-x0+2*pad); H = round(y1-y0+2*pad)
out = {'w': W, 'h': H, 'full_d': d(master, -x0+pad, -y0+pad), 'small_d': d(small, -x0+pad, -y0+pad)}
json.dump(out, open('final2.json', 'w'))
OUT = '/home/claude/ds/project/assets/Logos/'
def svg(path, fill, extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Salon OM"><title>Salon OM</title>{extra}<path fill="{fill}" d="{path}"/></svg>\n'
inks = {'gold': '#A8874F', 'ink': '#2E2620', 'ivory': '#F6F1EB'}
for k, v in inks.items():
    open(OUT + f'salon-om-logo-{k}.svg', 'w').write(svg(out['full_d'], v))
    open(OUT + f'salon-om-logo-small-{k}.svg', 'w').write(svg(out['small_d'], v))
foil = ('<defs><linearGradient id="foil" x1="0" y1="0" x2="1" y2="1">'
        '<stop offset="0" stop-color="#E4D0A2"/><stop offset=".35" stop-color="#B8975E"/>'
        '<stop offset=".6" stop-color="#D9C08E"/><stop offset="1" stop-color="#8F7040"/></linearGradient></defs>')
open(OUT + 'salon-om-logo-foil.svg', 'w').write(svg(out['full_d'], 'url(#foil)', foil))
print(W, H, len(out['full_d']), len(out['small_d']))
