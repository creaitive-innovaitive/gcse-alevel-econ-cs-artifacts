/* ===== 19.2 Recursion: trace engine ===== */
const RW = 720, RH = 372;

/* Records every call/return of a recursive function as snapshots, then draws stack + call tree. */
function Trace(o = {}) {
  const nodes = [], stack = [], snaps = [], out = [];
  let phase = "down", pdata = null, alert = null;
  const clonePanel = () => (pdata ? JSON.parse(JSON.stringify(pdata)) : null);
  const snap = (cap, ps, py) => snaps.push({
    cap, ps, py, phase, alert, out: [...out], n: nodes.length, panel: clonePanel(),
    ns: nodes.map((n) => [n.st, n.val]),
    stack: stack.map((f) => ({ label: f.label, ra: f.ra, status: f.status, st: f.st })),
  });
  const T = {
    nodes, out, o,
    setPanel(d) { pdata = d; },
    print(t) { out.push(t); },
    setStatus(nd, s) { nd.fr.status = s; },
    call(label, short, parent, ra, cap, ps, py, status = "", st = "run") {
      if (parent) { parent.st = "wait"; parent.fr.st = "wait"; }
      const nd = { label, short, parent, kids: [], st: "act", val: null };
      nodes.push(nd); parent && parent.kids.push(nd);
      nd.fr = { label, ra, status, st }; stack.push(nd.fr);
      phase = "down"; snap(cap, ps, py); return nd;
    },
    note(nd, status, cap, ps, py, st = "run") { nd.fr.status = status; nd.fr.st = st; nd.st = "act"; snap(cap, ps, py); },
    ret(nd, val, cap, ps, py, outLine, status) {
      nd.fr.status = status || (val === undefined || val === null ? "finished" : "returns " + val); nd.fr.st = "ret"; nd.st = "done"; nd.val = val ?? "";
      if (outLine) out.push(outLine);
      phase = "up"; snap(cap, ps, py); stack.pop();
    },
    finish(cap, ps, py, al) { alert = al || null; snap(cap, ps, py); },
    alertNow(a) { alert = a; },
  };
  T.build = () => {
    layout(nodes);
    return snaps.map((s) => ({ cap: s.cap, ps: s.ps, py: s.py, svg: drawSnap(s, nodes, o) }));
  };
  T.maxDepth = () => 0;
  return T;
}

/* tree layout: leaves spaced evenly, parents centred over children */
function layout(nodes) {
  if (!nodes.length) return;
  let leaf = 0; const depthOf = (n) => (n.parent ? depthOf(n.parent) + 1 : 0);
  const go = (n) => { if (!n.kids.length) n.lx = leaf++; else { n.kids.forEach(go); n.lx = (n.kids[0].lx + n.kids[n.kids.length - 1].lx) / 2; } };
  go(nodes[0]); nodes.forEach((n) => (n.d = depthOf(n)));
  nodes.leaves = leaf; nodes.depth = Math.max(...nodes.map((n) => n.d)) + 1;
}

function maxStack(snaps) { return Math.max(1, ...snaps.map((s) => s.stack.length)); }

function drawSnap(s, nodes, o) {
  const maxD = o.maxDepth || 5, fh = Math.max(34, Math.min(50, Math.floor(272 / maxD) - 5)), gap = 5, X = 14, FW = 340, base = 322;
  let g = "";
  // left: call stack
  g += SV.text(X, 22, "CALL STACK", "sm bd", { "text-anchor": "start", style: "letter-spacing:.1em" });
  g += SV.text(X + FW, 22, s.phase === "down" ? "▼ WINDING (calls)" : "▲ UNWINDING (returns)", "lbl bd " + (s.phase === "down" ? "t1" : "t3"), { "text-anchor": "end" });
  g += SV.line(X - 4, base + 3, X + FW + 4, base + 3, "ax");
  g += SV.text(X, base + 20, "bottom of stack: main program", "sm", { "text-anchor": "start" });
  s.stack.forEach((f, i) => {
    const y = base - fh - i * (fh + gap), c = { run: "cell-cur", wait: "", ret: "cell-ok", base: "cell-warn" }[f.st];
    g += SV.rect(X, y, FW, fh, "cell " + c, { rx: 8 });
    g += SV.text(X + 10, y + (fh > 40 ? 20 : 15), esc(f.label), "lbl bd", { "text-anchor": "start", style: "font-family:var(--mono);font-size:14px" });
    g += SV.text(X + FW - 10, y + (fh > 40 ? 20 : 15), "return to: " + esc(f.ra), "sm", { "text-anchor": "end" });
    if (f.status) g += SV.text(X + 10, y + fh - (fh > 40 ? 10 : 6), esc(f.status), "lbl", { "text-anchor": "start", style: "font-size:12.5px" });
  });
  if (!s.stack.length) g += SV.text(X + FW / 2, base - 40, "stack is empty", "lbl", { "text-anchor": "middle", style: "font-style:italic;fill:var(--muted)" });
  // right: call tree
  const RX = 388, RWd = RW - RX - 10;
  g += SV.text(RX, 22, "CALL TREE  " + (o.treeName || ""), "sm bd", { "text-anchor": "start", style: "letter-spacing:.1em" });
  const lv = nodes.depth || 1, lvs = nodes.leaves || 1, r = nodes.length > 12 ? 14 : 17, dy = Math.min(52, 190 / Math.max(1, lv - 1 || 1)), sp = lvs > 1 ? Math.min(54, (RWd - 2 * r) / (lvs - 1)) : 0;
  const tw = (lvs - 1) * sp, ox = RX + RWd / 2 - tw / 2, oy = 52;
  const px = (n) => ox + n.lx * sp, py = (n) => oy + n.d * dy;
  nodes.forEach((n, i) => { if (n.parent) { const live = i < s.n; g += SV.line(px(n.parent), py(n.parent), px(n), py(n), live ? "edge" : "edge", { opacity: live ? 1 : 0.18 }); } });
  nodes.forEach((n, i) => {
    const live = i < s.n, st = live ? s.ns[i][0] : "new", val = live ? s.ns[i][1] : null;
    const cls = { new: "nd", wait: "nd", act: "nd nd-cur", done: "nd nd-ok" }[st];
    g += `<g opacity="${live ? 1 : 0.22}">` + SV.circle(px(n), py(n), r, cls, st === "wait" ? { style: "stroke:var(--warn);stroke-width:3.5;fill:var(--warn-soft)" } : {}) + SV.text(px(n), py(n) + 5, esc(n.short), "lbl bd", { "text-anchor": "middle", style: "font-size:" + (r < 16 ? 11 : 13) + "px" });
    if (st === "done" && val !== "" && val !== null) g += SV.text(px(n) + r + 3, py(n) + 4, esc(val), "sm bd t3", { "text-anchor": "start", style: "font-family:var(--mono);font-size:11.5px" });
    g += "</g>";
  });
  // bottom right: output / returned values / custom panel
  const BY = 268;
  g += SV.rect(RX, BY, RWd, 90, "cell", { rx: 8 });
  if (s.panel && o.panelFn) g += o.panelFn(s.panel, RX, BY, RWd);
  else {
    g += SV.text(RX + 10, BY + 16, (o.outTitle || "OUTPUT").toUpperCase(), "sm bd", { "text-anchor": "start", style: "letter-spacing:.1em" });
    s.out.forEach((t, i) => { const col = i < 5 ? 0 : 1, row = i % 5; g += SV.text(RX + 10 + col * (RWd / 2), BY + 33 + row * 13.5, esc(t), "lbl", { "text-anchor": "start", style: "font-family:var(--mono);font-size:12px" }); });
  }
  if (s.alert) { g += SV.rect(RX, BY, RWd, 90, "cell cell-no", { rx: 8 }) + SV.text(RX + RWd / 2, BY + 52, esc(s.alert), "lbl bd t2", { "text-anchor": "middle", style: "font-size:17px" }); }
  return g;
}

