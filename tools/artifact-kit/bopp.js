const clamp01 = (v) => Math.max(0, Math.min(1, v));
const sgn = (x, d = 0) => (x > 0 ? "+" : x < 0 ? "−" : "") + Lib.fmtN(Math.abs(x), d);

/* ---------- waterfall: items add up to zero ---------- */
function wf(items, n, H) {
  let run = 0; const rows = items.map((it) => { const a = run; run += it.v; return { ...it, a, b: run }; });
  const vals = rows.flatMap((r) => [r.a, r.b]).concat([0]);
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.14 || 10; lo -= pad; hi += pad;
  const top = 44, bottom = H - 54, Y = (x) => bottom - ((x - lo) / (hi - lo)) * (bottom - top), step = 660 / rows.length, bw = Math.min(80, step - 14), X = (i) => 70 + i * step;
  let o = SV.line(56, Y(0), 744, Y(0), "ax") + SV.text(60, Y(0) - 6, "0", "sm") + SV.text(60, 24, "$ billion (credits above zero, debits below)", "sm");
  rows.forEach((r, i) => {
    const op = clamp01(n - i); if (op <= 0) return;
    const y1 = Y(Math.max(r.a, r.b)), y2 = Y(Math.min(r.a, r.b)), h = Math.max(2, y2 - y1), cls = r.v >= 0 ? "f3" : "f2";
    o += `<rect x="${X(i)}" y="${y1}" width="${bw}" height="${h}" class="${cls}" style="opacity:${op * 0.7}"/><rect x="${X(i)}" y="${y1}" width="${bw}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.5" opacity="${op * 0.6}"/>`;
    o += SV.text(X(i) + bw / 2, r.v >= 0 ? y1 - 6 : y2 + 16, sgn(r.v, 0), "lbl bd" + (r.v >= 0 ? " t3" : " t2"), { "text-anchor": "middle", opacity: op });
    const parts = r.l.split("|"); parts.forEach((t, k) => { o += SV.text(X(i) + bw / 2, H - 30 + k * 13, t, "sm", { "text-anchor": "middle", opacity: op }); });
    if (i < rows.length - 1 && op > 0.9) o += SV.line(X(i) + bw, Y(r.b), X(i) + step, Y(r.b), "gr");
  });
  if (n >= rows.length) o += SV.text(400, 40, "Everything adds up to 0", "lbl bd t4", { "text-anchor": "middle" });
  return o;
}

/* ---------- stepper A: accounts add to zero ---------- */
const ITEMS_A = [{ l: "Current|account", v: -120 }, { l: "Capital|account", v: 4 }, { l: "Financial|account", v: 100 }, { l: "Net errors|and omissions", v: 16 }];
Lib.stepper($("#stA"), { w: 760, h: 340, label: "Waterfall showing the current, capital and financial accounts and net errors and omissions adding to zero", base: { n: 0 }, tween: 1100, dwell: 4400, draw: (s) => wf(ITEMS_A, s.n, 340), steps: [
  { cap: "A country has a <b>current account deficit of $120bn</b>: it paid out more for goods, services, income and transfers than it received.", s: { n: 1 } },
  { cap: "The <b>capital account</b> is small: +$4bn (for example, money brought in by migrants).", s: { n: 2 } },
  { cap: "The <b>financial account</b> is +$100bn: foreigners invested in or lent to the country. This inflow <b>finances</b> most of the deficit.", s: { n: 3 } },
  { cap: "That leaves −$16bn unexplained. <b>Net errors and omissions</b> of +$16bn is added for missing or mistaken records, so the whole balance of payments sums to <b>zero</b>.", s: { n: 4 } },
  { cap: "Key point: the <b>individual accounts</b> are not in balance, only the total is. A persistent deficit needs borrowing or foreign investment to pay for it, and that brings future outflows of interest, profits and dividends.", s: { n: 4 } },
] });

