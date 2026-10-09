const MONO = "font-family:ui-monospace,Menlo,Consolas,monospace;";
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const cnt = (s) => [...s].filter((c) => c === "1").length;
const rbits = (n) => Array.from({ length: n }, () => (Math.random() < 0.5 ? "0" : "1")).join("");
const pbit = (d, par) => ((cnt(d) % 2 === 0) === (par === "even") ? "0" : "1");

/* ---------- svg: a row of bit cells ---------- */
function bitRow(bits, x0, y, o = {}) {
  const w = o.w || 44, gap = o.gap ?? 6, cls = o.cls || {};
  let s = "";
  [...bits].forEach((b, i) => {
    const x = x0 + i * (w + gap);
    s += SV.rect(x, y, w, w, "cell" + (cls[i] ? " cell-" + cls[i] : ""), { rx: 8 }) + SV.text(x + w / 2, y + w / 2 + 7, b, "lbl bd", { "text-anchor": "middle", style: MONO + "font-size:22px" });
    if (o.top && o.top[i]) s += SV.text(x + w / 2, y - 8, o.top[i], "sm bd", { "text-anchor": "middle" });
  });
  return s;
}

/* ---------- 1. parity ---------- */
const D7 = "1101100", SENT = "0" + D7;
function parChart(s) {
  const k = Math.round(s.k), X = 160;
  let o = SV.text(24, 76, "Sender", "lbl bd", { "text-anchor": "start" }) + SV.text(24, 200, "Receiver", "lbl bd", { "text-anchor": "start" });
  const top = { 0: "parity" };
  if (k < 2) {
    o += bitRow("?" + D7, X, 56, { top, cls: k === 1 ? { 1: "cur", 2: "cur", 4: "cur", 5: "cur", 0: "warn" } : {} });
    o += SV.text(X, 130, k === 0 ? "Agreed: EVEN parity (an even number of 1-bits in every byte)" : "Four 1-bits (highlighted). Already even, so the parity bit is 0.", "lbl bd t1", { "text-anchor": "start" });
  } else {
    o += bitRow(SENT, X, 56, { top, cls: { 0: "ok" } });
    o += SV.text(X, 130, "Byte sent: 0 1101100 → four 1-bits (even)", "lbl bd t3", { "text-anchor": "start" });
  }
  if (k >= 3) {
    const rx = k === 5 ? "00101110" : "01100100", fl = k === 5 ? { 1: "no", 6: "no" } : { 4: "no" };
    o += bitRow(rx, X, 180, { cls: fl });
    const n = cnt(rx);
    o += SV.text(X, 250, k === 3 ? "Interference flips one bit on the way (shown in red)." : k === 4 ? `Receiver counts ${n} 1-bits: odd. Even parity was agreed, so an ERROR is flagged.` : `Two bits flipped, but the count is ${n}: even. NO error is flagged, yet the byte is wrong.`, "lbl bd " + (k === 5 ? "t2" : k === 4 ? "t3" : "t4"), { "text-anchor": "start" });
    if (k === 3) o += SV.text(X, 272, "01101100 → 01100100", "sm", { "text-anchor": "start", style: MONO });
  }
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 290, label: "A parity bit catching one error and missing two", base: { k: 0 }, tween: 1, dwell: 4300, draw: parChart, steps: [
  { cap: "Sender and receiver agree to use <b>even parity</b>. The data is 7 bits: 1101100. The first cell is reserved for the <b>parity bit</b>.", s: { k: 0 } },
  { cap: "The sender counts the <b>1-bits</b>: there are four, which is already even. So the parity bit is <b>0</b>.", s: { k: 1 } },
  { cap: "The full byte <b>01101100</b> is sent. It has an even number of 1-bits, as agreed.", s: { k: 2 } },
  { cap: "On the way, interference flips <b>one bit</b>. The receiver gets 01100100.", s: { k: 3 } },
  { cap: "The receiver counts the 1-bits: <b>three</b>. That is odd, but even parity was agreed, so it knows there is an error and asks for the byte again. It cannot tell which bit changed.", s: { k: 4 } },
  { cap: "Now <b>two bits</b> flip. The count of 1-bits is four again, so the receiver sees <b>nothing wrong</b>. This is the weakness of a parity check.", s: { k: 5 } },
] });

