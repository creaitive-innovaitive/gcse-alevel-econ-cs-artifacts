/* ---------- shared chart helpers ---------- */
/* Steppers: L (thousand workers) 0-200 on x, wage ($ per hour) 0-28 on y */
const SX = (L) => 80 + L * 3.1, SY = (w) => 330 - w * 10.5;
function sAxes(extra) {
  return SV.line(80, 330, 710, 330) + SV.line(80, 330, 80, 30) + SV.text(710, 368, "Quantity of labour (thousand workers)", "sm", { "text-anchor": "end" }) + SV.text(86, 34, "Wage ($ per hour)", "sm") + (extra || "");
}
function sLine(a, b, L0, L1, cls, o) { return SV.line(SX(L0), SY(a + b * L0), SX(L1), SY(a + b * L1), cls, o); }
const op = (v) => ({ opacity: Math.max(0, Math.min(1, v)) });

/* ---------- 1 · hiring where MRP = wage ---------- */
function hireChart(s) {
  const w = 10, a = s.a, Lend = Math.min(200, a * 10), hire = (a - w) * 10;
  let o = sAxes();
  if (s.old > 0) o += sLine(20, -0.1, 0, 200, "c1 dash", op(s.old * 0.5)) + SV.text(SX(150), SY(5) - 6, "old MRP", "sm", op(s.old));
  o += sLine(a, -0.1, 0, Lend, "c1") + SV.text(SX(12), SY(a - 1.2) - 12, "MRP = demand for labour", "lbl bd t1");
  if (s.wl > 0) o += SV.line(SX(0), SY(w), SX(200), SY(w), "c2", op(s.wl)) + SV.text(SX(200) - 4, SY(w) - 8, "Wage $10 (supply to the firm)", "lbl bd t2", { "text-anchor": "end", ...op(s.wl) });
  if (s.pt > 0) {
    o += SV.line(SX(hire), SY(w), SX(hire), SY(0), "gr", op(s.pt)) + SV.circle(SX(hire), SY(w), 7, "dot3", op(s.pt));
    o += SV.text(SX(hire), SY(0) + 20, Lib.fmtN(hire, 0), "lbl bd t3", { "text-anchor": "middle", ...op(s.pt) });
    o += SV.text(SX(hire) + 12, SY(w) + 22, "MRP = wage: hire " + Lib.fmtN(hire, 0), "lbl bd t3", op(s.pt));
    if (s.zones > 0) {
      o += SV.text(SX(hire / 2), SY(w) + 40, "MRP > wage: hire", "sm", { "text-anchor": "middle", ...op(s.zones) });
      o += SV.text(SX(hire + (200 - hire) / 2) - 10, SY(w) - 40, "MRP < wage: stop", "sm", { "text-anchor": "middle", ...op(s.zones) });
    }
  }
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 370, label: "Marginal revenue product curve and the wage showing how many workers a firm hires", base: { a: 20, old: 0, wl: 0, pt: 0, zones: 0 }, draw: hireChart, tween: 1100, dwell: 5000, steps: [
  { cap: "The <b>marginal revenue product (MRP)</b> of labour is the extra revenue from one more worker. It slopes <b>downward</b> because of diminishing marginal returns: each extra worker adds less output. This curve is the firm's <b>demand for labour</b>.", s: {} },
  { cap: "The firm is one of many employers, so it takes the <b>market wage</b> of $10 an hour. The extra cost of each worker is the wage, shown as a horizontal line.", s: { wl: 1 } },
  { cap: "Profit is maximised where <b>MRP = wage</b>: 100 thousand workers. To the left each worker adds more to revenue than to cost, so hiring raises profit. To the right the next worker would cost more than they add.", s: { wl: 1, pt: 1, zones: 1 } },
  { cap: "Now the <b>price of the product rises</b>. MR rises, so MRP rises at every level of employment and the demand for labour <b>shifts right</b>. At the same $10 wage the firm now hires <b>140</b> thousand workers. This is why labour demand is a <b>derived demand</b>.", s: { a: 24, old: 1, wl: 1, pt: 1 } },
] });

