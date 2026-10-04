/* ---------- shared bits ---------- */
const lnPts = (m, c, ymax = 105) => { let lo = 0, hi = 100; if (m !== 0) { const a = (0 - c) / m, z = (ymax - c) / m; lo = Math.max(lo, Math.min(a, z)); hi = Math.min(hi, Math.max(a, z)); } return [lo, m * lo + c, hi, m * hi + c]; };
function bars(el, rows) { const mx = Math.max(...rows.map((r) => r[1])); el.innerHTML = rows.map((r) => `<div><span>${esc(r[0])}</span><i style="width:${(100 * r[1]) / mx}%"></i><b>${r[1]}</b></div>`).join(""); }

/* ---------- mark builder ---------- */
function markChart(s) {
  const X = (m) => 60 + m * 45, ka = s.ka, ev = s.ev;
  let o = SV.text(60, 52, "Knowledge, application and analysis (14 marks)", "lbl bd") + SV.text(60, 162, "Evaluation (6 marks)", "lbl bd");
  [[0, 5, "f2", "Level 1 (1–5)"], [5, 10, "f4", "Level 2 (6–10)"], [10, 14, "f3", "Level 3 (11–14)"]].forEach((b) => { o += SV.rect(X(b[0]), 62, X(b[1]) - X(b[0]), 52, b[2]) + SV.text((X(b[0]) + X(b[1])) / 2, 130, b[3], "sm", { "text-anchor": "middle" }); });
  [[0, 3, "f4", "E1 (1–3)"], [3, 6, "f3", "E2 (4–6)"]].forEach((b) => { o += SV.rect(X(b[0]), 172, X(b[1]) - X(b[0]), 52, b[2]) + SV.text((X(b[0]) + X(b[1])) / 2, 240, b[3], "sm", { "text-anchor": "middle" }); });
  o += SV.rect(60, 78, ka * 45, 20, "dot1", { opacity: 1 }) + SV.rect(60, 188, ev * 45, 20, "dot1", { opacity: 1 });
  o += SV.text(X(14) + 8, 93, Lib.fmtN(ka, 0) + " / 14", "lbl bd") + SV.text(X(6) + 8, 203, Lib.fmtN(ev, 0) + " / 6", "lbl bd");
  o += SV.text(X(6) + 90, 203, "Total ≈ " + Lib.fmtN(ka + ev, 0) + " / 20", "lbl bd t1", { "text-anchor": "start" });
  return o;
}
Lib.stepper($("#stMarks"), { w: 760, h: 270, label: "How the marks build across an essay", base: { ka: 0, ev: 0 }, draw: markChart, dwell: 5200, steps: [
  { cap: "<b>Opening paragraph.</b> Definitions in one block and a clear line on the question. Knowledge begins to score.", s: { ka: 2, ev: 0 } },
  { cap: "<b>The diagram the question asks for</b>, accurate and labelled for the context. Without it, the 14-mark scale is capped at Level 2.", s: { ka: 4, ev: 0 } },
  { cap: "<b>First analysis paragraph</b>: a developed chain, applied to the context with a real example or number.", s: { ka: 7, ev: 0 } },
  { cap: "<b>Second paragraph.</b> Two good chains still sit at the top of Level 2, which stops at 10. This is where many answers end.", s: { ka: 10, ev: 0 } },
  { cap: "<b>A third developed, applied chain</b> moves the answer into Level 3. Application and depth together make the difference.", s: { ka: 13, ev: 0 } },
  { cap: "<b>Micro-evaluation</b> at the end of each paragraph. Named factors with no explanation reach E1.", s: { ka: 13, ev: 2 } },
  { cap: "<b>Developed evaluation</b>: each lever is explained with economics, so the comment reaches E2.", s: { ka: 13, ev: 4 } },
  { cap: "<b>A justified judgement</b> that answers the question's scope word, with a reason and a condition. Full marks are available when everything is secure.", s: { ka: 14, ev: 6 } },
] });

/* ---------- consumption externality (air travel) ---------- */
const EX = { X: (q) => 80 + 6 * q, Y: (p) => 360 - 2.8 * p }, qT = (t) => (80 - t) / 1.6;
function exLine(m, c, cls, label, tcls, o = {}) {
  const [q1, p1, q2, p2] = lnPts(m, c); if (q2 <= q1) return "";
  let s = SV.line(EX.X(q1), EX.Y(p1), EX.X(q2), EX.Y(p2), cls, o.at);
  if (label) s += SV.text(EX.X(q2) + 5, EX.Y(p2) + (o.dy ?? 4), label, "lbl bd " + tcls, { "text-anchor": "start", ...(o.at && o.at.opacity !== undefined ? { opacity: o.at.opacity } : {}) });
  return s;
}
function exChart(s) {
  const t = s.t, Q = qT(t), Qs = 37.5, Ps = 42.5, sQ = 20 + 0.6 * Q;
  let o = SV.line(EX.X(0), EX.Y(110), EX.X(0), EX.Y(0)) + SV.line(EX.X(0), EX.Y(0), EX.X(104), EX.Y(0)) + SV.text(EX.X(0) + 6, EX.Y(110) + 6, "Price of flights ($)", "sm") + SV.text(EX.X(104), EX.Y(0) + 24, "Number of flights", "sm", { "text-anchor": "end" });
  if (s.wl > 0.01 && Math.abs(Q - Qs) > 0.05) o += SV.poly([[EX.X(Qs), EX.Y(Ps)], [EX.X(Q), EX.Y(sQ)], [EX.X(Q), EX.Y(80 - Q)]], "f2", { opacity: s.wl });
  o += exLine(-1, 100, "c1", "MPB", "t1", { at: { opacity: t > 0.01 ? 0.4 : 1 } });
  if (t > 0.01) o += exLine(-1, 100 - t, "c4", "MPB − tax", "t4", { dy: 14 });
  if (s.ms > 0.01) o += exLine(-1, 80, "c3 dash", "MSB", "t3", { at: { opacity: s.ms }, dy: 16 });
  o += exLine(0.6, 20, "c2", "MC", "t2");
  o += SV.line(EX.X(Q), EX.Y(sQ), EX.X(Q), EX.Y(0), "gr") + SV.line(EX.X(0), EX.Y(sQ), EX.X(Q), EX.Y(sQ), "gr") + SV.circle(EX.X(Q), EX.Y(sQ), 6, "dot1");
  o += SV.text(EX.X(Q), EX.Y(0) + 18, "Q = " + Lib.fmtN(Q, 1), "sm bd", { "text-anchor": "middle" }) + SV.text(EX.X(0) - 8, EX.Y(sQ) + 4, Lib.fmtN(sQ, 1), "sm", { "text-anchor": "end" });
  if (s.ms > 0.5) o += SV.line(EX.X(Qs), EX.Y(Ps), EX.X(Qs), EX.Y(0), "gr dash") + SV.circle(EX.X(Qs), EX.Y(Ps), 5, "dot3") + SV.text(EX.X(Qs) - 6, EX.Y(0) - 8, "Q* = 37.5", "sm bd t3", { "text-anchor": "end" });
  return o;
}
Lib.stepper($("#stExt"), { w: 760, h: 400, label: "Air travel consumption externality and a tax", base: { t: 0, ms: 0, wl: 0 }, draw: exChart, dwell: 5200, steps: [
  { cap: "Left alone, passengers and airlines meet where <b>marginal private benefit (MPB, demand) equals marginal cost (MC)</b>: 50 flights.", s: { t: 0, ms: 0, wl: 0 } },
  { cap: "But each flight also imposes <b>emissions and noise on third parties</b>. A consumption externality means <b>marginal social benefit (MSB) is below MPB</b>.", s: { t: 0, ms: 1, wl: 0 } },
  { cap: "The efficient number of flights is <b>Q* = 37.5</b>, where MSB = MC. The market over-consumes by 12.5 flights. The shaded triangle is the <b>welfare loss</b>.", s: { t: 0, ms: 1, wl: 1 } },
  { cap: "A tax of 20 per departing passenger, like <b>Air Passenger Duty</b>, shifts MPB down to MSB. Output falls to Q*, the external cost is internalised and the welfare loss disappears.", s: { t: 20, ms: 1, wl: 1 } },
  { cap: "<b>Evaluate:</b> if the government underestimates the damage and taxes 8, 45 flights are still bought and some welfare loss remains.", s: { t: 8, ms: 1, wl: 1 } },
  { cap: "<b>Evaluate:</b> if it overestimates and taxes 32, flights fall to 30, below Q*, creating a new welfare loss. Measuring the externality accurately matters.", s: { t: 32, ms: 1, wl: 1 } },
] });
const taxSl = Lib.slider($("#gTax"), { id: "tx", label: "Tax per flight", min: 0, max: 40, step: 1, value: 0, fmt: (v) => "$" + v, onInput: (t) => {
  const Q = qT(t), wl = 0.5 * Math.abs(Q - 37.5) * Math.abs(1.6 * Q - 60);
  $("#labTax").innerHTML = exChart({ t, ms: 1, wl: 1 });
  $("#rQ").textContent = Lib.fmtN(Q, 1); $("#rW").textContent = Lib.fmtN(wl, 0); $("#rR").textContent = "$" + Lib.fmtN(t * Q, 0);
  $("#rV").textContent = Math.abs(t - 20) < 0.5 ? "Spot on. The tax equals the external cost and the market reaches the social optimum." : t < 20 ? "Under-taxed. Flights are still above the social optimum, so a welfare loss remains." : "Over-taxed. Flights have fallen below the social optimum, so a welfare loss appears on the other side.";
} });
$("#labTax").innerHTML = exChart({ t: 0, ms: 1, wl: 1 }); taxSl.set(0);

