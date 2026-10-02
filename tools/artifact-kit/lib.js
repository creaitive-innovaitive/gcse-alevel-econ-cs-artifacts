const $ = (s, e = document) => e.querySelector(s), $$ = (s, e = document) => [...e.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const fmtN = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toString();

/* ---------- tabs ---------- */
function initTabs() {
  const list = $(".tablist"), tabs = $$("[role=tab]", list), panels = tabs.map((t) => $("#" + t.dataset.p));
  const show = (i, focus) => {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; panels[k].hidden = k !== i; });
    if (focus) tabs[i].focus();
    try { history.replaceState(null, "", "#" + tabs[i].dataset.p); } catch (e) {}
    window.dispatchEvent(new Event("resize"));
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { show(i); window.scrollTo(0, 0); });
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); show((i + 1) % tabs.length, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); show((i + tabs.length - 1) % tabs.length, true); }
    });
  });
  const start = tabs.findIndex((t) => "#" + t.dataset.p === location.hash);
  show(start < 0 ? 0 : start);
}

/* ---------- svg string helpers ---------- */
const at = (o) => Object.entries(o || {}).map(([k, v]) => ` ${k}="${v}"`).join("");
const SV = {
  line: (x1, y1, x2, y2, c = "ax", o) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${c}"${at(o)}/>`,
  text: (x, y, t, c = "lbl", o) => `<text x="${x}" y="${y}" class="${c}"${at(o)}>${t}</text>`,
  circle: (x, y, r, c = "dot1", o) => `<circle cx="${x}" cy="${y}" r="${r}" class="${c}"${at(o)}/>`,
  rect: (x, y, w, h, c = "f1", o) => `<rect x="${x}" y="${y}" width="${Math.max(0, w)}" height="${Math.max(0, h)}" class="${c}"${at(o)}/>`,
  path: (d, c = "c1", o) => `<path d="${d}" class="${c}"${at(o)}/>`,
  poly: (pts, c = "f1", o) => `<polygon points="${pts.map((p) => p.join(",")).join(" ")}" class="${c}"${at(o)}/>`,
  arrowHead: (x, y, dir, c = "dot1") => { const s = 7; const p = { r: [[x, y], [x - s * 1.6, y - s], [x - s * 1.6, y + s]], l: [[x, y], [x + s * 1.6, y - s], [x + s * 1.6, y + s]], u: [[x, y], [x - s, y + s * 1.6], [x + s, y + s * 1.6]], d: [[x, y], [x - s, y - s * 1.6], [x + s, y - s * 1.6]] }[dir]; return `<polygon points="${p.map((q) => q.join(",")).join(" ")}" class="${c}"/>`; },
};
const ptsPath = (pts) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");

