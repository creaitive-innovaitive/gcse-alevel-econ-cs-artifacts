/* IGCSE Economics Chapter 26: Fiscal policy */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
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
function axes(yl = "Price", xl = "Quantity") {
  return SV.line(QX(0), PY(120), QX(0), PY(0)) + SV.line(QX(0), PY(0), QX(104), PY(0)) +
    SV.text(QX(0) + 6, PY(120) + 6, yl, "sm") + SV.text(QX(104), PY(0) + 22, xl, "sm", { "text-anchor": "end" });
}
const hline = (p, c = "gr", x2 = 100) => SV.line(QX(0), PY(p), QX(x2), PY(p), c);
const vline = (q, p, c = "gr") => SV.line(QX(q), PY(p), QX(q), PY(0), c);
const ylab = (p, t, c = "sm") => SV.text(QX(0) - 8, PY(p) + 4, t, c, { "text-anchor": "end" });
const xlab = (q, t, c = "sm") => SV.text(QX(q), PY(0) + 18, t, c, { "text-anchor": "middle" });
const D = (b) => [-b, 50 + 50 * b], S = (d, shift = 0) => [d, 50 - 50 * d + shift];
const fmtSteep = (v) => (v < 0.8 ? "flat (elastic)" : v > 1.4 ? "steep (inelastic)" : "medium");
const money = (v, d = 1) => Lib.fmtN(v, d);

/* ---------- 1. budget bars ---------- */
function budgetChart(s) {
  const base = 340, k = 1.75, r = s.rev, sp = s.spend, d = r - sp;
  let o = SV.line(70, base, 570, base);
  o += SV.rect(120, base - r * k, 150, r * k, "", { style: "fill:var(--accent)", opacity: 0.85 });
  o += SV.rect(330, base - sp * k, 150, sp * k, "", { style: "fill:var(--warn)", opacity: 0.85 });
  if (d < -0.5) o += SV.rect(120, base - sp * k, 150, -d * k, "", { style: "fill:none;stroke:var(--bad);stroke-width:2.5;stroke-dasharray:6 4" }) + SV.text(195, base - sp * k + (-d * k) / 2 + 5, "Gap " + money(-d, 0), "lbl bd t2", { "text-anchor": "middle" });
  if (d > 0.5) o += SV.rect(330, base - r * k, 150, d * k, "", { style: "fill:none;stroke:var(--good);stroke-width:2.5;stroke-dasharray:6 4" }) + SV.text(405, base - r * k + (d * k) / 2 + 5, "Spare " + money(d, 0), "lbl bd t3", { "text-anchor": "middle" });
  const inbar = { "text-anchor": "middle", style: "font-size:15px;paint-order:stroke;stroke:var(--surface);stroke-width:4px" };
  o += SV.text(195, base - r * k + 24, "$" + money(r, 0) + "bn", "lbl bd", inbar) + SV.text(405, base - sp * k + 24, "$" + money(sp, 0) + "bn", "lbl bd", inbar);
  o += SV.text(195, base + 22, "Government revenue", "lbl", { "text-anchor": "middle" }) + SV.text(405, base + 22, "Government spending", "lbl", { "text-anchor": "middle" });
  const verdict = Math.abs(d) < 0.5 ? "Balanced budget: revenue = spending" : d < 0 ? "Budget deficit of $" + money(-d, 0) + "bn: the government must borrow" : "Budget surplus of $" + money(d, 0) + "bn: revenue exceeds spending";
  o += SV.text(300, 52, verdict, "lbl bd " + (Math.abs(d) < 0.5 ? "" : d < 0 ? "t2" : "t3"), { "text-anchor": "middle", style: "font-size:16px" });
  o += SV.rect(620, base - s.debt * k, 90, s.debt * k, "", { style: "fill:var(--bad)", opacity: 0.6 });
  o += SV.text(665, base - s.debt * k - 8, "$" + money(s.debt, 0) + "bn", "lbl bd t2", { "text-anchor": "middle" }) + SV.text(665, base + 22, "National debt", "lbl", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 400, label: "Budget deficit, surplus and national debt", base: { rev: 100, spend: 100, debt: 60 }, draw: budgetChart, steps: [
  { cap: "A government's <b>budget</b> compares what it raises (revenue, mostly tax) with what it spends. Here both are <b>$100bn</b>: a <b>balanced budget</b>, which is less common than the other two. Past borrowing has built up a <b>national debt</b> of $60bn.", s: { rev: 100, spend: 100, debt: 60 } },
  { cap: "The government raises spending to <b>$120bn</b> but revenue stays at $100bn. Spending is higher than revenue: a <b>budget deficit</b> of $20bn.", s: { spend: 120 } },
  { cap: "To pay for the gap the government has to <b>borrow</b> $20bn. The <b>national debt</b>, the total borrowed over time, rises from $60bn to $80bn. A deficit adds to the debt; the debt is the running total.", s: { spend: 120, debt: 80 } },
  { cap: "Now the government raises tax revenue to <b>$125bn</b> and brings spending back to $100bn. Revenue is higher than spending: a <b>budget surplus</b> of $25bn.", s: { rev: 125, spend: 100, debt: 80 } },
  { cap: "A surplus can be used to <b>repay debt</b>, which also cuts the interest the government has to pay. The debt falls to $55bn. <b>Budget deficit or surplus = revenue − spending</b> (a negative answer is a deficit).", s: { rev: 125, spend: 100, debt: 55 } },
] });