/* ---------- AD/AS cost-push ---------- */
const AX = (y) => 80 + 10 * y, AY = (p) => 360 - 2.7 * p;
function adLine(m, c, cls, label, tcls, o = {}) { const y2 = 60, y1 = 0; return SV.line(AX(y1), AY(m * y1 + c), AX(y2), AY(m * y2 + c), cls, o.at) + (label ? SV.text(AX(y2) + 6, AY(m * y2 + c) + 4, label, "lbl bd " + tcls, { "text-anchor": "start", ...(o.at && o.at.opacity !== undefined ? { opacity: o.at.opacity } : {}) }) : ""); }
function adChart(s) {
  const sh = s.sh, ad = s.ad, Y = (80 + ad - sh) / 2, P = (120 + ad + sh) / 2;
  let o = SV.line(AX(0), AY(120), AX(0), AY(0)) + SV.line(AX(0), AY(0), AX(64), AY(0)) + SV.text(AX(0) + 6, AY(120) + 6, "Price level", "sm") + SV.text(AX(64), AY(0) + 24, "Real GDP", "sm", { "text-anchor": "end" });
  o += SV.line(AX(40), AY(115), AX(40), AY(0), "ax dash") + SV.text(AX(40), AY(115) - 6, "LRAS", "lbl bd", { "text-anchor": "middle" });
  if (sh > 0.5) o += adLine(1, 20, "c3", "SRAS₁", "t3", { at: { opacity: 0.35 } });
  o += adLine(1, 20 + sh, "c3", sh > 0.5 ? "SRAS₂" : "SRAS₁", "t3");
  if (Math.abs(ad) > 0.5) o += adLine(-1, 100, "c1", "AD₁", "t1", { at: { opacity: 0.35 } });
  o += adLine(-1, 100 + ad, "c1", s.adl || "AD₁", "t1");
  o += SV.line(AX(Y), AY(P), AX(Y), AY(0), "gr") + SV.line(AX(0), AY(P), AX(Y), AY(P), "gr") + SV.circle(AX(Y), AY(P), 6, "dot2");
  o += SV.text(AX(Y), AY(0) + 18, "Y = " + Lib.fmtN(Y, 1), "sm bd", { "text-anchor": "middle" }) + SV.text(AX(0) - 8, AY(P) + 4, "P = " + Lib.fmtN(P, 1), "sm bd", { "text-anchor": "end" });
  if (Y < 39.5) o += SV.line(AX(Y), AY(0) - 12, AX(40), AY(0) - 12, "c2") + SV.text((AX(Y) + AX(40)) / 2, AY(0) - 18, "Negative output gap", "sm bd t2", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stAD"), { w: 760, h: 400, label: "Cost-push inflation with a tax cut and an interest rate rise", base: { sh: 0, ad: 0, adl: "AD₁" }, draw: adChart, dwell: 5200, steps: [
  { cap: "Before the shock the economy is at <b>potential output</b> (LRAS). The price level is 60.", s: { sh: 0, ad: 0, adl: "AD₁" } },
  { cap: "<b>Cost-push shock.</b> Dearer energy and shipping shift <b>SRAS left</b>. Prices rise and output falls: inflation <em>and</em> a negative output gap.", s: { sh: 20, ad: 0, adl: "AD₁" } },
  { cap: "<b>Tax cut:</b> disposable income rises, so <b>AD shifts right</b>. Output recovers a little but the price level rises further.", s: { sh: 20, ad: 15, adl: "AD₂" } },
  { cap: "<b>Interest rate rise:</b> borrowing falls and saving rises, so <b>AD shifts back left</b>. The price level eases but output falls again.", s: { sh: 20, ad: 5, adl: "AD₃" } },
  { cap: "The two policies <b>pull AD in opposite directions</b> and neither touches SRAS. Prices fall mainly when <b>supply recovers</b> and SRAS returns.", s: { sh: 0, ad: 5, adl: "AD₃" } },
] });
const svgBox = (id, html) => { $(id).innerHTML = `<svg viewBox="0 0 760 400" role="img" aria-label="Diagram">${html}</svg>`; };
svgBox("#dgE1", exChart({ t: 0, ms: 1, wl: 1 })); svgBox("#dgE2", exChart({ t: 20, ms: 1, wl: 1 }));
svgBox("#dgA1", adChart({ sh: 20, ad: 5, adl: "AD₃" }));

/* ---------- sentence upgrader ---------- */
function upgrader(el, o) {
  el.classList.add("up");
  el.innerHTML = `<div class="row"><label for="${o.id}">Example</label><select id="${o.id}">${o.items.map((x, i) => `<option value="${i}">${esc(x.q)}</option>`).join("")}</select></div>
    <div class="up-lv">${o.labels.map((l) => `<span>${l}</span>`).join("")}</div><div class="up-txt" aria-live="polite"></div><div class="up-why"></div>
    <div class="row"><button class="b pri" data-a="u">Upgrade ▲</button><button class="b" data-a="r">Reset</button></div>`;
  const sel = $("select", el), txt = $(".up-txt", el), why = $(".up-why", el), pills = $$(".up-lv span", el), up = $("[data-a=u]", el);
  let lv = 0;
  const paint = () => { const it = o.items[+sel.value]; txt.textContent = it.lv[lv]; why.textContent = it.why[lv]; pills.forEach((p, i) => p.classList.toggle("on", i <= lv)); up.disabled = lv >= o.labels.length - 1; };
  up.onclick = () => { lv++; paint(); };
  $("[data-a=r]", el).onclick = () => { lv = 0; paint(); };
  sel.onchange = () => { lv = 0; paint(); };
  paint();
}
upgrader($("#upA"), { id: "upAs", labels: ["Generic", "Context", "Mechanism in context", "Real example"], items: [
  { q: "Tax on air travel (M23 Q2)", lv: ["A tax reduces demand, which reduces pollution.", "A tax on air travel reduces the number of flights, which reduces emissions.", "A tax on air travel raises ticket prices, so some passengers switch to rail or stay at home. Fewer flights mean less carbon and noise, so the market moves towards the efficient quantity.", "The UK's Air Passenger Duty adds to the price of each departing ticket. On short routes such as London to Paris, where trains are a close substitute, some passengers may switch to rail. Fewer flights mean less carbon and noise, so the market moves towards the efficient quantity."],
    why: ["Starting point: true, but it could be about anything.", "Added the context nouns: air travel, flights, emissions.", "Added the mechanism in context: price rise, substitutes, less carbon and noise, the efficient quantity.", "Added a real policy and route, which also shows why demand could be elastic."] },
  { q: "Depreciation in a low-income country (S23/42 Q4)", lv: ["A depreciation makes exports cheaper and imports dearer, so growth rises.", "A depreciation of a low-income country's currency makes its exports cheaper and its imports dearer, so growth could rise.", "For a low-income country that exports coffee or cotton, a depreciation lowers foreign prices, but if supply is slow to respond and demand for exports is inelastic, export revenue may rise little while imported fuel and machinery cost more.", "For a country such as Ethiopia, which relies on coffee exports, a depreciation lowers the price abroad. If supply cannot expand quickly and demand is inelastic, export revenue may rise little while imported fuel and machinery cost more."],
    why: ["Starting point: textbook, but not about a low-income country.", "Added the context: a low-income country, and a hedge (could).", "Added features of a low-income country: primary exports, supply response, elasticity, imported inputs.", "Added a named country that fits the features."] },
  { q: "Minimum wage in a monopsony (M25 Q3)", lv: ["A minimum wage raises wages and may reduce jobs.", "In a monopsony labour market, an effective minimum wage raises wages and may change employment.", "A monopsonist hires where the marginal cost of labour equals MRP and pays a wage below MRP. A minimum wage above that wage makes the marginal cost of labour equal to the wage, so employment may rise as well as pay, up to where MRP equals the minimum wage.", "If a hospital group is the main employer of nurses in a region, it hires where marginal cost of labour equals MRP and pays below MRP. A minimum wage above the current wage could raise both pay and the number of nurses hired, up to where it equals MRP. Beyond that point jobs would fall."],
    why: ["Starting point: the competitive-market answer, which is the wrong model here.", "Named the market, but gave no prediction.", "Used the monopsony model correctly. This is where the marks are.", "Added a realistic employer and the limit of the effect."] },
  { q: "Globalisation and a low-income country (S24/42 Q5)", lv: ["Globalisation creates jobs but can exploit workers.", "Globalisation creates jobs in low-income countries but can exploit workers, which affects the standard of living.", "Foreign investment creates jobs and raises incomes through the multiplier, but weak safety and pay rules could mean low wages and dangerous work. The material standard of living may rise while health and working conditions do not.", "In Bangladesh, garment exports have created millions of jobs and raised incomes, but the collapse of the Rana Plaza building in 2013, which killed more than 1,100 workers, shows how material living standards can rise while safety and working conditions lag."],
    why: ["Starting point: a list of effects.", "Joined the effects to the standard of living, which the question names.", "Added mechanisms and split material from non-material living standards.", "Added a real case that proves the split."] },
] });
upgrader($("#upE"), { id: "upEs", labels: ["No evaluation", "E1: lever named", "E2: lever explained", "E2: linked to the judgement"], items: [
  { q: "A tax on flights", lv: ["A tax raises the price of flights.", "However, it may not work if demand is inelastic.", "However, if business travellers have few substitutes, demand may be inelastic, so the price rise cuts flights by a smaller percentage and the externality stays largely uncorrected, although revenue rises.", "However, if business travellers have few substitutes, demand may be inelastic, so the price rise cuts flights by a smaller percentage and the externality stays largely uncorrected. The tax is therefore more likely to work on elastic leisure routes, so a government can only partly correct the market failure."],
    why: ["Analysis, not evaluation. It describes what the tax does.", "A lever (elasticity) is named. A simple comment with no development: E1.", "Explains how elasticity changes the outcome using economics: E2.", "Ties the point back to what the question asked (the extent): top of E2."] },
  { q: "Fiscal policy and a negative output gap", lv: ["Government spending raises aggregate demand.", "But it could cause crowding out.", "But if the extra borrowing raises interest rates, private investment may fall, so part of the rise in AD is offset and output rises by less than the multiplier suggests.", "But if the extra borrowing raises interest rates, private investment may fall, so output rises by less than the multiplier suggests. Fiscal policy may therefore close only part of the gap, which supports pairing it with supply-side policy."],
    why: ["Analysis, not evaluation.", "A recognised limitation, named only: E1.", "Explains the process and what it does to the size of the effect: E2.", "Links to the judgement about effectiveness and to an alternative policy."] },
  { q: "Membership of a free trade area (W24/41 Q5)", lv: ["An FTA lowers prices for consumers.", "However, it depends on elasticity.", "However, if demand for the imported goods is price inelastic, or consumers prefer domestic brands, removing tariffs changes quantities little, so the gain in consumer surplus is small.", "However, if demand is price inelastic, removing tariffs changes quantities little, so the gain in consumer surplus is small. Membership is therefore not always beneficial: the gain is largest for price-elastic goods where domestic firms can survive the competition."],
    why: ["Analysis, not evaluation.", "Lever named: E1.", "Explains why the benefit shrinks: E2.", "Answers the scope word 'always' directly."] },
] });

