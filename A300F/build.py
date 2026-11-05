"""Baut A300F/dist/index.html: eine einzelne Datei mit allen Modulen eingebettet.
Aufruf: python3 build.py"""
import pathlib, re
root = pathlib.Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf8')
def inline(m):
    src = (root / m.group(1)).read_text(encoding='utf8')
    if '</script' in src.lower():
        raise SystemExit('Modul enthält </script: ' + m.group(1))
    return '<script>/* ' + m.group(1) + ' */\n' + src + '\n</script>'
out, n = re.subn(r'<script src="(js/[a-z]+\.js)"></script>', inline, html)
assert n == 3, n
(root / 'dist').mkdir(exist_ok=True)
(root / 'dist' / 'index.html').write_text(out, encoding='utf8')
print('dist/index.html', len(out), 'Zeichen,', n, 'Module eingebettet')
