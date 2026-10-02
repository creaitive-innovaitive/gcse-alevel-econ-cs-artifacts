/* ---------- PPC panels: shirts (y) against coats (x) ---------- */
function panel(x0, title, maxC, maxS, pre, spec, cons, s, color) {
  const W = 330, H = 270, y0 = 300, cx = (c) => x0 + (W * c) / 130, sy = (v) => y0 - (H * v) / 250;
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let pos = lerp(pre, spec, s.sp); if (s.tr > 0) pos = lerp(spec, cons, s.tr);
  let o = SV.line(x0, sy(250), x0, sy(0)) + SV.line(x0, sy(0), x0 + W, sy(0));
  o += SV.text(x0 + 4, sy(250) + 4, "Shirts", "sm") + SV.text(x0 + W, sy(0) + 22, "Coats", "sm", { "text-anchor": "end" });
  o += SV.text(x0 + W / 2, 24, title, "lbl bd", { "text-anchor": "middle" });
  o += SV.poly([[cx(0), sy(0)], [cx(maxC), sy(0)], [cx(0), sy(maxS)]], color === 2 ? "f2" : "f1", { opacity: 0.5 });
  o += SV.line(cx(maxC), sy(0), cx(0), sy(maxS), color === 2 ? "c2" : "c1");
  o += SV.text(cx(maxC) + 2, sy(0) - 8, maxC, "sm", { "text-anchor": "middle" }) + SV.text(x0 - 6, sy(maxS) + 4, maxS, "sm", { "text-anchor": "end" });
  if (s.tl > 0) { // trading line: shirts = 3 x (coats equivalent)
    const k = 3, sc = spec;
    const x1 = sc[0], y1 = sc[1];
    const xe = 130, ye = Math.max(0, Math.min(250, y1 - k * (xe - x1)));
    const xs = x1 + (y1 - Math.min(250, y1 + 0)) / k;
    let a = [x1, y1], b = [x1 + y1 / k, 0];
    if (x1 > 100) { a = [x1, y1]; b = [x1 - 250 / k, 250]; }
    o += SV.line(cx(a[0]), sy(a[1]), cx(b[0]), sy(b[1]), "c4 dash", { opacity: s.tl });
    o += SV.text(x0 + W / 2, 74, "Dashed: trading line, 1 coat = 3 shirts", "sm t4", { "text-anchor": "middle", opacity: s.tl });
  }
  if (s.m > 0) o += SV.circle(cx(pre[0]), sy(pre[1]), 7, "dot4", { opacity: s.m * (s.sp > 0.5 || s.tr > 0 ? 0.35 : 1) }) + SV.text(cx(pre[0]) + 10, sy(pre[1]) + 24, "before: " + pre[0] + ", " + pre[1], "sm", { opacity: s.m * (s.sp > 0.5 || s.tr > 0 ? 0.5 : 1) });
  if (s.m > 0) o += SV.circle(cx(pos[0]), sy(pos[1]), 8, s.tr > 0.5 ? "dot3" : "dot2");
  if (s.sp > 0.99 && s.tr === 0) o += SV.text(cx(pos[0]) + 12, sy(pos[1]) - 10, "specialise: " + spec[0] + ", " + spec[1], "sm bd");
  if (s.tr > 0.99) o += SV.text(cx(pos[0]) + 12, sy(pos[1]) - 14, "consume: " + cons[0] + ", " + cons[1], "sm bd t3");
  if (s.oc > 0) o += SV.text(x0 + W / 2, 52, color === 2 ? "1 coat costs 4 shirts; 1 shirt costs 0.25 coat" : "1 coat costs 2 shirts; 1 shirt costs 0.5 coat", "sm", { "text-anchor": "middle", opacity: s.oc });
  return o;
}
function caChart(s) {
  let o = panel(40, "Red", 120, 240, [80, 80], [120, 0], [80, 120], s, 1);
  o += panel(410, "Blue", 40, 160, [30, 40], [0, 160], [40, 40], s, 2);
  if (s.oc > 0 && s.sp < 0.1) o += SV.text(380, 340, "Red: comparative advantage in coats.  Blue: comparative advantage in shirts.", "lbl bd", { "text-anchor": "middle", opacity: s.oc });
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 350, label: "Production possibility curves for two countries before and after specialisation and trade", base: { m: 0, oc: 0, sp: 0, tr: 0, tl: 0 }, draw: caChart, tween: 1200, dwell: 5000, steps: [
  { cap: "Two countries, Red and Blue, can each make coats and shirts. The lines show <b>everything they could produce</b> with all their resources: Red 120 coats or 240 shirts; Blue 40 coats or 160 shirts. <b>Red is better at both.</b>", s: { m: 0 } },
  { cap: "Before trade each uses its resources on both goods. <b>Red</b> makes 80 coats and 80 shirts. <b>Blue</b> makes 30 coats and 40 shirts. The world makes 110 coats and 120 shirts.", s: { m: 1 } },
  { cap: "<b>Opportunity cost.</b> A coat costs Red 2 shirts but costs Blue 4. So <b>Red has the comparative advantage in coats</b> and <b>Blue in shirts</b>, even though Red is better at both.", s: { m: 1, oc: 1 } },
  { cap: "<b>Specialise.</b> Red moves all resources into coats (120). Blue moves all into shirts (160). The world now makes <b>120 coats and 160 shirts</b>: more of both.", s: { m: 1, oc: 1, sp: 1 } },
  { cap: "<b>Trade at 1 coat = 3 shirts</b>, a rate between 2 and 4. Red sells 40 coats and buys 120 shirts. Blue sells 120 shirts and buys 40 coats.", s: { m: 1, oc: 1, sp: 1, tl: 1 } },
  { cap: "<b>The gain:</b> Red consumes 80 coats and 120 shirts. Blue consumes 40 coats and 40 shirts. Both points lie <b>outside</b> their before-trade positions, and for Red, outside its PPC.", s: { m: 1, oc: 1, sp: 1, tl: 1, tr: 1 } },
] });

