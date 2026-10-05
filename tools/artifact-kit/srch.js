const LIST = [3, 8, 14, 21, 27, 33, 42, 56, 61, 75];
const BIG = [4, 9, 15, 22, 28, 35, 41, 47, 53, 60, 68, 74, 81, 90, 97];

const LIN_PS = ["Found ← FALSE", "Index ← 0", "WHILE Index < N AND Found = FALSE", "   IF Data[Index] = Target THEN", "      Found ← TRUE", "   ELSE", "      Index ← Index + 1", "   ENDIF", "ENDWHILE", "IF Found THEN", '   OUTPUT "Found at ", Index', "ELSE", '   OUTPUT "Not found"', "ENDIF"];
const LIN_PY = ["found = False", "index = 0", "while index < len(data) and not found:", "    if data[index] == target:", "        found = True", "    else:", "        index += 1", "if found:", '    print("Found at", index)', "else:", '    print("Not found")'];
const BIN_PS = ["Low ← 0", "High ← N - 1", "Found ← FALSE", "WHILE Low <= High AND Found = FALSE", "   Mid ← (Low + High) DIV 2", "   IF Data[Mid] = Target THEN", "      Found ← TRUE", "   ELSE", "      IF Data[Mid] < Target THEN", "         Low ← Mid + 1", "      ELSE", "         High ← Mid - 1", "      ENDIF", "   ENDIF", "ENDWHILE", "IF Found THEN", '   OUTPUT "Found at ", Mid', "ELSE", '   OUTPUT "Not found"', "ENDIF"];
const BIN_PY = ["low = 0", "high = len(data) - 1", "found = False", "while low <= high and not found:", "    mid = (low + high) // 2", "    if data[mid] == target:", "        found = True", "    elif data[mid] < target:", "        low = mid + 1", "    else:", "        high = mid - 1", "if found:", '    print("Found at", mid)', "else:", '    print("Not found")'];

/* one svg frame: cells + status + comparison counter */
function view(data, W, o) {
  const n = data.length, gap = 5, w = Math.min(56, Math.floor((W - 30 - (n - 1) * gap) / n)), tot = n * w + (n - 1) * gap;
  let s = SV.text(14, 26, o.title || "", "lbl bd", { "text-anchor": "start" });
  s += SV.text(W - 14, 26, "Comparisons: " + o.count, "lbl bd t4", { "text-anchor": "end" });
  s += SV.text(14, 52, "Target: " + o.target, "lbl", { "text-anchor": "start" });
  s += Lib.cells(data, { x0: (W - tot) / 2, y: 84, w, h: w > 40 ? 48 : 40, gap, cls: o.cls, dim: o.dim, ptr: o.ptr });
  if (o.note) s += SV.text(W / 2, 210, o.note, "lbl bd " + (o.nc || ""), { "text-anchor": "middle" });
  return s;
}
const range = (a, b) => { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; };

function linFrames(data, t, W) {
  const n = data.length, F = [], base = { target: t, cls: {}, dim: [] };
  let c = 0, checked = {};
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: view(data, W, { ...base, title: "Linear search", count: c, ...o }) });
  f("Set <b>found</b> to FALSE and <b>index</b> to 0. We will start at the first item.", [0, 1], [0, 1], { ptr: { 0: "index" } });
  for (let i = 0; i < n; i++) {
    c++;
    f(`Is Data[${i}] = ${t}? Data[${i}] is <b>${data[i]}</b>.`, [2, 3], [2, 3], { cls: { ...checked, [i]: "cur" }, ptr: { [i]: "index" } });
    if (data[i] === t) {
      f(`<b>${data[i]} = ${t}.</b> Found is set to TRUE, so the loop will stop.`, [4], [4], { cls: { ...checked, [i]: "ok" }, ptr: { [i]: "index" }, note: `Found after ${c} comparison${c > 1 ? "s" : ""}`, nc: "t3" });
      f(`Output the position: <b>${t} is at index ${i}</b>.`, [9, 10], [7, 8], { cls: { ...checked, [i]: "ok" }, ptr: { [i]: "index" }, note: `Found at index ${i}`, nc: "t3" });
      return F;
    }
    checked[i] = "no";
    if (i < n - 1) f(`Not equal. Add 1 to index and check the next item.`, [6], [6], { cls: { ...checked }, ptr: { [i + 1]: "index" } });
  }
  f(`Index has reached the end of the list (index = ${n}). The loop condition fails.`, [2], [2], { cls: { ...checked } });
  f(`Found is still FALSE, so output <b>Not found</b>. All ${n} items were checked.`, [11, 12], [9, 10], { cls: { ...checked }, note: `Not found after ${c} comparisons`, nc: "t2" });
  return F;
}

