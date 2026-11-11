"""Делает пути в собранном сайте относительными — для демо на GitHub Pages (адрес вида user.github.io/repo/)."""
import os, re, sys
root = sys.argv[1] if len(sys.argv) > 1 else 'dist'
for dp, _, fs in os.walk(root):
    for f in fs:
        p = os.path.join(dp, f)
        if f.endswith(('.css', '.js')) and '_astro' in dp:
            s = open(p, encoding='utf-8').read()
            s = s.replace('"/_astro/', '"./').replace("'/_astro/", "'./").replace('(/_astro/', '(./')
            open(p, 'w', encoding='utf-8').write(s)
        if f.endswith('.html'):
            rp = os.path.relpath(dp, root)
            depth = 0 if rp == '.' else len(rp.split(os.sep))
            rel = '../' * depth or './'
            s = open(p, encoding='utf-8').read()
            def fix(m):
                attr, url = m.group(1), m.group(2)
                path, _, frag = url.partition('#')
                path = path[1:]
                if path == '' or path.endswith('/'):
                    path += 'index.html'
                return f'{attr}="{rel}{path}{("#" + frag) if frag else ""}"'
            s = re.sub(r'(href|src)="(/(?!/)[^"]*)"', fix, s)
            s = s.replace('(/_astro/', f'({rel}_astro/')
            open(p, 'w', encoding='utf-8').write(s)
print('ok')