/* ---------- 2. parity block ---------- */
const BD = ["1011001", "0110101", "1110000", "0001110"];
const BR = BD.map((d) => pbit(d, "even") + d);
const PB = Array.from({ length: 8 }, (_, c) => (BR.reduce((n, r) => n + +r[c], 0) % 2 ? "1" : "0")).join("");
function blkChart(s) {
  const k = Math.round(s.k), C = 40, G = 4, X0 = 190, Y0 = 36, rows = [...BR, PB];
  let o = "";
  const flip = (r, c) => k >= 1 && r === 2 && c === 5;
  rows.forEach((row, r) => {
    o += SV.text(X0 - 12, Y0 + r * (C + G) + 26, r < 4 ? "Byte " + (r + 1) : "Parity byte", "sm bd", { "text-anchor": "end" });
    [...row].forEach((b, c) => {
      const v = flip(r, c) ? (b === "1" ? "0" : "1") : b, hot = k === 4 && flip(r, c);
      const cls = hot ? "warn" : flip(r, c) ? "no" : k >= 2 && ((k >= 2 && r === 2) || (k >= 3 && c === 5)) ? "cur" : r === 4 ? "sorted" : c === 0 ? "ok" : "";
      o += SV.rect(X0 + c * (C + G), Y0 + r * (C + G), C, C, "cell" + (cls ? " cell-" + cls : ""), { rx: 7 }) + SV.text(X0 + c * (C + G) + C / 2, Y0 + r * (C + G) + 27, v, "lbl bd", { "text-anchor": "middle", style: MONO + "font-size:19px" });
    });
    if (k >= 2) { const rowOnes = [...row].reduce((n, b, c) => n + +(flip(r, c) ? (b === "1" ? 0 : 1) : b), 0), bad = rowOnes % 2 === 1; o += SV.text(X0 + 8 * (C + G) + 10, Y0 + r * (C + G) + 27, bad ? "✗ odd" : "✓", "lbl bd " + (bad ? "t2" : "t3"), { "text-anchor": "start" }); }
  });
  if (k >= 3) for (let c = 0; c < 8; c++) { const n = rows.reduce((t, row, r) => t + +(flip(r, c) ? (row[c] === "1" ? 0 : 1) : row[c]), 0), bad = n % 2 === 1; o += SV.text(X0 + c * (C + G) + C / 2, Y0 + 5 * (C + G) + 18, bad ? "✗" : "✓", "lbl bd " + (bad ? "t2" : "t3"), { "text-anchor": "middle" }); }
  o += SV.text(380, 14, "Even parity in rows and columns", "sm bd", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 300, label: "A parity block locating a single changed bit", base: { k: 0 }, tween: 1, dwell: 4600, draw: blkChart, steps: [
  { cap: "Four bytes are sent, each with its own parity bit in the first column. The last row is the <b>parity byte</b>: the parity bit for each column. All rows and columns have an even number of 1-bits.", s: { k: 0 } },
  { cap: "During transmission, <b>one bit flips</b> (byte 3, bit 6, shown in red).", s: { k: 1 } },
  { cap: "The receiver checks every <b>row</b>. Byte 3 now has five 1-bits: the wrong parity.", s: { k: 2 } },
  { cap: "Then every <b>column</b>. Column 6 has the wrong parity too.", s: { k: 3 } },
  { cap: "The bad row and bad column <b>cross at one bit</b>. That bit must be the error: byte 3 should be 11110000. It can be corrected, or the block re-sent.", s: { k: 4 } },
] });

