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


STAMP = str(int(__import__("time").time()))


def bust(text):
    """Version the site's own css/js so browsers fetch fresh copies after each build."""
    return re.sub(r'(assets/[\w.-]+\.(?:js|css))(")', r"\1?v=" + STAMP + r"\2", text)


def write(rel, content):
    if rel.endswith(".html"):
        content = bust(content)
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
{THEME_HEAD}{GATE_HEAD if gate else ""}</head>
<body{acc}>
<header class="site">
<div class="bar">
<a class="brand" href="{root}"><span class="mark">E·C</span><span>{esc(SITE_TITLE)}</span></a>
<button class="theme" type="button" aria-label="Toggle dark mode"></button>
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


THEME_HEAD = ('<script>try{var t=localStorage.getItem("site.theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}</script>')
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


def is_review(a):
    return a.get("role") == "review"


def at_key(a):
    return [int(x) for x in a["at"].split(".")] if a.get("at") else [10**6]


for _l in by_chapter.values():
    _l.sort(key=at_key)  # stable, so unplaced resources keep their listed order


def count(keys, review=None):
    seen = {a["slug"] for k in keys for a in by_chapter.get(k, []) if review is None or is_review(a) == review}
    return len(seen)


def card(href, label, title, sub="", n=None, group=None, res=None):
    badge = ""
    if n is not None:
        badge = f'<span class="count{" zero" if n == 0 else ""}">{plural(n, "activity")}</span>'
        if n == 0:
            badge = '<span class="count zero">Coming soon</span>'
    if res is not None:
        rev, extra = res
        parts = ([f"{rev} review"] if rev else []) + ([plural(extra, "resource")] if extra else [])
        badge = f'<span class="count">{" · ".join(parts)}</span>' if parts else '<span class="count zero">Coming soon</span>'
        n = rev + extra
    subh = f'<span class="sub">{esc(sub)}</span>' if sub else ""
    return (f'<a class="card{" empty" if n == 0 else ""}" href="{href}">'
            f'<span class="num">{esc(label)}</span><span class="t">{esc(title)}</span>{subh}{badge}</a>')


def chapter_grid(ckey, prefix, chapters, root_key=lambda ch: ch["id"], grouped=False):
    """Grid of chapter cards; hrefs are relative to the page (chapter id folder)."""
    def one(ch):
        k = [(ckey, root_key(ch))]
        return card(f"{ch['id']}/", ch["label"], ch["title"], res=(count(k, True), count(k, False)))

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
    revs = [a for a in arts if is_review(a)]
    ress = [a for a in arts if not is_review(a)]

    def cardh(a):
        u = f'{rel_root(info["path"])}artifacts/{a["slug"]}/'
        return (f'<div class="card art" data-slug="{a["slug"]}" data-role="{"review" if is_review(a) else "resource"}" data-ord="{arts.index(a)}">'
                f'<span class="tag">{esc(a["kind"])}</span><a class="t" href="{u}">{esc(a["title"])}</a><span class="sub">{esc(a["desc"])}</span>'
                f'<span class="foot"><a class="go" href="{u}">Open →</a><button class="done" data-done-slug="{a["slug"]}" hidden></button></span>'
                f'<span class="adm"><button class="mini roletog" data-role-toggle="{a["slug"]}" hidden></button>'
                f'<button class="mini danger roledel" data-role-delete="{a["slug"]}" hidden></button>'
                f'<button class="mini restore" data-role-restore="{a["slug"]}" hidden></button></span></div>')

    def panel(lst, review):
        msg = "No chapter review yet. It is on its way." if review else "No extra resources for this chapter yet."
        return (f'<div class="placeholder emptymsg"{" hidden" if lst else ""}><p>{msg}</p></div>'
                f'<div class="grid arts">{"".join(cardh(a) for a in lst)}</div>')

    first = "res" if ress and not revs else "rev"
    body = ('<div class="tabs chtabs" role="tablist">'
            f'<button role="tab" data-t="rev" class="{"on" if first == "rev" else ""}">Chapter review (<span>{len(revs)}</span>)</button>'
            f'<button role="tab" data-t="res" class="{"on" if first == "res" else ""}">Resources (<span>{len(ress)}</span>)</button><button role="tab" data-t="del" hidden>Deleted (<span>0</span>)</button></div>'
            f'<div class="tabpanel" data-p="rev"{" hidden" if first != "rev" else ""}>{panel(revs, True)}</div>'
            f'<div class="tabpanel" data-p="res"{" hidden" if first != "res" else ""}>'
            f'<p class="hint">Extra activities that deepen understanding or give more support. Shown in coursebook order.</p>{panel(ress, False)}</div>'
            '<div class="tabpanel" data-p="del" hidden><p class="hint">Deleted: hidden from students and progress. Only you can see this tab.</p><div class="grid arts"></div></div>')
    crumbs = [("Home", ""), (c["title"], f"{ckey}/")] + [(l, h) for l, h in info["parents"]] + [(f"{label}", None)]
    write(info["path"] + "index.html",
          layout(f"{ch['title']}", head(ch["title"], "", f"{c['title']} · {label}") + body,
                 info["path"], ckey, crumbs, c["accent"], auth=True, extra=f'<script src="{rel_root(info["path"])}assets/chapter.js"></script>'))
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
        k = [(ckey, f"{lv['id']}/{ch['id']}")]
        return card(f"{ch['id']}/", ch["label"], ch["title"], res=(count(k, True), count(k, False)))
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
                allsl = [a["slug"] for a in by_chapter.get((ckey, key), [])]
                sl = [a["slug"] for a in by_chapter.get((ckey, key), []) if is_review(a)]
                for x in allsl:
                    artifacts.setdefault(x, {"title": arts[x]["title"], "url": f"artifacts/{x}/", "role": "review" if is_review(arts[x]) else "resource",
                                             "chapterTitle": f"{c['title']}: {ch['title']}"})
                for x in sl:
                    if x not in slugs:
                        slugs.append(x)
                items.append({"label": ch["label"], "title": ch["title"], "url": chapter_info[(ckey, key)]["path"], "slugs": sl, "all": allsl})
            groups.append({"title": title, "chapters": items})
        courses[ckey] = {"title": c["title"], "accent": c["accent"], "url": f"{ckey}/", "groups": groups, "slugs": slugs}
    order = [a["slug"] for a in ARTIFACTS]
    assessed = {k: {"pass": v["pass_pct"], "n": len(v["questions"])} for k, v in ASSESSED.items()}
    write("assets/catalog.json", json.dumps({"courses": courses, "artifacts": artifacts, "order": order, "assessed": assessed}, separators=(",", ":")))