/* helper: run a simulation and hand the frames to Lib.algo */
function showAlgo(sel, T, code, label, dwell = 2600) {
  const frames = T.build();
  Lib.algo($(sel), { w: RW, h: RH, label, pseudo: code.ps, py: code.py, dwell, frames });
}
const fix = (T, snapsCount) => T;

/* ===== A. Show(3): output on the way down and on the way back ===== */
const SHOW = {
  ps: ["PROCEDURE Show(n : INTEGER)", "   IF n = 0 THEN", "      OUTPUT \"Done\"", "   ELSE", "      OUTPUT \"Down \", n", "      CALL Show(n - 1)", "      OUTPUT \"Up \", n", "   ENDIF", "ENDPROCEDURE"],
  py: ["def show(n):", "    if n == 0:", "        print('Done')", "    else:", "        print('Down', n)", "        show(n - 1)", "        print('Up', n)"],
};
(() => {
  const T = Trace({ treeName: "Show(n)", outTitle: "Output so far", maxDepth: 4 });
  function show(n, parent, ra) {
    const nd = T.call(`Show(${n})`, n, parent, ra, `<b>Show(${n}) is called.</b> A new stack frame is pushed. It stores n = ${n} and the return address.`, [0], [0]);
    if (n === 0) {
      T.print("Done");
      T.note(nd, "n = 0: BASE CASE", `Is n = 0? <b>Yes.</b> This is the <b>base case</b>: no more calls. It outputs "Done" and the calls stop going deeper.`, [1, 2], [1, 2], "base");
      T.ret(nd, null, `Show(0) reaches the end of the procedure, so its frame is popped. <b>Unwinding begins:</b> control goes back to the line after the call in Show(1).`, [8], [2], null, "finished");
      return nd;
    }
    T.note(nd, "n ≠ 0: general case", `Is n = 0? No (n = ${n}). This is the <b>general case</b>, so the procedure will call itself with a smaller value.`, [1, 3], [1, 3]);
    T.print("Down " + n);
    T.note(nd, `printed "Down ${n}"`, `<b>OUTPUT "Down ${n}".</b> This line comes <i>before</i> the recursive call, so it runs on the way down.`, [4], [4]);
    T.setStatus(nd, `paused: waiting for Show(${n - 1})`);
    const ch = show(n - 1, nd, `Show line 6`);
    T.print("Up " + n);
    T.note(nd, `printed "Up ${n}"`, `Show(${n - 1}) has finished. Show(${n}) <b>resumes</b> at the line after its call and runs <b>OUTPUT "Up ${n}"</b>. This line comes <i>after</i> the call, so it runs on the way back up.`, [6], [6]);
    T.ret(nd, null, `Show(${n}) reaches ENDPROCEDURE and its frame is popped.`, [8], [6], null, "finished");
    return nd;
  }
  show(3, null, "main program");
  T.finish("The stack is empty. The output shows the pattern: everything <i>before</i> the call is printed going down (3, 2, 1), everything <i>after</i> it is printed coming back up (1, 2, 3), in the reverse order.", [], []);
  showAlgo("#aShow", T, SHOW, "Animated trace of Show(3)", 2800);
})();

/* ===== B. Fact(4) ===== */
const FACT = {
  ps: ["FUNCTION Fact(n : INTEGER) RETURNS INTEGER", "   IF n = 0 THEN", "      RETURN 1", "   ELSE", "      RETURN n * Fact(n - 1)", "   ENDIF", "ENDFUNCTION"],
  py: ["def fact(n):", "    if n == 0:", "        return 1", "    else:", "        return n * fact(n - 1)"],
};
(() => {
  const T = Trace({ treeName: "Fact(n)", outTitle: "Values returned", maxDepth: 5 });
  function fact(n, parent, ra) {
    const nd = T.call(`Fact(${n})`, n, parent, ra, `<b>Fact(${n}) is called.</b> New frame pushed: n = ${n}, plus the return address (where to carry on once it finishes).`, [0], [0]);
    if (n === 0) {
      T.note(nd, "n = 0: BASE CASE", `Is n = 0? <b>Yes: base case.</b> The answer is known without another call: <b>RETURN 1</b>.`, [1, 2], [1, 2], "base");
      T.ret(nd, 1, `Fact(0) returns <b>1</b> and its frame is popped. <b>Unwinding starts.</b> The value 1 goes back to the caller, Fact(1).`, [2], [2], "Fact(0) = 1");
      return 1;
    }
    T.note(nd, "n ≠ 0: general case", `Is n = 0? No. <b>General case:</b> Fact(${n}) = ${n} × Fact(${n - 1}). It cannot finish until Fact(${n - 1}) gives an answer, so it calls it.`, [1, 3, 4], [1, 3, 4]);
    T.setStatus(nd, `waiting: ${n} × Fact(${n - 1})`);
    const r = fact(n - 1, nd, "Fact line 5");
    nd.fr.status = `${n} × ${r} = ?`;
    T.note(nd, `${n} × ${r} = ${n * r}`, `Fact(${n - 1}) returned <b>${r}</b>. Fact(${n}) resumes and finishes the sum it left unfinished: ${n} × ${r} = <b>${n * r}</b>.`, [4], [4]);
    T.ret(nd, n * r, `Fact(${n}) returns <b>${n * r}</b> and its frame is popped.`, [4], [4], `Fact(${n}) = ${n * r}`);
    return n * r;
  }
  fact(4, null, "main program");
  T.finish("The stack is empty and the answer, <b>Fact(4) = 24</b>, was passed back to the main program. The multiplications were all done on the way back up, as each frame was popped.", [], []);
  showAlgo("#aFact", T, FACT, "Animated trace of Fact(4)", 2800);
})();

