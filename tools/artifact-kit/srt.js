const BUB_PS = ["n ← N", "REPEAT", "   Swapped ← FALSE", "   FOR i ← 0 TO n - 2", "      IF Data[i] > Data[i + 1] THEN", "         Temp ← Data[i]", "         Data[i] ← Data[i + 1]", "         Data[i + 1] ← Temp", "         Swapped ← TRUE", "      ENDIF", "   NEXT i", "   n ← n - 1", "UNTIL Swapped = FALSE"];
const BUB_PY = ["n = len(data)", "swapped = True", "while swapped:", "    swapped = False", "    for i in range(n - 1):", "        if data[i] > data[i + 1]:", "            data[i], data[i + 1] = data[i + 1], data[i]", "            swapped = True", "    n -= 1"];
const INS_PS = ["FOR i ← 1 TO N - 1", "   Key ← Data[i]", "   j ← i - 1", "   WHILE j >= 0 AND Data[j] > Key", "      Data[j + 1] ← Data[j]", "      j ← j - 1", "   ENDWHILE", "   Data[j + 1] ← Key", "NEXT i"];
const INS_PY = ["for i in range(1, len(data)):", "    key = data[i]", "    j = i - 1", "    while j >= 0 and data[j] > key:", "        data[j + 1] = data[j]", "        j -= 1", "    data[j + 1] = key"];

const SW = 640, SIZE = 5, CW = 64, CG = 8, CX = (SW - (SIZE * CW + (SIZE - 1) * CG)) / 2;
function sview(arr, o) {
  let s = SV.text(14, 26, o.title, "lbl bd", { "text-anchor": "start" });
  s += SV.text(SW - 14, 26, `Comparisons: ${o.c}   ${o.swl}: ${o.s}`, "lbl bd t4", { "text-anchor": "end" });
  if (o.pass) s += SV.text(14, 50, o.pass, "lbl", { "text-anchor": "start" });
  s += Lib.cells(arr, { x0: CX, y: 118, w: CW, h: 52, gap: CG, cls: o.cls, ptr: o.ptr, dim: o.dim });
  if (o.key) { const x = CX + o.key.pos * (CW + CG); s += SV.rect(x, 52, CW, 52, "cell cell-warn", { rx: 8 }) + SV.text(x + CW / 2, 86, o.key.val, "lbl bd", { "text-anchor": "middle", style: "font-size:22px;font-family:var(--mono)" }) + SV.text(x + CW / 2 + 0, 46, "key", "sm bd t4", { "text-anchor": "middle" }); }
  if (o.note) s += SV.text(SW / 2, 232, o.note, "lbl bd " + (o.nc || ""), { "text-anchor": "middle" });
  return s;
}

function bubFrames(data) {
  const a = [...data], N = a.length, F = [];
  let c = 0, sw = 0, n = N, pass = 0, swapped;
  const tail = () => { const m = {}; for (let k = n; k < N; k++) m[k] = "sorted"; return m; };
  const f = (cap, ps, py, o = {}) => F.push({ cap, ps, py, svg: sview([...a], { title: "Bubble sort", c, s: sw, swl: "Swaps", pass: pass ? `Pass ${pass}` : "", ...o, cls: { ...tail(), ...(o.cls || {}) } }) });
  f(`The array has N = ${N} items, so n = ${n}. Nothing is sorted yet.`, [0], [0, 1]);
  do {
    pass++; swapped = false;
    f(`<b>Pass ${pass}.</b> Set Swapped to FALSE. We will compare neighbours from index 0 to ${n - 2}.`, [1, 2], [2, 3]);
    for (let i = 0; i < n - 1; i++) {
      c++;
      const bad = a[i] > a[i + 1];
      f(`Compare ${a[i]} and ${a[i + 1]}. ${bad ? `${a[i]} &gt; ${a[i + 1]}, so they are in the wrong order.` : `${a[i]} is not greater than ${a[i + 1]}, so leave them.`}`, [3, 4], [4, 5], { cls: { [i]: "cur", [i + 1]: "cur" }, ptr: { [i]: "i" } });
      if (bad) {
        [a[i], a[i + 1]] = [a[i + 1], a[i]]; sw++; swapped = true;
        f(`Swap them using Temp. Swapped is now TRUE.`, [5, 6, 7, 8], [6, 7], { cls: { [i]: "warn", [i + 1]: "warn" }, ptr: { [i]: "i" } });
      }
    }
    n--;
    if (swapped) f(`End of pass ${pass}. <b>${a[n]}</b> has bubbled to its final place. n ← ${n}. Swapped is TRUE, so repeat.`, [10, 11, 12], [8, 2], { note: "Swaps happened: another pass needed" });
    else f(`End of pass ${pass}. <b>No swaps were made</b>, so Swapped is FALSE and the array is in order. Stop.`, [10, 11, 12], [8, 2], { cls: Object.fromEntries(a.map((_, k) => [k, "sorted"])), note: `Sorted: ${a.join(", ")}`, nc: "t3" });
  } while (swapped);
  return F;
}

