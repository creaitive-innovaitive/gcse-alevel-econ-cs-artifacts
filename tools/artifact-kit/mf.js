/* Market: D P = 90 - Q, S P = 10 + Q, equilibrium (40, 50). Plot: Q 0..100, P 0..100. */
const QX = (q) => 80 + 6 * q, PY = (p) => 360 - 3 * p;
function seg(m, c) {
  let lo = 0, hi = 100;
  if (m !== 0) { const a = (0 - c) / m, z = (100 - c) / m; lo = Math.max(lo, Math.min(a, z)); hi = Math.min(hi, Math.max(a, z)); }
  return [lo, m * lo + c, hi, m * hi + c];
}
function ln(m, c, cls, label, lcls, extra, atStart) {
  const [q1, p1, q2, p2] = seg(m, c); if (q2 <= q1) return "";
  let s = SV.line(QX(q1), PY(p1), QX(q2), PY(p2), cls, extra);
  if (label && atStart) s += SV.text(QX(q1) + 10, PY(p1) - 8, label, "lbl bd " + lcls, { "text-anchor": "start" });
  else if (label) s += SV.text(QX(q2) + 6, PY(p2) + 4, label, "lbl bd " + lcls, { "text-anchor": "start" });
  return s;
}
const axes = () => SV.line(QX(0), PY(100), QX(0), PY(0)) + SV.line(QX(0), PY(0), QX(104), PY(0)) + SV.text(QX(0) + 6, PY(100) + 6, "Price", "sm") + SV.text(QX(104), PY(0) + 22, "Quantity", "sm", { "text-anchor": "end" });
const ylab = (p, t) => SV.text(QX(0) - 8, PY(p) + 4, t, "sm", { "text-anchor": "end" });
const xlab = (q, t) => SV.text(QX(q), PY(0) + 18, t, "sm", { "text-anchor": "middle" });
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/* ---------- merit / demerit chart ---------- */
function goodChart(e, mode, g) {
  const merit = mode === "merit", qs = merit ? 40 + e / 2 : 40 - e / 2, ps = merit ? 50 + e / 2 : 50 - e / 2;
  let o = axes();
  if (e > 0.5 && g > 0) {
    const lo = Math.min(40, qs), hi = Math.max(40, qs);
    o += `<rect x="${QX(lo)}" y="${PY(0) - 16}" width="${QX(hi) - QX(lo)}" height="16" class="${merit ? "f3" : "f2"}" opacity="${g}"/>`;
    o += SV.text((QX(lo) + QX(hi)) / 2, PY(0) + 38, (merit ? "Under-consumption = " : "Over-consumption = ") + Lib.fmtN(Math.abs(qs - 40), 1), "lbl bd " + (merit ? "t3" : "t2"), { "text-anchor": "middle", opacity: g });
  }
  o += ln(-1, 90, "c1", "D (private)", "t1", undefined, true) + ln(1, 10, "c3", "S", "t3");
  if (e > 0.5) o += ln(-1, merit ? 90 + e : 90 - e, "c2 dash", merit ? "Social benefit" : "Social value", "t2", undefined, true);
  o += SV.line(QX(0), PY(50), QX(40), PY(50), "gr") + SV.line(QX(40), PY(50), QX(40), PY(0), "gr") + SV.circle(QX(40), PY(50), 6, "dot1") + ylab(50, "50") + xlab(40, "Qm = 40");
  if (e > 0.5) o += SV.line(QX(qs), PY(ps), QX(qs), PY(0), "gr") + SV.circle(QX(qs), PY(ps), 6, "dot2") + xlab(qs, "Qs = " + Lib.fmtN(qs, 1));
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 410, label: "Merit good: under-consumption", base: { e: 0, g: 0 }, tween: 1300, draw: (s) => goodChart(s.e, "merit", s.g), steps: [
  { cap: "The free market for <b>healthcare</b>: private demand D meets supply S at <b>Qm = 40</b>. Only those who can afford it receive care.", s: { e: 0, g: 0 } },
  { cap: "But consumers do not fully realise how valuable healthcare is (<b>information failure</b>) and others gain too. The <b>true social benefit</b> curve lies above private demand.", s: { e: 20, g: 0 } },
  { cap: "Society would want <b>Qs = 50</b>. The market provides only 40, so <b>10 units are under-consumed</b>. This is the market failure.", s: { e: 20, g: 1 } },
  { cap: "To correct it, the government can <b>provide healthcare itself</b>, fund the gap for those who cannot pay, or subsidise it. These methods are covered in Chapter 13.", s: { e: 20, g: 1 } },
] });
Lib.stepper($("#stC"), { w: 760, h: 410, label: "Demerit good: over-consumption", base: { e: 0, g: 0 }, tween: 1300, draw: (s) => goodChart(s.e, "demerit", s.g), steps: [
  { cap: "The free market for <b>cigarettes</b>: private demand D meets supply S at <b>Qm = 40</b>.", s: { e: 0, g: 0 } },
  { cap: "Consumers <b>lack full information</b> about, or underestimate, the harm, and the product is addictive. The <b>true social value</b> is lower than private demand shows.", s: { e: 20, g: 0 } },
  { cap: "Society would want only <b>Qs = 30</b>. The market provides 40, so <b>10 units are over-consumed</b>.", s: { e: 20, g: 1 } },
  { cap: "Governments respond with <b>information</b> (warnings), <b>regulation</b> (smoking bans) and taxes, aiming to protect health, productivity and the healthcare budget.", s: { e: 20, g: 1 } },
] });