/* ---------- stepper B: switching vs reducing ---------- */
function spend(s) {
  const x0 = 130, k = 5.4, rows = [["Before policy", 60, 40, 1], ["After expenditure-switching", 80, 20, s.sw], ["After expenditure-reducing", 50, 30, s.rd]];
  let o = SV.text(x0, 24, "Spending in the economy (index, before = 100)", "sm") + SV.line(x0 + 100 * k, 36, x0 + 100 * k, 300, "gr");
  rows.forEach(([lab, d, m, op], i) => {
    if (op <= 0.01) return;
    const y = 50 + i * 90, dd = d * k, mm = m * k;
    o += SV.text(x0, y - 8, lab, "lbl bd", { opacity: op });
    o += `<rect x="${x0}" y="${y}" width="${dd}" height="46" class="f3" style="opacity:${op * 0.75}"/><rect x="${x0 + dd}" y="${y}" width="${mm}" height="46" class="f2" style="opacity:${op * 0.75}"/>`;
    o += SV.text(x0 + dd / 2, y + 28, "Home goods " + d, "lbl bd", { "text-anchor": "middle", opacity: op });
    o += SV.text(x0 + dd + mm / 2, y + 28, "Imports " + m, "lbl bd", { "text-anchor": "middle", opacity: op });
    o += SV.text(x0 + dd + mm + 10, y + 28, "Total " + (d + m), "lbl bd t1", { opacity: op });
  });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 320, label: "Bars showing how total spending is split between home goods and imports under each policy", base: { sw: 0, rd: 0 }, tween: 1100, dwell: 4300, draw: spend, steps: [
  { cap: "Before the policy, total spending is 100: 60 on <b>home-produced goods</b> and 40 on <b>imports</b>. The country has a current account deficit.", s: { sw: 0, rd: 0 } },
  { cap: "<b>Expenditure-switching</b> (a tariff, a lower exchange rate, supply-side policy): imports fall to 20 and home goods rise to 80. <b>Total spending is still 100.</b> Spending has been redirected, not reduced.", s: { sw: 1, rd: 0 } },
  { cap: "<b>Expenditure-reducing</b> (higher taxes, higher interest rates): total spending falls to 80. Imports fall to 30, but <b>home goods also fall to 50</b>, so output and jobs are likely to be hit.", s: { sw: 1, rd: 1 } },
  { cap: "Both policies reduce import spending. The difference: switching keeps home output and employment up (but may raise prices and prompt retaliation); reducing cuts spending on everything, which is likely to slow growth and raise unemployment.", s: { sw: 1, rd: 1 } },
] });

/* ---------- stepper C: exchange rate ---------- */
function fx(s) {
  const k = 240 / 530, d = 110 * s.sh, x1 = 375, y1 = 190, x2 = 375 + d / 2, y2 = 190 + 0.2264 * d;
  const Dy = (x) => 70 + (x - 110) * k, Sy = (x, sh) => 310 - (x - 110 - sh) * k;
  let o = SV.line(90, 330, 90, 36, "ax") + SV.line(90, 330, 680, 330, "ax") + SV.text(94, 34, "Exchange rate", "sm") + SV.text(94, 46, "(foreign currency per unit of home currency)", "sm") + SV.text(676, 350, "Quantity of home currency", "sm", { "text-anchor": "end" });
  o += SV.line(110, Dy(110), 640, Dy(640), "c2") + SV.text(646, Dy(640) + 4, "D", "lbl bd t2");
  o += SV.line(110, Sy(110, 0), 640, Sy(640, 0), "c1", { opacity: s.sh > 0.05 ? 0.45 : 1 }) + SV.text(646, Sy(640, 0) + 4, "S₁", "lbl bd t1", { opacity: s.sh > 0.05 ? 0.5 : 1 });
  if (s.sh > 0.02) { const xs = 110 + d, xe = 650, ys = Sy(xs, d), ye = Sy(xe, d); o += SV.line(xs, ys, xe, Math.max(ye, 40), "c4") + SV.text(xe - 4, Math.max(ye, 40) - 8, "S₂", "lbl bd t4"); }
  o += SV.line(90, y1, x1, y1, "gr") + SV.line(x1, y1, x1, 330, "gr") + SV.circle(x1, y1, 5, "dot1") + SV.text(60, y1 + 4, "e₁", "lbl bd t1") + SV.text(x1 - 6, 346, "Q₁", "sm");
  if (s.sh > 0.02) { o += SV.line(90, y2, x2, y2, "gr") + SV.line(x2, y2, x2, 330, "gr") + SV.circle(x2, y2, 6, "dot4") + SV.text(60, y2 + 4, "e₂", "lbl bd t4") + SV.text(x2 - 6, 346, "Q₂", "sm"); }
  if (s.tx > 0.5) { o += SV.rect(420, 40, 250, 74, "f4", { rx: 8 }) + SV.text(430, 62, "Lower exchange rate:", "lbl bd") + SV.text(430, 80, "export prices abroad fall,", "sm") + SV.text(430, 95, "import prices at home rise", "sm") + SV.text(430, 110, "(expenditure-switching)", "sm"); }
  return o;
}
Lib.stepper($("#stC"), { w: 700, h: 360, label: "Currency market diagram: supply of the home currency shifts right and the exchange rate falls", base: { sh: 0, tx: 0 }, tween: 1300, dwell: 4600, draw: fx, steps: [
  { cap: "The exchange rate is set where <b>demand for</b> the home currency (D, from foreign buyers of exports and investors) meets <b>supply of</b> it (S₁, from residents buying imports and assets abroad). Equilibrium is e₁.", s: { sh: 0, tx: 0 } },
  { cap: "To correct a current account deficit, the central bank may <b>sell the home currency</b> and buy foreign currency (adding to reserves) or cut interest rates. The <b>supply of the currency increases</b>: S₁ shifts right to S₂.", s: { sh: 1, tx: 0 } },
  { cap: "The exchange rate <b>falls from e₁ to e₂</b>. This is an <b>expenditure-switching</b> policy.", s: { sh: 1, tx: 0 } },
  { cap: "The lower rate makes exports <b>cheaper abroad</b> and imports <b>dearer at home</b>, so spending may switch to home goods. The trade balance improves <b>only if demand is elastic enough</b>, and dearer imports may cause inflation. The effect may be short term (see Chapter 49).", s: { sh: 1, tx: 1 } },
] });

