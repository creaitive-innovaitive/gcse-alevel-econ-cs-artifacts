/* Supply through (50,50): P = 50 + (Q-50)/e. Demand: P = 100 - Q (shifted by d). */
const QX = (q) => 80 + 6 * q, PY = (p) => 360 - 2.7 * p;
function seg(m, c) { // clip P = mQ + c to the plot
  let lo = 0, hi = 100;
  if (m !== 0) { const a = (0 - c) / m, z = (120 - c) / m; lo = Math.max(lo, Math.min(a, z)); hi = Math.min(hi, Math.max(a, z)); }
  return [lo, m * lo + c, hi, m * hi + c];
}
function line(m, c, cls, label, lcls = "t1", extra) {
  const [q1, p1, q2, p2] = seg(m, c); if (q2 <= q1) return "";
  let s = SV.line(QX(q1), PY(p1), QX(q2), PY(p2), cls, extra);
  if (label) s += SV.text(QX(q2) + 6, PY(p2) + 4, label, "lbl bd " + lcls, { "text-anchor": "start" });
  return s;
}
const supply = (e, cls, label, lcls, extra) => e < 0.04 ? SV.line(QX(50), PY(0), QX(50), PY(120), cls, extra) + (label ? SV.text(QX(50) + 6, PY(116), label, "lbl bd " + lcls, { "text-anchor": "start" }) : "") : line(1 / e, 50 - 50 / e, cls, label, lcls, extra);
const axes = () => SV.line(QX(0), PY(120), QX(0), PY(0)) + SV.line(QX(0), PY(0), QX(104), PY(0)) + SV.text(QX(0) + 6, PY(120) + 6, "Price", "sm") + SV.text(QX(104), PY(0) + 22, "Quantity", "sm", { "text-anchor": "end" });
const ylab = (p, t) => SV.text(QX(0) - 8, PY(p) + 4, t, "sm", { "text-anchor": "end" });
const xlab = (q, t) => SV.text(QX(q), PY(0) + 18, t, "sm", { "text-anchor": "middle" });
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/* ---------- 1. three supply curves ---------- */
function threeChart(s) {
  let o = axes();
  o += supply(0.4, "c2", "", "t2") + supply(1, "c1", "", "t1") + supply(2.5, "c3", "", "t3");
  o += SV.text(QX(80), PY(117), "Inelastic: PES = 0.4", "lbl bd t2", { "text-anchor": "start" });
  o += SV.text(QX(99), PY(104), "Unitary: PES = 1", "lbl bd t1", { "text-anchor": "end" });
  o += SV.text(QX(99), PY(73), "Elastic: PES = 2.5", "lbl bd t3", { "text-anchor": "end" });
  o += SV.circle(QX(50), PY(50), 6, "dot1") + ylab(50, "P = 50") + SV.text(QX(50) - 8, PY(0) + 18, "50", "sm", { "text-anchor": "end" });
  if (s.pr > 50.01) {
    o += SV.line(QX(0), PY(s.pr), QX(100), PY(s.pr), "gr") + ylab(s.pr, "P₁ = 55");
    [[0.4, "t2", "dot2", 18], [1, "t1", "dot1", 32], [2.5, "t3", "dot3", 18]].forEach(([e, t, d, dy]) => {
      const q = 50 * (1 + (e * (s.pr - 50)) / 50), op = clamp01(s.qs);
      o += SV.line(QX(q), PY(s.pr), QX(q), PY(0), "gr", { opacity: op }) + SV.circle(QX(q), PY(s.pr), 6, d, { opacity: op });
      o += SV.text(QX(q), PY(0) + dy, Lib.fmtN(q, 1), "sm bd " + t, { "text-anchor": "middle", opacity: op });
    });
  }
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 400, label: "Elastic, unitary and inelastic supply curves", base: { pr: 50, qs: 0 }, draw: threeChart, steps: [
  { cap: "Three supply curves all pass through <b>price 50, quantity 50</b> (the black dot). The <b>steep</b> one is inelastic, the one through the <b>origin</b> has PES = 1, and the <b>shallow</b> one is elastic.", s: { pr: 50, qs: 0 } },
  { cap: "The price rises by <b>10%</b>, from 50 to 55. How much extra will producers supply?", s: { pr: 55, qs: 0 } },
  { cap: "<b>Inelastic (0.4):</b> quantity rises only 4% (to 52). <b>Unitary (1):</b> quantity rises 10% (to 55). <b>Elastic (2.5):</b> quantity rises 25% (to 62.5). PES × %ΔP = %ΔQs.", s: { pr: 55, qs: 1 } },
  { cap: "<b>Remember:</b> a straight line through the origin has PES = 1 at every point, however steep. A line cutting the price axis is elastic. A line cutting the quantity axis is inelastic.", s: { pr: 55, qs: 1 } },
] });