function insFrames(data) {
  const a = [...data], N = a.length, F = [];
  let c = 0, sh = 0;
  const f = (cap, ps, py, o = {}) => F.push({ cap, ps, py, svg: sview(o.arr || [...a], { title: "Insertion sort", c, s: sh, swl: "Shifts", ...o }) });
  const sorted = (upto) => Object.fromEntries(Array.from({ length: upto + 1 }, (_, k) => [k, "sorted"]));
  f("The first item is treated as a sorted section. Start with i = 1.", [0], [0], { cls: { 0: "sorted" } });
  for (let i = 1; i < N; i++) {
    const key = a[i]; let j = i - 1; const w = [...a]; w[i] = null;
    f(`<b>i = ${i}.</b> Key = ${key}. Lift it out, leaving a gap. j = ${j}.`, [0, 1, 2], [0, 1, 2], { arr: [...w], key: { pos: i, val: key }, cls: sorted(i - 1), pass: `i = ${i}` });
    while (j >= 0) {
      c++;
      if (w[j] > key) {
        f(`Is Data[${j}] &gt; key? ${w[j]} &gt; ${key}, so yes. Shift ${w[j]} one place right.`, [3], [3], { arr: [...w], key: { pos: j + 1, val: key }, cls: { ...sorted(i - 1), [j]: "cur" }, pass: `i = ${i}` });
        w[j + 1] = w[j]; w[j] = null; sh++; j--;
        f(`${w[j + 2]} shifted right. j ← ${j}.`, [4, 5], [4, 5], { arr: [...w], key: { pos: j + 1, val: key }, cls: { [j + 2]: "warn" }, pass: `i = ${i}` });
      } else {
        f(`Is Data[${j}] &gt; key? ${w[j]} &gt; ${key} is false, so stop shifting.`, [3], [3], { arr: [...w], key: { pos: j + 1, val: key }, cls: { ...sorted(i - 1), [j]: "cur" }, pass: `i = ${i}` });
        break;
      }
    }
    if (j < 0) f(`j is ${j}: the start of the array has been reached, so stop shifting.`, [3], [3], { arr: [...w], key: { pos: 0, val: key }, pass: `i = ${i}` });
    w[j + 1] = key; a.splice(0, N, ...w);
    f(`Insert the key: Data[${j + 1}] ← ${key}. The first ${i + 1} items are now sorted.`, [7], [6], { cls: sorted(i), pass: `i = ${i}`, ...(i === N - 1 ? { note: `Sorted: ${a.join(", ")}`, nc: "t3" } : {}) });
  }
  return F;
}

const WATCH_DATA = [5, 2, 9, 1, 7];
Lib.algo($("#aBub"), { w: SW, h: 250, label: "Bubble sort animation", pseudo: BUB_PS, py: BUB_PY, dwell: 1700, frames: bubFrames(WATCH_DATA) });
Lib.algo($("#aIns"), { w: SW, h: 250, label: "Insertion sort animation", pseudo: INS_PS, py: INS_PY, dwell: 1900, frames: insFrames(WATCH_DATA) });

/* ---------- counting versions for the race ---------- */
function bubCount(d) { const a = [...d]; let n = a.length, c = 0, s = 0, sw, p = 0; do { sw = false; p++; for (let i = 0; i < n - 1; i++) { c++; if (a[i] > a[i + 1]) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; s++; sw = true; } } n--; } while (sw); return { c, s, p }; }
function insCount(d) { const a = [...d]; let c = 0, s = 0; for (let i = 1; i < a.length; i++) { const k = a[i]; let j = i - 1; while (j >= 0) { c++; if (a[j] > k) { a[j + 1] = a[j]; s++; j--; } else break; } a[j + 1] = k; } return { c, s }; }