/* ---------- 2. multiplier ---------- */
const MPC0 = 0.8;
function multChart(s) {
  const inj = s.inj ?? 20, mpc = s.mpc ?? MPC0, base = 330, k = 205 / inj, n = s.n;
  let o = SV.line(30, base, 740, base), tot = 0;
  for (let i = 0; i < 8; i++) {
    const v = clamp(n - i, 0, 1), a = inj * Math.pow(mpc, i);
    if (v <= 0) continue;
    const h = a * k * v, x = 40 + i * 85;
    tot += a * v;
    o += SV.rect(x, base - h, 64, h, "", { style: "fill:var(" + (i ? "--accent" : "--warn") + ")", opacity: 0.85 });
    if (v > 0.6) o += SV.text(x + 32, base - h - 8, "$" + money(a, a % 1 === 0 ? 0 : 1) + "m", "lbl bd", { "text-anchor": "middle" }) + SV.text(x + 32, base + 20, i ? "Round " + (i + 1) : "Injection", "sm", { "text-anchor": "middle" });
  }
  if (n > 7.5) o += SV.text(730, base - 8, "…", "lbl bd", { "text-anchor": "end", style: "font-size:24px" });
  o += SV.text(40, 40, "Extra income created so far: $" + money(tot, 1) + "m", "lbl bd", { style: "font-size:17px" });
  if (s.fin > 0.5) o += SV.text(40, 70, "Final rise = $" + money(inj, 0) + "m ÷ (1 − " + mpc + ") = $" + money(inj / (1 - mpc), 0) + "m: " + money(1 / (1 - mpc), 1) + " times the original", "lbl bd t3", { style: "font-size:15px" });
  return o;
}
Lib.stepper($("#stM"), { w: 760, h: 400, label: "The multiplier effect", base: { n: 0, fin: 0 }, draw: multChart, steps: [
  { cap: "The government spends an extra <b>$20m</b> (for example building a road). That money becomes income for construction firms and workers.", s: { n: 1, fin: 0 } },
  { cap: "Those who receive the $20m spend <b>$16m</b> of it (80%) and save $4m. The $16m is now income for shops, suppliers and their workers.", s: { n: 2, fin: 0 } },
  { cap: "They in turn spend 80% of $16m, about <b>$12.8m</b>. Each round is smaller because some is <b>saved</b> (and some leaks out to imports and tax) each time.", s: { n: 3, fin: 0 } },
  { cap: "The rounds keep going: $10.2m, $8.2m, $6.6m, $5.2m, $4.2m… The rises get smaller but they add up.", s: { n: 8, fin: 0 } },
  { cap: "The total rise in income, spending and output is <b>$100m</b>, five times the original $20m. That bigger-than-initial effect is the <b>multiplier effect</b>. The more people spend of extra income, the bigger it is.", s: { n: 8, fin: 1 } },
] });

/* ---------- 3. progressive, proportional, regressive ---------- */
const RX = (inc) => 70 + inc * 0.55, RY = (r) => 330 - r * 5.4;
const SERIES = {
  pr: { name: "Progressive", c: "c1", t: "t1", pts: [[100, 10, 10], [500, 20, 100], [1000, 40, 400]] },
  pp: { name: "Proportional", c: "c3", t: "t3", pts: [[100, 25, 25], [500, 25, 125], [1000, 25, 250]] },
  rg: { name: "Regressive", c: "c2", t: "t2", pts: [[100, 40, 40], [500, 30, 150], [1000, 20, 200]] },
};
function ratesChart(s) {
  let o = SV.line(RX(0), RY(55), RX(0), RY(0)) + SV.line(RX(0), RY(0), RX(1060), RY(0));
  [10, 20, 30, 40, 50].forEach((r) => (o += SV.line(RX(0), RY(r), RX(1000), RY(r), "gr") + SV.text(RX(0) - 8, RY(r) + 4, r + "%", "sm", { "text-anchor": "end" })));
  [100, 500, 1000].forEach((i) => (o += SV.text(RX(i), RY(0) + 18, "$" + i, "sm", { "text-anchor": "middle" })));
  o += SV.text(RX(0) + 6, RY(55) + 4, "Tax paid as % of income", "sm") + SV.text(RX(1060), RY(0) + 38, "Income", "sm", { "text-anchor": "end" });
  Object.keys(SERIES).forEach((key) => {
    const sr = SERIES[key], v = s[key];
    if (v <= 0.02) return;
    let g = SV.path(ptsPath(sr.pts.map((p) => [RX(p[0]), RY(p[1])])), sr.c);
    sr.pts.forEach((p) => (g += SV.circle(RX(p[0]), RY(p[1]), 5, "dot" + sr.c.slice(1)) + SV.text(RX(p[0]) + 9, RY(p[1]) + (key === "pr" ? 20 : -9), "$" + p[2] + " tax", "sm bd", { "text-anchor": "start", style: "paint-order:stroke;stroke:var(--surface);stroke-width:4px" })));
    g += SV.text(RX(1000) + 16, RY(sr.pts[2][1]) + 4, sr.name, "lbl bd " + sr.t);
    o += `<g opacity="${v}">${g}</g>`;
  });
  return o;
}
Lib.stepper($("#stR"), { w: 760, h: 380, label: "Progressive, proportional and regressive taxes", base: { pr: 0, pp: 0, rg: 0 }, draw: ratesChart, steps: [
  { cap: "<b>Progressive:</b> as income rises from $100 to $500 to $1,000 the <b>percentage</b> paid rises from 10% to 20% to 40%. Income tax usually works like this. The rich pay more dollars and a bigger share.", s: { pr: 1, pp: 0, rg: 0 } },
  { cap: "<b>Proportional:</b> the percentage stays at <b>25%</b> whatever the income. The dollar amount still rises ($25, $125, $250) but the share does not.", s: { pr: 1, pp: 1, rg: 0 } },
  { cap: "<b>Regressive:</b> the percentage <b>falls</b> as income rises, from 40% to 30% to 20%. The poor pay a bigger share of their income. A fixed charge per litre of petrol is an example: the rich buy more litres but not in proportion to their income.", s: { pr: 1, pp: 1, rg: 1 } },
  { cap: "In all three the <b>total tax paid</b> usually rises with income. What differs is the <b>percentage</b>. Only a progressive tax redistributes from rich to poor.", s: { pr: 1, pp: 1, rg: 1 } },
] });