PILL_CSS = ("<style id=site-pill>.site-pill{position:fixed;right:12px;bottom:12px;opacity:.8;z-index:2147483000;display:flex;gap:2px;"
            "font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:rgba(20,24,28,.88);"
            "border-radius:999px;padding:4px;box-shadow:0 2px 10px rgba(0,0,0,.25)}.site-pill a{color:#fff;text-decoration:none;"
            "padding:8px 12px;border-radius:999px;white-space:nowrap}.site-pill a:hover,.site-pill button:hover{background:rgba(255,255,255,.18)}.site-pill button{font:inherit;color:#fff;background:transparent;border:0;border-left:1px solid rgba(255,255,255,.25);border-radius:0 999px 999px 0;padding:8px 12px;cursor:pointer}.site-pill button.is-done{color:#7be0a0}"
            "@media print{.site-pill{display:none}}"
            # Phones: collapse to a small round button so the pill never sits over lesson content.
            ".site-pill .pill-more{display:none}"
            "@media(max-width:700px){body{padding-bottom:64px}.site-pill{right:8px;bottom:8px;opacity:.6;flex-wrap:wrap;justify-content:flex-end;max-width:calc(100vw - 16px)}"
            ".site-pill>*:not(.pill-more){display:none}.site-pill.open{opacity:.95}.site-pill.open>*:not(.pill-more):not([hidden]){display:inline-block}"
            ".site-pill .pill-more{display:block;border:0;border-radius:999px;width:36px;height:36px;padding:0;text-align:center;font-size:18px}.site-pill.open .pill-more{border-left:0}}</style>")


THEME_CLICK = ("var r=document.documentElement,d=(r.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark'?'light':'dark';"
               "r.setAttribute('data-theme',d);try{localStorage.setItem('site.theme',d)}catch(e){}")


# Assessments: assessments/<slug>.json. Answer keys never reach the site; they go into supabase/assessments_seed.sql.
ASSESSED = {}
for f in sorted((ROOT / "assessments").glob("*.json")):
    d = json.loads(f.read_text(encoding="utf-8"))
    assert d["slug"] in {a["slug"] for a in ARTIFACTS}, f"{f.name}: no such artifact"
    ids = [q["id"] for q in d["questions"]]
    assert len(ids) == len(set(ids)), f"{f.name}: duplicate question ids"
    for q in d["questions"]:
        assert q["type"] in ("mcq", "num", "text") and q.get("marks", 0) >= 1, f"{f.name} {q['id']}"
        if q["type"] == "mcq":
            assert 0 <= int(q["ans"]) < len(q["opts"]), f"{f.name} {q['id']}"
        if q["type"] == "text":
            assert q["marks"] <= len(q["groups"]), f"{f.name} {q['id']}: more marks than groups"
    ASSESSED[d["slug"]] = d