/* ---------- Lab 1: race ---------- */
(() => {
  const el = $("#race"), sel = $("#rKind"), N = 12;
  const mk = (k) => {
    const s = new Set(); while (s.size < N) s.add(1 + Math.floor(Math.random() * 99));
    let a = [...s];
    if (k === "rand") return a;
    a.sort((x, y) => x - y);
    if (k === "rev") return a.reverse();
    if (k === "near") { for (let t = 0; t < 2; t++) { const i = Math.floor(Math.random() * (N - 1)); [a[i], a[i + 1]] = [a[i + 1], a[i]]; } }
    return a;
  };
  let data = mk(sel.value);
  const draw = () => {
    const b = bubCount(data), i = insCount(data), top = Math.max(b.c, i.c, b.s, i.s, 1), pct = (v) => Math.max(1, Math.round((v / top) * 100)) + "%";
    const verdict = i.c < b.c ? `Insertion sort needed ${b.c - i.c} fewer comparisons (${i.c} against ${b.c}).` : i.c === b.c ? "Both needed the same number of comparisons." : `Bubble sort needed fewer comparisons here.`;
    el.innerHTML = `<div class="listrow">${data.join(", ")}</div>
      <div class="bars"><small>Bubble · compares</small><div><div class="bar b2" style="width:${pct(b.c)}"></div></div><strong>${b.c}</strong>
      <small>Insertion · compares</small><div><div class="bar b3" style="width:${pct(i.c)}"></div></div><strong>${i.c}</strong>
      <small>Bubble · swaps</small><div><div class="bar b2" style="width:${pct(b.s)};opacity:.6"></div></div><strong>${b.s}</strong>
      <small>Insertion · shifts</small><div><div class="bar b3" style="width:${pct(i.s)};opacity:.6"></div></div><strong>${i.s}</strong></div>
      <div class="verdict">${verdict} Bubble sort took ${b.p} pass${b.p > 1 ? "es" : ""}. Swaps and shifts match because each one fixes exactly one out-of-order pair.</div>`;
  };
  sel.onchange = () => { data = mk(sel.value); draw(); };
  $("#rNew").onclick = () => { data = mk(sel.value); draw(); };
  draw();
})();

/* ---------- Lab 2: growth ---------- */
(() => {
  const fmt = (n) => n.toLocaleString("en-GB");
  const sz = (v) => Math.max(2, Math.round(10 ** (0.3 + v / 60 * 3.7)));
  let g;
  g = Lib.slider($("#gs"), { id: "gn", label: "Number of items (n)", min: 0, max: 60, step: 1, value: 20, fmt: (v) => fmt(sz(v)), onInput: upd });
  function upd() {
    if (!g) return;
    const n = sz(g.get()), w = (n * (n - 1)) / 2, b = n - 1;
    $("#vw").textContent = fmt(w); $("#vbst").textContent = fmt(b);
    $("#bw").style.width = "100%"; $("#bbst").style.width = Math.max(0.4, (b / w) * 100) + "%";
    $("#gv").textContent = `For ${fmt(n)} items the worst case is ${fmt(w)} comparisons. Double the items to ${fmt(n * 2)} and it becomes ${fmt((n * 2 * (n * 2 - 1)) / 2)}, about four times as many.`;
  }
  upd();
})();

