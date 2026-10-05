const MONO = "font-family:ui-monospace,Menlo,Consolas,monospace;";
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const bin8 = (n) => n.toString(2).padStart(8, "0");
const hex2 = (n) => n.toString(16).toUpperCase().padStart(2, "0");
const bigTxt = (x, y, t, cls, px = 28, extra) => SV.text(x, y, t, "lbl bd " + (cls || ""), { "text-anchor": "middle", style: MONO + "font-size:" + px + "px", ...extra });

/* ---------- 1. denary to binary ---------- */
const PV = [128, 64, 32, 16, 8, 4, 2, 1], N1 = 181;
const trace = (() => { let r = N1; return PV.map((p) => { const before = r, bit = r >= p ? 1 : 0; r -= bit * p; return { p, before, bit, after: r }; }); })();
function denChart(s) {
  const k = Math.round(s.k);
  let o = SV.text(380, 28, "Convert " + N1 + " to 8-bit binary", "lbl bd", { "text-anchor": "middle" });
  PV.forEach((p, i) => {
    const x = 36 + i * 88, cx = x + 36, done = i < k, cur = i === k - 1;
    o += SV.text(cx, 78, p, "lbl bd t1", { "text-anchor": "middle", style: MONO + "font-size:20px" });
    o += SV.rect(x, 96, 72, 70, done ? (trace[i].bit ? "f3" : "f1") : "f1", { rx: 10, opacity: done ? 1 : 0.35, ...(cur ? { stroke: "var(--accent)", "stroke-width": 3 } : {}) });
    if (done) o += bigTxt(cx, 145, trace[i].bit, trace[i].bit ? "t3" : "", 40);
  });
  if (k > 0) {
    const t = trace[k - 1];
    o += SV.text(380, 220, t.bit ? t.p + " fits into " + t.before + ": write 1, subtract" : t.p + " is bigger than " + t.before + ": write 0", "lbl bd", { "text-anchor": "middle", style: "font-size:18px" });
    o += SV.text(380, 252, "Left to give: " + t.after, "lbl bd t2", { "text-anchor": "middle", style: "font-size:18px" });
  } else o += SV.text(380, 236, "Left to give: " + N1, "lbl bd t2", { "text-anchor": "middle", style: "font-size:18px" });
  if (k === 8) o += SV.text(380, 292, "128 + 32 + 16 + 4 + 1 = 181", "lbl bd t3", { "text-anchor": "middle", style: "font-size:17px" });
  return o;
}
const denSteps = [{ cap: "Write the place values 128 down to 1. Start at the left with <b>" + N1 + "</b> to give out.", s: { k: 0 } }];
trace.forEach((t, i) => denSteps.push({ cap: t.bit ? `<b>${t.p}</b> fits into ${t.before}. Write <b>1</b>, subtract: ${t.after} left.` : `<b>${t.p}</b> is too big for ${t.before}. Write <b>0</b>.`, s: { k: i + 1 } }));
denSteps[8].cap += " The answer is <b>10110101</b>. Check: 128 + 32 + 16 + 4 + 1 = 181.";
Lib.stepper($("#stA"), { w: 760, h: 310, label: "Converting 181 to binary one column at a time", base: { k: 0 }, tween: 500, dwell: 3200, draw: denChart, steps: denSteps });