/* ---------- 3. ARQ and 4. echo (sequence diagrams) ---------- */
function seqBase(title1, title2, h) {
  return SV.rect(60, 20, 150, 40, "f1", { rx: 10 }) + SV.rect(550, 20, 150, 40, "f3", { rx: 10 }) + SV.text(135, 46, title1, "lbl bd", { "text-anchor": "middle" }) + SV.text(625, 46, title2, "lbl bd", { "text-anchor": "middle" }) + SV.line(135, 60, 135, h, "gr") + SV.line(625, 60, 625, h, "gr");
}
function arrow(y, dir, f, label, col, o = {}) {
  if (f <= 0.01) return "";
  const x1 = dir ? 135 : 625, x2 = dir ? 625 : 135, xe = x1 + (x2 - x1) * clamp(f) * (o.stop || 1);
  let s = SV.line(x1, y, xe, y, "", { style: `stroke:${col};stroke-width:3.5` });
  if (f >= 0.99 && !o.stop) s += SV.arrowHead(xe, y, dir ? "r" : "l", "").replace('class=""', `style="fill:${col}"`);
  if (f >= 0.99 && o.stop) s += SV.text(xe + 4, y + 8, "✗", "lbl bd t2", { "text-anchor": "middle", style: "font-size:24px" });
  s += SV.text(380, y - 9, label, "lbl bd", { "text-anchor": "middle", opacity: clamp(f * 2) });
  return s;
}
const gA = "var(--accent)", gB = "var(--bad)", gG = "var(--good)", gW = "var(--warn)";
function arqChart(s) {
  const k = s.k;
  let o = seqBase("Sender", "Receiver", 330);
  o += arrow(92, 1, clamp(k), "Data + error-check code (attempt 1)", gA);
  if (k > 0.9) o += SV.text(660, 112, "✗ error found", "lbl bd t2", { "text-anchor": "start", opacity: clamp((k - 0.9) * 4) });
  o += arrow(140, 0, clamp(k - 1), "Negative acknowledgement", gB);
  o += arrow(190, 1, clamp(k - 2), "Data re-sent (attempt 2) — lost", gA, { stop: 0.55 });
  if (k > 3) { const f = clamp(k - 3); o += SV.rect(40, 200, 190, 36, "f4", { rx: 8, opacity: f }) + SV.text(135, 224, "⏱ Timeout: no reply", "lbl bd t4", { "text-anchor": "middle", opacity: f }); }
  o += arrow(262, 1, clamp(k - 4), "Data re-sent (attempt 3)", gA);
  o += arrow(310, 0, clamp(k - 5), "Positive acknowledgement", gG);
  if (k > 5.9) o += SV.text(380, 340, "Data delivered. The sender stops.", "lbl bd t3", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 350, label: "ARQ with a negative acknowledgement and a timeout", base: { k: 0 }, tween: 900, dwell: 3800, draw: arqChart, steps: [
  { cap: "The sender wants to send data. Each block carries an <b>error-detection code</b>, usually a CRC. The sender waits for an acknowledgement.", s: { k: 0 } },
  { cap: "Data (attempt 1) arrives, but the receiver finds an <b>error</b>.", s: { k: 1 } },
  { cap: "The receiver sends a <b>negative acknowledgement</b> and requests the data again.", s: { k: 2 } },
  { cap: "The sender re-sends. This time the data is <b>lost</b> on the way, so no acknowledgement comes back.", s: { k: 3 } },
  { cap: "The sender waits for the <b>timeout</b>. Nothing arrives, so it re-sends <b>automatically</b>.", s: { k: 4 } },
  { cap: "Attempt 3 arrives intact.", s: { k: 5 } },
  { cap: "The receiver sends a <b>positive acknowledgement</b>. The sender knows the data arrived and stops. (It would also stop after a set maximum number of tries.)", s: { k: 6 } },
] });

function echoChart(s) {
  const k = s.k, bad = s.sc > 0.5;
  let o = seqBase("Sender", "Receiver", 300);
  o += arrow(100, 1, clamp(k), "Data sent: HELLO", gA);
  o += arrow(170, 0, clamp(k - 1), bad ? "Copy sent back: HELL0" : "Copy sent back: HELLO", bad ? gB : gA);
  if (k > 2.5) {
    const f = clamp((k - 2.5) * 2);
    o += SV.rect(50, 200, 170, 80, bad ? "f2" : "f3", { rx: 10, opacity: f }) + SV.text(135, 232, "Sender compares", "lbl bd", { "text-anchor": "middle", opacity: f }) + SV.text(135, 258, bad ? "HELLO ≠ HELL0  ✗" : "HELLO = HELLO  ✓", "lbl bd " + (bad ? "t2" : "t3"), { "text-anchor": "middle", opacity: f, style: MONO });
    if (bad) o += SV.text(260, 226, "Was the error on the way there or on the way back?", "lbl bd t4", { "text-anchor": "start", opacity: f }) + SV.text(260, 250, "The sender cannot tell.", "lbl", { "text-anchor": "start", opacity: f });
    else o += SV.text(260, 238, "No difference: the data was sent without error.", "lbl bd t3", { "text-anchor": "start", opacity: f });
  }
  return o;
}
Lib.stepper($("#stD"), { w: 760, h: 310, label: "An echo check", base: { k: 0, sc: 0 }, tween: 800, dwell: 3800, draw: echoChart, steps: [
  { cap: "In an <b>echo check</b> the receiver sends the data straight back to the sender.", s: { k: 0, sc: 0 } },
  { cap: "The sender transmits <b>HELLO</b> to the receiver.", s: { k: 1, sc: 0 } },
  { cap: "The receiver sends a <b>copy back</b>.", s: { k: 2, sc: 0 } },
  { cap: "The sender <b>compares</b> the copy with the original. They match, so the data was sent correctly.", s: { k: 3, sc: 0 } },
  { cap: "Now suppose the copy comes back different. There was an error somewhere, but the sender <b>cannot tell on which journey</b>. That is why an echo check is not very reliable.", s: { k: 3, sc: 1 } },
] });