/* ---------- Lab 3: be the bubble sort ---------- */
(() => {
  const el = $("#game"); let a, i, n, pass, swapped, c, s, done, msgTxt, good;
  function init() { const set = new Set(); while (set.size < 6) set.add(1 + Math.floor(Math.random() * 20)); a = [...set]; i = 0; n = 6; pass = 1; swapped = false; c = 0; s = 0; done = false; msgTxt = "Compare the highlighted pair."; good = true; draw(); }
  function draw() {
    const W = 560, w = 56, gap = 8, x0 = (W - (6 * w + 5 * gap)) / 2, cls = {};
    for (let k = n; k < 6; k++) cls[k] = "sorted";
    if (done) a.forEach((_, k) => (cls[k] = "sorted")); else { cls[i] = "cur"; cls[i + 1] = "cur"; }
    const svg = `<svg viewBox="0 0 ${W} 150" role="img" aria-label="Bubble sort game">${SV.text(14, 24, `Pass ${pass}`, "lbl bd", { "text-anchor": "start" })}${SV.text(W - 14, 24, `Comparisons: ${c}   Swaps: ${s}`, "lbl bd t4", { "text-anchor": "end" })}${Lib.cells(a, { x0, y: 46, w, h: 50, gap, cls, ptr: done ? {} : { [i]: "i" } })}</svg>`;
    el.innerHTML = svg + (done ? "" : `<p>Is <b>${a[i]}</b> greater than <b>${a[i + 1]}</b>?</p><div class="gbtn"><button class="b pri" data-g="s">Swap them</button><button class="b" data-g="l">Leave them</button></div>`) + `<div class="msg" style="color:var(--${good ? "good" : "bad"})" aria-live="polite">${msgTxt}</div><div class="gbtn"><button class="b" data-g="n">New list</button></div>`;
    $$("[data-g]", el).forEach((b) => (b.onclick = () => act(b.dataset.g)));
  }
  function act(k) {
    if (k === "n") return init();
    const bad = a[i] > a[i + 1];
    if ((k === "s") !== bad) { good = false; msgTxt = bad ? `Not quite. ${a[i]} is greater than ${a[i + 1]}, so they must be swapped.` : `Not quite. ${a[i]} is not greater than ${a[i + 1]}, so leave them alone.`; return draw(); }
    c++; good = true;
    if (bad) { [a[i], a[i + 1]] = [a[i + 1], a[i]]; s++; swapped = true; }
    msgTxt = bad ? "Correct, swapped." : "Correct, left.";
    i++;
    if (i >= n - 1) {
      n--;
      if (!swapped) { done = true; msgTxt = `Sorted after ${pass} passes, ${c} comparisons and ${s} swaps. The final pass made no swaps, which is how bubble sort knows to stop.`; }
      else { msgTxt = `End of pass ${pass}. The biggest remaining item is in its final place. Start pass ${pass + 1}.`; pass++; i = 0; swapped = false; if (n < 2) { done = true; msgTxt = `Sorted after ${c} comparisons and ${s} swaps.`; } }
    }
    draw();
  }
  init();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each statement to the sort it describes.", buckets: [{ label: "Bubble sort" }, { label: "Insertion sort" }, { label: "Both" }], items: [
  { text: "Compares adjacent items and swaps if out of order", b: 0 }, { text: "Shifts larger items right to make a gap", b: 1 }, { text: "Uses a Swapped flag to stop early", b: 0 },
  { text: "Builds a sorted section growing from the left", b: 1 }, { text: "Worst case n(n − 1) / 2 comparisons", b: 2 }, { text: "After each pass the largest unsorted item is final", b: 0 },
  { text: "Sorts in place without a second array", b: 2 }, { text: "Takes a key and inserts it into position", b: 1 }, { text: "O(n²) in the worst case", b: 2 }, { text: "Needs a Temp variable to swap two items", b: 0 },
], done: "Bubble sort swaps neighbours; insertion sort shifts and inserts. Both are quadratic." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Pass", "One complete trip through the unsorted part of the array"], ["Swapped flag", "A Boolean that records whether a swap happened during a pass"], ["Key", "The item being inserted into the sorted section"],
  ["Temp", "A variable that holds a value while two items are swapped"], ["In place", "The array is sorted without needing a second copy"], ["n(n − 1) / 2", "Worst-case comparisons for both sorts"],
] });

Lib.order($("#o1"), { prompt: "Put the steps of an insertion sort in the right order.", items: [
  "Treat the first item as a sorted section", "Take the next unsorted item as the key", "Compare the key with the sorted item on its left", "While that item is larger than the key, shift it one place right",
  "Stop when a smaller item or the start of the array is reached", "Put the key into the gap", "Repeat for every remaining item",
], done: "Take the key, shift larger items, insert." });