/* ---------- classify, order, match, quiz, calc ---------- */
Lib.classify($("#clApp"), { prompt: "Drag each sentence into a box, then check.", noShuffle: false, buckets: [{ label: "Generic: could be in any essay on taxes" }, { label: "Applied: only fits this question" }], items: [
  { text: "Taxes can reduce demand for goods.", b: 0 },
  { text: "A tax on air travel raises ticket prices, so fewer leisure passengers on budget routes are likely to fly.", b: 1 },
  { text: "Governments use taxes to change behaviour.", b: 0 },
  { text: "The UK's Air Passenger Duty adds a fixed amount to each departing passenger's ticket, which airlines may pass on to travellers.", b: 1 },
  { text: "If demand is inelastic, a tax will not change quantity much.", b: 0 },
  { text: "Business travellers often must attend meetings in person, so demand for business-class flights may be inelastic and a tax could raise revenue without cutting emissions much.", b: 1 },
  { text: "The tax shifts the supply curve to the left.", b: 0 },
  { text: "Short-haul flights such as London to Paris have close substitutes in rail, so demand may be more elastic.", b: 1 },
  { text: "Externalities are costs to third parties.", b: 0 },
  { text: "Carbon emissions from jet fuel impose costs on people who never bought a ticket.", b: 1 },
], done: "Notice that the applied sentences keep the same economics but only fit flights." });
Lib.calc($("#cData"), { qs: [
  { q: "Nominal wages rose 2.8% and inflation was 3.4%. Approximate the change in real wages (use a minus sign for a fall).", a: -0.6, tol: 0.05, unit: "%", hint: "Real change is roughly the nominal change minus inflation.", sol: "2.8 − 3.4 = −0.6%. Real wages fell, even though nominal wages rose." },
  { q: "Disposable income rose 1.2% against inflation of 3.4%. Approximate the change in real disposable income.", a: -2.2, tol: 0.05, unit: "%", hint: "Same method.", sol: "1.2 − 3.4 = −2.2%. Real disposable income fell, so the material standard of living for many households probably fell." },
] });
Lib.match($("#mEx"), { prompt: "Match each real example to what it best illustrates.", pairs: [
  ["UK Soft Drinks Industry Levy (2018)", "An indirect tax on a demerit good that led firms to reformulate"],
  ["EU Emissions Trading System", "Tradable pollution permits under a cap"],
  ["Norway's tax exemptions for electric cars", "A subsidy-type incentive to encourage a good with fewer externalities"],
  ["Water companies in England and Wales", "Natural monopolies under regulation"],
  ["OPEC production quotas", "Collusion and the incentive to cheat"],
  ["Kraft's takeover of Cadbury (2010)", "External growth by takeover"],
  ["Zimbabwe in 2008", "Hyperinflation linked to money supply growth"],
  ["Sri Lanka in 2022", "Default on foreign debt"],
  ["Bangladesh garment industry", "Export-led growth alongside exploitation risk"],
], done: "Each example now has a job in an essay." });

const RW = [
  ["UK Soft Drinks Industry Levy (2018)", "A tiered levy on soft drinks with added sugar. Many manufacturers cut the sugar in their recipes to avoid the higher rate.", "Indirect taxes and demerit goods. Shows a tax can change producer behaviour, not only demand. Evaluate: reformulation may cut revenue; poorer households spend a larger share of income on drinks."],
  ["Air Passenger Duty (UK)", "A tax charged per departing passenger, with the rate depending on distance and class of travel.", "Pricing a consumption externality (M23 Q2). Use to discuss elasticity on short versus long routes and business versus leisure travellers."],
  ["London Congestion Charge (2003) and Singapore's Electronic Road Pricing", "Charges for driving in busy areas. Singapore varies the price by road and time of day.", "Taxing a negative externality of consumption. Evaluate: setting the right charge, fairness to low-income drivers, traffic displaced to other roads."],
  ["EU Emissions Trading System", "A cap on emissions with tradable permits. It covers power, heavy industry and flights within Europe.", "Pollution permits as a market-based alternative to taxes. Evaluate: setting the cap, price volatility, international leakage."],
  ["Electric cars in Norway", "Tax exemptions and other incentives have helped make electric cars a large majority of new car sales.", "S23/42 Q2: encouraging electric vehicles. Evaluate: cost to the government, charging infrastructure, richer buyers gain most (equity)."],
  ["NHS versus US health care", "The UK's NHS is mainly tax-funded and free at the point of use. US health care relies far more on private insurance.", "Merit goods and public versus private provision (W23/41 Q2). Evaluate: allocative efficiency and positive externalities against profit-driven efficiency and equity."],
  ["Water companies in England and Wales", "Each serves a region as a monopoly and is regulated on prices and investment by Ofwat.", "Natural monopoly and privatisation (W24/42 Q3). Evaluate: a state monopoly can become a private monopoly that needs a regulator."],
  ["OPEC", "A group of oil producers that sets output targets to influence the price. Members have sometimes produced above their quotas.", "Collusion and the incentive to cheat (M23 Q3, S26/44 Q3). Evaluate: unstable, and demand and non-OPEC supply limit the power."],
  ["UK supermarkets", "A few large chains compete through loyalty cards, price matching and own brands. Discounters such as Aldi and Lidl have increased price competition.", "Oligopoly and non-price competition (M25 Q2). Evaluate: contestability, and the cost of advertising and promotion."],
  ["Kraft's takeover of Cadbury (2010)", "One firm bought another, rather than two firms forming a new company.", "Takeover versus merger (S25/41 Q3). Evaluate: cost savings may not reach consumers; cultural clashes and job cuts can follow."],
  ["The NHS as an employer of nurses", "It is the main employer of nurses in the UK, giving it strong buying power in that labour market.", "Monopsony (M25 Q3, W24/43 Q3). Evaluate: a minimum wage could raise pay and employment, but the effect depends on elasticities and its size."],
  ["UK mini-budget (September 2022) and Bank Rate rises", "Large tax cuts were announced when inflation was close to 10%. The pound fell and borrowing costs rose. Bank Rate went from 0.1% in late 2021 to 5.25% by August 2023.", "Cost-push inflation with conflicting policies (S24/42 Q4). Evaluate: time lags, supply-side causes, trade-offs with output."],
  ["Japan's negative interest rates", "The Bank of Japan kept a policy rate below zero from 2016 until March 2024 while inflation stayed low for years.", "Limits of monetary policy and the liquidity trap (S25/42 Q4, S26/41 Q1). Evaluate: low rates may not lift spending."],
  ["Zimbabwe in 2008", "Rapid money printing was followed by hyperinflation.", "Quantity theory and money supply (W24/43 Q4, S26/42 Q4). Evaluate: velocity and output also matter; most inflation is not this extreme."],
  ["Fiscal stimulus after 2008", "The UK cut VAT from December 2008 to the end of 2009. The US passed a large recovery act in 2009. China launched a major spending programme.", "Fiscal policy, the multiplier and output gaps (W23/43 Q4, S25/41 Q4). Evaluate: crowding out, debt, size of multiplier, time lags."],
  ["EU customs union and USMCA", "EU members share a common external tariff. The USMCA is a free trade area in which each member sets its own external tariffs.", "FTA versus customs union (S25/41 Q5). Use to explain the common external tariff and rules of origin."],
  ["US tariffs on Chinese goods (2018 onwards)", "Tariffs were followed by retaliation from China.", "Tariffs, retaliation and trade wars (W24/43 Q5, M25 Q5). Evaluate: higher prices, protected inefficient firms, welfare loss."],
  ["Vietnam and foreign investment", "After the Doi Moi reforms in 1986 Vietnam opened to trade. Foreign firms such as Samsung built large electronics plants in the north.", "Globalisation, FDI and growth in a developing economy (S24/42 Q5). Evaluate: linkages to local firms, low-skilled jobs, profit repatriation."],
  ["Bangladesh garments and Rana Plaza", "Garments are a leading export and employ millions. The Rana Plaza collapse in 2013 killed more than 1,100 workers.", "Globalisation and standard of living (M23 Q5, S24/42 Q5). Evaluate: material gains against safety and working conditions."],
  ["Sri Lanka's debt default (2022)", "Sri Lanka stopped repaying most foreign debt after its foreign exchange reserves ran short.", "External debt in developing countries (S26/41 Q5, W24/42 Q5). Evaluate: foreign-currency debt, falling currency, quality of the projects borrowed for."],
  ["Turkey's lira", "The lira lost a large share of its value in 2018 and again in 2021.", "Depreciation, imported inflation and foreign-currency debt (S23/42 Q4). Evaluate: Marshall–Lerner, supply response."],
  ["Bhutan and Gross National Happiness", "Bhutan has promoted this as an alternative to relying on GDP. The global Multidimensional Poverty Index covers health, education and living standards.", "Measuring the standard of living (W23/42 Q5, S26/42 Q5). Evaluate: broader measures are harder to collect and compare."],
];
$("#bank1").innerHTML = RW.map((r) => `<div class="rw"><h3>${esc(r[0])}</h3><p>${esc(r[1])}</p><div class="use"><b>Exam use:</b> ${esc(r[2])}</div></div>`).join("");

Lib.order($("#oChain"), { prompt: "A tax on air travel and allocative efficiency. Put the chain in order.", items: [
  "The government adds a tax per passenger on flights",
  "Airlines pass the cost on, so the price of a ticket rises",
  "Quantity demanded of flights falls along the demand curve",
  "Fewer flights means less carbon and noise for third parties",
  "The external cost is internalised and output moves towards where MSB equals MC",
  "Allocative efficiency improves and the welfare loss shrinks",
], done: "Six links, each one explained." });
Lib.order($("#oPara"), { prompt: "Put the parts of an analysis paragraph in order.", items: [
  "Open with the question's own words to answer it straight away",
  "Explain the mechanism in a chain: because, so, which leads to",
  "Apply it: context words, a real example or a number",
  "Refer to your diagram and say what the shift or area shows",
  "Add one or two sentences of evaluation specific to this point",
  "Close by linking back to what the question asked",
], done: "That is the paragraph used in the model essays." });
Lib.order($("#oPlan"), { prompt: "Order the five-minute plan.", items: [
  "Underline the command word, the limit word and the context",
  "Write your answer to the question in one sentence",
  "Pick three analytical chains and the diagram that supports them",
  "Add one application to each chain: an example, a number or the context",
  "Choose three evaluation levers (CASTLES) and one for the conclusion",
  "Draft the first line of the judgement",
], done: "Five minutes, and the essay is half written." });