/* ===== C. Fib(4): two recursive calls ===== */
const FIB = {
  ps: ["FUNCTION Fib(n : INTEGER) RETURNS INTEGER", "   IF n <= 1 THEN", "      RETURN n", "   ELSE", "      RETURN Fib(n - 1) + Fib(n - 2)", "   ENDIF", "ENDFUNCTION"],
  py: ["def fib(n):", "    if n <= 1:", "        return n", "    else:", "        return fib(n - 1) + fib(n - 2)"],
};
(() => {
  const T = Trace({ treeName: "Fib(n)", outTitle: "Values returned", maxDepth: 4 });
  function fib(n, parent, ra, which) {
    if (n <= 1) {
      const nd = T.call(`Fib(${n})`, n, parent, ra, `<b>Fib(${n}) is called.</b> Is n ≤ 1? <b>Yes: base case.</b> It can answer straight away.`, [0, 1, 2], [0, 1, 2], "BASE CASE", "base");
      T.ret(nd, n, `Fib(${n}) returns <b>${n}</b>. Its frame is popped and the value goes to the caller.`, [2], [2], `Fib(${n}) = ${n}`);
      return n;
    }
    const nd = T.call(`Fib(${n})`, n, parent, ra, `<b>Fib(${n}) is called.</b> Is n ≤ 1? No: general case. The answer is Fib(${n - 1}) + Fib(${n - 2}), so <b>two</b> calls are needed. It makes the first one now.`, [0, 1, 3, 4], [0, 1, 3, 4], `needs Fib(${n - 1}) + Fib(${n - 2})`);
    const a = fib(n - 1, nd, "Fib line 5, first call");
    T.note(nd, `${a} + Fib(${n - 2}) ...`, `Fib(${n - 1}) returned <b>${a}</b>. Fib(${n}) resumes, remembers ${a}, and now makes its <b>second</b> call, Fib(${n - 2}).`, [4], [4]);
    const b = fib(n - 2, nd, "Fib line 5, second call");
    T.note(nd, `${a} + ${b} = ${a + b}`, `Both calls are done: ${a} + ${b} = <b>${a + b}</b>.`, [4], [4]);
    T.ret(nd, a + b, `Fib(${n}) returns <b>${a + b}</b>. Its frame is popped.`, [4], [4], `Fib(${n}) = ${a + b}`);
    return a + b;
  }
  fib(4, null, "main program");
  T.finish("Fib(4) = 3. Look at the call tree: <b>Fib(2) was worked out twice</b> and Fib(1) three times. Double recursion repeats work, which is why recursive Fibonacci is slow for large n.", [], []);
  showAlgo("#aFib", T, FIB, "Animated trace of Fib(4) with its call tree", 2600);
})();

/* ===== D. Reverse a string ===== */
const REV = {
  ps: ["FUNCTION Reverse(s : STRING) RETURNS STRING", "   IF LENGTH(s) <= 1 THEN", "      RETURN s", "   ELSE", "      RETURN Reverse(MID(s, 2, LENGTH(s) - 1)) & LEFT(s, 1)", "   ENDIF", "ENDFUNCTION"],
  py: ["def reverse(s):", "    if len(s) <= 1:", "        return s", "    else:", "        return reverse(s[1:]) + s[0]"],
};
(() => {
  const T = Trace({ treeName: "Reverse(s)", outTitle: "Values returned", maxDepth: 4 });
  function rev(s, parent, ra) {
    const nd = T.call(`Reverse("${s}")`, s, parent, ra, `<b>Reverse("${s}") is called.</b> New frame pushed holding s = "${s}".`, [0], [0]);
    if (s.length <= 1) {
      T.note(nd, "length ≤ 1: BASE CASE", `LENGTH("${s}") ≤ 1? <b>Yes: base case.</b> A string of one character is already its own reverse.`, [1, 2], [1, 2], "base");
      T.ret(nd, `"${s}"`, `Returns "${s}" and the frame is popped. <b>Unwinding starts.</b>`, [2], [2], `"${s}"`);
      return s;
    }
    T.note(nd, "length > 1: general case", `Longer than 1 character, so <b>general case</b>: reverse everything except the first letter ("${s.slice(1)}"), then add "${s[0]}" on the end.`, [1, 3, 4], [1, 3, 4]);
    T.setStatus(nd, `waiting: Reverse("${s.slice(1)}") & "${s[0]}"`);
    const r = rev(s.slice(1), nd, "Reverse line 5");
    T.note(nd, `"${r}" & "${s[0]}"`, `Reverse("${s.slice(1)}") returned "${r}". Add the first letter on the end: "${r}" &amp; "${s[0]}" = <b>"${r + s[0]}"</b>.`, [4], [4]);
    T.ret(nd, `"${r + s[0]}"`, `Returns "${r + s[0]}" and the frame is popped.`, [4], [4], `"${r + s[0]}"`);
    return r + s[0];
  }
  rev("CODE", null, "main program");
  T.finish('Reverse("CODE") = "EDOC". Each frame held one letter safely until the rest of the string came back.', [], []);
  showAlgo("#aRev", T, REV, 'Animated trace of Reverse("CODE")', 2600);
})();