function binFrames(data, t, W) {
  const n = data.length, F = [], base = { target: t };
  let c = 0, lo = 0, hi = n - 1, dead = new Set();
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: view(data, W, { ...base, title: "Binary search", count: c, dim: [...dead], ...o }) });
  f(`Low is the first index (0), High is the last (${n - 1}). Nothing has been ruled out yet.`, [0, 1, 2], [0, 1, 2], { ptr: { [lo]: "L", [hi]: "H" } });
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2), ptr = {};
    ptr[lo] = "L"; ptr[mid] = ptr[mid] ? ptr[mid] + ",M" : "M"; ptr[hi] = ptr[hi] ? ptr[hi] + ",H" : "H";
    if (lo === mid && hi === mid) ptr[mid] = "L,M,H"; else if (lo === mid) ptr[mid] = "L,M"; else if (hi === mid) ptr[mid] = "M,H";
    f(`Mid = (${lo} + ${hi}) DIV 2 = <b>${mid}</b>. Data[${mid}] is <b>${data[mid]}</b>.`, [3, 4], [3, 4], { cls: { [mid]: "cur" }, ptr, note: `${hi - lo + 1} item${hi - lo ? "s" : ""} still in play` });
    c++;
    if (data[mid] === t) {
      f(`<b>${data[mid]} = ${t}.</b> Found, after ${c} comparison${c > 1 ? "s" : ""}.`, [5, 6], [5, 6], { cls: { [mid]: "ok" }, ptr: { [mid]: "M" }, note: `Found at index ${mid}`, nc: "t3" });
      f(`Output the position: <b>${t} is at index ${mid}</b>.`, [15, 16], [11, 12], { cls: { [mid]: "ok" }, ptr: { [mid]: "M" }, note: `Found at index ${mid}`, nc: "t3" });
      return F;
    }
    if (data[mid] < t) {
      range(lo, mid).forEach((i) => dead.add(i));
      f(`${data[mid]} &lt; ${t}, so the target must be <b>above</b> the middle. Low ← ${mid} + 1 = <b>${mid + 1}</b>. The lower half is discarded.`, [5, 8, 9], [5, 7, 8], { cls: { [mid]: "no" }, ptr: mid + 1 <= hi ? { [mid + 1]: "L", [hi]: mid + 1 === hi ? "L,H" : "H" } : {} });
      lo = mid + 1;
    } else {
      range(mid, hi).forEach((i) => dead.add(i));
      f(`${data[mid]} &gt; ${t}, so the target must be <b>below</b> the middle. High ← ${mid} - 1 = <b>${mid - 1}</b>. The upper half is discarded.`, [5, 8, 10, 11], [5, 7, 9, 10], { cls: { [mid]: "no" }, ptr: mid - 1 >= lo ? { [lo]: lo === mid - 1 ? "L,H" : "L", [mid - 1]: lo === mid - 1 ? "L,H" : "H" } : {} });
      hi = mid - 1;
    }
  }
  f(`Low (${lo}) is now greater than High (${hi}), so no items are left to check. The loop ends.`, [3], [3], { note: "Nothing left to search" });
  f(`Found is still FALSE, so output <b>Not found</b>, after ${c} comparison${c > 1 ? "s" : ""}.`, [17, 18], [13, 14], { note: `Not found after ${c} comparisons`, nc: "t2" });
  return F;
}

