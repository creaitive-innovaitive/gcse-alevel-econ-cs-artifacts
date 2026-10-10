// uses: econ
/* ---------- 1. stepper: diminishing returns ---------- */
const TP = [10, 30, 60, 84, 100, 110, 114, 114], MPd = [10, 20, 30, 24, 16, 10, 4, 0], APd = TP.map((v, i) => v / (i + 1));
Lib.stepper($("#stA"), {
  w: 760, h: 400, label: "Total, marginal and average product as workers are added to a fixed factory", base: { n: 0, pk: 0, cut: 0 },
  draw: (s) => {
    const Yt = (v) => 340 - (v * 300) / 120, Ym = (v) => 340 - (v * 300) / 32, Xb = (i) => 60 + (i - 1) * 38, Xl = (i) => 430 + (i - 1) * 40;
    let o = SV.line(60, 40, 60, 340) + SV.line(60, 340, 366, 340) + SV.line(420, 40, 420, 340) + SV.line(420, 340, 724, 340);
    o += SV.text(64, 34, "Total product (TP)", "lbl bd", { "text-anchor": "start" }) + SV.text(424, 34, "MP and AP per worker", "lbl bd", { "text-anchor": "start" });
    o += SV.text(366, 384, "Workers", "sm", { "text-anchor": "end" }) + SV.text(724, 384, "Workers", "sm", { "text-anchor": "end" });
    for (let i = 1; i <= 8; i++) {
      const f = clamp01(s.n - (i - 1));
      o += SV.text(Xb(i) + 14, 358, i, "sm", { "text-anchor": "middle" }) + SV.text(Xl(i), 358, i, "sm", { "text-anchor": "middle" });
      if (f > 0) o += SV.rect(Xb(i), Yt(TP[i - 1] * f), 28, (TP[i - 1] * f * 300) / 120, "f1", { opacity: 0.6 });
      if (f > 0.95) o += SV.text(Xb(i) + 14, Yt(TP[i - 1]) - 6, TP[i - 1], "sm", { "text-anchor": "middle" });
      if (f > 0) o += SV.circle(Xl(i), Ym(MPd[i - 1]), 5, "dot2", { opacity: f }) + SV.circle(Xl(i), Ym(APd[i - 1]), 5, "dot1", { opacity: f });
      if (i < 8) {
        const g = clamp01(s.n - i);
        if (g > 0) {
          const e = (a) => Xl(i) + (Xl(i + 1) - Xl(i)) * g, mm = MPd[i - 1] + (MPd[i] - MPd[i - 1]) * g, aa = APd[i - 1] + (APd[i] - APd[i - 1]) * g;
          o += SV.line(Xl(i), Ym(MPd[i - 1]), e(), Ym(mm), "c2") + SV.line(Xl(i), Ym(APd[i - 1]), e(), Ym(aa), "c1");
        }
      }
    }
    o += SV.text(716, Ym(0.8), "MP", "lbl bd t2", { "text-anchor": "end", opacity: clamp01(s.n - 6) }) + SV.text(716, Ym(14.8), "AP", "lbl bd t1", { "text-anchor": "end", opacity: clamp01(s.n - 6) });
    if (s.pk) o += SV.line(Xl(3), 40, Xl(3), 340, "gr", { opacity: s.pk }) + SV.text(Xl(3) + 6, 56, "MP peaks here", "sm", { "text-anchor": "start", opacity: s.pk });
    if (s.cut) o += SV.circle((Xl(4) + Xl(5)) / 2, Ym(20.5), 9, "dot4", { opacity: s.cut * 0.5 }) + SV.line((Xl(4) + Xl(5)) / 2, Ym(20.5) + 9, (Xl(4) + Xl(5)) / 2, Ym(7), "gr", { opacity: s.cut }) + SV.text((Xl(4) + Xl(5)) / 2, Ym(5), "MP cuts AP at AP's maximum", "lbl bd t4", { "text-anchor": "middle", opacity: s.cut });
    return o;
  },
  steps: [
    { cap: "A factory has fixed capital. Workers are the variable factor. We add one worker at a time and track <b>TP</b> (total output), <b>MP</b> (extra output from the last worker) and <b>AP</b> (TP ÷ workers).", s: { n: 0, pk: 0, cut: 0 } },
    { cap: "<b>1 worker:</b> TP = 10. MP = 10 (the first worker's whole output) and AP = 10.", s: { n: 1, pk: 0, cut: 0 } },
    { cap: "<b>Workers 2 and 3:</b> division of labour and better use of the machines. TP rises to 60. MP <b>rises</b> to 30, and AP rises behind it to 20.", s: { n: 3, pk: 1, cut: 0 } },
    { cap: "<b>4th worker:</b> TP = 84, but MP falls to 24. This is the <b>law of diminishing returns</b>: each worker has less fixed capital to share. TP still rises, and AP still rises (to 21) because MP is above AP.", s: { n: 4, pk: 1, cut: 0 } },
    { cap: "<b>5th worker:</b> MP = 16, now <b>below</b> AP, so AP falls to 20. MP always cuts AP at AP's maximum.", s: { n: 5, pk: 1, cut: 1 } },
    { cap: "<b>Workers 6 to 8:</b> MP keeps falling. TP rises more and more slowly and stops at 114 when the 8th worker adds nothing (MP = 0). <b>TP is at its maximum where MP = 0.</b>", s: { n: 8, pk: 1, cut: 1 } },
  ],
});