/* ---------- 2. time period ---------- */
function eqPoint(e, d) { const a = 100 + d; // demand P = a - Q ; supply P = 50 + (Q-50)/e
  const Q = (a - 50 + 50 / e) / (1 + 1 / e); return [Q, a - Q]; }
function timeChart(s) {
  const e = s.e, d = s.d, [q, p] = eqPoint(e, d), [q0, p0] = eqPoint(e, 0);
  let o = axes();
  if (d > 0.5) o += line(-1, 100, "c1", "", "t1", { opacity: 0.35 }) + SV.text(QX(100) - 6, PY(0) - 10, "", "sm");
  o += line(-1, 100 + d, "c1", "D" + (d > 0.5 ? "₁" : ""), "t1") + supply(e, "c3", "S", "t3");
  o += SV.circle(QX(50), PY(50), 5, "dot4", { opacity: d > 0.5 ? 0.6 : 0 }) + (d > 0.5 ? ylab(50, "P₀ = 50") : "");
  o += SV.line(QX(0), PY(p), QX(q), PY(p), "gr") + SV.line(QX(q), PY(p), QX(q), PY(0), "gr") + SV.circle(QX(q), PY(p), 7, "dot2") + ylab(p, "P = " + Lib.fmtN(p, 1)) + xlab(q, "Q = " + Lib.fmtN(q, 1));
  o += SV.text(QX(70), PY(110), e < 0.8 ? "Short run: PES = " + Lib.fmtN(e, 1) : e > 1.5 ? "Long run: PES = " + Lib.fmtN(e, 1) : "Supply becoming more flexible: PES = " + Lib.fmtN(e, 1), "lbl bd", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 400, label: "Demand rises; short-run and long-run supply", base: { e: 0.3, d: 0 }, tween: 1800, draw: timeChart, steps: [
  { cap: "In the <b>short run</b>, firms have little spare capacity and cannot expand quickly: supply is <b>inelastic</b> (PES about 0.3). Equilibrium at price 50.", s: { e: 0.3, d: 0 } },
  { cap: "<b>Demand rises.</b> With inelastic supply, quantity can barely increase, so the <b>price jumps</b> to about 65.", s: { e: 0.3, d: 20 } },
  { cap: "Over time firms invest, hire and new firms enter. Supply becomes <b>more elastic</b> (PES about 2). The price <b>falls back</b> to about 57 and quantity rises further, to about 63.", s: { e: 2, d: 20 } },
] });

/* ---------- 3. farm price swings ---------- */
function farmChart(s) {
  const q = s.q, p = 150 - 2 * q;
  let o = axes();
  o += SV.rect(QX(0), PY(p), QX(q) - QX(0), PY(0) - PY(p), "f1");
  o += line(-2, 150, "c1", "D", "t1") + SV.line(QX(q), PY(0), QX(q), PY(120), "c3") + SV.text(QX(q) + 6, PY(114), "S (fixed harvest)", "lbl bd t3", { "text-anchor": "start" });
  o += SV.line(QX(0), PY(p), QX(q), PY(p), "gr") + SV.circle(QX(q), PY(p), 7, "dot2") + ylab(p, "P = " + Lib.fmtN(p, 0)) + xlab(q, "Q = " + Lib.fmtN(q, 0));
  o += SV.text(QX(q / 2), (PY(p) + PY(0)) / 2, "Revenue = " + Lib.fmtN(p * q, 0), "lbl bd t1", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 400, label: "A harvest changes and price swings", base: { q: 50 }, tween: 1400, draw: farmChart, steps: [
  { cap: "A normal harvest of <b>50</b> sells at a price of <b>50</b>. Revenue is price × quantity = <b>2,500</b>. Demand for food is <b>inelastic</b> (steep) and, for the season, supply is fixed.", s: { q: 50 } },
  { cap: "<b>Bumper harvest:</b> supply rises 12% to 56. Because demand is inelastic, price must fall by <b>24%</b> to 38 to sell it all. Revenue <b>falls</b> to about 2,128: farmers get less.", s: { q: 56 } },
  { cap: "<b>Poor harvest:</b> supply falls 12% to 44 and price rockets 24% to 62. Prices swing more than quantities. Farmers hit by bad weather who lose their crop still get less.", s: { q: 44 } },
  { cap: "<b>Result:</b> inelastic supply with inelastic demand means small changes in output cause big changes in price and in farmers' incomes. That is why governments intervene in farm markets.", s: { q: 50 } },
] });