/* ---------- stepper D: chain of effects ---------- */
const BW = 132, BH = 66, BXS = [6, 150, 294, 438, 582];
const BOX = [
  { c: 0, y: 24, t: ["Higher taxes, lower", "govt spending or", "higher interest rate"], need: 1, k: "f1" },
  { c: 1, y: 24, t: ["Disposable income", "and aggregate", "demand fall"], need: 2, k: "f1" },
  { c: 2, y: 24, t: ["Spending on", "imports falls"], need: 3, k: "f3" },
  { c: 3, y: 24, t: ["Home firms seek", "export markets to", "replace lost sales"], need: 4, k: "f3" },
  { c: 4, y: 24, t: ["Current account", "deficit narrows"], need: 5, k: "f3" },
  { c: 1, y: 190, t: ["Output and", "employment may", "fall; growth slows"], need: 6, k: "f2" },
  { c: 2, y: 190, t: ["Inflation may", "fall (a benefit)"], need: 6, k: "f4" },
  { c: 3, y: 190, t: ["Trade-off: a better", "balance of payments,", "a weaker home economy"], need: 7, k: "f2", w: 2 },
];
const ARR = [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 7]];
function chain(s) {
  let o = "";
  const bx = (b) => ({ x: BXS[b.c], y: b.y, w: b.w ? BXS[b.c + 1] - BXS[b.c] + BW : BW });
  const op = (b) => clamp01(s.n - b.need + 1);
  ARR.forEach(([f, t]) => {
    const A = BOX[f], B = BOX[t], a = bx(A), b = bx(B), o2 = op(B); if (o2 <= 0) return;
    if (A.y === B.y) o += SV.line(a.x + a.w, a.y + BH / 2, b.x - 8, b.y + BH / 2, "c3", { opacity: o2, "stroke-width": 2.5 }) + SV.arrowHead(b.x - 1, b.y + BH / 2, "r", "dot3").replace("<polygon", `<polygon opacity="${o2}"`);
    else o += SV.line(a.x + a.w / 2, a.y + BH, a.x + a.w / 2, b.y - 8, "c2", { opacity: o2, "stroke-width": 2.5 }) + SV.arrowHead(a.x + a.w / 2, b.y - 1, "d", "dot2").replace("<polygon", `<polygon opacity="${o2}"`);
  });
  o += SV.text(6, 14, "Benefit: the deficit narrows", "sm") + SV.text(6, 180, "Cost: the home economy weakens", "sm");
  BOX.forEach((B) => {
    const p = op(B); if (p <= 0) return; const b = bx(B);
    o += `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${BH}" rx="8" class="${B.k}" style="opacity:${p * 0.8}"/><rect x="${b.x}" y="${b.y}" width="${b.w}" height="${BH}" rx="8" fill="none" stroke="currentColor" stroke-width="1.5" opacity="${p * 0.5}"/>`;
    B.t.forEach((ln, i) => { o += SV.text(b.x + b.w / 2, b.y + 24 + i * 15 - (B.t.length === 2 ? 7 : 0) + (B.t.length === 2 ? 8 : 0) - 8 + 8, ln, "sm", { "text-anchor": "middle", opacity: p, style: "fill:currentColor;font-size:11.5px" }); });
  });
  return o;
}
Lib.stepper($("#stD"), { w: 740, h: 280, label: "Flow chart of how contractionary policy narrows a current account deficit and what it costs", base: { n: 0 }, tween: 900, dwell: 4300, draw: chain, steps: [
  { cap: "A government or central bank uses an <b>expenditure-reducing</b> policy: it raises taxes, cuts its spending or raises the interest rate.", s: { n: 1 } },
  { cap: "Households and firms have <b>less to spend</b>, so aggregate demand falls.", s: { n: 2 } },
  { cap: "Part of the lower spending is on <b>imports</b>, so import expenditure falls.", s: { n: 3 } },
  { cap: "Home firms that lose domestic sales may <b>look for export markets</b>, which could raise export earnings.", s: { n: 4 } },
  { cap: "Lower imports and possibly higher exports mean the <b>current account deficit narrows</b>.", s: { n: 5 } },
  { cap: "But the same fall in demand cuts <b>output and employment</b>, and slows growth. The lower inflation could be a benefit.", s: { n: 6 } },
  { cap: "The exam judgement: how big is the improvement against the cost? That depends on the <b>cause of the deficit</b>, the <b>state of the economy</b> and the <b>marginal propensity to import</b>.", s: { n: 7 } },
] });

