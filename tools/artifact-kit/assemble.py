"""Rebuilds a kit-made artifact: python3 tools/artifact-kit/assemble.py <name> "<title>" <slug>
Sources: <name>.body.html (tabs and sections) + <name>.js (content and activities); lib.css / lib.js are the shared components."""
import sys, pathlib
name, title, slug = sys.argv[1:4]
d = pathlib.Path(__file__).parent
css, lib = (d/"lib.css").read_text(), (d/"lib.js").read_text()
body, js = (d/f"{name}.body.html").read_text(), (d/f"{name}.js").read_text()
html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<style>{css}</style></head>
<body>
{body}
<script>
{lib}
{js}
Lib.initTabs();
</script>
</body></html>
"""
out = d.parent.parent/"artifacts_src"/slug
out.mkdir(parents=True, exist_ok=True)
(out/"index.html").write_text(html)
print(slug, len(html)//1024, "KB")
