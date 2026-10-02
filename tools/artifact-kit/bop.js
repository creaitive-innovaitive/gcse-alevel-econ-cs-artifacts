const clamp01 = (v) => Math.max(0, Math.min(1, v));

/* ---------- waterfall of the current account ---------- */
function waterfall(v, n, H) {
  const g = v.g, s = v.s, p = v.p, sec = v.sec, gs = g + s, ca = gs + p + sec;
  const items = [
    { l: "Goods", a: 0, b: g, k: "d" }, { l: "Services", a: g, b: gs, k: "d" }, { l: "Goods and services", a: 0, b: gs, k: "sub" },
    { l: "Primary income", a: gs, b: gs + p, k: "d" }, { l: "Secondary income", a: gs + p, b: ca, k: "d" }, { l: "Current account", a: 0, b: ca, k: "tot" },
  ];
  const vals = items.flatMap((i) => [i.a, i.b]).concat([0]);
  let lo = Math.min(...vals), hi = Math.max(...vals); const pad = (hi - lo) * 0.12 || 10; lo -= pad; hi += pad;
  const top = 40, bottom = H - 50, Y = (x) => bottom - ((x - lo) / (hi - lo)) * (bottom - top), X = (i) => 80 + i * 108;
  let o = SV.line(60, Y(0), 740, Y(0), "ax") + SV.text(64, Y(0) - 6, "0", "sm") + SV.text(64, 22, "$ million (credits above zero, debits below)", "sm");
  items.forEach((it, i) => {
    const op = clamp01(n - i); if (op <= 0) return;
    const y1 = Y(Math.max(it.a, it.b)), y2 = Y(Math.min(it.a, it.b)), cls = it.k === "sub" ? "f1" : it.k === "tot" ? "f4" : it.b >= it.a ? "f3" : "f2";
    o += `<rect x="${X(i)}" y="${y1}" width="78" height="${Math.max(2, y2 - y1)}" class="${cls}" style="opacity:${op * (it.k === "d" ? 0.6 : 0.5)}"/>`;
    o += `<rect x="${X(i)}" y="${y1}" width="78" height="${Math.max(2, y2 - y1)}" fill="none" stroke="currentColor" stroke-width="1.5" opacity="${op * 0.6}"/>`;
    const val = it.b - it.a, txt = (val > 0 ? "+" : "") + Lib.fmtN(val, 0);
    o += SV.text(X(i) + 39, val >= 0 ? y1 - 6 : y2 + 16, txt, "lbl bd" + (it.k === "tot" ? " t4" : ""), { "text-anchor": "middle", opacity: op });
    o += SV.text(X(i) + 39, H - 28, it.l, "sm", { "text-anchor": "middle", opacity: op });
    if (i < 5 && it.k === "d" && op > 0.9) o += SV.line(X(i) + 78, Y(it.b), X(i) + 108, Y(it.b), "gr");
  });
  if (n >= 6) o += SV.text(400, H - 6, ca < 0 ? "Current account DEFICIT of " + Lib.fmtN(-ca, 0) : ca > 0 ? "Current account SURPLUS of " + Lib.fmtN(ca, 0) : "Current account in balance", "lbl bd " + (ca < 0 ? "t2" : "t3"), { "text-anchor": "middle" });
  return o;
}