/* ---------- free rider ---------- */
function riders(s) {
  let o = "";
  for (let i = 0; i < 10; i++) {
    const x = 60 + i * 64, free = s.f > 0.5;
    o += SV.circle(x, 70, 17, free ? "dot4" : "dot1", { opacity: 0.9 }) + SV.text(x, 75, "$5", "lbl bd", { "text-anchor": "middle", style: "fill:#fff" });
    o += SV.text(x, 108, free ? "won't pay" : "values it", "sm", { "text-anchor": "middle" });
  }
  o += SV.text(380, 22, "Ten residents who would use street lighting", "lbl bd", { "text-anchor": "middle" });
  const base = 380, k = 3, bar = (x, v, cls, lab, op, sub) => SV.rect(x, base - v * k, 100, v * k, cls, { opacity: op * 0.7 }) + SV.text(x + 50, base - v * k - 8, "$" + Lib.fmtN(v, 0), "lbl bd", { "text-anchor": "middle", opacity: op }) + SV.text(x + 50, base + 18, lab, "sm", { "text-anchor": "middle", opacity: op });
  o += SV.line(60, base, 700, base, "ax");
  o += bar(80, 50, "f3", "Total benefit", clamp01(s.b)) + bar(240, 20, "f2", "Cost to provide", clamp01(s.b));
  o += bar(400, 0, "f4", "Private revenue", clamp01(s.r)) + (s.r > 0.5 ? SV.text(450, base - 40, "no payers", "sm", { "text-anchor": "middle", opacity: clamp01(s.r) }) : "");
  o += bar(560, 20 * clamp01(s.t), "f1", "Tax revenue", clamp01(s.t));
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 420, label: "The free rider problem with street lighting", base: { f: 0, b: 0, r: 0, t: 0 }, tween: 900, dwell: 5200, draw: riders, steps: [
  { cap: "Ten residents each value street lighting at <b>$5</b>, a total benefit of <b>$50</b>. It costs <b>$20</b> to provide. It is clearly worth providing.", s: { b: 1 } },
  { cap: "But it is <b>non-excludable</b> (nobody can be stopped from using it) and <b>non-rival</b>. Each resident thinks: <b>\"the light will be there anyway, so why pay?\"</b> That is the <b>free rider</b> problem.", s: { b: 1, f: 1 } },
  { cap: "A private firm cannot charge, so its <b>revenue is $0</b> against a cost of $20. It makes a loss, so it <b>will not supply</b>, even though society would gain $30.", s: { b: 1, f: 1, r: 1 } },
  { cap: "The <b>government</b> provides it, funded by <b>tax</b>: $2 from each resident covers the $20 cost. Society gains a net $30. The opportunity cost is spending forgone elsewhere.", s: { b: 1, f: 1, r: 1, t: 1 } },
] });

