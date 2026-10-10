"""Helpers for porting an older standalone page into the kit shell without style clashes.
Every class token in the old HTML/CSS/JS gets a prefix (default "lt-"), every CSS rule is scoped under .lt,
so the old content keeps its look while the kit's own classes (.card, .pill, .bar ...) stay untouched."""
import re

P = "lt-"
CLS = re.compile(r"\.([A-Za-z_][\w-]*)")


def _sel(s, drop_el=()):
    s = s.strip()
    if s in ("*",):
        return ".lt *"
    if s == "section":
        return ".lt .lt-sec"
    s = CLS.sub(lambda m: "." + P + m.group(1), s)
    return ".lt " + s


def _rules(css):
    rules, depth, start = [], 0, 0
    for k, ch in enumerate(css):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                rules.append(css[start:k + 1].strip())
                start = k + 1
    return rules


def css(src, skip=("body", "html", ":root", "nav.top", "header.hero", ".wrap")):
    src = re.sub(r"/\*.*?\*/", "", src, flags=re.S)
    out = []
    for r in _rules(src):
        if r.startswith("@media"):
            m = re.match(r"(@media[^{]*)\{(.*)\}$", r, flags=re.S)
            inner = css(m.group(2), skip)
            if inner.strip():
                out.append(m.group(1) + "{" + inner + "}")
            continue
        sel, body = r.split("{", 1)
        sels = [s for s in sel.split(",") if not any(s.strip().startswith(k) for k in skip) and not s.strip().startswith(":root")]
        if not sels:
            continue
        out.append(",".join(_sel(s) for s in sels) + "{" + body)
    return "\n".join(out)


def _tok(m):
    return m.group(1) + " ".join(P + t if re.match(r"^[A-Za-z][\w-]*$", t) else t for t in m.group(2).split()) + m.group(3)


def html(src):
    src = re.sub(r'(class=")([^"]*)(")', _tok, src)
    src = re.sub(r"<section id=\"(\w+)\">", r'<div class="lt-sec" id="\1">', src).replace("</section>", "</div>")
    return src


def js(src):
    src = re.sub(r'(class=\\?")([^"\\]*)(\\?")', _tok, src)
    src = re.sub(r"(className\s*=\s*['\"])([^'\"]*)(['\"])", _tok, src)
    src = re.sub(r"(classList\.(?:add|remove|toggle|contains)\()([^)]*)(\))",
                 lambda m: m.group(1) + re.sub(r"(['\"])([A-Za-z][\w-]*)\1", lambda q: q.group(1) + P + q.group(2) + q.group(1), m.group(2)) + m.group(3), src)

    def qsel(m):
        return m.group(1) + CLS.sub(lambda c: "." + P + c.group(1), m.group(2)) + m.group(3)

    src = re.sub(r"((?:querySelector(?:All)?|closest|matches)\(\s*['\"`])([^'\"`]*)(['\"`])", qsel, src)
    return src
