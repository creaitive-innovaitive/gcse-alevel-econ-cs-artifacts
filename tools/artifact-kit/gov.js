/* Market model: D: P = 50 - b(Q-50), S: P = 50 + d(Q-50). Equilibrium (50, 50). */
const QX = (q) => 80 + 6 * q, PY = (p) => 360 - 2.7 * p;
function seg(m, c) { // clip P = mQ + c to 0<=Q<=100, 0<=P<=120
  let lo = 0, hi = 100;
  if (m !== 0) { const a = (0 - c) / m, z = (120 - c) / m; lo = Math.max(lo, Math.min(a, z)); hi = Math.min(hi, Math.max(a, z)); }
  return [lo, m * lo + c, hi, m * hi + c];
}
function curve(m, c, cls, label, o = {}) {
  const [q1, p1, q2, p2] = seg(m, c);
  if (q2 <= q1) return "";
  let s = SV.line(QX(q1), PY(p1), QX(q2), PY(p2), cls, o.attrs);
  if (label) { const a = { "text-anchor": "start" }; if (o.attrs && o.attrs.opacity !== undefined) a.opacity = o.attrs.opacity; s += SV.text(QX(q2) + (o.dx ?? 6), PY(p2) + (o.dy ?? 4), label, "lbl bd " + (o.t || "t1"), a); }
  return s;
}
function axes() {
  return SV.line(QX(0), PY(120), QX(0), PY(0)) + SV.line(QX(0), PY(0), QX(104), PY(0)) +
    SV.text(QX(0) + 6, PY(120) + 6, "Price", "sm") + SV.text(QX(104), PY(0) + 22, "Quantity", "sm", { "text-anchor": "end" });
}
const hline = (p, c = "gr", x2 = 100) => SV.line(QX(0), PY(p), QX(x2), PY(p), c);
const vline = (q, p, c = "gr") => SV.line(QX(q), PY(p), QX(q), PY(0), c);
const ylab = (p, t, c = "sm") => SV.text(QX(0) - 8, PY(p) + 4, t, c, { "text-anchor": "end" });
const xlab = (q, t, c = "sm") => SV.text(QX(q), PY(0) + 18, t, c, { "text-anchor": "middle" });
const D = (b) => [-b, 50 + 50 * b], S = (d, shift = 0) => [d, 50 - 50 * d + shift];