/* ---------- Lab 1: parity ---------- */
(() => {
  const S = $("#pS"), R = $("#pR"); let d = "1101100".split(""), flips = new Set(), par = "even";
  const bitBtn = (v, cls, i, lab) => `<button class="bitb ${cls}" data-i="${i}" aria-label="${lab}">${v}</button>`;
  function draw() {
    const data = d.join(""), p = pbit(data, par), sent = p + data;
    S.innerHTML = bitBtn(p, "par", -1, "Parity bit") + d.map((v, i) => bitBtn(v, v === "1" ? "on" : "", i, "Data bit " + (i + 1))).join("");
    const rx = [...sent].map((b, i) => (flips.has(i) ? (b === "1" ? "0" : "1") : b)).join("");
    R.innerHTML = [...rx].map((v, i) => bitBtn(v, flips.has(i) ? "fl" : "", i, "Received bit " + (i + 1))).join("");
    $$("button", R).forEach((b, i) => (b.onclick = () => { flips.has(i) ? flips.delete(i) : flips.add(i); draw(); }));
    $$("button:not(.par)", S).forEach((b) => (b.onclick = () => { d[+b.dataset.i] = d[+b.dataset.i] === "1" ? "0" : "1"; flips.clear(); draw(); }));
    const ns = cnt(sent), nr = cnt(rx), ok = (nr % 2 === 0) === (par === "even");
    $("#pa").textContent = ns; $("#pb").textContent = nr; $("#pc").textContent = flips.size;
    $("#pv").innerHTML = ok ? (flips.size ? `<b>Corrupted, but not detected.</b> ${nr} 1-bits is still ${par}, so the receiver sees no error. An even number of bits changed.` : `${nr} 1-bits is ${par}, as agreed. No error.`) : `<b>Error detected.</b> ${nr} 1-bits is not ${par}. The receiver asks for the byte again, but cannot tell which bit changed.`;
  }
  $$("input[name=par]").forEach((r) => (r.onchange = () => { par = r.value; flips.clear(); draw(); }));
  draw();
})();

/* ---------- Lab 2: parity block ---------- */
(() => {
  const T = $("#blk"), v = $("#bv"), fix = $("#bfix"); let g, orig, fl;
  const mk = () => { const rows = Array.from({ length: 5 }, () => rbits(7)).map((d) => pbit(d, "even") + d); const pb = Array.from({ length: 8 }, (_, c) => (rows.reduce((n, r) => n + +r[c], 0) % 2 ? "1" : "0")).join(""); orig = [...rows, pb]; fl = new Set(); draw(); };
  const val = (r, c) => (fl.has(r + "," + c) ? (orig[r][c] === "1" ? "0" : "1") : orig[r][c]);
  function draw() {
    const rowBad = orig.map((_, r) => [...Array(8).keys()].reduce((n, c) => n + +val(r, c), 0) % 2 === 1), colBad = [...Array(8).keys()].map((c) => orig.reduce((n, _, r) => n + +val(r, c), 0) % 2 === 1);
    const rb = rowBad.flatMap((b, i) => (b ? [i] : [])), cb = colBad.flatMap((b, i) => (b ? [i] : []));
    const single = rb.length === 1 && cb.length === 1 && fl.size === 1;
    T.innerHTML = `<tr><th></th>${["P", 2, 3, 4, 5, 6, 7, 8].map((x) => `<th>${x}</th>`).join("")}<th></th></tr>` +
      orig.map((row, r) => `<tr><th>${r < 5 ? "Byte " + (r + 1) : "Parity"}</th>${[...Array(8).keys()].map((c) => `<td><button class="bitb ${fl.has(r + "," + c) ? "fl" : r === 5 || c === 0 ? "par" : ""} ${single && rb[0] === r && cb[0] === c ? "fix" : ""}" data-r="${r}" data-c="${c}" aria-label="Row ${r + 1} column ${c + 1}">${val(r, c)}</button></td>`).join("")}<td class="mk2 ${rowBad[r] ? "bad" : "ok"}">${rowBad[r] ? "✗" : "✓"}</td></tr>`).join("") +
      `<tr><th></th>${colBad.map((b) => `<td class="mk2 ${b ? "bad" : "ok"}">${b ? "✗" : "✓"}</td>`).join("")}<td></td></tr>`;
    $$("button", T).forEach((b) => (b.onclick = () => { const k = b.dataset.r + "," + b.dataset.c; fl.has(k) ? fl.delete(k) : fl.add(k); draw(); }));
    fix.disabled = !single;
    v.innerHTML = !fl.size ? "All rows and columns have even parity. Click a bit to flip it." : single ? `One bad row (byte ${rb[0] + 1}) and one bad column (${cb[0] === 0 ? "the parity bit" : "bit " + (cb[0] + 1)}) cross at the highlighted bit. That is the error, and it can be corrected.` : !rb.length && !cb.length ? "<b>Corrupted but not detected.</b> The changes cancel out in every row and column, so every parity check passes." : `Errors are detected (${rb.length} bad row${rb.length === 1 ? "" : "s"}, ${cb.length} bad column${cb.length === 1 ? "" : "s"}) but they cannot be pinpointed with certainty. The block would have to be re-sent.`;
  }
  fix.onclick = () => { fl.clear(); draw(); };
  $("#bnew").onclick = mk; mk();
})();