/* ---------- 4. incidence ---------- */
function taxChart(s) {
  const b = s.b, d = s.d, t = s.t, q1 = 50 - t / (b + d), pc = 50 + (b * t) / (b + d), pp = pc - t;
  let o = axes();
  if (t > 0.01) {
    o += SV.rect(QX(0), PY(pc), QX(q1) - QX(0), PY(50) - PY(pc), "f2");
    o += SV.rect(QX(0), PY(50), QX(q1) - QX(0), PY(pp) - PY(50), "f4");
    if (s.inc > 0.5) {
      o += SV.text(QX(q1 / 2), (PY(pc) + PY(50)) / 2 + 4, "Consumers' share: " + money(pc - 50), "lbl bd t2", { "text-anchor": "middle", style: "paint-order:stroke;stroke:var(--surface);stroke-width:4px" });
      o += SV.text(QX(q1 / 2), (PY(50) + PY(pp)) / 2 + 4, "Producers' share: " + money(50 - pp), "lbl bd t4", { "text-anchor": "middle", style: "paint-order:stroke;stroke:var(--surface);stroke-width:4px" });
      o += SV.text(QX(q1 / 2), PY(pp) + 22, "Tax revenue = " + money(t * q1, 0), "lbl bd", { "text-anchor": "middle", style: "paint-order:stroke;stroke:var(--surface);stroke-width:4px" });
    }
  }
  const [dm, dc] = D(b), [sm, sc] = S(d), [tm, tc] = S(d, t);
  o += curve(dm, dc, "c1", "D", { t: "t1" }) + curve(sm, sc, "c3", "S₁", { t: "t3", attrs: { opacity: t > 0.01 ? 0.55 : 1 } });
  if (t > 0.01) o += curve(tm, tc, "c2", "S₂", { t: "t2" });
  o += hline(50) + vline(50, 50) + ylab(50, "P = 50") + xlab(50, "Q = 50");
  o += SV.circle(QX(50), PY(50), 6, "dot1", { opacity: t > 0.01 ? 0.5 : 1 });
  if (t > 0.01) { o += hline(pc, "gr", q1) + vline(q1, pc) + SV.circle(QX(q1), PY(pc), 6, "dot2") + ylab(pc, "P₁ = " + money(pc)) + ylab(pp, "Pp = " + money(pp)) + hline(pp, "gr", q1) + SV.text(QX(q1), PY(0) + (Math.abs(q1 - 50) < 9 ? 34 : 18), "Q₁ = " + money(q1), "sm", { "text-anchor": "middle" }); }
  return o;
}
Lib.stepper($("#stT"), { w: 760, h: 400, label: "Incidence of an indirect tax", base: { b: 1, d: 1, t: 0, inc: 0 }, draw: taxChart, steps: [
  { cap: "A market for a good in equilibrium at <b>price 50, quantity 50</b>. Demand D and supply S₁.", s: { b: 1, d: 1, t: 0, inc: 0 } },
  { cap: "The government puts an <b>indirect tax of 20 per unit</b> on the good. Firms' costs rise by 20 at every quantity, so supply shifts <b>to the left</b> (up) by the amount of the tax, to S₂.", s: { t: 20, inc: 0 } },
  { cap: "The new equilibrium: consumers pay a <b>higher price (60)</b> and buy <b>less (40)</b>. Producers hand 20 to the government, so they keep 60 − 20 = <b>40</b>.", s: { t: 20, inc: 0 } },
  { cap: "<b>Incidence</b> is who bears the burden. Consumers bear the rise in price (10), producers bear the rest (10). <b>Tax revenue</b> = 20 × 40 = 800.", s: { t: 20, inc: 1 } },
  { cap: "Make demand <b>steeper (inelastic)</b>. Buyers have few alternatives, so producers can pass on most of the tax: <b>consumers bear most of it</b>. Cigarettes and petrol are examples.", s: { t: 20, inc: 1, b: 3 } },
  { cap: "Make demand <b>flatter (elastic)</b>. Buyers would switch away, so firms cannot raise the price much and <b>producers bear most of the tax</b>.", s: { t: 20, inc: 1, b: 0.3 } },
] });

