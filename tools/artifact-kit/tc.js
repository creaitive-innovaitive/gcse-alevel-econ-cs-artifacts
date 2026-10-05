const MONO = "font-family:ui-monospace,Menlo,Consolas,monospace;";
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const PV = [-128, 64, 32, 16, 8, 4, 2, 1];
const bin8 = (n) => (n & 255).toString(2).padStart(8, "0");
const tcVal = (s) => [...s].reduce((a, b, i) => a + (b === "1" ? PV[i] : 0), 0);
const flip = (s) => [...s].map((c) => (c === "1" ? "0" : "1")).join("");
const minus = (n) => (n < 0 ? "−" : "") + Math.abs(n);
const bigTxt = (x, y, t, cls, px = 28, extra) => SV.text(x, y, t, "lbl bd " + (cls || ""), { "text-anchor": "middle", style: MONO + "font-size:" + px + "px", ...extra });
const spans = (bits, mark = () => "") => [...bits].map((c, i) => `<span class="${mark(i)}">${c}</span>`).join("");

/* ---------- 1. Method A: read 11010011 ---------- */
const READ = "11010011", run = (() => { let t = 0; return [...READ].map((b, i) => (t += b === "1" ? PV[i] : 0)); })();
function readChart(s) {
  const k = Math.round(s.k), X = (i) => 60 + i * 88;
  let o = SV.text(380, 26, "Read 11010011 as an 8-bit two's complement number", "lbl bd", { "text-anchor": "middle" });
  PV.forEach((p, i) => {
    const done = i < k, one = READ[i] === "1", cur = i === k - 1;
    o += bigTxt(X(i), 78, minus(p), i === 0 ? "t2" : "t1", 20);
    o += SV.rect(X(i) - 34, 96, 68, 66, done && one ? "f3" : "f1", { rx: 10, opacity: done || k === 0 ? 1 : 0.55, ...(cur ? { stroke: "var(--accent)", "stroke-width": 3 } : {}) });
    o += bigTxt(X(i), 142, READ[i], one ? "t3" : "", 38);
  });
  if (k > 0) {
    const i = k - 1, one = READ[i] === "1";
    o += SV.text(380, 212, one ? `Bit is 1: add ${minus(PV[i])}` : "Bit is 0: add nothing", "lbl bd", { "text-anchor": "middle", style: "font-size:18px" });
    o += SV.text(380, 246, "Running total: " + minus(run[i]), "lbl bd t2", { "text-anchor": "middle", style: "font-size:20px" });
  }
  if (k === 8) o += SV.text(380, 290, "−128 + 64 + 16 + 2 + 1 = −45", "lbl bd t3", { "text-anchor": "middle", style: "font-size:17px" });
  return o;
}
const rs = [{ cap: "The leftmost place value is <b>−128</b>, not +128. The other place values are the same as ordinary binary. Add up the columns that hold a 1.", s: { k: 0 } }];
[...READ].forEach((b, i) => rs.push({ cap: b === "1" ? `Column ${minus(PV[i])} holds a 1, so add it. Running total: <b>${minus(run[i])}</b>.` : `Column ${PV[i]} holds a 0. Add nothing. Total stays <b>${minus(run[i])}</b>.`, s: { k: i + 1 } }));
rs[8].cap += " The answer is <b>−45</b>.";
Lib.stepper($("#stA"), { w: 760, h: 310, label: "Reading a two's complement number with place values", base: { k: 0 }, tween: 500, dwell: 3200, draw: readChart, steps: rs });