/* ---------- tax / subsidy chart ---------- */
function taxChart(s) {
  const b = s.b, d = s.d, t = s.t, q1 = 50 - t / (b + d), pc = 50 + (b * t) / (b + d), pp = pc - t;
  let o = axes();
  if (t > 0.01) {
    o += SV.rect(QX(0), PY(pc), QX(q1) - QX(0), PY(50) - PY(pc), "f2", { opacity: s.inc });
    o += SV.rect(QX(0), PY(50), QX(q1) - QX(0), PY(pp) - PY(50), "f4", { opacity: s.inc });
    if (s.inc > 0.5) {
      o += SV.text(QX(q1 / 2), (PY(pc) + PY(50)) / 2 + 4, "Consumers' share: " + Lib.fmtN(pc - 50, 1), "lbl bd t2", { "text-anchor": "middle", opacity: s.inc });
      o += SV.text(QX(q1 / 2), (PY(50) + PY(pp)) / 2 + 4, "Producers' share: " + Lib.fmtN(50 - pp, 1), "lbl bd t4", { "text-anchor": "middle", opacity: s.inc });
      o += SV.text(QX(q1 / 2), PY(pp) + 22, "Tax revenue = " + Lib.fmtN(t * q1, 0), "lbl bd", { "text-anchor": "middle", opacity: s.inc });
    }
  }
  const [dm, dc] = D(b), [sm, sc] = S(d), [tm, tc] = S(d, t);
  o += curve(dm, dc, "c1", "D", { t: "t1" }) + curve(sm, sc, "c3", "S₁", { t: "t3", attrs: { opacity: t > 0.01 ? 0.55 : 1 } });
  if (t > 0.01) o += curve(tm, tc, "c2", "S₂", { t: "t2" });
  o += hline(50) + vline(50, 50) + ylab(50, "P₁ = 50") + xlab(50, "Q₁ = 50");
  o += SV.circle(QX(50), PY(50), 6, "dot1", { opacity: t > 0.01 ? 0.5 : 1 });
  if (t > 0.01) { o += hline(pc, "gr", q1) + vline(q1, pc) + SV.circle(QX(q1), PY(pc), 6, "dot2") + ylab(pc, "Pc = " + Lib.fmtN(pc, 1)) + ylab(pp, "Pp = " + Lib.fmtN(pp, 1)) + hline(pp, "gr", q1) + xlab(q1, "Q₂ = " + Lib.fmtN(q1, 1)); }
  return o;
}
function subChart(s) {
  const b = s.b, d = s.d, t = s.t, q1 = 50 + t / (b + d), pc = 50 - (b * t) / (b + d), pp = pc + t;
  let o = axes();
  if (t > 0.01) {
    o += SV.rect(QX(0), PY(50), QX(q1) - QX(0), PY(pc) - PY(50), "f3", { opacity: s.inc });
    o += SV.rect(QX(0), PY(pp), QX(q1) - QX(0), PY(50) - PY(pp), "f4", { opacity: s.inc });
    if (s.inc > 0.5) {
      o += SV.text(QX(q1 / 2), (PY(50) + PY(pc)) / 2 + 4, "Consumers gain " + Lib.fmtN(50 - pc, 1) + " per unit", "lbl bd t3", { "text-anchor": "middle", opacity: s.inc });
      o += SV.text(QX(q1 / 2), (PY(pp) + PY(50)) / 2 + 4, "Producers gain " + Lib.fmtN(pp - 50, 1) + " per unit", "lbl bd t4", { "text-anchor": "middle", opacity: s.inc });
      o += SV.text(QX(q1 / 2), PY(pc) + 22, "Cost to government = " + Lib.fmtN(t * q1, 0), "lbl bd", { "text-anchor": "middle", opacity: s.inc });
    }
  }
  const [dm, dc] = D(b), [sm, sc] = S(d), [tm, tc] = S(d, -t);
  o += curve(dm, dc, "c1", "D", { t: "t1" }) + curve(sm, sc, "c3", "S₁", { t: "t3", attrs: { opacity: t > 0.01 ? 0.55 : 1 } });
  if (t > 0.01) o += curve(tm, tc, "c2", "S₂", { t: "t2" });
  o += hline(50) + vline(50, 50) + ylab(50, "P₁ = 50") + xlab(50, "Q₁ = 50") + SV.circle(QX(50), PY(50), 6, "dot1", { opacity: t > 0.01 ? 0.5 : 1 });
  if (t > 0.01) o += hline(pc, "gr", q1) + vline(q1, pc) + SV.circle(QX(q1), PY(pc), 6, "dot2") + ylab(pc, "Pc = " + Lib.fmtN(pc, 1)) + ylab(pp, "Pp = " + Lib.fmtN(pp, 1)) + hline(pp, "gr", q1) + xlab(q1, "Q₂ = " + Lib.fmtN(q1, 1));
  return o;
}
/* ---------- price control chart ---------- */
function ctlChart(s) {
  const b = s.b, d = s.d, p = s.p, max = p < 50, qd = 50 + (50 - p) / b, qs = 50 - (50 - p) / d;
  let o = axes();
  if (Math.abs(p - 50) > 0.5) {
    const lo = Math.min(qd, qs), hi = Math.max(qd, qs);
    o += `<rect x="${QX(lo)}" y="${PY(p) - 10}" width="${QX(hi) - QX(lo)}" height="20" class="${max ? "f2" : "f3"}" opacity="${s.show * 0.9}"/>`;
    o += SV.text((QX(lo) + QX(hi)) / 2, PY(p) + (max ? 36 : -18), (max ? "Shortage = " : "Surplus = ") + Lib.fmtN(Math.abs(qd - qs), 1), "lbl bd " + (max ? "t2" : "t3"), { "text-anchor": "middle", opacity: s.show });
  }
  const [dm, dc] = D(b), [sm, sc] = S(d);
  o += curve(dm, dc, "c1", "D", { t: "t1" }) + curve(sm, sc, "c3", "S", { t: "t3" });
  o += hline(50) + vline(50, 50) + SV.circle(QX(50), PY(50), 6, "dot1") + ylab(50, "P* = 50") + xlab(50, "Q* = 50");
  o += SV.line(QX(0), PY(p), QX(100), PY(p), "c2 dash");
  o += SV.text(QX(100) - 4, PY(p) - 8, max ? "Maximum price = " + Lib.fmtN(p, 0) : p > 50 ? "Minimum price = " + Lib.fmtN(p, 0) : "Control price", "lbl bd t2", { "text-anchor": "end" });
  if (Math.abs(p - 50) > 0.5) o += SV.circle(QX(qd), PY(p), 5, "dot1") + SV.circle(QX(qs), PY(p), 5, "dot3") + xlab(qd, "Qd") + xlab(qs, "Qs");
  return o;
}