/* ---------- animated stepper ---------- */
function stepper(el, cfg) {
  const W = cfg.w || 760, H = cfg.h || 400, steps = cfg.steps;
  el.innerHTML = `<div class="stp"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.label || "Animated diagram")}"></svg>
    <div class="stp-cap" aria-live="polite"></div>
    <div class="stp-ctl"><button class="b" data-a="back">◀ Back</button><button class="b pri" data-a="play">▶ Play</button><button class="b" data-a="next">Next ▶</button><button class="b" data-a="restart" aria-label="Restart">↻</button><span class="stp-dots"></span></div></div>`;
  const svg = $("svg", el), cap = $(".stp-cap", el), dots = $(".stp-dots", el), playBtn = $("[data-a=play]", el);
  let cur = 0, drawn = { ...cfg.base, ...steps[0].s }, raf = 0, timer = 0, playing = false;
  steps.forEach((_, i) => { const d = document.createElement("button"); d.textContent = i + 1; d.setAttribute("aria-label", "Step " + (i + 1)); d.onclick = () => { stop(); go(i); }; dots.appendChild(d); });
  const interp = (a, b, t) => { const o = {}; for (const k in b) o[k] = typeof b[k] === "number" && typeof a[k] === "number" ? a[k] + (b[k] - a[k]) * t : t > 0.5 ? b[k] : a[k] !== undefined ? a[k] : b[k]; return o; };
  const paint = (s) => { drawn = s; svg.innerHTML = cfg.draw(s); };
  function go(i) {
    cur = Math.max(0, Math.min(steps.length - 1, i));
    cap.innerHTML = steps[cur].cap;
    $$("button", dots).forEach((d, k) => { d.classList.toggle("on", k === cur); d.classList.toggle("done", k < cur); });
    const from = drawn, to = { ...cfg.base, ...steps[cur].s }, t0 = performance.now(), dur = reduced ? 0 : cfg.tween || 900;
    cancelAnimationFrame(raf);
    const tick = (now) => { const t = dur ? Math.min(1, (now - t0) / dur) : 1, e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; paint(interp(from, to, e)); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
  }
  function stop() { playing = false; clearTimeout(timer); playBtn.textContent = "▶ Play"; }
  function advance() { if (!playing) return; if (cur >= steps.length - 1) return stop(); go(cur + 1); timer = setTimeout(advance, cfg.dwell || 4800); }
  playBtn.onclick = () => { if (playing) return stop(); if (cur >= steps.length - 1) go(0); playing = true; playBtn.textContent = "❚❚ Pause"; timer = setTimeout(advance, cfg.dwell ? Math.min(cfg.dwell, 3000) : 2500); };
  $("[data-a=back]", el).onclick = () => { stop(); go(cur - 1); };
  $("[data-a=next]", el).onclick = () => { stop(); go(cur + 1); };
  $("[data-a=restart]", el).onclick = () => { stop(); go(0); };
  paint(drawn); go(0);
}

/* ---------- slider ---------- */
function slider(el, o) {
  const id = o.id;
  el.innerHTML = `<div class="sl"><label for="${id}">${o.label}<output id="${id}o"></output></label><input type="range" id="${id}" min="${o.min}" max="${o.max}" step="${o.step || 1}" value="${o.value}"></div>`;
  const i = $("#" + id, el), out = $("#" + id + "o", el);
  const upd = () => { out.textContent = (o.fmt || ((v) => v))(+i.value); o.onInput && o.onInput(+i.value); };
  i.addEventListener("input", upd); upd();
  return { get: () => +i.value, set: (v) => { i.value = v; upd(); } };
}

/* ---------- classify (also powers match) ---------- */
function classify(el, o) {
  const items = o.items.map((x, i) => ({ ...x, id: i })), cap = o.cap || 99;
  el.classList.add("cls"); if (o.match) el.classList.add("match");
  el.innerHTML = `${o.prompt ? `<p>${o.prompt}</p>` : ""}<div class="pool" data-b="pool" aria-label="Items to place"></div>
    <div class="buckets">${o.buckets.map((b, i) => `<div class="bk" data-b="${i}"><h4>${b.label}</h4><div class="slot"></div></div>`).join("")}</div>
    <div class="row"><button class="b pri" data-a="check">Check</button><button class="b" data-a="reset">Reset</button></div><div class="msg" aria-live="polite"></div>`;
  const pool = $(".pool", el), msg = $(".msg", el);
  let sel = null;
  const chip = (it) => { const c = document.createElement("button"); c.className = "chip"; c.type = "button"; c.draggable = true; c.textContent = it.text; c.dataset.id = it.id;
    c.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", it.id); sel = c; });
    c.addEventListener("click", (e) => { e.stopPropagation(); if (sel === c) { c.classList.remove("sel"); sel = null; } else { sel && sel.classList.remove("sel"); sel = c; c.classList.add("sel"); } });
    return c; };
  const place = (c, zone) => {
    const slot = zone === pool ? pool : $(".slot", zone);
    if (zone !== pool && slot.children.length >= cap) { const old = slot.firstElementChild; pool.appendChild(old); }
    slot.appendChild(c); c.classList.remove("sel", "ok", "no"); sel = null; msg.textContent = "";
  };
  const fill = () => { pool.innerHTML = ""; $$(".slot", el).forEach((s) => (s.innerHTML = "")); (o.noShuffle ? items : shuffle(items)).forEach((it) => pool.appendChild(chip(it))); msg.textContent = ""; };
  [pool, ...$$(".bk", el)].forEach((z) => {
    z.addEventListener("dragover", (e) => { e.preventDefault(); z.classList.add("over"); });
    z.addEventListener("dragleave", () => z.classList.remove("over"));
    z.addEventListener("drop", (e) => { e.preventDefault(); z.classList.remove("over"); const c = $(`[data-id="${e.dataTransfer.getData("text/plain")}"]`, el); c && place(c, z); });
    z.addEventListener("click", () => { if (sel) place(sel, z); });
  });
  $("[data-a=check]", el).onclick = () => {
    let ok = 0;
    $$(".bk", el).forEach((b) => $$(".chip", b).forEach((c) => { const good = items[+c.dataset.id].b === +b.dataset.b; c.classList.toggle("ok", good); c.classList.toggle("no", !good); if (good) ok++; }));
    const left = $$(".chip", pool).length;
    msg.textContent = left ? `${left} still to place. ${ok} correct so far.` : ok === items.length ? "All correct. " + (o.done || "") : `${ok} of ${items.length} correct. Red ones are in the wrong place; move them and check again.`;
  };
  $("[data-a=reset]", el).onclick = fill;
  fill();
}
function match(el, o) {
  classify(el, { match: true, cap: 1, prompt: o.prompt, buckets: o.pairs.map((p) => ({ label: p[0] })), items: o.pairs.map((p, i) => ({ text: p[1], b: i })), done: o.done });
}

/* ---------- ordering ---------- */
function order(el, o) {
  el.classList.add("ord");
  el.innerHTML = `${o.prompt ? `<p>${o.prompt}</p>` : ""}<ol></ol><div class="row"><button class="b pri" data-a="check">Check order</button><button class="b" data-a="reset">Shuffle again</button></div><div class="msg" aria-live="polite"></div>`;
  const ol = $("ol", el), msg = $(".msg", el);
  let dragEl = null;
  const make = (t, id) => { const li = document.createElement("li"); li.draggable = true; li.dataset.id = id; li.innerHTML = `<span>${t}</span><button class="b" type="button" aria-label="Move up">↑</button><button class="b" type="button" aria-label="Move down">↓</button>`;
    li.addEventListener("dragstart", () => { dragEl = li; li.classList.add("drag"); });
    li.addEventListener("dragend", () => { li.classList.remove("drag"); dragEl = null; });
    li.addEventListener("dragover", (e) => { e.preventDefault(); if (!dragEl || dragEl === li) return; const r = li.getBoundingClientRect(); ol.insertBefore(dragEl, e.clientY < r.top + r.height / 2 ? li : li.nextSibling); });
    $$("button", li)[0].onclick = () => { li.previousElementSibling && ol.insertBefore(li, li.previousElementSibling); };
    $$("button", li)[1].onclick = () => { li.nextElementSibling && ol.insertBefore(li.nextElementSibling, li); };
    return li; };
  const fill = () => { ol.innerHTML = ""; let s; do { s = shuffle(o.items.map((t, i) => [t, i])); } while (o.items.length > 1 && s.every((x, i) => x[1] === i)); s.forEach(([t, i]) => ol.appendChild(make(t, i))); msg.textContent = ""; };
  $("[data-a=check]", el).onclick = () => { let ok = 0; $$("li", ol).forEach((li, i) => { const g = +li.dataset.id === i; li.classList.toggle("ok", g); li.classList.toggle("no", !g); if (g) ok++; }); msg.textContent = ok === o.items.length ? "Correct order. " + (o.done || "") : `${ok} of ${o.items.length} in the right place.`; };
  $("[data-a=reset]", el).onclick = fill; fill();
}

/* ---------- multiple choice ---------- */
function quiz(el, o) {
  el.classList.add("qz");
  let score = 0, answered = 0;
  el.innerHTML = o.qs.map((q, i) => `<div class="q" data-i="${i}"><p class="qt">${i + 1}. ${q.q}</p>${q.opts.map((t, k) => `<button class="opt" data-k="${k}">${String.fromCharCode(65 + k)}. ${t}</button>`).join("")}<div class="why"><b>${"Answer: " + String.fromCharCode(65 + q.a)}.</b> ${q.why}</div></div>`).join("") + `<div class="score" aria-live="polite"></div><button class="b" data-a="again">Try again</button>`;
  const sc = $(".score", el);
  $$(".q", el).forEach((box) => { const q = o.qs[+box.dataset.i];
    $$(".opt", box).forEach((b) => b.addEventListener("click", () => { if (box.classList.contains("done")) return; box.classList.add("done"); answered++; const k = +b.dataset.k; if (k === q.a) score++; b.classList.add(k === q.a ? "ok" : "no"); $$(".opt", box)[q.a].classList.add("ok"); sc.textContent = `Score: ${score} / ${answered} answered (of ${o.qs.length})`; })); });
  $("[data-a=again]", el).onclick = () => { score = answered = 0; sc.textContent = ""; $$(".q", el).forEach((b) => { b.classList.remove("done"); $$(".opt", b).forEach((x) => x.classList.remove("ok", "no")); }); };
}

/* ---------- calculations ---------- */
function calc(el, o) {
  el.classList.add("calc");
  el.innerHTML = o.qs.map((q, i) => `<div class="q" data-i="${i}"><p>${i + 1}. ${q.q}</p>
    <div class="row"><input type="text" inputmode="decimal" aria-label="Answer ${i + 1}" placeholder="${q.ph || "answer"}">${q.unit ? `<span>${q.unit}</span>` : ""}<button class="b pri" data-a="c">Check</button><button class="b" data-a="h">Hint</button><button class="b" data-a="s">Show working</button><span class="fb" aria-live="polite"></span></div>
    <div class="sol" data-s="h">${q.hint || "Write the formula first, then substitute."}</div><div class="sol" data-s="s">${q.sol}</div></div>`).join("");
  $$(".q", el).forEach((box) => { const q = o.qs[+box.dataset.i], inp = $("input", box), fb = $(".fb", box);
    const check = () => { const v = parseFloat(inp.value.replace(/[,$%\s−]/g, (m) => (m === "−" ? "-" : ""))); const good = !isNaN(v) && Math.abs(v - q.a) <= (q.tol ?? 0.01); fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); };
    $("[data-a=c]", box).onclick = check; inp.addEventListener("keydown", (e) => e.key === "Enter" && check());
    $("[data-a=h]", box).onclick = () => $("[data-s=h]", box).classList.toggle("show");
    $("[data-a=s]", box).onclick = () => $("[data-s=s]", box).classList.toggle("show"); });
}

