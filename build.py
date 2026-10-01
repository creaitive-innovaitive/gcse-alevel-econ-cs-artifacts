"""Builds the static site into docs/ from site_data.py and artifacts_src/.

Run: python3 build.py
GitHub Pages serves the docs/ folder.
"""
import html
import json
import re
import shutil
from pathlib import Path

from site_data import ARTIFACTS, COURSES, SITE_TAGLINE, SITE_TITLE

ROOT = Path(__file__).parent
OUT = ROOT / "docs"
SRC = ROOT / "artifacts_src"

NAV = [
    ("home", "Home", ""),
    ("ig-econ", "IG Econ", "ig-econ/"),
    ("ig-cs", "IG CS", "ig-cs/"),
    ("a-econ", "A Econ", "a-econ/"),
    ("a-cs", "A CS", "a-cs/"),
    ("other", "Other", "other/"),
    ("profile", "Profile", "profile/"),
]

esc = html.escape


def write(rel, content):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding="utf-8")


def rel_root(path):
    """Relative prefix back to site root for a page at path like 'a-cs/as/ch-01/'."""
    depth = len([x for x in path.split("/") if x])
    return "../" * depth


def layout(title, body, path, active, crumbs=None, accent=None, auth=False, extra=""):
    root = rel_root(path)
    nav = "".join(
        f'<a href="{root}{href}"{" class=on aria-current=page" if key == active else ""}{f" data-course={key}" if key in COURSES else ""}>{label}</a>'
        for key, label, href in NAV
    )
    crumb_html = ""
    if crumbs:
        parts = []
        for label, href in crumbs:
            parts.append(f'<a href="{root}{href}">{esc(label)}</a>' if href is not None else f"<span>{esc(label)}</span>")
        crumb_html = f'<nav class="crumbs" aria-label="Breadcrumb">{"<i>/</i>".join(parts)}</nav>'
    acc = f' data-accent="{accent}"' if accent else ""
    gate = [active] if active in COURSES else []
    full_title = SITE_TITLE if title == SITE_TITLE else f"{title} · {SITE_TITLE}"
    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{esc(full_title)}</title>