/* ---------- 2. Method B: write -20 ---------- */
const P = bin8(20), F = flip(P), R = bin8(-20);
function mkChart(s) {
  const X = (i) => 190 + i * 62, rows = [["20", P, 62], ["flip", F, 132], ["+ 1", R, 202]];
  let o = "";
  rows.forEach(([lab, bits, y], r) => {
    const op = clamp01(s.p - r + 1);
    if (op <= 0.01) return;
    o += SV.text(40, y + 8, lab, "lbl bd t1", { opacity: op, "text-anchor": "start", style: "font-size:20px" });
    [...bits].forEach((b, i) => {
      const ch = r === 1 || (r === 2 && bits[i] !== F[i]);
      o += SV.rect(X(i) - 26, y - 28, 52, 52, ch ? "f4" : "f1", { rx: 8, opacity: op }) + bigTxt(X(i), y + 10, b, ch ? "t4" : "", 30, { opacity: op });
    });
  });
  const op3 = clamp01(s.p - 2);
  if (op3 > 0.01) {
    PV.forEach((v, i) => { o += SV.text(X(i), 254, minus(v), "lbl bd " + (i === 0 ? "t2" : "t1"), { "text-anchor": "middle", opacity: op3, style: MONO + "font-size:15px" }); });
    o += SV.text(380, 290, "−128 + 64 + 32 + 8 + 4 = −20", "lbl bd t3", { "text-anchor": "middle", opacity: op3, style: "font-size:18px" });
  }
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 310, label: "Writing minus 20 in two's complement", base: { p: 0 }, tween: 700, dwell: 4200, draw: mkChart, steps: [
  { cap: "Write the <b>positive</b> number in 8 bits: 20 = <b>00010100</b>. Include the leading zeros.", s: { p: 0 } },
  { cap: "<b>Flip every bit.</b> Every 0 becomes 1 and every 1 becomes 0: <b>11101011</b>.", s: { p: 1 } },
  { cap: "<b>Add 1.</b> 11101011 + 1 = <b>11101100</b>. The carry runs through the two trailing 1s, so three bits change.", s: { p: 2 } },
  { cap: "<b>Check</b> with Method A: −128 + 64 + 32 + 8 + 4 = −20. ✓", s: { p: 3 } },
] });

/* ---------- 3. 45 - 20 ---------- */
const A45 = bin8(45), M20 = bin8(-20), SUMV = 45 + 236, SUMB = SUMV.toString(2).padStart(9, "0");
function subChart(s) {
  const X = (j) => 130 + j * 68;
  let o = "";
  const row = (lab, bits, y, op, cls) => {
    if (op <= 0.01) return "";
    let r = SV.text(24, y + 8, lab, "lbl bd t1", { "text-anchor": "start", opacity: op, style: "font-size:18px" });
    [...bits].forEach((b, i) => { r += bigTxt(X(i + (9 - bits.length)), y + 8, b, cls, 28, { opacity: op }); });
    return r;
  };
  o += row("45", A45, 58, clamp01(s.p + 1));
  o += row("+ (−20)", M20, 112, clamp01(s.p));
  if (s.p > 0.01) o += SV.line(20, 134, X(8) + 30, 134, "ax", { opacity: clamp01(s.p) });
  o += row("Total", SUMB, 184, clamp01(s.p - 1), "t3");
  const d = clamp01(s.p - 2);
  if (d > 0.01) {
    o += SV.rect(X(0) - 28, 156, 56, 44, "f2", { rx: 8, opacity: d }) + SV.line(X(0) - 24, 196, X(0) + 24, 160, "c2", { opacity: d });
    o += SV.text(X(0), 226, "9th bit: discard", "lbl bd t2", { "text-anchor": "middle", opacity: d, style: "font-size:14px" });
  }
  const c = clamp01(s.p - 3);
  if (c > 0.01) o += SV.text(X(4.5), 270, "00011001 = 16 + 8 + 1 = 25  ✓  (45 − 20 = 25)", "lbl bd t3", { "text-anchor": "middle", opacity: c, style: "font-size:18px" });
  if (s.p < 0.5) o += SV.text(380, 130, "45 − 20 = 45 + (−20)", "lbl bd t2", { "text-anchor": "middle", style: "font-size:24px", opacity: 1 - s.p * 2 });
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 300, label: "Subtracting by adding a negative", base: { p: 0 }, tween: 700, dwell: 4300, draw: subChart, steps: [
  { cap: "The computer does not subtract. It turns <b>45 − 20</b> into <b>45 + (−20)</b>. Start with 45 in 8 bits: <b>00101101</b>.", s: { p: 0 } },
  { cap: "Write <b>−20</b> in two's complement (previous animation): <b>11101100</b>.", s: { p: 1 } },
  { cap: "<b>Add</b> the two binary numbers as usual. The total needs 9 bits: <b>1 00011001</b>.", s: { p: 2 } },
  { cap: "A 9th bit cannot be stored in an 8-bit register, so the carry is <b>discarded</b>. This is expected here, not an error.", s: { p: 3 } },
  { cap: "What is left is <b>00011001 = 25</b>. Check: 45 − 20 = 25. ✓", s: { p: 4 } },
] });