/* ---------- Watch ---------- */
Lib.algo($("#aLin"), { w: 640, h: 250, label: "Linear search animation", pseudo: LIN_PS, py: LIN_PY, dwell: 1900, frames: linFrames(LIST, 56, 640) });
Lib.algo($("#aBin"), { w: 640, h: 250, label: "Binary search animation", pseudo: BIN_PS, py: BIN_PY, dwell: 2600, frames: binFrames(LIST, 33, 640) });
Lib.algo($("#aMiss"), { w: 640, h: 250, label: "Binary search for a missing value", pseudo: BIN_PS, py: BIN_PY, dwell: 2600, frames: binFrames(LIST, 40, 640) });

/* ---------- Lab 1 ---------- */
(() => {
  const tar = $("#lTar"), alg = $("#lAlg");
  const opts = [...BIG.map((v) => [v, v]), [-1, "40 (not in list)"]];
  tar.innerHTML = opts.map(([v, t]) => `<option value="${v === -1 ? 40 : v}">${t}</option>`).join("");
  tar.value = "74";
  const run = () => {
    const t = +tar.value, bin = alg.value === "bin";
    Lib.algo($("#lab1"), { w: 680, h: 250, label: "Search lab", pseudo: bin ? BIN_PS : LIN_PS, py: bin ? BIN_PY : LIN_PY, dwell: 1600, frames: (bin ? binFrames : linFrames)(BIG, t, 680) });
  };
  tar.onchange = alg.onchange = run; run();
})();

/* ---------- Lab 2 ---------- */
(() => {
  const maxC = (n) => Math.floor(Math.log2(n)) + 1;
  const fmtInt = (n) => n.toLocaleString("en-GB");
  let g;
  g = Lib.slider($("#gs"), { id: "gn", label: "List size (n)", min: 1, max: 60, step: 1, value: 20, fmt: (v) => fmtInt(sz(v)), onInput: upd });
  function sz(v) { return Math.max(1, Math.round(10 ** (v / 60 * 9))); }
  function upd() {
    if (!g) return;
    const n = sz(g.get()), b = maxC(n);
    $("#vl").textContent = fmtInt(n); $("#vb").textContent = b;
    $("#bl").style.width = "100%"; $("#bb").style.width = Math.max(0.4, (b / n) * 100) + "%";
    $("#gv").textContent = n < 4 ? "With so few items there is hardly any difference." : `For ${fmtInt(n)} items, linear search may need up to ${fmtInt(n)} comparisons. Binary search needs at most ${b}. That is ${fmtInt(Math.round(n / b))} times fewer.`;
  }
  upd();
})();

