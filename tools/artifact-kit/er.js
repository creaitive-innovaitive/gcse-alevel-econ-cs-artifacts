/* ---------- geometry: supply curve through the market point (80, wage 10), slope m ---------- */
const WG = 10, QM = 80;
function geom(m) {
  const Lmin = m > 0 ? Math.max(0, QM - WG / m) : 0, Wmin = Math.max(0, WG - QM * m), Lmax = m > 0 ? Math.min(200, QM + 18 / m) : 200;
  const transfer = Lmin > 0 ? 0.5 * (QM - Lmin) * WG : 0.5 * QM * (WG + Wmin), pay = WG * QM, rent = pay - transfer;
  return { Lmin, Wmin, Lmax, transfer, rent, pay, endW: Math.min(26, WG + m * (Lmax - QM)) };
}
/* Draw the market for a given m. X(L), Y(w) are scale functions; o: labels, wl (wage line labels) */
function market(m, X, Y, o = {}) {
  const g = geom(m), P = (a) => a.map(([l, w]) => [X(l), Y(w)]);
  let s = "";
  s += SV.poly(P([[g.Lmin, 0], [QM, 0], [QM, WG], [g.Lmin, g.Wmin]]), "f1");
  s += SV.poly(P([[0, g.Wmin], [g.Lmin, g.Wmin], [QM, WG], [0, WG]]), "f3");
  // demand: W = 18 - 0.1 L
  s += SV.line(X(0), Y(18), X(180), Y(0), "c1") + SV.text(X(180) - 2, Y(0) - 6, "D", "lbl bd t1", { "text-anchor": "end" });
  s += SV.line(X(g.Lmin), Y(g.Lmin > 0 ? 0 : g.Wmin), X(g.Lmax), Y(g.endW), "c2") + SV.text(X(g.Lmax) + 6, Y(g.endW) + 4, "S", "lbl bd t2");
  s += SV.line(X(0), Y(WG), X(QM), Y(WG), "gr") + SV.line(X(QM), Y(WG), X(QM), Y(0), "gr") + SV.circle(X(QM), Y(WG), 6, "dot3");
  if (o.labels !== false) {
    s += SV.text(X(0) - 6, Y(WG) + 4, "wage", "sm", { "text-anchor": "end" });
    s += SV.text(X(Math.max(g.Lmin, 0) + (QM - g.Lmin) * 0.55), Y(WG * 0.25), "Transfer earnings", "lbl bd t1", { "text-anchor": "middle" });
    s += SV.text(X(Math.max(8, g.Lmin * 0.5 + 4)), Y(WG) + 18, g.rent / g.pay > 0.04 ? "Economic rent" : "", "lbl bd t3");
  }
  return s;
}
const MX = (L) => 80 + L * 3.1, MY = (w) => 330 - w * 15;
function axes() {
  return SV.line(80, 330, 710, 330) + SV.line(80, 330, 80, 30) + SV.text(710, 358, "Quantity of labour (number of workers)", "sm", { "text-anchor": "end" }) + SV.text(86, 34, "Wage", "sm");
}
const op = (v) => ({ opacity: Math.max(0, Math.min(1, v)) });

/* ---------- Learn: static picture ---------- */
$("#pic1").innerHTML = `<svg viewBox="0 0 760 370" role="img" aria-label="Labour market diagram with transfer earnings under the supply curve and economic rent above it">${axes()}
  ${SV.poly([[MX(0), MY(0)], [MX(80), MY(0)], [MX(80), MY(10)], [MX(0), MY(2)]], "f1")}${SV.poly([[MX(0), MY(2)], [MX(80), MY(10)], [MX(0), MY(10)]], "f3")}
  ${SV.line(MX(0), MY(18), MX(180), MY(0), "c1")}${SV.text(MX(180) - 4, MY(0) - 6, "Demand", "lbl bd t1", { "text-anchor": "end" })}
  ${SV.line(MX(0), MY(2), MX(160), MY(18), "c2")}${SV.text(MX(160) + 6, MY(18) + 4, "Supply", "lbl bd t2")}
  ${SV.line(MX(0), MY(10), MX(80), MY(10), "gr")}${SV.line(MX(80), MY(10), MX(80), MY(0), "gr")}${SV.circle(MX(80), MY(10), 6, "dot3")}
  ${SV.text(MX(0) - 6, MY(10) + 4, "wage", "sm", { "text-anchor": "end" })}
  ${SV.text(MX(40), MY(1.1), "TRANSFER EARNINGS (under supply)", "lbl bd t1", { "text-anchor": "middle" })}
  ${SV.text(MX(12), MY(8) + 4, "ECONOMIC RENT", "lbl bd t3")}${SV.text(MX(12), MY(8) + 22, "(above supply, below wage)", "sm")}
  </svg>`;