/* ---------- 5. fiscal policy on AD / AS ---------- */
const asP = (y) => (y <= 60 ? 30 + 0.4 * y : 54 + 2.2 * (y - 60));
function solveAD(sh) {
  const c = 90 + 0.8 * sh; let y = (c - 30) / 1.2;
  if (y > 60) y = (c + 78) / 3;
  return [y, asP(y), c];
}
function adLine(c, cls, label, o = {}) {
  const lo = Math.max(0, (c - 108) / 0.8), hi = Math.min(100, (c - 8) / 0.8);
  let r = SV.line(QX(lo), PY(c - 0.8 * lo), QX(hi), PY(c - 0.8 * hi), cls, o.attrs);
  if (label) r += SV.text(QX(hi) + 6, PY(c - 0.8 * hi) + (o.dy ?? 4), label, "lbl bd " + (o.t || "t1"), o.attrs && o.attrs.opacity !== undefined ? { opacity: o.attrs.opacity } : {});
  return r;
}
function adChart(s) {
  const sh = s.sh, [y1, p1, c] = solveAD(sh), moved = Math.abs(sh) >= 1;
  let o = axes("Price level", "Real GDP");
  o += SV.path(ptsPath([[QX(0), PY(30)], [QX(60), PY(54)], [QX(87.7), PY(115)]]), "c3") + SV.text(QX(87.7) + 6, PY(115) + 4, "AS", "lbl bd t3");
  o += adLine(90, "c1", "AD", { t: "t1", attrs: { opacity: moved ? 0.4 : 1 } });
  if (moved) o += adLine(c, sh > 0 ? "c2" : "c4", sh > 0 ? "AD₁" : "AD₂", { t: sh > 0 ? "t2" : "t4" });
  o += hline(50) + vline(50, 50) + ylab(50, "P") + xlab(50, "Y") + SV.circle(QX(50), PY(50), 6, "dot1", { opacity: moved ? 0.45 : 1 });
  if (moved) o += hline(p1, "gr", y1) + vline(y1, p1) + SV.circle(QX(y1), PY(p1), 6, sh > 0 ? "dot2" : "dot4") + ylab(p1, "P₁", "sm bd") + xlab(y1, "Y₁", "sm bd");
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 400, label: "Fiscal policy shifting aggregate demand", base: { sh: 0 }, draw: adChart, steps: [
  { cap: "The economy starts at <b>Y</b> (real GDP) and <b>P</b> (price level) where AD meets AS. <b>AD = C + I + G + (X − M)</b>. Government spending (G) is part of AD, and taxes change how much households (C) and firms (I) have to spend.", s: { sh: 0 } },
  { cap: "<b>Expansionary fiscal policy</b>: the government raises spending and/or cuts taxes. AD shifts <b>right</b> to AD₁. Real GDP rises (<b>economic growth</b>), firms need more workers (<b>employment is likely to rise</b>) and the price level edges up.", s: { sh: 15 } },
  { cap: "<b>Evaluate:</b> push too hard when the economy is close to full capacity and AS is steep. The rise in output is small and most of the effect is a <b>higher price level</b>: inflation. It also leaves a bigger budget deficit.", s: { sh: 40 } },
  { cap: "<b>Contractionary fiscal policy</b>: cut spending and/or raise taxes. AD shifts <b>left</b> to AD₂. Price pressure eases, which helps against inflation, and spending on imports falls, but output and jobs are likely to fall too.", s: { sh: -15 } },
] });

