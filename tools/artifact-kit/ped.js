
/* ---------- shared demand-curve chart: Q = 100 - 10P ---------- */
function demandChart(p, o = {}) {
  const X = (q) => 80 + 6 * q, Y = (pr) => 350 - 30 * pr, q = 100 - 10 * p;
  let s = "";
  if (o.zone) {
    s += SV.rect(X(0), Y(10), X(100) - X(0), Y(5) - Y(10), "f2", { opacity: o.zone * 0.5 });
    s += SV.rect(X(0), Y(5), X(100) - X(0), Y(0) - Y(5), "f3", { opacity: o.zone * 0.6 });
    s += SV.text(X(62), Y(7.6), "Elastic: PED &gt; 1", "lbl bd t2", { opacity: o.zone });
    s += SV.text(X(62), Y(2.2), "Inelastic: PED &lt; 1", "lbl bd t3", { opacity: o.zone });
    s += SV.line(X(0), Y(5), X(100), Y(5), "gr", { opacity: o.zone });
    s += SV.text(X(2), Y(5) - 6, "PED = 1 at the midpoint", "sm", { opacity: o.zone });
  }
  s += SV.rect(X(0), Y(p), X(q) - X(0), Y(0) - Y(p), "f1");
  s += SV.line(X(0), Y(10), X(0), Y(0)) + SV.line(X(0), Y(0), X(100), Y(0));
  s += SV.text(X(0) - 8, Y(10) - 8, "Price", "sm", { "text-anchor": "start" }) + SV.text(X(100) - 20, Y(0) + 26, "Quantity", "sm");
  s += SV.line(X(0), Y(10), X(100), Y(0), "c1") + SV.text(X(88), Y(1.2), "D", "lbl bd t1");
  s += SV.line(X(0), Y(p), X(q), Y(p), "gr") + SV.line(X(q), Y(p), X(q), Y(0), "gr");
  s += SV.circle(X(q), Y(p), 7, "dot2");
  s += SV.text(X(0) - 10, Y(p) + 4, "P=" + Lib.fmtN(p, 1), "lbl", { "text-anchor": "end" }) + SV.text(X(q), Y(0) + 18, "Q=" + Lib.fmtN(q, 0), "lbl", { "text-anchor": "middle" });
  const ped = p / (10 - p);
  s += SV.text(X(q / 2), (Y(p) + Y(0)) / 2 + 4, "Revenue = " + Lib.fmtN(p * q, 0), "lbl bd t1", { "text-anchor": "middle" });
  s += SV.text(X(70), Y(9.2), "PED at this point = " + Lib.fmtN(ped, 2), "lbl bd", { "text-anchor": "middle" });
  return s;
}

/* ---------- 1. stepper: PED along a straight line ---------- */
Lib.stepper($("#stA"), {
  w: 760, h: 400, label: "Demand curve showing elastic, unit elastic and inelastic zones", base: { p: 9, zone: 0 },
  draw: (s) => demandChart(s.p, { zone: s.zone }),
  steps: [
    { cap: "This demand curve is a straight line, so its <b>slope is the same everywhere</b>. But PED uses <b>percentages</b>, and that changes the picture.", s: { p: 9, zone: 0 } },
    { cap: "<b>High price, low quantity.</b> At P = 8 the quantity is 20. A rise of 12.5% (8 to 9) cuts Q from 20 to 10: a 50% fall. PED = 50 ÷ 12.5 = <b>4</b>. Elastic.", s: { p: 8, zone: 0 } },
    { cap: "<b>The midpoint.</b> At P = 5 the quantity is 50. A 20% price rise (5 to 6) cuts Q from 50 to 40: a 20% fall. PED = <b>1</b>. This is where total revenue is highest.", s: { p: 5, zone: 0 } },
    { cap: "<b>Low price, high quantity.</b> At P = 2 the quantity is 80. A 50% rise (2 to 3) cuts Q from 80 to 70: only a 12.5% fall. PED = <b>0.25</b>. Inelastic.", s: { p: 2, zone: 0 } },
    { cap: "<b>Summary:</b> elastic in the top half, unit elastic at the midpoint, inelastic in the bottom half. One curve, many elasticities.", s: { p: 5, zone: 1 } },
  ],
});