/* ---------- 2 · minimum wage, competitive market ---------- */
function cmChart(s) {
  let o = sAxes();
  o += sLine(20, -0.1, 0, 200, "c1") + SV.text(SX(12), SY(18.8) - 12, "D = MRP", "lbl bd t1", op(s.d));
  if (s.s > 0) o += sLine(4, 0.1, 0, 200, "c2", op(s.s)) + SV.text(SX(200) - 4, SY(24) - 8, "S", "lbl bd t2", { "text-anchor": "end", ...op(s.s) });
  if (s.e > 0) {
    o += SV.line(SX(80), SY(12), SX(80), SY(0), "gr", op(s.e)) + SV.line(SX(0), SY(12), SX(80), SY(12), "gr", op(s.e)) + SV.circle(SX(80), SY(12), 7, "dot3", op(s.e));
    o += SV.text(SX(80), SY(0) + 20, "80", "lbl bd", { "text-anchor": "middle", ...op(s.e) }) + SV.text(SX(0) - 6, SY(12) + 4, "12", "lbl bd", { "text-anchor": "end", ...op(s.e) });
    o += SV.text(SX(80) + 12, SY(12) + 22, "Equilibrium", "lbl bd t3", op(s.e));
  }
  if (s.m > 0) {
    o += SV.line(SX(0), SY(14), SX(200), SY(14), "c4 dash", op(s.m)) + SV.text(SX(0) - 6, SY(14) + 4, "14", "lbl bd t4", { "text-anchor": "end", ...op(s.m) }) + SV.text(SX(200) - 4, SY(14) - 8, "Minimum wage $14", "lbl bd t4", { "text-anchor": "end", ...op(s.m) });
  }
  if (s.q > 0) {
    o += SV.circle(SX(60), SY(14), 6, "dot1", op(s.q)) + SV.circle(SX(100), SY(14), 6, "dot2", op(s.q));
    o += SV.line(SX(60), SY(14), SX(60), SY(0), "gr", op(s.q)) + SV.line(SX(100), SY(14), SX(100), SY(0), "gr", op(s.q));
    o += SV.text(SX(60), SY(0) + 20, "60", "lbl bd t1", { "text-anchor": "middle", ...op(s.q) }) + SV.text(SX(100), SY(0) + 20, "100", "lbl bd t2", { "text-anchor": "middle", ...op(s.q) });
    o += SV.text(SX(60) - 10, SY(14) - 24, "Demanded", "sm", { "text-anchor": "end", ...op(s.q) }) + SV.text(SX(100) + 10, SY(14) - 24, "Supplied", "sm", op(s.q));
  }
  if (s.u > 0) {
    o += SV.rect(SX(60), SY(14), SX(100) - SX(60), 14, "f2", op(s.u)) + SV.text((SX(60) + SX(100)) / 2, SY(14) + 62, "Unemployment 40", "lbl bd t2", { "text-anchor": "middle", ...op(s.u) });
  }
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 370, label: "Labour market diagram with a minimum wage above the equilibrium wage", base: { d: 0, s: 0, e: 0, m: 0, q: 0, u: 0 }, draw: cmChart, tween: 1000, dwell: 5000, steps: [
  { cap: "The <b>demand for labour</b> (MRP) slopes down: firms hire more when labour is cheaper.", s: { d: 1 } },
  { cap: "The <b>supply of labour</b> slopes up: a higher wage attracts more workers into this occupation.", s: { d: 1, s: 1 } },
  { cap: "In a competitive market the wage settles where demand equals supply: <b>$12 an hour and 80 thousand workers</b>.", s: { d: 1, s: 1, e: 1 } },
  { cap: "The government sets a <b>minimum wage of $14</b>, above equilibrium, so it is <b>binding</b>. Firms cannot legally pay less.", s: { d: 1, s: 1, e: 0.5, m: 1 } },
  { cap: "At $14 firms demand only <b>60</b> thousand workers (MRP falls below the wage for the others), but <b>100</b> thousand want to work. Employment falls from 80 to 60.", s: { d: 1, s: 1, e: 0.5, m: 1, q: 1 } },
  { cap: "The gap is <b>unemployment of 40 thousand</b>. Those with jobs gain $2 an hour; those who lose or cannot find jobs lose. The size of the job loss depends on how <b>elastic</b> the demand for labour is.", s: { d: 1, s: 1, e: 0.5, m: 1, q: 1, u: 1 } },
] });