/* ---------- stepper A: flows in and out ---------- */
const ROWS = [
  ["Trade in goods", "Exports of goods (credit +)", "Imports of goods (debit −)"],
  ["Trade in services", "Tourists, banking, shipping sold abroad (credit +)", "Services bought from abroad (debit −)"],
  ["Primary income", "Dividends, interest, profits and wages earned abroad (credit +)", "Dividends and interest paid to foreigners (debit −)"],
  ["Secondary income", "Remittances and aid received (credit +)", "Aid given and transfers sent abroad (debit −)"],
];
function flows(s) {
  let o = SV.rect(20, 14, 130, 410, "f1", { rx: 12, opacity: 0.35 }) + SV.rect(610, 14, 130, 410, "f4", { rx: 12, opacity: 0.35 });
  o += SV.text(85, 210, "Rest of", "lbl bd", { "text-anchor": "middle" }) + SV.text(85, 228, "the world", "lbl bd", { "text-anchor": "middle" });
  o += SV.text(675, 210, "Home", "lbl bd", { "text-anchor": "middle" }) + SV.text(675, 228, "economy", "lbl bd", { "text-anchor": "middle" });
  ROWS.forEach((r, i) => {
    const op = clamp01(s.n - i), y = 52 + i * 98;
    o += SV.text(380, y - 14, r[0], "lbl bd", { "text-anchor": "middle", opacity: op });
    o += SV.line(160, y + 6, 596, y + 6, "c3", { opacity: op }) + SV.arrowHead(604, y + 6, "r", "dot3").replace("<polygon", `<polygon opacity="${op}"`);
    o += SV.text(380, y + 24, "Money IN: " + r[1], "sm t3", { "text-anchor": "middle", opacity: op });
    o += SV.line(600, y + 42, 164, y + 42, "c2", { opacity: op }) + SV.arrowHead(156, y + 42, "l", "dot2").replace("<polygon", `<polygon opacity="${op}"`);
    o += SV.text(380, y + 60, "Money OUT: " + r[2], "sm t2", { "text-anchor": "middle", opacity: op });
  });
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 440, label: "Money flows into and out of a country for each part of the current account", base: { n: 0 }, draw: flows, dwell: 4200, steps: [
  { cap: "The current account records <b>money flowing in (credits, +)</b> and <b>money flowing out (debits, −)</b> between a country and the rest of the world. There are four parts.", s: { n: 0 } },
  { cap: "<b>Trade in goods.</b> Selling goods abroad brings money in; buying goods from abroad sends money out. This is the <b>visible</b> balance.", s: { n: 1 } },
  { cap: "<b>Trade in services</b> (invisibles): tourism, banking, insurance and shipping, in both directions.", s: { n: 2 } },
  { cap: "<b>Primary income</b>: dividends, interest, profits and the wages of residents working abroad, coming in and going out.", s: { n: 3 } },
  { cap: "<b>Secondary income</b>: transfers with nothing in exchange, such as workers' remittances and foreign aid. Add up all the credits and debits to get the current account balance.", s: { n: 4 } },
] });

/* ---------- stepper B: waterfall ---------- */
Lib.stepper($("#stB"), { w: 760, h: 350, label: "Waterfall building the current account balance", base: { n: 0 }, tween: 1100, draw: (s) => waterfall({ g: -300, s: 60, p: 70, sec: 45 }, s.n, 350), dwell: 4300, steps: [
  { cap: "A country exports $900m of goods and imports $1,200m. <b>Goods balance = 900 − 1,200 = −$300m</b>, a deficit.", s: { n: 1 } },
  { cap: "Exports of services are $160m and imports $100m. <b>Services balance = +$60m.</b> Running total: −300 + 60 = −240.", s: { n: 2 } },
  { cap: "<b>Trade in goods and services = −$240m.</b> This is the trade balance.", s: { n: 3 } },
  { cap: "Add <b>primary income</b>: +$70m. Running total: −240 + 70 = −170.", s: { n: 4 } },
  { cap: "Add <b>secondary income</b>: +$45m. Running total: −170 + 45 = −125.", s: { n: 5 } },
  { cap: "<b>Current account balance = −$125m: a deficit.</b> Income flows help, but not enough to offset the trade deficit.", s: { n: 6 } },
] });

