const MONO = "font-family:ui-monospace,Menlo,Consolas,monospace;";
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const bin8 = (n) => n.toString(2).padStart(8, "0");
const bigTxt = (x, y, t, cls, px = 28, extra) => SV.text(x, y, t, "lbl bd " + (cls || ""), { "text-anchor": "middle", style: MONO + "font-size:" + px + "px", ...extra });
const fmtInt = (n) => Math.round(n).toLocaleString("en-GB");

/* ---------- 1. text to binary ---------- */
const CH = [["H", 72], ["i", 105], ["!", 33]];
function textChart(s) {
  const X = (i) => 230 + i * 190, rows = [["Character", 70], ["ASCII code", 150], ["8-bit binary", 225]];
  let o = "";
  rows.forEach(([lab, y], r) => {
    const op = clamp01(s.k - r + 1);
    if (op <= 0.01) return;
    o += SV.text(24, y + 6, lab, "sm bd", { "text-anchor": "start", opacity: op, style: "font-size:14px" });
    CH.forEach(([c, n], i) => {
      o += SV.rect(X(i) - 80, y - 36, 160, 56, "f1", { rx: 10, opacity: op });
      o += bigTxt(X(i), y + 5, r === 0 ? c : r === 1 ? n : bin8(n), r === 0 ? "t1" : r === 1 ? "t4" : "t3", r === 2 ? 22 : 34, { opacity: op });
    });
  });
  const op3 = clamp01(s.k - 2);
  if (op3 > 0.01) {
    o += SV.text(380, 285, "01001000 01101001 00100001", "lbl bd t3", { "text-anchor": "middle", opacity: op3, style: MONO + "font-size:20px" });
    o += SV.text(380, 308, "3 characters × 8 bits = 24 bits stored", "sm bd", { "text-anchor": "middle", opacity: op3, style: "font-size:14px" });
  }
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 320, label: "Typing Hi! and storing it as binary", base: { k: 0 }, tween: 700, dwell: 4200, draw: textChart, steps: [
  { cap: "You type <b>Hi!</b> on the keyboard. The computer sees three characters.", s: { k: 0 } },
  { cap: "Each character has a unique code in the <b>character set</b>. In ASCII, H = 72, i = 105 and ! = 33.", s: { k: 1 } },
  { cap: "Each code is converted into <b>binary</b>. In extended ASCII every character uses 8 bits.", s: { k: 2 } },
  { cap: "The three binary codes are stored one after the other: <b>24 bits</b>. With 32-bit Unicode the same text would take 96 bits.", s: { k: 3 } },
] });

/* ---------- 2. sampling ---------- */
const wf = (t) => 0.62 * Math.sin(2 * Math.PI * 2 * t) + 0.28 * Math.sin(2 * Math.PI * 5 * t + 1);
const quant = (v, L) => { L = Math.max(2, Math.round(L)); return (Math.round(((v + 1) / 2) * (L - 1)) / (L - 1)) * 2 - 1; };
function waveSvg(x0, x1, yc, amp, n, L, opts = {}) {
  const X = (t) => x0 + t * (x1 - x0), Y = (v) => yc - v * amp;
  let o = "";
  if (opts.axis !== false) o += SV.line(x0, yc, x1, yc, "gr");
  if (L <= 16 && opts.levels !== false) for (let i = 0; i < L; i++) { const v = (i / (L - 1)) * 2 - 1; o += SV.line(x0, Y(v), x1, Y(v), "gr", { opacity: 0.8 }); }
  const pts = []; for (let i = 0; i <= 240; i++) pts.push([X(i / 240), Y(wf(i / 240))]);
  o += SV.path(ptsPath(pts), "c1", { opacity: 0.55 });
  if (n > 0) {
    let d = "";
    for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 1) / n, y = Y(quant(wf(t0), L)); d += (i ? "L" : "M") + X(t0).toFixed(1) + " " + y.toFixed(1) + "L" + X(t1).toFixed(1) + " " + y.toFixed(1); if (i < n - 1) d += "L" + X(t1).toFixed(1) + " " + Y(quant(wf(t1), L)).toFixed(1); }
    o += SV.path(d, "c3");
    for (let i = 0; i < n; i++) { const t = i / n, y = Y(quant(wf(t), L)); o += SV.line(X(t), yc, X(t), y, "gr", { opacity: 0.9 }) + SV.circle(X(t), y, n > 40 ? 2.5 : 4.5, "dot3"); }
  }
  return o;
}
function sampChart(s) {
  const n = Math.round(s.n), L = Math.round(s.lv);
  let o = waveSvg(30, 730, 175, 120, n, L);
  o += SV.text(30, 22, n === 0 ? "Analogue sound wave (continuous)" : `${n} samples · ${Math.log2(L).toFixed(0)} bits per sample (${L} levels)`, "lbl bd", { "text-anchor": "start" });
  o += SV.text(730, 318, "time →", "sm", { "text-anchor": "end" });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 330, label: "A sound wave being sampled", base: { n: 0, lv: 64 }, tween: 900, dwell: 4500, draw: sampChart, steps: [
  { cap: "A real sound is an <b>analogue</b> wave: a smooth curve with infinitely many possible values.", s: { n: 0, lv: 64 } },
  { cap: "The computer measures the height of the wave at <b>regular intervals</b>. These are <b>samples</b>. Here there are only 10, so the stored wave (green) misses a lot of detail.", s: { n: 10, lv: 64 } },
  { cap: "A <b>higher sample rate</b> takes more samples each second. With 40 samples the green steps follow the original much more closely, but there is more data to store.", s: { n: 40, lv: 64 } },
  { cap: "Each sample must be stored in a fixed number of bits (the <b>sample resolution</b>). With only 2 bits there are just <b>4 levels</b>, so each sample is rounded a long way.", s: { n: 40, lv: 4 } },
  { cap: "With 4 bits there are <b>16 levels</b>. Each sample can sit closer to the true height. More bits per sample means more accuracy and a bigger file.", s: { n: 40, lv: 16 } },
] });