/* ---------- steppers ---------- */
Lib.stepper($("#stT"), { w: 760, h: 400, label: "Indirect tax diagram", base: { b: 1, d: 1, t: 0, inc: 0 }, draw: taxChart, steps: [
  { cap: "The market is in equilibrium at <b>price 50, quantity 50</b>. Demand D and supply S₁.", s: { b: 1, d: 1, t: 0, inc: 0 } },
  { cap: "The government imposes a tax of <b>20 per unit</b> on producers. Their costs rise by 20 at every quantity, so supply shifts <b>up</b> by 20 to S₂.", s: { t: 20, inc: 0 } },
  { cap: "The new equilibrium is at a <b>higher price for consumers</b> (60) and a <b>lower quantity</b> (40). Producers keep 60 − 20 = <b>40</b> per unit.", s: { t: 20, inc: 0 } },
  { cap: "<b>Incidence:</b> consumers bear 10 of the 20 (the price rise from 50 to 60) and producers bear 10 (50 down to 40). <b>Tax revenue</b> = 20 × 40 = 800.", s: { t: 20, inc: 1 } },
  { cap: "Now make <b>demand steeper</b> (more inelastic). Consumers have fewer alternatives, so the price they pay rises more and <b>they bear most of the tax</b>.", s: { t: 20, inc: 1, b: 3 } },
] });
Lib.stepper($("#stS"), { w: 760, h: 400, label: "Subsidy diagram", base: { b: 1, d: 1, t: 0, inc: 0 }, draw: subChart, steps: [
  { cap: "Equilibrium again at <b>price 50, quantity 50</b>.", s: { t: 0, inc: 0 } },
  { cap: "The government pays a subsidy of <b>20 per unit</b> to producers. Costs fall by 20 at every quantity, so supply shifts <b>down</b> (right) to S₂.", s: { t: 20, inc: 0 } },
  { cap: "The market price falls to <b>40</b> and quantity rises to <b>60</b>. Producers receive 40 + 20 = <b>60</b> per unit in total.", s: { t: 20, inc: 0 } },
  { cap: "<b>Who benefits:</b> consumers gain 10 per unit (a lower price) and producers gain 10 per unit. <b>Cost to government</b> = 20 × 60 = 1,200. That money has an opportunity cost.", s: { t: 20, inc: 1 } },
] });
Lib.stepper($("#stM"), { w: 760, h: 400, label: "Maximum price diagram", base: { b: 1, d: 1, p: 50, show: 0 }, draw: ctlChart, steps: [
  { cap: "The market clears at <b>price 50, quantity 50</b>.", s: { p: 50, show: 0 } },
  { cap: "The government sets a <b>maximum price above equilibrium</b>, at 65. The market price is already below it, so <b>nothing changes</b>. The control is not binding.", s: { p: 65, show: 0 } },
  { cap: "Now set the maximum at <b>35</b>, below equilibrium. At 35, producers will only supply <b>35</b> units, but consumers want <b>65</b>.", s: { p: 35, show: 0 } },
  { cap: "The gap is a <b>shortage of 30</b>. Expect queues, rationing, a <b>black market</b> and falling quality.", s: { p: 35, show: 1 } },
] });
Lib.stepper($("#stF"), { w: 760, h: 400, label: "Minimum price diagram", base: { b: 1, d: 1, p: 50, show: 0 }, draw: ctlChart, steps: [
  { cap: "Equilibrium at <b>price 50, quantity 50</b>.", s: { p: 50, show: 0 } },
  { cap: "A minimum price set <b>below</b> equilibrium, at 40, changes nothing. The market price is already above it.", s: { p: 40, show: 0 } },
  { cap: "Now set the minimum at <b>65</b>, above equilibrium. At 65 producers want to supply <b>65</b>, but consumers will only buy <b>35</b>.", s: { p: 65, show: 0 } },
  { cap: "That leaves a <b>surplus of 30</b>. To make the floor work, the government must buy the surplus, store it, or destroy or export it. All of this costs money.", s: { p: 65, show: 1 } },
] });