/* ---------- 2. stepper: short-run cost curves ---------- */
Lib.stepper($("#stB"), {
  w: 760, h: 400, label: "Average fixed, average variable, average total and marginal cost curves", base: { a: 0, v: 0, m: 0, t: 0, d1: 0, d2: 0 },
  draw: (s) => {
    const F = frame(760, 400, 70, 730, 20, 350, 5.5, 0, 40);
    let o = axes(F, "Output (Q)", "Cost per unit ($)");
    o += costSet(F, 20, { a: s.a, v: s.v, t: s.t, m: s.m });
    if (s.d1) o += SV.circle(F.X(3), F.Y(6), 7, "dot4", { opacity: s.d1 }) + SV.line(F.X(3), F.Y(6), F.X(3), F.Y(0), "gr", { opacity: s.d1 }) + SV.text(F.X(3) - 10, F.Y(6) + 26, "MC = AVC at AVC's minimum", "lbl bd t4", { "text-anchor": "end", opacity: s.d1 });
    if (s.d2) o += SV.circle(F.X(3.71), F.Y(11.8), 8, "dot4", { opacity: s.d2 }) + SV.line(F.X(3.71), F.Y(11.8), F.X(3.71), F.Y(0), "gr", { opacity: s.d2 }) + SV.text(F.X(3.71) + 12, F.Y(11.8) - 14, "Optimum output: MC = ATC", "lbl bd t4", { "text-anchor": "start", opacity: s.d2 });
    return o;
  },
  steps: [
    { cap: "A firm has <b>fixed costs of $20</b> and variable costs that depend on output. Costs per unit are shown on the vertical axis.", s: {} },
    { cap: "<b>AFC = FC ÷ Q.</b> The same $20 is spread over more and more units, so AFC falls all the way. It never turns up.", s: { a: 1 } },
    { cap: "<b>AVC = VC ÷ Q.</b> It falls at first, then rises as diminishing returns bite. U-shaped.", s: { a: 1, v: 1 } },
    { cap: "<b>MC</b> is the cost of one more unit. It also falls then rises, but it <b>cuts AVC at AVC's lowest point</b>: while MC is below AVC the average is pulled down, once MC is above it the average is pulled up.", s: { a: 1, v: 1, m: 1, d1: 1 } },
    { cap: "<b>ATC = AFC + AVC.</b> It is U-shaped too, and MC cuts it at its lowest point. That is the <b>optimum output</b>: the lowest cost per unit the firm can reach in the short run.", s: { a: 1, v: 1, m: 1, t: 1, d1: 1, d2: 1 } },
  ],
});