/* ---------- 3. pixels and colour depth ---------- */
const HEART = ["00000000", "03300330", "32133113", "31111113", "03111130", "00311300", "00033000", "00000000"].map((r) => [...r].map(Number));
const PAL2 = ["#ffffff", "#d64550", "#f4a6b0", "#5a1a22"], CODE2 = ["00", "01", "10", "11"];
function imgChart(s) {
  const m = Math.round(s.m), C = 34, X0 = 40, Y0 = 24;
  let o = "";
  HEART.forEach((row, y) => row.forEach((v, x) => {
    const px = X0 + x * C, py = Y0 + y * C;
    let fill = "#ffffff", txt = "", tc = "#111";
    if (m === 1) { const b = v > 0 ? 1 : 0; fill = b ? "#111111" : "#ffffff"; txt = b; tc = b ? "#fff" : "#111"; }
    if (m >= 2) { fill = PAL2[v]; txt = m === 2 ? CODE2[v] : ""; tc = v === 3 || v === 1 ? "#fff" : "#111"; }
    o += `<rect x="${px}" y="${py}" width="${C}" height="${C}" fill="${fill}" stroke="#9aa8b2" stroke-width="1"/>`;
    if (txt !== "") o += SV.text(px + C / 2, py + C / 2 + 5, txt, "lbl bd", { "text-anchor": "middle", style: MONO + `fill:${tc};font-size:${m === 2 ? 12 : 15}px` });
  }));
  const T = (y, t, cls = "lbl", px = 16) => SV.text(350, y, t, cls, { "text-anchor": "start", style: "font-size:" + px + "px" });
  if (m === 0) o += T(60, "The picture is split into a grid of pixels.", "lbl bd") + T(92, "This one is 8 pixels wide and 8 high:") + T(116, "8 × 8 = 64 pixels. That is its resolution.", "lbl bd t1");
  if (m === 1) o += T(60, "1 bit per pixel: only two colours.", "lbl bd") + T(92, "0 = white, 1 = black") + T(122, "64 pixels × 1 bit = 64 bits", "lbl bd t1") + T(152, "Colour depth = 1 bit → 2¹ = 2 colours", "lbl bd t3");
  if (m === 2) o += T(60, "2 bits per pixel: four colours.", "lbl bd") + T(92, "00 = white   01 = red") + T(116, "10 = pink    11 = dark red") + T(146, "64 pixels × 2 bits = 128 bits", "lbl bd t1") + T(176, "Colour depth = 2 bits → 2² = 4 colours", "lbl bd t3");
  if (m === 3) {
    o += SV.rect(350, 36, 360, 96, "f1", { rx: 10 }) + T(60, "Metadata (file header)", "lbl bd t4") + T(84, "width = 8, height = 8", "lbl", 15) + T(106, "colour depth = 2 bits", "lbl", 15);
    o += T(160, "Pixel data: 00 00 00 00 00 00 00 00 00 11 …", "sm", 12.5) + T(196, "128 bits ÷ 8 = 16 bytes of pixel data", "lbl bd t3", 16) + T(224, "(metadata makes the real file a little bigger)", "sm", 13);
  }
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 330, label: "A small image stored as pixels", base: { m: 0 }, tween: 500, dwell: 4500, draw: imgChart, steps: [
  { cap: "A bitmap image is a grid of tiny squares called <b>pixels</b>. The number of pixels is the <b>resolution</b>.", s: { m: 0 } },
  { cap: "Each pixel stores a binary value for its colour. With <b>1 bit per pixel</b> there are only two colours, so the heart is black and white.", s: { m: 1 } },
  { cap: "With a <b>colour depth of 2 bits</b> each pixel has 4 possible values, so we get 4 colours and some shading.", s: { m: 2 } },
  { cap: "The file stores <b>metadata</b> (width, height, colour depth) and then the pixel values in order. File size = 8 × 8 × 2 = 128 bits.", s: { m: 3 } },
] });