/* ---------- 3 · monopsony ---------- */
function monoChart(s) {
  let o = sAxes();
  o += sLine(20, -0.1, 0, 200, "c1") + SV.text(SX(200) - 4, SY(0) - 8, "MRP", "lbl bd t1", { "text-anchor": "end" });
  o += sLine(2, 0.1, 0, 180, "c2") + SV.text(SX(180) + 4, SY(20) + 4, "ACL = S", "lbl bd t2");
  if (s.mcl > 0) o += sLine(2, 0.2, 0, 90, "c4", op(s.mcl)) + SV.text(SX(90) + 4, SY(20) + 4, "MCL", "lbl bd t4", op(s.mcl));
  if (s.mono > 0) {
    o += SV.line(SX(60), SY(14), SX(60), SY(0), "gr", op(s.mono)) + SV.line(SX(0), SY(8), SX(60), SY(8), "gr", op(s.mono)) + SV.line(SX(0), SY(14), SX(60), SY(14), "gr", op(s.mono));
    o += SV.circle(SX(60), SY(14), 6, "dot4", op(s.mono)) + SV.circle(SX(60), SY(8), 7, "dot2", op(s.mono));
    o += SV.text(SX(60), SY(0) + 20, "60", "lbl bd", { "text-anchor": "middle", ...op(s.mono) }) + SV.text(SX(0) - 6, SY(8) + 4, "8", "lbl bd t2", { "text-anchor": "end", ...op(s.mono) }) + SV.text(SX(0) - 6, SY(14) + 4, "14", "lbl bd t4", { "text-anchor": "end", ...op(s.mono) });
    o += SV.text(SX(60) + 10, SY(14) - 10, "MCL = MRP", "lbl bd t4", op(s.mono));
  }
  if (s.gap > 0) o += SV.rect(SX(0), SY(14), SX(60) - SX(0), SY(8) - SY(14), "f2", op(s.gap)) + SV.text(SX(30), SY(11) + 4, "wage below MRP", "lbl bd t2", { "text-anchor": "middle", ...op(s.gap) });
  if (s.comp > 0) {
    o += SV.circle(SX(90), SY(11), 7, "dot3", op(s.comp)) + SV.line(SX(90), SY(11), SX(90), SY(0), "gr", op(s.comp));
    o += SV.text(SX(90), SY(0) + 20, "90", "lbl bd t3", { "text-anchor": "middle", ...op(s.comp) }) + SV.text(SX(90) + 14, SY(11) - 14, "Competitive: 90, $11", "lbl bd t3", op(s.comp));
  }
  if (s.mw > 0) {
    o += SV.line(SX(0), SY(10), SX(80), SY(10), "c3 dash", op(s.mw)) + SV.text(SX(0) - 6, SY(10) + 4, "10", "lbl bd t3", { "text-anchor": "end", ...op(s.mw) });
    o += SV.circle(SX(80), SY(10), 7, "dot3", op(s.mw)) + SV.line(SX(80), SY(10), SX(80), SY(0), "gr", op(s.mw));
    o += SV.text(SX(80), SY(0) + 20, "80", "lbl bd t3", { "text-anchor": "middle", ...op(s.mw) }) + SV.text(SX(80) - 10, SY(10) + 44, "Minimum wage $10: 80", "lbl bd t3", { "text-anchor": "end", ...op(s.mw) }) + SV.text(0, 0, "", "lbl bd t3", op(s.mw));
  }
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 370, label: "Monopsony labour market diagram with marginal cost of labour and a minimum wage", base: { mcl: 0, mono: 0, gap: 0, comp: 0, mw: 0 }, draw: monoChart, tween: 1000, dwell: 5200, steps: [
  { cap: "The monopsonist's <b>MRP</b> is its demand for labour. As the only buyer it faces the whole market supply curve, which is the <b>average cost of labour (ACL)</b>: the wage it must pay at each level of employment.", s: {} },
  { cap: "To hire one more worker it must raise the wage, and it pays that higher wage to <b>all</b> its workers. So the <b>marginal cost of labour (MCL)</b> lies above the ACL and is steeper.", s: { mcl: 1 } },
  { cap: "It hires where <b>MCL = MRP</b>: <b>60</b> thousand workers. This is the profit-maximising quantity.", s: { mcl: 1, mono: 1 } },
  { cap: "The wage is read <b>down to the ACL (supply) curve</b>: just <b>$8</b>. Workers produce $14 of revenue at the margin but are paid $8: the wage is <b>below MRP</b>.", s: { mcl: 1, mono: 1, gap: 1 } },
  { cap: "In a competitive market ACL would meet MRP at <b>90 thousand workers and $11</b>. So the monopsony pays a <b>lower wage</b> and employs <b>fewer workers</b>.", s: { mcl: 1, mono: 1, gap: 1, comp: 1 } },
  { cap: "A <b>minimum wage of $10</b> (between $8 and $11): the firm cannot pay less, so its MCL is flat at $10 until supply runs out. It hires where MRP meets that, <b>80 thousand</b> workers. Wage <b>and</b> employment rise. Above $11 the minimum would start to cost jobs.", s: { mcl: 0.4, mono: 0.35, gap: 0, comp: 1, mw: 1 } },
] });