/* ---------- Lab 1 ---------- */
function lab1() {
  const ids = ["b_a", "b_b", "b_c", "b_d", "b_e", "b_f"]; if (ids.some((i) => !$("#" + i))) return;
  const [g, s, p, sec, cap, fin] = ids.map((i) => +$("#" + i).value), ca = g + s + p + sec, ne = -(ca + cap + fin);
  $("#k1").textContent = sgn(ca, 0); $("#k2").textContent = sgn(cap + fin, 0); $("#k3").textContent = sgn(ne, 0);
  const big = Math.abs(ne) > 0.1 * Math.max(Math.abs(ca), 1);
  $("#kv").textContent = (ca < 0 ? `A current account deficit of ${Lib.fmtN(-ca, 0)} has to be matched by inflows on the capital and financial accounts.` : ca > 0 ? `A current account surplus of ${Lib.fmtN(ca, 0)} is matched by net outflows on the capital and financial accounts (residents investing and lending abroad).` : "The current account is balanced.") + (big ? " The net errors and omissions figure is large compared with the current account, which may suggest unreliable data or unrecorded flows." : "");
  $("#labK").innerHTML = wf([{ l: "Goods", v: g }, { l: "Services", v: s }, { l: "Primary|income", v: p }, { l: "Secondary|income", v: sec }, { l: "Capital|account", v: cap }, { l: "Financial|account", v: fin }, { l: "Net errors|and omissions", v: ne }], 8, 330);
}
const sl = (c, id, label, min, max, step, v, fn) => Lib.slider($("#" + c), { id, label, min, max, step, value: v, fmt: (x) => x, onInput: fn });
sl("g1", "b_a", "Goods balance", -400, 400, 5, -90, lab1); sl("g2", "b_b", "Services balance", -200, 200, 5, 45, lab1); sl("g3", "b_c", "Primary income balance", -150, 150, 5, -15, lab1);
sl("g4", "b_d", "Secondary income balance", -100, 100, 5, 22, lab1); sl("g5", "b_e", "Capital account", -20, 20, 1, 3, lab1); sl("g6", "b_f", "Financial account", -300, 300, 5, 35, lab1);