Lib.quiz($("#qDia"), { qs: [
  { q: "A student answers an inflation question with curves labelled D and S and axes labelled Price and Quantity. What is the problem?", opts: ["Nothing. They mean the same thing.", "A macro diagram needs AD, SRAS (or AS), 'Price level' and 'Real GDP'.", "It should be MC and MR.", "Axes are not required."], a: 1, why: "Examiners flagged D and S labels on macro diagrams in several series." },
  { q: "In a monopoly diagram, which area shows supernormal profit?", opts: ["Between MR and MC at the profit-maximising output", "Between AR and AC at the profit-maximising output, multiplied by that output", "Under the AR curve", "Between MC and AC"], a: 1, why: "Profit per unit is AR minus AC at the output where MR = MC. Misdrawn profit areas cost marks in S25/42." },
  { q: "Where must the MC curve cut the AC curve?", opts: ["At the lowest point of AC", "At the highest point of AC", "Anywhere on AC", "At the MR curve"], a: 0, why: "MC cuts AC at its minimum. Many diagrams missed this." },
  { q: "The question names an injections and withdrawals graph. The student draws an accurate AD/AS diagram instead. What is likely?", opts: ["Full credit, because it is equivalent", "The 14-mark scale is capped at Level 2", "A bonus for a different method", "No effect"], a: 1, why: "The mark scheme says no J/W graph means maximum Level 2 (S25/42 Q4)." },
  { q: "A student draws a good diagram but never mentions it in the essay. What is likely?", opts: ["Full credit for the diagram alone", "Limited credit, because analysis marks come from explaining and using it", "Extra marks for neatness", "No difference"], a: 1, why: "Reports flag well-presented diagrams with no reference in the text as a repeated fault." },
  { q: "A question is about a negative output gap. The student's diagram has actual output above potential. What follows?", opts: ["The diagram is fine", "The diagram is wrong and the analysis built on it is weakened", "It earns an evaluation mark", "Only the labels are wrong"], a: 1, why: "S25/41 reported candidates confusing negative and positive output gaps." },
] });
Lib.match($("#mScope"), { prompt: "Match each word or phrase in a question to the move that evaluates it.", pairs: [
  ["always / never", "Find a realistic case where it does not hold and say when."],
  ["all the benefits ... all the costs", "Test each half separately. The claim fails if either half fails."],
  ["equally", "Compare the size of the effect on each group and find a reason it differs."],
  ["automatically", "Show what else has to happen before the outcome follows."],
  ["alone / only", "Say what other policies or conditions are needed alongside."],
  ["fully explain / adequate / satisfactory", "Judge the assumptions and what the model leaves out."],
  ["to what extent do you agree", "Argue both sides, then give a weighted verdict with a reason."],
  ["likely impact", "Show the outcome is probable, not certain, and what could change it."],
], done: "Use the move in your conclusion as well as in the body." });
Lib.classify($("#clEval"), { prompt: "Drag each sentence to a level, then check.", buckets: [{ label: "Not evaluation yet" }, { label: "E1: simple comment" }, { label: "E2: developed and explained" }], items: [
  { text: "A tax raises the price of a flight.", b: 0 },
  { text: "Emissions from aircraft are a negative externality.", b: 0 },
  { text: "Airlines may pass part of the tax on to passengers.", b: 0 },
  { text: "However, it may not work if demand is inelastic.", b: 1 },
  { text: "The tax could be costly to collect.", b: 1 },
  { text: "Another policy might be better.", b: 1 },
  { text: "It depends on the time period.", b: 1 },
  { text: "If business travellers have few substitutes, demand may be inelastic, so the price rise cuts flights by a smaller percentage and the externality stays largely uncorrected, although revenue rises.", b: 2 },
  { text: "Setting the tax equal to the external cost needs an accurate measure of the damage from emissions. If it is too low a welfare loss remains, and if too high output falls below the social optimum, so the tax may improve but not fully correct the failure.", b: 2 },
  { text: "In the long run the tax could encourage airlines to invest in fuel-efficient planes, cutting emissions per flight, which might make the policy more effective over time than it first appears.", b: 2 },
], done: "The first group is analysis. E1 names a lever. E2 explains how the lever changes the result." });
Lib.quiz($("#qConc"), { qs: [
  { q: "Question: evaluate the statement that MNCs always promote economic growth in a low-income country. Which conclusion is strongest?", opts: ["MNCs have advantages and disadvantages for low-income countries.", "MNCs often raise growth through investment and jobs, but not always: transfer pricing, low-skilled jobs and damage to local firms can limit or reverse it, so the effect depends on linkages and regulation in the host country.", "MNCs are good for growth.", "MNCs always promote growth, as shown above."], a: 1, why: "It gives a verdict, tests 'always', names reasons and states what the outcome depends on." },
  { q: "Question: to what extent is more government spending a sensible way to raise growth? Which conclusion is strongest?", opts: ["Government spending is sensible if there is spare capacity, because the multiplier raises output without much inflation. Near full employment it may crowd out private spending or raise prices, so it is sensible only in some conditions.", "Government spending can help growth but also has costs.", "Yes, it is sensible.", "In summary I have discussed growth and government spending."], a: 0, why: "It weighs the arguments, answers 'sensible' and gives a condition. The others summarise or assert." },
] });

Lib.quiz($("#qMark"), { qs: [
  { q: "Which best describes Level 3 on the 14-mark scale?", opts: ["Detailed knowledge, accurate concepts and diagrams that are fully explained, developed analysis, well organised", "Some relevant knowledge with limited development", "A small number of relevant points", "Mainly descriptive"], a: 0, why: "Level 3 is 11 to 14 marks for developed, detailed, accurate analysis." },
  { q: "A student writes four one-line evaluation points: time lags, cost, elasticity, alternatives. Likely evaluation level?", opts: ["E2, because there are four points", "E1, because the factors are named but not explained", "No marks", "E2 for the number of ideas"], a: 1, why: "E2 needs developed, reasoned comments with economic explanation. Quantity of points does not replace development." },
  { q: "Which sentence is application?", opts: ["Taxes change behaviour.", "The UK's Soft Drinks Industry Levy gave manufacturers a reason to cut sugar.", "Externalities are costs to third parties.", "It depends on elasticity."], a: 1, why: "It uses a real policy to show the mechanism. The others are generic knowledge or a named lever." },
  { q: "The essay is accurate on the model but ignores the context named in the question. Where does it lose marks most?", opts: ["Application and the top of the 14-mark scale", "Only the conclusion", "Nowhere", "Spelling"], a: 0, why: "Level 2 explanations are limited or over-generalised. Context is what lifts them." },
  { q: "A student concludes by summarising what was said earlier. What is the likely effect?", opts: ["Full evaluation credit", "Limited credit, because a judgement must weigh the arguments and answer the question", "Extra marks for clarity", "It is ignored and loses nothing"], a: 1, why: "Reports on M24 Q4 and M25 Q5 call out summary conclusions." },
  { q: "The question says 'Evaluate whether X always ...'. What must the evaluation do with 'always'?", opts: ["Ignore it", "Test it, showing when X does not hold, and answer it in the judgement", "Agree with it", "Repeat it"], a: 1, why: "Mark schemes repeatedly say the key word should be considered in the light of the argument." },
] });
Lib.match($("#mFix"), { prompt: "Match the fault to its fix.", pairs: [
  ["Wrote about GDP when the question said productivity", "Underline the key phrases and use them in every paragraph."],
  ["Perfect diagram never mentioned in the text", "Refer to it by label: Qm, Q*, the shaded area."],
  ["Cost-push inflation treated as demand-pull", "Identify the cause from the context before choosing the analysis."],
  ["A list of one-line evaluation points", "Develop one or two with lever, because, so what."],
  ["Conclusion that repeats the essay", "State a verdict, your strongest reason and what it depends on."],
  ["Covered only one of two income groups", "Tick off every part of the stem in the plan."],
  ["Macro effects on a micro question", "Name the branch and stay inside it."],
], done: "Most of these are fixed in the first five minutes." });
Lib.cards($("#fcP4"), { cards: [
  ["Allocative efficiency", "Resources are allocated so that price (marginal benefit) equals marginal cost, matching what consumers want."],
  ["Productive efficiency", "Output is produced at the lowest possible average cost, at the minimum of AC."],
  ["Dynamic efficiency", "Efficiency over time through investment and innovation that lower costs or improve products."],
  ["X-inefficiency", "Firms operate above minimum cost because competitive pressure is weak."],
  ["Minimum efficient scale", "The lowest output at which long-run average cost is at its minimum."],
  ["Natural monopoly", "One firm can supply the market at lower average cost than two or more because of very large economies of scale."],
  ["Monopsony", "A single or dominant buyer. In a labour market, the firm faces an upward-sloping supply of labour, so MCL lies above it."],
  ["Substitution and income effects", "A price change makes a good relatively cheaper or dearer (substitution) and changes real income (income). For a Giffen good a negative income effect outweighs substitution."],
  ["Negative output gap", "Actual output below potential output, with spare capacity and cyclical unemployment."],
  ["Stagflation", "High inflation together with weak output growth and high unemployment."],
  ["Multiplier", "The final change in national income is larger than the initial injection. k = 1 ÷ (1 − MPC) = 1 ÷ MPW."],
  ["Crowding out", "Government borrowing raises interest rates and reduces private investment."],
  ["Marshall–Lerner condition", "A depreciation improves the current account if the sum of the price elasticities of demand for exports and imports exceeds 1."],
  ["Free trade area versus customs union", "An FTA removes tariffs between members, each setting its own external tariffs. A customs union also has a common external tariff."],
  ["Expenditure-reducing versus expenditure-switching", "Reducing cuts total spending, including on imports. Switching moves spending from imports to domestic goods, for example through tariffs or depreciation."],
  ["Evaluate", "Judge the quality, importance or value of the argument, with analysis and a justified conclusion."],
] });

/* ---------- question tagger ---------- */
function tagger(el, o) {
  const R = { cmd: "Command word", lim: "Limit word", parts: "Parts to cover", ctx: "Topic and context", dia: "Diagram demand" };
  let qi = 0, tool = "cmd", tags = {}, checked = false;
  const draw = () => {
    const q = o.qs[qi];
    el.innerHTML = `<div class="row">${o.qs.map((x, i) => `<button class="b${i === qi ? " pri" : ""}" data-q="${i}">Question ${i + 1}</button>`).join("")}</div>
      <p class="note" style="margin:8px 0 0">${esc(q.src)}</p>
      <div class="tg-tools">${Object.keys(R).map((k) => `<button class="r-${k}${k === tool ? " on" : ""}" data-t="${k}">${R[k]}</button>`).join("")}</div>
      <div class="tg-q">${q.c.map((c, i) => `<span class="ch${tags[i] ? " r-" + tags[i] : ""}" ${tags[i] ? `data-r="${tags[i]}"` : ""} data-i="${i}" tabindex="0" role="button">${esc(c[0])}</span>`).join("")}</div>
      <div class="row" style="margin-top:10px"><button class="b pri" data-a="ck">Check</button><button class="b" data-a="rs">Reset</button></div><div class="tg-note msg" aria-live="polite"></div>`;
    $$("[data-q]", el).forEach((b) => (b.onclick = () => { qi = +b.dataset.q; tags = {}; checked = false; draw(); }));
    $$("[data-t]", el).forEach((b) => (b.onclick = () => { tool = b.dataset.t; draw(); }));
    $$(".ch", el).forEach((s) => { const f = () => { tags[+s.dataset.i] === tool ? delete tags[+s.dataset.i] : (tags[+s.dataset.i] = tool); checked = false; draw(); }; s.onclick = f; s.onkeydown = (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), f()); });
    $("[data-a=rs]", el).onclick = () => { tags = {}; draw(); };
    $("[data-a=ck]", el).onclick = () => {
      let ok = 0, no = 0, miss = 0;
      $$(".ch", el).forEach((s) => { const i = +s.dataset.i, e = q.c[i][1], g = tags[i]; s.classList.remove("ok", "no", "miss"); if (g && g === e) { s.classList.add("ok"); ok++; } else if (g) { s.classList.add("no"); no++; } else if (e) { s.classList.add("miss"); miss++; } });
      $(".tg-note", el).innerHTML = `${ok} correct, ${no} wrong, ${miss} missed (dashed). <span class="note" style="font-weight:400"><b>The trap:</b> ${q.trap}</span>`;
    };
  };
  draw();
}
tagger($("#tgQ"), { qs: [
  { src: "S23/41 Q3", trap: "'Always' needs a case where it fails, and the statement names three parties, so give a verdict on the producer, the consumer and society. No diagram is demanded, but a price discrimination diagram helps.", c: [["Some firms frequently use ", null], ["price discrimination.", "ctx"], [" ", null], ["Assess the view that", "cmd"], [" when this occurs, price discrimination will ", null], ["always", "lim"], [" benefit ", null], ["the producer", "parts"], [" at the expense of ", null], ["the consumer and society.", "parts"]] },
  { src: "S24/42 Q4", trap: "The context says supply-side disruption, so this is cost-push inflation. Both policies need analysis, and they work on AD while the cause is on the supply side. 'Likely' invites qualified analysis.", c: [["In 2022, many countries experienced a high rate of inflation caused by disruptions to the supply of goods and services arising from the Covid-19 pandemic and the conflict between Russia and Ukraine.", "ctx"], [" In one country, ", null], ["the government cut taxes and the central bank raised interest rates.", "ctx"], [" ", null], ["Evaluate", "cmd"], [" the ", null], ["likely", "lim"], [" impact of ", null], ["these policies", "parts"], [" on that government's ability to control inflation.", "ctx"]] },
  { src: "W23/42 Q4", trap: "'Always' again. Examiners expected definitions of MNC, low-income country and economic growth, and analysis of growth itself, not only the standard of living.", c: [["The presence of multinational corporations (MNCs) in a low-income country", "ctx"], [" ", null], ["always", "lim"], [" promotes ", null], ["economic growth", "ctx"], [" in that country. ", null], ["Evaluate", "cmd"], [" this statement.", null]] },
  { src: "S25/42 Q4", trap: "The graph is a marked requirement: an AD/AS diagram does not satisfy it. It is a fall in interest rates, and other policies earn no credit.", c: [["With the help of an injections and withdrawals graph,", "dia"], [" ", null], ["assess", "cmd"], [" the impact of a decrease in interest rates", "ctx"], [" on ", null], ["the level of employment", "parts"], [" in an economy.", null]] },
  { src: "W24/41 Q2", trap: "Exactly two policies, and each must be linked to allocative efficiency. Many answers described policies without ever reaching efficiency.", c: [["Governments in many countries are promoting policies that reduce the impact of the negative externalities.", "ctx"], [" ", null], ["Evaluate", "cmd"], [", ", null], ["using appropriate diagram(s),", "dia"], [" ", null], ["the extent to which", "lim"], [" ", null], ["two policies", "parts"], [" used to reduce negative externalities can also improve ", null], ["allocative efficiency.", "parts"]] },
] });