/* ---------- Lab 3: check digits ---------- */
(() => {
  const sel = $("#ckm"), inp = $("#ckd"), tab = $("#ckt"), v = $("#ckv"), ev = $("#cke"); let good = null;
  const dig = (c) => (c === "X" ? 10 : +c);
  const isbnCheck = (d12) => { const o = [...d12].reduce((n, c, i) => n + (i % 2 === 0 ? +c : 0), 0), e = [...d12].reduce((n, c, i) => n + (i % 2 ? +c : 0), 0) * 3, t = o + e, r = t % 10; return { o, e, t, r, cd: r === 0 ? 0 : 10 - r }; };
  const m11Check = (d) => { const n = d.length, t = [...d].reduce((s, c, i) => s + +c * (n + 1 - i), 0), r = t % 11, c = 11 - r; return { t, r, cd: c === 11 ? "0" : c === 10 ? "X" : String(c) }; };
  const valid = (full, m) => m === "isbn" ? full.length === 13 && [...full].reduce((n, c, i) => n + +c * (i % 2 ? 3 : 1), 0) % 10 === 0 : full.length >= 2 && [...full].reduce((n, c, i) => n + dig(c) * (full.length - i), 0) % 11 === 0;
  function draw() {
    const m = sel.value, d = inp.value.replace(/[^0-9]/g, ""); good = null; ev.textContent = "";
    inp.maxLength = m === "isbn" ? 14 : 12;
    if (m === "isbn") {
      if (d.length !== 12) { tab.innerHTML = ""; v.textContent = `Type exactly 12 digits (you have ${d.length}).`; return; }
      const r = isbnCheck(d);
      tab.innerHTML = `<tr><th>Digit</th>${[...d].map((c) => `<td>${c}</td>`).join("")}</tr><tr><th>Position</th>${[...d].map((_, i) => `<td>${i + 1}</td>`).join("")}</tr><tr><th>Multiply by</th>${[...d].map((_, i) => `<td>${i % 2 ? "3" : "1"}</td>`).join("")}</tr><tr><th>Result</th>${[...d].map((c, i) => `<td>${+c * (i % 2 ? 3 : 1)}</td>`).join("")}</tr>`;
      v.innerHTML = `Odd positions: ${r.o}. Even positions × 3: ${r.e / 3} × 3 = ${r.e}. Total ${r.o} + ${r.e} = ${r.t}; ${r.t} ÷ 10 leaves ${r.r}. ${r.r === 0 ? "Remainder 0, so the check digit is 0." : `10 − ${r.r} = <b>${r.cd}</b>.`} Full number: <b>${d}${r.cd}</b>`;
      good = d + r.cd;
    } else {
      if (d.length < 3 || d.length > 11) { tab.innerHTML = ""; v.textContent = "Type between 3 and 11 digits."; return; }
      const r = m11Check(d), n = d.length;
      tab.innerHTML = `<tr><th>Digit</th>${[...d].map((c) => `<td>${c}</td>`).join("")}</tr><tr><th>Weighting</th>${[...d].map((_, i) => `<td>${n + 1 - i}</td>`).join("")}</tr><tr><th>Result</th>${[...d].map((c, i) => `<td>${+c * (n + 1 - i)}</td>`).join("")}</tr>`;
      v.innerHTML = `Total ${[...d].map((c, i) => +c * (n + 1 - i)).join(" + ")} = ${r.t}. ${r.t} ÷ 11 leaves ${r.r}. ${r.r === 0 ? "Remainder 0, so the check digit is 0." : `11 − ${r.r} = ${11 - r.r}${11 - r.r === 10 ? ", written as <b>X</b>" : ""}. Check digit: <b>${r.cd}</b>.`} Full number: <b>${d}${r.cd}</b>`;
      good = d + r.cd;
    }
  }
  function err(kind) {
    if (!good) { ev.textContent = "Enter a valid set of digits first."; return; }
    const m = sel.value; let s = good, desc = "";
    const digits = (n) => "0123456789".split("").filter((x) => x !== n);
    if (kind === "rst") { ev.textContent = ""; return; }
    if (kind === "chg") { const i = Math.floor(Math.random() * (s.length - 1)), n = pick(digits(s[i])); desc = `Changed digit ${i + 1} from ${s[i]} to ${n}`; s = s.slice(0, i) + n + s.slice(i + 1); }
    if (kind === "swp") { const idx = [...Array(s.length - 1).keys()].filter((i) => s[i] !== s[i + 1]); if (!idx.length) { ev.textContent = "All digits are the same, nothing to swap."; return; } const i = pick(idx); desc = `Swapped digits ${i + 1} and ${i + 2} (${s[i]}${s[i + 1]} → ${s[i + 1]}${s[i]})`; s = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2); }
    if (kind === "drp") { const i = Math.floor(Math.random() * s.length); desc = `Dropped digit ${i + 1}`; s = s.slice(0, i) + s.slice(i + 1); }
    if (kind === "add") { const i = Math.floor(Math.random() * s.length), n = pick(digits("")); desc = `Added an extra ${n} at position ${i + 1}`; s = s.slice(0, i) + n + s.slice(i); }
    const ok = valid(s, m);
    ev.innerHTML = `${desc}. Typed in: <b style="font-family:var(--mono)">${s}</b>. ` + (ok ? `<span class="flag">Check passes. The mistake was missed.</span> Check digits catch most errors, not every one.` : `<span class="okf">Check fails. The mistake is detected.</span>`);
  }
  sel.onchange = () => { inp.value = sel.value === "isbn" ? "978034098382" : "4156710"; draw(); };
  inp.addEventListener("input", draw);
  $$("[data-e]").forEach((b) => (b.onclick = () => err(b.dataset.e)));
  draw();
})();