/* ---------- stepper C: cyclical vs structural ---------- */
const CYC = [0, -1, -3, -4, -3, -1, 1, 2, 1, -1, -3, -2, 0], STR = [0, -1, -2, -3, -4, -5, -5.5, -6, -6.5, -7, -7, -7.5, -8];
function trend(s) {
  const X = (i) => 80 + i * 50, Y = (v) => 200 - v * 18;
  const part = (arr, t) => { const k = Math.floor(t), pts = arr.slice(0, k + 1).map((v, i) => [X(i), Y(v)]); if (k < 12 && t > k) { const f = t - k; pts.push([X(k + f), Y(arr[k] + (arr[k + 1] - arr[k]) * f)]); } return pts; };
  let o = SV.line(60, 40, 60, 360) + SV.line(60, Y(0), 700, Y(0)) + SV.text(64, 34, "Current account balance", "sm") + SV.text(700, Y(0) - 8, "Surplus above, deficit below", "sm", { "text-anchor": "end" }) + SV.text(700, 380, "Years", "sm", { "text-anchor": "end" });
  if (s.tc > 0) { o += SV.path(ptsPath(part(CYC, s.tc)), "c3"); o += SV.text(X(12) + 4, Y(CYC[12]) - 8, "Cyclical", "lbl bd t3", { opacity: clamp01(s.tc - 11) }); }
  if (s.ts > 0) { o += SV.path(ptsPath(part(STR, s.ts)), "c2"); o += SV.text(X(12) - 6, Y(STR[12]) + 18, "Structural", "lbl bd t2", { "text-anchor": "end", opacity: clamp01(s.ts - 11) }); }
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 390, label: "Cyclical and structural current account deficits over time", base: { tc: 0, ts: 0 }, tween: 2200, dwell: 5500, draw: trend, steps: [
  { cap: "The line at zero is a balanced current account. Below it is a deficit. Let's compare two kinds of deficit.", s: { tc: 0, ts: 0 } },
  { cap: "<b>Cyclical deficit.</b> A boom raises imports (or partners slow down), so the balance dips into deficit. When the cycle turns, imports fall and exports recover, so it <b>corrects itself</b>.", s: { tc: 12, ts: 0 } },
  { cap: "<b>Structural deficit.</b> Exports are uncompetitive (overvalued exchange rate, high inflation, low productivity). The deficit <b>persists and widens</b> and does not self-correct.", s: { tc: 12, ts: 12 } },
  { cap: "<b>Conclusion:</b> cyclical deficits are usually a small concern. Structural deficits need supply-side and exchange rate solutions, and have to be financed by borrowing or foreign investment.", s: { tc: 12, ts: 12 } },
] });

/* ---------- Lab 1 ---------- */
function lab1() {
  const ids = ["k_a", "k_b", "k_c", "k_d", "k_e", "k_f", "k_g"]; if (ids.some((i) => !$("#" + i))) return;
  const [xg, mg, xs, ms, p, sec, gdp] = ids.map((i) => +$("#" + i).value);
  const g = xg - mg, s = xs - ms, gs = g + s, ca = gs + p + sec;
  $("#k1").textContent = Lib.fmtN(g, 0); $("#k2").textContent = Lib.fmtN(s, 0); $("#k3").textContent = Lib.fmtN(gs, 0); $("#k4").textContent = Lib.fmtN(ca, 0);
  $("#k5").textContent = Lib.fmtN((ca / gdp) * 100, 1) + "%";
  $("#kv").textContent = ca < 0 ? `A current account deficit of ${Lib.fmtN(-ca, 0)}, which is ${Lib.fmtN((-ca / gdp) * 100, 1)}% of GDP. ${g < 0 && s > 0 ? "Goods are in deficit but services help." : ""}` : ca > 0 ? `A surplus of ${Lib.fmtN(ca, 0)}, which is ${Lib.fmtN((ca / gdp) * 100, 1)}% of GDP.` : "The current account is balanced.";
  $("#labK").innerHTML = waterfall({ g, s, p, sec }, 6, 330);
}
const sl = (c, id, label, min, max, step, v) => Lib.slider($("#" + c), { id, label, min, max, step, value: v, fmt: (x) => x, onInput: lab1 });
sl("g1", "k_a", "Exports of goods", 0, 3000, 10, 900); sl("g2", "k_b", "Imports of goods", 0, 3000, 10, 1200); sl("g3", "k_c", "Exports of services", 0, 1000, 5, 160);
sl("g4", "k_d", "Imports of services", 0, 1000, 5, 100); sl("g5", "k_e", "Primary income balance", -400, 400, 5, 70); sl("g6", "k_f", "Secondary income balance", -400, 400, 5, 45); sl("g7", "k_g", "GDP", 500, 20000, 100, 5000);