/* ---------- Lab 1: text encoder ---------- */
(() => {
  const inp = $("#txt"), tab = $("#ttab");
  const grp = (n) => n.toString(2).padStart(32, "0").match(/.{8}/g).join(" ");
  const upd = () => {
    const chars = Array.from(inp.value), codes = chars.map((c) => c.codePointAt(0));
    const inA = codes.every((c) => c < 128), inE = codes.every((c) => c < 256), bad = chars.filter((c, i) => codes[i] > 127);
    tab.innerHTML = `<tr><th>Char</th><th>Code</th><th>Binary</th><th>In ASCII?</th></tr>` + chars.map((c, i) => `<tr><td style="font-size:1.2rem">${c === " " ? "␣" : esc(c)}</td><td>${codes[i]}</td><td style="font-family:var(--mono);font-size:.82rem">${codes[i] < 256 ? bin8(codes[i]) : grp(codes[i])}</td><td>${codes[i] < 128 ? "Yes" : codes[i] < 256 ? '<span class="flag">extended only</span>' : '<span class="flag">Unicode only</span>'}</td></tr>`).join("");
    const n = chars.length;
    $("#tz1").textContent = inA ? n * 7 + " bits" : "can't store";
    $("#tz2").textContent = inE ? n * 8 + " bits" : "can't store";
    $("#tz3").textContent = n * 32 + " bits";
    $("#tv").textContent = !n ? "Type something above." : inA ? "Every character is in standard ASCII, so 7 bits each is enough. Unicode would use more bits for the same text." : `${bad.map((c) => "“" + c + "”").join(" ")} ${bad.length > 1 ? "are" : "is"} outside standard ASCII. ${inE ? "Extended ASCII (8 bits) can hold it." : "Only Unicode has a code for it."}`;
  };
  inp.addEventListener("input", upd); upd();
})();

/* ---------- Lab 2: sampling lab ---------- */
(() => {
  let sn, sr;
  const upd = () => {
    if (!sn || !sr) return;
    const n = sn.get(), b = sr.get(), L = 2 ** b;
    $("#wave").innerHTML = waveSvg(24, 540, 160, 125, n, L);
    $("#wa").textContent = n; $("#wb").textContent = L; $("#wc").textContent = n * b;
    let err = 0; for (let i = 0; i < 400; i++) { const t = i / 400, k = Math.min(n - 1, Math.floor(t * n)); err += Math.abs(wf(t) - quant(wf(k / n), L)); }
    const e = (err / 400 / 2) * 100;
    $("#wv").textContent = `Average gap from the real wave: about ${e.toFixed(1)}% of the full height. ` + (e < 3 ? "A very close copy, but note the number of bits in the file." : n < 10 ? "Too few samples: the steps miss the shape." : b < 3 ? "Too few bits per sample: the steps are rounded too far." : "A fair copy. Push either slider to see the trade-off with size.");
  };
  sn = Lib.slider($("#w1"), { id: "wn", label: "Sample rate (samples in this snippet)", min: 4, max: 80, step: 1, value: 12, fmt: (v) => v, onInput: upd });
  sr = Lib.slider($("#w2"), { id: "wr", label: "Sample resolution (bits per sample)", min: 1, max: 6, step: 1, value: 3, fmt: (v) => v + (v === 1 ? " bit" : " bits"), onInput: upd });
  upd();
})();