<link rel="stylesheet" href="{root}assets/style.css">
{GATE_HEAD if gate else ""}</head>
<body{acc}>
<header class="site">
<div class="bar">
<a class="brand" href="{root}"><span class="mark">E·C</span><span>{esc(SITE_TITLE)}</span></a>
<button class="menu" aria-label="Menu" aria-expanded="false">Menu</button>
<nav class="main" aria-label="Main">{nav}</nav>
</div>
</header>
<main>
{crumb_html}
{body}
</main>
<footer class="site"><p>Made for students at SIS Danang. Revision and classroom use.</p></footer>
<script src="{root}assets/site.js"></script>
{auth_scripts(root, gate)}{extra}
</body></html>
"""


GATE_HEAD = ('<script>document.documentElement.classList.add("gated")</script>'
             '<style>html.gated{visibility:hidden!important}</style>')


def auth_scripts(root, gate=()):
    return (f'<script src="{root}assets/config.js"></script>'
            '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>'
            f'<script src="{root}assets/app.js"></script>'
            f'<script src="{root}assets/gate.js" data-courses="{",".join(gate)}"></script>')


def plural(n, word):
    if word == "activity":
        return f"{n} activit{'y' if n == 1 else 'ies'}"
    return f"{n} {word}{'' if n == 1 else 's'}"


# Index chapters -> path, and artifacts -> chapters.
chapter_info = {}  # (course, key) -> dict(path, title, crumbs, chapter)
for ckey, c in COURSES.items():
    if c["kind"] == "chapters":
        for ch in c["chapters"]:
            chapter_info[(ckey, ch["id"])] = {"path": f"{ckey}/{ch['id']}/", "ch": ch, "parents": []}
    elif c["kind"] == "sections":
        for sec in c["sections"]:
            for ch in sec["chapters"]:
                chapter_info[(ckey, ch["id"])] = {
                    "path": f"{ckey}/{sec['id']}/{ch['id']}/", "ch": ch,
                    "parents": [(f"Section {sec['n']}: {sec['title']}", f"{ckey}/{sec['id']}/")],
                }
    else:
        for lv in c["levels"]:
            for ch in lv["chapters"]:
                chapter_info[(ckey, f"{lv['id']}/{ch['id']}")] = {
                    "path": f"{ckey}/{lv['id']}/{ch['id']}/", "ch": ch,
                    "parents": [(lv["title"], f"{ckey}/{lv['id']}/")],
                }

by_chapter = {}
for a in ARTIFACTS:
    a["slug"] = a["src"]
    for place in a["places"]:
        assert place in chapter_info, f"Unknown placement {place} for {a['src']}"
        by_chapter.setdefault(place, []).append(a)
    assert (SRC / a["src"] / "index.html").exists(), a["src"]


def count(keys):
    seen = {a["slug"] for k in keys for a in by_chapter.get(k, [])}
    return len(seen)


def card(href, label, title, sub="", n=None, group=None):
    badge = ""
    if n is not None:
        badge = f'<span class="count{" zero" if n == 0 else ""}">{plural(n, "activity")}</span>'
        if n == 0:
            badge = '<span class="count zero">Coming soon</span>'
    subh = f'<span class="sub">{esc(sub)}</span>' if sub else ""
    return (f'<a class="card{" empty" if n == 0 else ""}" href="{href}">'
            f'<span class="num">{esc(label)}</span><span class="t">{esc(title)}</span>{subh}{badge}</a>')


def chapter_grid(ckey, prefix, chapters, root_key=lambda ch: ch["id"], grouped=False):
    """Grid of chapter cards; hrefs are relative to the page (chapter id folder)."""
    def one(ch):
        n = count([(ckey, root_key(ch))])
        return card(f"{ch['id']}/", ch["label"], ch["title"], n=n)

    if not grouped:
        return f'<div class="grid">{"".join(one(ch) for ch in chapters)}</div>'
    out, current, cards = [], object(), []
    for ch in chapters:
        if ch["group"] != current:
            if cards:
                out.append(f'<div class="grid">{"".join(cards)}</div>')
            current = ch["group"]
            out.append(f'<h2 class="group">{esc(current or "")}</h2>')
            cards = []
        cards.append(one(ch))
    out.append(f'<div class="grid">{"".join(cards)}</div>')
    return "".join(out)


def head(title, lead, kicker=None):
    k = f'<p class="kicker">{esc(kicker)}</p>' if kicker else ""
    return f'<section class="hero small">{k}<h1>{esc(title)}</h1><p class="lead">{esc(lead)}</p></section>'


def chapter_page(ckey, key):
    info = chapter_info[(ckey, key)]
    c, ch = COURSES[ckey], info["ch"]
    arts = by_chapter.get((ckey, key), [])
    label = f"Chapter {ch['label']}" if ch["n"] else "Exam preparation"
    if arts:
        items = "".join(
            f'<div class="card art"><span class="tag">{esc(a["kind"])}</span>'
            f'<a class="t" href="{rel_root(info["path"])}artifacts/{a["slug"]}/">{esc(a["title"])}</a><span class="sub">{esc(a["desc"])}</span>'
            f'<span class="foot"><a class="go" href="{rel_root(info["path"])}artifacts/{a["slug"]}/">Open →</a>'
            f'<button class="done" data-done-slug="{a["slug"]}" hidden></button></span></div>'
            for a in arts
        )
        body = f'<div class="grid arts">{items}</div>'
    else:
        body = '<div class="placeholder"><p>Nothing here yet. Activities for this chapter are on their way.</p></div>'
    crumbs = [("Home", ""), (c["title"], f"{ckey}/")] + [(l, h) for l, h in info["parents"]] + [(f"{label}", None)]
    write(info["path"] + "index.html",
          layout(f"{ch['title']}", head(ch["title"], "", f"{c['title']} · {label}") + body,
                 info["path"], ckey, crumbs, c["accent"], auth=True))
    return info


def build_courses():
    for ckey, c in COURSES.items():
        crumbs = [("Home", ""), (c["title"], None)]
        if c["kind"] == "chapters":
            grid = chapter_grid(ckey, ckey, c["chapters"])
            write(f"{ckey}/index.html", layout(c["title"], head(c["title"], c["blurb"], "Course") + grid, f"{ckey}/", ckey, crumbs, c["accent"]))
            for ch in c["chapters"]:
                chapter_page(ckey, ch["id"])
        elif c["kind"] == "sections":
            cards = []
            for sec in c["sections"]:
                keys = [(ckey, ch["id"]) for ch in sec["chapters"]]
                cards.append(card(f"{sec['id']}/", str(sec["n"]), sec["title"], plural(len(sec["chapters"]), "chapter"), count(keys)))
                sub_crumbs = [("Home", ""), (c["title"], f"{ckey}/"), (f"Section {sec['n']}", None)]
                grid = chapter_grid(ckey, ckey, sec["chapters"])
                write(f"{ckey}/{sec['id']}/index.html",
                      layout(sec["title"], head(sec["title"], f"Section {sec['n']} of the {c['title']} coursebook.", c["title"]) + grid,
                             f"{ckey}/{sec['id']}/", ckey, sub_crumbs, c["accent"]))
                for ch in sec["chapters"]:
                    chapter_page(ckey, ch["id"])
            write(f"{ckey}/index.html", layout(c["title"], head(c["title"], c["blurb"], "Course") + f'<div class="grid">{"".join(cards)}</div>',
                                               f"{ckey}/", ckey, crumbs, c["accent"]))
        else:
            cards = []
            for lv in c["levels"]:
                keys = [(ckey, f"{lv['id']}/{ch['id']}") for ch in lv["chapters"]]
                cards.append(card(f"{lv['id']}/", "AS" if lv["id"] == "as" else "A2", lv["title"], lv["blurb"], count(keys)))
                grouped = any(ch["group"] for ch in lv["chapters"])
                grid = chapter_grid_levels(ckey, lv, grouped)
                sub_crumbs = [("Home", ""), (c["title"], f"{ckey}/"), (lv["title"], None)]
                write(f"{ckey}/{lv['id']}/index.html",
                      layout(f"{lv['title']}", head(f"{c['title']}: {lv['title']}", lv["blurb"] + ".", c["title"]) + grid,
                             f"{ckey}/{lv['id']}/", ckey, sub_crumbs, c["accent"]))
                for ch in lv["chapters"]:
                    chapter_page(ckey, f"{lv['id']}/{ch['id']}")
            write(f"{ckey}/index.html", layout(c["title"], head(c["title"], c["blurb"], "Course") + f'<div class="grid two">{"".join(cards)}</div>',
                                               f"{ckey}/", ckey, crumbs, c["accent"]))


def chapter_grid_levels(ckey, lv, grouped):
    def one(ch):
        n = count([(ckey, f"{lv['id']}/{ch['id']}")])
        return card(f"{ch['id']}/", ch["label"], ch["title"], n=n)
    if not grouped:
        return f'<div class="grid">{"".join(one(ch) for ch in lv["chapters"])}</div>'
    out, current, cards = [], object(), []
    for ch in lv["chapters"]:
        if ch["group"] != current:
            if cards:
                out.append(f'<div class="grid">{"".join(cards)}</div>')
            current = ch["group"]
            out.append(f'<h2 class="group">{esc(current or "")}</h2>')
            cards = []
        cards.append(one(ch))
    out.append(f'<div class="grid">{"".join(cards)}</div>')
    return "".join(out)


def build_home():
    cards = []
    total = len({a["slug"] for a in ARTIFACTS})
    for ckey in ["ig-econ", "ig-cs", "a-econ", "a-cs"]:
        c = COURSES[ckey]
        n = len({a["slug"] for a in ARTIFACTS if any(p[0] == ckey for p in a["places"])})
        cards.append(f'<a class="card course" data-accent="{c["accent"]}" data-course="{ckey}" href="{ckey}/"><span class="num">{esc(c["nav"])}</span>'
                     f'<span class="t">{esc(c["title"])}</span><span class="sub">{esc(c["blurb"])}</span>'
                     f'<span class="count">{plural(n, "activity")}</span></a>')
    body = (f'<section class="hero"><p class="kicker">GCSE and A-Level</p><h1>Economics and Computer Science, made interactive.</h1>'
            f'<p class="lead">{esc(SITE_TAGLINE)}</p><p class="stat">{total} activities and counting</p></section>'
            f'<div class="grid two">{"".join(cards)}</div>'
            '<div class="grid two more">'
            '<a class="card slim" href="other/"><span class="t">Other</span><span class="sub">Study tips, extra-curricular activities and side projects.</span></a>'
            '<a class="card slim" href="profile/"><span class="t">Profile</span><span class="sub">Student accounts, progress and scores. Coming soon.</span></a>'
            '</div>')
    write("index.html", layout(SITE_TITLE, body, "", "home"))


def build_other_profile():
    ph = lambda t, s: f'<div class="card empty slim"><span class="t">{t}</span><span class="sub">{s}</span><span class="count zero">Coming soon</span></div>'
    body = (head("Other", "Things that sit outside the exam courses.", "Extras")
            + '<div class="grid">' + ph("Study tips", "How to revise, plan and manage exam season.")
            + ph("Extra-curricular activities", "Clubs, competitions and projects.") + ph("Side projects", "Things built for fun.") + "</div>")
    write("other/index.html", layout("Other", body, "other/", "other", [("Home", ""), ("Other", None)]))

    body = (head("Profile", "Your details, subjects and progress.", "Students")
            + '<div id="profile-root"><noscript>This page needs JavaScript.</noscript></div>')
    write("profile/index.html", layout("Profile", body, "profile/", "profile", [("Home", ""), ("Profile", None)],
                                       auth=True, extra='<script src="../assets/profile.js"></script>'))


def build_catalog():
    """Machine-readable course map used by the profile page for progress."""
    arts = {a["slug"]: a for a in ARTIFACTS}
    courses, artifacts = {}, {}
    for ckey, c in COURSES.items():
        if c["kind"] == "chapters":
            raw = [("Chapters", [(ch, ch["id"]) for ch in c["chapters"]])]
        elif c["kind"] == "sections":
            raw = [(f"Section {sec['n']}: {sec['title']}", [(ch, ch["id"]) for ch in sec["chapters"]]) for sec in c["sections"]]
        else:
            raw = [(lv["title"], [(ch, f"{lv['id']}/{ch['id']}") for ch in lv["chapters"]]) for lv in c["levels"]]
        groups, slugs = [], []
        for title, chs in raw:
            items = []
            for ch, key in chs:
                sl = [a["slug"] for a in by_chapter.get((ckey, key), [])]
                for x in sl:
                    if x not in slugs:
                        slugs.append(x)
                    artifacts.setdefault(x, {"title": arts[x]["title"], "url": f"artifacts/{x}/",
                                             "chapterTitle": f"{c['title']}: {ch['title']}"})
                items.append({"label": ch["label"], "title": ch["title"], "url": chapter_info[(ckey, key)]["path"], "slugs": sl})
            groups.append({"title": title, "chapters": items})
        courses[ckey] = {"title": c["title"], "accent": c["accent"], "url": f"{ckey}/", "groups": groups, "slugs": slugs}
    order = [a["slug"] for a in ARTIFACTS]
    write("assets/catalog.json", json.dumps({"courses": courses, "artifacts": artifacts, "order": order}, separators=(",", ":")))


PILL_CSS = ("<style id=site-pill>.site-pill{position:fixed;right:12px;bottom:12px;opacity:.8;z-index:2147483000;display:flex;gap:2px;"
            "font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:rgba(20,24,28,.88);"
            "border-radius:999px;padding:4px;box-shadow:0 2px 10px rgba(0,0,0,.25)}.site-pill a{color:#fff;text-decoration:none;"
            "padding:8px 12px;border-radius:999px;white-space:nowrap}.site-pill a:hover,.site-pill button:hover{background:rgba(255,255,255,.18)}.site-pill button{font:inherit;color:#fff;background:transparent;border:0;border-left:1px solid rgba(255,255,255,.25);border-radius:0 999px 999px 0;padding:8px 12px;cursor:pointer}.site-pill button.is-done{color:#7be0a0}"
            "@media print{.site-pill{display:none}}</style>")


def inject_pill(text, back_href, back_label, home_href, slug, courses):
    pill = (f'{PILL_CSS}<div class="site-pill"><a href="{back_href}">← {esc(back_label)}</a>'
            f'<a href="{home_href}">Home</a><button data-done-slug="{slug}" hidden></button></div>'
            f'{auth_scripts(home_href, courses)}')
    text = text.replace("<head>", "<head>" + GATE_HEAD, 1) if "<head>" in text else GATE_HEAD + text
    if "</body>" in text:
        i = text.rfind("</body>")
        return text[:i] + pill + text[i:]
    return text + pill


def build_artifacts():
    for a in ARTIFACTS:
        first = a["places"][0]
        info = chapter_info[first]
        ch = info["ch"]
        src, dest = SRC / a["src"], OUT / "artifacts" / a["slug"]
        depth_root = "../../"
        back = depth_root + info["path"]
        label = f"Chapter {ch['label']}" if ch["n"] else ch["title"]
        for f in src.rglob("*"):
            if f.is_dir():
                continue
            target = dest / f.relative_to(src)
            target.parent.mkdir(parents=True, exist_ok=True)
            if f.suffix == ".html":
                target.write_text(inject_pill(f.read_text(encoding="utf-8"), back, label, depth_root, a["slug"], sorted({c for c, _ in a["places"]})), encoding="utf-8")
            else:
                shutil.copy2(f, target)


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir()
    shutil.copytree(ROOT / "assets", OUT / "assets")
    (OUT / ".nojekyll").write_text("")
    build_home()
    build_courses()
    build_other_profile()
    build_catalog()
    build_artifacts()
    n = sum(1 for _ in OUT.rglob("index.html"))
    print(f"Built {n} index pages, {len(ARTIFACTS)} artifacts -> {OUT}")


if __name__ == "__main__":
    main()