/* ---------- 2. stepper: PED and total revenue ---------- */
function revPanel(x0, title, k, Qend, cls) {
  const W = 300, H = 240, qx = (q) => x0 + (W * q) / 120, py = (p) => 300 - (H * p) / 12;
  const P = 10 + k, Q = 100 + (Qend - 100) * k;
  let s = SV.line(x0, py(12), x0, py(0)) + SV.line(x0, py(0), x0 + W, py(0));
  s += SV.rect(qx(0), py(P), qx(Q) - qx(0), py(0) - py(P), cls);
  s += `<rect x="${qx(0)}" y="${py(10)}" width="${qx(100) - qx(0)}" height="${py(0) - py(10)}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5" opacity=".8"/>`;
  s += SV.text(x0 + W / 2, 28, title, "lbl bd", { "text-anchor": "middle" });
  s += SV.text(x0 + 6, py(12) + 12, "Price", "sm");
  s += SV.text(x0 + 6, py(0) + 16, "Quantity", "sm");
  s += SV.text(x0 + 8, py(10) - 6, "P = " + Lib.fmtN(P, 1), "sm", { "text-anchor": "start" });
  s += SV.text(qx(Q), py(0) + 16, "Q = " + Lib.fmtN(Q, 0), "sm", { "text-anchor": "middle" });
  s += SV.text(x0 + W / 2, 336, "Revenue = " + Lib.fmtN(P * Q, 0), "lbl bd", { "text-anchor": "middle" });
  return s;
}
Lib.stepper($("#stB"), {
  w: 760, h: 350, label: "Total revenue before and after a 10% price rise for elastic and inelastic demand", base: { ka: 0, kb: 0, v: 0 },
  draw: (s) => revPanel(50, "Elastic demand (PED = 2)", s.ka, 80, "f2") + revPanel(420, "Inelastic demand (PED = 0.4)", s.kb, 96, "f3"),
  steps: [
    { cap: "Two products start at the same position: price $10, quantity 100, revenue <b>$1,000</b>. The dashed box shows this. <b>Revenue is the area.</b>", s: { ka: 0, kb: 0 } },
    { cap: "<b>Elastic demand.</b> Price rises 10%, so PED = 2 means quantity falls 20%. The new box is smaller: the price rise is outweighed by the lost sales, so revenue <b>falls</b> to $880.", s: { ka: 1, kb: 0 } },
    { cap: "<b>Inelastic demand.</b> The same 10% rise with PED = 0.4 cuts quantity only 4%. The box gets taller by more than it loses in width: revenue <b>rises</b> to $1,056.", s: { ka: 1, kb: 1 } },
    { cap: "<b>Rule:</b> if demand is elastic, a price <i>rise</i> lowers revenue. If it is inelastic, a price <i>rise</i> raises revenue. A price <i>cut</i> does the opposite.", s: { ka: 1, kb: 1, v: 1 } },
  ],
});