/* ---------- terms of trade stepper ---------- */
function totChart(s) {
  const X0 = 90, bw = 90, Y = (v) => 330 - v * 1.7, ex = s.ex, im = s.im, tot = (ex / im) * 100;
  let o = SV.line(60, 330, 700, 330) + SV.line(60, 330, 60, 60) + SV.text(66, 56, "Price index (base year = 100)", "sm");
  o += SV.line(60, Y(100), 700, Y(100), "gr") + SV.text(64, Y(100) - 6, "100", "sm");
  o += SV.rect(X0, Y(ex), bw, 330 - Y(ex), "f3") + SV.rect(X0 + 140, Y(im), bw, 330 - Y(im), "f2");
  o += SV.text(X0 + bw / 2, Y(ex) - 8, Lib.fmtN(ex, 0), "lbl bd t3", { "text-anchor": "middle" }) + SV.text(X0 + 140 + bw / 2, Y(im) - 8, Lib.fmtN(im, 0), "lbl bd t2", { "text-anchor": "middle" });
  o += SV.text(X0 + bw / 2, 350, "Export prices", "sm", { "text-anchor": "middle" }) + SV.text(X0 + 140 + bw / 2, 350, "Import prices", "sm", { "text-anchor": "middle" });
  o += SV.text(480, 150, "Terms of trade index", "lbl", { "text-anchor": "middle" }) + SV.text(480, 200, Lib.fmtN(tot, 0), "bd", { "text-anchor": "middle", style: "font-size:46px" });
  o += SV.text(480, 232, tot > 100.5 ? "Favourable: index above 100" : tot < 99.5 ? "Unfavourable: index below 100" : "No change", "lbl bd " + (tot > 100.5 ? "t3" : tot < 99.5 ? "t2" : ""), { "text-anchor": "middle" });
  o += SV.text(480, 262, "Exports needed to buy 1 unit of imports: " + Lib.fmtN(100 / tot, 2), "sm", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 370, label: "Export and import price indices and the terms of trade index", base: { ex: 100, im: 100 }, draw: totChart, steps: [
  { cap: "In the base year both price indices are <b>100</b>, so the terms of trade index is <b>100</b>.", s: { ex: 100, im: 100 } },
  { cap: "<b>Export prices rise to 125</b> (say, higher world demand). The index = 125 ÷ 100 × 100 = <b>125</b>. A <b>favourable</b> movement: the country can buy more imports for each unit it exports.", s: { ex: 125, im: 100 } },
  { cap: "Now <b>import prices also rise to 125</b> (for example, higher oil prices). The index returns to <b>100</b>: the gain is cancelled.", s: { ex: 125, im: 125 } },
  { cap: "Import prices rise again to <b>150</b> while export prices stay at 125. The index falls to <b>83</b>: an <b>unfavourable</b> movement. More exports must be sold for each unit of imports.", s: { ex: 125, im: 150 } },
] });