/* ===== E. Recursive binary search ===== */
const BIN = {
  ps: ["FUNCTION BinSearch(Data, Low, High, Target) RETURNS INTEGER", "   IF Low > High THEN", "      RETURN -1", "   ENDIF", "   Mid ← (Low + High) DIV 2", "   IF Data[Mid] = Target THEN", "      RETURN Mid", "   ELSE", "      IF Data[Mid] < Target THEN", "         RETURN BinSearch(Data, Mid + 1, High, Target)", "      ELSE", "         RETURN BinSearch(Data, Low, Mid - 1, Target)", "      ENDIF", "   ENDIF", "ENDFUNCTION"],
  py: ["def bin_search(data, low, high, target):", "    if low > high:", "        return -1", "", "    mid = (low + high) // 2", "    if data[mid] == target:", "        return mid", "    elif data[mid] < target:", "        return bin_search(data, mid + 1, high, target)", "    else:", "        return bin_search(data, low, mid - 1, target)"],
};
(() => {
  const D = [3, 8, 12, 20, 27, 35, 41, 50], TG = 41;
  const T = Trace({
    treeName: "BinSearch", outTitle: "Values returned", maxDepth: 4,
    panelFn: (p, x, y, w) => {
      const cw = 34, gp = 4, x0 = x + (w - (8 * cw + 7 * gp)) / 2;
      let s = SV.text(x + 10, y + 16, `DATA   target = ${TG}`, "sm bd", { "text-anchor": "start", style: "letter-spacing:.1em" });
      D.forEach((v, i) => {
        const inr = p.lo !== undefined && i >= p.lo && i <= p.hi, cl = p.mid === i ? "cell-warn" : inr ? "cell-cur" : "";
        s += `<g opacity="${inr || p.mid === i ? 1 : 0.3}">` + SV.rect(x0 + i * (cw + gp), y + 28, cw, 30, "cell " + cl, { rx: 6 }) + SV.text(x0 + i * (cw + gp) + cw / 2, y + 48, v, "lbl bd", { "text-anchor": "middle", style: "font-size:13px;font-family:var(--mono)" }) + SV.text(x0 + i * (cw + gp) + cw / 2, y + 72, i, "sm", { "text-anchor": "middle" }) + "</g>";
      });
      s += SV.text(x + w - 10, y + 16, p.mid !== undefined ? `Low=${p.lo} High=${p.hi} Mid=${p.mid}` : "", "sm bd t4", { "text-anchor": "end" });
      return s;
    },
  });
  function bs(lo, hi, parent, ra) {
    const nd = T.call(`BinSearch(${lo}, ${hi})`, `${lo}-${hi}`, parent, ra, `<b>BinSearch(Low=${lo}, High=${hi}) is called.</b> The cells in blue are the part of the array still being searched.`, [0], [0]);
    T.setPanel({ lo, hi });
    if (lo > hi) { T.ret(nd, -1, "Low > High: not found.", [1, 2], [1, 2]); return -1; }
    const mid = Math.floor((lo + hi) / 2); T.setPanel({ lo, hi, mid });
    T.note(nd, `Mid = ${mid}, Data[${mid}] = ${D[mid]}`, `Low ≤ High, so carry on. Mid = (${lo} + ${hi}) DIV 2 = <b>${mid}</b>. Data[${mid}] is <b>${D[mid]}</b>.`, [1, 4, 5], [1, 4, 5]);
    if (D[mid] === TG) {
      nd.fr.st = "base";
      T.ret(nd, mid, `${D[mid]} = ${TG}: <b>found</b>. This is a <b>base case</b>. RETURN Mid = ${mid}. Unwinding starts.`, [5, 6], [5, 6], `BinSearch = ${mid}`);
      return mid;
    }
    const right = D[mid] < TG;
    T.setStatus(nd, `waiting: search ${right ? "right half" : "left half"}`);
    const r = bs(right ? mid + 1 : lo, right ? hi : mid - 1, nd, "BinSearch line " + (right ? 10 : 12));
    T.setPanel({ lo, hi, mid });
    T.note(nd, `passes ${r} back up`, `The call below returned <b>${r}</b>. Nothing more to do here except pass it back.`, right ? [9] : [11], right ? [8] : [10]);
    T.ret(nd, r, `Returns ${r} and the frame is popped.`, right ? [9] : [11], right ? [8] : [10], `BinSearch = ${r}`);
    return r;
  }
  bs(0, 7, null, "main program");
  T.setPanel({ lo: 6, hi: 7, mid: 6 });
  T.finish(`${TG} is at index 6. Each call halved the search area (8 → 4 → 2 items). Recursion suits <b>divide and conquer</b> because each call is the same problem on a smaller part. The answer is simply passed back unchanged.`, [], []);
  showAlgo("#aBin", T, BIN, "Animated trace of a recursive binary search", 2800);
})();

/* ===== F. Towers of Hanoi ===== */
const HAN = {
  ps: ["PROCEDURE Hanoi(n, From, To, Via)", "   IF n = 1 THEN", "      OUTPUT \"Move disc from \", From, \" to \", To", "   ELSE", "      CALL Hanoi(n - 1, From, Via, To)", "      OUTPUT \"Move disc from \", From, \" to \", To", "      CALL Hanoi(n - 1, Via, To, From)", "   ENDIF", "ENDPROCEDURE"],
  py: ["def hanoi(n, src, dst, via):", "    if n == 1:", "        print('Move disc from', src, 'to', dst)", "    else:", "        hanoi(n - 1, src, via, dst)", "        print('Move disc from', src, 'to', dst)", "        hanoi(n - 1, via, dst, src)"],
};
(() => {
  const pegs = { A: [3, 2, 1], B: [], C: [] }, moves = [];
  const T = Trace({
    treeName: "Hanoi(n)", outTitle: "Moves", maxDepth: 3,
    panelFn: (p, x, y, w) => {
      let s = SV.text(x + 10, y + 16, "PEGS (moves so far: " + p.m + ")", "sm bd", { "text-anchor": "start", style: "letter-spacing:.1em" });
      ["A", "B", "C"].forEach((k, i) => {
        const cx = x + w * (i + 0.5) / 3; s += SV.rect(cx - 2, y + 26, 4, 50, "f1") + SV.rect(cx - 36, y + 76, 72, 3, "f1") + SV.text(cx, y + 88, k, "sm bd", { "text-anchor": "middle" });
        p[k].forEach((d, j) => { const dw = 14 + d * 12; s += SV.rect(cx - dw / 2, y + 66 - j * 11, dw, 10, "cell cell-cur", { rx: 3 }); });
      });
      return s;
    },
  });
  const sync = () => T.setPanel({ A: [...pegs.A], B: [...pegs.B], C: [...pegs.C], m: moves.length });
  const mv = (f, t) => { pegs[t].push(pegs[f].pop()); moves.push(f + t); sync(); };
  function han(n, f, t, v, parent, ra) {
    const lbl = `Hanoi(${n},${f},${t},${v})`;
    if (n === 1) {
      const nd = T.call(lbl, n, parent, ra, `<b>${lbl} is called.</b> n = 1: <b>base case</b>. Just move the one disc from ${f} to ${t}.`, [0, 1, 2], [0, 1, 2], "BASE CASE", "base");
      T.print(`${f} → ${t}`); mv(f, t);
      T.ret(nd, null, `Moved a disc ${f} → ${t}. Frame popped.`, [2], [2], null, "moved " + f + " → " + t);
      return nd;
    }
    const nd = T.call(lbl, n, parent, ra, `<b>${lbl} is called.</b> n = ${n}: general case. Plan: move ${n - 1} discs out of the way to ${v}, move the biggest disc to ${t}, then move the ${n - 1} discs on top of it. First step: a recursive call.`, [0, 1, 3, 4], [0, 1, 3, 4], "step 1: clear the way");
    han(n - 1, f, v, t, nd, "Hanoi line 5");
    T.print(`${f} → ${t}`); mv(f, t);
    T.note(nd, `step 2: moved ${f} → ${t}`, `The smaller discs are out of the way. <b>Move the big disc ${f} → ${t}.</b> This line runs <i>between</i> the two recursive calls.`, [5], [5]);
    T.setStatus(nd, "step 3: rebuild on top");
    han(n - 1, v, t, f, nd, "Hanoi line 7");
    T.ret(nd, null, `${lbl} is complete. Frame popped.`, [8], [6], null, "complete");
    return nd;
  }
  sync(); han(3, "A", "C", "B", null, "main program"); sync();
  T.finish("Tower moved in <b>7 moves</b> (2³ − 1). The recursive solution is only a few lines; working out the same moves by hand is much harder. Each extra disc doubles the number of moves plus one.", [], []);
  showAlgo("#aHan", T, HAN, "Animated trace of Towers of Hanoi with three discs", 2700);
})();