/* ---------- Watch 1: build the diagram ---------- */
function buildChart(s) {
  let o = axes();
  if (s.tr > 0) o += SV.poly([[MX(0), MY(0)], [MX(80), MY(0)], [MX(80), MY(10)], [MX(0), MY(2)]], "f1", op(s.tr));
  if (s.rt > 0) o += SV.poly([[MX(0), MY(2)], [MX(80), MY(10)], [MX(0), MY(10)]], "f3", op(s.rt));
  if (s.d > 0) o += SV.line(MX(0), MY(18), MX(180), MY(0), "c1", op(s.d)) + SV.text(MX(180) - 4, MY(0) - 6, "Demand", "lbl bd t1", { "text-anchor": "end", ...op(s.d) });
  if (s.s > 0) o += SV.line(MX(0), MY(2), MX(160), MY(18), "c2", op(s.s)) + SV.text(MX(158), MY(18) - 12, "Supply = smallest pay each worker needs", "lbl bd t2", { "text-anchor": "end", ...op(s.s) });
  if (s.e > 0) o += SV.line(MX(0), MY(10), MX(80), MY(10), "gr", op(s.e)) + SV.line(MX(80), MY(10), MX(80), MY(0), "gr", op(s.e)) + SV.circle(MX(80), MY(10), 6, "dot3", op(s.e)) + SV.text(MX(0) - 6, MY(10) + 4, "10", "lbl bd", { "text-anchor": "end", ...op(s.e) }) + SV.text(MX(80), MY(0) + 20, "80", "lbl bd", { "text-anchor": "middle", ...op(s.e) });
  if (s.tr > 0.5) o += SV.text(MX(40), MY(1.1), "Transfer earnings = 480", "lbl bd t1", { "text-anchor": "middle", ...op(s.tr) });
  if (s.rt > 0.5) o += SV.text(MX(26), MY(8.8), "Economic rent = 320", "lbl bd t3", op(s.rt));
  if (s.w > 0) o += SV.line(MX(20), MY(4), MX(20), MY(10), "c4", { "stroke-width": 5, ...op(s.w) }) + SV.text(MX(24), MY(3), "worker 20 needs $4 but gets $10: rent $6", "lbl bd t4", op(s.w));
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 380, label: "Building the labour market diagram for economic rent and transfer earnings", base: { s: 0, d: 0, e: 0, tr: 0, rt: 0, w: 0 }, draw: buildChart, tween: 900, dwell: 5200, steps: [
  { cap: "The <b>supply curve</b> shows the <b>smallest pay each worker will accept</b>. The first worker needs only $2. To find more workers, the firm must offer more. Worker 80 needs $10.", s: { s: 1 } },
  { cap: "The <b>demand curve</b> shows how many workers firms want at each wage.", s: { s: 1, d: 1 } },
  { cap: "Demand meets supply at <b>$10</b> and <b>80 workers</b>. This is the wage. The firm pays <b>every</b> worker $10.", s: { s: 1, d: 1, e: 1 } },
  { cap: "<b>Transfer earnings.</b> The area <b>under the supply curve</b> is the smallest pay of all 80 workers added up: <b>480</b>. This is the pay the workers need to stay.", s: { s: 1, d: 1, e: 1, tr: 1 } },
  { cap: "<b>Economic rent.</b> Total pay is 10 × 80 = <b>800</b>. The part above the supply curve, 800 − 480 = <b>320</b>, is extra. The workers would work without it. This triangle is the economic rent.", s: { s: 1, d: 1, e: 1, tr: 1, rt: 1 } },
  { cap: "<b>One worker.</b> Take worker 20. Their smallest pay is $4 (the supply curve) but the wage is $10. So <b>$6 of their pay is economic rent</b>. Only the last worker, number 80, gets no rent.", s: { s: 1, d: 1, e: 1, tr: 1, rt: 1, w: 1 } },
] });