/* ---------- paragraph x-ray ---------- */
function xray(el) {
  el.innerHTML = `<label for="xrT">Your paragraph</label><textarea id="xrT" placeholder="Paste one paragraph from your essay"></textarea>
    <label for="xrC">Words from the question (comma separated, optional)</label><input type="text" id="xrC" placeholder="for example: air travel, government, market failure">
    <div class="row" style="margin-top:10px"><button class="b pri" data-a="go">X-ray it</button><button class="b" data-a="cl">Clear</button></div><div class="xr-out" aria-live="polite"></div>`;
  const out = $(".xr-out", el);
  const T = {
    k: /\b(defined as|is when|refers to|occurs when|is called|is known as|means)\b/i,
    n: /\b(because|therefore|leading to|leads to|which leads|as a result|so that|so the|so |this means|causing|causes|resulting in|results in|due to|since|which could|which may)\b/i,
    e: /\b(however|but |although|depends|on the other hand|overall|unless|only if|may not|could be offset|in the long run|in the short run|whereas|nevertheless|limited by|less effective|not always)\b/i,
    d: /\b(diagram|figure|fig\.|shaded|shifts? (?:to|from)|Q[a-z*0-9]|AD[0-9₁₂₃]|SRAS|LRAS|MSB|MPB|MSC|MPC)\b/,
    ex: /\b(for example|for instance|e\.g\.|such as|in the case of|in 20\d\d|in 19\d\d)\b/i,
  };
  $("[data-a=cl]", el).onclick = () => { $("#xrT", el).value = ""; out.innerHTML = ""; };
  $("[data-a=go]", el).onclick = () => {
    const text = $("#xrT", el).value.replace(/\s+/g, " ").trim(); if (!text) { out.textContent = "Paste a paragraph first."; return; }
    const ctx = $("#xrC", el).value.split(",").map((s) => s.trim().toLowerCase()).filter((s) => s.length > 2);
    const ss = text.match(/[^.!?]+[.!?]*/g).map((s) => s.trim()).filter(Boolean);
    const cnt = { k: 0, a: 0, n: 0, e: 0 }; let diag = 0, ctxHit = 0;
    const rows = ss.map((s) => {
      const body = s.slice(s.indexOf(" ") + 1), low = s.toLowerCase(), b = [];
      const hasCtx = ctx.some((c) => low.includes(c)), hasNum = /\d/.test(s), hasNoun = /\b[A-Z][a-z]{3,}\b/.test(body) && !/^(?:However|Overall|Therefore)/.test(s), hasEx = T.ex.test(s), hasD = T.d.test(s);
      if (T.k.test(s)) { b.push("k"); cnt.k++; }
      if (hasCtx || hasNum || hasNoun || hasEx || hasD) { b.push("a"); cnt.a++; if (hasD) diag++; if (hasCtx) ctxHit++; }
      if (T.n.test(s)) { b.push("n"); cnt.n++; }
      if (T.e.test(s)) { b.push("e"); cnt.e++; }
      return `<div class="snt">${esc(s)} ${b.map((x) => `<span class="bdg ${x}">${x === "k" ? "K" : x === "a" ? "A" : x === "n" ? "N" : "E"}</span>`).join("")}</div>`;
    });
    const abs = [...new Set((text.match(/\b(will|always|never|must|definitely|certainly|cannot)\b/gi) || []).map((w) => w.toLowerCase()))];
    const hedge = (text.match(/\b(could|may|might|likely|tends to|possibly|probably|often)\b/gi) || []).length;
    const adv = [];
    if (!cnt.a) adv.push("No application signals. Add the question's context words, a real example or a number.");
    else if (cnt.a < Math.ceil(ss.length / 4)) adv.push("Light on application. Tie more of the sentences to the context, an example or the diagram.");
    if (ctx.length && !ctxHit) adv.push("None of your question words appear. Start by echoing the question's wording.");
    if (!cnt.n) adv.push("No cause-and-effect links found. Join your steps with because, so or which leads to.");
    if (!cnt.e) adv.push("No evaluation signals. End the paragraph with a lever, because, so what.");
    else if (cnt.e === 1) adv.push("Only one evaluation sentence. Check it explains how the factor changes the result, not just names it.");
    if (abs.length) adv.push("Absolute wording found (" + abs.join(", ") + "). Qualify with could, may or is likely to unless the question's own wording demands a strong claim.");
    if (!hedge) adv.push("No qualified language such as could, may or likely.");
    if (ss.length < 4) adv.push("Short paragraph. Level 3 chains usually need four or more linked sentences.");
    if (!adv.length) adv.push("Balanced on these signals. Now read it as a marker: does every sentence work for this question only?");
    out.innerHTML = `<div class="xr-sum"><div><small>Sentences</small><b>${ss.length}</b></div><div><small>Knowledge</small><b>${cnt.k}</b></div><div><small>Application</small><b>${cnt.a}</b></div><div><small>Analysis</small><b>${cnt.n}</b></div><div><small>Evaluation</small><b>${cnt.e}</b></div></div>
      <div class="tip"><b class="h">What to improve</b>${adv.map((a) => `<div>${esc(a)}</div>`).join("")}</div><p class="note">Badges are keyword signals only. A sentence can be tagged wrongly, and a good sentence can be missed.</p>${rows.join("")}`;
  };
}
xray($("#xr"));