/* ===== G. Missing base case: stack overflow ===== */
const BAD = {
  ps: ["FUNCTION Bad(n : INTEGER) RETURNS INTEGER", "   RETURN n * Bad(n - 1)", "ENDFUNCTION"],
  py: ["def bad(n):", "    return n * bad(n - 1)"],
};
(() => {
  const T = Trace({ treeName: "Bad(n)", outTitle: "Values returned", maxDepth: 6 });
  let nd = null;
  for (let n = 3; n >= -2; n--) {
    nd = T.call(`Bad(${n})`, n, nd, n === 3 ? "main program" : "Bad line 2", `<b>Bad(${n}) is called.</b> There is no IF test, so there is no base case. It immediately calls Bad(${n - 1}).`, [0, 1], [0, 1], `waiting: ${n} × Bad(${n - 1})`);
  }
  T.finish("The stack has run out of room. Every call pushed a frame and none ever returned, because nothing stops the calls. The program crashes with a <b>stack overflow</b>. (A real stack holds thousands of frames, but infinite recursion fills any stack.)", [], [], "STACK OVERFLOW");
  showAlgo("#aBad", T, BAD, "Animated stack overflow from a missing base case", 2200);
})();

/* ---------- static diagram: winding and unwinding (also used by lab 1) ---------- */
function windSvg(n) {
  const k = n + 1, W = 720, gap = 10, bw = Math.min(110, (W - 40 - (k - 1) * gap) / k), x0 = (W - (k * bw + (k - 1) * gap)) / 2, y = 92, bh = 44;
  const vals = []; let v = 1; vals[0] = 1; for (let i = 1; i <= n; i++) { v *= i; vals[i] = v; }
  let s = SV.text(14, 22, "WINDING: each call waits for the next", "lbl bd t1", { "text-anchor": "start" });
  s += SV.text(W - 14, 214, "UNWINDING: answers come back and are used", "lbl bd t3", { "text-anchor": "end" });
  for (let i = 0; i < k; i++) {
    const m = n - i, x = x0 + i * (bw + gap), base = m === 0;
    s += SV.rect(x, y, bw, bh, "cell " + (base ? "cell-warn" : "cell-cur"), { rx: 8 }) + SV.text(x + bw / 2, y + 27, `Fact(${m})`, "lbl bd", { "text-anchor": "middle", style: "font-family:var(--mono);font-size:" + (bw < 70 ? 11 : 14) + "px" });
    s += SV.text(x + bw / 2, y - 30, base ? "base case" : `${m} × Fact(${m - 1})`, "sm bd " + (base ? "t4" : ""), { "text-anchor": "middle" });
    if (i < k - 1) { const ax = x + bw + 1, bx = x + bw + gap - 1; s += SV.line(ax - 6, y + 12, bx + 4, y + 12, "c1", { style: "stroke-width:2.5" }) + SV.arrowHead(bx + 6, y + 12, "r", "dot1"); }
    const rv = vals[base ? 0 : m]; // value Fact(m)
    s += SV.text(x + bw / 2, y + bh + 40, `= ${rv}`, "lbl bd t3", { "text-anchor": "middle", style: "font-family:var(--mono);font-size:" + (bw < 70 ? 12 : 15) + "px" });
    s += SV.text(x + bw / 2, y + bh + 58, base ? "known: 1" : `${m} × ${vals[m - 1]}`, "sm", { "text-anchor": "middle" });
    if (i > 0) { const ax = x - gap + 1, bx = x - 1; s += SV.line(bx - 2, y + bh + 14, ax + 8, y + bh + 14, "c3", { style: "stroke-width:2.5" }) + SV.arrowHead(ax + 2, y + bh + 14, "l", "dot3"); }
  }
  s += SV.text(W / 2, 252, `Fact(${n}) = ${vals[n]}`, "lbl bd", { "text-anchor": "middle", style: "font-size:18px;font-family:var(--mono)" });
  return `<svg viewBox="0 0 ${W} 270" role="img" aria-label="Winding and unwinding for Fact(${n})">${s}</svg>`;
}
$("#windStatic").innerHTML = `<div class="card">${windSvg(3)}<p class="note" style="margin:6px 0 0">Blue arrows: calls going down until the base case. Green arrows: values returning, each used to finish the calculation that was waiting.</p></div>`;

/* ---------- static diagram: what is in a stack frame ---------- */
(() => {
  const W = 720, fw = 300, fx = 20; let s = "";
  const fr = [["Fact(3)", "n = 3", "main program", "cell-ok"], ["Fact(2)", "n = 2", "Fact, line 5", "cell-cur"], ["Fact(1)", "n = 1", "Fact, line 5", "cell-warn"]];
  fr.forEach((f, i) => {
    const y = 20 + (2 - i) * 70; // first call at bottom
    s += SV.rect(fx, y, fw, 62, "cell " + f[3], { rx: 8 }) + SV.text(fx + 12, y + 20, f[0], "lbl bd", { "text-anchor": "start", style: "font-family:var(--mono);font-size:14px" });
    s += SV.text(fx + 12, y + 40, "parameter: " + f[1], "lbl", { "text-anchor": "start", style: "font-size:12.5px" });
    s += SV.text(fx + 12, y + 56, "return address: " + f[2], "lbl", { "text-anchor": "start", style: "font-size:12.5px" });
  });
  s += SV.line(fx - 4, 232, fx + fw + 4, 232, "ax") + SV.text(fx, 250, "bottom of stack", "sm", { "text-anchor": "start" });
  s += SV.arrowHead(fx + fw + 24, 24, "u", "dot1") + SV.line(fx + fw + 24, 24, fx + fw + 24, 60, "c1") + SV.text(fx + fw + 36, 40, "push on call", "lbl bd t1", { "text-anchor": "start" });
  s += SV.arrowHead(fx + fw + 24, 228, "d", "dot3") + SV.line(fx + fw + 24, 190, fx + fw + 24, 228, "c3") + SV.text(fx + fw + 36, 214, "pop on return", "lbl bd t3", { "text-anchor": "start" });
  const tx = 420;
  s += SV.text(tx, 90, "Each frame holds:", "lbl bd", { "text-anchor": "start" });
  ["the parameter values (n)", "any local variables", "the return address: which line to resume at", "(and the partly worked-out expression)"].forEach((t, i) => (s += SV.text(tx, 114 + i * 22, "• " + t, "lbl", { "text-anchor": "start", style: "font-size:13px" })));
  s += SV.text(tx, 220, "The top frame is the one running.", "lbl bd t1", { "text-anchor": "start" });
  $("#frameStatic").innerHTML = `<div class="card"><svg viewBox="0 0 ${W} 262" role="img" aria-label="Stack frames for Fact(3), Fact(2) and Fact(1)">${s}</svg></div>`;
})();