/* ---------- Lab 3: sound size calculator ---------- */
(() => {
  const RATES = [8000, 11025, 22050, 44100, 48000, 96000], RES = [8, 16, 24];
  let a, b, c;
  const upd = () => {
    if (!a || !b || !c) return;
    const r = RATES[a.get()], d = RES[b.get()], t = c.get(), bits = r * d * t, bytes = bits / 8;
    $("#ka").textContent = fmtInt(bits); $("#kb").textContent = fmtInt(bytes); $("#kc").textContent = Lib.fmtN(bytes / 1e6, 2) + " MB";
    $("#kv").innerHTML = `${fmtInt(r)} × ${d} × ${t} = ${fmtInt(bits)} bits, and ÷ 8 = ${fmtInt(bytes)} bytes.`;
  };
  a = Lib.slider($("#k1"), { id: "ka1", label: "Sample rate", min: 0, max: 5, step: 1, value: 3, fmt: (i) => fmtInt(RATES[i]) + " Hz", onInput: upd });
  b = Lib.slider($("#k2"), { id: "kb1", label: "Sample resolution", min: 0, max: 2, step: 1, value: 1, fmt: (i) => RES[i] + " bits", onInput: upd });
  c = Lib.slider($("#k3"), { id: "kc1", label: "Length", min: 1, max: 300, step: 1, value: 10, fmt: (v) => v + " s", onInput: upd });
  upd();
})();

/* ---------- Lab 4: resolution and colour depth ---------- */
(() => {
  const RES = [4, 8, 16, 32, 64], cv = $("#cv"), ctx = cv.getContext("2d");
  const STOPS = [[11, 29, 81], [106, 44, 145], [255, 122, 47], [255, 230, 109]];
  const ramp = (t) => { const p = t * (STOPS.length - 1), i = Math.min(STOPS.length - 2, Math.floor(p)), f = p - i; return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f)); };
  const val = (u, v) => {
    if (v < 0.65) { const dx = u - 0.5, dy = v - 0.55, dist = Math.hypot(dx, dy); return dist < 0.17 ? 1 : Math.min(0.95, 0.04 + 0.55 * (v / 0.65) + 0.35 * Math.exp(-(dist * dist) / 0.04)); }
    const refl = Math.exp(-(((u - 0.5) / 0.14) ** 2)) * (1 - ((v - 0.65) / 0.35) * 0.6);
    return 0.1 + 0.55 * refl + 0.08 * Math.sin(v * 40) * refl;
  };
  let ri, di;
  const upd = () => {
    if (!ri || !di) return;
    const r = RES[ri.get()], d = di.get(), L = 2 ** d, cell = 64 / r;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const u = (Math.floor(x / cell) + 0.5) / r, v = (Math.floor(y / cell) + 0.5) / r;
      const t = L === 1 ? 0 : Math.round(Math.max(0, Math.min(1, val(u, v))) * (L - 1)) / (L - 1);
      const [R, G, B] = ramp(t); ctx.fillStyle = `rgb(${R},${G},${B})`; ctx.fillRect(x, y, 1, 1);
    }
    const bits = r * r * d, bytes = bits / 8;
    $("#ia").textContent = fmtInt(r * r); $("#ib").textContent = fmtInt(L); $("#ic").textContent = bytes >= 1024 ? Lib.fmtN(bytes / 1024, 1) + " KiB" : fmtInt(bytes) + " B";
    $("#iv").textContent = `${r} × ${r} × ${d} = ${fmtInt(bits)} bits (${fmtInt(bytes)} bytes). ` + (r <= 8 ? "Low resolution: you can see the individual pixels." : d <= 2 ? "Low colour depth: the smooth sky has turned into bands." : "Plenty of detail, at the cost of a larger file.");
  };
  ri = Lib.slider($("#i1"), { id: "ir", label: "Resolution", min: 0, max: 4, step: 1, value: 3, fmt: (i) => RES[i] + " × " + RES[i], onInput: upd });
  di = Lib.slider($("#i2"), { id: "id", label: "Colour depth", min: 1, max: 8, step: 1, value: 5, fmt: (v) => v + (v === 1 ? " bit" : " bits"), onInput: upd });
  upd();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each statement to the character set it describes.", buckets: [{ label: "ASCII" }, { label: "Unicode" }], items: [
  { text: "7 bits per character (standard)", b: 0 }, { text: "128 characters", b: 0 }, { text: "English letters, digits and punctuation", b: 0 }, { text: "Smaller files for plain English text", b: 0 },
  { text: "Up to 32 bits per character", b: 1 }, { text: "Over 140,000 characters", b: 1 }, { text: "Covers Chinese, Arabic, Hindi and emoji", b: 1 }, { text: "Needs more storage per character", b: 1 },
], done: "ASCII is compact, Unicode is universal." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Character set", "All the characters a system can use, each with a unique code"], ["Sample rate", "The number of samples taken every second"], ["Sample resolution", "The number of bits used for each sample"],
  ["Pixel", "The smallest element of a bitmap image"], ["Image resolution", "The number of pixels in the image, width × height"], ["Colour depth", "The number of bits used for each pixel"], ["Metadata", "Data about the file, such as width, height and colour depth"],
] });