/* ---------- Lab 1 ---------- */
function lab1() {
  if (!$("#la") || !$("#lb")) return;
  const pc = +$("#la").value, e = +$("#lb").value, dq = e * pc, p1 = 50 * (1 + pc / 100), q1 = 50 * (1 + dq / 100);
  $("#a1").textContent = (pc > 0 ? "+" : "") + pc + "%"; $("#a2").textContent = (dq > 0 ? "+" : "") + Lib.fmtN(dq, 1) + "%";
  const kind = e === 0 ? "perfectly inelastic" : e < 1 ? "inelastic" : e === 1 ? "unit elastic" : "elastic";
  $("#av").textContent = pc === 0 ? "Choose a price change." : `PES = ${e.toFixed(1)}: supply is ${kind}. A ${Math.abs(pc)}% price ${pc > 0 ? "rise" : "fall"} changes quantity supplied by ${Lib.fmtN(Math.abs(dq), 1)}%.`;
  let o = axes() + supply(e, "c3", "S", "t3") + SV.circle(QX(50), PY(50), 6, "dot1") + SV.circle(QX(Math.max(0, q1)), PY(p1), 7, "dot2");
  o += SV.line(QX(0), PY(p1), QX(Math.max(0, q1)), PY(p1), "gr") + SV.line(QX(Math.max(0, q1)), PY(p1), QX(Math.max(0, q1)), PY(0), "gr") + ylab(p1, Lib.fmtN(p1, 1)) + xlab(Math.max(0, q1), Lib.fmtN(Math.max(0, q1), 1)) + ylab(50, "50") + xlab(50, "50");
  $("#lab1").innerHTML = o;
}
Lib.slider($("#g1"), { id: "la", label: "Price change (%)", min: -30, max: 30, step: 1, value: 10, fmt: (v) => (v > 0 ? "+" : "") + v + "%", onInput: lab1 });
Lib.slider($("#g2"), { id: "lb", label: "PES", min: 0, max: 4, step: 0.1, value: 1.5, fmt: (v) => v.toFixed(1), onInput: lab1 });

/* ---------- Lab 2 ---------- */
Lib.slider($("#g3"), { id: "lc", label: "Intercept: where the line cuts the axis (price axis +, quantity axis −)", min: -40, max: 40, step: 1, value: 20, fmt: (v) => (v > 0 ? "price axis at " + v : v < 0 ? "quantity axis at " + Math.abs(v) : "origin"), onInput: (a) => {
  const m = (50 - a) / 50, e = 1 / m;
  $("#b1").textContent = Lib.fmtN(e, 2); $("#b2").textContent = a > 0 ? "Elastic (PES > 1)" : a < 0 ? "Inelastic (PES < 1)" : "Unitary (PES = 1)";
  $("#bv").textContent = a > 0 ? "The line cuts the price axis (a positive intercept), so supply is elastic at every point." : a < 0 ? "The line cuts the quantity axis, so supply is inelastic at every point." : "A line through the origin has PES = 1 at every point.";
  const [q1, p1, q2, p2] = seg(m, a);
  $("#lab2").innerHTML = axes() + SV.line(QX(q1), PY(p1), QX(q2), PY(p2), "c3") + SV.circle(QX(50), PY(50), 6, "dot2") + SV.circle(QX(0), PY(Math.max(0, a)), a > 0 ? 6 : 0, "dot1") + (a > 0 ? ylab(a, "a = " + a) : "") + (a < 0 ? SV.circle(QX(-a / m), PY(0), 6, "dot1") + xlab(-a / m, "cuts here") : "");
} });