/* ---------- price controls chart ---------- */
function ctl(p, show) {
  const max = p < 50, qd = 90 - p, qs = p - 10;
  let o = axes();
  if (Math.abs(p - 50) > 0.5 && show > 0) {
    const lo = Math.min(qd, qs), hi = Math.max(qd, qs);
    o += `<rect x="${QX(lo)}" y="${PY(p) - 10}" width="${QX(hi) - QX(lo)}" height="20" class="${max ? "f2" : "f3"}" opacity="${show * 0.9}"/>`;
    o += SV.text((QX(lo) + QX(hi)) / 2, PY(p) + (max ? 34 : -18), (max ? "Shortage = " : "Surplus = ") + Lib.fmtN(Math.abs(qd - qs), 0), "lbl bd " + (max ? "t2" : "t3"), { "text-anchor": "middle", opacity: show });
  }
  o += ln(-1, 90, "c1", "D", "t1") + ln(1, 10, "c3", "S", "t3");
  o += SV.circle(QX(40), PY(50), 6, "dot1") + SV.line(QX(0), PY(50), QX(40), PY(50), "gr") + SV.line(QX(40), PY(50), QX(40), PY(0), "gr") + ylab(50, "50") + xlab(40, "40");
  o += SV.line(QX(0), PY(p), QX(100), PY(p), "c2 dash") + SV.text(QX(100) - 4, PY(p) - 8, Math.abs(p - 50) < 0.5 ? "" : (max ? "Maximum price = " : "Minimum price = ") + Lib.fmtN(p, 0), "lbl bd t2", { "text-anchor": "end" });
  if (Math.abs(p - 50) > 0.5) o += SV.circle(QX(qd), PY(p), 5, "dot1") + SV.circle(QX(qs), PY(p), 5, "dot3");
  return o;
}
Lib.stepper($("#stD"), { w: 760, h: 400, label: "Why governments set maximum and minimum prices", base: { p: 50, show: 0 }, draw: (s) => ctl(s.p, s.show), steps: [
  { cap: "The market clears at <b>price 50, quantity 40</b>.", s: { p: 50, show: 0 } },
  { cap: "<b>Reason for a maximum price (rent controls, bread):</b> the equilibrium price is too high for low-income households or key workers. The government sets a ceiling <b>below</b> equilibrium, at 35.", s: { p: 35, show: 0 } },
  { cap: "The side effect: demand 55, supply 25: a <b>shortage of 30</b>. The policy helps those who get the good, but others go without.", s: { p: 35, show: 1 } },
  { cap: "<b>Reason for a minimum price (farm crops):</b> farmers' incomes are unstable and food supply matters, so the government sets a floor <b>above</b> equilibrium, at 65.", s: { p: 65, show: 0 } },
  { cap: "The side effect: supply 55, demand 25: a <b>surplus of 30</b>. Consumers pay more and the government may have to buy the surplus. These problems are explored in Chapter 13.", s: { p: 65, show: 1 } },
] });

/* ---------- Lab 1 ---------- */
let mode = "merit";
function lab1() {
  if (!$("#la")) return;
  const e = +$("#la").value, merit = mode === "merit", qs = merit ? 40 + e / 2 : 40 - e / 2;
  $("#a1").textContent = "40"; $("#a2").textContent = Lib.fmtN(qs, 1); $("#a3l").textContent = merit ? "Under-consumption" : "Over-consumption"; $("#a3").textContent = Lib.fmtN(Math.abs(qs - 40), 1);
  $("#av").textContent = e === 0 ? "No misjudgement: the free market gets it right." : merit ? "Consumers undervalue the benefit, so the free market under-provides. A bigger information gap means a bigger gap." : "Consumers underestimate the harm, so the free market over-provides. A bigger information gap means a bigger gap.";
  $("#lab1").innerHTML = goodChart(e, mode, 1);
}
Lib.slider($("#g1"), { id: "la", label: "Size of the misjudgement", min: 0, max: 40, step: 1, value: 20, fmt: (v) => v, onInput: lab1 });
$("#bm").onclick = () => { mode = "merit"; $("#bm").classList.add("pri"); $("#bd").classList.remove("pri"); lab1(); };
$("#bd").onclick = () => { mode = "demerit"; $("#bd").classList.add("pri"); $("#bm").classList.remove("pri"); lab1(); };