Lib.order($("#o1"), { prompt: "Put the steps for turning a sound into a digital file in the right order.", items: [
  "A microphone turns the sound into an analogue electrical signal", "The height of the signal is measured at regular time intervals (sampling)", "Each measurement is rounded to the nearest value the bits can store", "Each sample is stored as a binary number", "The binary values are saved together as a sound file",
], done: "Analogue, sample, round, binary, file." });

Lib.calc($("#c1"), { qs: [
  { q: "The ASCII code for A is 65. What is the ASCII code for F?", a: 70, sol: "A, B, C, D, E, F: five letters on. 65 + 5 = 70.", hint: "Count along from A." },
  { q: "The ASCII code for A is 65. Give the 8-bit binary code for C.", t: ["01000011"], ph: "8 bits", sol: "C = 65 + 2 = 67 = 64 + 2 + 1 → 01000011", hint: "Work out the denary code first." },
  { q: "How many different colours can be shown with a colour depth of 6 bits?", a: 64, sol: "2⁶ = 64 colours.", hint: "n bits gives 2ⁿ." },
  { q: "What colour depth is needed to show 256 different colours?", a: 8, sol: "2⁸ = 256, so 8 bits per pixel." },
  { q: "A 10 × 10 pixel image uses 2 bits per pixel. How many bits are needed for the pixel data?", a: 200, sol: "10 × 10 = 100 pixels. 100 × 2 = 200 bits." },
  { q: "An image is 64 pixels wide and 32 high with a colour depth of 4 bits. Calculate the file size in bytes. Ignore metadata.", a: 1024, sol: "64 × 32 = 2,048 pixels. × 4 = 8,192 bits. ÷ 8 = 1,024 bytes.", hint: "Pixels × bits, then ÷ 8." },
  { q: "A photo is 800 × 600 pixels with 24-bit colour. Calculate the file size in bytes. Ignore metadata.", a: 1440000, sol: "800 × 600 = 480,000 pixels. × 24 = 11,520,000 bits. ÷ 8 = 1,440,000 bytes.", hint: "Careful: bits first, then bytes." },
  { q: "A sound is sampled at 8,000 Hz with 8 bits per sample for 5 seconds. Calculate the file size in bits.", a: 320000, sol: "8,000 × 8 × 5 = 320,000 bits." },
  { q: "A sound is sampled at 44,100 Hz with 16 bits per sample for 10 seconds. Calculate the file size in bytes.", a: 882000, sol: "44,100 × 16 × 10 = 7,056,000 bits. ÷ 8 = 882,000 bytes.", hint: "Rate × resolution × seconds, then ÷ 8." },
] });