/* ---------- Lab 3 ---------- */
function lab3() {
  if (!$("#ld") || !$("#le") || !$("#lf")) return;
  const d = +$("#ld").value, es = +$("#le").value, ed = +$("#lf").value, dp = d / (es + ed), dq = (d * es) / (es + ed);
  $("#u1").textContent = "+" + Lib.fmtN(dp, 1) + "%"; $("#u2").textContent = "+" + Lib.fmtN(dq, 1) + "%";
  $("#uv").textContent = es < 0.3 ? "Supply is nearly fixed, so almost all of the rise in demand is taken up in a higher price." : es > 2.5 ? "Supply is very elastic, so most of the rise in demand is met by extra output and price changes little." : "A mixture: both price and quantity rise.";
  const mx = Math.max(dp, dq, 1), W = (v) => (v / mx) * 280;
  $("#lab3").innerHTML = SV.text(10, 60, "Price", "lbl bd") + SV.rect(100, 40, W(dp), 30, "f2", { opacity: 0.6 }) + SV.text(106 + W(dp), 61, Lib.fmtN(dp, 1) + "%", "lbl bd t2") +
    SV.text(10, 130, "Quantity", "lbl bd") + SV.rect(100, 110, W(dq), 30, "f3", { opacity: 0.6 }) + SV.text(106 + W(dq), 131, Lib.fmtN(dq, 1) + "%", "lbl bd t3") +
    SV.text(10, 200, "Demand shift: +" + d + "%", "sm");
}
Lib.slider($("#g4"), { id: "ld", label: "Rise in demand (%)", min: 5, max: 40, step: 1, value: 20, fmt: (v) => "+" + v + "%", onInput: lab3 });
Lib.slider($("#g5"), { id: "le", label: "PES", min: 0.1, max: 4, step: 0.1, value: 0.5, fmt: (v) => v.toFixed(1), onInput: lab3 });
Lib.slider($("#g6"), { id: "lf", label: "PED (ignoring sign)", min: 0.2, max: 3, step: 0.1, value: 1, fmt: (v) => v.toFixed(1), onInput: lab3 });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Would supply be more likely to be elastic or inelastic?",
  buckets: [{ label: "Elastic supply" }, { label: "Inelastic supply" }],
  items: [
    { text: "A factory with 30% spare capacity and large stocks", b: 0 }, { text: "Cut flowers on the morning of sale", b: 1 },
    { text: "Wheat in the same growing season", b: 1 }, { text: "A manufacturer in the long run", b: 0 },
    { text: "A hotel room tonight", b: 1 }, { text: "A firm that easily hires and trains workers", b: 0 },
    { text: "A football stadium on match day", b: 1 }, { text: "A firm making goods that can be stored cheaply", b: 0 },
    { text: "A firm short of key skilled workers", b: 1 }, { text: "An industry where new firms enter easily", b: 0 },
  ], done: "Stocks, spare capacity, time and flexibility decide it.",
});
Lib.match($("#m1"), { prompt: "Match each value or curve to its meaning.", pairs: [
  ["PES = 0", "Perfectly inelastic: vertical supply curve"],
  ["PES = 0.5", "Inelastic: quantity changes by half the % change in price"],
  ["PES = 1", "Unitary: e.g. a straight line through the origin"],
  ["PES = 3", "Elastic: quantity changes by three times the % change in price"],
  ["Horizontal supply curve", "PES = infinity: perfectly elastic"],
  ["Line cutting the price axis", "Elastic at every point"],
  ["Line cutting the quantity axis", "Inelastic at every point"],
], done: "Use the intercept, not the slope." });
Lib.order($("#o1"), { prompt: "Order the steps for working out PES.", items: [
  "Write the formula: PES = %ΔQs ÷ %ΔP",
  "Find the change in quantity supplied and the change in price (new minus original)",
  "Express each as a percentage of its original value",
  "Divide the % change in quantity supplied by the % change in price",
  "Check the answer is positive",
  "Compare with 1 and say elastic or inelastic",
], done: "A full-marks method." });
Lib.calc($("#c1"), { qs: [
  { q: "Producer A: price rises from $10 to $12 and output rises from 100 to 110 garments a day. Calculate PES.", a: 0.5, sol: "%ΔQs = 10 ÷ 100 = +10%. %ΔP = 2 ÷ 10 = +20%. PES = 10 ÷ 20 = <b>0.5</b>. Inelastic." },
  { q: "Producer B: price rises from $10 to $12 and output rises from 100 to 140. Calculate PES.", a: 2, sol: "%ΔQs = +40%. %ΔP = +20%. PES = 40 ÷ 20 = <b>2</b>. Elastic." },
  { q: "The price of tea falls from $70 to $60 a sack and the quantity supplied falls from 16 to 9 sacks. Calculate PES (1 d.p.).", a: 3.1, tol: 0.1, sol: "%ΔQs = −7 ÷ 16 = −43.75%. %ΔP = −10 ÷ 70 = −14.29%. PES = 43.75 ÷ 14.29 = <b>3.1</b>. Elastic." },
  { q: "Price falls from $5 to $4 and quantity supplied falls from 800 to 700 units. Calculate PES (2 d.p.).", a: 0.63, tol: 0.02, sol: "%ΔQs = −100 ÷ 800 = −12.5%. %ΔP = −1 ÷ 5 = −20%. PES = 12.5 ÷ 20 = <b>0.63</b>. Inelastic." },
  { q: "A firm has PES of 0.8. Price rises by 15%. By what percentage does quantity supplied rise?", a: 12, sol: "%ΔQs = PES × %ΔP = 0.8 × 15 = <b>12%</b>." },
  { q: "Quantity supplied rises by 30% and PES is 1.5. By what percentage did price rise?", a: 20, sol: "%ΔP = %ΔQs ÷ PES = 30 ÷ 1.5 = <b>20%</b>." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "Price elasticity of supply is:", opts: ["The change in supply given a change in price", "The percentage change in quantity supplied given a percentage change in price", "How price changes when quantity changes", "The slope of the supply curve"], a: 1, why: "It is a ratio of percentage changes." },
  { q: "Which supply curve has PES = 1 at every point?", opts: ["Any steep line", "Any straight line through the origin", "A vertical line", "A horizontal line"], a: 1, why: "A straight line through the origin has unit elasticity at every point, whatever the slope." },
  { q: "Which would make supply more elastic?", opts: ["No spare capacity", "Perishable goods", "Large stocks of finished goods", "A shortage of skilled labour"], a: 2, why: "Stocks let firms respond to price rises quickly." },
  { q: "Supply of cut flowers on the day they are picked is best described as:", opts: ["Perfectly elastic", "Elastic", "Unitary", "Perfectly inelastic"], a: 3, why: "They have to be sold; quantity cannot vary with price." },
  { q: "Why is agricultural supply usually more inelastic than manufacturing supply?", opts: ["Farmers produce nothing", "Crops take time to grow and weather affects yields", "Farm goods are not sold", "No stocks exist for manufacturing"], a: 1, why: "Output depends on growing seasons and weather and is hard to change quickly." },
  { q: "When supply is inelastic, an increase in demand mainly causes:", opts: ["A large rise in quantity", "A large rise in price", "A fall in price", "No change in either"], a: 1, why: "Output cannot rise much, so the adjustment is through price." },
  { q: "Over time, PES generally becomes:", opts: ["More inelastic", "Perfectly inelastic", "More elastic", "Negative"], a: 2, why: "More time allows capacity to grow and new firms to enter." },
  { q: "PES is 2. Price rises by 5%. Quantity supplied rises by:", opts: ["2.5%", "5%", "7%", "10%"], a: 3, why: "2 × 5% = 10%." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Price elasticity of supply (PES)", "%ΔQuantity supplied ÷ %ΔPrice."],
  ["Price elastic supply", "PES greater than 1: quantity supplied rises by a bigger percentage than price."],
  ["Price inelastic supply", "PES less than 1: quantity supplied rises by a smaller percentage than price."],
  ["Unitary elasticity of supply", "PES = 1; for example any straight line through the origin."],
  ["Perfectly inelastic supply", "PES = 0: a vertical supply curve."],
  ["Perfectly elastic supply", "PES = infinity: a horizontal supply curve."],
  ["Stocks", "Finished goods held in store that let firms respond quickly to a rise in demand."],
  ["Spare capacity", "Unused productive capacity that lets output rise without new investment."],
  ["Productive capacity", "The maximum output a firm or industry can produce with its resources."],
  ["Perishable product", "A good that cannot be stored, such as fresh flowers or an airline seat."],
  ["Short run", "A period in which at least one factor of production cannot be changed."],
  ["Long run", "A period in which all factors can be changed and new firms can enter."],
  ["Supply flexibility", "How quickly and easily producers can change output when conditions change."],
  ["Price volatility", "Large and frequent changes in price, common in agricultural markets."],
  ["Ceteris paribus", "Other things being equal."],
] });
lab1(); lab3();