Lib.calc($("#c1"), { qs: [
  { q: "List: 6, 2, 8, 3. After one pass of a bubble sort, what value is at index 1?", a: 6, hint: "6,2 swap → 2,6,8,3. 6,8 no swap. 8,3 swap → 2,6,3,8.", sol: "After pass 1 the list is 2, 6, 3, 8. Index 1 holds <b>6</b>." },
  { q: "How many comparisons does a bubble sort (no early stop) make to sort 8 items?", a: 28, hint: "n(n − 1) / 2.", sol: "8 × 7 / 2 = <b>28</b>." },
  { q: "List: 3, 7, 2, 9. Insertion sort, i = 2, key = 2. How many items are shifted right?", a: 2, hint: "Both 7 and 3 are larger than 2.", sol: "7 shifts, then 3 shifts, then j reaches −1. <b>2</b> shifts." },
  { q: "How many swaps does a bubble sort make to sort 3, 2, 1?", a: 3, hint: "Pass 1: 2,3,1 then 2,1,3. Pass 2: 1,2,3.", sol: "Pass 1 has 2 swaps, pass 2 has 1 swap: <b>3</b> swaps." },
  { q: "An insertion sort is given 20 items that are already in order. How many comparisons does it make?", a: 19, hint: "Each key is compared once with its left neighbour.", sol: "i runs from 1 to 19, one comparison each: <b>19</b>." },
  { q: "Bubble sort with a Swapped flag sorts 2, 1, 3, 4, 5. How many passes does it make (including the final check)?", a: 2, hint: "Pass 1 swaps 2 and 1. Pass 2 has no swaps.", sol: "Pass 1: swap → 1,2,3,4,5. Pass 2: no swaps, so stop. <b>2</b> passes." },
  { q: "List: 9, 4, 7, 1. Insertion sort. After i = 2 has finished, what value is at index 1?", a: 7, hint: "i = 1 gives 4, 9, 7, 1. Then key 7 passes 9.", sol: "After i = 1: 4, 9, 7, 1. After i = 2: 4, 7, 9, 1. Index 1 is <b>7</b>." },
] });

Lib.quiz($("#qz1"), { qs: [
  { q: "After the first pass of a bubble sort on 4, 9, 2, 6, which value is certain to be in its final place?", opts: ["4", "9", "2", "6"], a: 1, why: "The largest value bubbles to the end on the first pass." },
  { q: "What does the Swapped flag tell a bubble sort?", opts: ["Which items to swap next", "Whether any swap happened in the last pass", "The number of passes left", "The index of the largest item"], a: 1, why: "If a whole pass makes no swaps, the array is sorted, so the sort can stop." },
  { q: "Which sort uses a key and shifts items to the right?", opts: ["Bubble sort", "Insertion sort", "Binary search", "Linear search"], a: 1, why: "Insertion sort lifts out the key, shifts larger items right, then inserts the key into the gap." },
  { q: "An array of 10 items is already sorted. How many comparisons does a bubble sort with a Swapped flag make?", opts: ["1", "9", "10", "45"], a: 1, why: "One pass of 9 comparisons finds no swaps, so it stops." },
  { q: "What is the worst-case number of comparisons for n items in either sort?", opts: ["n", "2n", "n(n − 1) / 2", "log₂ n"], a: 2, why: "(n − 1) + (n − 2) + … + 1 = n(n − 1) / 2, an O(n²) order of growth." },
  { q: "Which list is bubble sort with a Swapped flag fastest on?", opts: ["Reverse order", "Random order", "Already sorted", "All are equally fast"], a: 2, why: "A sorted list needs only one pass with no swaps. Reverse order is the worst case." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Sorting algorithm", "A method that puts items into order, e.g. ascending."], ["Bubble sort", "Repeatedly passes through the array swapping adjacent items that are out of order, until a pass makes no swaps."],
  ["Insertion sort", "Takes each item in turn and inserts it into its correct place in the sorted section on its left."], ["Pass", "One complete trip through the unsorted part of the array."],
  ["Swapped flag", "A Boolean set TRUE when a swap happens; if FALSE after a pass the array is sorted."], ["Key", "The item taken from the array and inserted into position during an insertion sort."],
  ["Temp", "A temporary variable used to hold a value while two items are swapped."], ["In place", "Sorting that uses the original array, with no second array of the same size."],
  ["Best case", "Already sorted data: n − 1 comparisons for both sorts (bubble sort with a Swapped flag)."], ["Worst case", "Reverse order data: n(n − 1) / 2 comparisons, an O(n²) order of growth."],
] });