/* ---------- buffer stock ---------- */
const SHOCK = [0, 30, 10, -10, -40, -30, 20, 40]; // supply shift in units (b = d = 1)
function bufferRun(floor, ceil, stock0) {
  let st = stock0; const out = [];
  SHOCK.forEach((x, i) => {
    const mkt = 50 - x / 2; let price = mkt, buy = 0, out_ = false;
    if (mkt < floor) { buy = 2 * (floor - mkt); st += buy; price = floor; }
    else if (mkt > ceil) { const need = 2 * (mkt - ceil), sell = Math.min(need, st); st -= sell; price = mkt - sell / 2; out_ = sell < need - 0.01; }
    out.push({ mkt, price, st, out: out_ });
  });
  return out;
}
function bufChart(s, floor, ceil, stock0) {
  const run = bufferRun(floor, ceil, stock0), n = s.n, W = 600, X = (i) => 90 + (W * i) / 7, Y = (p) => 200 - (p - 20) * 3, YS = (q) => 385 - Math.min(q, 100) * 1.1;
  let o = SV.line(60, 20, 60, 210) + SV.line(60, 210, 700, 210) + SV.text(66, 18, "Price", "sm");
  o += `<rect x="60" y="${Y(ceil)}" width="640" height="${Y(floor) - Y(ceil)}" class="f1"/>`;
  o += SV.text(64, Y(ceil) - 4, "Ceiling " + ceil, "sm") + SV.text(64, Y(floor) + 13, "Floor " + floor, "sm");
  const pts = (k) => run.slice(0, Math.floor(n) + 1).map((r, i) => [X(i), Y(r[k])]);
  const part = (k) => { const a = pts(k); const fr = n - Math.floor(n); if (Math.floor(n) < 7 && fr > 0) { const r0 = run[Math.floor(n)][k], r1 = run[Math.floor(n) + 1][k]; a.push([X(Math.floor(n) + fr), Y(r0 + (r1 - r0) * fr)]); } return a; };
  o += SV.path(ptsPath(part("mkt")), "c2 dash") + SV.path(ptsPath(part("price")), "c1");
  run.forEach((r, i) => { if (i <= n) o += SV.text(X(i), 228, "Y" + (i + 1), "sm", { "text-anchor": "middle" }); });
  o += SV.text(560, 30, "Market price without scheme", "sm t2") + SV.text(560, 46, "Price with scheme", "sm t1");
  o += SV.line(60, 385, 700, 385) + SV.text(64, 262, "Stock held by the agency", "sm");
  run.forEach((r, i) => { if (i <= n) o += SV.rect(X(i) - 14, YS(r.st), 28, YS(0) - YS(r.st), r.out ? "f2" : "f4"); });
  run.forEach((r, i) => { if (i <= n) o += SV.text(X(i), Math.min(YS(r.st) - 4, 381), Lib.fmtN(r.st, 0) + (r.out ? " (ran out)" : ""), "sm", { "text-anchor": "middle" }); });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 400, label: "Buffer stock over eight harvests", base: { n: 0 }, tween: 1600, draw: (s) => bufChart(s, 40, 60, 20), dwell: 5200, steps: [
  { cap: "A government sets a <b>price band: floor 40, ceiling 60</b>. It starts with a stock of 20. Harvests vary, so without a scheme prices would swing between 30 and 70.", s: { n: 0 } },
  { cap: "<b>Years 1 to 3:</b> good harvests push the price down. In year 2 the price would fall to 35, below the floor, so the agency <b>buys</b> and the stock builds.", s: { n: 2 } },
  { cap: "<b>Years 4 to 6:</b> poor harvests. The price would rise above the ceiling (70 in year 5), so the agency <b>sells from stock</b> to hold the price down.", s: { n: 5 } },
  { cap: "<b>Years 7 and 8:</b> the harvests recover and the agency buys again. Prices stayed inside the band, but the stock fell to zero in year 6. <b>One more poor harvest and the ceiling would have been broken.</b> The scheme needs money, storage and enough stock.", s: { n: 7 } },
] });