/* ---------- Explore lab 1: wind/unwind for any n ---------- */
(() => {
  const out = $("#wlOut");
  Lib.slider($("#wlS"), { id: "wl", label: "Value of n in Fact(n)", min: 0, max: 8, value: 4, onInput: (n) => {
    let f = 1; for (let i = 2; i <= n; i++) f *= i;
    out.innerHTML = windSvg(n) + `<div class="readout"><div><small>Calls made</small><strong>${n + 1}</strong></div><div><small>Max frames on stack</small><strong>${n + 1}</strong></div><div><small>Returns made</small><strong>${n + 1}</strong></div><div><small>Result</small><strong>${f}</strong></div></div><div class="verdict">${n === 0 ? "Fact(0) is the base case: one call, answer straight away." : `Fact(${n}) makes ${n + 1} calls (n, n − 1, … 0). All ${n + 1} frames exist on the stack at the same time at the deepest point, then they pop one by one.`}</div>`;
  } });
})();

/* ---------- Explore lab 2: recursion explorer ---------- */
(() => {
  const sel = $("#exFn"), el = $("#exOut"), sl = $("#exS");
  const defs = {
    fact: { name: "Fact(n) = n × Fact(n − 1)", min: 0, max: 10, val: 5, it: (n) => Math.max(n, 1) },
    sum: { name: "Sum(n) = n + Sum(n − 1)", min: 0, max: 20, val: 6, it: (n) => Math.max(n, 1) },
    fib: { name: "Fib(n) = Fib(n − 1) + Fib(n − 2)", min: 0, max: 18, val: 6, it: (n) => Math.max(n - 1, 1) },
    han: { name: "Hanoi(n) moves", min: 1, max: 10, val: 3, it: (n) => Math.pow(2, n) - 1 },
  };
  function run(k, n) {
    let calls = 0, depth = 0, maxd = 0; const log = [];
    const L = (t, d) => { if (log.length < 40) log.push("  ".repeat(Math.min(d, 12)) + t); else if (log.length === 40) log.push("… (log cut off)"); };
    const f = {
      fact: (n, d) => { calls++; maxd = Math.max(maxd, d + 1); L(`Fact(${n})`, d); if (n === 0) return 1; return n * f.fact(n - 1, d + 1); },
      sum: (n, d) => { calls++; maxd = Math.max(maxd, d + 1); L(`Sum(${n})`, d); if (n === 0) return 0; return n + f.sum(n - 1, d + 1); },
      fib: (n, d) => { calls++; maxd = Math.max(maxd, d + 1); L(`Fib(${n})`, d); if (n <= 1) return n; return f.fib(n - 1, d + 1) + f.fib(n - 2, d + 1); },
      han: (n, d) => { calls++; maxd = Math.max(maxd, d + 1); L(`Hanoi(${n})`, d); if (n === 1) return 1; return f.han(n - 1, d + 1) + 1 + f.han(n - 1, d + 1); },
    };
    const res = f[k](n, 0); return { res, calls, maxd, log };
  }
  let S;
  const draw = () => {
    const k = sel.value, d = defs[k], n = S.get(), r = run(k, n), it = d.it(n);
    el.innerHTML = `<div class="readout"><div><small>Result</small><strong>${r.res.toLocaleString()}</strong></div><div><small>Total calls</small><strong>${r.calls.toLocaleString()}</strong></div><div><small>Deepest stack (frames)</small><strong>${r.maxd}</strong></div><div><small>Loop passes (iterative)</small><strong>${it.toLocaleString()}</strong></div></div>
    <div class="bars"><small>Recursive calls</small><div><div class="bar b2" style="width:${Math.max(1, Math.min(100, (r.calls / Math.max(r.calls, it)) * 100))}%"></div></div><strong>${r.calls.toLocaleString()}</strong><small>Loop passes</small><div><div class="bar b3" style="width:${Math.max(1, Math.min(100, (it / Math.max(r.calls, it)) * 100))}%"></div></div><strong>${it.toLocaleString()}</strong></div>
    <div class="verdict">${k === "fib" ? (n >= 12 ? `Fib(${n}) makes ${r.calls.toLocaleString()} calls but a loop needs only about ${it}. Double recursion repeats the same sub-problems, so the work grows exponentially.` : "Fibonacci calls itself twice, so the number of calls grows very quickly. Try n = 16.") : k === "han" ? `Hanoi(${n}) makes ${r.calls.toLocaleString()} calls and ${(Math.pow(2, n) - 1).toLocaleString()} moves: every extra disc roughly doubles the work.` : `One call per value, so ${r.calls} calls and a stack ${r.maxd} frames deep. Recursion costs memory for the frames; a loop does not.`}</div>
    <p class="note" style="margin:6px 0 2px">Call log (indent = depth on the stack):</p><pre class="plain">${esc(r.log.join("\n"))}</pre>`;
  };
  const setup = () => { const d = defs[sel.value]; S = Lib.slider(sl, { id: "ex", label: "Value of n", min: d.min, max: d.max, value: d.val, onInput: () => S && draw() }); draw(); };
  sel.onchange = setup; setup();
})();