/* ---------- 2. binary addition and overflow ---------- */
const A = "11001010", B = "01101100";
const add = (() => { let c = 0; const r = []; for (let p = 0; p < 8; p++) { const a = +A[7 - p], b = +B[7 - p], t = a + b + c; r.push({ a, b, cin: c, t, sum: t % 2, cout: t >> 1 }); c = t >> 1; } return r; })();
function addChart(s) {
  const k = Math.round(s.k), X = (j) => 110 + j * 66, ov = s.ov;
  const col = (p) => 8 - p; // column index j for bit position p
  let o = SV.text(24, 66, "carry", "sm", { "text-anchor": "start" }) + SV.text(64, 164, "+", "lbl bd", { "text-anchor": "middle", style: "font-size:30px" });
  for (let j = 1; j <= 8; j++) {
    o += bigTxt(X(j), 118, A[j - 1], "") + bigTxt(X(j), 168, B[j - 1], "");
  }
  o += SV.line(90, 186, X(8) + 28, 186, "ax");
  for (let p = 0; p < 8; p++) {
    const j = col(p);
    if (p < k) {
      o += bigTxt(X(j), 226, add[p].sum, "t3");
      if (add[p].cout) o += bigTxt(X(j - 1), 70, "1", "t2", 22);
    }
    if (p === k - 1 && ov < 0.01) o +=SV.rect(X(j) - 28, 92, 56, 150, "f1", { rx: 8 });
  }
  if (k >= 8) o += SV.rect(X(0) - 28, 196, 56, 42, "f2", { rx: 8, opacity: 1 }) + bigTxt(X(0), 226, add[7].cout, "t2", 28, { opacity: 1 });
  if (ov > 0.01) {
    o += SV.line(X(0) - 26, 232, X(0) + 26, 214, "c2", { opacity: ov });
    o += SV.text(X(0) + 4, 262, "9th bit: lost", "lbl bd t2", { "text-anchor": "middle", opacity: ov });
    o += SV.rect(X(1) - 30, 196, X(8) - X(1) + 60, 46, "f1", { rx: 10, opacity: ov * 0.8 });
    o += SV.text(X(4.5), 276, "8-bit register stores 00110110 = 54, but 202 + 108 = 310", "lbl bd t2", { "text-anchor": "middle", opacity: ov, style: "font-size:15px" });
    o += SV.text(X(4.5), 296, "OVERFLOW ERROR", "lbl bd t2", { "text-anchor": "middle", opacity: ov, style: "font-size:18px" });
  }
  return o;
}
const addSteps = [{ cap: "Add <b>11001010</b> (202) and <b>01101100</b> (108) in an 8-bit register. Start at the right-hand column.", s: { k: 0, ov: 0 } }];
add.forEach((c, p) => addSteps.push({ cap: `Column ${p + 1}: ${c.a} + ${c.b}${c.cin ? " + carry 1" : ""} = ${c.t}. Write <b>${c.sum}</b>${c.cout ? " and carry <b>1</b> to the next column" : ""}.`, s: { k: p + 1, ov: 0 } }));
addSteps[8].cap += " There is a carry out of the leftmost column.";
addSteps.push({ cap: "The answer needs <b>9 bits</b>, but the register holds only 8. The ninth bit is lost and the stored answer is wrong. This is <b>overflow</b>.", s: { k: 8, ov: 1 } });
Lib.stepper($("#stB"), { w: 760, h: 310, label: "Adding two 8-bit numbers and getting an overflow", base: { k: 0, ov: 0 }, tween: 500, dwell: 3200, draw: addChart, steps: addSteps });

/* ---------- 3. two's complement ---------- */
const P = "00101101", F = "11010010", R = "11010011";
function tcChart(s) {
  const X = (i) => 190 + i * 62, rows = [["45", P, 70], ["flip", F, 140], ["+ 1", R, 210]];
  let o = "";
  rows.forEach(([lab, bits, y], r) => {
    const op = clamp01(s.p - r + 1);
    if (op <= 0.01) return;
    o += SV.text(40, y + 8, lab, "lbl bd t1", { opacity: op, "text-anchor": "start", style: "font-size:20px" });
    [...bits].forEach((b, i) => {
      const changed = r === 1 || (r === 2 && bits[i] !== F[i]);
      o += SV.rect(X(i) - 26, y - 28, 52, 52, changed ? "f4" : "f1", { rx: 8, opacity: op }) + bigTxt(X(i), y + 10, b, changed ? "t4" : "", 30, { opacity: op });
    });
  });
  const op3 = clamp01(s.p - 2);
  if (op3 > 0.01) {
    const pv = [-128, 64, 32, 16, 8, 4, 2, 1];
    pv.forEach((v, i) => { o += SV.text(X(i), 262, v, "lbl bd " + (v < 0 ? "t2" : "t1"), { "text-anchor": "middle", opacity: op3, style: MONO + "font-size:15px" }); });
    o += SV.text(380, 296, "−128 + 64 + 16 + 2 + 1 = −45", "lbl bd t3", { "text-anchor": "middle", opacity: op3, style: "font-size:18px" });
  }
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 310, label: "Writing minus 45 in two's complement", base: { p: 0 }, tween: 700, dwell: 4200, draw: tcChart, steps: [
  { cap: "Start with the <b>positive</b> number, 45, in 8-bit binary: <b>00101101</b>.", s: { p: 0 } },
  { cap: "<b>Flip every bit.</b> 0 becomes 1 and 1 becomes 0: <b>11010010</b>.", s: { p: 1 } },
  { cap: "<b>Add 1:</b> 11010010 + 1 = <b>11010011</b>. That is −45 in 8-bit two's complement.", s: { p: 2 } },
  { cap: "<b>Check it.</b> The left place value is <b>−128</b>. Add the columns that hold a 1: −128 + 64 + 16 + 2 + 1 = −45.", s: { p: 3 } },
] });