/* ---------- Lab 2 ---------- */
let excl = false;
function lab2() {
  if (!$("#lb") || !$("#lc") || !$("#ld")) return;
  const n = +$("#lb").value, v = +$("#lc").value, cost = +$("#ld").value, ben = n * v, rev = excl ? ben : 0;
  $("#b1").textContent = "$" + ben; $("#b2").textContent = "$" + cost; $("#b3").textContent = "$" + rev; $("#b4").textContent = "$" + Lib.fmtN(cost / n, 2);
  const worth = ben > cost;
  $("#bv").textContent = excl ? (worth ? "People can be excluded, so a firm can charge each user up to their value and the market can supply it at a profit." : "Even with charging, benefits do not cover the cost: it should not be provided.")
    : (worth ? `Non-excludable: free riders mean the firm collects nothing, so the market will not supply it. It is worth providing (net benefit $${ben - cost}), so the government should fund it from tax.` : "Not worth providing: the cost is more than the total benefit, so neither the market nor the government should supply it.");
}
Lib.slider($("#g2"), { id: "lb", label: "Number of users", min: 2, max: 50, step: 1, value: 10, fmt: (v) => v, onInput: lab2 });
Lib.slider($("#g3"), { id: "lc", label: "Value to each user ($)", min: 1, max: 20, step: 1, value: 5, fmt: (v) => "$" + v, onInput: lab2 });
Lib.slider($("#g4"), { id: "ld", label: "Cost of providing ($)", min: 10, max: 300, step: 5, value: 20, fmt: (v) => "$" + v, onInput: lab2 });
$("#ex1").onclick = () => { excl = false; $("#ex1").classList.add("pri"); $("#ex2").classList.remove("pri"); lab2(); };
$("#ex2").onclick = () => { excl = true; $("#ex2").classList.add("pri"); $("#ex1").classList.remove("pri"); lab2(); };