/* ---------- Lab 2 ---------- */
const POL = [
  { n: "Raise income tax", r: ["↓", "↗", "↓", "↑", "↓"], t: "R", v: "Disposable income falls, so spending on all goods, including imports, falls. Home firms may export more. The cost: slower growth and higher unemployment." },
  { n: "Cut government spending", r: ["↓", "↗", "↓", "↑", "↓"], t: "R", v: "Lower government spending reduces aggregate demand through the multiplier, so imports fall. Public sector jobs and suppliers may lose out." },
  { n: "Raise the interest rate", r: ["↓", "?", "↓", "↑", "↓"], t: "R", v: "Dearer borrowing cuts consumption and investment, lowering imports. But a higher rate may attract hot money and raise the exchange rate, making exports dearer and imports cheaper, so the net effect on trade is uncertain." },
  { n: "Limit bank lending", r: ["↓", "↗", "↓", "↑", "↓"], t: "R", v: "Less credit means less spending on everything, so this is expenditure-reducing even though it is not a tax or a tariff." },
  { n: "Import tariff", r: ["↓", "↘", "↔", "↓", "↑"], t: "S", v: "Dearer imports push buyers to home goods. Works best with close home substitutes. Risks: retaliation (exports may fall), higher prices and less efficiency." },
  { n: "Lower the exchange rate", r: ["↓", "↑", "↗", "↓", "↑"], t: "S", v: "Exports are cheaper abroad and imports dearer at home. Depends on elasticities and often only short term. Dearer imported inputs raise costs and prices." },
  { n: "Subsidise exporters", r: ["↔", "↑", "↔", "↓", "↔"], t: "S", v: "Lowers the price of exports abroad. Costs the government money and may break trade rules, inviting retaliation." },
  { n: "Training and infrastructure", r: ["↓", "↑", "↔", "↓", "↓"], t: "S", v: "Raises productivity and cuts costs, so exports become competitive and home goods replace imports. Slow, costly and uncertain, but benefits unemployment and inflation too." },
];
const pb = $("#pbtn");
POL.forEach((p, i) => { const b = document.createElement("button"); b.className = "b"; b.textContent = p.n; b.onclick = () => {
  $$("button", pb).forEach((x) => x.classList.remove("pri")); b.classList.add("pri");
  const lab = { "↓": "Falls", "↑": "Rises", "↗": "Likely rises", "↘": "May fall", "↔": "No direct change", "?": "Uncertain" };
  $("#ptab").innerHTML = `<tr><th>Imports</th><th>Exports</th><th>Total spending</th><th>Unemployment</th><th>Inflation</th><th>Type</th></tr><tr>${p.r.map((a) => `<td><b>${a}</b> ${lab[a]}</td>`).join("")}<td><b>${p.t === "S" ? "Expenditure-switching" : "Expenditure-reducing"}</b></td></tr>`;
  $("#pv").textContent = p.v; };
  pb.appendChild(b); });