/* ---------- Lab 1: bit flipper ---------- */
(() => {
  const row = $("#bitsrow"), tc = $("#tc"), bits = [0, 1, 0, 1, 1, 0, 1, 0];
  const btns = PV.map((p, i) => { const w = document.createElement("div"); w.className = "bit"; w.innerHTML = `<button type="button" aria-pressed="false" aria-label="Bit ${p}"></button><small></small>`; row.appendChild(w); const b = $("button", w); b.onclick = () => { bits[i] ^= 1; paint(); }; return w; });
  function paint() {
    const neg = tc.checked;
    btns.forEach((w, i) => { const b = $("button", w); b.textContent = bits[i]; b.setAttribute("aria-pressed", bits[i] === 1); $("small", w).textContent = i === 0 && neg ? "−128" : PV[i]; w.classList.toggle("sign", i === 0 && neg); });
    const u = parseInt(bits.join(""), 2), v = neg && bits[0] ? u - 256 : u;
    $("#r1").textContent = v; $("#r2").textContent = hex2(u); $("#r3").textContent = bits.slice(0, 4).join("") + " " + bits.slice(4).join("");
  }
  tc.onchange = paint;
  $("#bz").onclick = () => { bits.fill(0); paint(); }; $("#bo").onclick = () => { bits.fill(1); paint(); };
  $("#br").onclick = () => { bits.forEach((_, i) => (bits[i] = Math.random() < 0.5 ? 1 : 0)); paint(); };
  paint();
})();

/* ---------- Lab 2: shift machine ---------- */
(() => {
  let num, sh;
  const upd = () => {
    if (!num || !sh) return;
    const n = num.get(), v = sh.get(), b = bin8(n), m = Math.abs(v);
    let after = b, lost = "";
    if (v > 0) { lost = b.slice(0, v); after = b.slice(v) + "0".repeat(v); }
    if (v < 0) { lost = b.slice(8 - m); after = "0".repeat(m) + b.slice(0, 8 - m); }
    const span = (c, cls = "") => `<span class="${cls}">${c}</span>`;
    const before = [...b].map((c, i) => span(c, (v > 0 && i < v) || (v < 0 && i >= 8 - m) ? "lost" : "")).join("");
    const aft = [...after].map((c, i) => span(c, (v > 0 && i >= 8 - v) || (v < 0 && i < m) ? "new" : "")).join("");
    $("#shiftvis").innerHTML = `<p class="note" style="margin:6px 0 0">Before</p><div class="bitrow">${before}</div><p class="note" style="margin:6px 0 0">After</p><div class="bitrow">${aft}</div>`;
    const a = parseInt(after, 2), exp = v >= 0 ? n * 2 ** v : n / 2 ** m;
    $("#q1").textContent = n; $("#q2").textContent = a; $("#q3").textContent = Lib.fmtN(exp, 2);
    const lostOne = lost.includes("1");
    $("#qv").textContent = v === 0 ? "No shift: nothing changes." : v > 0 ? (lostOne ? `A 1 was pushed off the left end, so the answer is wrong. This is an overflow: ${n} × ${2 ** v} would need more than 8 bits.` : `No 1s were lost, so the left shift multiplied exactly: ${n} × ${2 ** v} = ${a}.`) : (lostOne ? `A 1 was pushed off the right end, so the remainder is dropped and precision is lost: ${Lib.fmtN(exp, 2)} became ${a}.` : `No 1s were lost, so the right shift divided exactly: ${n} ÷ ${2 ** m} = ${a}.`);
  };
  num = Lib.slider($("#s1"), { id: "sn", label: "Starting number (denary)", min: 0, max: 255, step: 1, value: 22, fmt: (v) => v + " = " + bin8(v), onInput: upd });
  sh = Lib.slider($("#s2"), { id: "ss", label: "Logical shift", min: -4, max: 4, step: 1, value: 2, fmt: (v) => (v > 0 ? "left by " + v : v < 0 ? "right by " + -v : "none"), onInput: upd });
  upd();
})();

