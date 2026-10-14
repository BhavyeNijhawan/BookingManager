"""Bundle prototype/ into one HTML file for publishing as a claude.ai artifact.
The artifact host wraps the file in its own doctype/head, so this strips ours
and inlines styles.css and app.js.
Run:  python -I tools/build-artifact.py   (from the repo root)
"""
import os, re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = lambda *a: os.path.join(ROOT, *a)

def read(p):
    with open(p, encoding='utf-8') as fh:
        return fh.read()

html = read(P('prototype', 'index.html'))
css = read(P('prototype', 'styles.css'))
js = read(P('prototype', 'app.js')).replace('</script', '<\\/script')

body = re.search(r'<body>(.*)</body>', html, re.S).group(1)
body = re.sub(r'<script src="app.js"></script>', '', body)
body = re.sub(r'<script>\s*if \(\'serviceWorker\'.*?</script>', '', body, flags=re.S)

out = (
    '<title>Atithi</title>\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500&display=swap">\n'
    '<style>\n' + css + '\n</style>\n'
    + body.strip() + '\n'
    '<script>\n' + js + '\n</script>\n'
)
os.makedirs(P('build'), exist_ok=True)
with open(P('build', 'atithi-artifact.html'), 'w', encoding='utf-8') as fh:
    fh.write(out)
print('wrote build/atithi-artifact.html', len(out), 'bytes')