/* ---------- Lab 1 ---------- */
function lab1() {
  if (!$("#la1") || !$("#la2") || !$("#la3") || !$("#la4") || !$("#la5")) return;
  const rc = +$("#la1").value, rs = +$("#la2").value, bc = +$("#la3").value, bs = +$("#la4").value, t = +$("#la5").value;
  const rOcC = rs / rc, bOcC = bs / bc, rOcS = rc / rs, bOcS = bc / bs;
  $("#a1").textContent = Lib.fmtN(rOcC, 2) + " shirts"; $("#a2").textContent = Lib.fmtN(bOcC, 2) + " shirts";
  $("#a3").textContent = Lib.fmtN(rOcS, 2) + " coats"; $("#a4").textContent = Lib.fmtN(bOcS, 2) + " coats";
  const abs = (a, b, ca, cb) => (ca > cb && a > b ? "both" : ca > cb ? "coats" : a > b ? "shirts" : "neither");
  $("#a5").textContent = rc > bc && rs > bs ? "both goods" : rc > bc ? "coats" : rs > bs ? "shirts" : "neither";
  $("#a6").textContent = bc > rc && bs > rs ? "both goods" : bc > rc ? "coats" : bs > rs ? "shirts" : "neither";
  const same = Math.abs(rOcC - bOcC) < 0.005;
  const redCoats = rOcC < bOcC;
  $("#a7").textContent = same ? "none" : redCoats ? "coats" : "shirts"; $("#a8").textContent = same ? "none" : redCoats ? "shirts" : "coats";
  if (same) { $("#a9").textContent = "-"; $("#a10").textContent = "-"; $("#av").textContent = "Identical opportunity costs: no gains from trade."; return; }
  const lo = Math.min(rOcC, bOcC), hi = Math.max(rOcC, bOcC);
  const gC = redCoats ? t - rOcC : bOcC - t; // coat exporter gain
  const gB = redCoats ? bOcC - t : t - rOcC; // coat importer gain
  $("#a9").textContent = Lib.fmtN(redCoats ? gC : gB, 2); $("#a10").textContent = Lib.fmtN(redCoats ? gB : gC, 2);
  const within = t > lo && t < hi;
  $("#av").textContent = within ? `The exchange rate (${t} shirts per coat) lies between ${Lib.fmtN(lo, 2)} and ${Lib.fmtN(hi, 2)}, so both countries gain. ${redCoats ? "Red" : "Blue"} specialises in coats and ${redCoats ? "Blue" : "Red"} in shirts.` : `At ${t} shirts per coat, outside the range ${Lib.fmtN(lo, 2)} to ${Lib.fmtN(hi, 2)}, one country does not gain, so trade will not happen at this rate.`;
}
Lib.slider($("#g1"), { id: "la1", label: "Red: max coats", min: 20, max: 200, step: 5, value: 120, fmt: (v) => v, onInput: lab1 });
Lib.slider($("#g2"), { id: "la2", label: "Red: max shirts", min: 20, max: 400, step: 5, value: 240, fmt: (v) => v, onInput: lab1 });
Lib.slider($("#g3"), { id: "la3", label: "Blue: max coats", min: 10, max: 200, step: 5, value: 40, fmt: (v) => v, onInput: lab1 });
Lib.slider($("#g4"), { id: "la4", label: "Blue: max shirts", min: 20, max: 400, step: 5, value: 160, fmt: (v) => v, onInput: lab1 });
Lib.slider($("#g5"), { id: "la5", label: "Exchange rate: shirts per coat", min: 0.5, max: 8, step: 0.25, value: 3, fmt: (v) => v.toFixed(2), onInput: lab1 });