/* ---------- question bank ---------- */
const TOP = { mf: "Market failure and intervention", ms: "Market structures and firms", ct: "Consumer theory", lm: "Labour markets", mon: "Inflation, unemployment and monetary policy", fp: "Fiscal policy, growth and the multiplier", bop: "Balance of payments and exchange rates", gl: "Globalisation and trade", dev: "Development, standard of living, aid and debt" };
const SECB = ["mf", "ms", "ct", "lm"];
// [id, topic, diagram demanded, question, planning prompt, also]
const QB = [
  ["M23/42 Q2", "mf", 1, "The use of air travel leads to market failure caused by negative externalities. With the help of a diagram, assess the extent to which a government can intervene to correct this market failure.", "Air travel is a consumption externality: MPB, MSB, MC. Chains: tax, regulation, negative advertising. Evaluate: tax level hard to measure, lags, advertising costly and uncertain. 'The extent' needs a degree in the verdict.", ""],
  ["M23/42 Q3", "ms", 0, "Some firms in oligopoly markets choose to collude rather than engage in price competition. This will lead to higher prices and a less efficient allocation of resources. Evaluate this statement.", "Collusion moves the market towards monopoly behaviour; develop the chain from collusion to price to allocative efficiency and X-inefficiency. Evaluate: economies of scale, dynamic efficiency, choice, regulation. Question the statement.", ""],
  ["M23/42 Q4", "bop", 0, "Expenditure-reducing policies will reduce a balance of payments deficit but will also cause significant unemployment. Evaluate this statement.", "Cut AD, so less spending on imports (higher interest rates, contractionary fiscal). Name cyclical unemployment and give two chains. Evaluate how significant: state of the economy, cause of unemployment, supply-side policies alongside.", ""],
  ["M23/42 Q5", "gl", 0, "Assess the impact of globalisation on the standard of living in low-income countries.", "Define globalisation as more than trade: capital, labour, technology. Build in low-income features (primary exports) and link to the standard of living. Evaluate: MNC exploitation, resource depletion, dependency, unequal gains.", ""],
  ["S23/41 Q2", "mf", 1, "To improve allocative efficiency economists frequently advise governments to remove existing subsidies to the private sector providers of education. With the help of a diagram, evaluate this advice.", "Education as a merit good with positive externalities; diagram of under-consumption. Removing a subsidy may reduce output below the social optimum. Evaluate: measuring the subsidy, opportunity cost, access by ability to pay. No diagram, no Level 3.", "also 43"],
  ["S23/41 Q3", "ms", 0, "Some firms frequently use price discrimination. Assess the view that when this occurs, price discrimination will always benefit the producer at the expense of the consumer and society.", "Conditions for price discrimination; third-degree diagram with different elasticities. Producer gains surplus; some consumers get lower prices; profits may fund dynamic efficiency. Judge 'always'.", "also 43"],
  ["S23/41 Q4", "fp", 0, "An increase in a government's budget surplus will increase unemployment in the short run but it will make it easier to control a balance of payments deficit on the current account in the long run. Evaluate this statement.", "A surplus is contractionary: AD falls, cyclical unemployment rises, import demand falls. The report found the balance of payments link weak. Evaluate: spare capacity, cause of unemployment, supply-side alternatives, lower interest rates.", "also 43"],
  ["S23/41 Q5", "dev", 0, "To what extent do you agree that an increase in productivity will lead to a higher standard of living in low-income countries?", "Do not confuse production with productivity. Link productivity to output, income, health and education. Evaluate: FDI exploitation, capital replacing labour, distribution, measuring the standard of living.", "also 43"],
  ["S23/42 Q2", "mf", 1, "The increased use of electric vehicles (EVs) is encouraged as part of governments' climate change policies because they create fewer negative externalities than diesel and petrol (gas) vehicles. Evaluate, with the help of a diagram(s), two policies that a government may use to encourage the use of EVs.", "Diagram of the externality reduction. Choose exactly two policies (for example subsidy for EVs, tax on petrol and diesel) and analyse each. Evaluate each: cost, elasticity, charging infrastructure, lags.", ""],
  ["S23/42 Q3", "ms", 1, "Evaluate, with the help of a diagram(s) how total market demand and minimum efficient scale may determine the form of market structure in an industry.", "LRAC with MES against market demand: MES large relative to demand points to monopoly or oligopoly; small points to competition. Few answers linked every part. Evaluate: MES changes with technology, market definition, niche markets.", ""],
  ["S23/42 Q4", "bop", 0, "Consider the extent to which the depreciation of its foreign exchange rate contributes to the economic growth of a low-income country.", "AD/AS: exports up, imports down, AD up. Include low-income features: primary exports, inelastic supply, imported inputs, foreign-currency debt. Evaluate: Marshall–Lerner, supply capacity, inflation, short versus long run.", ""],
  ["S23/42 Q5", "mon", 0, "Evaluate the effectiveness of using monetary policy to reduce the rate of inflation and how this policy may affect a government's ability to achieve its other macroeconomic aims.", "Contractionary monetary policy (not expansionary). AD/AS or 45-degree diagram. Two jobs: effectiveness, and effects on growth, unemployment and the balance of payments. Evaluate: lags, expectations, conflicts between aims.", ""],
  ["W23/41 Q2", "mf", 0, "The provision of health care by the public sector is inefficient and therefore all health care should be provided by firms operating in the private sector. Evaluate this comment.", "Merit good, positive externalities, allocative efficiency, public versus private. A positive externality diagram helps. Evaluate: profit motive cuts waste but ignores externalities, equity, ability to pay. Test 'all'.", ""],
  ["W23/41 Q3", "ms", 1, "A government allows the merger of two large firms in the same industry. With the help of a diagram, evaluate the view that this merger should not have been allowed.", "Identify horizontal integration. Monopoly diagram against economies of scale. Evaluate: dynamic efficiency, regulation, consumer choice. Reach a verdict.", ""],
  ["W23/41 Q4", "mon", 0, "Assess the extent to which monetary policy can be used effectively to solve the problem of unemployment.", "Instruments: interest rates, money supply, exchange rate. Link to types of unemployment: stronger for cyclical, weak for structural. Evaluate: supply-side alternatives, side effects on inflation and the exchange rate.", ""],
  ["W23/41 Q5", "gl", 0, "To what extent do you agree with the view that globalisation benefits high-income countries at the expense of low-income countries?", "Define free trade and the characteristics of both groups; cover both. Expect a balanced conclusion: both can gain, depending on several factors.", ""],
  ["W23/42 Q2", "ct", 0, "Evaluate the use of indifference curve analysis to derive the demand curve for a normal good and the demand curve for an inferior good.", "Use indifference curves, not marginal utility (that capped answers at Level 1). Budget line pivot, SE and YE for normal and inferior. Evaluate assumptions: rationality, two goods, static, indivisible purchases.", ""],
  ["W23/42 Q3", "ms", 1, "The model of perfect competition is the ideal form of market structure because it is the most efficient. With the help of diagrams, evaluate this statement.", "Short-run and long-run diagrams, productive and allocative efficiency. Evaluate: few real examples, monopoly R&D and dynamic efficiency, compare other structures.", ""],
  ["W23/42 Q4", "dev", 0, "The presence of multinational corporations (MNCs) in a low-income country always promotes economic growth in that country. Evaluate this statement.", "Define MNC, low-income country, actual and potential growth. Use AD/AS or the multiplier and LRAS. Evaluate: exploitation, transfer pricing, local firms destroyed, low-skilled jobs. Test 'always'.", ""],
  ["W23/42 Q5", "dev", 0, "Consider the relative merits of gross national income (GNI) and the multidimensional poverty index (MPI) as measures of the standard of living.", "Define the standard of living. GNI: money, per head, real. MPI: health, education, living standards with weights. Compare using real limits: informal economy, distribution, data coverage, inputs versus outputs.", ""],
  ["W23/43 Q2", "mf", 1, "Pollution is caused when consumers or producers make decisions based on self-interest. This is a sign of market failure. With the help of a diagram, evaluate the extent to which government policies should rely upon market forces to address this market failure.", "Externality diagram. Market-based tools (tax, permits) against direct tools (bans, regulation). Evaluate: measuring the right tax, cost, lags, precision of a ban. Conclude on net benefits.", ""],
  ["W23/43 Q3", "ms", 0, "Evaluate the view that monopolistically competitive firms will always charge lower prices and operate more efficiently than a monopoly firm.", "Short-run and long-run diagrams for both. Dynamic efficiency and economies of scale may favour monopoly; non-price competition costs may raise prices under monopolistic competition. Test 'always'.", ""],
  ["W23/43 Q4", "fp", 1, "With the help of a diagram, assess the effectiveness of using fiscal policy to close a negative output gap in an economy.", "AD/AS output gap diagram; expansionary fiscal policy and the multiplier. Evaluate: crowding out, forecasting the gap, inflation, imports, supply-side alternative.", ""],
  ["W23/43 Q5", "dev", 0, "Assess the impact of international aid on the standard of living in low-income countries.", "Types of aid (humanitarian, development; tied, bilateral, multilateral), low-income features, standard of living. Evaluate: corruption, tied aid costs, dependency, political motives, long-term loans.", ""],
  ["M24/42 Q2", "mf", 1, "With the help of a diagram, assess the effectiveness of a government's intervention in the price mechanism to address the causes of climate change.", "Climate change as a negative externality; production or consumption diagram accepted. Price-mechanism tools: taxes, permits, subsidies. Evaluate: measuring the externality, minimum prices only partial, bans are precise, lags.", ""],
  ["M24/42 Q3", "lm", 1, "The introduction of a trade union into a perfectly competitive labour market will always lead to higher wage levels and a higher level of unemployment. With the help of a diagram, evaluate this statement.", "Perfect labour market diagram; a union wage above equilibrium cuts employment. Do not drift into minimum wages or monopsony. Evaluate: productivity gains, capital substitution, elasticities. Test 'always'.", ""],
  ["M24/42 Q4", "mon", 1, "With the help of a diagram, assess the effectiveness of government policies which might be used to reduce cost-push inflation.", "AD/AS diagram with SRAS shifting left. Short run: subsidies, lower taxes, tariff removal, incomes policy. Long run supply-side policy is needed for Level 3. Evaluate: budget costs, trade-offs, time. The conclusion must weigh, not summarise.", ""],
  ["M24/42 Q5", "gl", 0, "Globalisation will help to achieve economic growth in high-income economies and this will automatically improve living standards. Evaluate this statement.", "Characteristics of high-income countries (not low-income). Growth versus living standards. Evaluate: growth is a quantity not quality, transport externalities, cheap imports and jobs, use of the gains. Test 'automatically'.", ""],
  ["S24/41 Q2", "mf", 0, "The long-term equilibrium position in perfect competition is frequently used to illustrate efficient resource allocation in a free market economy. Explain why this is so and consider what prevents efficiency from being achieved.", "Allocative and productive efficiency on a long-run diagram, then what prevents it: externalities, merit and public goods, monopoly, information. Evaluate: the model is theoretical, government failure. Develop efficiency fully.", "also 43"],
  ["S24/41 Q3", "ct", 1, "With the help of an indifference curve diagram, assess the extent to which a rise in price would affect the demand for a normal good differently from the demand for a Giffen good.", "IC diagram showing SE and YE for both goods. Address 'extent': compare the sizes, link to PED and the slope or MRS. Few answers dealt with the extent.", "also 43"],
  ["S24/41 Q4", "fp", 0, "In many countries increased government spending is regarded as a cause of economic growth. It is sensible, therefore, for a government to spend more to increase economic growth as it is good for its country. To what extent do you agree with this argument?", "Actual versus potential growth and the multiplier. Counter: spare capacity, inflation, imports, crowding out, environment, inequality. Judge 'sensible' and 'good for its country'.", "also 43"],
  ["S24/41 Q5", "dev", 0, "National income statistics are often used as a measure of the standard of living. Consider to what extent national income statistics can be used to compare the standard of living between low-income countries and high-income countries.", "Define the standard of living; GNI per head and PPP. Limits: informal economy, subsistence, distribution, exchange rates, climate and culture. Alternatives: HDI, MEW.", "also 43"],
  ["S24/42 Q2", "mf", 1, "Market failure exists in all economies. Evaluate, with the aid of a diagram(s), the meaning of market failure and two policies a government may use to correct market failure.", "Define market failure; diagram; exactly two policies. Evaluate: elasticity (E2 when explained), measuring the failure, cost, lags.", ""],
  ["S24/42 Q3", "ms", 1, "Evaluate, with the aid of a diagram(s), whether excess profit (supernormal profit) is always necessary for the continued existence of firms in perfect competition and monopoly.", "Perfect competition: supernormal profit is eroded in the long run and normal profit suffices. Monopoly can keep it. Evaluate: natural monopoly, sales maximisation, profit funding dynamic efficiency.", ""],
  ["S24/42 Q4", "mon", 0, "In 2022, many countries experienced a high rate of inflation caused by disruptions to the supply of goods and services arising from the Covid-19 pandemic and the conflict between Russia and Ukraine. In one country, the government cut taxes and the central bank raised interest rates. Evaluate the likely impact of these policies on that government's ability to control inflation.", "Spot cost-push. A tax cut raises AD, a rate rise lowers AD, neither fixes supply. Evaluate: lags, expectations, size, short versus long run, opportunity cost. Ignoring the context limited marks.", ""],
  ["S24/42 Q5", "gl", 0, "Evaluate the likely impact of globalisation on a low-income country's standard of living.", "Define globalisation, low-income country, standard of living (material and non-material). FDI, multiplier, PPF shift. Evaluate with developed points: exploitation, transfer pricing, local firms, low-skilled jobs.", ""],
  ["W24/41 Q2", "mf", 1, "Governments in many countries are promoting policies that reduce the impact of the negative externalities. Evaluate, using appropriate diagram(s), the extent to which two policies used to reduce negative externalities can also improve allocative efficiency.", "Exactly two policies; always connect each to allocative efficiency (many did not). Evaluate: cost, impact on efficiency, jobs, regressive effects, information failure.", ""],
  ["W24/41 Q3", "ms", 0, "Evaluate the consequences for the price and output of a firm if it changes its objective from profit maximisation to sales maximisation as a response to the principal-agent problem.", "Explain the principal-agent problem. MR = MC against AR = AC diagram: price lower, output higher under sales maximisation. Evaluate: consumer gains, misallocation, equity.", ""],
  ["W24/41 Q4", "mon", 1, "In periods of rising and persistent inflation, consumers and workers change their expectations of the future rate of inflation. Evaluate, with the help of a diagram(s), the consequences of these changes of expectations for fiscal policy.", "Expectations, Phillips curve shifting, wage-price spiral, AD/AS. Fiscal expansion lowers unemployment only temporarily. Evaluate: shape of AS, validity of the Phillips curve, supply-side.", ""],
  ["W24/41 Q5", "gl", 1, "In recent years many countries have joined or established a free trade area (FTA). Evaluate, with the help of a diagram(s), whether membership of an FTA is always beneficial to a country.", "Define FTA; tariff diagram, consumer surplus, trade creation. Evaluate: PED and PES, structural unemployment, polluting production moved, MPX and MPM with the multiplier. Test 'always'.", ""],
  ["W24/42 Q2", "ct", 0, "Evaluate whether marginal utility theory can fully explain the link between the changing price of a good and quantity demanded of that good.", "Diminishing marginal utility, equi-marginal principle MUx/Px = MUy/Py, link to the demand curve. Evaluate: rationality, no income and substitution effects so no Giffen, ceteris paribus, constant utility of money, one-off goods.", ""],
  ["W24/42 Q3", "mf", 0, "Privatisation is often required by the International Monetary Fund (IMF) and the World Bank before they are prepared to offer support to countries requiring loans, grants, debt relief and debt cancellation programs. Evaluate the view that privatisation will always improve the allocation of resources in a country.", "Define privatisation, productive and allocative efficiency, X-inefficiency. Use a market structure model. Evaluate: natural monopoly, private monopoly replaces state monopoly, regulation, externalities, equity, job losses.", ""],
  ["W24/42 Q4", "dev", 0, "The table below contains some key economic data for Mexico in 2020. Gross National Income (GNI) 18.5 billion pesos; nominal wages +2.8%; disposable income +1.2%; unemployment rate 4.2%; population growth rate 1.1%; inflation rate 3.4%. Evaluate the use of these statistics in assessing the standard of living in Mexico in 2020.", "Use the numbers: nominal wages up 2.8% against inflation of 3.4% means real wages fell. GNI needs a per-head figure and a base year. Define material and non-material standard of living; suggest HDI, MPI.", ""],
  ["W24/42 Q5", "dev", 0, "Between 2010 and 2020, very low interest rates encouraged low-income countries to borrow money from foreign investors and governments to finance long-term economic growth. Evaluate this approach to promoting long-term economic growth.", "Savings gap, investment, LRAS or PPC. Evaluate: rising US rates, foreign-currency debt, quality of projects, tied loans, commodity slumps. Keep the focus on low-income countries.", ""],
  ["W24/43 Q2", "mf", 1, "Negative externalities of production cause market failure. With the help of a diagram, assess the extent to which the introduction of indirect taxation is likely to address this cause of market failure.", "MPC to MSC with the tax shift. Evaluate: measuring the right tax, inelastic demand, bureaucracy, regressive effect, permits as an alternative.", ""],
  ["W24/43 Q3", "lm", 1, "Wages in a perfectly competitive labour market will always be higher than wages in a monopsony labour market. With the help of a diagram, evaluate this statement.", "Perfect market (MRP and supply) against monopsony (MCL above supply, wage below MRP). Evaluate: unions, minimum wage, capital substitution. Test 'always'.", ""],
  ["W24/43 Q4", "mon", 0, "Central banks can control the money supply. An increase in the money supply will cause inflation, therefore central banks can control inflation. Evaluate this statement.", "Instruments (open market operations, QE, rates); link money supply, AD and inflation. Evaluate: measuring money, uncertain link, higher rates can raise savings, the cause of inflation.", ""],
  ["W24/43 Q5", "gl", 1, "Some high-income countries have introduced a policy of high tariffs on some imports to reduce the negative effects of globalisation on their economies. With the help of a diagram, evaluate this policy.", "Tariff diagram: higher price, lower imports, revenue, welfare loss. Evaluate: retaliation, trade war, higher prices, protecting inefficient firms, lost choice.", ""],
  ["M25/42 Q2", "ms", 0, "Oligopolies are able to avoid price competition while maintaining supernormal profits in the long run. Evaluate this statement.", "Kinked demand and price rigidity, game theory, barriers, collusion, limit pricing, non-price competition. Evaluate: collusion illegal and unstable, contestable markets, advertising costs, break-even pricing.", ""],
  ["M25/42 Q3", "lm", 1, "With the help of a diagram, evaluate the consequences of imposing an effective minimum wage on the employment level and the wage level in a monopsony labour market.", "Draw a monopsony diagram, not a competitive one. An effective minimum wage can raise both pay and employment up to a point. Stay micro. Evaluate: elasticities, size of the rise, productivity effects, small-firm closures.", ""],
  ["M25/42 Q4", "mon", 1, "With the help of a diagram, assess the effectiveness of government policies that might be used to reduce demand-pull inflation.", "AD/AS diagram; contractionary fiscal and monetary policy, exchange rate; supply-side accepted. Evaluate: long-run growth, public services, state of the economy, Marshall–Lerner, lags.", ""],
  ["M25/42 Q5", "bop", 1, "With the help of a diagram, evaluate the effectiveness of the use of expenditure-switching policies to reduce a current account deficit on the balance of payments.", "At least two expenditure-switching policies and a diagram (tariffs; devaluation with Marshall–Lerner and the J curve). Evaluate: retaliation, cost-push inflation, welfare loss, size and duration of the deficit.", ""],
  ["S25/41 Q2", "ct", 1, "With the help of a diagram, evaluate the use of indifference curve analysis to explain the relationship between a change in the price of a product and the change in an individual consumer's demand for this product.", "Indifference curves, budget line, equilibrium; a price fall pivots the budget line. Both substitution and income effects for Level 3. Evaluate assumptions: satisfaction maximising, two goods, advertising changes tastes.", "also 43 Q2"],
  ["S25/41 Q3", "ms", 0, "The growth of a firm using a takeover is desirable because it enables consumers to benefit from lower prices and the firm to gain additional profits. Evaluate this statement.", "A takeover is not a merger. Horizontal and vertical integration, economies of scale. Evaluate: savings not passed on, monopoly power, diseconomies, competition authority.", "also 43 Q3"],
  ["S25/41 Q4", "fp", 1, "A country is experiencing stagflation, when there is a high rate of inflation at the same time as a negative output gap. With the help of a diagram, evaluate the effectiveness of using fiscal policy to solve this problem.", "AD/AS with SRAS left. Fiscal policy can ease one problem and worsen the other. Do not confuse a negative with a positive output gap. Evaluate: supply-side alternative, crowding out.", "also 43 Q4"],
  ["S25/41 Q5", "gl", 0, "A free trade area gains all the benefits associated with being a member of a customs union while avoiding all the costs associated with being a member of a customs union. Evaluate this statement.", "State the difference clearly: an FTA has no common external tariff. Benefits: trade creation, scale. Costs: lost control of trade policy in a CU; rules of origin and enforcement in an FTA. Test both 'all's.", "also 43 Q5"],
  ["S25/42 Q2", "ms", 1, "Monopolies restrict output to raise prices to exploit consumers. With the help of a diagram, assess the extent to which a government should intervene in monopoly markets.", "Monopoly diagram (supernormal profit area correct); allocative inefficiency. Policies: tax, maximum price, regulation. Evaluate: natural monopoly, investment incentives and X-inefficiency, lost economies of scale.", ""],
  ["S25/42 Q3", "lm", 1, "With the help of a diagram, assess whether the impact of an increase in labour productivity on the wages and employment of a firm is likely to be greater in a perfectly competitive labour market than in an imperfectly competitive labour market.", "Four elements: a productivity rise (MRP shifts), perfect market, imperfect market (monopsony), wages and employment. Missing one caps the answer. Evaluate: assumptions, measuring productivity, capital substitution.", ""],
  ["S25/42 Q4", "mon", 1, "With the help of an injections and withdrawals graph, assess the impact of a decrease in interest rates on the level of employment in an economy.", "It must be a J/W graph, not AD/AS. A fall in rates raises consumption and investment, injections rise, multiplier, employment. Not an increase in rates, and no other policies. Evaluate: inflation, depreciation, house prices, type of unemployment.", ""],
  ["S25/42 Q5", "gl", 0, "Globalisation will have an equally beneficial effect on the standard of living in both high-income and low-income countries. Evaluate this statement.", "Cover both income groups and the standard of living; one group only caps at Level 2. Evaluate: unequal gains, externalities, cheap imports and jobs, how gains are used. Test 'equally'.", ""],
  ["S25/44 Q2", "mf", 1, "With the help of a diagram, consider whether economic efficiency can be achieved without government intervention in a market economy.", "Productive and allocative efficiency; perfect competition as the benchmark; market failures (externalities, public goods, information, monopoly, equity). Evaluate: opportunity cost, measuring failure, government failure.", ""],
  ["S25/44 Q3", "lm", 0, "Evaluate whether the marginal revenue product theory (MRP) always explains the differences in wages.", "MRP = MPP × price as demand, with supply factors. Evaluate: perfect competition assumption, measuring productivity (health, education), unions, minimum wages, discrimination, monopsony. Test 'always'.", ""],
  ["S25/44 Q4", "bop", 0, "A country with an open economy has falling demand for exports. Consider the view that monetary policy alone will solve this problem.", "Falling exports reduce AD. Monetary route: lower rates or more money depreciate the currency. Evaluate: export elasticity, lags, inflation, supply-side policies. Test 'alone'.", ""],
  ["S25/44 Q5", "fp", 0, "Evaluate how a country might increase its potential economic growth.", "Define potential growth (LRAS or PPC). Analyse at least two supply-side policies. Evaluate: borrowing limits, political constraints, factor shortages, lags, environment.", ""],
  ["S26/41 Q2", "ms", 1, "With the help of a diagram(s), assess the view that larger firms always have lower average costs than smaller firms.", "LRAC with MES and diseconomies. Aim for three developed points. 'Always': potential versus actual, low-MES industries, technology. Judgement should say what size relative to MES decides.", "also 43"],
  ["S26/41 Q3", "ms", 1, "Third-degree price discrimination benefits the firm but not its customers. With the help of a diagram, assess the consequences of third-degree price discrimination to both the firm and its customers.", "Two-market diagram. Profit rises; some customers lose surplus, others gain lower prices. Evaluate: cost of segmenting, innovation from profits, accessibility.", "also 43"],
  ["S26/41 Q4", "fp", 0, "Due to the multiplier process, governments conducting an expansionary fiscal policy do not need to increase spending by the full amount of the negative output gap to bring the output of the economy to its full employment level. Evaluate this statement.", "Multiplier 1 ÷ (1 − MPC) = 1 ÷ MPW; spending needed ≈ gap ÷ multiplier. Evaluate: uncertain multiplier, overshooting and inflation, crowding out, high MPM, debt.", "also 43"],
  ["S26/41 Q5", "dev", 0, "Assess the view that high levels of external debt are an unsustainable burden to low-income countries.", "Define external debt; debt service diverts spending; currency risk; crowding out. Evaluate: debt can fund growth and infrastructure, conditions can drive reform, depends on how the borrowing is used.", "also 43"],
  ["S26/42 Q2", "ct", 0, "Evaluate whether the marginal utility theory of demand provides an adequate explanation of market demand for both normal goods and inferior goods.", "Assumptions, diminishing marginal utility, equi-marginal principle, adding individual demands. Evaluate: no income and substitution effects so inferior goods are unexplained, rationality, indivisible goods.", ""],
  ["S26/42 Q3", "lm", 1, "Governments and trade unions should be excluded from taking part in wage negotiations as their intervention always causes higher levels of unemployment. With the help of a diagram(s), evaluate this statement.", "Perfect competition wage from MRP and supply; a minimum or union wage creates unemployment. Evaluate: realism of assumptions, productivity agreements, governments as monopsonist employers. Test 'always'.", ""],
  ["S26/42 Q4", "mon", 0, "Evaluate whether the quantity theory of money is a satisfactory explanation of the cause of inflation.", "Likely content: MV = PT, with V and T constant so money growth leads to inflation. Evaluate: velocity changes, cost-push inflation, periods of QE without inflation.", ""],
  ["S26/42 Q5", "dev", 0, "Consider whether the use of gross national income (GNI) alone is sufficient to measure the standard of living in a high-income country (HIC).", "GNI per head limits: distribution, non-material factors, inflation, hours worked, environment. Alternatives HDI, MEW, MPI. Test 'alone'.", ""],
  ["S26/44 Q2", "ct", 0, "Assess the extent to which marginal utility theory explains the downward sloping market demand curve for a good.", "Likely content: diminishing marginal utility and the equi-marginal principle explain a falling individual demand curve; add individual curves for market demand. Evaluate: assumptions, income and substitution effects, rationality.", ""],
  ["S26/44 Q3", "ms", 1, "Although firms in an oligopolistic market may be in competition with each other, they will find it advantageous to collude. With the help of a diagram or a pay-off matrix, evaluate this statement.", "Likely content: pay-off matrix and the prisoners' dilemma, cartel diagram. Evaluate: incentive to cheat, illegality, number of firms, repeated games.", ""],
  ["S26/44 Q4", "fp", 0, "Knowledge of both the multiplier and the accelerator enable a government to implement effective fiscal policies to close a deflationary gap. Evaluate this statement.", "Likely content: the multiplier and accelerator link investment to income changes in closing a negative output gap. Evaluate: forecasting problems, lags, crowding out, estimating the gap.", ""],
  ["S26/44 Q5", "bop", 0, "Discuss whether expenditure-reducing policies are preferable to expenditure-switching policies in order to correct a persistent deficit on the current account of the balance of payments.", "Likely content: compare the two policy families rather than describe them. Evaluate: unemployment and growth costs against inflation and retaliation, elasticities, lags. 'Preferable' needs criteria.", ""],
];
const cmdOf = (q) => { const L = q.toLowerCase(), c = ["evaluate", "assess", "consider", "to what extent", "explain", "discuss"].map((w) => [L.indexOf(w), w]).filter((x) => x[0] >= 0).sort((a, b) => a[0] - b[0]); return c.length ? c[0][1] : "other"; };
const LIM = /\b(always|alone|equally|automatically|all the benefits|fully|ideal|adequate|satisfactory|sufficient)\b/i;
QB.forEach((q) => { q.cmd = cmdOf(q[3]); q.lim = LIM.test(q[3]); });
const CMDN = { evaluate: "Evaluate", assess: "Assess", consider: "Consider", "to what extent": "To what extent", explain: "Explain … and consider", discuss: "Discuss" };
const cmdCount = {}; QB.forEach((q) => (cmdCount[q.cmd] = (cmdCount[q.cmd] || 0) + 1));
bars($("#barCmd"), Object.entries(cmdCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [CMDN[k] || "Other", v]));
const topCount = {}; QB.forEach((q) => (topCount[q[1]] = (topCount[q[1]] || 0) + 1));
bars($("#barTop"), Object.entries(topCount).sort((a, b) => b[1] - a[1]).map(([k, v]) => [TOP[k], v]));
const nDia = QB.filter((q) => q[2]).length, nLim = QB.filter((q) => q.lim).length;
$("#topNote").textContent = `${QB.length} questions. ${nDia} name a diagram in the wording (${Math.round((100 * nDia) / QB.length)}%). ${nLim} contain a strong limit word such as always, alone or equally.`;
$("#fTop").innerHTML = `<option value="">All topics</option>` + Object.entries(TOP).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
function renderBank() {
  const sec = $("#fSec").value, top = $("#fTop").value, dia = $("#fDia").checked, lim = $("#fLim").checked, tx = $("#fTxt").value.toLowerCase().trim();
  const L = QB.filter((q) => (!sec || (SECB.includes(q[1]) ? "B" : "C") === sec) && (!top || q[1] === top) && (!dia || q[2]) && (!lim || q.lim) && (!tx || (q[3] + " " + q[4]).toLowerCase().includes(tx)));
  $("#fCnt").textContent = L.length + " of " + QB.length + " questions";
  $("#qList").innerHTML = L.map((q) => `<div class="qi"><div class="meta"><span class="id">${q[0]}${q[5] ? " (" + q[5] + ")" : ""}</span><span class="tag">${TOP[q[1]]}</span><span class="tag">${CMDN[q.cmd] || "Other"}</span>${q[2] ? '<span class="tag dia">Diagram</span>' : ""}${q.lim ? '<span class="tag lim">Limit word</span>' : ""}</div><p>${esc(q[3])} <span class="mark">20</span></p><details><summary>Planning prompt</summary><p>${esc(q[4])}</p></details></div>`).join("") || "<p>No questions match.</p>";
}
["fSec", "fTop", "fDia", "fLim"].forEach((id) => $("#" + id).addEventListener("change", renderBank)); $("#fTxt").addEventListener("input", renderBank); renderBank();
const TT = [
  ["Market failure and intervention", "Draw the diagram that matches the type of externality. Always link policies to allocative efficiency. Name merit goods and positive externalities for health and education. Exactly two policies when told. Evaluate with measuring the right tax, elasticity, cost, lags, regressive effects, alternatives."],
  ["Market structures and firms", "Accurate diagrams: MC through minimum AC, supernormal profit as (AR − AC) × output, long-run adjustment. Compare structures rather than describe each. Evaluate with dynamic efficiency, natural monopoly, regulation, collusion that breaks down. Test 'always'."],
  ["Consumer theory", "Use the model the question names. Separate substitution and income effects for each type of good. 'Extent' means compare sizes. Evaluate the assumptions: rational consumers, two goods, static preferences, indivisible purchases."],
  ["Labour markets", "Use both demand (MRP) and supply. Draw the right market: monopsony diagrams for monopsony. Cover every element of a long stem. Evaluate with elasticities, capital substitution, productivity effects and the realism of perfect competition."],
  ["Inflation, unemployment and monetary policy", "Identify the cause (cost-push or demand-pull) and the type of unemployment first. Draw AD/AS with macro labels or the graph named. Include supply-side policy where the question needs it. Evaluate with lags, other aims, expectations, the exchange rate, alternatives."],
  ["Fiscal policy, growth and the multiplier", "Define the output gap and draw it correctly. Use the multiplier formula where relevant. Evaluate with crowding out, forecasting the gap, inflation, imports, debt, supply-side alternatives."],
  ["Balance of payments and exchange rates", "Separate expenditure-reducing from expenditure-switching. Draw the tariff diagram and include welfare loss. Use Marshall–Lerner and the J curve. Evaluate with retaliation, inflation, elasticities, size and duration of the deficit."],
  ["Globalisation and trade", "Define globalisation as trade, capital, labour and technology. Cover each income group the question names. Distinguish a free trade area from a customs union. Evaluate who gains, externalities, exploitation, cheap imports and jobs. Test 'always', 'equally', 'automatically'."],
  ["Development, standard of living, aid and debt", "Define the standard of living (material and non-material) and the income group. Use data in the question. Compare GNI, HDI, MPI with real limits. For aid and debt, name types and currency risk. Evaluate with corruption, tied aid, dependency, the quality of the projects."],
];
$("#tTopic").innerHTML = `<tr><th>Topic</th><th>What to do</th></tr>` + TT.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join("");