/* ---------- Lab 1 ---------- */
(() => {
  let sl;
  const upd = () => {
    if (!sl) return;
    const n = sl.get(), b = bin8(n);
    let h = "";
    const step = (i, t) => `<div class="step"><i>${i}</i><div>${t}</div></div>`;
    if (n >= 0) {
      h += step("1", `${n} is zero or positive, so write it as ordinary 8-bit binary:<div class="bitrow">${spans(b)}</div>`);
      h += step("2", "The leading bit is 0. No flipping and no adding 1.");
    } else if (n === -128) {
      h += step("1", "−128 is the special case: +128 does not fit in 8 bits, so flip and add 1 does not work in the usual way.");
      h += step("2", `It is the smallest number: sign bit 1 and the rest 0.<div class="bitrow">${spans(b)}</div>`);
    } else {
      const p = bin8(-n), f = flip(p);
      h += step("1", `Write ${-n} (the positive size) in 8 bits:<div class="bitrow">${spans(p)}</div>`);
      h += step("2", `Flip every bit:<div class="bitrow">${spans(f, () => "ch")}</div>`);
      h += step("3", `Add 1:<div class="bitrow">${spans(b, (i) => (b[i] !== f[i] ? "ch" : ""))}</div>`);
    }
    const terms = [...b].map((c, i) => (c === "1" ? minus(PV[i]) : null)).filter(Boolean);
    h += step("✓", `Check with place values: ${terms.length ? terms.join(" + ").replace(/\+ −/g, "− ").replace(/^−/, "−") : "0"} = <b>${minus(n)}</b>`);
    $("#work").innerHTML = h;
    $("#wv").innerHTML = `<b>${minus(n)}</b> in 8-bit two's complement is <b style="font-family:var(--mono)">${b.slice(0, 4)} ${b.slice(4)}</b>`;
  };
  sl = Lib.slider($("#a1"), { id: "an", label: "Denary number", min: -128, max: 127, step: 1, value: -45, fmt: (v) => minus(v), onInput: upd });
  upd();
})();

/* ---------- Lab 2 ---------- */
(() => {
  const row = $("#bitsrow"), bits = [1, 1, 0, 1, 0, 0, 1, 1];
  const ws = PV.map((p, i) => { const w = document.createElement("div"); w.className = "bit" + (i === 0 ? " sign" : ""); w.innerHTML = `<button type="button" aria-pressed="false" aria-label="Bit ${p}"></button><small>${minus(p)}</small>`; row.appendChild(w); $("button", w).onclick = () => { bits[i] ^= 1; paint(); }; return w; });
  function paint() {
    ws.forEach((w, i) => { const b = $("button", w); b.textContent = bits[i]; b.setAttribute("aria-pressed", bits[i] === 1); });
    const s = bits.join(""), terms = [...s].map((c, i) => (c === "1" ? minus(PV[i]) : null)).filter(Boolean);
    $("#b1").textContent = terms.length ? terms.join(" + ").replace(/\+ −/g, "− ") : "0";
    $("#b2").textContent = minus(tcVal(s));
    $("#b3").textContent = bits[0] ? "1 → negative" : tcVal(s) === 0 ? "0 → zero" : "0 → positive";
  }
  const set = (f) => { bits.forEach((_, i) => (bits[i] = f(i))); paint(); };
  $("#bz").onclick = () => set(() => 0); $("#bo").onclick = () => set(() => 1);
  $("#br").onclick = () => set(() => (Math.random() < 0.5 ? 1 : 0)); $("#bm").onclick = () => set((i) => (i === 0 ? 1 : 0));
  paint();
})();

/* ---------- Lab 3 ---------- */
(() => {
  let sl;
  const upd = () => {
    if (!sl) return;
    const n = sl.get(), lo = -(2 ** (n - 1)), hi = 2 ** (n - 1) - 1, loB = "1" + "0".repeat(n - 1), hiB = "0" + "1".repeat(n - 1);
    $("#r2").textContent = lo.toLocaleString("en-GB").replace("-", "−"); $("#r3").textContent = hi.toLocaleString("en-GB"); $("#r4").textContent = (2 ** n).toLocaleString("en-GB");
    $("#r5").innerHTML = `<b class="lab">Smallest</b>${spans(loB, (i) => (i === 0 ? "neg" : ""))}<br><b class="lab">Largest</b>${spans(hiB, (i) => (i === 0 ? "neg" : ""))}`.replace("<br>", '<div style="flex-basis:100%"></div>');
    $("#rv").textContent = `With ${n} bits: smallest = −2^${n - 1}, largest = 2^${n - 1} − 1. The positive side stops one short of the negative side because zero takes a place.`;
  };
  sl = Lib.slider($("#r1"), { id: "rn", label: "Number of bits", min: 2, max: 16, step: 1, value: 8, fmt: (v) => v + " bits", onInput: upd });
  upd();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each wording to the job it asks for.", buckets: [{ label: "Negative denary → binary" }, { label: "Binary → denary" }, { label: "Range or count" }, { label: "Subtraction" }], items: [
  { text: "Represent −90 in 8-bit two's complement", b: 0 }, { text: "Write −7 as an 8-bit two's complement binary number", b: 0 },
  { text: "State the denary value of 10011100", b: 1 }, { text: "What denary number does the two's complement 11100001 represent?", b: 1 },
  { text: "Give the smallest number that can be stored in 8 bits", b: 2 }, { text: "How many different values can an 8-bit two's complement number hold?", b: 2 },
  { text: "Calculate 50 − 18 using two's complement", b: 3 }, { text: "Show how a computer works out 9 − 14 using addition", b: 3 },
], done: "Find the job first, then pick the method." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Sign bit", "The leftmost bit; 1 means negative"], ["Flip the bits", "Change every 0 to 1 and every 1 to 0"], ["Two's complement", "A way of storing negative whole numbers in binary"],
  ["Range of 8 bits", "−128 to +127"], ["A − B", "A plus the two's complement of B"], ["10000000", "−128"],
] });