/* ---------- Lab 3 ---------- */
function lab3() {
  if (!$("#t_a") || !$("#t_b")) return;
  const cut = +$("#t_a").value, m = +$("#t_b").value, dY = 1000 * cut / 100, dM = m * dY, nd = 40 - dM, need = 4 / m;
  $("#r1").textContent = (nd >= 0 ? "Deficit " : "Surplus ") + Lib.fmtN(Math.abs(nd), 1);
  $("#r2").textContent = Lib.fmtN(Math.abs(nd) / 10, 1) + "%"; $("#r3").textContent = "+" + Lib.fmtN(cut * 0.5, 1) + " points";
  $("#rv").textContent = `Imports fall by ${Lib.fmtN(dM, 1)}. With a marginal propensity to import of ${m}, closing the whole deficit of 40 would need income to fall by about ${Lib.fmtN(need, 0)}% of GDP, which would probably mean a deep recession. The lower the marginal propensity to import, the more costly expenditure-reducing policy is as a way to fix the balance of payments.`;
  const sc = 4, bars = [["Before", 40, "f2"], ["After the policy", nd, nd >= 0 ? "f2" : "f3"]];
  let o = SV.line(60, 40, 60, 230, "ax") + SV.line(60, 230, 720, 230, "ax") + SV.text(64, 30, "Current account deficit (+) or surplus (−), index of GDP = 1,000", "sm");
  bars.forEach(([l, v, c], i) => { const x = 140 + i * 240, h = Math.abs(v) * sc, y = v >= 0 ? 230 - h : 230; o += SV.rect(x, y, 120, Math.max(2, h), c, { style: "opacity:.75" }) + SV.text(x + 60, v >= 0 ? y - 8 : y + h + 16, (v >= 0 ? "" : "−") + Lib.fmtN(Math.abs(v), 1), "lbl bd", { "text-anchor": "middle" }) + SV.text(x + 60, 248, l, "sm", { "text-anchor": "middle" }); });
  $("#labT").innerHTML = o;
}
sl("g7", "t_a", "Fall in national income (% of GDP)", 0, 15, 0.5, 3, lab3); sl("g8", "t_b", "Marginal propensity to import", 0.05, 0.5, 0.05, 0.25, lab3);