/* ---------- Watch 2: elastic or inelastic supply ---------- */
function elastChart(s) {
  const g = geom(s.m);
  let o = axes() + market(s.m, MX, MY, { labels: false });
  const pct = Math.round((g.rent / g.pay) * 100);
  o += SV.text(MX(0) - 6, MY(10) + 4, "10", "lbl bd", { "text-anchor": "end" }) + SV.text(MX(80), MY(0) + 20, "80", "lbl bd", { "text-anchor": "middle" });
  o += SV.text(MX(112), MY(24) + 4, "Transfer earnings: " + Lib.fmtN(g.transfer, 0) + " (" + (100 - pct) + "%)", "lbl bd t1");
  o += SV.text(MX(112), MY(24) + 24, "Economic rent: " + Lib.fmtN(g.rent, 0) + " (" + pct + "%)", "lbl bd t3");
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 380, label: "Supply curves of different steepness and the split of pay between transfer earnings and economic rent", base: { m: 0.02 }, draw: elastChart, tween: 1400, dwell: 5200, steps: [
  { cap: "<b>Street cleaner.</b> It is easy to find more cleaners, so supply is almost flat (<b>elastic</b>). Nearly all of the pay is <b>transfer earnings</b>. A rise in demand would hardly raise the wage.", s: { m: 0.02 } },
  { cap: "Make the job a little harder to fill, for example with some training. The supply curve gets <b>steeper</b>. The green area, economic rent, grows.", s: { m: 0.15 } },
  { cap: "<b>Famous tennis player.</b> Very few people have the talent, so supply is steep (<b>inelastic</b>). Even at a low wage almost no one would leave. Most of the pay is <b>economic rent</b>.", s: { m: 1.5 } },
  { cap: "At the limit supply is <b>vertical</b> (perfectly inelastic). The number of workers cannot change, so <b>all</b> the pay is economic rent.", s: { m: 60 } },
] });

/* ---------- Lab 1: eight workers ---------- */
const MINS = [6, 7, 8, 9, 10, 11, 12, 14], NAMES = ["Ana", "Ben", "Chi", "Dev", "Eli", "Fay", "Gus", "Hui"];
function lab1() {
  if (!$("#la1")) return;
  const w = +$("#la1").value, hired = MINS.map((m) => m <= w), n = hired.filter(Boolean).length;
  const tr = MINS.filter((m) => m <= w).reduce((a, b) => a + b, 0), pay = n * w, rent = pay - tr;
  $("#r1").textContent = n; $("#r2").textContent = "$" + pay; $("#r3").textContent = "$" + tr; $("#r4").textContent = "$" + rent;
  $("#rv").textContent = n === 0 ? "The wage is below everyone's smallest pay, so nobody takes the job." : `At a wage of $${w}, ${n} worker${n > 1 ? "s are" : " is"} hired. Total pay $${pay} = transfer earnings $${tr} + economic rent $${rent}.${rent === 0 ? " Everyone hired gets exactly the smallest pay they need, so no rent." : " The last worker hired gets less extra than the first."}`;
  const Yc = (v) => 235 - v * 13, bw = 36, gap = 8;
  let o = SV.line(40, 235, 410, 235) + SV.line(40, 235, 40, 20) + SV.text(44, 16, "Pay ($)", "sm");
  MINS.forEach((m, i) => {
    const x = 50 + i * (bw + gap);
    if (hired[i]) {
      o += SV.rect(x, Yc(m), bw, 235 - Yc(m), "f1") + SV.rect(x, Yc(w), bw, Yc(m) - Yc(w), "f3");
      o += SV.text(x + bw / 2, Yc(m) + 16, m, "sm bd t1", { "text-anchor": "middle" });
      if (w > m) o += SV.text(x + bw / 2, Yc(w) + 14, "+" + (w - m), "sm bd t3", { "text-anchor": "middle" });
    } else o += SV.rect(x, Yc(m), bw, 235 - Yc(m), "f2", { opacity: 0.12 }) + SV.text(x + bw / 2, Yc(m) - 5, m, "sm", { "text-anchor": "middle" });
    o += SV.text(x + bw / 2, 253, NAMES[i], "sm", { "text-anchor": "middle" });
  });
  o += SV.line(40, Yc(w), 410, Yc(w), "c4 dash") + SV.text(406, Yc(w) - 6, "Wage $" + w, "lbl bd t4", { "text-anchor": "end", style: "paint-order:stroke;stroke:var(--surface);stroke-width:4px" });
  o += SV.text(210, 268, "Blue: smallest pay needed.  Green: extra pay (rent).  Grey: not hired.", "sm", { "text-anchor": "middle" });
  $("#labA").innerHTML = o;
}
Lib.slider($("#g1"), { id: "la1", label: "Market wage ($): ", min: 4, max: 16, step: 1, value: 10, fmt: (v) => v, onInput: lab1 });