Lib.order($("#o1"), { prompt: "Put the steps for working out 30 − 12 in order.", items: [
  "Write 30 and 12 as 8-bit binary", "Flip the bits of 12 and add 1 to get −12", "Add 30 and −12 in binary", "Discard any carry beyond the 8th bit", "Check the answer: 00010010 = 18",
], done: "Make the negative, add, discard, check." });

Lib.calc($("#c1"), { qs: [
  { q: "State the denary value of the 8-bit two's complement number 11110000.", a: -16, sol: "−128 + 64 + 32 + 16 = −16.", hint: "Left bit is −128. Add the 1s." },
  { q: "State the denary value of the 8-bit two's complement number 01001101.", a: 77, sol: "Leading 0, so positive: 64 + 8 + 4 + 1 = 77.", hint: "Check the sign bit first." },
  { q: "State the denary value of the 8-bit two's complement number 10000000.", a: -128, sol: "−128 + 0 = −128. The smallest number." },
  { q: "State the denary value of the 8-bit two's complement number 11111111.", a: -1, sol: "−128 + 127 = −1." },
  { q: "Write −5 as an 8-bit two's complement number.", t: ["11111011"], ph: "8 bits", sol: "5 = 00000101. Flip: 11111010. Add 1: 11111011.", hint: "Positive, flip, add 1." },
  { q: "Write −20 as an 8-bit two's complement number.", t: ["11101100"], ph: "8 bits", sol: "20 = 00010100. Flip: 11101011. Add 1: 11101100." },
  { q: "Write −100 as an 8-bit two's complement number.", t: ["10011100"], ph: "8 bits", sol: "100 = 01100100. Flip: 10011011. Add 1: 10011100. Check: −128 + 16 + 8 + 4 = −100." },
  { q: "What is the smallest number that can be stored as a 4-bit two's complement number?", a: -8, sol: "−2³ = −8 (1000)." },
  { q: "How many different values can be stored in 8-bit two's complement?", a: 256, sol: "2⁸ = 256 (−128 to +127)." },
  { q: "Calculate 9 − 5 using 8-bit two's complement. Give the 8-bit binary answer.", t: ["00000100"], ph: "8 bits", sol: "9 = 00001001. −5 = 11111011. Sum = 1 00000100. Discard the 9th bit: 00000100 = 4.", hint: "9 + (−5)." },
  { q: "Calculate 20 − 45 using two's complement. Give the answer in denary.", a: -25, sol: "20 = 00010100. −45 = 11010011. Sum = 11100111, no carry out. −128 + 64 + 32 + 4 + 2 + 1 = −25.", hint: "The result is negative, so there is no ninth bit." },
] });