(() => {
  const el = $("#drill"), modes = [["img", "image file size (bytes)"], ["imgb", "image file size (bits)"], ["snd", "sound file size (bytes)"], ["sndb", "sound file size (bits)"]];
  el.innerHTML = `<label>Practise: <select>${modes.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <div class="qline" aria-live="polite"></div>
    <div class="row"><input type="text" inputmode="numeric" autocomplete="off" aria-label="Your answer"><button class="b pri" data-a="c">Check</button><button class="b" data-a="s">Show working</button><button class="b" data-a="n">New question</button><span class="fb" aria-live="polite"></span></div>
    <p class="note" data-s></p><p class="note" data-w></p>`;
  const sel = $("select", el), ql = $(".qline", el), inp = $("input", el), fb = $(".fb", el), st = $("[data-s]", el), wk = $("[data-w]", el);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  let ans = 0, work = "", streak = 0, best = 0, solved = false;
  function gen() {
    const m = sel.value; solved = false;
    if (m.startsWith("img")) {
      const w = pick([16, 24, 32, 40, 64, 80, 100, 120, 200]), h = pick([8, 16, 24, 32, 48, 50, 60]), d = pick([1, 2, 4, 8, 16, 24]), bits = w * h * d;
      ans = m === "img" ? bits / 8 : bits; ql.textContent = `An image is ${w} × ${h} pixels with a colour depth of ${d} bit${d > 1 ? "s" : ""}. Give its file size in ${m === "img" ? "bytes" : "bits"}, ignoring metadata.`;
      work = `${w} × ${h} × ${d} = ${fmtInt(bits)} bits` + (m === "img" ? `, ÷ 8 = ${fmtInt(bits / 8)} bytes.` : ".");
    } else {
      const r = pick([8000, 16000, 22050, 44100, 48000]), d = pick([8, 16, 24]), t = pick([2, 3, 5, 10, 15, 20, 30]), bits = r * d * t;
      ans = m === "snd" ? bits / 8 : bits; ql.textContent = `A sound is sampled at ${fmtInt(r)} Hz with ${d} bits per sample for ${t} seconds. Give its file size in ${m === "snd" ? "bytes" : "bits"}.`;
      work = `${fmtInt(r)} × ${d} × ${t} = ${fmtInt(bits)} bits` + (m === "snd" ? `, ÷ 8 = ${fmtInt(bits / 8)} bytes.` : ".");
    }
    inp.value = ""; fb.textContent = ""; fb.className = "fb"; wk.textContent = "";
  }
  const check = () => {
    const v = parseFloat(inp.value.replace(/[,\s]/g, "")), good = !isNaN(v) && Math.abs(v - ans) < 0.5;
    if (!solved) { streak = good ? streak + 1 : 0; best = Math.max(best, streak); }
    if (good) solved = true;
    fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); st.textContent = `Streak ${streak} · best ${best}`;
  };
  $("[data-a=c]", el).onclick = check; inp.addEventListener("keydown", (e) => e.key === "Enter" && (solved ? gen() : check()));
  $("[data-a=n]", el).onclick = gen; sel.onchange = () => { streak = 0; st.textContent = ""; gen(); };
  $("[data-a=s]", el).onclick = () => { streak = 0; solved = true; wk.textContent = "Working: " + work; st.textContent = "Streak 0 · best " + best; };
  gen();
})();

Lib.quiz($("#qz1"), { qs: [
  { q: "Which statement about Unicode is correct?", opts: ["It uses fewer bits than ASCII", "It can represent characters from many languages and emoji", "It only has 128 characters", "It cannot be used on the web"], a: 1, why: "Unicode has over 140,000 characters, using more bits per character than ASCII." },
  { q: "A student increases the sample rate of a recording. What is the effect?", opts: ["Smaller file, lower quality", "Larger file, closer to the original", "Smaller file, closer to the original", "No change to the file size"], a: 1, why: "More samples per second follow the wave more closely, but more data is stored." },
  { q: "How many colours can a colour depth of 3 bits show?", opts: ["3", "6", "8", "9"], a: 2, why: "2³ = 8." },
  { q: "What is stored in an image file's metadata?", opts: ["Only the pixel colours", "The width, height and colour depth", "The sample rate", "The ASCII codes"], a: 1, why: "Metadata is data about the image, so software can rebuild it from the bits." },
  { q: "How many bits does the word 'Hi' need in extended ASCII?", opts: ["2", "8", "14", "16"], a: 3, why: "2 characters × 8 bits = 16 bits." },
  { q: "Which change would make an image file smaller?", opts: ["Increase the colour depth", "Increase the resolution", "Decrease the resolution", "Add more metadata"], a: 2, why: "Fewer pixels means fewer bits to store, though the image has less detail." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Character set", "All the characters a computer system can use, each with a unique binary code."], ["ASCII", "A character set with 128 characters (7 bits); extended ASCII has 256 (8 bits)."], ["Unicode", "A character set with over 140,000 characters, using up to 32 bits each. Covers most languages and emoji."],
  ["Analogue", "A continuous signal that can take any value, like a sound wave."], ["Sample", "One measurement of a sound wave's amplitude at a moment in time."], ["Sample rate", "The number of samples taken per second, in hertz (Hz)."],
  ["Sample resolution", "The number of bits used to store each sample (bit depth)."], ["Pixel", "The smallest element of a bitmap image; stores one colour value."], ["Image resolution", "The number of pixels in an image, width × height."],
  ["Colour depth", "The number of bits used for each pixel. n bits give 2ⁿ colours."], ["Metadata", "Data about a file, such as an image's width, height and colour depth."],
] });