/* ---------- five-minute plan challenge ---------- */
function planner(el) {
  let timer = 0, left = 300, cur = null;
  const fmt = (s) => Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  el.innerHTML = `<div class="row"><button class="b pri" data-s="B">Micro question</button><button class="b pri" data-s="C">Macro question</button><button class="b" data-s="">Any</button></div><div id="plBody"></div>`;
  const body = $("#plBody", el);
  const stop = () => { clearInterval(timer); timer = 0; };
  const pick = (sec) => {
    stop(); left = 300;
    const pool = QB.filter((q) => !sec || (SECB.includes(q[1]) ? "B" : "C") === sec); cur = pool[Math.floor(Math.random() * pool.length)];
    body.innerHTML = `<div class="pl-q"><span class="id" style="font:700 .78rem var(--mono);color:var(--muted)">${cur[0]}</span><p style="margin:6px 0 0">${esc(cur[3])}</p></div>
      <div class="row"><span class="pl-t" id="plT">${fmt(left)}</span><button class="b pri" data-a="go">Start timer</button><button class="b" data-a="rs">Reset</button></div>
      <div class="pl-ck"><label><input type="checkbox"> Command word, limit word and context underlined</label><label><input type="checkbox"> One-sentence answer to the question written</label><label><input type="checkbox"> Three analytical chains chosen, with the diagram</label><label><input type="checkbox"> An application chosen for each chain</label><label><input type="checkbox"> Three evaluation levers (CASTLES) chosen</label><label><input type="checkbox"> First line of the judgement drafted</label></div>
      <div class="row"><button class="b" data-a="rv">Reveal planning prompt</button></div><div class="tip" id="plH" hidden><b class="h">Planning prompt</b>${esc(cur[4])}</div>`;
    const t = $("#plT", body), go = $("[data-a=go]", body);
    go.onclick = () => { if (timer) { stop(); go.textContent = "Resume"; return; } go.textContent = "Pause"; timer = setInterval(() => { left--; t.textContent = fmt(Math.max(left, 0)); if (left <= 0) { stop(); go.textContent = "Time is up"; } }, 1000); };
    $("[data-a=rs]", body).onclick = () => { stop(); left = 300; t.textContent = fmt(left); go.textContent = "Start timer"; };
    $("[data-a=rv]", body).onclick = () => { $("#plH", body).hidden = false; };
  };
  $$("[data-s]", el).forEach((b) => (b.onclick = () => pick(b.dataset.s)));
}
planner($("#plan"));