/* ---------- Lab 3: be the binary search ---------- */
(() => {
  const el = $("#game");
  let data, t, lo, hi, mid, c, over, dead;
  const maxC = 4;
  function newRound() {
    const s = new Set(); while (s.size < 15) s.add(1 + Math.floor(Math.random() * 99));
    data = [...s].sort((a, b) => a - b); t = data[Math.floor(Math.random() * 15)]; lo = 0; hi = 14; c = 0; over = false; dead = new Set(); draw("");
  }
  function draw(msg, good) {
    mid = Math.floor((lo + hi) / 2);
    const ptr = {}; ptr[lo] = "L"; ptr[hi] = (ptr[hi] ? ptr[hi] + "," : "") + "H"; ptr[mid] = (ptr[mid] ? ptr[mid] + "," : "") + "M";
    const W = 680, svg = `<svg viewBox="0 0 ${W} 190" role="img" aria-label="Binary search game">${SV.text(14, 26, "Target: " + t, "lbl bd", { "text-anchor": "start", style: "font-size:18px" })}${SV.text(W - 14, 26, "Comparisons: " + c, "lbl bd t4", { "text-anchor": "end" })}${Lib.cells(data, { x0: 12, y: 50, w: 40, h: 40, gap: 4, dim: [...dead], cls: over ? { [mid]: "ok" } : { [mid]: "cur" }, ptr })}</svg>`;
    el.innerHTML = svg + `<p>Low = <b>${lo}</b>, High = <b>${hi}</b>, Mid = (${lo} + ${hi}) DIV 2 = <b>${mid}</b>. The value at Mid is <b>${data[mid]}</b>. The target is <b>${t}</b>. Where must it be?</p>
      <div class="gbtn"><button class="b" data-g="l" ${over ? "disabled" : ""}>◀ In the lower half</button><button class="b pri" data-g="f" ${over ? "disabled" : ""}>Found it</button><button class="b" data-g="r" ${over ? "disabled" : ""}>In the upper half ▶</button><button class="b" data-g="n">New list</button></div><div class="msg" style="color:var(${good === false ? "--bad" : "--good"})" aria-live="polite">${msg}</div>`;
    $$("[data-g]", el).forEach((b) => (b.onclick = () => act(b.dataset.g)));
  }
  function act(a) {
    if (a === "n") return newRound();
    const v = data[mid], right = v === t ? "f" : v < t ? "r" : "l";
    c++;
    if (a !== right) { c--; return draw(`Not quite. ${v} ${v === t ? "is the target, so you have found it" : v < t ? "is smaller than " + t + ", so the target is in the upper half" : "is bigger than " + t + ", so the target is in the lower half"}.`, false); }
    if (a === "f") { over = true; return draw(`Found ${t} at index ${mid} after ${c} comparison${c > 1 ? "s" : ""}. For 15 items the worst case is ${maxC}.`); }
    if (a === "r") { for (let i = lo; i <= mid; i++) dead.add(i); lo = mid + 1; } else { for (let i = mid; i <= hi; i++) dead.add(i); hi = mid - 1; }
    draw(a === "r" ? `Correct. Low becomes Mid + 1 = ${lo}.` : `Correct. High becomes Mid - 1 = ${hi}.`);
  }
  newRound();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each statement to the search it describes.", buckets: [{ label: "Linear search only" }, { label: "Binary search only" }, { label: "Either" }], items: [
  { text: "Works on an unsorted list", b: 0 }, { text: "The list must be sorted first", b: 1 }, { text: "Starts by checking the middle item", b: 1 },
  { text: "Worst case: every item is checked", b: 0 }, { text: "Needs at most about log₂ n comparisons", b: 1 }, { text: "Can return the position of the target", b: 2 },
  { text: "Halves the items still to search each time", b: 1 }, { text: "Can be used on a sorted list", b: 2 }, { text: "Best case: target is the first item", b: 0 }, { text: "Needs a Low, High and Mid variable", b: 1 },
], done: "Linear search is general-purpose; binary search trades a sorting requirement for speed." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Linear search", "Checks each item in turn from the start"], ["Binary search", "Repeatedly halves a sorted list"], ["Mid", "(Low + High) DIV 2"],
  ["Found flag", "A Boolean that stops the loop when set TRUE"], ["Worst case (linear)", "Target is last or missing: n comparisons"], ["Low > High", "No items left, so the target is not present"],
] });

Lib.order($("#o1"), { prompt: "Put the steps of a binary search in the right order.", items: [
  "Set Low to the first index and High to the last index", "Calculate Mid = (Low + High) DIV 2", "Compare the item at Mid with the target", "If they are equal, stop: the item is found",
  "Otherwise move Low to Mid + 1 or High to Mid - 1", "Repeat from the Mid calculation while Low <= High", "If Low > High, stop: the item is not in the list",
], done: "Compare, then discard, then repeat." });