/* ---------- 3. stepper: XED shifts ---------- */
function xedPanel(x0, title, k, dir, labelA, labelB, ok) {
  const X = (q) => x0 + 2.6 * q, Y = (p) => 280 - 2.2 * p, sh = dir * 28 * k;
  let s = SV.line(x0, Y(100), x0, Y(0)) + SV.line(x0, Y(0), x0 + 270, Y(0));
  s += SV.text(x0 + 4, Y(100) + 4, "Price of " + labelA, "sm") + SV.text(x0 + 266, Y(0) + 22, "Quantity of " + labelA, "sm", { "text-anchor": "end" });
  s += SV.line(X(8), Y(90), X(88), Y(10), "c1") + SV.text(X(90), Y(8), "D₀", "lbl bd t1");
  s += SV.line(X(8) + sh * 2.6 / 2.6, Y(90), X(88) + sh * 2.6 / 2.6, Y(10), "c2", { opacity: k }) + SV.text(X(8) + sh + 8, Y(90) - 8, "D₁", "lbl bd t2", { opacity: k });
  s += SV.text(x0 + 135, 24, title, "lbl bd", { "text-anchor": "middle" });
  s += SV.text(x0 + 135, 322, ok, "lbl bd", { "text-anchor": "middle", opacity: k });
  return s;
}
Lib.stepper($("#stC"), {
  w: 760, h: 340, label: "Demand curves shifting after the price of a substitute and a complement rise", base: { ks: 0, kc: 0, note: 0 },
  draw: (s) => xedPanel(40, "Substitutes: tea and coffee", s.ks, +1, "coffee", "tea", "Demand shifts right, XED positive") + xedPanel(410, "Complements: printers and ink", s.kc, -1, "ink", "printers", "Demand shifts left, XED negative"),
  steps: [
    { cap: "Two pairs of related goods. In each graph the line is today's demand for the good named on the axis.", s: { ks: 0, kc: 0 } },
    { cap: "<b>Substitutes.</b> The price of <b>tea</b> rises 10%. Some tea drinkers switch, so demand for <b>coffee</b> shifts <b>right</b>, say by 6%. XED = +6 ÷ +10 = <b>+0.6</b>.", s: { ks: 1, kc: 0 } },
    { cap: "<b>Complements.</b> The price of <b>printers</b> rises 10%. Fewer printers are bought, so demand for <b>ink</b> shifts <b>left</b>, say by 8%. XED = −8 ÷ +10 = <b>−0.8</b>.", s: { ks: 1, kc: 1 } },
    { cap: "<b>The sign tells you the relationship</b>: positive for substitutes, negative for complements. <b>The size tells you how strong</b> the link is.", s: { ks: 1, kc: 1 } },
  ],
});

/* ---------- Lab 1: price change and revenue ---------- */
const s1 = Lib.slider($("#sl1"), { id: "a1", label: "Price change (%)", min: -30, max: 30, step: 1, value: 10, fmt: (v) => (v > 0 ? "+" : "") + v + "%", onInput: lab1 });
const s2 = Lib.slider($("#sl2"), { id: "a2", label: "PED (ignoring sign)", min: 0, max: 4, step: 0.1, value: 0.5, fmt: (v) => v.toFixed(1), onInput: lab1 });
function lab1() {
  if (!$("#a1") || !$("#a2")) return;
  const pc = +$("#a1").value, ped = +$("#a2").value;
  const P1 = 10 * (1 + pc / 100), dq = -ped * pc, Q1 = Math.max(0, 1000 * (1 + dq / 100));
  const R0 = 10000, R1 = P1 * Q1;
  $("#r1").textContent = (pc > 0 ? "+" : "") + pc + "%"; $("#r2").textContent = (dq > 0 ? "+" : "") + Lib.fmtN(dq, 1) + "%";
  $("#r3").textContent = "$" + Lib.fmtN(R0, 0); $("#r4").textContent = "$" + Lib.fmtN(R1, 0);
  const kind = ped === 0 ? "perfectly inelastic" : ped < 1 ? "inelastic" : ped === 1 ? "unit elastic" : "elastic";
  const dir = Math.abs(R1 - R0) < 1 ? "stays the same" : R1 > R0 ? "rises" : "falls";
  $("#v1").textContent = pc === 0 ? "Choose a price change." : `Demand is ${kind} (PED = ${ped.toFixed(1)}). A ${Math.abs(pc)}% price ${pc > 0 ? "rise" : "cut"} means total revenue ${dir}.`;
  const X = (q) => 50 + (330 * q) / 1400, Y = (p) => 290 - (250 * p) / 14;
  let s = SV.line(50, Y(14), 50, Y(0)) + SV.line(50, Y(0), 390, Y(0)) + SV.text(54, 22, "Price", "sm") + SV.text(388, 316, "Quantity", "sm", { "text-anchor": "end" });
  s += SV.rect(X(0), Y(P1), X(Q1) - X(0), Y(0) - Y(P1), pc > 0 === R1 > R0 ? "f3" : "f2");
  s += `<rect x="${X(0)}" y="${Y(10)}" width="${X(1000) - X(0)}" height="${Y(0) - Y(10)}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="6 5"/>`;
  s += SV.text(210, 46, `Revenue: $${Lib.fmtN(R0, 0)} to $${Lib.fmtN(R1, 0)}`, "lbl bd", { "text-anchor": "middle" });
  $("#lab1").innerHTML = s;
}
lab1();