/* ---------- Labs ---------- */
const fmtSteep = (v) => (v < 0.8 ? "flat (elastic)" : v > 1.4 ? "steep (inelastic)" : "medium");
function labT() {
  if (!$("#ta") || !$("#tb") || !$("#tc")) return;
  const t = +$("#ta").value, b = +$("#tb").value, d = +$("#tc").value, q = 50 - t / (b + d), pc = 50 + b * t / (b + d), pp = pc - t;
  $("#t1").textContent = Lib.fmtN(pc, 1); $("#t2").textContent = Lib.fmtN(pp, 1); $("#t3").textContent = Lib.fmtN(q, 1); $("#t4").textContent = Lib.fmtN(t * q, 0);
  const cs = t ? (pc - 50) / t * 100 : 0;
  $("#tv").textContent = t === 0 ? "Add a tax to see who pays." : `Consumers bear ${Lib.fmtN(cs, 0)}% of the tax and producers ${Lib.fmtN(100 - cs, 0)}%. ${b > d ? "Demand is steeper (less elastic), so consumers pay more." : b < d ? "Supply is steeper (less elastic), so producers pay more." : "Equal steepness, so the burden is shared equally."}`;
  $("#labT").innerHTML = taxChart({ b, d, t, inc: 1 });
}
Lib.slider($("#g1"), { id: "ta", label: "Tax per unit", min: 0, max: 40, step: 1, value: 20, fmt: (v) => v, onInput: labT });
Lib.slider($("#g2"), { id: "tb", label: "Demand steepness", min: 0.3, max: 3, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) + " " + fmtSteep(v), onInput: labT });
Lib.slider($("#g3"), { id: "tc", label: "Supply steepness", min: 0.3, max: 3, step: 0.1, value: 1, fmt: (v) => v.toFixed(1) + " " + fmtSteep(v), onInput: labT });

function labS() {
  const t = +$("#sa").value, q = 50 + t / 2, pc = 50 - t / 2;
  $("#s1").textContent = Lib.fmtN(pc, 1); $("#s2").textContent = Lib.fmtN(pc + t, 1); $("#s3").textContent = Lib.fmtN(q, 1); $("#s4").textContent = Lib.fmtN(t * q, 0);
  $("#labS").innerHTML = subChart({ b: 1, d: 1, t, inc: 1 });
}
Lib.slider($("#g4"), { id: "sa", label: "Subsidy per unit", min: 0, max: 40, step: 1, value: 20, fmt: (v) => v, onInput: labS });

function labP() {
  const p = +$("#pa").value, qd = 50 + (50 - p), qs = 50 - (50 - p);
  $("#p1").textContent = Lib.fmtN(Math.max(0, qd), 0); $("#p2").textContent = Lib.fmtN(Math.max(0, qs), 0);
  const gap = qd - qs;
  $("#p3l").textContent = gap > 0 ? "Shortage" : gap < 0 ? "Surplus" : "Balance"; $("#p3").textContent = Lib.fmtN(Math.abs(gap), 0);
  $("#pv").textContent = p < 49.5 ? `A maximum price of ${p} is below equilibrium: it binds and creates a shortage.` : p > 50.5 ? `A minimum price of ${p} is above equilibrium: it binds and creates a surplus. Buying it would cost about ${Lib.fmtN(p * Math.abs(gap), 0)}.` : "At the equilibrium price there is no shortage or surplus.";
  $("#labP").innerHTML = ctlChart({ b: 1, d: 1, p, show: 1 });
}
Lib.slider($("#g5"), { id: "pa", label: "Control price", min: 20, max: 80, step: 1, value: 35, fmt: (v) => (v < 50 ? "max " : v > 50 ? "min " : "") + v, onInput: labP });