/* ---------- 3. stepper: SRAC curves and the LRAC envelope ---------- */
const L = (q) => 0.25 * (q - 5) * (q - 5) + 5, centres = [2, 3.5, 5, 6.5, 8];
const sracF = (c) => (q) => L(c) + 0.5 * (c - 5) * (q - c) + 0.6 * (q - c) * (q - c);
Lib.stepper($("#stC"), {
  w: 760, h: 400, label: "Short-run average cost curves for different plant sizes and the long-run average cost envelope", base: { s0: 0, s1: 0, s2: 0, s3: 0, s4: 0, e: 0, z: 0 },
  draw: (s) => {
    const F = frame(760, 400, 70, 730, 20, 350, 10, 0, 14);
    let o = axes(F, "Output (Q)", "Cost per unit ($)");
    centres.forEach((c, k) => { const a = (s["s" + k] || 0) * (1 - 0.65 * s.e); if (a > 0) { const f = sracF(c); o += SV.path(curve(f, Math.max(0.2, c - 2.2), Math.min(9.8, c + 2.2), F), "c1", { opacity: a }) + SV.text(F.X(c), F.Y(f(c)) + 20, "SRAC" + (k + 1), "sm", { "text-anchor": "middle", opacity: a }); } });
    if (s.e) o += SV.path(curve(L, 0.2, 9.8, F), "c2", { opacity: s.e }) + SV.text(F.X(9.6), F.Y(L(9.6)) - 10, "LRAC", "lbl bd t2", { "text-anchor": "end", opacity: s.e });
    if (s.z) o += SV.circle(F.X(5), F.Y(5), 8, "dot4", { opacity: s.z }) + SV.line(F.X(5), F.Y(5), F.X(5), F.Y(0), "gr", { opacity: s.z }) + SV.text(F.X(5), F.Y(0) - 10, "MES", "lbl bd t4", { "text-anchor": "middle", opacity: s.z })
      + SV.text(F.X(2.2), F.Y(13), "Economies of scale", "lbl bd t3", { "text-anchor": "middle", opacity: s.z }) + SV.text(F.X(7.8), F.Y(13), "Diseconomies of scale", "lbl bd t2", { "text-anchor": "middle", opacity: s.z });
    return o;
  },
  steps: [
    { cap: "In the long run the firm can choose its plant size. Each <b>SRAC</b> curve shows average cost for <b>one</b> plant size, with that plant fixed.", s: { s0: 1 } },
    { cap: "A bigger plant gives a different SRAC curve, centred on a higher output. The firm picks whichever plant gives the <b>lowest cost per unit</b> for the output it wants.", s: { s0: 1, s1: 1, s2: 1 } },
    { cap: "With a whole family of plant sizes available, the choices overlap like scallops.", s: { s0: 1, s1: 1, s2: 1, s3: 1, s4: 1 } },
    { cap: "The <b>LRAC curve</b> is the envelope: the lowest cost per unit available at each output once any plant can be chosen. It touches each SRAC at one point only.", s: { s0: 1, s1: 1, s2: 1, s3: 1, s4: 1, e: 1 } },
    { cap: "LRAC falls while the firm gets <b>economies of scale</b>, bottoms out at the <b>minimum efficient scale (MES)</b>, then rises with <b>diseconomies of scale</b>.", s: { s0: 1, s1: 1, s2: 1, s3: 1, s4: 1, e: 1, z: 1 } },
  ],
});

/* ---------- Lab 1: short-run costs ---------- */
function lab1() {
  if (!$("#a1") || !$("#a2")) return;
  const q = +$("#a1").value, fc = +$("#a2").value, vc = q * AVC(q), tc = fc + vc;
  $("#k1").textContent = "$" + Lib.fmtN(tc, 1); $("#k2").textContent = "$" + Lib.fmtN(fc / q, 1); $("#k3").textContent = "$" + Lib.fmtN(AVC(q), 1); $("#k4").textContent = "$" + Lib.fmtN(ATC(q, fc), 1); $("#k5").textContent = "$" + Lib.fmtN(MC(q), 1);
  let best = 0.4, bv = 1e9; for (let x = 0.4; x <= 5.5; x += 0.01) if (ATC(x, fc) < bv) { bv = ATC(x, fc); best = x; }
  $("#v1").textContent = Math.abs(q - best) < 0.1 ? `This is the optimum output: MC meets ATC and ATC is at its lowest ($${Lib.fmtN(bv, 1)}).` : q < best ? "Left of the optimum: MC is below ATC, so ATC is still falling." : "Right of the optimum: MC is above ATC, so ATC is rising.";
  const F = frame(480, 360, 50, 460, 20, 320, 5.5, 0, 40);
  let s = axes(F, "Output (Q)", "Cost per unit ($)") + costSet(F, fc) + SV.line(F.X(q), F.Y(0), F.X(q), F.t, "gr") + SV.circle(F.X(q), F.Y(Math.min(40, ATC(q, fc))), 6, "dot1");
  $("#lab1").innerHTML = s;
}
Lib.slider($("#sl1"), { id: "a1", label: "Output (Q)", min: 0.5, max: 5.5, step: 0.1, value: 2, fmt: (v) => v.toFixed(1), onInput: lab1 });
Lib.slider($("#sl2"), { id: "a2", label: "Fixed cost (FC)", min: 0, max: 40, step: 2, value: 20, fmt: (v) => "$" + v, onInput: lab1 });
lab1();