/* ---------- Lab 3 ---------- */
Lib.slider($("#g5"), { id: "le", label: "Control price", min: 20, max: 80, step: 1, value: 35, fmt: (v) => (v < 50 ? "max " : v > 50 ? "min " : "") + v, onInput: (p) => {
  const qd = 90 - p, qs = p - 10, gap = qd - qs;
  $("#c1").textContent = qd; $("#c2").textContent = qs; $("#c3l").textContent = gap > 0 ? "Shortage" : gap < 0 ? "Surplus" : "Balance"; $("#c3").textContent = Math.abs(gap);
  $("#cv").textContent = p < 49.5 ? `A maximum price of ${p}: below equilibrium, so it bites. Aim: affordability for low-income households or key workers. Result: a shortage.` : p > 50.5 ? `A minimum price of ${p}: above equilibrium, so it bites. Aim: stable, higher farm incomes and food security. Result: a surplus.` : "At the equilibrium price a control has no effect.";
  $("#lab3").innerHTML = ctl(p, 1);
} });
lab2();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Place each item in the right category.",
  buckets: [{ label: "Public good" }, { label: "Merit good" }, { label: "Demerit good" }, { label: "Private good" }],
  items: [
    { text: "Street lighting", b: 0 }, { text: "National defence", b: 0 }, { text: "A lighthouse", b: 0 },
    { text: "Secondary education", b: 1 }, { text: "A vaccination programme", b: 1 }, { text: "Healthcare", b: 1 },
    { text: "Cigarettes", b: 2 }, { text: "Harmful drugs", b: 2 }, { text: "A restaurant meal", b: 3 }, { text: "A pair of trainers", b: 3 },
  ], done: "Public goods are non-excludable and non-rival; merit and demerit goods turn on information failure.",
});
Lib.classify($("#cl2"), {
  prompt: "Which reason for intervention does each statement give?",
  buckets: [{ label: "Public goods" }, { label: "Merit goods" }, { label: "Demerit goods" }, { label: "Price controls" }],
  items: [
    { text: "Free riders cannot be stopped from using it", b: 0 }, { text: "No private firm can earn a profit from providing it", b: 0 },
    { text: "Consumers do not realise the full benefit, so too little is bought", b: 1 }, { text: "Access limited to those who can afford the fees", b: 1 },
    { text: "Consumers underestimate the harm, so too much is bought", b: 2 }, { text: "Protects health and saves on healthcare spending", b: 2 },
    { text: "Makes bread affordable for low-income households", b: 3 }, { text: "Stabilises farmers' incomes and secures food supplies", b: 3 },
  ], done: "Each reason links to a specific market failure.",
});
Lib.order($("#o1"), { prompt: "Order the argument for government provision of a public good.", items: [
  "Public goods are non-excludable and non-rival",
  "Nobody can be stopped from using them, so people become free riders",
  "A private firm cannot charge for the good, so it cannot earn revenue",
  "It makes no profit, so the private sector will not supply it",
  "Society would still benefit more than the cost, so the market has failed",
  "The government provides it, funded from taxation, accepting the opportunity cost",
], done: "A tidy chain of reasoning." });
Lib.calc($("#c1x"), { qs: [
  { q: "Ten residents each value street lighting at $5. It costs $20 to provide. What is the net benefit to society ($)?", a: 30, sol: "Total benefit = 10 × 5 = $50. Net benefit = 50 − 20 = <b>$30</b>." },
  { q: "If the government funds the $20 cost equally from the ten residents through tax, how much does each pay ($)?", a: 2, sol: "20 ÷ 10 = <b>$2</b> each." },
  { q: "The free market provides 40 units of a merit good. The socially desirable quantity is 50. How many units are under-consumed?", a: 10, sol: "50 − 40 = <b>10 units</b>." },
  { q: "Demand is P = 90 − Q and supply is P = 10 + Q. A maximum price of $35 is set. Quantity demanded is 55 and quantity supplied 25. What is the shortage?", a: 30, sol: "55 − 25 = <b>30</b>." },
  { q: "A minimum price of $65 is set in the same market. Quantity supplied is 55 and quantity demanded is 25. What is the surplus?", a: 30, sol: "55 − 25 = <b>30</b>." },
  { q: "The government buys the whole surplus of 30 units at the minimum price of $65. What does it cost ($)?", a: 1950, sol: "30 × 65 = <b>$1,950</b>." },
] });
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Market failure", "An inefficient allocation of resources by the market"],
  ["Public good", "Non-excludable and non-rival, so not supplied by the market"],
  ["Free rider", "Someone who benefits without paying"],
  ["Merit good", "More beneficial than consumers realise; under-consumed"],
  ["Demerit good", "Harmful, but over-consumed in a free market"],
  ["Information failure", "Consumers lack the information to make informed choices"],
  ["Price ceiling", "A legal maximum price"],
], done: "Strong foundations." });
Lib.quiz($("#qz1"), { qs: [
  { q: "Why do governments provide public goods?", opts: ["They are needed by the public", "The private sector does not find it profitable to provide them", "Poor families use them most", "The government has a fixed budget for them"], a: 1, why: "Free riders mean firms cannot charge, so they cannot make a profit." },
  { q: "Healthcare is often provided by government because:", opts: ["No firm will provide it", "It is a merit good and tends to be under-provided", "It is a public good", "It is a demerit good"], a: 1, why: "Information failure and unequal access mean the free market under-provides it." },
  { q: "A government sets a maximum price for bread. The most likely reason is:", opts: ["Too much bread is consumed", "To support low-income families", "To reduce non-market transactions", "To raise farmers' incomes"], a: 1, why: "Ceilings aim to protect those on low incomes." },
  { q: "Minimum prices for farm products are set to:", opts: ["Reduce demand", "Stabilise farmers' incomes", "Make farmers produce as little as possible", "Lower prices to consumers"], a: 1, why: "Farm incomes are unpredictable because supply is." },
  { q: "Governments restrict demerit goods because:", opts: ["They are costly to make", "Consumers lack information on the effects of consumption", "Consumers are always irresponsible", "They are imported"], a: 1, why: "Information failure leads to over-consumption." },
  { q: "A characteristic of a public good is that it is:", opts: ["Rival and excludable", "Non-excludable and non-rival", "Always provided privately", "Free of cost"], a: 1, why: "Both characteristics are needed." },
  { q: "For a maximum price to affect the market it must be set:", opts: ["Above equilibrium", "At equilibrium", "Below equilibrium", "At any level"], a: 2, why: "A ceiling above equilibrium is not binding." },
  { q: "The free rider problem means:", opts: ["Goods are free", "People can benefit without paying", "Producers pay too much tax", "Taxes are lower"], a: 1, why: "Because people can benefit without paying, firms cannot earn revenue." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Market failure", "An inefficient allocation of resources because the price mechanism ignores some costs or benefits."],
  ["Public good", "A good that is non-excludable and non-rival."],
  ["Non-excludable", "People cannot be prevented from using the good once it is provided."],
  ["Non-rival", "One person's use does not reduce the amount available to others."],
  ["Free rider", "Someone who enjoys a good without contributing to its cost."],
  ["Merit good", "A good that is more beneficial than consumers realise, so under-consumed."],
  ["Demerit good", "A good that is harmful but over-consumed in a free market."],
  ["Information failure", "When consumers lack the information to decide well."],
  ["Direct provision", "The government supplying a good or service itself."],
  ["Maximum price", "A legal price ceiling; binding only below equilibrium."],
  ["Minimum price", "A legal price floor; binding only above equilibrium."],
  ["Rent control", "A maximum price for rented housing."],
  ["Opportunity cost", "The next best alternative forgone when funds are used for one purpose."],
  ["Positive externality", "A benefit to a third party that is not reflected in the price."],
  ["Tax base", "The incomes and spending a government can tax."],
] });
lab1(); lab2();
