"""Pack the homepage into one self-contained, offline HTML file."""
import base64, re, json
src = open('/home/claude/site/salon-om.html').read()
NM = '/home/claude/fontsrc/node_modules/'
P = '/home/claude/ds/project/'
def b64(path): return base64.b64encode(open(path, 'rb').read()).decode()
for name in sorted(set(re.findall(r"img/([\w-]+\.webp)", src))):
    src = src.replace('img/' + name, 'data:image/webp;base64,' + b64('/home/claude/site/img/' + name))
assert not re.search(r"img/[\w-]+\.webp", src)
t = json.load(open(P + 'tokens.json'))
faces = ''.join(
    f"@font-face{{font-family:'{f['family']}';font-style:{f['style']};font-weight:{f['weight']};font-display:swap;"
    f"src:url(data:font/woff2;base64,{b64(P + f['file'])}) format('woff2');}}\n" for f in t['type']['fonts'])
src = re.sub(r'<link rel="preconnect"[^>]*>\n<link rel="preconnect"[^>]*>\n<link rel="stylesheet" href="https://fonts.googleapis.com[^"]*">\n', '', src)
src = src.replace('<style>\n', '<style>\n' + faces, 1)
assert 'googleapis' not in src
for lib, path in [('react/18.3.1/umd/react.production.min.js', 'react/umd/react.production.min.js'),
                  ('react-dom/18.3.1/umd/react-dom.production.min.js', 'react-dom/umd/react-dom.production.min.js')]:
    code = open(NM + path).read().replace('</script', '<\\/script').replace('<!--', '<\\!--')
    src = src.replace(f'<script src="https://cdnjs.cloudflare.com/ajax/libs/{lib}"></script>', '<script>\n' + code + '\n</script>')
assert 'cdnjs' not in src
title_line = '<title>Salon OM</title>\n'
assert src.startswith(title_line)
body = src[len(title_line):]
head_bits = re.match(r'(<style>[\s\S]*?</style>\n)', body).group(1)
rest = body[len(head_bits):]
doc = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Salon OM</title>
<meta name="description" content="Salon OM: a sanctuary for healing, growth and transformation. Homepage draft.">
<meta name="theme-color" content="#F6F1EB">
<link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,{b64(P + 'assets/Logos/salon-om-favicon.svg')}">
{head_bits}</head>
<body>
{rest}</body>
</html>
"""
open('/home/claude/site/salon-om-homepage.html', 'w').write(doc)
print(round(len(doc.encode()) / 1024), 'KB')