/* ---------- Lab 4 ---------- */
function lab4() {
  if (!$("#x_a") || !$("#x_b") || !$("#x_c")) return;
  const d = +$("#x_a").value / 100, ex = +$("#x_b").value, im = +$("#x_c").value;
  const X = 100 * (1 + ex * d), M = 100 * (1 + d) * (1 - im * d), bal = X - M;
  $("#d1").textContent = Lib.fmtN(X, 1); $("#d2").textContent = Lib.fmtN(M, 1); $("#d3").textContent = sgn(bal, 1);
  $("#dv").textContent = `Combined elasticity = ${Lib.fmtN(ex + im, 1)}. ` + (ex + im >= 1.05 ? "Above 1: the trade balance improves, as the Marshall–Lerner condition suggests (when trade starts balanced)." : ex + im <= 0.95 ? "Below 1: the trade balance gets worse, because the dearer import bill outweighs the extra export revenue. This is the usual short-run position (the J curve, Chapter 49)." : "Close to 1: little change in the balance.") + " This ignores inflation, retaliation and spare capacity.";
}
sl("g9", "x_a", "Depreciation (%)", 0, 30, 1, 10, lab4); sl("g10", "x_b", "Price elasticity of demand for exports", 0, 2.5, 0.1, 0.3, lab4); sl("g11", "x_c", "Price elasticity of demand for imports", 0, 2.5, 0.1, 0.3, lab4);
const setLab4 = (a, b, c) => { [["x_a", a], ["x_b", b], ["x_c", c]].forEach(([id, v]) => { const el = $("#" + id); el.value = v; el.dispatchEvent(new Event("input")); }); };
$("#srb").onclick = () => setLab4(10, 0.3, 0.3); $("#lrb").onclick = () => setLab4(10, 1.0, 1.0);

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Which account does each transaction appear in?",
  buckets: [{ label: "Current account" }, { label: "Capital account" }, { label: "Financial account" }],
  items: [
    { text: "Export of machinery", b: 0 }, { text: "Dividends paid to foreign shareholders", b: 0 }, { text: "Foreign aid received", b: 0 }, { text: "Foreign tourists spending in the country", b: 0 },
    { text: "Government debt forgiveness", b: 1 }, { text: "Sale of a patent to a foreign firm", b: 1 }, { text: "Money brought in by migrants", b: 1 }, { text: "Foreign company buys mineral rights", b: 1 },
    { text: "A firm builds a factory abroad", b: 2 }, { text: "Foreign investors buy government bonds", b: 2 }, { text: "A bank loan from a foreign bank", b: 2 }, { text: "Central bank adds to foreign exchange reserves", b: 2 },
  ], done: "Investment flows go in the financial account; the income they earn goes in the current account.",
});
Lib.classify($("#cl2"), {
  prompt: "Is each policy expenditure-switching or expenditure-reducing?",
  buckets: [{ label: "Expenditure-switching" }, { label: "Expenditure-reducing" }],
  items: [
    { text: "Import tariff", b: 0 }, { text: "Import quota", b: 0 }, { text: "Lower exchange rate", b: 0 }, { text: "Subsidy to exporters", b: 0 }, { text: "Spending on training to raise productivity", b: 0 }, { text: "Embargo on imports of a good", b: 0 },
    { text: "Increase in income tax", b: 1 }, { text: "Cut in government spending", b: 1 }, { text: "Rise in the interest rate", b: 1 }, { text: "Limit on bank lending", b: 1 },
  ], done: "Switching redirects spending; reducing lowers it.",
});
Lib.match($("#m1"), { prompt: "Match each problem to the policy most likely to address it.", pairs: [
  ["Overvalued exchange rate harming exports", "Allow the exchange rate to fall to its market level"],
  ["Boom pulling in imports", "Contractionary fiscal or monetary policy"],
  ["Low productivity and poor skills", "Supply-side policy such as training and infrastructure"],
  ["Dumping by foreign firms", "Tariffs on the dumped goods"],
  ["Need to attract multinationals", "Supply-side policy and tax incentives"],
], done: "Matching policy to cause is a strong evaluation skill." });
Lib.order($("#o1"), { prompt: "Order the chain from a rise in income tax to the narrowing of the deficit and its cost.", items: [
  "The government raises income tax",
  "Disposable income falls",
  "Consumption and aggregate demand fall",
  "Spending on imports falls",
  "The current account deficit narrows",
  "Output and employment may fall as a cost",
], done: "Always end with the cost to the internal economy." });
Lib.calc($("#c1"), { qs: [
  { q: "A country has a deficit of $90bn on goods, a surplus of $45bn on services, primary income of −$15bn and secondary income of +$22bn. Calculate the current account balance ($bn).", a: -38, ph: "e.g. -10", sol: "−90 + 45 − 15 + 22 = <b>−$38bn</b>: a deficit." },
  { q: "Its financial account items are direct investment −$20bn, portfolio investment +$55bn, other investment +$10bn and reserve assets −$5bn. Calculate the financial account balance ($bn).", a: 40, sol: "−20 + 55 + 10 − 5 = <b>+$40bn</b>." },
  { q: "The capital account is +$3bn. Using the current account (−$38bn) and the financial account (+$40bn), calculate net errors and omissions ($bn).", a: -5, hint: "Add the three accounts. Net errors and omissions must make the total zero.", sol: "−38 + 3 + 40 = +5. To make the total zero, net errors and omissions = <b>−$5bn</b>." },
  { q: "A good has a world price of $80. The government imposes a 25% tariff. What is the new price paid by domestic buyers ($)?", a: 100, sol: "80 × 1.25 = <b>$100</b>." },
  { q: "After the tariff, 2,000 units are still imported. Calculate the government's tariff revenue ($).", a: 40000, sol: "Tariff per unit = $20. 20 × 2,000 = <b>$40,000</b>." },
  { q: "A country's current account deficit is $36bn and its GDP is $600bn. Calculate the deficit as a percentage of GDP.", a: 6, sol: "36 ÷ 600 × 100 = <b>6%</b>." },
  { q: "The marginal propensity to import is 0.3. A contractionary policy reduces national income by $50bn. By how much do imports fall ($bn)?", a: 15, sol: "0.3 × 50 = <b>$15bn</b>." },
  { q: "Export prices fall by 10% in foreign currency after a depreciation. Price elasticity of demand for exports is 0.5. By what percentage does the quantity of exports demanded rise?", a: 5, sol: "PED = % change in quantity ÷ % change in price, so % change in quantity = 0.5 × 10 = <b>5%</b>" },
] });
Lib.match($("#m2"), { prompt: "Match each term to its meaning.", pairs: [
  ["Direct investment", "Building or taking over a firm abroad"],
  ["Portfolio investment", "Buying shares or bonds without control of the firm"],
  ["Reserve assets", "Central bank holdings of gold and foreign exchange"],
  ["Hot money", "Short-term funds that move to find the highest interest rate"],
  ["Capital flight", "Residents moving money and production out of a country because of lost confidence"],
  ["Net errors and omissions", "The balancing item that makes the accounts sum to zero"],
  ["Expenditure-switching", "A policy that redirects spending from imports to home goods"],
], done: "Good vocabulary." });
Lib.quiz($("#qz1"), { qs: [
  { q: "Foreign investors buy shares in a domestic firm but do not gain control of it. Where does this appear?", opts: ["Current account, primary income", "Financial account, portfolio investment", "Capital account", "Current account, secondary income"], a: 1, why: "Buying shares without control is portfolio investment, part of the financial account. The dividends later paid appear in primary income." },
  { q: "Which is an expenditure-reducing policy?", opts: ["An import quota", "A lower exchange rate", "A rise in income tax", "A subsidy to exporters"], a: 2, why: "Higher income tax reduces disposable income and spending on everything, including imports." },
  { q: "Which type of policy is normally used only to reduce a deficit, not a surplus?", opts: ["Fiscal policy", "Monetary policy", "Exchange rate policy", "Supply-side policy"], a: 3, why: "Fiscal, monetary and exchange rate policy can go either way. Supply-side policy aims to raise competitiveness and so is used against a deficit." },
  { q: "Why might a higher interest rate have an uncertain effect on the trade balance?", opts: ["It always raises exports", "It may raise the exchange rate, making exports dearer and imports cheaper", "It raises government spending", "It lowers saving"], a: 1, why: "Spending falls, but hot money inflows may push up the exchange rate, which works against the aim." },
  { q: "A country imports 8,000 cars a year and sets an import quota of 10,000. What is the likely effect?", opts: ["Imports fall to 8,000", "Imports fall to 10,000", "Little or no effect on imports", "The deficit disappears"], a: 2, why: "A quota above the current quantity is not binding, so imports do not need to change." },
  { q: "What is an advantage of expenditure-switching over expenditure-reducing policy?", opts: ["It lowers inflation", "It may increase employment by raising exports", "It always raises the exchange rate", "It cuts government spending"], a: 1, why: "Switching redirects spending to home goods, so it may support jobs, whereas reducing policies cut output." },
  { q: "A financial account deficit is most worrying when it is caused by:", opts: ["Residents investing abroad for future income", "Capital flight due to lost confidence in the economy", "A rise in reserve assets", "Direct investment abroad by a multinational"], a: 1, why: "A loss of confidence can reduce tax revenue, jobs and growth and may cause the currency to depreciate." },
  { q: "The current account is −$60bn, the capital account +$2bn and the financial account +$50bn. What is net errors and omissions?", opts: ["−$8bn", "+$8bn", "+$112bn", "−$112bn"], a: 1, why: "−60 + 2 + 50 = −8, so net errors and omissions = +8 to make the total zero." },
  { q: "An import tariff is most likely to cut imports if:", opts: ["No home substitutes exist", "Close home-produced substitutes are available", "Other countries retaliate", "Demand for the good is inelastic"], a: 1, why: "Buyers can only switch if good domestic substitutes exist at similar quality." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Balance of payments", "A record of all economic transactions between a country's residents and the rest of the world."],
  ["Financial account", "Movements of funds into and out of the country: direct, portfolio and other investment, and reserve assets."],
  ["Capital account", "A small account for non-produced, non-financial assets such as debt forgiveness, migrants' funds and patents."],
  ["Net errors and omissions", "The balancing item that makes the accounts sum to zero."],
  ["Direct investment", "Building or taking over a firm in another country."],
  ["Portfolio investment", "Buying shares and bonds without control of a firm."],
  ["Reserve assets", "Central bank holdings of gold, foreign exchange, SDRs and the IMF reserve position."],
  ["Hot money", "Short-term funds that move between countries to chase higher interest rates or expected currency gains."],
  ["Capital flight", "Residents and firms moving money and production abroad because of lost confidence."],
  ["Expenditure-switching policy", "A policy that redirects spending from imports to home-produced goods without lowering total spending."],
  ["Expenditure-reducing policy", "A policy that lowers total spending in the economy, including spending on imports."],
  ["Contractionary fiscal policy", "Higher taxes and/or lower government spending."],
  ["Contractionary monetary policy", "A higher interest rate and tighter credit."],
  ["Protectionism", "Policy that restricts imports to protect domestic producers, for example tariffs and quotas."],
  ["Marginal propensity to import", "The proportion of an extra unit of income that is spent on imports."],
] });
