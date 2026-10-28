# Rooted v10b: a labelled contact sheet from a v10_build_render.py run.
# Each tile is one rendered frame (OUT/v_####.png) with every block's name and share of the frame, from the LABELS lines
# that --proj or --labels prints. Needs ImageMagick (magick).
# Run: python3 contact_sheet_labelled.py RUN.log OUT_DIR sheet.png
import json, re, subprocess, sys
log, d, out = sys.argv[1], sys.argv[2], sys.argv[3]
lab = {int(m.group(1)): json.loads(m.group(2)) for m in re.finditer(r'LABELS (\d+) (\{.*\})', open(log).read())}
frames = sorted(lab); tiles = []
for f in frames:
    t = f'{d}/lab_{f:04d}.png'; cmd = ['magick', f'{d}/v_{f:04d}.png', '-resize', '640x360', '-font', '/System/Library/Fonts/Helvetica.ttc']
    for g, (x, y, s) in lab[f].items():
        if s < 0.004: continue
        X, Y = min(max(int(x * 640), 46), 594), int(y * 360)
        cmd += ['-fill', '#000000b0', '-draw', f'roundrectangle {X-44},{Y-11} {X+44},{Y+11} 5,5', '-fill', 'white', '-pointsize', '15', '-gravity', 'NorthWest', '-annotate', f'+{X-40}+{Y-9}', f'{g} {round(100*s)}%']
    cmd += ['-fill', '#000000b0', '-draw', 'rectangle 0,0 92,26', '-fill', 'white', '-pointsize', '18', '-annotate', '+8+4', f'frame {f}', t]; subprocess.run(cmd, check=True); tiles.append(t)
subprocess.run(['magick', *tiles, '+append', out], check=True); print('SHEET', out, frames)