/* ---------- Lab 4: ARQ simulator ---------- */
(() => {
  const tab = $("#atab"); let ps, rs;
  function run() {
    const p = ps.get() / 100, max = rs.get(); let del = 0, giv = 0, tot = 0, rows = "";
    for (let i = 1; i <= 10; i++) {
      let a = 0, ok = false, trail = "";
      while (a <= max) { a++; tot++; const bad = Math.random() < p; trail += bad ? "✗ " : "✓ "; if (!bad) { ok = true; break; } }
      ok ? del++ : giv++;
      rows += `<tr><td>${i}</td><td>${trail}</td><td>${a}</td><td>${ok ? '<span class="okf">delivered</span>' : '<span class="flag">gave up</span>'}</td></tr>`;
    }
    tab.innerHTML = `<tr><th>Packet</th><th>Attempts (✗ error or loss, ✓ acknowledged)</th><th>Sent</th><th>Result</th></tr>` + rows;
    $("#ad").textContent = del; $("#ag").textContent = giv; $("#at").textContent = tot;
    $("#av").textContent = p === 0 ? "No errors, so every packet is delivered first time: 10 transmissions." : giv ? `With a ${Math.round(p * 100)}% chance of error and at most ${max} re-send${max === 1 ? "" : "s"}, ${giv} packet${giv > 1 ? "s were" : " was"} abandoned. More re-sends would deliver more, at the cost of more waiting.` : `All 10 packets were delivered, using ${tot} transmissions. Each extra transmission is a re-send triggered by a negative acknowledgement or a timeout.`;
  }
  ps = Lib.slider($("#a1"), { id: "ap", label: "Chance each attempt goes wrong", min: 0, max: 90, step: 5, value: 30, fmt: (x) => x + "%" });
  rs = Lib.slider($("#a2"), { id: "ar", label: "Maximum re-sends", min: 0, max: 8, value: 3 });
  $("#arun").onclick = run; run();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each description to the error-detection method it describes.", buckets: [{ label: "Parity check" }, { label: "Checksum" }, { label: "Echo check" }, { label: "ARQ" }], items: [
  { text: "An extra bit added to each byte", b: 0 }, { text: "Counts the 1-bits", b: 0 }, { text: "Cannot tell which bit is wrong", b: 0 },
  { text: "A value calculated from a block of data", b: 1 }, { text: "Sent after the block and recalculated by the receiver", b: 1 }, { text: "Uses an agreed algorithm", b: 1 },
  { text: "The receiver sends the data back", b: 2 }, { text: "The sender compares the two copies", b: 2 },
  { text: "Positive and negative acknowledgements", b: 3 }, { text: "Uses a timeout before re-sending", b: 3 },
], done: "Four methods, four different ideas." });