/* ---------- Lab 1: hire the next worker ---------- */
const HALO = "paint-order:stroke;stroke:var(--surface);stroke-width:4px";
const MPP = [20, 18, 15, 12, 9, 7, 5, 3];
function lab1() {
  if (!$("#la1") || !$("#la2")) return;
  const p = +$("#la1").value, w = +$("#la2").value, mrp = MPP.map((m) => m * p);
  let n = 0; while (n < mrp.length && mrp[n] >= w) n++;
  $("#r1").textContent = n; $("#r2").textContent = n ? "$" + Lib.fmtN(mrp[n - 1], 1) : "-"; $("#r3").textContent = n ? "$" + Lib.fmtN(mrp[n - 1] - w, 1) : "-";
  $("#rv").textContent = n === 0 ? `Even the first worker's MRP ($${Lib.fmtN(mrp[0], 1)}) is below the wage, so the firm hires nobody.`
    : n === MPP.length ? `Every worker's MRP is at least the wage, so the firm hires all ${n}. A lower product price or higher wage would stop it sooner.`
    : `The firm hires ${n} workers. Worker ${n + 1} would add only $${Lib.fmtN(mrp[n], 1)}, which is less than the $${w} wage, so hiring stops where MRP falls below the wage.`;
  const X0 = 40, bw = 36, gap = 8, Yc = (v) => 230 - v * (200 / 120);
  let o = SV.line(X0, 230, 410, 230) + SV.line(X0, 230, X0, 20) + SV.text(X0 + 4, 16, "MRP and wage ($ per day)", "sm");
  mrp.forEach((v, i) => {
    const x = X0 + 8 + i * (bw + gap), h = Math.min(v, 120);
    o += SV.rect(x, Yc(h), bw, 230 - Yc(h), i < n ? "f3" : "f2") + SV.text(x + bw / 2, Yc(h) - 5, Lib.fmtN(v, 0), "sm bd", { "text-anchor": "middle", style: HALO }) + SV.text(x + bw / 2, 248, i + 1, "sm", { "text-anchor": "middle" });
  });
  o += SV.text(X0 + 190, 266, "Worker number", "sm", { "text-anchor": "middle" });
  const wy = Yc(Math.min(w, 120));
  o += SV.line(X0, wy, 410, wy, "c2 dash") + SV.text(406, wy - 6, "Wage $" + w, "lbl bd t2", { "text-anchor": "end", style: HALO });
  $("#labA").innerHTML = o;
}
Lib.slider($("#g1"), { id: "la1", label: "Price of the product ($): ", min: 1, max: 6, step: 0.5, value: 2, fmt: (v) => v.toFixed(1), onInput: lab1 });
Lib.slider($("#g2"), { id: "la2", label: "Wage per day ($): ", min: 5, max: 100, step: 1, value: 20, fmt: (v) => v, onInput: lab1 });

