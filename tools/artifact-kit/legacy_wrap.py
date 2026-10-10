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
    s = re.sub(r"(?<![\w.-])section(?![\w-])", "", s).strip() or ".lt-sec"
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
    src = re.sub(r"<section\b", "<div", src).replace("</section>", "</div>")
    return src


KIT = {"bg", "surface", "ink", "muted", "line", "accent", "accent-soft", "good", "good-soft", "bad", "bad-soft", "mono", "sans", "serif", "soft", "accent-ink", "warn", "warn-soft"}


def extras(src):
    """Legacy custom properties the kit does not define, as a .lt block (light + both dark forms). Maps --display/--body onto the kit fonts."""
    def grab(block):
        return {k: v.strip() for k, v in re.findall(r"(--[\w-]+)\s*:\s*([^;}]+)", block) if k[2:] not in KIT and k not in ("--display", "--body", "--mono")}
    m = re.search(r":root\s*\{([^}]*)\}", src)
    light = grab(m.group(1)) if m else {}
    m = re.search(r":root\[data-theme=\"dark\"\]\s*\{([^}]*)\}", src)
    dark = grab(m.group(1)) if m else {}
    f = lambda d: ";".join(f"{k}:{v}" for k, v in d.items())
    return (".lt{" + f(light) + ";--display:var(--serif);--body:var(--sans)}\n"
            "@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]) .lt{" + f(dark) + "}}\n"
            ":root[data-theme=\"dark\"] .lt{" + f(dark) + "}\n")


def section(src, sid):
    """Raw HTML of the <section ... id=sid> element (balanced)."""
    m = re.search(r"<section\b[^>]*\bid=\"%s\"[^>]*>" % re.escape(sid), src)
    if not m:
        raise KeyError(sid)
    depth, i = 0, m.start()
    for t in re.finditer(r"<section\b|</section>", src[m.start():]):
        depth += 1 if t.group().startswith("<section") else -1
        if depth == 0:
            return src[m.start(): m.start() + t.end()]


def js(src):
    src = re.sub(r'(class=\\?")([^"\\]*)(\\?")', _tok, src)
    src = re.sub(r"(className\s*=\s*['\"])([^'\"]*)(['\"])", _tok, src)
    src = re.sub(r"(classList\.(?:add|remove|toggle|contains)\()([^)]*)(\))",
                 lambda m: m.group(1) + re.sub(r"(['\"])([A-Za-z][\w-]*)\1", lambda q: q.group(1) + P + q.group(2) + q.group(1), m.group(2)) + m.group(3), src)

    def qsel(m):
        return m.group(1) + CLS.sub(lambda c: "." + P + c.group(1), m.group(2)) + m.group(3)

    src = re.sub(r"((?:querySelector(?:All)?|closest|matches)\(\s*['\"`])([^'\"`]*)(['\"`])", qsel, src)
    return src