/* ================= LABS ================= */
/* Lab 1: budget, with automatic stabilisers (New Zealand 2016 table, NZ$bn) */
const SPEND = [["Healthcare", 16.2, "--accent"], ["Education", 13.5, "--good"], ["Pensions", 12.9, "--n"], ["Unemployment and other benefits", 12.3, "--bad"], ["Law and order", 3.8, "--warn"], ["Other", 18.8, "--muted"]];
const REV = [["Income tax", 32.5, "--accent"], ["GST", 19.1, "--good"], ["Other indirect tax", 6.5, "--n"], ["Corporate tax", 11.6, "--warn"], ["Other revenue", 8.8, "--muted"]];
function stack(items, x, base, k, w) {
  let y = base, o = "";
  items.forEach(([name, v, col]) => {
    const h = v * k;
    y -= h;
    o += SV.rect(x, y, w, h, "", { style: `fill:var(${col});stroke:var(--surface);stroke-width:2`, opacity: 0.85 });
    if (h > 17) o += SV.text(x + w / 2, y + h / 2 + 4, name + " " + money(v, 1), "sm bd", { "text-anchor": "middle", style: "font-size:11px;paint-order:stroke;stroke:var(--surface);stroke-width:3px" });
  });
  return o;
}
function labA() {
  if (!$("#ba") || !$("#bb") || !$("#bc")) return;
  const act = +$("#ba").value, dH = +$("#bb").value, dT = +$("#bc").value;
  const rev = [["Income tax", 32.5 * (1 + (1.5 * act) / 100) + dT, "--accent"], ["GST", 19.1 * (1 + act / 100), "--good"], ["Other indirect tax", 6.5 * (1 + act / 100), "--n"], ["Corporate tax", 11.6 * (1 + (2 * act) / 100), "--warn"], ["Other revenue", 8.8, "--muted"]];
  const sp = [["Healthcare", 16.2 + dH, "--accent"], ["Education", 13.5, "--good"], ["Pensions", 12.9, "--n"], ["Unemployment and other benefits", 12.3 * (1 - (2 * act) / 100), "--bad"], ["Law and order", 3.8, "--warn"], ["Other", 18.8, "--muted"]];
  const tr = rev.reduce((a, x) => a + x[1], 0), ts = sp.reduce((a, x) => a + x[1], 0), bal = tr - ts;
  $("#ba1").textContent = "$" + money(ts) + "bn"; $("#ba2").textContent = "$" + money(tr) + "bn";
  $("#ba3").textContent = (bal >= 0 ? "+" : "−") + "$" + money(Math.abs(bal)) + "bn"; $("#ba4").textContent = money((rev[0][1] / tr) * 100, 1) + "%";
  $("#bav").textContent = Math.abs(bal) < 0.05 ? "A balanced budget." : bal > 0 ? `Revenue is higher than spending: a budget surplus of $${money(bal)}bn.` : `Spending is higher than revenue: a budget deficit of $${money(-bal)}bn, which has to be borrowed.`;
  const note = act !== 0 && dH === 0 && dT === 0 ? (act < 0 ? " In a slump tax revenue falls and benefit spending rises automatically, so the budget moves towards deficit with no change in policy: that is an automatic stabiliser." : " In a boom tax revenue rises and benefit spending falls automatically, which moves the budget towards surplus and helps cool demand.") : "";
  $("#bav").textContent += note;
  const k = 3.1, base = 372;
  $("#labA").innerHTML = SV.line(60, base, 700, base) + stack(rev, 90, base, k, 230) + stack(sp, 420, base, k, 230) +
    SV.text(205, base + 22, "Revenue: $" + money(tr), "lbl bd", { "text-anchor": "middle" }) + SV.text(535, base + 22, "Spending: $" + money(ts), "lbl bd", { "text-anchor": "middle" });
}
Lib.slider($("#g1"), { id: "ba", label: "State of the economy (change in national income)", min: -10, max: 10, step: 1, value: 0, fmt: (v) => (v > 0 ? "+" : "") + v + "%" + (v < 0 ? " slump" : v > 0 ? " boom" : ""), onInput: labA });
Lib.slider($("#g2"), { id: "bb", label: "Policy: change in healthcare spending", min: -5, max: 10, step: 0.5, value: 0, fmt: (v) => (v > 0 ? "+$" : v < 0 ? "−$" : "$") + Math.abs(v) + "bn", onInput: labA });
Lib.slider($("#g3"), { id: "bc", label: "Policy: change in income tax revenue (rate change)", min: -10, max: 10, step: 0.5, value: 0, fmt: (v) => (v > 0 ? "+$" : v < 0 ? "−$" : "$") + Math.abs(v) + "bn", onInput: labA });

/* Lab 2: multiplier */
function labM() {
  if (!$("#ma") || !$("#mb")) return;
  const inj = +$("#ma").value, mpc = +$("#mb").value, k = 1 / (1 - mpc), tot = inj * k;
  $("#ma1").textContent = money(k, 2); $("#ma2").textContent = "$" + money(tot, 0) + "m"; $("#ma3").textContent = "$" + money(tot - inj, 0) + "m";
  $("#mav").textContent = `For every $1 of extra income people spend $${money(mpc, 2)} and save or lose the rest, so the total rise is ${money(k, 2)} times the injection. Raise the share spent and the multiplier grows.`;
  $("#labM").innerHTML = multChart({ n: 8, fin: 1, inj, mpc });
}
Lib.slider($("#g4"), { id: "ma", label: "Extra government spending", min: 5, max: 50, step: 5, value: 20, fmt: (v) => "$" + v + "m", onInput: labM });
Lib.slider($("#g5"), { id: "mb", label: "Share of extra income spent", min: 0.1, max: 0.9, step: 0.05, value: 0.8, fmt: (v) => Math.round(v * 100) + "%", onInput: labM });