/* ---------- Explore lab 3: push or pop ---------- */
(() => {
  const el = $("#pp"); let ev, i, st, score, msg, ok;
  const gen = () => {
    ev = []; const g = (n) => { ev.push({ t: "push", x: `Fact(${n})` , txt: `<b>Fact(${n})</b> is called` + (n === 3 ? " from the main program." : ` by Fact(${n + 1}).`) }); if (n > 0) g(n - 1); const v = [1, 1, 2, 6][n]; ev.push({ t: "pop", x: `Fact(${n})`, txt: n === 0 ? `<b>Fact(0)</b> hits the base case and returns 1.` : `<b>Fact(${n})</b> has received Fact(${n - 1}) and returns ${v}.` }); };
    g(3); i = 0; st = []; score = 0; msg = "Is each event a push or a pop?"; ok = true;
  };
  function draw() {
    const frames = st.length ? [...st].reverse().map((s, k) => `<div class="listrow" style="margin:3px 0;${k === 0 ? "border:2px solid var(--accent)" : ""}">${s}${k === 0 ? "  ← top" : ""}</div>`).join("") : `<div class="note">(stack is empty)</div>`;
    el.innerHTML = `<div class="grid2"><div><b>Stack</b><div style="min-height:180px;display:flex;flex-direction:column;justify-content:flex-end">${frames}</div></div><div>${i < ev.length ? `<p><b>Event ${i + 1} of ${ev.length}:</b> ${ev[i].txt}</p><div class="gbtn"><button class="b pri" data-g="push">Push a frame</button><button class="b" data-g="pop">Pop a frame</button></div>` : `<p><b>Finished.</b> Score ${score} / ${ev.length}. Calls push frames while winding; returns pop them while unwinding. The last frame pushed is always the first popped (LIFO).</p>`}<div class="msg" style="color:var(--${ok ? "good" : "bad"})" aria-live="polite">${msg}</div><div class="gbtn"><button class="b" data-g="again">Restart</button></div></div></div>`;
    $$("[data-g]", el).forEach((b) => (b.onclick = () => act(b.dataset.g)));
  }
  function act(k) {
    if (k === "again") { gen(); return draw(); }
    const e = ev[i]; if (!e) return;
    if (k !== e.t) { ok = false; msg = e.t === "push" ? "Not quite. A new call needs a new frame, so that is a push." : "Not quite. A function that returns has finished, so its frame is popped."; return draw(); }
    ok = true; score++; msg = "Correct."; if (e.t === "push") st.push(e.x); else st.pop(); i++; draw();
  }
  gen(); draw();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each line of code to the part of recursion it plays.", buckets: [{ label: "Base case (stops the calls)" }, { label: "General case (calls itself)" }, { label: "Runs while unwinding" }], items: [
  { text: "IF n = 0 THEN RETURN 1", b: 0 }, { text: "RETURN n * Fact(n - 1)", b: 1 }, { text: "IF Low > High THEN RETURN -1", b: 0 }, { text: "CALL Hanoi(n - 1, From, Via, To)", b: 1 },
  { text: "OUTPUT \"Up \", n  (written after CALL Show(n - 1))", b: 2 }, { text: "IF LENGTH(s) <= 1 THEN RETURN s", b: 0 }, { text: "Multiplying n by the value that Fact(n - 1) handed back", b: 2 },
  { text: "RETURN Fib(n - 1) + Fib(n - 2)", b: 1 }, { text: "OUTPUT \"Down \", n  (written before CALL Show(n - 1))", b: 1 }, { text: "RETURN a   (in Gcd, when b = 0)", b: 0 },
], done: "Base case stops it, general case calls with a smaller problem, and anything after the call waits until unwinding." });

Lib.classify($("#cl2"), { prompt: "What happens when each function is called with the input shown?", buckets: [{ label: "Works correctly" }, { label: "Stack overflow (never stops)" }, { label: "Runs but gives a wrong answer" }], items: [
  { text: "Fact(n) with base case n = 0 returning 1, called as Fact(5)", b: 0 }, { text: "Fact(n) with base case n = 0, called as Fact(-3)", b: 1 }, { text: "Fact with base case n = 0 returning 0 (not 1), called as Fact(4)", b: 2 },
  { text: "Sum(n): no IF test at all, just RETURN n + Sum(n - 1)", b: 1 }, { text: "Sum(n) with base case n = 0 returning 0, called as Sum(10)", b: 0 }, { text: "Count(n) calls Count(n + 1) with base case n = 0, called as Count(3)", b: 1 },
  { text: "Power(b, e) with base case e = 0 returning 0, called as Power(2, 3)", b: 2 }, { text: "Gcd(a, b) with base case b = 0 returning a, called as Gcd(48, 18)", b: 0 },
], done: "Missing or unreachable base cases overflow the stack; a wrong base value gives a wrong answer." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Recursion", "A subroutine that is defined in terms of itself and calls itself"], ["Base case", "The condition where the answer is known and no further call is made"], ["General case", "The part that calls the subroutine again with a smaller or simpler problem"],
  ["Winding", "The phase where calls are made and frames are pushed"], ["Unwinding", "The phase after the base case where values return and frames are popped"], ["Stack frame", "Holds parameters, local variables and the return address for one call"],
  ["Return address", "Where execution resumes in the caller once the call finishes"], ["Stack overflow", "Error when the call stack runs out of memory, often from a missing base case"],
] });

Lib.order($("#o1"), { prompt: "Show(2) is called. Put the output in the order it appears on screen.", items: ["Down 2", "Down 1", "Done", "Up 1", "Up 2"], done: "Down on the way in, Done at the base, then Up in reverse order." });
Lib.order($("#o2"), { prompt: "Put these events in the order they happen for Fact(2).", items: ["Fact(2) called: frame pushed", "Fact(1) called: frame pushed", "Fact(0) called: frame pushed, base case reached", "Fact(0) returns 1 and its frame is popped", "Fact(1) works out 1 × 1 = 1 and returns", "Fact(2) works out 2 × 1 = 2 and returns"], done: "Calls wind down to the base case, then each return unwinds in reverse." });