Lib.calc($("#c1"), { qs: [
  { q: "Low = 0 and High = 9. What is Mid?", a: 4, hint: "(0 + 9) DIV 2. Round down.", sol: "(0 + 9) = 9. 9 DIV 2 = <b>4</b>." },
  { q: "Low = 5 and High = 9. What is Mid?", a: 7, hint: "(5 + 9) DIV 2.", sol: "14 DIV 2 = <b>7</b>." },
  { q: "A linear search is run on 250 items. What is the maximum number of comparisons?", a: 250, hint: "Worst case: the item is last or missing.", sol: "Every item is checked: <b>250</b>." },
  { q: "A binary search is run on a sorted list of 1,000 items. What is the maximum number of comparisons?", a: 10, hint: "2¹⁰ = 1,024. How many halvings?", sol: "2⁹ = 512 &lt; 1000 ≤ 2¹⁰ = 1024, so ⌊log₂ 1000⌋ + 1 = 9 + 1 = <b>10</b>." },
  { q: "A binary search is run on a sorted list of 1,000,000 items. What is the maximum number of comparisons?", a: 20, hint: "2²⁰ = 1,048,576.", sol: "⌊log₂ 1,000,000⌋ + 1 = 19 + 1 = <b>20</b>." },
  { q: "List: 5, 9, 12, 20, 31, 44, 58 (indexes 0 to 6). Binary search for 44. How many comparisons are needed?", a: 2, hint: "First Mid = 3, then Low = 4, High = 6.", sol: "Mid = 3 → 20 &lt; 44, so Low = 4. Mid = (4 + 6) DIV 2 = 5 → 44. Found: <b>2</b> comparisons." },
] });

Lib.quiz($("#qz1"), { qs: [
  { q: "Which condition must be true before a binary search can be used?", opts: ["The list has fewer than 100 items", "The list is sorted", "The list contains only integers", "The list has no duplicates"], a: 1, why: "Binary search discards half the list by comparing with the middle item, which only works when the items are in order." },
  { q: "A list has 16 items. What is the maximum number of comparisons in a binary search?", opts: ["4", "5", "8", "16"], a: 1, why: "⌊log₂ 16⌋ + 1 = 4 + 1 = 5. 16 → 8 → 4 → 2 → 1, then the final comparison." },
  { q: "In binary search, the target is greater than Data[Mid]. What happens next?", opts: ["High ← Mid - 1", "Low ← Mid + 1", "Low ← Mid", "The search stops"], a: 1, why: "The target must be above Mid, so the lower half including Mid is discarded." },
  { q: "Which is the best case for a linear search?", opts: ["Target is the middle item", "Target is the last item", "Target is the first item", "Target is not in the list"], a: 2, why: "The first item is compared first, so 1 comparison is enough." },
  { q: "An unsorted list of 20 items is searched once. Which is the sensible choice?", opts: ["Sort it, then binary search", "Linear search", "Binary search without sorting", "Either is equally fast"], a: 1, why: "Sorting costs more than a single scan, so a linear search is simpler and quicker for one search." },
  { q: "Which line of binary search can make the loop run forever if written incorrectly?", opts: ["Low ← 0", "Mid ← (Low + High) DIV 2", "Low ← Mid", "OUTPUT Mid"], a: 2, why: "If Low is set to Mid rather than Mid + 1, Low may never change and the loop repeats with the same bounds." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Searching algorithm", "A method for finding the position of a target in a collection of data."], ["Linear search", "Checks each item in turn from the start until the target is found or the list ends."],
  ["Binary search", "Repeatedly compares the target with the middle of a sorted list and discards the half that cannot contain it."], ["Sorted", "Items arranged in order, e.g. ascending. Required for a binary search."],
  ["Low, High, Mid", "The bounds of the part of the list still being searched, and the index in the middle: Mid = (Low + High) DIV 2."], ["DIV", "Integer division: divide and discard the remainder."],
  ["Best case", "The fewest comparisons: the target is the first item (linear) or the middle item (binary)."], ["Worst case", "The most comparisons: n for linear search; about log₂ n for binary search."],
  ["O(n)", "Linear time. The work grows in direct proportion to the list size. Linear search."], ["O(log n)", "Logarithmic time. Doubling the list adds one more step. Binary search."],
] });