def build_assessments():
    page = (head("Assessment", "Answer from memory, then submit to see your score and feedback.", "Students")
            + '<div id="assess-root"><noscript>This page needs JavaScript.</noscript></div>')
    write("assess/index.html", layout("Assessment", page, "assess/", "profile", [("Home", ""), ("Profile", "profile/"), ("Assessment", None)],
                                      auth=True, extra='<script src="../assets/assessment.js"></script>'))
    seed = ["-- Generated by build.py from assessments/*.json. Run schema.sql first. Safe to run again: it replaces the questions.\n"]
    for d in ASSESSED.values():
        body = json.dumps(d["questions"], ensure_ascii=False)
        assert "$q$" not in body
        seed.append(f"insert into public.assessments (slug, title, pass_pct, questions) values "
                    f"('{d['slug']}', $q${d['title']}$q$, {d['pass_pct']}, $q${body}$q$::jsonb)\n"
                    f"on conflict (slug) do update set title = excluded.title, pass_pct = excluded.pass_pct, "
                    f"questions = excluded.questions, updated_at = now();\n")
    (ROOT / "supabase" / "assessments_seed.sql").write_text("\n".join(seed), encoding="utf-8")


# Sticky tab bars keep the old scroll position after a click, so the new panel opens part-way down.
# This returns the page to the top whenever a tab inside a sticky or fixed bar is clicked.
PILL_JS = ("<script>document.addEventListener('click',function(e){var p=document.querySelector('.site-pill.open');if(p&&!p.contains(e.target))p.classList.remove('open')});"
           "addEventListener('scroll',function(){var p=document.querySelector('.site-pill.open');if(p)p.classList.remove('open')},{passive:true});</script>")

TAB_SCROLL = ("<script>document.addEventListener('click',function(e){var t=e.target.closest("
              "'[role=tab],.tab,.tabbar button,.tabs button,.section-tabs button,[data-tab],[data-panel-tab]');if(!t)return;"
              "var n=t,s=false;while(n&&n!==document.body){var p=getComputedStyle(n).position;if(p==='sticky'||p==='fixed'){s=true;break}n=n.parentElement}"
              "if(s)setTimeout(function(){window.scrollTo(0,0)},30)});</script>")


def inject_pill(text, back_href, back_label, home_href, slug, courses, review=True):
    done_btn = f'<button data-done-slug="{slug}" hidden></button><button data-role-toggle="{slug}" hidden></button><button data-role-delete="{slug}" hidden></button><button data-role-restore="{slug}" hidden></button>'
    pill = (f'{PILL_CSS}<div class="site-pill"><button type="button" class="pill-more" aria-label="Menu" onclick="this.parentNode.classList.toggle(&#39;open&#39;)">☰</button><a href="{back_href}">← {esc(back_label)}</a>'
            f'<a href="{home_href}">Home</a><button type="button" title="Light / dark" onclick="{THEME_CLICK}">◐</button>{done_btn}</div>'
            f'{auth_scripts(home_href, courses)}{TAB_SCROLL}{PILL_JS}')
    text = text.replace("<head>", "<head>" + THEME_HEAD + GATE_HEAD, 1) if "<head>" in text else THEME_HEAD + GATE_HEAD + text
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
        back = depth_root + info["path"] + ("" if is_review(a) else "#res")
        label = f"Chapter {ch['label']}" if ch["n"] else ch["title"]
        for f in src.rglob("*"):
            if f.is_dir():
                continue
            target = dest / f.relative_to(src)
            target.parent.mkdir(parents=True, exist_ok=True)
            if f.suffix == ".html":
                target.write_text(bust(inject_pill(f.read_text(encoding="utf-8"), back, label, depth_root, a["slug"], sorted({c for c, _ in a["places"]}), is_review(a))), encoding="utf-8")
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
    build_assessments()
    build_artifacts()
    n = sum(1 for _ in OUT.rglob("index.html"))
    print(f"Built {n} index pages, {len(ARTIFACTS)} artifacts -> {OUT}")


if __name__ == "__main__":
    main()