Lib.calc($("#c1"), { qs: [
  { q: "Fact(n) returns 1 when n = 0, otherwise n × Fact(n − 1). What does Fact(5) return?", a: 120, hint: "5 × 4 × 3 × 2 × 1 × Fact(0).", sol: "Fact(0) = 1, Fact(1) = 1, Fact(2) = 2, Fact(3) = 6, Fact(4) = 24, Fact(5) = <b>120</b>." },
  { q: "How many calls to Fact are made in total when Fact(5) is called (include the base case call)?", a: 6, hint: "One call for each of n = 5, 4, 3, 2, 1, 0.", sol: "Fact(5), 4, 3, 2, 1 and 0: <b>6</b> calls." },
  { q: "At the deepest point of Fact(5), how many stack frames exist at the same time?", a: 6, hint: "No frame has been popped until the base case returns.", sol: "Every call is still waiting when Fact(0) runs, so <b>6</b> frames." },
  { q: "Sum(n) returns 0 when n = 0, otherwise n + Sum(n − 1). What does Sum(6) return?", a: 21, hint: "6 + 5 + 4 + 3 + 2 + 1 + 0.", sol: "Sum(6) = 6 + 5 + 4 + 3 + 2 + 1 + 0 = <b>21</b>." },
  { q: "Power(b, e) returns 1 when e = 0, otherwise b × Power(b, e − 1). What does Power(2, 5) return?", a: 32, hint: "2 × 2 × 2 × 2 × 2.", sol: "<b>32</b>. Five multiplications happen on the way back up." },
  { q: "Fib(n) returns n when n ≤ 1, otherwise Fib(n − 1) + Fib(n − 2). What does Fib(6) return?", a: 8, hint: "0, 1, 1, 2, 3, 5, 8.", sol: "Fib(2) = 1, Fib(3) = 2, Fib(4) = 3, Fib(5) = 5, Fib(6) = <b>8</b>." },
  { q: "How many calls are made in total when Fib(4) is called?", a: 9, hint: "Count the nodes of the call tree: calls(n) = 1 + calls(n − 1) + calls(n − 2), with calls(0) = calls(1) = 1.", sol: "calls(2) = 3, calls(3) = 5, calls(4) = 1 + 5 + 3 = <b>9</b>." },
  { q: "Gcd(a, b) returns a when b = 0, otherwise Gcd(b, a MOD b). What does Gcd(48, 18) return?", a: 6, hint: "(48, 18) → (18, 12) → (12, 6) → (6, 0).", sol: "48 MOD 18 = 12, 18 MOD 12 = 6, 12 MOD 6 = 0, so the base case gives a = <b>6</b>." },
  { q: "DigitSum(n) returns 0 when n = 0, otherwise (n MOD 10) + DigitSum(n DIV 10). What does DigitSum(472) return?", a: 13, hint: "472 MOD 10 = 2, then 47 MOD 10 = 7, then 4.", sol: "2 + 7 + 4 + 0 = <b>13</b>." },
  { q: "How many moves does a Towers of Hanoi solution need for 5 discs? (2ⁿ − 1)", a: 31, hint: "2⁵ = 32.", sol: "2⁵ − 1 = <b>31</b> moves." },
  { q: "M(n) returns 0 when n ≤ 0, otherwise 2 + M(n − 1). What does M(4) return?", a: 8, hint: "Four calls each add 2, then the base case adds 0.", sol: "M(0) = 0, M(1) = 2, M(2) = 4, M(3) = 6, M(4) = <b>8</b>." },
  { q: "R(n) outputs n then calls R(n − 1) only if n > 1. R(3) is called. How many numbers are printed in total?", a: 3, hint: "3, then 2, then 1, then stop.", sol: "Prints 3, 2, 1: <b>3</b> values." },
] });

Lib.quiz($("#qz1"), { qs: [
  { q: "Which two features must every correct recursive subroutine have?", opts: ["A loop and a counter", "A base case and a call to itself", "An array and an index", "Two parameters"], a: 1, why: "A base case stops the recursion and the general case calls the subroutine again with a simpler problem." },
  { q: "What causes a stack overflow in a recursive function?", opts: ["Too many local variables in main", "The base case is never reached", "Using an integer parameter", "Returning a value"], a: 1, why: "If the base case is missing or unreachable the calls never stop, frames keep being pushed and the stack runs out of space." },
  { q: "What is stored in a stack frame for a recursive call?", opts: ["Only the return value", "Parameters, local variables and the return address", "The whole program", "Only the base case"], a: 1, why: "Each call needs its own copy of the parameters and local variables, and the return address so it knows where to resume." },
  { q: "In Show(n), OUTPUT \"Up\", n is placed after CALL Show(n − 1). When does it run?", opts: ["Before the call, going down", "During unwinding, after the call returns", "Never", "Only in the base case"], a: 1, why: "Anything after the recursive call waits until that call finishes, so it runs while unwinding." },
  { q: "Fact(3) is called. What is the largest number of Fact frames on the stack at once (base case n = 0)?", opts: ["3", "4", "6", "1"], a: 1, why: "Fact(3), Fact(2), Fact(1) and Fact(0) are all on the stack together." },
  { q: "Which data structure does the computer use to manage recursive calls?", opts: ["Queue", "Stack", "Binary tree", "Linked list"], a: 1, why: "Last in, first out: the most recent call must finish first, so a stack is used." },
  { q: "What is the main advantage of recursion over iteration for tree traversal?", opts: ["It is always faster", "The code is shorter and mirrors the structure of the problem", "It uses less memory", "It needs no base case"], a: 1, why: "Recursive code often matches the definition (left subtree, node, right subtree) and is easier to write correctly. It is not faster and it uses more memory." },
  { q: "Which is a drawback of recursion?", opts: ["It cannot return a value", "Each call uses stack memory, so deep recursion can overflow", "It cannot be traced", "It cannot use parameters"], a: 1, why: "Every call adds a frame to the stack. Iteration with a loop needs no such frames." },
  { q: "Why is a recursive Fibonacci function inefficient for large n?", opts: ["It has no base case", "It repeats the same calculations many times", "It uses a loop", "It uses global variables"], a: 1, why: "Fib(n − 1) and Fib(n − 2) overlap, so the same values are recomputed again and again." },
  { q: "A function Count(n) has base case n = 0 and calls Count(n + 1). It is called with n = 5. What happens?", opts: ["Counts down to 0", "Stack overflow", "Returns 0", "Syntax error"], a: 1, why: "n moves away from the base case, so it is never reached." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Recursion", "A technique where a subroutine is defined in terms of itself and calls itself, each time with a simpler problem."], ["Base case", "The condition for which the answer is known and no further recursive call is made. It stops the recursion."],
  ["General case", "The part of the definition that calls the subroutine again with a smaller or simpler value."], ["Winding", "The phase where recursive calls are made and stack frames are pushed, down to the base case."],
  ["Unwinding", "The phase after the base case where each call returns, frames are popped and waiting calculations are completed."], ["Stack frame", "The block of memory for one call, holding parameters, local variables and the return address."],
  ["Return address", "The address of the instruction to carry on from when a call finishes."], ["Call stack", "The LIFO structure that stores the frames of active subroutine calls."],
  ["Stack overflow", "A run-time error when the call stack has no space left, usually from infinite recursion."], ["Iteration", "Repeating code with a loop (FOR, WHILE, REPEAT) instead of calling a subroutine again."],
  ["Direct recursion", "A subroutine that calls itself."], ["Indirect recursion", "A subroutine calls another one which then calls the first again."],
  ["Divide and conquer", "Solving a problem by splitting it into smaller copies of the same problem, e.g. binary search."], ["Terminating condition", "Another name for the base case."],
] });