Lib.classify($("#cl2"), { prompt: "Does each item check data transmission or data entry?", buckets: [{ label: "Transmission check" }, { label: "Data entry check" }], items: [
  { text: "Parity check", b: 0 }, { text: "Checksum", b: 0 }, { text: "Echo check", b: 0 }, { text: "ARQ", b: 0 }, { text: "Parity block", b: 0 },
  { text: "Check digit", b: 1 }, { text: "ISBN-13 last digit", b: 1 }, { text: "Modulo-11 final digit", b: 1 }, { text: "A mis-scanned barcode is caught", b: 1 },
], done: "Check digits are for typing and scanning; the rest are for transmission." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Parity bit", "An extra bit that makes the number of 1-bits in a byte even or odd"], ["Parity byte", "A byte of column parity bits sent at the end of a block"], ["Checksum", "A value calculated from a block of data and sent after it"],
  ["Echo check", "Data is sent back to the sender to be compared with the original"], ["Check digit", "The final digit of a code, calculated from the other digits"], ["Timeout", "The time a sender waits for an acknowledgement before re-sending"], ["Negative acknowledgement", "A message saying the data had an error and should be re-sent"],
] });

Lib.order($("#o1"), { prompt: "Put the steps of an ARQ in order (the first transmission has an error).", items: [
  "The sender transmits data with an error-detection code and starts waiting", "The receiver checks the data and finds an error", "The receiver sends a negative acknowledgement", "The sender re-sends the data", "The receiver finds no error and sends a positive acknowledgement",
], done: "Send, check, negative acknowledgement, re-send, positive acknowledgement." });

Lib.calc($("#c1"), { qs: [
  { q: "Even parity. The 7 data bits are 1011010. What is the parity bit?", a: 0, sol: "1011010 has four 1-bits (even), so the parity bit is 0.", hint: "Count the 1-bits." },
  { q: "Odd parity. The 7 data bits are 0111001. What is the parity bit?", a: 1, sol: "0111001 has four 1-bits (even). Odd parity needs an odd total, so the parity bit is 1.", hint: "Four is even, but we want odd." },
  { q: "How many 1-bits are in the received byte 01101101?", a: 5, sol: "0+1+1+0+1+1+0+1 = 5. If even parity was agreed, this is an error.", hint: "Add the 1s." },
  { q: "ISBN-13: find the check digit for 978151045759.", a: 1, sol: "Odd positions: 9+8+5+0+5+5 = 32. Even: 3 × (7+1+1+4+7+9) = 3 × 29 = 87. 32 + 87 = 119. 119 ÷ 10 leaves 9. 10 − 9 = 1.", hint: "Odd positions plain, even positions × 3." },
  { q: "ISBN-13: find the check digit for 978030640615.", a: 7, sol: "Odd: 9+8+3+6+0+1 = 27. Even: 3 × (7+0+0+4+6+5) = 3 × 22 = 66. 27 + 66 = 93. 93 ÷ 10 leaves 3. 10 − 3 = 7." },
  { q: "Modulo-11: the weighted total for 4 1 5 6 7 1 0 (weights 8 to 2) is 130. What is the remainder when 130 is divided by 11?", a: 9, sol: "11 × 11 = 121. 130 − 121 = 9." },
  { q: "Modulo-11: find the check digit for 3 2 5 1 6 4 8 (weights 8, 7, 6, 5, 4, 3, 2).", a: 7, sol: "24 + 14 + 30 + 5 + 24 + 12 + 16 = 125. 125 ÷ 11 = 11 remainder 4. 11 − 4 = 7.", hint: "Multiply each digit by its weight first." },
  { q: "Check the 8-digit number 4 1 5 6 7 1 0 2 with weights 8, 7, 6, 5, 4, 3, 2, 1. What is the total?", a: 132, sol: "32 + 7 + 30 + 30 + 28 + 3 + 0 + 2 = 132. 132 ÷ 11 = 12 remainder 0, so the number is correct." },
] });