/* ---------- Lab 2 ---------- */
function lab2() {
  if (!$("#lb1") || !$("#lb2")) return;
  const ex = +$("#lb1").value, im = +$("#lb2").value, tot = (ex / im) * 100;
  $("#b1").textContent = Lib.fmtN(tot, 1); $("#b2").textContent = Lib.fmtN(100 / tot, 2);
  $("#bv").textContent = tot > 100.5 ? "Favourable movement: fewer exports are needed to buy the same imports." : tot < 99.5 ? "Unfavourable movement (a deterioration): more exports are needed for the same imports." : "No change in the terms of trade.";
  const Y = (v) => 170 - v * 0.55;
  $("#labB").innerHTML = SV.line(40, 170, 400, 170) + SV.line(40, 170, 40, 10) + SV.rect(90, Y(ex), 80, 170 - Y(ex), "f3") + SV.rect(230, Y(im), 80, 170 - Y(im), "f2") +
    SV.text(130, Y(ex) - 6, ex, "lbl bd t3", { "text-anchor": "middle" }) + SV.text(270, Y(im) - 6, im, "lbl bd t2", { "text-anchor": "middle" }) +
    SV.text(130, 188, "Export prices", "sm", { "text-anchor": "middle" }) + SV.text(270, 188, "Import prices", "sm", { "text-anchor": "middle" });
}
Lib.slider($("#g6"), { id: "lb1", label: "Index of export prices", min: 60, max: 180, step: 1, value: 100, fmt: (v) => v, onInput: lab2 });
Lib.slider($("#g7"), { id: "lb2", label: "Index of import prices", min: 60, max: 180, step: 1, value: 100, fmt: (v) => v, onInput: lab2 });
const setP = (e, i) => { $("#lb1").value = e; $("#lb2").value = i; $("#lb2").dispatchEvent(new Event("input")); $("#lb1").dispatchEvent(new Event("input")); };
$("#pr1").onclick = () => setP(120, 100); $("#pr2").onclick = () => setP(100, 125); $("#pr3").onclick = () => setP(80, 100); $("#pr4").onclick = () => setP(100, 100);
$("#lb1").dispatchEvent(new Event("input"));