/* Lab 3: tax systems. Progressive: 10% to 200, 30% 200-600, 50% above. Regressive: fuel duty 16 + 0.02 * income. */
const taxProg = (y) => 0.1 * Math.min(y, 200) + 0.3 * clamp(y - 200, 0, 400) + 0.5 * Math.max(0, y - 600);
const taxProp = (y) => 0.25 * y;
const taxReg = (y) => 16 + 0.02 * y;
const LX = (i) => 70 + i * 0.28, LY = (r) => 330 - r * 6;
function labR() {
  if (!$("#ra")) return;
  const y = +$("#ra").value, rows = [["Progressive", taxProg, "t1", "c1"], ["Proportional", taxProp, "t3", "c3"], ["Regressive", taxReg, "t2", "c2"]];
  rows.forEach((r, i) => { $("#r" + (i + 1)).textContent = "$" + money(r[1](y), 0) + " (" + money((r[1](y) / y) * 100, 1) + "%)"; });
  $("#rv").textContent = `At an income of $${y} the progressive tax takes ${money((taxProg(y) / y) * 100, 1)}%, the proportional tax 25% and the regressive tax ${money((taxReg(y) / y) * 100, 1)}%. Slide the income up: the progressive rate climbs, the proportional rate stays put and the regressive rate falls. (The regressive example is fuel duty at $2 a litre; at this income a household buys about ${money(8 + 0.01 * y, 0)} litres.)`;
  let o = SV.line(LX(0), LY(60), LX(0), LY(0)) + SV.line(LX(0), LY(0), LX(2050), LY(0));
  [10, 20, 30, 40, 50].forEach((r) => (o += SV.line(LX(0), LY(r), LX(2000), LY(r), "gr") + SV.text(LX(0) - 8, LY(r) + 4, r + "%", "sm", { "text-anchor": "end" })));
  [500, 1000, 1500, 2000].forEach((i) => (o += SV.text(LX(i), LY(0) + 18, "$" + i, "sm", { "text-anchor": "middle" })));
  o += SV.text(LX(0) + 6, LY(60) + 4, "Tax paid as % of income", "sm") + SV.text(LX(2050), LY(0) + 38, "Income", "sm", { "text-anchor": "end" });
  rows.forEach((r) => {
    const pts = []; for (let i = 60; i <= 2000; i += 20) pts.push([LX(i), LY(Math.min(55, (r[1](i) / i) * 100))]);
    o += SV.path(ptsPath(pts), r[3]) + SV.text(LX(2000) + 6, LY((r[1](2000) / 2000) * 100) + 4, r[0], "lbl bd " + r[2]);
  });
  o += SV.line(LX(y), LY(0), LX(y), LY(55), "dash", { style: "stroke:var(--muted);stroke-width:1.5" });
  rows.forEach((r) => (o += SV.circle(LX(y), LY(Math.min(55, (r[1](y) / y) * 100)), 6, "dot" + r[3].slice(1))));
  $("#labR").innerHTML = o;
}
Lib.slider($("#g6"), { id: "ra", label: "Income", min: 60, max: 2000, step: 20, value: 500, fmt: (v) => "$" + v, onInput: labR });

/* Lab 4: fiscal policy simulator. Shift in AD = change in G minus 0.7 x change in taxes (some of a tax change is saved). */
function labF() {
  if (!$("#fa") || !$("#fb")) return;
  const dG = +$("#fa").value, dT = +$("#fb").value, sh = dG - 0.7 * dT, [y, p] = solveAD(sh), bud = dT - dG;
  $("#fa1").textContent = money(y, 1) + (y > 50.5 ? " ▲" : y < 49.5 ? " ▼" : ""); $("#fa2").textContent = money(p, 1) + (p > 50.5 ? " ▲" : p < 49.5 ? " ▼" : "");
  $("#fa3").textContent = (bud >= 0 ? "+" : "−") + "$" + money(Math.abs(bud), 0) + "bn"; $("#fa4").textContent = sh > 1 ? "Expansionary" : sh < -1 ? "Contractionary" : "Neutral";
  let v;
  if (Math.abs(sh) < 1) v = "Spending and tax changes roughly cancel out, so aggregate demand hardly moves.";
  else if (sh > 0) v = `Aggregate demand shifts right. Real GDP rises by ${money(y - 50, 1)} and the price level by ${money(p - 50, 1)}. ${y > 61 ? "The economy is near full capacity, so a large share of the extra demand shows up as higher prices." : "Output rises by more than prices, so growth and employment are likely to benefit."} The initial effect on the budget is ${bud < 0 ? "a larger deficit" : "a smaller deficit"}.`;
  else v = `Aggregate demand shifts left. Real GDP falls by ${money(50 - y, 1)} and the price level by ${money(50 - p, 1)}. Inflationary pressure eases but jobs are at risk. The initial effect on the budget is ${bud > 0 ? "a smaller deficit" : "a larger deficit"}.`;
  $("#fv").textContent = v;
  $("#labF").innerHTML = adChart({ sh });
}
Lib.slider($("#g7"), { id: "fa", label: "Change in government spending", min: -20, max: 20, step: 1, value: 10, fmt: (v) => (v > 0 ? "+$" : v < 0 ? "−$" : "$") + Math.abs(v) + "bn", onInput: labF });
Lib.slider($("#g8"), { id: "fb", label: "Change in taxes (positive = tax rise)", min: -20, max: 20, step: 1, value: 0, fmt: (v) => (v > 0 ? "+$" : v < 0 ? "−$" : "$") + Math.abs(v) + "bn", onInput: labF });