(() => {
  const el = $("#drill");
  el.innerHTML = `<label>Practise: <select data-m><option value="bit">Find the parity bit</option><option value="err">Spot the error</option></select></label>
    <div class="qline" aria-live="polite"></div>
    <div class="row"><select data-s class="sel" aria-label="Answer"></select><button class="b pri" data-a="c">Check</button><button class="b" data-a="n">New question</button><span class="fb" aria-live="polite"></span></div><p class="note" data-st></p><p class="note" data-w></p>`;
  const ql = $(".qline", el), md = $("[data-m]", el), sl = $("[data-s]", el), fb = $(".fb", el), st = $("[data-st]", el), wk = $("[data-w]", el);
  let ans = "", work = "", streak = 0, best = 0, solved = false;
  function gen() {
    const par = pick(["even", "odd"]); solved = false;
    if (md.value === "bit") {
      const d = rbits(7), p = pbit(d, par); ans = p; ql.textContent = `${par.toUpperCase()} parity. Data bits: ${d}. Parity bit?`;
      sl.innerHTML = `<option value="">Choose…</option><option>0</option><option>1</option>`; work = `${d} has ${cnt(d)} 1-bits. For ${par} parity the parity bit is ${p}.`;
    } else {
      const b = rbits(8), n = cnt(b), good = (n % 2 === 0) === (par === "even"); ans = good ? "No error" : "Error"; ql.textContent = `${par.toUpperCase()} parity agreed. Received byte: ${b}. Is there an error?`;
      sl.innerHTML = `<option value="">Choose…</option><option>Error</option><option>No error</option>`; work = `${b} has ${n} 1-bits, which is ${n % 2 ? "odd" : "even"}. ${par[0].toUpperCase() + par.slice(1)} parity was agreed, so ${good ? "no error is flagged" : "an error is flagged"}.`;
    }
    fb.textContent = ""; fb.className = "fb"; wk.textContent = "";
  }
  $("[data-a=c]", el).onclick = () => {
    const good = sl.value === ans; if (!solved) { streak = good ? streak + 1 : 0; best = Math.max(best, streak); } if (good) solved = true;
    fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); st.textContent = `Streak ${streak} · best ${best}`; wk.textContent = good ? "" : "";
    if (good) wk.textContent = "Working: " + work;
  };
  $("[data-a=n]", el).onclick = gen; md.onchange = () => { streak = 0; st.textContent = ""; gen(); }; gen();
})();

Lib.quiz($("#qz1"), { qs: [
  { q: "Even parity is used. Which byte is received with an error?", opts: ["01100110", "10110110", "11011010", "10100000"], a: 1, why: "10110110 has five 1-bits (odd). The others have four, four and two." },
  { q: "Which method uses a timeout and acknowledgements?", opts: ["Echo check", "Parity check", "Checksum", "ARQ"], a: 3, why: "ARQ: positive and negative acknowledgements, and a timeout before re-sending." },
  { q: "What is the main weakness of an echo check?", opts: ["It cannot be used on bytes", "If the data differs, you cannot tell which journey had the error", "It needs a check digit", "It only works on text"], a: 1, why: "The copy could have been corrupted on the way there or on the way back." },
  { q: "Which of these is a data entry check, not a transmission check?", opts: ["Checksum", "Parity bit", "Check digit", "Echo check"], a: 2, why: "Check digits catch typing and scanning errors." },
  { q: "A parity block finds the position of an error using…", opts: ["the sequence number", "the bad row and the bad column", "the packet size", "the timeout"], a: 1, why: "The bad bit is where the wrong row and wrong column cross." },
  { q: "Why might a parity check fail to detect an error?", opts: ["Two bits changed, so the parity is unchanged", "The parity bit is missing", "Parity only works on text", "The receiver cannot count"], a: 0, why: "An even number of flips keeps the same parity." },
  { q: "In a checksum check, who calculates the checksum?", opts: ["Only the sender", "Only the receiver", "Both the sender and the receiver", "Neither, it is built into the cable"], a: 2, why: "The sender calculates and sends it; the receiver recalculates and compares." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Parity check", "A method of checking data using the number of 1-bits in a byte, which must be even (even parity) or odd (odd parity)."], ["Parity bit", "A bit added to a byte, in the most significant position, so the byte has the agreed parity."],
  ["Parity block", "A horizontal and vertical parity check on a block of bytes, which can locate a single error."], ["Parity byte", "An extra byte at the end of a block made of the parity bits from the vertical check."],
  ["Checksum", "A value calculated from a block of data and sent after it. The receiver recalculates it and compares."], ["Echo check", "The receiver sends the data back and the sender compares it with the original."],
  ["Check digit", "The final digit of a code, calculated from the other digits, used to detect data entry errors."], ["Automatic repeat request (ARQ)", "A method that uses acknowledgements and a timeout to re-send data automatically if it is not received correctly."],
  ["Acknowledgement", "A message sent back to say whether data was received correctly (positive) or with errors (negative)."], ["Timeout", "The time a sender waits for an acknowledgement before re-sending."],
  ["Cyclic redundancy check (CRC)", "An error check in which the 1-bits in a packet's payload are totalled and stored in the trailer, then recalculated on arrival."],
] });