/* ---------- Lab 3 ---------- */
Lib.slider($("#g8"), { id: "lc1", label: "Transport cost per coat traded (in shirts)", min: 0, max: 3, step: 0.1, value: 0.5, fmt: (v) => v.toFixed(1), onInput: (v) => {
  const net = 2 - v; $("#c1").textContent = v.toFixed(1); $("#c2").textContent = net.toFixed(1);
  $("#cv").textContent = net > 0.05 ? `Trade still gains ${net.toFixed(1)} shirts per coat, shared between the countries.` : net > -0.05 ? "The gain is gone: it is no longer worth trading." : "Transport costs exceed the gain: trade makes the countries worse off, so it will not take place.";
} });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Which idea does each statement belong to?",
  buckets: [{ label: "Absolute advantage" }, { label: "Comparative advantage" }, { label: "Terms of trade" }, { label: "Limitation of the theory" }],
  items: [
    { text: "Produces more with the same resources", b: 0 }, { text: "Indonesia grows more rice per hectare than Brazil", b: 0 },
    { text: "Lower opportunity cost of production", b: 1 }, { text: "A country better at everything can still have this in one good", b: 1 },
    { text: "Index of export prices ÷ index of import prices × 100", b: 2 }, { text: "A rise in the index is favourable", b: 2 },
    { text: "High transport costs offset the gain", b: 3 }, { text: "Resources cannot switch industries easily", b: 3 },
    { text: "Governments may impose trade restrictions", b: 3 }, { text: "Fewer exports needed to buy the same imports", b: 2 },
  ], done: "Keep these four ideas separate.",
});
Lib.classify($("#cl2"), {
  prompt: "Place each statement under the country it describes.",
  buckets: [{ label: "Russia" }, { label: "Vietnam" }, { label: "Both / Neither" }],
  items: [
    { text: "Has the comparative advantage in smartphones", b: 1 }, { text: "Has the comparative advantage in shoes", b: 0 },
    { text: "Opportunity cost of 20 smartphones is half of 20 pairs of shoes", b: 0 }, { text: "Opportunity cost of 20 smartphones is one third of 20 pairs of shoes", b: 1 },
    { text: "Has an absolute advantage in both goods", b: 1 }, { text: "Should specialise in shoes", b: 0 },
    { text: "Can gain from trading with the other", b: 2 },
  ], done: "Vietnam is better at both, yet Russia still gains by specialising in shoes.",
});
Lib.order($("#o1"), { prompt: "Order the steps for finding comparative advantage.", items: [
  "Write down how much of each good each country can produce with the same resources",
  "Work out the opportunity cost of one good in each country (the other good given up ÷ the good gained)",
  "Compare the opportunity costs across the two countries",
  "The country with the lower opportunity cost has the comparative advantage in that good",
  "Each country specialises in the good where it has the comparative advantage",
  "Trade at an exchange rate between the two opportunity cost ratios so both gain",
], done: "A reliable exam routine." });
Lib.calc($("#c1"), { qs: [
  { q: "Red can make 120 coats or 240 shirts. What is the opportunity cost of one coat, in shirts?", a: 2, sol: "240 ÷ 120 = <b>2 shirts</b> per coat." },
  { q: "Blue can make 40 coats or 160 shirts. What is the opportunity cost of one shirt, in coats?", a: 0.25, tol: 0.001, sol: "40 ÷ 160 = <b>0.25 coat</b> per shirt." },
  { q: "Vietnam needs 3 hours to make 20 pairs of shoes and 1 hour to make 20 smartphones. How many pairs of shoes does 20 smartphones cost Vietnam (1 d.p.)?", a: 6.7, tol: 0.1, hint: "In 1 hour Vietnam could make a third of 20 pairs of shoes.", sol: "1 hour of resources makes 20 smartphones, or 20 ÷ 3 = <b>6.7</b> pairs of shoes." },
  { q: "Russia needs 6 hours for 20 pairs of shoes and 3 hours for 20 smartphones. How many pairs of shoes does 20 smartphones cost Russia?", a: 10, sol: "3 hours would make half of 20 pairs: <b>10 pairs</b>. More than Vietnam's 6.7, so Vietnam has the comparative advantage in smartphones." },
  { q: "The index of export prices is 130 and the index of import prices is 104. Calculate the terms of trade index.", a: 125, sol: "130 ÷ 104 × 100 = <b>125</b>. Favourable." },
  { q: "A country's terms of trade index falls from 110 to 99. Calculate the percentage change (1 d.p., enter the sign).", a: -10, tol: 0.05, ph: "e.g. -5.0", sol: "(99 − 110) ÷ 110 × 100 = <b>−10.0%</b>. An unfavourable movement." },
  { q: "Red exports 40 coats at 3 shirts each. Making a coat at home costs 2 shirts. How many extra shirts does Red gain compared with using its own resources?", a: 40, sol: "Gain per coat = 3 − 2 = 1 shirt. 40 × 1 = <b>40 shirts</b>." },
] });
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Factor endowment", "The quantity and quality of a country's resources"],
  ["Absolute advantage", "Producing more of a good with the same resources"],
  ["Comparative advantage", "Producing a good at a lower opportunity cost"],
  ["Specialisation", "Concentrating production on a narrow range of goods"],
  ["Terms of trade", "The ratio of export prices to import prices"],
  ["Free trade", "Trade without taxes, quotas or other restrictions"],
  ["Trading possibility curve", "Shows consumption possibilities with trade, beyond the PPC"],
], done: "Strong vocabulary." });
Lib.quiz($("#qz1"), { qs: [
  { q: "Country X can make 10 units of A or 20 of B. Country Y can make 6 units of A or 18 of B. Which has the comparative advantage in A?", opts: ["X", "Y", "Both", "Neither"], a: 0, why: "X: 1 A costs 2 B. Y: 1 A costs 3 B. X has the lower opportunity cost, so X has the advantage in A." },
  { q: "A country with an absolute advantage in all goods:", opts: ["Cannot gain from trade", "Can still gain from trade", "Should not specialise", "Has no opportunity cost"], a: 1, why: "Opportunity costs still differ, so there are gains from specialising." },
  { q: "For both countries to gain, the exchange rate between goods must lie:", opts: ["Below both opportunity costs", "Above both opportunity costs", "Between the two opportunity costs", "At zero"], a: 2, why: "Each country must get a better rate than at home." },
  { q: "The terms of trade index rises from 100 to 110. This means:", opts: ["Export prices fell relative to import prices", "Export prices rose relative to import prices", "The trade deficit fell", "Export volumes rose"], a: 1, why: "The index is export prices relative to import prices. A rise is favourable." },
  { q: "Which is a limitation of comparative advantage theory?", opts: ["Resources move freely", "Zero transport costs", "Resources may not move easily between industries", "Free trade"], a: 2, why: "The theory assumes full mobility; in practice, this causes structural unemployment." },
  { q: "The Prebisch–Singer hypothesis suggests that:", opts: ["Terms of trade improve for primary producers", "Terms of trade tend to move against primary producers", "Trade is always balanced", "Absolute advantage is the cause of trade"], a: 1, why: "Demand for manufactures grows faster than for primary products as incomes rise." },
  { q: "A trading possibility curve shows that trade lets a country:", opts: ["Produce outside its PPC", "Consume outside its PPC", "Shift its PPC inwards", "Avoid opportunity cost"], a: 1, why: "A country cannot produce beyond its PPC, but trade lets it consume beyond it." },
  { q: "Higher export prices caused by higher wage costs are most likely to:", opts: ["Raise export volumes", "Be good for competitiveness", "Reduce demand for exports", "Lower import prices"], a: 2, why: "Costs-driven price rises make exports less competitive." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Factor endowment", "The quantity and quality of land, labour, capital and enterprise a country has."],
  ["Specialisation", "Concentrating on producing a narrow range of goods and services."],
  ["Absolute advantage", "The ability to produce more of a good with the same resources than another country."],
  ["Comparative advantage", "The ability to produce a good at a lower opportunity cost than another country."],
  ["Opportunity cost", "The next best alternative given up when a choice is made."],
  ["Free trade", "Exchange of goods and services across borders without government restrictions."],
  ["Trade liberalisation", "Removing barriers to trade such as tariffs and quotas."],
  ["Trading possibility curve", "Shows what a country can consume with trade, which can lie outside its PPC."],
  ["Terms of trade", "Index of export prices ÷ index of import prices × 100."],
  ["Favourable terms of trade", "A rise in the index: fewer exports are needed to buy a given quantity of imports."],
  ["Unfavourable terms of trade", "A fall in the index: more exports are needed to buy the same imports."],
  ["Prebisch–Singer hypothesis", "Terms of trade tend to move against primary-product exporters."],
  ["Structural unemployment", "Unemployment caused by a mismatch of workers' skills with available jobs."],
  ["Overspecialisation", "Depending on too few products, exposing a country to price falls."],
  ["Trade restrictions", "Tariffs, quotas and other barriers that limit imports."],
] });
lab1(); lab2();