/* ---------- Lab 2: competitive market + minimum wage ---------- */
let sl3, sl4, sl5;
function lab2() {
  if (!$("#lb1") || !$("#lb2") || !$("#lb3")) return;
  const a = 20 + +$("#lb1").value, b = 4 - +$("#lb2").value, mw = +$("#lb3").value;
  const Le = (a - b) / 0.2, We = a - 0.1 * Le;
  const bind = mw > We + 0.001, W = bind ? mw : We;
  const Ld = bind ? Math.max(0, (a - mw) * 10) : Le, Ls = bind ? Math.max(0, (mw - b) * 10) : Le, un = Ls - Ld;
  $("#s1").textContent = "$" + Lib.fmtN(W, 2); $("#s2").textContent = Lib.fmtN(Ld, 0) + "k"; $("#s3").textContent = Lib.fmtN(un, 0) + "k"; $("#s4").textContent = "$" + Lib.fmtN(W * Ld, 0) + "k/hr";
  $("#sv").textContent = mw === 0 ? `No minimum wage: the market clears at $${Lib.fmtN(We, 2)} and ${Lib.fmtN(Le, 0)} thousand workers.`
    : !bind ? `The minimum wage ($${mw}) is below the equilibrium wage ($${Lib.fmtN(We, 2)}), so it is not binding and changes nothing.`
    : `A binding minimum wage of $${mw}: ${Lib.fmtN(Le - Ld, 0)} thousand fewer jobs than at equilibrium, and ${Lib.fmtN(un, 0)} thousand people who want work cannot find it.`;
  const X = (L) => 50 + L * 1.75, Y = (w) => 260 - w * 8.2;
  let o = SV.line(50, 260, 410, 260) + SV.line(50, 260, 50, 20) + SV.text(406, 280, "Labour (thousand)", "sm", { "text-anchor": "end" }) + SV.text(56, 24, "Wage ($/hr)", "sm");
  const De = Math.min(200, a * 10);
  o += SV.line(X(0), Y(a), X(De), Y(a - 0.1 * De), "c1") + SV.text(X(De) - 4, Y(a - 0.1 * De) - 6, "D", "lbl bd t1", { "text-anchor": "end" });
  o += SV.line(X(0), Y(b), X(200), Y(b + 20), "c2") + SV.text(X(200) - 4, Y(b + 20) - 6, "S", "lbl bd t2", { "text-anchor": "end" });
  o += SV.circle(X(Le), Y(We), 5, "dot3", { opacity: bind ? 0.4 : 1 });
  if (mw > 0) {
    o += SV.line(X(0), Y(mw), X(200), Y(mw), "c4 dash");
    if (bind) {
      o += SV.rect(X(Ld), Y(mw), X(Ls) - X(Ld), 10, "f2") + SV.circle(X(Ld), Y(mw), 5, "dot1") + SV.circle(X(Ls), Y(mw), 5, "dot2");
      o += SV.line(X(Ld), Y(mw), X(Ld), 260, "gr") + SV.line(X(Ls), Y(mw), X(Ls), 260, "gr");
    }
  }
  $("#labB").innerHTML = o;
}
sl3 = Lib.slider($("#g3"), { id: "lb1", label: "Demand for labour (productivity / product price): ", min: -6, max: 8, step: 1, value: 0, fmt: (v) => (v > 0 ? "+" + v : v), onInput: lab2 });
sl4 = Lib.slider($("#g4"), { id: "lb2", label: "Supply of labour (more workers to the right): ", min: -4, max: 4, step: 1, value: 0, fmt: (v) => (v > 0 ? "+" + v : v), onInput: lab2 });
sl5 = Lib.slider($("#g5"), { id: "lb3", label: "Minimum wage ($ per hour, 0 = none): ", min: 0, max: 20, step: 0.5, value: 0, fmt: (v) => (v === 0 ? "none" : v.toFixed(1)), onInput: lab2 });
$("#pb1").onclick = () => sl3.set(4); $("#pb2").onclick = () => sl4.set(3); $("#pb3").onclick = () => { sl3.set(0); sl4.set(0); sl5.set(0); };