/* ---------- Lab 3: hex colour mixer ---------- */
(() => {
  const val = { r: 30, g: 144, b: 255 }, S = {};
  const upd = () => {
    const h = ["r", "g", "b"].map((k) => hex2(val[k]));
    $("#sw").style.background = `rgb(${val.r},${val.g},${val.b})`;
    $("#cc").textContent = "#" + h.join("");
    $("#ctab").innerHTML = `<tr><th>Channel</th><th>Denary</th><th>Hex</th><th>Binary</th></tr>` + ["r", "g", "b"].map((k, i) => `<tr><td>${{ r: "Red", g: "Green", b: "Blue" }[k]}</td><td>${val[k]}</td><td>${h[i]}</td><td style="font-family:var(--mono)">${bin8(val[k]).slice(0, 4)} ${bin8(val[k]).slice(4)}</td></tr>`).join("");
  };
  [["r", "Red"], ["g", "Green"], ["b", "Blue"]].forEach(([k, l]) => { S[k] = Lib.slider($("#c_" + k), { id: "cs" + k, label: l, min: 0, max: 255, step: 1, value: val[k], fmt: (v) => v + " = " + hex2(v), onInput: (v) => { val[k] = v; upd(); } }); });
  upd();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each reason to the right place. Why do computers use binary, and why do humans like hex?", buckets: [{ label: "Why computers use binary" }, { label: "Why humans use hex" }], items: [
  { text: "Transistors have two states: on or off", b: 0 }, { text: "Circuits only need to tell two voltage levels apart", b: 0 }, { text: "Every kind of data can be stored as 1s and 0s", b: 0 }, { text: "Simple, reliable electronics", b: 0 },
  { text: "Shorter than binary", b: 1 }, { text: "Easier to read and remember", b: 1 }, { text: "Fewer copying mistakes", b: 1 }, { text: "Each digit matches one nibble", b: 1 },
], done: "Binary suits the machine, hex suits the person." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Nibble", "4 bits"], ["Byte", "8 bits"], ["Overflow", "A result too large for the bits available"], ["Logical left shift by 1", "Multiplies by 2"], ["Two's complement", "A way to store negative integers"], ["Most significant bit", "The leftmost bit, with the biggest place value"],
] });

Lib.order($("#o1"), { prompt: "Put the steps for writing −45 in 8-bit two's complement in the right order.", items: [
  "Write 45 as 8-bit binary: 00101101", "Flip every bit: 11010010", "Add 1: 11010011", "Check: −128 + 64 + 16 + 2 + 1 = −45",
], done: "Positive, flip, add 1, check." });

Lib.calc($("#c1"), { qs: [
  { q: "Convert the binary number 10110101 to denary.", a: 181, sol: "128 + 32 + 16 + 4 + 1 = 181", hint: "Place values 128 64 32 16 8 4 2 1 above the bits." },
  { q: "Convert the denary number 77 to 8-bit binary.", t: ["01001101"], ph: "8 bits", sol: "77 = 64 + 8 + 4 + 1 → 01001101", hint: "64 fits (13 left), then 8, 4, 1." },
  { q: "Convert the hexadecimal number 3F to denary.", a: 63, sol: "3 × 16 + 15 = 63", hint: "F = 15." },
  { q: "Convert the binary number 11010110 to hexadecimal.", t: ["D6"], ph: "hex", sol: "1101 = D, 0110 = 6 → D6", hint: "Split into two nibbles." },
  { q: "Convert the hexadecimal number A9 to 8-bit binary.", t: ["10101001"], ph: "8 bits", sol: "A = 1010, 9 = 1001 → 10101001", hint: "One nibble per hex digit." },
  { q: "What is the largest denary value that can be stored in 8 bits (no negatives)?", a: 255, sol: "2⁸ − 1 = 255 (all eight bits are 1)." },
  { q: "Add 00101101 and 00011011 (8-bit). Give the answer in binary.", t: ["01001000"], ph: "8 bits", sol: "45 + 27 = 72 = 01001000. Work right to left and carry.", hint: "Rows of carries, right to left." },
  { q: "A register holds 00001101 (13). It is shifted left 3 places. What is the new denary value?", a: 104, sol: "13 × 2³ = 104 → 01101000. No 1s are lost.", hint: "Each left shift doubles." },
  { q: "What denary value is the 8-bit two's complement number 11111010?", a: -6, sol: "Flip: 00000101. Add 1: 00000110 = 6. So −6. (Or −128 + 64 + 32 + 16 + 8 + 2 = −6.)", hint: "Left bit is −128." },
] });

