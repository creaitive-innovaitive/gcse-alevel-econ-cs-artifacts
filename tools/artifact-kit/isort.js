let kase = "avg";
function isLab() {
  const n = +$("#a1").value, w = n * (n - 1) / 2, c = { best: [n - 1, 0], avg: [n * (n - 1) / 4 + n - 1, n * (n - 1) / 4], worst: [w, w] }[kase];
  $("#k1").textContent = Math.round(c[0]); $("#k2").textContent = Math.round(c[1]);
  $("#v1").textContent = kase === "best" ? "Sorted input: one comparison per item and no swaps. The work grows in proportion to N." : kase === "worst" ? "Reverse input: each item walks all the way to the front, so about N² ÷ 2 swaps." : "Random input: on average about N² ÷ 4 swaps.";
  let o = SV.line(40, 260, 460, 260, "ax"), max = w || 1;
  [["best", "Sorted", 0, "f3"], ["avg", "Random", n * (n - 1) / 4, "f4"], ["worst", "Reversed", w, "f2"]].forEach((r, i) => {
    const h = (r[2] / max) * 200, x = 70 + i * 130;
    o += SV.rect(x, 260 - h, 90, Math.max(h, 2), r[3], { style: "opacity:" + (r[0] === kase ? 0.9 : 0.35) }) + SV.text(x + 45, 280, r[1], "lbl", { "text-anchor": "middle" }) + SV.text(x + 45, 252 - h, Math.round(r[2]), "lbl bd", { "text-anchor": "middle" });
  });
  $("#lab1").innerHTML = o;
}
Lib.slider($("#sl1"), { id: "a1", label: "Number of items (N)", min: 4, max: 60, step: 2, value: 20, fmt: (v) => v, onInput: () => $("#lab1") && isLab() });
$$("[data-c]").forEach((b) => b.onclick = () => { kase = b.dataset.c; $$("[data-c]").forEach((x) => x.classList.toggle("pri", x === b)); isLab(); });
$$("[data-c]").forEach((x) => x.classList.toggle("pri", x.dataset.c === kase));
isLab();
Lib.classify($("#cl1"), {
  prompt: "Which sort does each statement describe?",
  buckets: [{ label: "Bubble sort" }, { label: "Insertion sort" }],
  items: [
    { text: "Sweeps the whole unsorted part, swapping neighbours", b: 0 }, { text: "Carries the largest remaining value to the right", b: 0 }, { text: "Sorted part grows from the right-hand end", b: 0 },
    { text: "Walks one new item backwards through the sorted part", b: 1 }, { text: "Sorted part grows from the left-hand end", b: 1 }, { text: "Stops moving an item when its left neighbour is not bigger", b: 1 },
  ],
  done: "Both use adjacent swaps, but they look in different places and stop at different times.",
});
Lib.order($("#o1"), { prompt: "Put the insertion sort steps in order.", items: [
  "Treat the first item as a sorted list of one.",
  "Take the next item and compare it with its left neighbour.",
  "Swap while the left neighbour is bigger.",
  "Stop when the neighbour is not bigger or the front is reached.",
  "Repeat for every remaining item.",
] });
Lib.calc($("#c1"), { qs: [
  { q: "How many swaps does insertion sort need for [7, 3, 9, 4, 1]? (count the pairs out of order)", a: 7, hint: "Count pairs where a larger value comes before a smaller one.", sol: "(7,3) (7,4) (7,1) (3,1) (9,4) (9,1) (4,1) = 7 pairs, so 7 swaps." },
  { q: "How many swaps does a reversed list of 6 items need? N(N−1)/2", a: 15, hint: "6 × 5 ÷ 2.", sol: "6 × 5 ÷ 2 = 15." },
  { q: "How many swaps does an already sorted list of 10 items need?", a: 0, sol: "None: every item is already in place." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "In insertion sort, the sorted part grows from", opts: ["the right-hand end", "the left-hand end", "the middle", "both ends"], a: 1, why: "Each new item is inserted into the sorted part on the left." },
  { q: "The best case for insertion sort is a list that is", opts: ["in reverse order", "random", "already sorted", "full of duplicates"], a: 2, why: "No swaps are needed, so the work is proportional to N." },
  { q: "What is the worst-case time complexity of insertion sort?", opts: ["O(1)", "O(N)", "O(N log N)", "O(N²)"], a: 3, why: "Each of N items may be moved past up to N others." },
  { q: "Why is a temp variable used when swapping?", opts: ["To make it faster", "To avoid losing one of the values", "To count swaps", "To store the sorted list"], a: 1, why: "Overwriting one value without storing it would lose it." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Insertion sort", "A sort that takes one item at a time and inserts it into its place in the sorted part of the list."],
  ["Sorted region", "The part of the list, growing from the left, whose items are in order relative to each other."],
  ["temp", "A variable used to hold one value while two items are swapped."],
  ["Adjacent swap", "Swapping two neighbouring items."],
  ["Best case", "Already sorted: about N comparisons and no swaps."],
  ["Worst case", "Reverse order: about N² ÷ 2 swaps, O(N²)."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

(function(){
  const data = [7, 3, 9, 4, 1];

  const codeLines = [
    "def insertion_sort(myList):",
    "    for i in range(1, len(myList)):",
    "        place = i - 1",
    "        while place >= 0 and myList[place] > myList[place + 1]:",
    "            temp = myList[place + 1]",
    "            myList[place + 1] = myList[place]",
    "            myList[place] = temp",
    "            place = place - 1",
    "    return myList",
  ];
  const LINE = { def:0, for:1, place0:2, whiletest:3, temp:4, copy:5, writeback:6, dec:7, ret:8 };

  function trace(input){
    const arr = input.slice();
    const steps = [];
    const n = arr.length;

    function snap(line, opts){
      steps.push(Object.assign({
        arr: arr.slice(),
        line,
        sortedUpto: opts.sortedUpto,
        place: opts.place,
        tempVal: opts.tempVal,
        tempAt: opts.tempAt,
        compareA: opts.compareA,
        compareB: opts.compareB,
        note: opts.note,
      }));
    }

    snap(LINE.def, {sortedUpto:0, note:"Start: a 5-element list. A single element (index 0) counts as already sorted."});

    for (let i = 1; i < n; i++) {
      snap(LINE.for, {sortedUpto:i, note:`Outer loop: i = ${i}. Everything left of i is the sorted region so far.`});
      let place = i - 1;
      snap(LINE.place0, {sortedUpto:i, place, note:`Set place = ${place}. We'll compare this element with its right-hand neighbour.`});

      while (place >= 0 && arr[place] > arr[place + 1]) {
        snap(LINE.whiletest, {sortedUpto:i, place, compareA:place, compareB:place+1,
          note:`Compare: is myList[${place}] = ${arr[place]} greater than myList[${place+1}] = ${arr[place+1]}? Yes — swap them.`});

        const temp = arr[place + 1];
        snap(LINE.temp, {sortedUpto:i, place, tempVal:temp, tempAt:place+1, compareA:place, compareB:place+1,
          note:`Stage 1 — temp = myList[${place+1}]. Park ${temp} in temp so it isn't lost when we overwrite it.`});

        arr[place + 1] = arr[place];
        snap(LINE.copy, {sortedUpto:i, place, tempVal:temp, tempAt:place+1, compareA:place, compareB:place+1,
          note:`Stage 2 — myList[${place+1}] = myList[${place}]. Copy ${arr[place+1]} rightward; temp still holds ${temp}.`});

        arr[place] = temp;
        snap(LINE.writeback, {sortedUpto:i, place, compareA:place, compareB:place+1,
          note:`Stage 3 — myList[${place}] = temp. Write ${temp} back in from the left. The swap is complete.`});

        place = place - 1;
        snap(LINE.dec, {sortedUpto:i, place, note:`place = place - 1 = ${place}. Move the comparison one step further left.`});
      }

      if (place >= 0) {
        snap(LINE.whiletest, {sortedUpto:i+1, place, compareA:place, compareB:place+1,
          note:`Compare: is myList[${place}] = ${arr[place]} greater than myList[${place+1}] = ${arr[place+1]}? No — stop. Region [0..${i}] is now sorted.`});
      } else {
        snap(LINE.whiletest, {sortedUpto:i+1, place,
          note:`place has fallen off the front of the list (place = -1) — the element has bubbled all the way to index 0. Region [0..${i}] is now sorted.`});
      }
    }
    snap(LINE.ret, {sortedUpto:n, note:"Every element has been walked into position. The list is fully sorted."});
    return steps;
  }

  const steps = trace(data);
  let idx = 0;
  let timer = null;

  const arrowRow = document.getElementById('arrowRow');
  const arrayRow = document.getElementById('arrayRow');
  const idxRow = document.getElementById('idxRow');
  const narration = document.getElementById('narration');
  const stepCounter = document.getElementById('stepCounter');
  const codeBlock = document.getElementById('codeBlock');
  const btnPlay = document.getElementById('btnPlay');

  codeBlock.innerHTML = codeLines.map((l,i)=>`<span class="code-line" data-line="${i}"><span class="n">${i}</span>${escapeHtml(l)}</span>`).join('\n');
  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

  function render(){
    const s = steps[idx];
    const n = s.arr.length;

    let arrowsHtml = '';
    let slotsHtml = '';
    let idxHtml = '';

    for (let i = 0; i < n; i++) {
      if (s.place === i) {
        arrowsHtml += `<div class="arrow-cell arrow-j"><div class="lbl"><span class="glyph">&#8593;</span><span>place</span></div></div>`;
      } else if (s.place !== undefined && s.place + 1 === i && s.compareB === i) {
        arrowsHtml += `<div class="arrow-cell arrow-key"><div class="lbl"><span class="glyph">&#8593;</span><span>place+1</span></div></div>`;
      } else {
        arrowsHtml += `<div class="arrow-cell"></div>`;
      }

      let cls = 'slot';
      const label = s.arr[i];
      if (s.tempAt === i) {
        cls += ' key';
      } else if (s.compareA === i || s.compareB === i) {
        cls += ' compare';
      } else if (i < s.sortedUpto) {
        cls += ' sorted';
      }
      slotsHtml += `<div class="${cls}">${label}</div>`;
      idxHtml += `<div class="idx">${i}</div>`;
    }

    let tempBadge = '';
    if (s.tempVal !== undefined) {
      tempBadge = `<div style="font-family:'JetBrains Mono',monospace; font-size:12.5px; color:var(--key); margin-top:-4px;">temp = ${s.tempVal}</div>`;
    }
    document.getElementById('tempBadge').innerHTML = tempBadge;

    arrowRow.innerHTML = arrowsHtml;
    arrayRow.innerHTML = slotsHtml;
    idxRow.innerHTML = idxHtml;
    narration.innerHTML = s.note;

    document.querySelectorAll('.code-line').forEach(el=>{
      el.classList.toggle('active', Number(el.dataset.line) === s.line);
    });

    stepCounter.textContent = `step ${idx+1} / ${steps.length}`;
    document.getElementById('btnPrev').disabled = idx === 0;
    document.getElementById('btnNext').disabled = idx === steps.length - 1;
  }

  function next(){
    if (idx < steps.length - 1) { idx++; render(); }
    else stopPlay();
  }
  function prev(){ if (idx > 0) { idx--; render(); } }
  function reset(){ idx = 0; render(); stopPlay(); }

  function stopPlay(){
    if (timer) { clearInterval(timer); timer = null; }
    btnPlay.textContent = '▶ Play';
  }
  function togglePlay(){
    if (timer) { stopPlay(); return; }
    if (idx === steps.length - 1) idx = 0;
    btnPlay.textContent = '⏸ Pause';
    timer = setInterval(()=>{
      if (idx >= steps.length - 1) { stopPlay(); return; }
      next();
    }, 1100);
  }

  document.getElementById('btnNext').addEventListener('click', ()=>{ stopPlay(); next(); });
  document.getElementById('btnPrev').addEventListener('click', ()=>{ stopPlay(); prev(); });
  document.getElementById('btnReset').addEventListener('click', reset);
  btnPlay.addEventListener('click', togglePlay);

  window.addEventListener('keydown', (e)=>{
    if (e.key === 'ArrowRight') { stopPlay(); next(); }
    if (e.key === 'ArrowLeft') { stopPlay(); prev(); }
  });

  render();
})();

})();