/* ---------- Lab 3: monopsony + minimum wage ---------- */
function lab3() {
  if (!$("#lc1")) return;
  const mw = +$("#lc1").value;
  let W, L, un = 0, note;
  if (mw <= 8) { W = 8; L = 60; note = `A minimum wage of $${mw.toFixed(1)} is below the monopsony wage of $8, so it has no effect.`; }
  else if (mw <= 11) { W = mw; L = (mw - 2) * 10; note = `Between the monopsony wage ($8) and the competitive wage ($11): the wage and employment both rise. The firm is forced to pay $${mw.toFixed(1)}, and it is still profitable to hire up to the point where supply runs out.`; }
  else { W = mw; L = (20 - mw) * 10; un = (mw - 2) * 10 - L; note = `Above the competitive wage ($11), MRP is below the minimum wage for the marginal worker, so employment falls and there is unemployment of ${Lib.fmtN(un, 0)} thousand. Beyond $11 the monopsony gain turns into a competitive-market loss.`; }
  const gap = 20 - 0.1 * L - W;
  $("#m1").textContent = "$" + Lib.fmtN(W, 2); $("#m2").textContent = Lib.fmtN(L, 0) + "k"; $("#m3").textContent = "$" + Lib.fmtN(Math.max(0, gap), 2); $("#m4").textContent = Lib.fmtN(un, 0) + "k";
  $("#mv").textContent = note;
  const X = (l) => 50 + l * 1.75, Y = (w) => 260 - w * 11.5;
  let o = SV.line(50, 260, 410, 260) + SV.line(50, 260, 50, 20) + SV.text(406, 280, "Labour (thousand)", "sm", { "text-anchor": "end" }) + SV.text(56, 24, "Wage ($/hr)", "sm");
  o += SV.line(X(0), Y(20), X(200), Y(0), "c1") + SV.text(X(200) - 2, Y(0) - 6, "MRP", "lbl bd t1", { "text-anchor": "end" });
  o += SV.line(X(0), Y(2), X(180), Y(20), "c2") + SV.text(X(180) + 3, Y(20) + 14, "S", "lbl bd t2");
  o += SV.line(X(0), Y(2), X(90), Y(20), "c4") + SV.text(X(90) + 4, Y(20) - 2, "MCL", "lbl bd t4");
  if (mw > 8) o += SV.line(X(0), Y(mw), X(Math.max(L, (mw - 2) * 10)), Y(mw), "c3 dash");
  if (gap > 0.05) o += SV.rect(X(L) - 4, Y(20 - 0.1 * L), 4, Y(W) - Y(20 - 0.1 * L), "f2");
  o += SV.line(X(L), Y(W), X(L), 260, "gr") + SV.circle(X(L), Y(W), 6, "dot3") + SV.circle(X(L), Y(20 - 0.1 * L), 4, "dot4");
  if (un > 0) o += SV.rect(X(L), Y(W), X((mw - 2) * 10) - X(L), 8, "f2");
  $("#labC").innerHTML = o;
}
Lib.slider($("#g6"), { id: "lc1", label: "Minimum wage ($ per hour): ", min: 4, max: 16, step: 0.5, value: 8, fmt: (v) => v.toFixed(1), onInput: lab3 });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Drag each event into the right bucket for the labour market it affects.",
  buckets: [{ label: "Shifts demand for labour" }, { label: "Shifts supply of labour" }, { label: "Movement along a curve" }],
  items: [
    { text: "Demand for the firm's product rises", b: 0 }, { text: "Training raises the productivity of workers", b: 0 },
    { text: "Machines used instead of workers become cheaper", b: 0 },
    { text: "Net migration into the economy rises", b: 1 }, { text: "The retirement age is raised", b: 1 },
    { text: "Wages in a rival occupation rise", b: 1 },
    { text: "The wage in this job rises and more people apply", b: 2 }, { text: "The wage rises and the firm hires fewer workers", b: 2 },
  ], done: "Wage changes move along; everything else shifts a curve.",
});
Lib.classify($("#cl2"), {
  prompt: "Which market structure does each statement describe?",
  buckets: [{ label: "Competitive labour market" }, { label: "Monopsony" }, { label: "Both" }],
  items: [
    { text: "The firm hires where wage = MRP", b: 0 }, { text: "The firm hires where MCL = MRP", b: 1 },
    { text: "The wage paid is below MRP", b: 1 }, { text: "MCL lies above the supply curve", b: 1 },
    { text: "The firm faces a horizontal supply of labour at the market wage", b: 0 },
    { text: "A minimum wage above equilibrium reduces employment", b: 0 }, { text: "A minimum wage in a range can raise employment", b: 1 },
    { text: "Demand for labour is derived from demand for the product", b: 2 }, { text: "MRP = MPP × MR", b: 2 },
  ], done: "Keep the two cases apart in an exam diagram.",
});
Lib.order($("#o1"), { prompt: "Order the steps for analysing a monopsony on a diagram.", items: [
  "Draw the MRP curve (demand for labour) and the ACL curve (supply of labour)",
  "Draw the MCL curve above and steeper than the ACL curve",
  "Find where MCL = MRP: this is the profit-maximising employment",
  "Read down from that point to the horizontal axis to find the quantity of labour",
  "Read up from that quantity to the ACL curve to find the wage",
  "Compare with the competitive outcome where ACL meets MRP: wage and employment are lower",
], done: "A reliable exam routine." });
Lib.calc($("#c1"), { qs: [
  { q: "A firm sells its product at $4 a unit. The 5th worker adds 7 units of output. Calculate the MRP of the 5th worker ($).", a: 28, sol: "MRP = MPP × MR = 7 × $4 = <b>$28</b>." },
  { q: "The wage is $24 a day and the next worker has an MRP of $30. By how much would employing this worker change profit ($)?", a: 6, sol: "Extra revenue $30 − extra cost $24 = <b>+$6</b>. The firm should hire." },
  { q: "A wage rise of 10% reduces the quantity of labour demanded by 15%. Calculate the wage elasticity of demand for labour (include the sign).", a: -1.5, tol: 0.01, ph: "e.g. -0.5", sol: "−15% ÷ 10% = <b>−1.5</b>: elastic." },
  { q: "A footballer earns $200,000 a year. The best alternative job would pay $30,000. Calculate the economic rent ($).", a: 170000, sol: "Economic rent = earnings − transfer earnings = 200,000 − 30,000 = <b>$170,000</b>." },
  { q: "Demand for labour: L = 200 − 10W. Supply of labour: L = 10W − 40 (L in thousands, W in $). A minimum wage of $14 is set. How many thousand workers are unemployed?", a: 40, hint: "Find L demanded and L supplied at W = 14.", sol: "Demand: 200 − 140 = 60. Supply: 140 − 40 = 100. Unemployment = 100 − 60 = <b>40 thousand</b>." },
  { q: "A monopsony has MRP = 20 − 0.1L and MCL = 2 + 0.2L (L in thousands). Find the profit-maximising employment (thousand).", a: 60, hint: "Set MCL = MRP and solve for L.", sol: "2 + 0.2L = 20 − 0.1L → 0.3L = 18 → L = <b>60</b>." },
  { q: "The supply curve (ACL) is W = 2 + 0.1L. At 60 thousand workers, what wage ($) does the monopsony pay?", a: 8, sol: "W = 2 + 0.1 × 60 = <b>$8</b>. MRP at 60 is $14, so the wage is $6 below MRP." },
] });
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Derived demand", "Demand that arises from the demand for the product the factor helps to make"],
  ["Marginal revenue product", "The extra revenue from employing one more worker"],
  ["Marginal cost of labour", "The extra cost of employing one more worker"],
  ["Transfer earnings", "The minimum payment needed to keep a worker in their current job"],
  ["Economic rent", "Earnings above transfer earnings"],
  ["Monopsony", "A market with a single buyer of labour"],
  ["Bilateral monopoly", "A single buyer of labour facing a single seller, such as a union"],
  ["Minimum wage", "A legal floor on the hourly wage"],
], done: "Strong vocabulary." });
Lib.quiz($("#qz1"), { qs: [
  { q: "Marginal revenue product is equal to:", opts: ["MPP × MR", "MPP × wage", "Total revenue ÷ workers", "MR ÷ MPP"], a: 0, why: "MRP is the extra output from one more worker multiplied by the revenue from each extra unit." },
  { q: "A profit-maximising firm in a competitive labour market hires until:", opts: ["Total revenue is maximised", "MRP equals the wage", "MPP is zero", "MRP is zero"], a: 1, why: "Each worker adds MRP to revenue and the wage to cost, so hiring stops where they are equal." },
  { q: "The demand for labour is more likely to be elastic when:", opts: ["Labour is a small share of costs", "Good substitutes for labour are available", "Demand for the product is inelastic", "The time period is short"], a: 1, why: "If machines or other inputs are easy to switch to, a wage rise leads to a larger fall in jobs." },
  { q: "For a monopsonist the MCL is above the supply curve because:", opts: ["Workers are more productive", "A higher wage to attract one more worker must be paid to all its workers", "Demand is falling", "Unions raise the wage"], a: 1, why: "Hiring one more worker raises the wage bill for everyone already employed." },
  { q: "Compared with a competitive market, a monopsony is likely to lead to:", opts: ["A higher wage and higher employment", "A lower wage and lower employment", "A lower wage and higher employment", "A higher wage and lower employment"], a: 1, why: "It hires where MCL = MRP, which is less than the competitive quantity, and pays the lower wage from the supply curve." },
  { q: "A minimum wage set above equilibrium in a competitive labour market is likely to cause:", opts: ["Excess demand for labour", "Unemployment", "Higher employment", "A fall in labour supply"], a: 1, why: "The quantity of labour supplied rises and the quantity demanded falls." },
  { q: "Which minimum wage could raise both the wage and employment?", opts: ["Below the monopsony wage", "Between the monopsony wage and the competitive wage", "Above the competitive wage", "Any minimum wage"], a: 1, why: "In that range the firm is forced to pay more but still wants to hire up to the point where supply runs out." },
  { q: "Economic rent is likely to be largest when the supply of a type of labour is:", opts: ["Perfectly elastic", "Elastic", "Inelastic", "Falling"], a: 2, why: "The scarcer the talent, the more of the pay is above what it would earn in the next best job." },
  { q: "Which would shift the demand for labour to the right?", opts: ["A fall in the price of the product", "A rise in labour productivity", "A rise in net migration", "A fall in the wage"], a: 1, why: "Higher productivity raises MPP and so MRP. Migration shifts supply; a lower wage is a movement along the curve." },
  { q: "A backward-bending supply curve of labour arises when, at high wages:", opts: ["The substitution effect outweighs the income effect", "The income effect outweighs the substitution effect", "Unemployment rises", "MRP falls"], a: 1, why: "Workers earn enough to choose more leisure, so they may supply fewer hours." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Derived demand", "Demand for a factor of production that comes from the demand for the product it makes."],
  ["Marginal physical product (MPP)", "The extra output from employing one more worker."],
  ["Marginal revenue product (MRP)", "The extra revenue from employing one more worker: MPP × MR."],
  ["Marginal cost of labour (MCL)", "The extra cost of employing one more worker."],
  ["Average cost of labour (ACL)", "The wage paid at each level of employment: the supply curve facing a monopsony."],
  ["Wage elasticity of demand for labour", "%Δ quantity of labour demanded ÷ %Δ wage."],
  ["Substitution effect (labour supply)", "A higher wage makes leisure more expensive, so workers may supply more hours."],
  ["Income effect (labour supply)", "A higher wage raises income, so workers may buy more leisure and work fewer hours."],
  ["Transfer earnings", "The minimum payment needed to keep a worker in their current job."],
  ["Economic rent", "Earnings above transfer earnings."],
  ["Monopsony", "A market with a single buyer of labour, able to set the wage."],
  ["Bilateral monopoly", "A single buyer of labour facing a single seller, such as one employer and one union."],
  ["Trade union", "An organisation of workers that bargains collectively over pay and conditions."],
  ["Minimum wage", "A legal floor on the hourly wage that employers may pay."],
  ["Compensating differences", "Extra pay for jobs that are unpleasant, risky or have unsocial hours."],
] });
lab1(); lab2(); lab3();