/* ---------- Lab 2: isoquant and isocost ---------- */
Lib.slider($("#sl3"), { id: "a3", label: "Wage per unit of labour", min: 4, max: 40, step: 1, value: 10, fmt: (v) => "$" + v, onInput: (w) => {
  const r = 10, Lq = Math.sqrt((100 * r) / w), K = Math.sqrt((100 * w) / r), C = w * Lq + r * K;
  $("#i1").textContent = Lib.fmtN(Lq, 1); $("#i2").textContent = Lib.fmtN(K, 1); $("#i3").textContent = "$" + Lib.fmtN(C, 0);
  $("#v2").textContent = w === r ? "Labour and capital cost the same, so the firm uses equal amounts of each." : w > r ? "Labour is dearer than capital, so the firm uses less labour and more capital." : "Labour is cheaper than capital, so the firm uses more labour and less capital.";
  const F = frame(480, 360, 50, 460, 20, 320, 30, 0, 30);
  let s = axes(F, "Labour (L)", "Capital (K)");
  const p = []; for (let x = 3.4; x <= 30; x += 0.2) p.push([F.X(x), F.Y(100 / x)]);
  s += SV.path(ptsPath(p), "c1") + SV.text(F.X(25), F.Y(100 / 25) - 10, "100 units", "lbl bd t1");
  const k0 = C / r, x0 = k0 > 30 ? ((k0 - 30) * r) / w : 0, y0 = k0 > 30 ? 30 : k0, x1 = Math.min(30, C / w), y1 = x1 < C / w ? k0 - (w / r) * x1 : 0;
  s += SV.line(F.X(x0), F.Y(y0), F.X(x1), F.Y(y1), "c2") + SV.circle(F.X(Lq), F.Y(K), 7, "dot2");
  s += SV.text(F.X(Lq) + 12, F.Y(K) - 10, `L = ${Lib.fmtN(Lq, 1)}, K = ${Lib.fmtN(K, 1)}`, "lbl bd t2", { "text-anchor": "start" });
  $("#lab2").innerHTML = s;
} });

/* ---------- Lab 3: AR, MR and TR ---------- */
Lib.slider($("#sl4"), { id: "a4", label: "Quantity sold (Q)", min: 1, max: 19, step: 0.5, value: 5, fmt: (v) => v.toFixed(1), onInput: (q) => {
  const P = 20 - q, tr = P * q, mr = 20 - 2 * q, ped = P / q;
  $("#r1").textContent = "$" + Lib.fmtN(P, 1); $("#r2").textContent = "$" + Lib.fmtN(tr, 1); $("#r3").textContent = (mr < 0 ? "−$" : "$") + Lib.fmtN(Math.abs(mr), 1); $("#r4").textContent = Lib.fmtN(ped, 2);
  $("#v3").textContent = Math.abs(q - 10) < 0.01 ? "MR = 0, PED = 1 and TR is at its maximum ($100)." : q < 10 ? "MR is positive and demand is elastic (PED > 1): selling more raises TR." : "MR is negative and demand is inelastic (PED < 1): selling more lowers TR.";
  const F = frame(480, 360, 50, 460, 20, 320, 20, -20, 20);
  let s = axes(F, "Quantity (Q)", "Price, AR, MR ($)", 0);
  s += SV.rect(F.X(0), F.Y(P), F.X(q) - F.X(0), F.Y(0) - F.Y(P), "f1");
  s += SV.line(F.X(0), F.Y(20), F.X(20), F.Y(0), "c1") + SV.text(F.X(19.5), F.Y(1) + 18, "AR = D", "lbl bd t1", { "text-anchor": "end" });
  s += SV.line(F.X(0), F.Y(20), F.X(20), F.Y(-20), "c2") + SV.text(F.X(19.5), F.Y(-18), "MR", "lbl bd t2", { "text-anchor": "end" });
  s += SV.line(F.X(q), F.Y(Math.min(P, mr)), F.X(q), F.Y(0), "gr") + SV.circle(F.X(q), F.Y(P), 6, "dot1") + SV.circle(F.X(q), F.Y(mr), 6, "dot2");
  s += SV.text(F.X(q / 2), (F.Y(P) + F.Y(0)) / 2 + 4, "TR = " + Lib.fmtN(tr, 0), "lbl bd t1", { "text-anchor": "middle" });
  $("#lab3").innerHTML = s;
} });