/* ================= PRACTISE ================= */
Lib.classify($("#cl1"), { prompt: "Is each tax <b>direct</b> (on income or wealth) or <b>indirect</b> (on spending)?", buckets: [{ label: "Direct tax" }, { label: "Indirect tax" }], items: [
  { text: "Income tax", b: 0 }, { text: "Corporation tax", b: 0 }, { text: "Capital gains tax", b: 0 }, { text: "Inheritance tax", b: 0 },
  { text: "VAT / GST (sales tax)", b: 1 }, { text: "Excise duty on petrol", b: 1 }, { text: "Customs duty (tariff)", b: 1 }, { text: "Licence to own a car", b: 1 },
], done: "Direct taxes hit income and wealth; indirect taxes hit what you buy." });
Lib.classify($("#cl2"), { prompt: "Progressive, proportional or regressive?", buckets: [{ label: "Progressive" }, { label: "Proportional" }, { label: "Regressive" }], items: [
  { text: "Tax rate rises from 10% to 20% to 40% as income rises", b: 0 }, { text: "Inheritance tax on large estates, higher rates on larger sums", b: 0 },
  { text: "Everyone pays 25% of their income", b: 1 }, { text: "A flat 15% corporation tax on all firms' profits", b: 1 },
  { text: "A $20 annual licence fee that everyone pays", b: 2 }, { text: "Excise duty per litre of petrol: richer people pay a smaller share of income", b: 2 },
  { text: "Tax takes 40% of a $100 income but 20% of a $1,000 income", b: 2 }, { text: "Egypt's income tax rate rising from 10% to 15% to 20% to 22.5%", b: 0 },
], done: "Compare the percentage taken, not the dollars." });
Lib.classify($("#cl3"), { prompt: "Which would be <b>expansionary</b> and which <b>contractionary</b> fiscal policy?", buckets: [{ label: "Expansionary" }, { label: "Contractionary" }], items: [
  { text: "Cut income tax rates", b: 0 }, { text: "Raise spending on roads and rail", b: 0 }, { text: "Raise the tax-free allowance", b: 0 }, { text: "Increase benefits for the unemployed", b: 0 },
  { text: "Cut government spending on education", b: 1 }, { text: "Raise VAT", b: 1 }, { text: "Raise corporation tax", b: 1 }, { text: "Freeze public sector pay and cut projects", b: 1 },
], done: "Expansionary raises AD; contractionary reduces it." });
Lib.match($("#m1"), { prompt: "Match each principle of a good tax to what it means.", pairs: [
  ["Equity", "Tax is based on ability to pay: fair"],
  ["Certainty", "Taxpayers can understand and calculate what they owe"],
  ["Convenience", "The tax is easy to pay"],
  ["Economy", "Costs of collecting are much less than the revenue raised"],
  ["Flexibility", "Can be changed, or changes automatically, as the economy changes"],
  ["Efficiency", "Improves, or does not damage, the way markets work"],
], done: "Six qualities, six marks of vocabulary." });
Lib.match($("#m2"), { prompt: "Match the term to its definition.", pairs: [
  ["Budget deficit", "Government spending is higher than revenue"],
  ["Budget surplus", "Government revenue is higher than spending"],
  ["National debt", "Total amount the government has borrowed over time"],
  ["Multiplier effect", "Final change in AD is larger than the initial change"],
  ["Automatic stabilisers", "Spending and taxes that cushion booms and slumps with no policy change"],
  ["Tax incidence", "How the burden of an indirect tax is shared between consumers and producers"],
  ["Fiscal policy", "Government spending and taxation decisions to influence AD"],
], done: "Good vocabulary scores marks." });
Lib.order($("#o1"), { prompt: "Put the steps of the <b>multiplier</b> in order.", items: [
  "The government raises its spending by $20m",
  "Firms and workers receive $20m of extra income",
  "They spend part of it (say $16m) and save the rest",
  "That spending becomes income for other people, who spend part of it again",
  "The rounds continue, each smaller than the last",
  "Total rise in spending, income and output is larger than the original $20m",
], done: "That is the multiplier effect." });
Lib.order($("#o2"), { prompt: "Put the chain for <b>expansionary fiscal policy</b> in order.", items: [
  "The government cuts income tax rates",
  "Households' disposable income rises",
  "Consumption rises (and investment may follow)",
  "Aggregate demand shifts to the right",
  "Real GDP rises and firms take on more workers",
  "The price level may rise and the budget deficit may widen",
], done: "A full analysis chain." });
Lib.calc($("#c1"), { qs: [
  { q: "The Maldives forecast a budget deficit of $200m and government revenue of $1.4bn ($1,400m). How much did it plan to spend ($m)?", a: 1600, hint: "Deficit = spending − revenue.", sol: "Spending = revenue + deficit = 1,400 + 200 = <b>$1,600m</b> ($1.6bn)." },
  { q: "A government has revenue of $85bn and spending of $92bn. What is its budget balance ($bn)? Use a minus sign for a deficit.", a: -7, hint: "Budget balance = revenue − spending.", sol: "85 − 92 = <b>−$7bn</b>, a budget deficit of $7bn." },
  { q: "New Zealand 2016: revenue was NZ$78.5bn and spending NZ$77.5bn. What is the budget position (NZ$bn; positive for a surplus)?", a: 1, sol: "78.5 − 77.5 = <b>+NZ$1.0bn</b>, a small budget surplus." },
  { q: "Income tax was NZ$32.5bn out of total revenue of NZ$78.5bn. What percentage of revenue came from income tax? (1 d.p.)", a: 41.4, tol: 0.1, sol: "32.5 ÷ 78.5 × 100 = <b>41.4%</b>." },
  { q: "An economy has a budget deficit of $5bn and GDP of $100bn. What is the deficit as a percentage of GDP?", a: 5, sol: "5 ÷ 100 × 100 = <b>5%</b>." },
  { q: "A worker earns $30,000. The tax allowance is $10,000 and the income tax rate on taxable income is 20%. How much tax does she pay ($)?", a: 4000, hint: "Only income above the allowance is taxed.", sol: "Taxable income = 30,000 − 10,000 = 20,000. Tax = 20% × 20,000 = <b>$4,000</b>." },
  { q: "Government spending rises by $40m. People spend 75% of any extra income. Using multiplier = 1 ÷ (1 − share spent), calculate the total rise in income ($m).", a: 160, hint: "Multiplier = 1 ÷ 0.25.", sol: "Multiplier = 1 ÷ (1 − 0.75) = 4. Total rise = 4 × 40 = <b>$160m</b>." },
  { q: "A tax of $4 per unit raises the price consumers pay from $10 to $13. What percentage of the tax do consumers bear?", a: 75, sol: "Consumers pay $3 of the $4: 3 ÷ 4 × 100 = <b>75%</b> (so producers bear 25%)." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "What is meant by a regressive tax?", opts: ["A tax that falls in line with inflation", "A tax that reduces government revenue over time", "A tax that places a greater burden on the poor than the rich", "A tax that is replaced by one which generates more income"], a: 2, why: "A regressive tax takes a larger percentage of income from lower earners." },
  { q: "A government wants to redistribute income from the rich to the poor. Which tax changes would help?", opts: ["Cut corporation tax, raise sales tax", "Cut VAT, raise income tax", "Cut capital gains tax and inheritance tax", "Raise customs duties and excise duties"], a: 1, why: "Cutting an indirect (regressive) tax and raising a progressive direct tax moves the burden towards the rich." },
  { q: "In which situation will consumers bear the greatest share of an indirect tax?", opts: ["Elastic demand, inelastic supply", "Inelastic demand, inelastic supply", "Inelastic demand, elastic supply", "Elastic demand, elastic supply"], a: 2, why: "When demand is inelastic buyers keep buying, and when supply is elastic firms cut output rather than absorb the tax: so the price rises by most of the tax." },
  { q: "Which is an example of a direct tax?", opts: ["VAT", "Excise duty on alcohol", "Customs duty", "Capital gains tax"], a: 3, why: "Capital gains tax is a tax on the profit from selling an asset: a tax on wealth/income." },
  { q: "Which is a likely effect of expansionary fiscal policy?", opts: ["AD shifts left", "Real GDP and employment are likely to rise", "The budget moves towards surplus", "The price level is certain to fall"], a: 1, why: "Higher spending or lower taxes raise AD, which tends to raise output and employment." },
  { q: "Tax revenue from income tax rises in a boom with no change in tax rates. This is an example of:", opts: ["An automatic stabiliser", "A flat tax", "A windfall tax", "A regressive tax"], a: 0, why: "Revenue rising automatically in a boom (and falling in a slump) cushions swings in demand." },
  { q: "Which is an advantage of indirect taxes?", opts: ["They are always progressive", "They are relatively cheap and easy to collect", "They cannot raise prices", "They redistribute income to the poor"], a: 1, why: "Firms do much of the collecting, and they are harder to evade, but they tend to be regressive." },
  { q: "Which is a reason for government spending?", opts: ["To pay interest on the national debt", "To discourage demerit goods", "To protect domestic firms by taxing imports", "To raise the costs of polluters"], a: 0, why: "The other three are aims of taxation, not of spending." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Budget", "The relationship between government revenue and government spending."],
  ["Budget deficit", "Government spending is higher than government revenue. Budget balance = revenue − spending is negative."],
  ["Budget surplus", "Government revenue is higher than government spending."],
  ["Balanced budget", "Government spending and revenue are equal."],
  ["National debt", "The total amount the government has borrowed over time."],
  ["Multiplier effect", "The final impact on aggregate demand is greater than the initial change."],
  ["Direct tax", "A tax on income and wealth, such as income tax and corporation tax."],
  ["Indirect tax", "A tax on expenditure, such as VAT, excise duties and customs duties."],
  ["Progressive tax", "Takes a larger percentage of the income or wealth of the rich."],
  ["Proportional tax", "Takes the same percentage of income or wealth from all taxpayers."],
  ["Regressive tax", "Takes a larger percentage of the income or wealth of the poor."],
  ["Income tax", "A tax on income from employment and investments, above a tax allowance."],
  ["Corporation tax", "A tax on the profits of firms."],
  ["Capital gains tax", "A tax on profit made when an asset is sold for more than it cost."],
  ["Inheritance tax", "A tax on wealth above a certain amount passed on when someone dies."],
  ["Excise duty", "An indirect tax on certain goods such as alcohol, petrol and tobacco."],
  ["Customs duty", "A tax on imports, also called a tariff."],
  ["Tax allowance", "An amount of income that can be earned free of tax."],
  ["Tax base", "The source of tax revenue: what is taxed."],
  ["Tax burden", "The amount of tax paid, often shown as a percentage of GDP."],
  ["Incidence of tax", "How the burden of an indirect tax is shared between consumers and producers."],
  ["Automatic stabilisers", "Government spending and taxation that reduce fluctuations in economic activity with no change in policy."],
  ["Flat tax", "A tax system with a single rate."],
  ["Windfall tax", "An extra one-off tax on very high profits."],
  ["Informal economy", "The part of the economy not regulated, protected or taxed by the government."],
  ["Fiscal policy", "Decisions on government spending and taxation designed to influence aggregate demand."],
  ["Expansionary fiscal policy", "Rises in government spending and/or cuts in taxation designed to increase AD."],
  ["Contractionary fiscal policy", "Cuts in government spending and/or rises in taxation designed to reduce AD."],
] });
labA(); labM(); labR(); labF();