(() => {
  const el = $("#drill"), modes = [["d2t", "negative number → two's complement"], ["t2d", "two's complement → denary"], ["sub", "subtraction (denary answer)"], ["mix", "mixed"]];
  el.innerHTML = `<label>Practise: <select>${modes.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <div class="qline" aria-live="polite"></div>
    <div class="row"><input type="text" autocomplete="off" autocapitalize="off" aria-label="Your answer"><button class="b pri" data-a="c">Check</button><button class="b" data-a="s">Show working</button><button class="b" data-a="n">New question</button><span class="fb" aria-live="polite"></span></div>
    <p class="note" data-s></p><div class="work" data-w></div>`;
  const sel = $("select", el), ql = $(".qline", el), inp = $("input", el), fb = $(".fb", el), st = $("[data-s]", el), wk = $("[data-w]", el);
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  let ans = "", work = "", streak = 0, best = 0, solved = false;
  const norm = (v) => v.replace(/[\s,]/g, "").replace(/−/g, "-").toUpperCase();
  function gen() {
    let m = sel.value; solved = false; if (m === "mix") m = ["d2t", "t2d", "sub"][rnd(0, 2)];
    if (m === "d2t") { const n = rnd(1, 127), p = bin8(n); ql.textContent = `Write −${n} as an 8-bit two's complement number.`; ans = bin8(-n); work = `${n} = ${p}. Flip: ${flip(p)}. Add 1: ${ans}.`; }
    if (m === "t2d") { const n = rnd(-128, 127), b = bin8(n); ql.textContent = `State the denary value of the 8-bit two's complement number ${b.slice(0, 4)} ${b.slice(4)}.`; ans = String(n); const terms = [...b].map((c, i) => (c === "1" ? minus(PV[i]) : null)).filter(Boolean); work = `${terms.join(" + ").replace(/\+ −/g, "− ") || "0"} = ${minus(n)}.`; }
    if (m === "sub") { const a = rnd(10, 99), c = rnd(5, 90); ql.textContent = `Calculate ${a} − ${c} using two's complement. Give the answer in denary.`; ans = String(a - c); work = `${a} = ${bin8(a)}. −${c} = ${bin8(-c)}. Add: ${((a + ((-c) & 255))).toString(2).padStart(9, "0")}${a >= c ? ", discard the 9th bit" : ", no carry out"}. Result ${bin8(a - c)} = ${minus(a - c)}.`; }
    inp.value = ""; fb.textContent = ""; fb.className = "fb"; wk.innerHTML = "";
  }
  const check = () => {
    const good = norm(inp.value) === ans;
    if (!solved) { streak = good ? streak + 1 : 0; best = Math.max(best, streak); }
    if (good) solved = true;
    fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); st.textContent = `Streak ${streak} · best ${best}`;
  };
  $("[data-a=c]", el).onclick = check; inp.addEventListener("keydown", (e) => e.key === "Enter" && (solved ? gen() : check()));
  $("[data-a=n]", el).onclick = gen; sel.onchange = () => { streak = 0; st.textContent = ""; gen(); };
  $("[data-a=s]", el).onclick = () => { streak = 0; solved = true; wk.innerHTML = `<p><b>Working:</b> ${work}</p>`; st.textContent = "Streak 0 · best " + best; };
  gen();
})();

Lib.quiz($("#qz1"), { qs: [
  { q: "In 8-bit two's complement, what is the place value of the leftmost bit?", opts: ["+128", "−128", "−1", "+256"], a: 1, why: "Only the leftmost place value changes: it is −128." },
  { q: "What is 10000001 in 8-bit two's complement?", opts: ["129", "−1", "−127", "−129"], a: 2, why: "−128 + 1 = −127." },
  { q: "What is the first step in writing −12 in 8-bit two's complement?", opts: ["Flip the bits of 11", "Write 12 in 8-bit binary", "Put a 1 in front of 12", "Add 1 to 12"], a: 1, why: "Positive size first (00001100), then flip (11110011), then add 1 (11110100)." },
  { q: "How does a computer work out A − B in two's complement?", opts: ["It subtracts column by column", "It adds the two's complement of B to A", "It flips A and adds B", "It adds A and B and halves the result"], a: 1, why: "A − B = A + (−B), so the same adder is used." },
  { q: "What is the largest number that can be stored in 8-bit two's complement?", opts: ["128", "127", "255", "256"], a: 1, why: "01111111 = 127. The positive side stops one short of 128." },
  { q: "The leftmost bit of a two's complement number is 0. What do you know?", opts: ["It is negative", "It is zero or positive", "It has overflowed", "It is odd"], a: 1, why: "The sign bit 0 means zero or positive. Read it as ordinary binary." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Two's complement", "A way of storing negative whole numbers in binary. The leftmost place value is negative (−128 for 8 bits)."],
  ["Sign bit", "The leftmost bit. 0 means zero or positive, 1 means negative."],
  ["Flip (invert) the bits", "Change every 0 to 1 and every 1 to 0."],
  ["Method B", "To make a negative number: positive in binary, flip every bit, add 1."],
  ["Method A", "To read a two's complement number: add the place values with a 1, using −128 for the left bit."],
  ["Range (n bits)", "−2ⁿ⁻¹ to 2ⁿ⁻¹ − 1. For 8 bits: −128 to 127."],
  ["Subtraction", "A − B is worked out as A + (−B). A carry beyond the last bit is discarded."],
  ["Overflow", "The result is outside the range, so it cannot be stored correctly. Two positives giving a negative shows it."],
] });