/* ---------- Lab 2: steepness ---------- */
const MS = [0, 0.02, 0.05, 0.1, 0.15, 0.25, 0.5, 1, 2.5, 60];
function lab2() {
  if (!$("#lb1")) return;
  const k = +$("#lb1").value, m = MS[k - 1], g = geom(m), pct = Math.round((g.rent / g.pay) * 100);
  $("#s1").textContent = Lib.fmtN(g.transfer, 0); $("#s2").textContent = Lib.fmtN(g.rent, 0); $("#s3").textContent = pct + "%";
  $("#sv").textContent = k <= 2 ? "Supply is flat: it is easy to find more workers like these. Almost all of the pay is transfer earnings (like street cleaners)."
    : k <= 6 ? "Supply is getting steeper. The workers are harder to replace, so more of the pay is economic rent."
    : k < 10 ? "Supply is steep: very few people can do this job. Most of the pay is economic rent (like a famous sports player)."
    : "Supply is vertical (perfectly inelastic). All of the pay is economic rent.";
  const X = (L) => 50 + L * 1.75, Y = (w) => 270 - w * 14;
  $("#labB").innerHTML = SV.line(50, 270, 410, 270) + SV.line(50, 270, 50, 20) + SV.text(406, 292, "Workers", "sm", { "text-anchor": "end" }) + SV.text(56, 24, "Wage", "sm") + market(m, X, Y, { labels: false }) +
    SV.text(X(0) - 6, Y(10) + 4, "10", "sm bd", { "text-anchor": "end" });
}
Lib.slider($("#g2"), { id: "lb1", label: "How hard is it to find more workers like this? (1 = very easy, 10 = impossible): ", min: 1, max: 10, step: 1, value: 3, fmt: (v) => v, onInput: lab2 });