(() => {
  const el = $("#drill"), modes = [["d2b", "denary → 8-bit binary"], ["b2d", "8-bit binary → denary"], ["d2h", "denary → hex"], ["h2d", "hex → denary"], ["b2h", "binary → hex"], ["h2b", "hex → binary"]];
  el.innerHTML = `<label>Practise: <select>${modes.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <div class="qline" aria-live="polite"></div>
    <div class="row"><input type="text" autocomplete="off" autocapitalize="off" aria-label="Your answer"><button class="b pri" data-a="c">Check</button><button class="b" data-a="s">Show answer</button><button class="b" data-a="n">New question</button><span class="fb" aria-live="polite"></span></div>
    <p class="note" data-s></p>`;
  const sel = $("select", el), ql = $(".qline", el), inp = $("input", el), fb = $(".fb", el), st = $("[data-s]", el);
  let ans = "", streak = 0, best = 0, solved = false;
  const nib = (s) => s.slice(0, 4) + " " + s.slice(4);
  function gen() {
    const m = sel.value, n = 1 + Math.floor(Math.random() * 254); solved = false;
    const q = { d2b: [n + " in binary", bin8(n)], b2d: [nib(bin8(n)) + " in denary", String(n)], d2h: [n + " in hex", hex2(n)], h2d: [hex2(n) + " (hex) in denary", String(n)], b2h: [nib(bin8(n)) + " in hex", hex2(n)], h2b: [hex2(n) + " (hex) in 8-bit binary", bin8(n)] }[m];
    ql.textContent = q[0]; ans = q[1]; inp.value = ""; fb.textContent = ""; fb.className = "fb"; inp.focus({ preventScroll: true });
  }
  const check = () => {
    const v = inp.value.replace(/\s/g, "").toUpperCase(), good = v === ans;
    if (!solved) { streak = good ? streak + 1 : 0; best = Math.max(best, streak); }
    if (good) solved = true;
    fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); st.textContent = `Streak ${streak} · best ${best}`;
  };
  $("[data-a=c]", el).onclick = check; inp.addEventListener("keydown", (e) => e.key === "Enter" && (solved ? gen() : check()));
  $("[data-a=n]", el).onclick = gen; sel.onchange = () => { streak = 0; st.textContent = ""; gen(); };
  $("[data-a=s]", el).onclick = () => { streak = 0; solved = true; fb.textContent = "Answer: " + (/^[01]{8}$/.test(ans) ? nib(ans) : ans); fb.className = "fb"; st.textContent = "Streak 0 · best " + best; };
  gen(); inp.blur();
})();

Lib.quiz($("#qz1"), { qs: [
  { q: "Why do computers store all data in binary?", opts: ["Binary is easier for humans to read", "Transistors have two states, on and off", "Binary uses less memory than denary", "Hexadecimal cannot be stored"], a: 1, why: "Digital circuits are built from switches that are on or off, so two digits map directly onto the hardware." },
  { q: "What is the hexadecimal value of binary 11111111?", opts: ["EE", "FF", "FE", "99"], a: 1, why: "1111 is F, so 11111111 is FF (255)." },
  { q: "00000101 is shifted left by 3 places. What is the result in denary?", opts: ["8", "15", "40", "20"], a: 2, why: "Each left shift doubles: 5 × 2³ = 40 (00101000)." },
  { q: "What range of values can 8-bit two's complement store?", opts: ["0 to 255", "−127 to +127", "−128 to +127", "−255 to +255"], a: 2, why: "The left bit is worth −128. All 0s with the rest 1s gives +127, and 10000000 is −128." },
  { q: "When does an overflow error occur?", opts: ["When a result needs more bits than the register can hold", "When a number is negative", "When a hex digit is a letter", "When a shift is to the right"], a: 0, why: "The carry out of the leftmost bit is lost, so the stored value is wrong." },
  { q: "How many bits does one hexadecimal digit represent?", opts: ["2", "4", "8", "16"], a: 1, why: "16 values need 4 bits: 2⁴ = 16. One hex digit equals one nibble." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Bit", "A single binary digit, 0 or 1."], ["Nibble", "A group of 4 bits. One hex digit."], ["Byte", "A group of 8 bits. Holds 0 to 255."],
  ["Denary", "Base 10, the number system humans normally use."], ["Binary", "Base 2. Uses only 0 and 1."], ["Hexadecimal", "Base 16. Digits 0 to 9 and A to F."],
  ["Overflow", "A result too big for the number of bits available, so the extra bit is lost and the answer is wrong."], ["Logical shift", "Moving all bits left or right; empty places fill with 0 and bits shifted off the end are lost."],
  ["Two's complement", "A method of storing negative integers. The left bit has a place value of −128 (in 8 bits)."], ["Most significant bit", "The leftmost bit. It has the largest place value."],
] });