/* ---------- Lab 4: profit types for a price taker ---------- */
Lib.slider($("#sl5"), { id: "a5", label: "Market price (P = MR = AR)", min: 3, max: 24, step: 0.2, value: 16, fmt: (v) => "$" + v.toFixed(1), onInput: (P) => {
  const F = frame(480, 360, 50, 460, 20, 320, 5.5, 0, 40), shut = P < 6, q = shut ? 0 : 2 + Math.sqrt((P - 3) / 3);
  let s = axes(F, "Output (Q)", "Cost / revenue per unit ($)") + costSet(F, 20, { a: 0 }) + SV.line(F.l, F.Y(P), F.r, F.Y(P), "c4") + SV.text(F.r - 4, F.Y(P) - 8, "P = AR = MR", "lbl bd t4", { "text-anchor": "end" });
  if (shut) {
    $("#p1").textContent = "0"; $("#p2").textContent = "–"; $("#p3").textContent = "–"; $("#p4").textContent = "–$20";
    $("#v4").textContent = "Price is below the lowest AVC ($6). The firm cannot even cover its variable costs, so it is likely to shut down in the short run and lose only its fixed costs.";
  } else {
    const atc = ATC(q), u = P - atc, tp = u * q;
    $("#p1").textContent = Lib.fmtN(q, 2); $("#p2").textContent = "$" + Lib.fmtN(atc, 2); $("#p3").textContent = (u < 0 ? "−$" : "$") + Lib.fmtN(Math.abs(u), 2); $("#p4").textContent = (tp < 0 ? "−$" : "$") + Lib.fmtN(Math.abs(tp), 1);
    s += SV.rect(F.X(0), Math.min(F.Y(P), F.Y(atc)), F.X(q) - F.X(0), Math.abs(F.Y(P) - F.Y(atc)), u >= 0 ? "f3" : "f2") + SV.circle(F.X(q), F.Y(P), 6, "dot4");
    $("#v4").textContent = Math.abs(u) < 0.15 ? "P is about equal to ATC: the firm earns normal profit. TR covers all costs, including the entrepreneur's opportunity cost." : u > 0 ? "P is above ATC: supernormal profit. This is a signal that could attract new firms into the industry." : "P is below ATC but above AVC: subnormal profit. The firm covers its variable costs, so it may stay in the short run, but it is likely to leave in the long run.";
  }
  $("#lab4").innerHTML = s;
} });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Which of these are fixed costs and which are variable costs in the short run?",
  buckets: [{ label: "Fixed cost" }, { label: "Variable cost" }],
  items: [
    { text: "Rent on the factory", b: 0 }, { text: "Insurance on the building", b: 0 }, { text: "Salaries of permanent managers", b: 0 }, { text: "Repayments on a machinery loan", b: 0 },
    { text: "Raw materials", b: 1 }, { text: "Hourly wages of temporary workers", b: 1 }, { text: "Electricity used by machines", b: 1 }, { text: "Packaging", b: 1 },
  ],
  done: "Fixed costs do not change with output in the short run. Variable costs rise as output rises.",
});
Lib.classify($("#cl2"), {
  prompt: "Is each of these an internal or an external economy of scale?",
  buckets: [{ label: "Internal (the firm grows)" }, { label: "External (the industry grows)" }],
  items: [
    { text: "Buying raw materials in bulk at a discount", b: 0 }, { text: "Large firm borrows at a lower interest rate", b: 0 }, { text: "Hiring specialist managers", b: 0 }, { text: "Advertising spread over far more units", b: 0 },
    { text: "A local pool of skilled, industry-trained workers", b: 1 }, { text: "A cluster of nearby suppliers", b: 1 }, { text: "Shared port and road infrastructure built for the industry", b: 1 }, { text: "University research spillovers", b: 1 },
  ],
  done: "Internal economies are movements along the LRAC curve. External economies shift the whole curve down.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Marginal cost", "The extra cost of producing one more unit"],
  ["Average fixed cost", "Fixed cost divided by output; falls all the way"],
  ["Isoquant", "All labour and capital combinations that give the same output"],
  ["Isocost line", "All combinations of factors that cost the same total amount"],
  ["Minimum efficient scale", "The lowest output at which LRAC reaches its minimum"],
  ["Normal profit", "The minimum return needed to keep the firm in the industry, included in total cost"],
] });
Lib.order($("#o1"), { prompt: "Put the chain from diminishing returns to rising average cost in order.", items: [
  "A firm adds more workers to a fixed amount of capital.",
  "Each extra worker has less capital to share.",
  "Marginal product starts to fall.",
  "The cost of producing one more unit (MC) starts to rise.",
  "MC pulls AVC and then ATC upwards.",
] });
Lib.calc($("#c1"), { qs: [
  { q: "TP is 60 with 3 workers and 84 with 4 workers. What is the marginal product of the 4th worker?", a: 24, hint: "MP = change in TP ÷ change in workers.", sol: "MP = 84 − 60 = 24 units." },
  { q: "TP is 100 with 5 workers. What is the average product?", a: 20, hint: "AP = TP ÷ number of workers.", sol: "AP = 100 ÷ 5 = 20 units per worker." },
  { q: "A firm has fixed costs of $200 and variable costs of $600 at an output of 50 units. What is the average total cost?", a: 16, unit: "$", hint: "ATC = TC ÷ Q, and TC = FC + VC.", sol: "TC = 200 + 600 = $800. ATC = 800 ÷ 50 = $16." },
  { q: "Total cost rises from $300 to $312 when output rises from 20 to 21 units. What is the marginal cost?", a: 12, unit: "$", hint: "MC = change in TC ÷ change in Q.", sol: "MC = (312 − 300) ÷ (21 − 20) = $12." },
  { q: "A firm sells 300 units at $12 each. What is its total revenue?", a: 3600, unit: "$", hint: "TR = P × Q.", sol: "TR = 12 × 300 = $3,600." },
  { q: "TR is $5,000 and TC (including normal profit) is $4,200. How much supernormal profit does the firm earn?", a: 800, unit: "$", hint: "Supernormal profit = TR − TC.", sol: "$5,000 − $4,200 = $800." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "The law of diminishing returns applies when", opts: ["all factors are increased in the same proportion", "one factor is varied and at least one is fixed", "a firm moves to a bigger plant", "firms enter an industry"], a: 1, why: "Diminishing returns is a short-run idea: one factor is fixed, so extra units of the variable factor add less and less." },
  { q: "Marginal cost cuts average total cost", opts: ["at ATC's maximum point", "at ATC's minimum point", "where AFC is zero", "at the origin"], a: 1, why: "MC pulls ATC down while below it and up when above it, so it cuts ATC at its lowest point." },
  { q: "Which statement about a firm earning normal profit is correct?", opts: ["Total revenue is below total cost", "Total revenue equals total cost, which includes normal profit", "The firm is making an accounting loss", "The firm will leave the industry"], a: 1, why: "Normal profit is the opportunity cost of enterprise and is already included in total cost, so TR = TC." },
  { q: "A cluster of suppliers growing near a car factory lowers every local firm's costs. This is", opts: ["an internal economy of scale", "an external economy of scale", "diminishing returns", "an internal diseconomy"], a: 1, why: "The saving comes from the industry or area growing, not from the firm's own size, so the whole LRAC curve shifts down." },
  { q: "A price maker's marginal revenue is zero when", opts: ["price equals average cost", "PED = 1 and total revenue is at its maximum", "demand is perfectly elastic", "the firm earns normal profit"], a: 1, why: "MR = 0 where AR is at the midpoint of a straight-line demand curve: PED = 1, and TR is at its maximum." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Law of diminishing returns", "In the short run, as more of a variable factor is added to a fixed factor, the extra output from each additional unit eventually falls."],
  ["Marginal product", "The extra output from one more unit of a variable factor."],
  ["Average product", "Total product divided by the number of units of the variable factor."],
  ["Fixed costs", "Costs that do not change with output in the short run."],
  ["Marginal cost", "The extra cost of producing one more unit of output."],
  ["Optimum output", "The output where MC = ATC and average total cost is at its lowest in the short run."],
  ["Isoquant", "A line joining every combination of labour and capital that produces the same output."],
  ["Isocost line", "A line joining every combination of factors that costs the same total amount."],
  ["Long-run average cost (LRAC)", "The lowest average cost at each output when all factors, including plant size, can be varied."],
  ["Minimum efficient scale", "The lowest output at which LRAC reaches its minimum."],
  ["Internal economies of scale", "Falling LRAC caused by the growth of the firm itself."],
  ["External economies of scale", "Lower costs for every firm caused by the growth of the whole industry or location."],
  ["Marginal revenue", "The extra revenue from selling one more unit."],
  ["Price taker", "A firm that faces a horizontal demand curve and must accept the market price."],
  ["Normal profit", "The minimum return needed to keep the entrepreneur in the industry, included in total cost."],
  ["Supernormal profit", "Profit above normal profit, when TR is greater than TC."],
  ["Subnormal profit", "Profit below normal profit, when TR is less than TC."],
] });

/* ---------- Draw it. Explain it. Apply it. ---------- */
const PROMPTS = [
  { id: "p1", title: "1 · Total, average and marginal product", ctx: "Sketch TP against number of workers, then AP and MP on a second set of axes below it.", ask: "Explain why MP rises then falls, and identify the point where MP = AP. Apply it: think of a small business (a restaurant kitchen, say). At what point would adding another worker start doing more harm than good?" },
  { id: "p2", title: "2 · Short-run cost curves", ctx: "Sketch AFC, AVC, ATC and MC on one set of axes.", ask: "Explain why MC cuts AVC and ATC at their minimum points, and why AFC never has a U-shape. Apply it: for a firm you know, what counts as its fixed cost and what counts as its variable cost?" },
  { id: "p3", title: "3 · Isoquants and isocosts", ctx: "Sketch two isoquants (Q1 and Q2) with an isocost line tangent to Q1.", ask: "Explain what the tangency point represents, and why a firm would move away from any other point on the isoquant. Apply it: for a real industry, would you expect the least-cost combination to use more labour or more capital, and why?" },
  { id: "p4", title: "4 · SRAC envelope and the LRAC curve", ctx: "Sketch several SRAC curves and the LRAC envelope that wraps around them, marking the minimum efficient scale.", ask: "Explain why the LRAC only touches each SRAC at one point. Apply it: name an industry with a high MES and one with a low MES, and say what that implies about how many firms compete in each." },
  { id: "p5", title: "5 · Economies and diseconomies of scale", ctx: "No chart needed: list two examples each of internal and external economies of scale for a real company you know.", ask: "Explain the difference between an internal and an external economy of scale using your examples. Apply it: what might cause that company to run into diseconomies of scale if it kept growing?" },
  { id: "p6", title: "6 · Average and marginal revenue", ctx: "Sketch a downward-sloping AR curve with its MR curve below it, marking the point where MR = 0.", ask: "Explain the relationship between MR = 0, PED = 1 and total revenue at that point. Apply it: for a real product, would cutting the price raise or lower total revenue right now, and what would you need to know to answer?" },
  { id: "p7", title: "7 · Normal, subnormal and supernormal profit", ctx: "No chart needed: write TR and TC for three imagined scenarios, one earning normal profit, one supernormal and one subnormal.", ask: "Explain, using your own numbers, why normal profit is included in total costs rather than sitting on top of them. Apply it: describe a real or plausible business earning subnormal profit and say what you would expect to happen to it over the next few years." },
];
PROMPTS.forEach((p) => {
  const card = document.createElement("div");
  card.className = "prompt-card";
  card.innerHTML = `<h3>${p.title}</h3><p class="ctx">${p.ctx}</p><div class="draw-box">sketch your diagram here (on paper or in your notebook)</div><label for="${p.id}">Explain and apply</label><textarea id="${p.id}" placeholder="${p.ask.replace(/"/g, "&quot;")}"></textarea>`;
  $("#promptList").appendChild(card);
  const ta = $("#" + p.id);
  try { const saved = localStorage.getItem("firm-focus-" + p.id); if (saved) ta.value = saved; } catch (e) {}
  ta.addEventListener("input", () => { try { localStorage.setItem("firm-focus-" + p.id, ta.value); } catch (e) {} });
});