/* ---------- Lab 2: slide along the curve ---------- */
Lib.slider($("#sl3"), { id: "a3", label: "Price (P)", min: 0.5, max: 9.5, step: 0.1, value: 8, fmt: (v) => "$" + v.toFixed(1), onInput: (p) => {
  const q = 100 - 10 * p, ped = p / (10 - p), tr = p * q;
  $("#q1").textContent = Lib.fmtN(q, 0); $("#q2").textContent = Lib.fmtN(ped, 2); $("#q3").textContent = Lib.fmtN(tr, 0);
  $("#v2").textContent = Math.abs(ped - 1) < 0.05 ? "Unit elastic: revenue is at its maximum. Cutting or raising the price lowers it." : ped > 1 ? "Elastic: cutting the price would raise revenue." : "Inelastic: raising the price would raise revenue.";
  $("#lab2").innerHTML = demandChart(p, { zone: 1 });
} });

/* ---------- Lab 3: YED and XED ---------- */
function yedRun() {
  const dy = +$("#a4").value, y = +$("#a5").value, d = y * dy;
  $("#y1").textContent = (d > 0 ? "+" : "") + Lib.fmtN(d, 1) + "%";
  const t = y < 0 ? "an inferior good: demand falls as income rises" : y > 1 ? "a normal good and a luxury: income elastic" : y > 0 ? "a normal good and a necessity: income inelastic" : "no response to income";
  $("#v3").textContent = `With YED = ${y.toFixed(1)} this is ${t}.`;
}
function xedRun() {
  const dp = +$("#a6").value, x = +$("#a7").value, d = x * dp;
  $("#x1").textContent = (d > 0 ? "+" : "") + Lib.fmtN(d, 1) + "%";
  const t = x > 0.05 ? "substitutes: a rise in B's price raises demand for A" : x < -0.05 ? "complements: a rise in B's price reduces demand for A" : "unrelated goods";
  $("#v4").textContent = `With XED = ${x.toFixed(1)} the goods are ${t}.`;
}
Lib.slider($("#sl4"), { id: "a4", label: "Change in income (%)", min: -20, max: 20, step: 1, value: 10, fmt: (v) => (v > 0 ? "+" : "") + v + "%", onInput: () => $("#a5") && yedRun() });
Lib.slider($("#sl5"), { id: "a5", label: "YED", min: -2, max: 3, step: 0.1, value: 1.5, fmt: (v) => v.toFixed(1), onInput: yedRun });
Lib.slider($("#sl6"), { id: "a6", label: "Change in price of good B (%)", min: -20, max: 20, step: 1, value: 10, fmt: (v) => (v > 0 ? "+" : "") + v + "%", onInput: () => $("#a7") && xedRun() });
Lib.slider($("#sl7"), { id: "a7", label: "XED", min: -3, max: 3, step: 0.1, value: 0.6, fmt: (v) => v.toFixed(1), onInput: xedRun });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Where would demand for each of these most likely sit?",
  buckets: [{ label: "Price elastic (PED &gt; 1)" }, { label: "Price inelastic (PED &lt; 1)" }],
  items: [
    { text: "One brand of cola with many rivals", b: 0 }, { text: "Cigarettes (addictive, few substitutes)", b: 1 },
    { text: "An overseas holiday (large share of income)", b: 0 }, { text: "Salt (tiny share of income)", b: 1 },
    { text: "Petrol for a commuter, in the short run", b: 1 }, { text: "A budget airline seat on a busy route", b: 0 },
    { text: "Life-saving medicine with no alternative", b: 1 }, { text: "Fashion trainers, long-run decision", b: 0 },
    { text: "Cooking oil bought weekly", b: 1 }, { text: "Restaurant meals, long run", b: 0 },
  ],
  done: "You can justify each one with substitutes, share of income, time or necessity.",
});
Lib.match($("#m1"), {
  prompt: "Drag each meaning onto the value it fits.",
  pairs: [
    ["PED = 0", "Perfectly inelastic: quantity does not respond to price"],
    ["PED = 0.4", "Inelastic: %ΔQ is smaller than %ΔP"],
    ["PED = 2.5", "Elastic: %ΔQ is bigger than %ΔP"],
    ["YED = +2.0", "Normal good and a luxury"],
    ["YED = −0.5", "Inferior good"],
    ["XED = +1.8", "Close substitutes"],
    ["XED = −1.2", "Complements"],
  ],
  done: "Sign and size together tell the story.",
});
Lib.order($("#o1"), {
  prompt: "Drag, or use the arrows, to put these steps in the order you would write them.",
  items: [
    "Write the formula: PED = %ΔQd ÷ %ΔP",
    "Work out the change in quantity and the change in price (new minus original)",
    "Convert each change to a percentage of its original value",
    "Divide the % change in quantity by the % change in price",
    "Ignore the minus sign and state the value",
    "Compare with 1 and say whether demand is elastic or inelastic",
    "State what this means for total revenue",
  ],
  done: "A full-marks method.",
});
Lib.calc($("#c1"), { qs: [
  { q: "Price rises from $100 to $105 and quantity demanded falls from 2,000 to 1,950 units per week. Calculate PED (ignore the sign).", a: 0.5, tol: 0.01, hint: "%ΔQ = −50 ÷ 2000 × 100. %ΔP = 5 ÷ 100 × 100.", sol: "%ΔQ = −50 ÷ 2,000 × 100 = −2.5%. %ΔP = 5 ÷ 100 × 100 = +5%. PED = −2.5 ÷ 5 = −0.5, so <b>0.5</b>. Inelastic." },
  { q: "Price falls from $55.50 to $54.95 and quantity demanded rises from 5,000 to 6,000. Calculate PED (ignore the sign, 1 d.p.).", a: 20.2, tol: 0.15, hint: "%ΔP is a small number: −0.55 ÷ 55.50.", sol: "%ΔQ = +1,000 ÷ 5,000 = +20%. %ΔP = −0.55 ÷ 55.50 = −0.99%. PED = 20 ÷ 0.99 ≈ <b>20.2</b>. Very elastic." },
  { q: "Income rises by 8% and demand for restaurant meals rises by 12%. Calculate YED.", a: 1.5, tol: 0.01, sol: "YED = +12 ÷ +8 = <b>+1.5</b>. Positive and above 1: a normal good and a luxury." },
  { q: "The price of tea rises by 10% and demand for coffee rises by 4%. Calculate XED.", a: 0.4, tol: 0.01, sol: "XED = +4 ÷ +10 = <b>+0.4</b>. Positive: the goods are substitutes, though the link is weak." },
  { q: "The price of PCs rises 5% and the quantity demanded of a compatible software package falls 10%. Calculate XED (keep the sign).", a: -2, tol: 0.01, ph: "e.g. -1.5", sol: "XED = −10 ÷ +5 = <b>−2</b>. Negative: complements, and a strong link." },
  { q: "A product sells 500 units a week at $20. PED is 0.3. The firm raises the price to $22. Calculate the new total revenue ($).", a: 10670, tol: 1, hint: "Price rise 10%. Quantity falls by 0.3 × 10% = 3%.", sol: "%ΔP = +10%. %ΔQ = −0.3 × 10 = −3%, so Q = 485. Revenue = 22 × 485 = <b>$10,670</b>, up from $10,000." },
  { q: "A firm sells 200 units at $50. PED is 2.0. It cuts the price by 10%. Calculate the new total revenue ($).", a: 10800, tol: 1, sol: "%ΔQ = +20%, so Q = 240. New price = $45. Revenue = 45 × 240 = <b>$10,800</b>, up from $10,000." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "Which PED value shows the most price-elastic demand?", opts: ["0.2", "0.9", "1.0", "3.4"], a: 3, why: "The larger the number (ignoring sign), the more responsive demand is to price." },
  { q: "A firm raises its price and total revenue rises. This suggests demand is:", opts: ["Price elastic", "Price inelastic", "Perfectly elastic", "Income elastic"], a: 1, why: "Revenue rises with a price rise only when the percentage fall in quantity is smaller than the price rise, so PED is below 1." },
  { q: "Which is a likely cause of more elastic demand in the long run?", opts: ["Fewer substitutes appear", "Consumers have time to adjust", "The good becomes addictive", "Price falls to zero"], a: 1, why: "Over time consumers find alternatives and change habits." },
  { q: "A good has YED = −0.7. It is:", opts: ["A luxury", "A normal necessity", "An inferior good", "A complement"], a: 2, why: "A negative YED means demand falls as income rises: an inferior good." },
  { q: "XED between two goods is −1.5. They are:", opts: ["Close substitutes", "Complements", "Unrelated", "Both inferior"], a: 1, why: "Negative XED means a rise in the price of one reduces demand for the other." },
  { q: "On a straight-line downward-sloping demand curve, PED is:", opts: ["Constant along the curve", "Highest at low prices", "Greater than 1 at high prices", "Zero at the midpoint"], a: 2, why: "At high prices and low quantities, percentage changes in quantity are large: demand is elastic." },
  { q: "Price falls 10% and quantity rises 25%. Demand is:", opts: ["Elastic, and revenue rises", "Inelastic, and revenue rises", "Elastic, and revenue falls", "Unit elastic"], a: 0, why: "PED = 2.5, which is above 1, and a price cut with elastic demand raises revenue." },
  { q: "Why do governments often tax goods with inelastic demand?", opts: ["Consumers buy much more", "Revenue is high and quantity falls little", "Supply is perfectly elastic", "Producers pay all of the tax"], a: 1, why: "With inelastic demand the quantity falls by little, so the tax base is largely maintained." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Elasticity", "A measure of the responsiveness of one variable to a change in another, ceteris paribus."],
  ["Price elasticity of demand (PED)", "%ΔQuantity demanded ÷ %ΔPrice of the product."],
  ["Price elastic", "PED greater than 1: quantity changes by a larger percentage than price."],
  ["Price inelastic", "PED less than 1: quantity changes by a smaller percentage than price."],
  ["Unitary elasticity", "PED equal to 1: %ΔQ equals %ΔP; revenue does not change."],
  ["Perfectly inelastic", "PED = 0. Quantity demanded does not change when price changes."],
  ["Perfectly elastic", "PED = infinity. Demand falls to zero if price rises at all."],
  ["Total revenue", "Price × quantity sold; equal to consumers' total expenditure."],
  ["Income elasticity of demand (YED)", "%ΔQuantity demanded ÷ %ΔIncome."],
  ["Normal good", "A good with positive YED: demand rises as income rises."],
  ["Luxury good", "A normal good with YED above 1 (income elastic)."],
  ["Inferior good", "A good with negative YED: demand falls as income rises."],
  ["Cross elasticity of demand (XED)", "%ΔQuantity demanded of A ÷ %ΔPrice of B."],
  ["Substitutes", "Goods with positive XED: a rise in the price of one raises demand for the other."],
  ["Complements", "Goods with negative XED: a rise in the price of one lowers demand for the other."],
  ["Ceteris paribus", "Other things being equal: all other influences held constant."],
] });