/* ---------- Lab 2 ---------- */
const BASE = { xg: 900, mg: 1200, xs: 160, ms: 100, p: 70, sec: 45 };
const SC = [
  { x: -0.15, m: 0, sec: 0, t: "Cyclical. A recession in trading partners cuts their spending on this country's exports, so export revenue falls and the deficit widens. It should correct when partners recover." },
  { x: 0, m: 0.15, sec: 0, t: "Cyclical. A domestic boom raises spending on imports of goods and services, so the deficit widens. This is usually short term, and the extra imports (such as capital goods) may raise future output." },
  { x: -0.10, m: 0.10, sec: 0, t: "Structural. An overvalued exchange rate makes exports dearer abroad and imports cheaper at home, so the deficit widens and will not correct itself without a change in competitiveness." },
  { x: 0.10, m: -0.05, sec: 0, t: "Structural improvement. Higher productivity lowers costs, so exports become more competitive and imports are replaced by home output. The balance improves, here into surplus." },
  { x: 0, m: 0, sec: 30, t: "Secondary income. Workers abroad send more money home. A credit item, so the deficit narrows." },
];
$$("[data-sc]").forEach((b) => b.addEventListener("click", () => {
  const i = +b.dataset.sc; if (i === 5) { $("#m1").textContent = "−125"; $("#m2").textContent = "0"; $("#mv").textContent = "Choose an event."; return; }
  const e = SC[i], xg = BASE.xg * (1 + e.x), xs = BASE.xs * (1 + e.x), mg = BASE.mg * (1 + e.m), ms = BASE.ms * (1 + e.m);
  const ca = xg - mg + xs - ms + BASE.p + BASE.sec + e.sec;
  $("#m1").textContent = Lib.fmtN(ca, 0).replace("-", "−"); $("#m2").textContent = (ca + 125 > 0 ? "+" : "") + Lib.fmtN(ca + 125, 0).replace("-", "−"); $("#mv").textContent = e.t;
}));
$("[data-sc='5']").click();