/* ---------- Lab 3: your own example ---------- */
function lab3() {
  if (!$("#lc1") || !$("#lc2")) return;
  const e = +$("#lc1").value, nb = +$("#lc2").value, tr = Math.min(e, nb), rent = e - tr;
  $("#t1").textContent = "$" + tr + "k"; $("#t2").textContent = "$" + rent + "k";
  $("#tv").textContent = nb > e ? `The next best job pays more ($${nb}k) than this job ($${e}k). The person would move, so this is not a stable job for them. Try a smaller next best pay.`
    : `$${e}k − $${nb}k = $${rent}k is economic rent. That is ${Math.round((rent / e) * 100)}% of the pay.`;
  const W = 340, f = tr / e;
  $("#labC").innerHTML = SV.text(40, 40, "Earnings now: $" + e + "k", "lbl bd") + SV.rect(40, 60, W * f, 50, "f1") + SV.rect(40 + W * f, 60, W * (1 - f), 50, "f3") + SV.rect(40, 60, W, 50, "ax", { fill: "none" }) +
    SV.text(40 + (W * f) / 2, 92, f > 0.15 ? "Transfer" : "", "lbl bd t1", { "text-anchor": "middle" }) + SV.text(40 + W * f + (W * (1 - f)) / 2, 92, 1 - f > 0.15 ? "Rent" : "", "lbl bd t3", { "text-anchor": "middle" }) +
    SV.text(40, 140, "Transfer earnings = pay in the next best job = $" + tr + "k", "sm") + SV.text(40, 160, "Economic rent = earnings now − transfer earnings = $" + rent + "k", "sm");
}
Lib.slider($("#g3"), { id: "lc1", label: "Earnings now ($ thousand a year): ", min: 10, max: 500, step: 5, value: 120, fmt: (v) => v, onInput: lab3 });
Lib.slider($("#g4"), { id: "lc2", label: "Pay in the next best job ($ thousand): ", min: 5, max: 400, step: 5, value: 40, fmt: (v) => v, onInput: lab3 });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Put each item in the right bucket.",
  buckets: [{ label: "Transfer earnings" }, { label: "Economic rent" }, { label: "Neither" }],
  items: [
    { text: "The $40,000 a footballer could earn in the next best job", b: 0 }, { text: "The other $1,960,000 of his $2 million pay", b: 1 },
    { text: "The smallest pay a street cleaner needs to stay in the job", b: 0 }, { text: "A cleaner's pay above that smallest pay", b: 1 },
    { text: "Normal profit for an entrepreneur", b: 0 }, { text: "Supernormal profit", b: 1 },
    { text: "Unemployment benefit paid by the government", b: 2 }, { text: "Rent a family pays for a flat", b: 2 },
  ], done: "Transfer payments (benefits) and house rent are different ideas.",
});
Lib.match($("#m1"), { prompt: "Match each word to its meaning.", pairs: [
  ["Transfer earnings", "The smallest pay that keeps a worker in the job"],
  ["Economic rent", "Pay above what is needed to keep a worker in the job"],
  ["Elastic supply", "It is easy to find more workers, so the supply curve is flat"],
  ["Inelastic supply", "It is hard to find more workers, so the supply curve is steep"],
  ["Transfer payment", "Money from the government, such as unemployment benefit"],
  ["Normal profit", "The transfer earnings of an entrepreneur"],
  ["Next best job", "The job a worker would do if they left, and the pay in it"],
], done: "Good. These seven words are enough for most exam answers." });
Lib.order($("#o1"), { prompt: "Put the steps of the explanation in the best order.", items: [
  "Define transfer earnings: the minimum pay needed to keep a worker in the job",
  "Define economic rent: any pay above transfer earnings",
  "Draw the diagram: supply, demand, the wage and the number of workers",
  "Show transfer earnings under the supply curve and economic rent above it",
  "Say how elasticity of supply changes the split (steep = more rent)",
  "Give an example and an evaluation point, then a short conclusion",
], done: "This is the structure of a full-mark answer." });
Lib.calc($("#c1"), { qs: [
  { q: "A model earns $500,000. The next best job pays $100,000. What is the economic rent ($)?", a: 400000, sol: "500,000 − 100,000 = <b>$400,000</b>." },
  { q: "A teacher earns $30,000 and would stay for $25,000. What is the economic rent ($)?", a: 5000, sol: "30,000 − 25,000 = <b>$5,000</b>." },
  { q: "Five workers need $6, $7, $8, $9 and $10. The wage is $10. What is the total economic rent ($)?", a: 10, hint: "Rent for each worker = wage − smallest pay. Add them.", sol: "4 + 3 + 2 + 1 + 0 = <b>$10</b>." },
  { q: "The wage rises to $12 and two more workers (needing $11 and $12) join the five above. What is the total economic rent now ($)?", a: 21, sol: "Rent: 6 + 5 + 4 + 3 + 2 + 1 + 0 = <b>$21</b>. A higher wage raises the rent." },
  { q: "A worker earns $200,000. The next best job pays $50,000. What percentage of the pay is economic rent?", a: 75, sol: "Rent = 150,000. 150,000 ÷ 200,000 × 100 = <b>75%</b>." },
  { q: "Total pay is $800 and transfer earnings are $480. What is the economic rent ($)?", a: 320, sol: "800 − 480 = <b>$320</b>." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "Which is the best definition of transfer earnings?", opts: ["Money from the government to poor families", "The smallest pay that keeps a worker in their present job", "Any pay above what a worker needs", "The pay in a worker's dream job"], a: 1, why: "If the pay is less than this, the worker transfers to another job. Option A is a transfer payment, a different idea." },
  { q: "Which statement about economic rent is correct?", opts: ["It is the money paid for a house", "It is only earned by rich people", "It is pay above transfer earnings", "It is the pay of a worker in their first year"], a: 2, why: "Economic rent is the extra pay above what is needed. A teacher can earn rent too." },
  { q: "On a labour market diagram, transfer earnings are the area:", opts: ["above the supply curve and below the wage", "under the supply curve up to the number of workers hired", "under the demand curve", "above the demand curve"], a: 1, why: "Under the supply curve is the smallest pay of all the workers added together." },
  { q: "A top singer's supply of labour is perfectly inelastic. Compared with a street cleaner, the singer's pay is:", opts: ["all transfer earnings", "mostly transfer earnings", "mostly or all economic rent", "zero"], a: 2, why: "A vertical supply curve means nobody will leave the job when pay falls, so all pay is rent." },
  { q: "In the long run, the supply of skilled workers becomes more elastic. What is likely to happen to economic rent?", opts: ["It rises", "It falls and some becomes transfer earnings", "It stays the same", "It becomes zero for all workers"], a: 1, why: "A flatter supply curve means less area above it. Rent in the short run turns into transfer earnings." },
  { q: "A government sets a minimum wage above the equilibrium wage. For workers who keep their jobs, economic rent:", opts: ["falls", "stays the same", "rises", "becomes transfer earnings"], a: 2, why: "Their wage rises but their smallest pay stays the same, so the gap, the rent, gets bigger." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Transfer earnings", "The smallest payment needed to keep a worker in their present job. Under the supply curve."],
  ["Economic rent", "Payment above transfer earnings. Above the supply curve and below the wage."],
  ["Supply curve (labour)", "Shows the smallest pay each worker will accept."],
  ["Elasticity of supply of labour", "How easy it is to find more workers when the wage rises."],
  ["Elastic supply", "Flat supply curve. Most pay is transfer earnings."],
  ["Inelastic supply", "Steep supply curve. Most pay is economic rent."],
  ["Perfectly inelastic supply", "Vertical supply curve. All pay is economic rent."],
  ["Perfectly elastic supply", "Horizontal supply curve. All pay is transfer earnings."],
  ["Next best job", "The job a worker would do if they left. Its pay is their transfer earnings."],
  ["Normal profit", "The transfer earnings of enterprise. The smallest profit to keep the entrepreneur in business."],
  ["Supernormal profit", "Profit above normal profit. This is economic rent for enterprise."],
  ["Transfer payment", "Money from the government (such as a benefit). NOT the same as transfer earnings."],
] });

/* ---------- Past paper MCQ (text) ---------- */
Lib.quiz($("#qz2"), { qs: [
  { q: "[May/June 2021 · 31 and 33 · Q16] What is meant by economic rent?", opts: ["any amount above the minimum earnings required to keep labour in its current job", "the marginal physical product of labour multiplied by marginal revenue", "the minimum amount required to keep labour in its current job", "the regular payment to a property owner in exchange for the use of a building"], a: 0, why: "B is MRP. C is transfer earnings. D is ordinary rent for a building, the common trap." },
  { q: "[May/June 2022 · 31 and 33 · Q16] What is a definition of transfer earnings?", opts: ["the amount of earnings above that needed to keep a worker in their current job", "the minimum earnings needed to keep a worker in their current job", "the social security benefits paid to workers whose earnings are below the poverty line", "the amount of earnings needed to cause a worker to change to a different job"], a: 1, why: "A is economic rent. C is transfer payments (benefits). D is a different idea." },
  { q: "[Oct/Nov 2021 · 33 · Q15] What is defined as 'the payment made to a factor of production over and above that necessary to keep the factor in its present use'?", opts: ["economic rent", "normal profit", "opportunity cost", "transfer earnings"], a: 0, why: "'Over and above' is the key phrase for economic rent." },
  { q: "[May/June 2022 · 32 · Q16] What represents the transfer earnings of the factor enterprise?", opts: ["excess profit", "normal profit", "return on capital", "start-up costs"], a: 1, why: "Normal profit is the smallest profit that keeps the entrepreneur in business. Excess (supernormal) profit is the rent." },
  { q: "[Oct/Nov 2021 · 32 · Q16] What happens to economic rent and transfer earnings if the supply of labour becomes perfectly inelastic?", opts: ["economic rent decreases; transfer earnings increase", "economic rent decreases; transfer earnings stay the same", "economic rent increases; transfer earnings decrease", "economic rent stays the same; transfer earnings decrease"], a: 2, why: "A vertical supply curve has nothing under it, so transfer earnings fall to zero and all pay is rent." },
  { q: "[Oct/Nov 2022 · 33 · Q16] A fashion model is paid $500,000 a year. The next best paid job he could get is as a teacher at $100,000. What are his transfer earnings and economic rent?", opts: ["transfer zero; rent $400,000", "transfer $100,000; rent $400,000", "transfer $400,000; rent zero", "transfer $400,000; rent $100,000"], a: 1, why: "Transfer earnings = pay in the next best job = $100,000. Rent = 500,000 − 100,000 = $400,000." },
  { q: "[Feb/March 2025 · 32 · Q14] A teacher earns $30,000. She would stay for at least $25,000. Her next best job, accountant, pays $40,000, but she prefers to teach. Which is correct?", opts: ["Her economic rent as a teacher is $5,000.", "Her economic rent as an accountant is $10,000.", "Her transfer earnings as a teacher are $30,000.", "Her transfer earnings as an accountant are $15,000."], a: 0, why: "Transfer earnings as a teacher = $25,000 (the smallest pay to stay), so rent = 30,000 − 25,000 = $5,000. The $40,000 job is one she does not want, so it is not her transfer earnings." },
  { q: "[June 2026 · 32 · Q8] What is economic rent?", opts: ["The amount paid above the lowest wage that is needed to keep a worker in employment.", "The difference in pay between workers with comparable skills in different industries.", "The difference in pay between workers with different skills.", "The lowest wage that is needed to keep a worker in employment."], a: 0, why: "D is transfer earnings. B and C describe wage differentials, not rent." },
  { q: "[Oct/Nov 2020 · 31 · Q17] A trade union negotiates a wage OW for its members. Employment is OQ. What do the union members maximise in this situation?", opts: ["their economic rent", "their leisure hours", "their level of employment", "their total amount paid in wages"], a: 3, why: "The wage bill is OW × OQ, the rectangle under the wage up to OQ. Rent is only part of it, and it is not what the union is shown maximising." },
  { q: "[June 2026 · 31 and 33 · Q10] What is the most likely effect of a change from a competitive labour market to a monopsony?", opts: ["decrease in trade union membership", "higher wage rates offered", "increased economic rent", "less labour employed"], a: 3, why: "A monopsony hires where MCL = MRP, which is less than the competitive quantity, and pays a lower wage. Lower wages mean less rent, so C is wrong." },
] });

/* ---------- redrawn diagrams for the diagram questions ---------- */
function dg(id, inner, label) {
  $("#" + id).innerHTML = `<svg viewBox="0 0 280 215" class="mq" role="img" aria-label="${label}">${SV.line(40, 190, 265, 190)}${SV.line(40, 190, 40, 12)}${inner}</svg>`;
}
const T = (x, y, t, c = "sm bd", o) => SV.text(x, y, t, c, { "text-anchor": "middle", ...(o || {}) });
// 1 · May/June 2024 · 32 · Q15
dg("d1", SV.poly([[40, 140], [150, 85], [40, 85]], "f3") + SV.poly([[40, 140], [150, 85], [150, 190], [40, 190]], "f1") +
  SV.line(40, 140, 240, 40, "c2") + SV.line(40, 30, 240, 130, "c1") + SV.line(40, 85, 150, 85, "gr") + SV.line(150, 85, 150, 190, "gr") +
  T(28, 33, "F", "sm bd") + T(28, 88, "K", "sm bd") + T(28, 143, "J", "sm bd") + T(160, 80, "G", "sm bd") + T(150, 205, "H", "sm bd") + T(28, 200, "O", "sm bd") +
  SV.text(240, 36, "supply", "sm t2", { "text-anchor": "end" }) + SV.text(240, 146, "demand", "sm t1", { "text-anchor": "end" }), "Labour market for farm workers with areas G F K J H O");
// 2 · May/June 2025 · three panels
(function () {
  let s = "";
  [0, 95, 190].forEach((ox, i) => {
    const x = (v) => ox + v, ax = SV.line(x(15), 110, x(92), 110) + SV.line(x(15), 110, x(15), 10);
    s += ax + SV.line(x(15), 15, x(90), 100, "c1");
    if (i === 0) s += SV.poly([[x(15), 60], [x(55), 60], [x(15), 95]], "f3") + SV.poly([[x(15), 95], [x(55), 60], [x(55), 110], [x(15), 110]], "f1") + SV.line(x(15), 95, x(90), 29, "c2") + T(x(30), 72, "1", "lbl bd") + T(x(38), 96, "2", "lbl bd");
    if (i === 1) s += SV.poly([[x(15), 60], [x(55), 60], [x(55), 110], [x(15), 110]], "f1") + SV.line(x(15), 60, x(92), 60, "c2") + T(x(35), 90, "3", "lbl bd");
    if (i === 2) s += SV.poly([[x(15), 60], [x(55), 60], [x(55), 110], [x(15), 110]], "f3") + SV.line(x(55), 110, x(55), 10, "c2") + T(x(35), 90, "4", "lbl bd");
    s += SV.line(x(15), 60, x(55), 60, "gr") + SV.line(x(55), 60, x(55), 110, "gr");
  });
  $("#d2").innerHTML = `<svg viewBox="0 0 290 130" class="mq" role="img" aria-label="Three labour markets with areas numbered 1 to 4">${s}</svg>`;
})();
// 3 · Oct/Nov 2023 · 31 · Q12
dg("d3", SV.poly([[50, 60], [130, 60], [130, 100], [50, 100]], "f3") + SV.poly([[50, 100], [130, 100], [130, 118], [50, 150]], "f1") + SV.poly([[130, 100], [170, 100], [130, 118]], "f2") +
  SV.line(50, 150, 130, 118, "c2") + SV.line(130, 118, 170, 100, "c2") + SV.line(170, 100, 240, 70, "c2") + SV.line(90, 20, 240, 170, "c1") +
  SV.line(50, 60, 130, 60, "gr") + SV.line(50, 100, 170, 100, "gr") + SV.line(130, 60, 130, 190, "gr") + SV.line(170, 100, 170, 190, "gr") +
  T(36, 64, "W₁", "sm bd") + T(36, 104, "Wₑ", "sm bd") + T(130, 205, "N₂", "sm bd") + T(170, 205, "N₁", "sm bd") + T(90, 84, "X", "lbl bd") + T(92, 116, "Y", "lbl bd") + T(140, 109, "Z", "sm bd") +
  SV.text(240, 62, "S", "sm bd t2", { "text-anchor": "end" }) + SV.text(240, 164, "D", "sm bd t1", { "text-anchor": "end" }), "Labour market with minimum wage W1 and areas X, Y and Z");
// 4 · Oct/Nov 2023 · 33 · Q11
dg("d4", SV.poly([[50, 100], [170, 100], [50, 150]], "f3") + SV.poly([[50, 150], [170, 100], [110, 190], [50, 190]], "f4") + SV.poly([[110, 190], [170, 100], [170, 190]], "f1") +
  SV.line(50, 150, 240, 70, "c2") + SV.line(110, 190, 200, 55, "c4") + SV.line(70, 20, 230, 150, "c1") + SV.line(50, 100, 170, 100, "gr") + SV.line(170, 100, 170, 190, "gr") +
  T(90, 116, "X", "lbl bd") + T(78, 168, "Y", "lbl bd") + T(150, 172, "Z", "lbl bd") + SV.text(240, 66, "long run", "sm t2", { "text-anchor": "end" }) + SV.text(204, 52, "short run", "sm t4"), "Short run and long run supply curves with areas X, Y and Z");
// 5 · Oct/Nov 2024 · 33 · Q14
dg("d5", SV.line(50, 170, 240, 59, "c2") + SV.line(50, 108, 240, 95, "c4") + SV.line(70, 20, 230, 150, "c1") + SV.line(40, 100, 170, 100, "gr") + SV.line(170, 100, 170, 190, "gr") +
  T(26, 104, "W", "sm bd") + T(170, 205, "N", "sm bd") + SV.text(244, 56, "S₁", "sm bd t2") + SV.text(244, 94, "S₂", "sm bd t4") + SV.text(232, 156, "D", "sm bd t1"), "Supply of labour changing from steep S1 to flatter S2");
// 6 · June 2026 · 34 · Q11
dg("d6", SV.poly([[40, 190], [120, 190], [120, 124]], "f1") + SV.poly([[40, 95], [120, 95], [120, 124], [40, 190]], "f3") + SV.poly([[40, 55], [120, 55], [120, 95], [40, 95]], "f3") +
  SV.line(40, 190, 203, 55, "c2") + SV.line(90, 21, 200, 146, "c1") + SV.line(40, 95, 155, 95, "gr") + SV.line(40, 55, 203, 55, "gr") + SV.line(120, 55, 120, 190, "gr") + SV.line(155, 95, 155, 190, "gr") + SV.line(203, 55, 203, 190, "gr") +
  T(26, 59, "W_T", "sm bd") + T(26, 99, "W₁", "sm bd") + T(120, 205, "N₂", "sm bd") + T(155, 205, "N₁", "sm bd") + T(203, 205, "N₃", "sm bd") + T(85, 178, "T", "lbl bd") + T(72, 118, "V", "lbl bd") + T(78, 80, "X", "lbl bd") +
  SV.text(210, 52, "S", "sm bd t2") + SV.text(204, 148, "D", "sm bd t1"), "Competitive labour market with a union wage WT and areas T, V and X");
