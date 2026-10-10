Lib.classify($("#cl1"), {
  prompt: "Is each value in the left or the right subtree of the root (50)?",
  buckets: [{ label: "Left of 50" }, { label: "Right of 50" }],
  items: [{ text: "20", b: 0 }, { text: "30", b: 0 }, { text: "40", b: 0 }, { text: "60", b: 1 }, { text: "70", b: 1 }, { text: "80", b: 1 }],
  done: "Everything smaller than the root is in its left subtree, everything bigger in its right subtree.",
});
Lib.order($("#o1"), { prompt: "Put the steps for searching a binary search tree in order.", items: [
  "Start at the root.",
  "Compare the target with the current node.",
  "If equal, stop: it is found.",
  "If smaller go left, if bigger go right.",
  "If you reach an empty pointer, stop: it is not in the tree.",
] });
Lib.match($("#m1"), { prompt: "Match each traversal to its order.", pairs: [
  ["In-order", "Left, node, right"],
  ["Pre-order", "Node, left, right"],
  ["Post-order", "Left, right, node"],
] });
Lib.calc($("#c1"), { qs: [
  { q: "Roughly how many comparisons does a search of a balanced tree of 1,024 nodes need (log₂ N)?", a: 10, hint: "2 to the power of what is 1,024?", sol: "2¹⁰ = 1,024, so about 10." },
  { q: "The tree is built from 50, 30, 70, 20, 40, 60, 80. How many nodes are in the left subtree of the root?", a: 3, sol: "30, 20 and 40." },
  { q: "Values 1, 2, 3, 4, 5 are inserted in that order. How many comparisons does it take to find 5?", a: 5, hint: "The tree is a chain going right.", sol: "1, 2, 3, 4 then 5: five comparisons." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "In a binary search tree, values smaller than a node are", opts: ["in its right subtree", "in its left subtree", "above it", "anywhere"], a: 1, why: "Smaller goes left." },
  { q: "An in-order traversal of a binary search tree outputs the values", opts: ["in descending order", "in ascending order", "in insertion order", "randomly"], a: 1, why: "Left, node, right visits smaller values first." },
  { q: "A new value is inserted", opts: ["at the root", "as a new leaf", "replacing a node", "at the deepest node"], a: 1, why: "You walk down until the pointer is empty and plant a new leaf." },
  { q: "The worst-case search time for a degenerate tree is", opts: ["O(1)", "O(log N)", "O(N)", "O(N²)"], a: 2, why: "It is a chain, so every node may be visited." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Binary search tree", "A tree where each node's left subtree is smaller and its right subtree is bigger."],
  ["Root", "The top node of the tree."],
  ["Leaf", "A node with no children."],
  ["Subtree", "A node together with all the nodes below it."],
  ["In-order traversal", "Left, node, right. Gives ascending order on a binary search tree."],
  ["Pre-order traversal", "Node, left, right."],
  ["Post-order traversal", "Left, right, node."],
  ["Balanced tree", "A tree with similar depth on both sides, so search is O(log N)."],
  ["Null pointer", "A pointer (−1 in the array version) meaning there is no child."],
] });

/* ---------- original page scripts (own scope) ---------- */
(function(){

(function(){
  const buildValues = [50, 30, 70, 20, 40, 60, 80];
  const sortedVals = buildValues.slice().sort((a,b)=>a-b);
  const rankOf = v => sortedVals.indexOf(v);

  const MARGIN_X = 70, SPAN_X = 90, TOP_Y = 45, SPAN_Y = 95, R = 24;
  const X = v => MARGIN_X + rankOf(v) * SPAN_X;
  const Y = d => TOP_Y + d * SPAN_Y;

  const codeLines = [
    "class Node:",
    "    def __init__(self, value):",
    "        self.value = value",
    "        self.left = None",
    "        self.right = None",
    "",
    "class BinaryTree:",
    "    def __init__(self):",
    "        self.root = None",
    "",
    "    def insert(self, value):",
    "        if self.root is None:",
    "            self.root = Node(value)",
    "        else:",
    "            self._insert(self.root, value)",
    "",
    "    def _insert(self, node, value):",
    "        if value < node.value:",
    "            if node.left is None:",
    "                node.left = Node(value)",
    "            else:",
    "                self._insert(node.left, value)",
    "        elif value > node.value:",
    "            if node.right is None:",
    "                node.right = Node(value)",
    "            else:",
    "                self._insert(node.right, value)",
    "        # if value == node.value: do nothing",
    "",
    "    def search(self, value):",
    "        return self._search(self.root, value)",
    "",
    "    def _search(self, node, value):",
    "        if node is None:",
    "            return False",
    "        if value == node.value:",
    "            return True",
    "        elif value < node.value:",
    "            return self._search(node.left, value)",
    "        else:",
    "            return self._search(node.right, value)",
  ];
  const psLines = [
    "TYPE TreeNode",
    "   DECLARE LeftPtr  : INTEGER",
    "   DECLARE Data     : INTEGER",
    "   DECLARE RightPtr : INTEGER",
    "ENDTYPE",
    "",
    "DECLARE BinTree : ARRAY[0:99] OF TreeNode",
    "DECLARE RootPtr, FreePtr, NewPtr, NowPtr : INTEGER",
    "RootPtr ← -1   // empty tree",
    "FreePtr ← 0    // next unused index",
    "",
    "PROCEDURE Insert(Value : INTEGER)",
    "   DECLARE Placed : BOOLEAN",
    "   NewPtr ← FreePtr",
    "   FreePtr ← FreePtr + 1",
    "   BinTree[NewPtr].Data ← Value",
    "   BinTree[NewPtr].LeftPtr ← -1",
    "   BinTree[NewPtr].RightPtr ← -1",
    "   IF RootPtr = -1",
    "      THEN",
    "         RootPtr ← NewPtr",
    "      ELSE",
    "         NowPtr ← RootPtr",
    "         Placed ← FALSE",
    "         WHILE Placed = FALSE",
    "            IF Value < BinTree[NowPtr].Data",
    "               THEN",
    "                  IF BinTree[NowPtr].LeftPtr = -1",
    "                     THEN",
    "                        BinTree[NowPtr].LeftPtr ← NewPtr",
    "                        Placed ← TRUE",
    "                     ELSE",
    "                        NowPtr ← BinTree[NowPtr].LeftPtr",
    "                  ENDIF",
    "               ELSE",
    "                  IF BinTree[NowPtr].RightPtr = -1",
    "                     THEN",
    "                        BinTree[NowPtr].RightPtr ← NewPtr",
    "                        Placed ← TRUE",
    "                     ELSE",
    "                        NowPtr ← BinTree[NowPtr].RightPtr",
    "                  ENDIF",
    "            ENDIF",
    "         ENDWHILE",
    "   ENDIF",
    "ENDPROCEDURE",
    "",
    "FUNCTION Search(Value : INTEGER) RETURNS BOOLEAN",
    "   NowPtr ← RootPtr",
    "   WHILE NowPtr <> -1",
    "      IF BinTree[NowPtr].Data = Value",
    "         THEN",
    "            RETURN TRUE",
    "         ELSE",
    "            IF Value < BinTree[NowPtr].Data",
    "               THEN",
    "                  NowPtr ← BinTree[NowPtr].LeftPtr",
    "               ELSE",
    "                  NowPtr ← BinTree[NowPtr].RightPtr",
    "            ENDIF",
    "      ENDIF",
    "   ENDWHILE",
    "   RETURN FALSE",
    "ENDFUNCTION",
  ];
  const travLines = [
    "PROCEDURE InOrder(Ptr : INTEGER)",
    "   IF Ptr <> -1",
    "      THEN",
    "         CALL InOrder(BinTree[Ptr].LeftPtr)",
    "         OUTPUT BinTree[Ptr].Data        // visit between the two",
    "         CALL InOrder(BinTree[Ptr].RightPtr)",
    "   ENDIF",
    "ENDPROCEDURE",
    "",
    "// PreOrder: OUTPUT first, then left, then right",
    "// PostOrder: left, then right, then OUTPUT last",
    "",
    "CALL InOrder(RootPtr)",
  ];
  const L = {
    insertCall:10, rootIsNone:11, rootAssign:12, elseCall:14,
    lessTest:17, leftNoneTest:18, leftAssign:19, recurseLeft:21,
    greaterTest:22, rightNoneTest:23, rightAssign:24, recurseRight:26, dup:27,
    searchCall:29, searchDelegate:30,
    nodeNoneTest:33, returnFalse:34, eqTest:35, returnTrue:36,
    ltTest:37, recurseSearchLeft:38, recurseSearchRight:40,
  };

  // python line index -> pseudocode line index
  const psMap = {};
  psMap[L.insertCall]=11; psMap[L.rootIsNone]=18; psMap[L.rootAssign]=20; psMap[L.elseCall]=22;
  psMap[L.lessTest]=25; psMap[L.leftNoneTest]=27; psMap[L.leftAssign]=29; psMap[L.recurseLeft]=32;
  psMap[L.greaterTest]=34; psMap[L.rightNoneTest]=35; psMap[L.rightAssign]=37; psMap[L.recurseRight]=40; psMap[L.dup]=34;
  psMap[L.searchCall]=47; psMap[L.searchDelegate]=48; psMap[L.nodeNoneTest]=49; psMap[L.returnFalse]=62;
  psMap[L.eqTest]=50; psMap[L.returnTrue]=52; psMap[L.ltTest]=54; psMap[L.recurseSearchLeft]=56; psMap[L.recurseSearchRight]=58;

  function psNote(t){
    return t
      .replace(/self\.root is None/, 'RootPtr = -1')
      .replace(/self\.root = Node\((\d+)\)\./, 'RootPtr ← NewPtr (the new node, index 0).')
      .replace(/call _insert\(root, (\d+)\) and start comparing from the root/, 'set NowPtr ← RootPtr and start comparing from the root')
      .replace(/node\.(left|right) is None/, (m,d)=> (d==='left'?'LeftPtr':'RightPtr')+' = -1')
      .replace(/node\.(left|right) = Node\((\d+)\)\. The new node is planted\./, (m,d)=> (d==='left'?'LeftPtr':'RightPtr')+' of this node ← NewPtr. The new node is linked in.')
      .replace(/node\.(left|right) already holds (\d+) — recurse into the (left|right) subtree\./, (m,d,v,s2)=> 'The '+s2+' pointer is not -1 — set NowPtr to it and carry on down the '+s2+' subtree.')
      .replace(/Delegate to _search\(root, (\d+)\)\./, 'NowPtr ← RootPtr.')
      .replace(/node is None — /, 'NowPtr = -1 — ')
      .replace(/return False/, 'RETURN FALSE')
      .replace(/return True/, 'RETURN TRUE')
      .replace(/_search\(node\.(left|right), (\d+)\)\./, (m,d)=> 'NowPtr ← '+(d==='left'?'LeftPtr':'RightPtr')+' of this node.');
  }

  // ---------- tree simulation ----------
  function cloneNodes(nodes){
    const out = {};
    for (const k in nodes) out[k] = Object.assign({}, nodes[k]);
    return out;
  }

  function traceBuild(values){
    const steps = [];
    let nodes = {};
    let root = null;

    function snap(line, current, note, path, extra){
      steps.push(Object.assign({
        line, current, note, path: path || [],
        nodes: cloneNodes(nodes), root, ghost: null,
      }, extra || {}));
    }

    for (const v of values) {
      snap(L.insertCall, null, `Call insert(${v}).`, []);
      if (root === null) {
        snap(L.rootIsNone, null, `self.root is None — the tree is empty, so ${v} becomes the root.`, []);
        nodes[v] = { value: v, left: null, right: null, depth: 0 };
        root = v;
        snap(L.rootAssign, v, `self.root = Node(${v}).`, [v], { newValue: v });
        continue;
      }
      snap(L.elseCall, root, `Tree isn't empty — call _insert(root, ${v}) and start comparing from the root.`, [root]);
      let cur = root;
      const path = [];
      while (true) {
        path.push(cur);
        const node = nodes[cur];
        if (v < node.value) {
          snap(L.lessTest, cur, `Is ${v} < ${node.value}? Yes — it belongs in the left subtree.`, path.slice());
          if (node.left === null) {
            snap(L.leftNoneTest, cur, `node.left is None — this is an empty spot.`, path.slice());
            nodes[v] = { value: v, left: null, right: null, depth: node.depth + 1 };
            nodes[cur] = Object.assign({}, node, { left: v });
            snap(L.leftAssign, cur, `node.left = Node(${v}). The new node is planted.`, path.concat([v]), { newValue: v });
            break;
          } else {
            snap(L.recurseLeft, cur, `node.left already holds ${node.left} — recurse into the left subtree.`, path.slice());
            cur = node.left;
          }
        } else if (v > node.value) {
          snap(L.greaterTest, cur, `Is ${v} > ${node.value}? Yes — it belongs in the right subtree.`, path.slice());
          if (node.right === null) {
            snap(L.rightNoneTest, cur, `node.right is None — this is an empty spot.`, path.slice());
            nodes[v] = { value: v, left: null, right: null, depth: node.depth + 1 };
            nodes[cur] = Object.assign({}, node, { right: v });
            snap(L.rightAssign, cur, `node.right = Node(${v}). The new node is planted.`, path.concat([v]), { newValue: v });
            break;
          } else {
            snap(L.recurseRight, cur, `node.right already holds ${node.right} — recurse into the right subtree.`, path.slice());
            cur = node.right;
          }
        } else {
          snap(L.dup, cur, `${v} already exists in the tree — do nothing.`, path.slice());
          break;
        }
      }
    }
    return { steps, nodes, root };
  }

  function traceSearch(nodes, root, target){
    const steps = [];
    function snap(line, current, note, path, extra){
      steps.push(Object.assign({
        line, current, note, path: path || [], nodes: cloneNodes(nodes), root, ghost: null,
      }, extra || {}));
    }
    snap(L.searchCall, null, `Call search(${target}).`, []);
    snap(L.searchDelegate, root, `Delegate to _search(root, ${target}).`, root !== null ? [root] : []);
    let cur = root;
    const path = [];
    while (true) {
      if (cur === null) {
        const lastVisited = path[path.length - 1];
        const lastNode = nodes[lastVisited];
        const wentLeft = lastNode.left === null;
        const gx = X(lastNode.value) + (wentLeft ? -SPAN_X/2 : SPAN_X/2);
        const gy = Y(lastNode.depth + 1);
        snap(L.nodeNoneTest, null, `node is None — we've run off the tree.`, path.slice(), { ghost: { x: gx, y: gy, parent: lastNode.value } });
        snap(L.returnFalse, null, `return False — ${target} is not in the tree.`, path.slice(), { ghost: { x: gx, y: gy, parent: lastNode.value }, result: false });
        break;
      }
      path.push(cur);
      const node = nodes[cur];
      snap(L.eqTest, cur, `Is ${target} == ${node.value}?`, path.slice());
      if (target === node.value) {
        snap(L.returnTrue, cur, `Match — return True. ${target} is in the tree.`, path.slice(), { result: true });
        break;
      } else if (target < node.value) {
        snap(L.ltTest, cur, `${target} < ${node.value} — go left.`, path.slice());
        snap(L.recurseSearchLeft, cur, `_search(node.left, ${target}).`, path.slice());
        cur = node.left;
      } else {
        snap(L.ltTest, cur, `${target} > ${node.value} — go right.`, path.slice());
        snap(L.recurseSearchRight, cur, `_search(node.right, ${target}).`, path.slice());
        cur = node.right;
      }
    }
    return steps;
  }

  const buildResult = traceBuild(buildValues);
  const scenarios = {
    build: { label: "Build the tree", steps: buildResult.steps },
    search40: { label: "Search 40 (found)", steps: traceSearch(buildResult.nodes, buildResult.root, 40) },
    search100: { label: "Search 100 (not found)", steps: traceSearch(buildResult.nodes, buildResult.root, 100) },
  };

  let currentKey = 'build';
  let idx = 0;
  let timer = null;

  const tabsEl = document.getElementById('tabs');
  const svg = document.getElementById('svg');
  const narration = document.getElementById('narration');
  const stepCounter = document.getElementById('stepCounter');
  const codeBlock = document.getElementById('codeBlock');
  const btnPlay = document.getElementById('btnPlay');

  function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
  let lang = 'ps';
  function renderCode(){
    const lines = lang === 'py' ? codeLines : psLines;
    codeBlock.innerHTML = lines.map((l,i)=>`<span class="code-line" data-line="${i}">${l.trim()===''?'':`<span class="n">${i}</span>`}${escapeHtml(l)}</span>`).join('\n');
  }
  document.getElementById('travBlock').innerHTML = travLines.map(l=>`<span class="code-line">${escapeHtml(l)}</span>`).join('\n');
  const langTabs = document.getElementById('langTabs');
  [['ps','Pseudocode (exam)'],['py','Python']].forEach(([k,t])=>{
    const b = document.createElement('button');
    b.className = 'tab' + (k===lang?' active':''); b.textContent = t; b.dataset.lang = k;
    b.addEventListener('click', ()=>{ lang = k; langTabs.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active', x.dataset.lang===k)); renderCode(); render(); });
    langTabs.appendChild(b);
  });
  renderCode();

  Object.keys(scenarios).forEach(key=>{
    const btn = document.createElement('button');
    btn.className = 'tab' + (key === currentKey ? ' active' : '');
    btn.textContent = scenarios[key].label;
    btn.dataset.key = key;
    btn.addEventListener('click', ()=>{ switchScenario(key); });
    tabsEl.appendChild(btn);
  });

  function switchScenario(key){
    stopPlay();
    currentKey = key;
    idx = 0;
    document.querySelectorAll('.tab').forEach(t=> t.classList.toggle('active', t.dataset.key === key));
    render();
  }

  function svgNS(tag){ return document.createElementNS('http://www.w3.org/2000/svg', tag); }

  function render(){
    const steps = scenarios[currentKey].steps;
    const s = steps[idx];
    svg.innerHTML = '';

    const values = Object.keys(s.nodes).map(Number);
    // edges
    values.forEach(v=>{
      const node = s.nodes[v];
      [node.left, node.right].forEach(childVal=>{
        if (childVal === null) return;
        const child = s.nodes[childVal];
        const line = svgNS('line');
        line.setAttribute('x1', X(node.value)); line.setAttribute('y1', Y(node.depth));
        line.setAttribute('x2', X(child.value)); line.setAttribute('y2', Y(child.depth));
        let cls = 'edge';
        const pi = s.path.indexOf(node.value);
        if (pi !== -1 && s.path[pi+1] === child.value) cls += ' active';
        line.setAttribute('class', cls);
        svg.appendChild(line);
      });
    });

    // ghost edge + node (search miss)
    if (s.ghost) {
      const parentNode = s.nodes[s.ghost.parent];
      const gline = svgNS('line');
      gline.setAttribute('x1', X(parentNode.value)); gline.setAttribute('y1', Y(parentNode.depth));
      gline.setAttribute('x2', s.ghost.x); gline.setAttribute('y2', s.ghost.y);
      gline.setAttribute('class', 'edge missedge');
      svg.appendChild(gline);

      const gc = svgNS('circle');
      gc.setAttribute('cx', s.ghost.x); gc.setAttribute('cy', s.ghost.y); gc.setAttribute('r', R - 5);
      gc.setAttribute('class', 'ghost-circle');
      svg.appendChild(gc);
      const gt = svgNS('text');
      gt.setAttribute('x', s.ghost.x); gt.setAttribute('y', s.ghost.y);
      gt.setAttribute('class', 'ghost-text'); gt.setAttribute('dominant-baseline','central');
      gt.textContent = 'None';
      svg.appendChild(gt);
    }

    // nodes
    values.forEach(v=>{
      const node = s.nodes[v];
      const circle = svgNS('circle');
      circle.setAttribute('cx', X(v)); circle.setAttribute('cy', Y(node.depth)); circle.setAttribute('r', R);
      let cls = 'node-circle';
      if (s.result === true && v === s.current) cls += ' found';
      else if (s.newValue === v) cls += ' newnode';
      else if (v === s.current) cls += ' current';
      circle.setAttribute('class', cls);
      svg.appendChild(circle);

      const text = svgNS('text');
      text.setAttribute('x', X(v)); text.setAttribute('y', Y(node.depth));
      text.setAttribute('class', 'node-text');
      text.textContent = v;
      svg.appendChild(text);
    });

    narration.textContent = lang === 'ps' ? psNote(s.note) : s.note;
    renderArray(s);

    document.querySelectorAll('.code-line').forEach(el=>{
      el.classList.toggle('active', Number(el.dataset.line) === (lang === 'py' ? s.line : psMap[s.line]));
    });

    stepCounter.textContent = `step ${idx+1} / ${steps.length}`;
    document.getElementById('btnPrev').disabled = idx === 0;
    document.getElementById('btnNext').disabled = idx === steps.length - 1;
  }

  function renderArray(s){
    const vals = Object.keys(s.nodes).map(Number).sort((a,b)=>buildValues.indexOf(a)-buildValues.indexOf(b));
    const ix = v => v === null ? -1 : buildValues.indexOf(v);
    document.getElementById('arrPtrs').innerHTML = `<span>RootPtr = ${s.root === null ? -1 : ix(s.root)}</span><span>FreePtr = ${vals.length}</span>`;
    document.getElementById('arrBody').innerHTML = vals.map(v=>{
      const n = s.nodes[v];
      const cls = s.newValue === v ? 'new' : (s.current === v ? 'cur' : '');
      return `<tr class="${cls}"><td>${ix(v)}</td><td>${ix(n.left)}</td><td>${v}</td><td>${ix(n.right)}</td></tr>`;
    }).join('') || '<tr><td colspan="4">(empty: RootPtr = -1)</td></tr>';
  }

  function next(){
    const steps = scenarios[currentKey].steps;
    if (idx < steps.length - 1) { idx++; render(); } else stopPlay();
  }
  function prev(){ if (idx > 0) { idx--; render(); } }
  function reset(){ idx = 0; render(); stopPlay(); }

  function stopPlay(){
    if (timer) { clearInterval(timer); timer = null; }
    btnPlay.textContent = '▶ Play';
  }
  function togglePlay(){
    if (timer) { stopPlay(); return; }
    const steps = scenarios[currentKey].steps;
    if (idx === steps.length - 1) idx = 0;
    btnPlay.textContent = '⏸ Pause';
    timer = setInterval(()=>{
      const st = scenarios[currentKey].steps;
      if (idx >= st.length - 1) { stopPlay(); return; }
      next();
    }, 1300);
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