/* ---------- Lab 3 ---------- */
function lab3() {
  const ids = ["n_a", "n_b", "n_c", "n_d"]; if (ids.some((i) => !$("#" + i))) return;
  const [da, ga, db, gb] = ids.map((i) => +$("#" + i).value), pa = (da / ga) * 100, pb = (db / gb) * 100;
  $("#n1").textContent = Lib.fmtN(pa, 1) + "%"; $("#n2").textContent = Lib.fmtN(pb, 1) + "%";
  $("#nv").textContent = pa > pb + 0.05 ? "Country A's deficit is bigger relative to its economy, so it is likely to be the bigger concern." : pb > pa + 0.05 ? `Country B has the smaller deficit in money terms (${db} against ${da}) but a bigger share of GDP, so it is likely to be the bigger concern.` : "Equal shares of GDP.";
}
const sl3 = (c, id, label, min, max, step, v) => Lib.slider($("#" + c), { id, label, min, max, step, value: v, fmt: (x) => x, onInput: lab3 });
sl3("g8", "n_a", "Country A: deficit ($bn)", 1, 400, 1, 100); sl3("g9", "n_b", "Country A: GDP ($bn)", 500, 20000, 100, 2500); sl3("g10", "n_c", "Country B: deficit ($bn)", 0.1, 50, 0.1, 1); sl3("g11", "n_d", "Country B: GDP ($bn)", 5, 500, 0.5, 13.5);

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Which part of the current account does each item belong to?",
  buckets: [{ label: "Trade in goods" }, { label: "Trade in services" }, { label: "Primary income" }, { label: "Secondary income" }],
  items: [
    { text: "Export of cars", b: 0 }, { text: "Import of oil", b: 0 }, { text: "Foreign tourists spending in the country", b: 1 },
    { text: "Banking services sold to foreign firms", b: 1 }, { text: "Dividends paid to foreign shareholders", b: 2 }, { text: "Wages of residents working abroad", b: 2 },
    { text: "Interest paid to a foreign bank", b: 2 }, { text: "Workers' remittances sent home", b: 3 }, { text: "Foreign aid received", b: 3 }, { text: "Payments to an international organisation", b: 3 },
  ], done: "Goods and services are trade; primary income is income from investment and work; secondary income is transfers.",
});
Lib.classify($("#cl2"), {
  prompt: "Does each item bring money in (credit) or send it out (debit)?",
  buckets: [{ label: "Credit (+)" }, { label: "Debit (−)" }],
  items: [
    { text: "Export of cotton", b: 0 }, { text: "Import of phones", b: 1 }, { text: "Tourist spending by foreign visitors", b: 0 }, { text: "Interest paid to a foreign bank", b: 1 },
    { text: "Remittances received from workers abroad", b: 0 }, { text: "Foreign aid given", b: 1 }, { text: "Dividends received from investments abroad", b: 0 }, { text: "Payment for foreign shipping services", b: 1 },
  ], done: "Always ask: is money coming into the country or leaving it?",
});
Lib.classify($("#cl3"), {
  prompt: "Is each cause of a deficit usually cyclical or structural?",
  buckets: [{ label: "Cyclical (short term, self-correcting)" }, { label: "Structural (long term, will not correct itself)" }],
  items: [
    { text: "A domestic boom raises imports", b: 0 }, { text: "Recession in major trading partners", b: 0 }, { text: "An overvalued exchange rate", b: 1 },
    { text: "Low labour productivity", b: 1 }, { text: "High inflation compared with rivals", b: 1 }, { text: "Poor education and low investment", b: 1 },
  ], done: "Structural problems are the more worrying.",
});
Lib.order($("#o1"), { prompt: "Order the steps for working out a current account balance.", items: [
  "Goods balance = exports of goods − imports of goods",
  "Services balance = exports of services − imports of services",
  "Trade in goods and services = goods balance + services balance",
  "Add the primary income balance",
  "Add the secondary income balance",
  "State the result as a surplus or a deficit, with units",
], done: "A reliable method." });
Lib.calc($("#c1"), { qs: [
  { q: "USA: exports of goods $1,670bn and imports of goods $2,620bn. Calculate the balance of trade in goods ($bn, keep the sign).", a: -950, ph: "e.g. -100", sol: "1,670 − 2,620 = <b>−$950bn</b>." },
  { q: "USA: exports of services $828bn and imports of services $558bn. Calculate the balance of trade in services ($bn).", a: 270, sol: "828 − 558 = <b>+$270bn</b>." },
  { q: "Using these answers, calculate the USA's balance of trade in goods and services ($bn).", a: -680, sol: "−950 + 270 = <b>−$680bn</b>." },
  { q: "Primary income is +$245bn and secondary income is −$119bn. Calculate the USA's current account balance ($bn).", a: -554, sol: "−680 + 245 − 119 = <b>−$554bn</b>: a deficit." },
  { q: "Pakistan: credits are goods 2,062, services 442, primary income 85 and secondary income 2,215. Debits are goods 4,741, services 733, primary income 594 and secondary income 14 ($m). Calculate the current account deficit ($m).", a: 1278, hint: "Total credits minus total debits.", sol: "Credits = 2,062 + 442 + 85 + 2,215 = 4,804. Debits = 4,741 + 733 + 594 + 14 = 6,082. Balance = 4,804 − 6,082 = −1,278: a deficit of <b>$1,278m</b>." },
  { q: "In the Pakistan example, workers' remittances were $2,060m. What would the deficit have been without them ($m)?", a: 3338, sol: "1,278 + 2,060 = <b>$3,338m</b>." },
  { q: "A country has a current account deficit of $40bn and a GDP of $500bn. Calculate the deficit as a percentage of GDP.", a: 8, sol: "40 ÷ 500 × 100 = <b>8%</b>." },
] });
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Credit item", "A transaction that brings money into the country"],
  ["Debit item", "A transaction that sends money out of the country"],
  ["Visible trade", "Trade in goods"],
  ["Invisibles", "Trade in services"],
  ["Workers' remittances", "Money sent home by people working abroad (secondary income)"],
  ["Cyclical deficit", "A deficit caused by the economic cycle, likely to correct itself"],
  ["Structural deficit", "A long-term deficit caused by a lack of competitiveness"],
], done: "Good vocabulary." });
Lib.quiz($("#qz1"), { qs: [
  { q: "Which would be a credit item in the primary income of the current account?", opts: ["Interest paid to a foreign bank", "Dividends received from investments abroad", "Imports of raw materials", "Foreign aid given"], a: 1, why: "Income earned abroad flows in and is a credit in primary income." },
  { q: "A trade in goods surplus means:", opts: ["Quantity of exports is above quantity of imports", "Value of exports of goods exceeds value of imports of goods", "Prices are rising", "The currency is strong"], a: 1, why: "Always value: price × quantity." },
  { q: "Which is most likely to cause a structural current account deficit?", opts: ["A short-term domestic boom", "Recession abroad", "Low productivity and an overvalued exchange rate", "Higher remittances"], a: 2, why: "Uncompetitiveness is a long-term problem." },
  { q: "A country has a deficit in goods of $500m, a surplus in services of $200m, primary income of +$100m and secondary income of −$50m. Its current account balance is:", opts: ["−$250m", "−$150m", "+$350m", "−$450m"], a: 0, why: "−500 + 200 + 100 − 50 = −$250m." },
  { q: "Foreign aid received appears in:", opts: ["Trade in goods", "Trade in services", "Primary income", "Secondary income"], a: 3, why: "It is a transfer with nothing exchanged." },
  { q: "A persistent current account deficit must be financed by:", opts: ["Higher exports only", "Borrowing or attracting foreign investment", "Lower imports of goods", "Cutting secondary income"], a: 1, why: "The country is spending more than it earns, so it needs money from elsewhere." },
  { q: "Which is a possible disadvantage of a large current account surplus?", opts: ["Residents' consumption is lower than possible", "Higher imports", "Lower exports", "A deficit in services"], a: 0, why: "A surplus means the country is earning more than it spends, so residents are not enjoying as much as possible." },
  { q: "Why is a deficit better judged as a percentage of GDP?", opts: ["It removes the sign", "It shows its size relative to the economy", "It avoids using exports", "It is easier to measure"], a: 1, why: "A $100bn deficit is small in a large economy and large in a small one." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Balance of payments", "A record of all economic transactions between a country's residents and the rest of the world."],
  ["Current account", "Trade in goods and services, primary income and secondary income."],
  ["Credit item", "Money coming into the country; recorded with a positive sign."],
  ["Debit item", "Money going out of the country; recorded with a negative sign."],
  ["Trade in goods (visible)", "Exports minus imports of goods."],
  ["Trade in services (invisibles)", "Exports minus imports of services such as tourism and banking."],
  ["Primary income", "Profits, interest, dividends and employees' compensation earned from or paid abroad."],
  ["Secondary income", "Transfers with nothing received in return, such as aid and remittances."],
  ["Workers' remittances", "Money sent home by people working abroad for a year or more."],
  ["Current account deficit", "Debits exceed credits across the four parts."],
  ["Current account surplus", "Credits exceed debits across the four parts."],
  ["Cyclical deficit", "A deficit from the economic cycle; short term and likely to self-correct."],
  ["Structural deficit", "A long-term deficit because firms are not internationally competitive."],
  ["International competitiveness", "How well a country's firms can sell in world markets on price and quality."],
  ["Overvalued exchange rate", "A rate that is higher than its competitive level, making exports dear."],
] });
lab1(); lab3();