/* ---------- flashcards ---------- */
function cards(el, o) {
  let deck = o.cards.map((c) => c), i = 0, back = false, known = new Set();
  el.classList.add("fc");
  el.innerHTML = `<div class="face" tabindex="0" role="button" aria-label="Flip card"></div><div class="row" style="margin-top:10px"><button class="b" data-a="p">◀</button><button class="b" data-a="f">Flip</button><button class="b" data-a="n">▶</button><button class="b" data-a="s">Shuffle</button><button class="b pri" data-a="k">I know this</button><span class="note" data-c></span></div>`;
  const face = $(".face", el), cnt = $("[data-c]", el);
  const paint = () => { const c = deck[i]; face.className = "face" + (back ? " back" : ""); face.innerHTML = `<div><small>${back ? "Definition" : "Term"}</small>${back ? c[1] : "<b>" + c[0] + "</b>"}</div>`; cnt.textContent = `${i + 1} / ${deck.length} · known ${known.size}`; };
  const flip = () => { back = !back; paint(); };
  face.onclick = flip; face.onkeydown = (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), flip());
  $("[data-a=f]", el).onclick = flip;
  $("[data-a=n]", el).onclick = () => { i = (i + 1) % deck.length; back = false; paint(); };
  $("[data-a=p]", el).onclick = () => { i = (i + deck.length - 1) % deck.length; back = false; paint(); };
  $("[data-a=s]", el).onclick = () => { deck = shuffle(deck); i = 0; back = false; paint(); };
  $("[data-a=k]", el).onclick = () => { known.add(deck[i][0]); i = (i + 1) % deck.length; back = false; paint(); };
  paint();
}

window.Lib = { initTabs, SV, ptsPath, stepper, slider, classify, match, order, quiz, calc, cards, fmtN, esc };