function labB() {
  if (!$("#bb") || !$("#bc")) return;
  const floor = +$("#ba").value, ceil = +$("#bb").value, st = +$("#bc").value;
  const run = bufferRun(floor, ceil, st), mk = run.map((r) => r.mkt), pr = run.map((r) => r.price);
  $("#b1").textContent = Math.min(...mk) + " to " + Math.max(...mk); $("#b2").textContent = Lib.fmtN(Math.min(...pr), 0) + " to " + Lib.fmtN(Math.max(...pr), 0);
  $("#b3").textContent = Lib.fmtN(run[7].st, 0);
  const out = run.some((r) => r.out);
  $("#bv").textContent = floor >= ceil ? "The floor must be below the ceiling." : out ? "The stock ran out: the price broke through the ceiling in some years. A bigger starting stock or a wider band would help." : run[7].st > 120 ? "The stock keeps growing. That means high storage cost: a lower floor would help." : "Prices stay in the band and the stock is enough. Notice the cost of holding it.";
  $("#labB").innerHTML = bufChart({ n: 7 }, floor, ceil, st);
}
Lib.slider($("#g6"), { id: "ba", label: "Floor price", min: 30, max: 50, step: 1, value: 40, fmt: (v) => v, onInput: labB });
Lib.slider($("#g7"), { id: "bb", label: "Ceiling price", min: 50, max: 70, step: 1, value: 60, fmt: (v) => v, onInput: labB });
Lib.slider($("#g8"), { id: "bc", label: "Starting stock", min: 0, max: 100, step: 5, value: 20, fmt: (v) => v, onInput: labB });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Which intervention does each feature describe?",
  buckets: [{ label: "Indirect tax" }, { label: "Subsidy" }, { label: "Direct provision" }, { label: "Information" }],
  items: [
    { text: "Shifts supply up and raises the price consumers pay", b: 0 }, { text: "Shifts supply down and lowers market price", b: 1 },
    { text: "Free at the point of use, paid for from taxation", b: 2 }, { text: "Health warnings on packets", b: 3 },
    { text: "Revenue = tax per unit × quantity sold", b: 0 }, { text: "Cost to government = amount per unit × quantity", b: 1 },
    { text: "Used for public goods the market will not supply", b: 2 }, { text: "Labels and campaigns correct information gaps", b: 3 },
    { text: "Can be regressive for low-income households", b: 0 }, { text: "May keep inefficient firms in business", b: 1 },
  ], done: "Each method has a distinct mechanism and a distinct cost.",
});
Lib.classify($("#cl2"), {
  prompt: "Maximum price, minimum price, or both?",
  buckets: [{ label: "Maximum price (ceiling)" }, { label: "Minimum price (floor)" }],
  items: [
    { text: "Set below the equilibrium price", b: 0 }, { text: "Set above the equilibrium price", b: 1 },
    { text: "Creates a shortage", b: 0 }, { text: "Creates a surplus", b: 1 },
    { text: "Black markets are likely", b: 0 }, { text: "Government may need to buy and store the excess", b: 1 },
    { text: "Rent controls", b: 0 }, { text: "Agricultural price support", b: 1 },
    { text: "Queues and rationing", b: 0 }, { text: "Consumers face higher prices", b: 1 },
  ], done: "Remember: the direction of the control decides whether you get a shortage or a surplus.",
});
Lib.order($("#o1"), { prompt: "Order the steps for an exam diagram of a specific indirect tax.", items: [
  "Draw axes labelled Price and Quantity, then D and S₁ with their equilibrium (P₁, Q₁)",
  "Shift the supply curve up by the amount of the tax to S₂",
  "Mark the new equilibrium (P₂, Q₂) where S₂ meets D",
  "Read the price paid by consumers at P₂",
  "Read the price received by producers: P₂ minus the tax per unit",
  "Shade the tax revenue: tax per unit × Q₂, and split it into consumer and producer shares",
], done: "A full-marks diagram routine." });
Lib.calc($("#c1"), { qs: [
  { q: "A $4 per unit tax raises the price paid by consumers from $20 to $23 and cuts quantity from 100 to 90. How much of the tax per unit do consumers pay ($)?", a: 3, sol: "Consumers pay $23 − $20 = <b>$3</b> more per unit." },
  { q: "Using the same figures, how much of the tax per unit is paid by producers ($)?", a: 1, sol: "$4 − $3 = <b>$1</b> per unit." },
  { q: "Using the same figures, calculate government tax revenue ($).", a: 360, hint: "Use the quantity sold after the tax.", sol: "$4 × 90 = <b>$360</b>." },
  { q: "A government gives a $2 per unit subsidy. The market price falls from $20 to $18.50 and quantity rises from 100 to 110. Calculate the cost to the government ($).", a: 220, sol: "$2 × 110 = <b>$220</b>." },
  { q: "A maximum price of $40 is set where the equilibrium is $50. At $40 quantity demanded is 60 and quantity supplied is 40. Calculate the shortage (units).", a: 20, sol: "60 − 40 = <b>20 units</b>." },
  { q: "A minimum price of $12 is set. At this price quantity supplied is 120 and quantity demanded is 90. The government buys the surplus. Calculate the cost ($).", a: 360, hint: "Surplus first, then multiply by the guaranteed price.", sol: "Surplus = 120 − 90 = 30. Cost = 30 × $12 = <b>$360</b>." },
] });
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Specific tax", "A fixed amount of tax on each unit sold"],
  ["Tax incidence", "How a tax burden is shared between consumers and producers"],
  ["Subsidy", "A payment by government to lower the cost of supply"],
  ["Shortage", "Quantity demanded exceeds quantity supplied"],
  ["Surplus", "Quantity supplied exceeds quantity demanded"],
  ["Buffer stock", "A store used to stabilise prices by buying and selling a commodity"],
  ["Merit good", "A good the market tends to under-supply, such as education"],
], done: "Good vocabulary scores marks." });
Lib.quiz($("#qz1"), { qs: [
  { q: "A specific indirect tax on a good will:", opts: ["Shift demand to the left", "Shift supply upwards", "Shift supply to the right", "Fix the price below equilibrium"], a: 1, why: "A tax raises costs, so supply shifts up (left)." },
  { q: "The burden of an indirect tax falls mainly on consumers when:", opts: ["Demand is elastic", "Demand is inelastic", "Supply is perfectly elastic", "The tax is small"], a: 1, why: "If consumers have few alternatives (inelastic demand) the price rises by nearly the whole tax." },
  { q: "A maximum price will only cause a shortage if it is set:", opts: ["Above equilibrium", "At equilibrium", "Below equilibrium", "At any level"], a: 2, why: "A ceiling above equilibrium is not binding." },
  { q: "Which is a likely consequence of a binding minimum price?", opts: ["Shortage", "Surplus", "Lower consumer prices", "Higher demand"], a: 1, why: "Price above equilibrium: supply exceeds demand." },
  { q: "A subsidy of $5 per unit is paid on 1,000 units. The cost to the government is:", opts: ["$200", "$1,005", "$5,000", "$995"], a: 2, why: "$5 × 1,000 units = $5,000." },
  { q: "Public goods are provided directly by government mainly because:", opts: ["They are rival", "Private firms cannot charge for them", "They are demerit goods", "They have elastic demand"], a: 1, why: "Public goods are non-excludable, so free riders prevent profitable private supply." },
  { q: "Which is a disadvantage of information provision?", opts: ["Very costly", "Effects may be slow and uncertain", "Raises prices", "Creates a surplus"], a: 1, why: "It is cheap but may be ignored and is hard to measure." },
  { q: "A buffer stock scheme may fail if:", opts: ["Prices stay in the band", "The stock runs out in a run of poor harvests", "Supply is stable", "Demand is elastic"], a: 1, why: "Without stock to sell, the agency cannot hold the price down." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Indirect tax", "A tax on spending, collected from a seller but paid partly by the buyer through higher prices."],
  ["Specific tax", "A fixed amount of tax per unit sold."],
  ["Tax incidence", "The way a tax burden is divided between consumers and producers."],
  ["Subsidy", "A payment from government that lowers producers' costs or consumers' prices."],
  ["Direct provision", "Government providing a good or service itself, often free at the point of use."],
  ["Public good", "A good that is non-excludable and non-rival, so the market will not supply it."],
  ["Merit good", "A good that is under-consumed in a free market and that society values highly."],
  ["Maximum price", "A legal ceiling on price. Binding only below equilibrium: creates a shortage."],
  ["Minimum price", "A legal floor on price. Binding only above equilibrium: creates a surplus."],
  ["Shortage", "Quantity demanded is greater than quantity supplied at the prevailing price."],
  ["Surplus", "Quantity supplied is greater than quantity demanded at the prevailing price."],
  ["Buffer stock", "A scheme in which an agency buys a commodity when the price is low and sells when it is high."],
  ["Black market", "Illegal trade at prices above a legal maximum."],
  ["Rationing", "Allocating limited supply by a method other than price, such as queues or quotas."],
  ["Regressive tax", "A tax that takes a larger proportion of income from low-income households."],
  ["Opportunity cost", "The next best alternative given up when funds are used for one purpose."],
] });
labT(); labS(); labP(); labB();
