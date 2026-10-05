/* ====================== code listings ====================== */
const STK_PS = ["PROCEDURE Push(Item)", "   IF TopPointer = MaxSize - 1 THEN", '      OUTPUT "Stack full"', "   ELSE", "      TopPointer ← TopPointer + 1", "      Stack[TopPointer] ← Item", "   ENDIF", "ENDPROCEDURE", "", "FUNCTION Pop() RETURNS INTEGER", "   IF TopPointer = -1 THEN", '      OUTPUT "Stack empty"', "   ELSE", "      Item ← Stack[TopPointer]", "      TopPointer ← TopPointer - 1", "      RETURN Item", "   ENDIF", "ENDFUNCTION"];
const STK_PY = ["def push(item):", "    global top", "    if top == MAX - 1:", '        print("Stack full")', "    else:", "        top += 1", "        stack[top] = item", "", "def pop():", "    global top", "    if top == -1:", '        print("Stack empty")', "    else:", "        item = stack[top]", "        top -= 1", "        return item"];
const QUE_PS = ["PROCEDURE Enqueue(Item)", "   IF Count = MaxSize THEN", '      OUTPUT "Queue full"', "   ELSE", "      Rear ← (Rear + 1) MOD MaxSize", "      Queue[Rear] ← Item", "      Count ← Count + 1", "   ENDIF", "ENDPROCEDURE", "", "FUNCTION Dequeue() RETURNS INTEGER", "   IF Count = 0 THEN", '      OUTPUT "Queue empty"', "   ELSE", "      Item ← Queue[Front]", "      Front ← (Front + 1) MOD MaxSize", "      Count ← Count - 1", "      RETURN Item", "   ENDIF", "ENDFUNCTION"];
const QUE_PY = ["def enqueue(item):", "    global rear, count", "    if count == MAX:", '        print("Queue full")', "    else:", "        rear = (rear + 1) % MAX", "        queue[rear] = item", "        count += 1", "", "def dequeue():", "    global front, count", "    if count == 0:", '        print("Queue empty")', "    else:", "        item = queue[front]", "        front = (front + 1) % MAX", "        count -= 1", "        return item"];
const LI_PS = ["PROCEDURE Insert(NewItem)", "   IF FreePtr = -1 THEN", '      OUTPUT "List full"', "   ELSE", "      NewPtr ← FreePtr", "      FreePtr ← Pointer[FreePtr]", "      Data[NewPtr] ← NewItem", "      Current ← StartPointer", "      Previous ← -1", "      WHILE Current <> -1 AND Data[Current] < NewItem", "         Previous ← Current", "         Current ← Pointer[Current]", "      ENDWHILE", "      Pointer[NewPtr] ← Current", "      IF Previous = -1 THEN", "         StartPointer ← NewPtr", "      ELSE", "         Pointer[Previous] ← NewPtr", "      ENDIF", "   ENDIF", "ENDPROCEDURE"];
const LI_PY = ["def insert(new_item):", "    global start, free", "    if free == -1:", '        print("List full")', "    else:", "        new = free", "        free = pointer[free]", "        data[new] = new_item", "        current = start", "        previous = -1", "        while current != -1 and data[current] < new_item:", "            previous = current", "            current = pointer[current]", "        pointer[new] = current", "        if previous == -1:", "            start = new", "        else:", "            pointer[previous] = new"];
const LD_PS = ["PROCEDURE Delete(Item)", "   Current ← StartPointer", "   Previous ← -1", "   WHILE Current <> -1 AND Data[Current] <> Item", "      Previous ← Current", "      Current ← Pointer[Current]", "   ENDWHILE", "   IF Current = -1 THEN", '      OUTPUT "Not found"', "   ELSE", "      IF Previous = -1 THEN", "         StartPointer ← Pointer[Current]", "      ELSE", "         Pointer[Previous] ← Pointer[Current]", "      ENDIF", "      Pointer[Current] ← FreePtr", "      FreePtr ← Current", "   ENDIF", "ENDPROCEDURE"];
const LD_PY = ["def delete(item):", "    global start, free", "    current = start", "    previous = -1", "    while current != -1 and data[current] != item:", "        previous = current", "        current = pointer[current]", "    if current == -1:", '        print("Not found")', "    else:", "        if previous == -1:", "            start = pointer[current]", "        else:", "            pointer[previous] = pointer[current]", "        pointer[current] = free", "        free = current"];
const BI_PS = ["PROCEDURE Insert(Root, NewItem)", "   IF Root = NULL THEN", "      Root ← NewNode(NewItem)", "   ELSE", "      Current ← Root", "      Placed ← FALSE", "      WHILE Placed = FALSE", "         IF NewItem < Current.Data THEN", "            IF Current.Left = NULL THEN", "               Current.Left ← NewNode(NewItem)", "               Placed ← TRUE", "            ELSE", "               Current ← Current.Left", "            ENDIF", "         ELSE", "            IF Current.Right = NULL THEN", "               Current.Right ← NewNode(NewItem)", "               Placed ← TRUE", "            ELSE", "               Current ← Current.Right", "            ENDIF", "         ENDIF", "      ENDWHILE", "   ENDIF", "ENDPROCEDURE"];
const BI_PY = ["def insert(root, new):", "    if root is None:", "        return Node(new)", "    current = root", "    placed = False", "    while not placed:", "        if new < current.data:", "            if current.left is None:", "                current.left = Node(new)", "                placed = True", "            else:", "                current = current.left", "        else:", "            if current.right is None:", "                current.right = Node(new)", "                placed = True", "            else:", "                current = current.right", "    return root"];
const TR_PS = ["PROCEDURE InOrder(Node)", "   IF Node <> NULL THEN", "      InOrder(Node.Left)", "      OUTPUT Node.Data", "      InOrder(Node.Right)", "   ENDIF", "ENDPROCEDURE"];
const TR_PY = ["def in_order(node):", "    if node is not None:", "        in_order(node.left)", "        print(node.data)", "        in_order(node.right)"];

const W = 640, MONO = "font-family:var(--mono);";
const hdr = (t, r) => SV.text(14, 26, t, "lbl bd", { "text-anchor": "start" }) + (r ? SV.text(W - 14, 26, r, "lbl bd t4", { "text-anchor": "end", style: MONO }) : "");
const note = (t, c, y = 232) => (t ? SV.text(W / 2, y, t, "lbl bd " + (c || ""), { "text-anchor": "middle" }) : "");

/* ====================== stack ====================== */
function stkView(st, top, MAXN, o = {}) {
  const w = 76, g = 10, x0 = (W - (MAXN * w + (MAXN - 1) * g)) / 2, dim = []; for (let i = top + 1; i < MAXN; i++) dim.push(i);
  return hdr("Stack (array of " + MAXN + ")", "TopPointer = " + top) + Lib.cells(st, { x0, y: 90, w, h: 56, gap: g, dim, cls: o.cls || (top >= 0 ? { [top]: "cur" } : {}), ptr: top >= 0 ? { [top]: "Top" } : {} }) + note(o.note, o.nc) + SV.text(14, 214, "Shaded slots are empty (or hold stale data).", "sm", { "text-anchor": "start" });
}
function stkFrames() {
  const MAXN = 4, st = Array(MAXN).fill(null); let top = -1; const F = [];
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: stkView([...st], top, MAXN, o) });
  f("An empty stack in an array of 4 slots. <b>TopPointer = −1</b> means empty.", [], []);
  [["push", 5], ["push", 8], ["push", 2], ["pop"], ["push", 9], ["push", 7], ["push", 4]].forEach(([op, v]) => {
    if (op === "push") {
      if (top === MAXN - 1) return f(`<b>Push ${v}.</b> TopPointer = ${top} = MaxSize − 1, so the stack is <b>full</b>. Output "Stack full". The item is rejected.`, [1, 2], [2, 3], { note: "Stack full: " + v + " rejected", nc: "t2", cls: { [top]: "no" } });
      f(`<b>Push ${v}.</b> Is the stack full? TopPointer ${top} ≠ ${MAXN - 1}, so there is space.`, [1], [2]);
      top++; f(`TopPointer ← TopPointer + 1 = <b>${top}</b>.`, [4], [5], { cls: { [top]: "cur" } });
      st[top] = v; f(`Stack[${top}] ← <b>${v}</b>. Pushed.`, [5], [6], { cls: { [top]: "ok" } });
    } else {
      f(`<b>Pop.</b> Is the stack empty? TopPointer = ${top}, not −1, so there is an item.`, [10], [10]);
      const item = st[top]; f(`Item ← Stack[${top}] = <b>${item}</b>. The item is read from the top.`, [13], [13], { cls: { [top]: "warn" } });
      top--; f(`TopPointer ← TopPointer − 1 = <b>${top}</b>. The slot is now treated as empty.`, [14], [14], { cls: top >= 0 ? { [top]: "cur" } : {} });
      f(`Return <b>${item}</b>. The last item pushed was the first out: LIFO.`, [15], [15], { note: "Returned " + item, nc: "t3", cls: top >= 0 ? { [top]: "cur" } : {} });
    }
  });
  return F;
}

/* ====================== circular queue ====================== */
function queView(q, front, rear, count, MAXN, o = {}) {
  const w = 84, g = 10, x0 = (W - (MAXN * w + (MAXN - 1) * g)) / 2, inQ = new Set(); for (let k = 0; k < count; k++) inQ.add((front + k) % MAXN);
  const dim = []; for (let i = 0; i < MAXN; i++) if (!inQ.has(i)) dim.push(i);
  const ptr = { [front]: "Front" }; if (rear >= 0) ptr[rear] = rear === front ? "Front + Rear" : "Rear";
  return hdr("Circular queue (array of " + MAXN + ")", `Front ${front} · Rear ${rear} · Count ${count}`) + Lib.cells(q, { x0, y: 90, w, h: 56, gap: g, dim, cls: o.cls || {}, ptr }) + note(o.note, o.nc) + SV.text(14, 214, "Shaded slots are not part of the queue (stale or empty).", "sm", { "text-anchor": "start" });
}
function queFrames() {
  const MAXN = 4, q = Array(MAXN).fill(null); let front = 0, rear = -1, count = 0; const F = [];
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: queView([...q], front, rear, count, MAXN, o) });
  f("An empty circular queue in an array of 4 slots. Front = 0, Rear = −1, Count = 0.", [], []);
  [["e", "A"], ["e", "B"], ["e", "C"], ["e", "D"], ["e", "E"], ["d"], ["d"], ["e", "F"]].forEach(([op, v]) => {
    if (op === "e") {
      if (count === MAXN) return f(`<b>Enqueue ${v}.</b> Count = ${count} = MaxSize, so the queue is <b>full</b>. Output "Queue full".`, [1, 2], [2, 3], { note: "Queue full: " + v + " rejected", nc: "t2" });
      f(`<b>Enqueue ${v}.</b> Is the queue full? Count ${count} ≠ ${MAXN}, so there is space.`, [1], [2]);
      const wrap = rear === MAXN - 1;
      rear = (rear + 1) % MAXN; q[rear] = v;
      f(`Rear ← (Rear + 1) MOD ${MAXN} = <b>${rear}</b>${wrap ? " (it wrapped round to the start!)" : ""}. Queue[${rear}] ← ${v}.`, [4, 5], [5, 6], { cls: { [rear]: "ok" } });
      count++; f(`Count ← ${count}.`, [6], [7], { cls: { [rear]: "ok" } });
    } else {
      f(`<b>Dequeue.</b> Is the queue empty? Count = ${count}, so there is an item.`, [11], [11]);
      const item = q[front]; f(`Item ← Queue[${front}] = <b>${item}</b>. The item at the front is read.`, [14], [14], { cls: { [front]: "warn" } });
      const old = front; front = (front + 1) % MAXN; f(`Front ← (Front + 1) MOD ${MAXN} = <b>${front}</b>. Slot ${old} is now free to reuse.`, [15], [15], { cls: { [old]: "warn" } });
      count--; f(`Count ← ${count}. Return <b>${item}</b>. The first item in was the first out: FIFO.`, [16, 17], [16, 17], { note: "Returned " + item, nc: "t3" });
    }
  });
  return F;
}

/* ====================== linked list in arrays ====================== */
function chain(st) { const out = []; let p = st.start, g = 0; while (p !== -1 && g++ < 12) { out.push(st.data[p]); p = st.ptr[p]; } return out; }
function freeSet(st) { const s = []; let p = st.free, g = 0; while (p !== -1 && p !== undefined && g++ < 12) { s.push(p); p = st.ptr[p]; } return s; }
function llView(st, o = {}) {
  const N = st.data.length, w = Math.min(64, Math.floor(490 / N) - 8), g = 8, x0 = 126, cd = {}, cp = {};
  const mark = (i, c) => { if (i >= 0 && i < N) { cd[i] = c; cp[i] = c; } };
  mark(o.prev, "warn"); mark(o.cur, "cur"); mark(o.nw, "ok");
  let s = hdr("Linked list stored in two arrays", o.right || "−1 = null");
  s += SV.text(14, 78, "Data", "lbl bd", { "text-anchor": "start" }) + SV.text(14, 128, "Pointer", "lbl bd", { "text-anchor": "start" }) + SV.text(14, 50, "Index", "sm", { "text-anchor": "start" });
  st.data.forEach((_, i) => (s += SV.text(x0 + i * (w + g) + w / 2, 50, i, "sm bd", { "text-anchor": "middle" })));
  s += Lib.cells(st.data, { x0, y: 58, w, h: 38, gap: g, idx: false, cls: cd, dim: freeSet(st) });
  s += Lib.cells(st.ptr, { x0, y: 108, w, h: 38, gap: g, idx: false, cls: cp });
  const vars = [["StartPointer", st.start], ["FreePtr", st.free]]; if (o.cur !== undefined) vars.push(["Current", o.cur]); if (o.prev !== undefined) vars.push(["Previous", o.prev]); if (o.nw !== undefined) vars.push(["NewPtr", o.nw]);
  s += SV.text(14, 182, vars.map(([k, v]) => `${k} = ${v}`).join("    "), "lbl bd", { "text-anchor": "start", style: MONO + "font-size:13.5px" });
  s += SV.text(14, 212, "Shaded data cells are free nodes (on the free list).", "sm", { "text-anchor": "start" });
  const ch = chain(st); s += SV.text(14, 252, "List order:", "lbl bd", { "text-anchor": "start" });
  let x = 104; ch.forEach((v, i) => { s += SV.rect(x, 234, 48, 28, "cell cell-cur", { rx: 6 }) + SV.text(x + 24, 253, v, "lbl bd", { "text-anchor": "middle", style: MONO }); if (i < ch.length - 1) s += SV.line(x + 48, 248, x + 66, 248, "ax") + SV.arrowHead(x + 68, 248, "r", "dot1"); x += 74; });
  s += SV.text(x + 2, 253, "→ null", "sm bd", { "text-anchor": "start" });
  return s + note(o.note, o.nc, 292);
}
const LL0 = () => ({ data: [20, 50, 10, 40, null, null], ptr: [3, -1, 0, 1, 5, -1], start: 2, free: 4 });
function liFrames() {
  const st = LL0(), F = [];
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: llView({ data: [...st.data], ptr: [...st.ptr], start: st.start, free: st.free }, o) });
  f("The list holds <b>10 → 20 → 40 → 50</b> in ascending order, but the nodes are stored out of order in the arrays. Nodes 4 and 5 are free. Insert 30.", [], []);
  f(`Is the list full? FreePtr = ${st.free}, not −1, so a free node is available.`, [1], [2]);
  const nw = st.free; f(`NewPtr ← FreePtr = <b>${nw}</b>. This free node will hold the new item.`, [4], [5], { nw });
  st.free = st.ptr[nw]; f(`FreePtr ← Pointer[${nw}] = <b>${st.free}</b>. The next free node is now at the front of the free list.`, [5], [6], { nw });
  st.data[nw] = 30; f(`Data[${nw}] ← <b>30</b>.`, [6], [7], { nw });
  let cur = st.start, prev = -1; f(`Start at the head of the list: Current ← ${cur}, Previous ← −1.`, [7, 8], [8, 9], { nw, cur, prev: -1 });
  while (cur !== -1 && st.data[cur] < 30) {
    f(`Is Data[${cur}] &lt; 30? ${st.data[cur]} &lt; 30 is true, so keep going.`, [9], [10], { nw, cur, prev });
    prev = cur; cur = st.ptr[cur]; f(`Previous ← ${prev}, Current ← Pointer[${prev}] = <b>${cur}</b>.`, [10, 11], [11, 12], { nw, cur, prev });
  }
  f(`Is Data[${cur}] &lt; 30? ${st.data[cur]} &lt; 30 is false, so stop. 30 belongs <b>between ${st.data[prev]} and ${st.data[cur]}</b>.`, [9], [10], { nw, cur, prev });
  st.ptr[nw] = cur; f(`Pointer[${nw}] ← Current = <b>${cur}</b>. The new node now points on to ${st.data[cur]}.`, [13], [13], { nw, cur, prev });
  st.ptr[prev] = nw; f(`Previous is not −1, so Pointer[${prev}] ← NewPtr = <b>${nw}</b>. ${st.data[prev]} now points to the new node. No other item moved.`, [14, 16, 17], [14, 16, 17], { nw, prev, note: "Inserted: " + chain(st).join(" → "), nc: "t3" });
  return F;
}
function ldFrames() {
  const st = { data: [20, 50, 10, 40, 30, null], ptr: [4, -1, 0, 1, 3, -1], start: 2, free: 5 }, F = [];
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: llView({ data: [...st.data], ptr: [...st.ptr], start: st.start, free: st.free }, o) });
  f("The list holds <b>10 → 20 → 30 → 40 → 50</b>. Delete 20.", [], []);
  let cur = st.start, prev = -1; f(`Start at the head: Current ← ${cur}, Previous ← −1.`, [1, 2], [2, 3], { cur, prev: -1 });
  while (cur !== -1 && st.data[cur] !== 20) {
    f(`Is Data[${cur}] ≠ 20? ${st.data[cur]} ≠ 20, so keep looking.`, [3], [4], { cur, prev });
    prev = cur; cur = st.ptr[cur]; f(`Previous ← ${prev}, Current ← Pointer[${prev}] = <b>${cur}</b>.`, [4, 5], [5, 6], { cur, prev });
  }
  f(`Data[${cur}] = 20, so the loop stops. Found at node ${cur}, with the previous node ${prev}.`, [3], [4], { cur, prev });
  f(`Current is not −1, so the item was found. Previous is not −1, so it is not the first node.`, [7, 9, 10], [7, 9, 10], { cur, prev });
  const nxt = st.ptr[cur]; st.ptr[prev] = nxt; f(`Pointer[${prev}] ← Pointer[${cur}] = <b>${nxt}</b>. Node ${prev} (value 10) now skips over 20 and points straight to 30.`, [12, 13], [12, 13], { cur, prev });
  st.ptr[cur] = st.free; f(`Pointer[${cur}] ← FreePtr = ${st.free}. The deleted node is linked to the front of the free list.`, [15], [14], { cur, prev });
  st.free = cur; f(`FreePtr ← <b>${cur}</b>. Node ${cur} can be reused by the next insertion. 20 is gone from the list, but nothing moved.`, [16], [15], { prev, note: "Deleted: " + chain(st).join(" → "), nc: "t3" });
  return F;
}

/* ====================== binary tree ====================== */
const bstIns = (root, v) => { const n = { v, l: null, r: null }; if (!root) return n; let c = root; for (;;) { if (v < c.v) { if (!c.l) { c.l = n; break; } c = c.l; } else { if (!c.r) { c.r = n; break; } c = c.r; } } return root; };
const buildT = (arr) => arr.reduce(bstIns, null);
function layoutT(root) { const pos = new Map(); let k = 0, maxD = 0; const rec = (n, d) => { if (!n) return; rec(n.l, d + 1); pos.set(n.v, { n, rank: k++, d }); maxD = Math.max(maxD, d); rec(n.r, d + 1); }; rec(root, 0); return { pos, N: k, maxD }; }
function treeSvg(root, o = {}) {
  const { pos, N } = layoutT(root), WW = o.W || W, dy = o.dy || 54, y0 = o.y0 || 62, xs = N > 1 ? Math.min(78, (WW - 70) / (N - 1)) : 0, X = (p) => WW / 2 + (p.rank - (N - 1) / 2) * xs, Y = (p) => y0 + p.d * dy;
  const show = o.show || new Set(pos.keys()), cls = o.cls || {}, on = o.edges || new Set(), badge = o.badge || {};
  let s = "";
  pos.forEach((p, v) => { if (!show.has(v)) return; [p.n.l, p.n.r].forEach((c) => { if (c && show.has(c.v)) { const q = pos.get(c.v), e = on.has(v + ">" + c.v); s += SV.line(X(p), Y(p), X(q), Y(q), e ? "edge-on" : "edge"); } }); });
  pos.forEach((p, v) => { if (!show.has(v)) return; s += SV.circle(X(p), Y(p), 20, "nd" + (cls[v] ? " nd-" + cls[v] : "")) + SV.text(X(p), Y(p) + 6, v, "lbl bd", { "text-anchor": "middle", style: MONO + "font-size:15px" }); if (badge[v]) s += SV.text(X(p) + 22, Y(p) - 16, badge[v], "sm bd t4", { "text-anchor": "middle", style: "font-size:13px" }); });
  return s;
}
function biFrames() {
  const base = [50, 30, 70, 20, 40, 60, 80], NEW = 45, final = buildT([...base, NEW]), F = [], show = new Set(base);
  const f = (cap, ps, py, o = {}) => F.push({ cap, ps, py, svg: hdr("Binary search tree: insert " + NEW) + treeSvg(final, { show, cls: o.cls, edges: o.edges, y0: 74 }) + note(o.note, o.nc, 238) });
  f(`A binary search tree built from 50, 30, 70, 20, 40, 60, 80. Insert <b>${NEW}</b>. Smaller values go left, larger go right.`, [], []);
  f(`The tree is not empty (Root ≠ NULL), so Current ← Root = <b>50</b>.`, [1, 4, 5], [1, 3, 4], { cls: { 50: "cur" } });
  let cur = buildT(base), edges = new Set();
  for (;;) {
    const left = NEW < cur.v, nxt = left ? cur.l : cur.r;
    f(`Is ${NEW} &lt; ${cur.v}? ${left ? "Yes" : "No"}, so go <b>${left ? "left" : "right"}</b>.`, [left ? 7 : 14], [left ? 6 : 12], { cls: { [cur.v]: "cur" }, edges });
    if (nxt) { f(`${left ? "Left" : "Right"} child of ${cur.v} is ${nxt.v}, which is not NULL. Current ← ${nxt.v}.`, left ? [8, 11, 12] : [15, 18, 19], left ? [7, 10, 11] : [13, 16, 17], { cls: { [nxt.v]: "cur" }, edges: new Set([...edges, cur.v + ">" + nxt.v]) }); edges.add(cur.v + ">" + nxt.v); cur = nxt; }
    else { show.add(NEW); f(`${left ? "Left" : "Right"} child of ${cur.v} is NULL, so create the new node here. <b>${NEW} is inserted</b> as the ${left ? "left" : "right"} child of ${cur.v}.`, left ? [8, 9, 10] : [15, 16, 17], left ? [7, 8, 9] : [13, 14, 15], { cls: { [NEW]: "ok" }, edges: new Set([...edges, cur.v + ">" + NEW]), note: "Inserted after 3 comparisons: 50, 30, 40", nc: "t3" }); break; }
  }
  return F;
}
function trFrames() {
  const root = buildT([40, 20, 60, 10, 30]), F = [], out = [], seen = {};
  const f = (cap, ps, py, cur, nul) => F.push({ cap, ps, py, svg: hdr("In-order traversal") + treeSvg(root, { cls: { ...seen, ...(cur !== undefined ? { [cur]: "cur" } : {}) }, y0: 70 }) + SV.text(14, 214, "Output: " + (out.join(", ") || "(nothing yet)"), "lbl bd t3", { "text-anchor": "start", style: MONO }) + (nul ? SV.text(W / 2, 238, nul, "lbl bd t2", { "text-anchor": "middle" }) : "") });
  f("Call InOrder on the root. Output starts empty.", [], []);
  const rec = (n, parent) => {
    if (!n) return f(`<b>InOrder(NULL)</b>: there is no node, so nothing happens and the call returns to ${parent}.`, [1], [1], parent, "NULL: return");
    f(`<b>InOrder(${n.v})</b>: the node is not NULL, so first call InOrder on its <b>left</b> child.`, [1, 2], [1, 2], n.v);
    rec(n.l, n.v);
    out.push(n.v); seen[n.v] = "seen"; f(`Left subtree finished. <b>OUTPUT ${n.v}</b>, then call InOrder on its <b>right</b> child.`, [3, 4], [3, 4], n.v);
    rec(n.r, n.v);
  };
  rec(root, "the caller");
  F.push({ cap: "Every call has returned. The output <b>10, 20, 30, 40, 60</b> is in ascending order: an in-order traversal of a binary search tree gives sorted data.", ps: [], py: [], svg: hdr("In-order traversal") + treeSvg(root, { cls: seen, y0: 70 }) + SV.text(14, 214, "Output: " + out.join(", "), "lbl bd t3", { "text-anchor": "start", style: MONO }) });
  return F;
}

Lib.algo($("#aStk"), { w: W, h: 250, label: "Stack animation", pseudo: STK_PS, py: STK_PY, dwell: 1900, frames: stkFrames() });
Lib.algo($("#aQue"), { w: W, h: 250, label: "Circular queue animation", pseudo: QUE_PS, py: QUE_PY, dwell: 1900, frames: queFrames() });
Lib.algo($("#aIns"), { w: W, h: 305, label: "Linked list insertion animation", pseudo: LI_PS, py: LI_PY, dwell: 2400, frames: liFrames() });
Lib.algo($("#aDel"), { w: W, h: 305, label: "Linked list deletion animation", pseudo: LD_PS, py: LD_PY, dwell: 2400, frames: ldFrames() });
Lib.algo($("#aBst"), { w: W, h: 250, label: "Binary search tree insertion animation", pseudo: BI_PS, py: BI_PY, dwell: 2400, frames: biFrames() });
Lib.algo($("#aTrv"), { w: W, h: 250, label: "In-order traversal animation", pseudo: TR_PS, py: TR_PY, dwell: 1800, frames: trFrames() });

/* ====================== labs ====================== */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
function labShell(el, svgH) {
  el.innerHTML = `<svg viewBox="0 0 ${W} ${svgH}" role="img" aria-label="Interactive diagram"></svg><div class="pick" data-c></div><div class="msg" aria-live="polite"></div>`;
  return { svg: $("svg", el), ctl: $("[data-c]", el), msg: $(".msg", el) };
}
const mkCtl = (ctl, items) => items.forEach(([k, label, cls]) => { if (k === "num") { ctl.insertAdjacentHTML("beforeend", `<label>Value <input type="number" min="1" max="99" value="${label}" aria-label="Value"></label>`); } else ctl.insertAdjacentHTML("beforeend", `<button class="b ${cls || ""}" data-k="${k}">${label}</button>`); });

/* ---- Lab 1: stack ---- */
(() => {
  const { svg, ctl, msg } = labShell($("#lab1"), 250); const MAXN = 6; let st, top;
  mkCtl(ctl, [["num", rnd(10, 99)], ["push", "Push", "pri"], ["pop", "Pop"], ["peek", "Peek"], ["reset", "Reset"]]);
  const inp = $("input", ctl), draw = (m, bad, cls) => { svg.innerHTML = stkView([...st], top, MAXN, cls ? { cls } : {}); msg.textContent = m || ""; msg.style.color = bad ? "var(--bad)" : "var(--good)"; };
  const reset = () => { st = Array(MAXN).fill(null); top = -1; inp.value = rnd(10, 99); draw("Empty stack. Push something."); };
  ctl.onclick = (e) => { const k = e.target.dataset.k; if (!k) return;
    if (k === "reset") return reset();
    if (k === "push") { const v = +inp.value || rnd(10, 99); if (top === MAXN - 1) return draw(`Stack full: ${v} rejected. Pop something first.`, true, { [top]: "no" }); top++; st[top] = v; inp.value = rnd(10, 99); return draw(`Pushed ${v}. TopPointer = ${top}.`, false, { [top]: "ok" }); }
    if (top === -1) return draw(k === "pop" ? "Stack empty: nothing to pop." : "Stack empty: nothing to peek at.", true);
    if (k === "peek") return draw(`Peek: the top item is ${st[top]}. It stays on the stack.`, false, { [top]: "cur" });
    const v = st[top]; top--; draw(`Popped ${v}. TopPointer = ${top}. The last item in was the first out.`, false); };
  reset();
})();

/* ---- Lab 2: circular queue ---- */
(() => {
  const { svg, ctl, msg } = labShell($("#lab2"), 250); const MAXN = 6; let q, front, rear, count, nextL;
  mkCtl(ctl, [["enq", "Enqueue", "pri"], ["deq", "Dequeue"], ["reset", "Reset"]]);
  const draw = (m, bad, cls) => { svg.innerHTML = queView([...q], front, rear, count, MAXN, cls ? { cls } : {}); msg.textContent = m || ""; msg.style.color = bad ? "var(--bad)" : "var(--good)"; };
  const reset = () => { q = Array(MAXN).fill(null); front = 0; rear = -1; count = 0; nextL = 0; draw("Empty queue. Enqueue some items."); };
  ctl.onclick = (e) => { const k = e.target.dataset.k; if (!k) return;
    if (k === "reset") return reset();
    if (k === "enq") { const v = String.fromCharCode(65 + (nextL++ % 26)); if (count === MAXN) { nextL--; return draw(`Queue full: ${v} rejected. Dequeue first.`, true); } const wrap = rear === MAXN - 1; rear = (rear + 1) % MAXN; q[rear] = v; count++; return draw(`Enqueued ${v} at index ${rear}${wrap ? ". Rear wrapped round to the start" : ""}.`, false, { [rear]: "ok" }); }
    if (count === 0) return draw("Queue empty: nothing to dequeue.", true);
    const v = q[front], old = front; front = (front + 1) % MAXN; count--; draw(`Dequeued ${v} from index ${old}. First in, first out. The slot can be reused.`, false, { [old]: "warn" }); };
  reset();
})();

/* ---- Lab 3: linked list ---- */
(() => {
  const { svg, ctl, msg } = labShell($("#lab3"), 305); let st;
  mkCtl(ctl, [["num", 30], ["ins", "Insert", "pri"], ["del", "Delete"], ["reset", "Reset"]]);
  const inp = $("input", ctl), draw = (m, bad, o) => { svg.innerHTML = llView({ data: [...st.data], ptr: [...st.ptr], start: st.start, free: st.free }, o); msg.textContent = m || ""; msg.style.color = bad ? "var(--bad)" : "var(--good)"; };
  const reset = () => { st = { data: [20, 50, 10, 40, null, null, null, null], ptr: [3, -1, 0, 1, 5, 6, 7, -1], start: 2, free: 4 }; draw("List: 10 → 20 → 40 → 50. Try inserting 30, then deleting 10."); };
  ctl.onclick = (e) => { const k = e.target.dataset.k; if (!k) return;
    if (k === "reset") return reset();
    const v = +inp.value; if (!v) return draw("Enter a value from 1 to 99.", true);
    if (k === "ins") {
      if (st.free === -1) return draw("List full: there are no free nodes. Delete something first.", true);
      const nw = st.free; st.free = st.ptr[nw]; st.data[nw] = v; let cur = st.start, prev = -1;
      while (cur !== -1 && st.data[cur] < v) { prev = cur; cur = st.ptr[cur]; }
      st.ptr[nw] = cur; if (prev === -1) st.start = nw; else st.ptr[prev] = nw;
      return draw(`Inserted ${v} in node ${nw}. ${prev === -1 ? "It is the new first node, so StartPointer changed." : `Pointer[${prev}] now points to it.`} Nothing else moved.`, false, { nw, prev: prev === -1 ? undefined : prev });
    }
    let cur = st.start, prev = -1; while (cur !== -1 && st.data[cur] !== v) { prev = cur; cur = st.ptr[cur]; }
    if (cur === -1) return draw(`${v} is not in the list.`, true);
    if (prev === -1) st.start = st.ptr[cur]; else st.ptr[prev] = st.ptr[cur];
    st.ptr[cur] = st.free; st.free = cur; st.data[cur] = st.data[cur];
    draw(`Deleted ${v} from node ${cur}. ${prev === -1 ? "It was the first node, so StartPointer moved on." : `Pointer[${prev}] now skips it.`} Node ${cur} returned to the free list.`, false, {});
  };
  reset();
})();

/* ---- Lab 4: BST builder ---- */
(() => {
  const el = $("#lab4"); let vals = [50, 30, 70, 20, 40], timer = 0, step = 0, order = [];
  el.innerHTML = `<svg viewBox="0 0 ${W} 300" role="img" aria-label="Binary search tree"></svg>
    <div class="pick"><label>Value <input type="number" min="1" max="99" value="45" aria-label="Value"></label><button class="b pri" data-k="add">Add</button><button class="b" data-k="rand">Random value</button><button class="b" data-k="clear">Clear</button></div>
    <div class="pick"><label>Traversal <select aria-label="Traversal"><option value="pre">Pre-order (node, left, right)</option><option value="in" selected>In-order (left, node, right)</option><option value="post">Post-order (left, right, node)</option></select></label><button class="b pri" data-k="play">▶ Play traversal</button></div>
    <div class="listrow" data-o></div><div class="msg" aria-live="polite"></div>`;
  const svg = $("svg", el), inp = $("input", el), sel = $("select", el), out = $("[data-o]", el), msg = $(".msg", el);
  const trav = (n, k, a = []) => { if (!n) return a; if (k === "pre") a.push(n.v); trav(n.l, k, a); if (k === "in") a.push(n.v); trav(n.r, k, a); if (k === "post") a.push(n.v); return a; };
  const draw = () => {
    const root = buildT(vals), { maxD } = layoutT(root), H = Math.max(120, 60 + maxD * 54 + 40), cls = {}, badge = {};
    order.slice(0, step).forEach((v, i) => { cls[v] = "seen"; badge[v] = i + 1; }); if (step > 0 && step <= order.length) cls[order[step - 1]] = "cur";
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = vals.length ? treeSvg(root, { cls, badge, y0: 40 }) : SV.text(W / 2, 60, "Empty tree. Add a value.", "lbl", { "text-anchor": "middle" });
    out.textContent = step ? "Output: " + order.slice(0, step).join(", ") : "Insertion order: " + (vals.join(", ") || "(none)");
  };
  const stop = () => { clearInterval(timer); timer = 0; };
  const add = (v) => { if (!v || v < 1 || v > 99) { msg.textContent = "Enter a value from 1 to 99."; msg.style.color = "var(--bad)"; return; } if (vals.includes(v)) { msg.textContent = v + " is already in the tree."; msg.style.color = "var(--bad)"; return; } if (vals.length >= 12) { msg.textContent = "The tree is full for this demo (12 values)."; msg.style.color = "var(--bad)"; return; }
    stop(); step = 0; vals.push(v); msg.textContent = `Added ${v}. Smaller goes left, larger goes right from the root.`; msg.style.color = "var(--good)"; inp.value = rnd(1, 99); draw(); };
  el.onclick = (e) => { const k = e.target.dataset.k; if (!k) return;
    if (k === "add") add(+inp.value);
    if (k === "rand") { inp.value = rnd(1, 99); }
    if (k === "clear") { stop(); vals = []; step = 0; msg.textContent = ""; draw(); }
    if (k === "play") { stop(); if (!vals.length) return; order = trav(buildT(vals), sel.value); step = 0; msg.textContent = ""; draw(); timer = setInterval(() => { step++; draw(); if (step >= order.length) { stop(); msg.textContent = sel.value === "in" ? "In-order gives the values in ascending order." : sel.value === "pre" ? "Pre-order visits each node before its children." : "Post-order visits each node after its children."; msg.style.color = "var(--good)"; } }, reduced ? 0 : 700); }
  };
  sel.onchange = () => { stop(); step = 0; draw(); };
  draw();
})();

/* ====================== practise ====================== */
Lib.classify($("#cl1"), { prompt: "Drag each statement to the ADT it describes.", buckets: [{ label: "Stack" }, { label: "Queue" }, { label: "Linked list" }, { label: "Binary tree" }, { label: "Graph" }], items: [
  { text: "Roads between towns, each with a distance", b: 4 }, { text: "Vertices joined by directed or undirected edges, with cycles allowed", b: 4 },
  { text: "The undo button in an editor", b: 0 }, { text: "Documents waiting to be printed", b: 1 }, { text: "The browser's back button", b: 0 }, { text: "Items are added at the rear and removed from the front", b: 1 },
  { text: "Each node holds data and a pointer to the next node", b: 2 }, { text: "Each node has at most two children", b: 3 }, { text: "Storing return addresses during subroutine calls", b: 0 },
  { text: "Insertion only changes pointers, nothing is shifted", b: 2 }, { text: "In-order traversal outputs the data in sorted order", b: 3 }, { text: "Customers waiting at a till", b: 1 },
], done: "Stack: LIFO. Queue: FIFO. Linked list: pointers. Binary tree: two children per node. Graph: vertices and edges." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Push", "Add an item to the top of a stack"], ["Dequeue", "Remove the item at the front of a queue"], ["Peek", "Read the top item without removing it"],
  ["Null pointer", "A pointer value (here −1) that means there is no next node"], ["Free list", "A chain of unused nodes available for new items"], ["Leaf", "A tree node with no children"], ["Root", "The first node in a tree, with no parent"],
] });

Lib.order($("#o1"), { prompt: "Put the steps for inserting an item into an array-based linked list in the right order.", items: [
  "Check that the free list is not empty", "Set NewPtr to the free pointer", "Move the free pointer on to the next free node", "Store the new item in the new node",
  "Follow the pointers to find the node that comes before it", "Set the new node's pointer to the node that followed", "Set the previous node's pointer to the new node",
], done: "Take a free node, store the item, then change two pointers." });

Lib.calc($("#c1"), { qs: [
  { q: "A stack's TopPointer is 4 (arrays start at 0). How many items are on the stack?", a: 5, hint: "Indexes 0, 1, 2, 3, 4.", sol: "Indexes 0 to 4 are used: <b>5</b> items." },
  { q: "Push 4, push 7, push 1, pop, pop. What value is now at the top?", a: 4, hint: "Pop removes 1, then 7.", sol: "After the pops only 4 is left: <b>4</b>." },
  { q: "A circular queue has MaxSize 5 and Rear = 4. After one more enqueue, what is Rear?", a: 0, hint: "(Rear + 1) MOD MaxSize.", sol: "(4 + 1) MOD 5 = <b>0</b>. It wraps to the start." },
  { q: "A circular queue has MaxSize 6, Front = 4 and holds 3 items. What is Rear?", a: 0, hint: "The items are at indexes 4, 5, then wrap round.", sol: "Items at 4, 5, 0, so Rear = <b>0</b>. Or (4 + 3 − 1) MOD 6 = 0." },
  { q: "Data = [20, 50, 10, 40, _, _], Pointer = [3, −1, 0, 1, 5, −1], StartPointer = 2. What is the 3rd item in the list?", a: 40, hint: "Start at index 2, then follow Pointer[2], then Pointer of that.", sol: "Index 2 (10) → Pointer 0 (20) → Pointer 3 (40). The 3rd item is <b>40</b>." },
  { q: "A binary search tree is built by inserting 50, 30, 70, 20, 40. How many values is 45 compared with when it is inserted?", a: 3, hint: "50, then 30, then 40, then it finds an empty place.", sol: "45 &gt; 30? Path: 50 (go left), 30 (go right), 40 (go right, empty). <b>3</b> comparisons." },
  { q: "A binary search tree is built by inserting 8, 3, 10, 1, 6. What is the 3rd value output by an in-order traversal?", a: 6, hint: "In-order of a BST is sorted: 1, 3, 6, 8, 10.", sol: "Sorted order is 1, 3, 6, 8, 10. The 3rd value is <b>6</b>." },
] });

Lib.quiz($("#qz1"), { qs: [
  { q: "What is an abstract data type?", opts: ["A data structure stored in a fixed array", "A collection of data and the operations on it, without specifying how it is stored", "A type of pointer", "A program that sorts data"], a: 1, why: "An ADT defines the data and operations. The implementation (array, records, pointers) is hidden." },
  { q: "Which operation takes the most recently added item off a stack?", opts: ["Enqueue", "Dequeue", "Push", "Pop"], a: 3, why: "Pop removes the top item. A stack is last in, first out." },
  { q: "A circular queue has MaxSize 8 and Rear = 7. After an enqueue, Rear is…", opts: ["8", "0", "7", "1"], a: 1, why: "(7 + 1) MOD 8 = 0. The pointer wraps to the start of the array." },
  { q: "What is the main advantage of a linked list over an array for inserting in the middle?", opts: ["Direct access to any item", "No pointers are needed", "Only pointers change, so no items are shifted", "It uses less memory"], a: 2, why: "Inserting only changes two pointers. Arrays must shift items along. Linked lists do need extra memory for pointers." },
  { q: "Which traversal of a binary search tree outputs the values in ascending order?", opts: ["Pre-order", "In-order", "Post-order", "Level order"], a: 1, why: "In-order visits left subtree, node, right subtree, which gives sorted order for a BST." },
  { q: "A graph has many vertices but very few edges. Which storage is usually better?", opts: ["Adjacency matrix", "Adjacency list", "A stack", "A queue"], a: 1, why: "A matrix needs n × n cells whatever the number of edges. A list stores only the edges that exist." },
  { q: "After deleting a node from an array-based linked list, what should happen to the deleted node?", opts: ["Its data is shifted up", "It is added to the free list", "It stays as the start pointer", "Its pointer is set to the root"], a: 1, why: "The node's pointer is set to the old free pointer and the free pointer is set to the node, so it can be reused." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Abstract data type (ADT)", "A collection of data and the operations that can be performed on it, defined without saying how it is stored."], ["Stack", "A last in, first out (LIFO) ADT where items are added and removed at the top."],
  ["Push / Pop / Peek", "Add to the top / remove from the top / read the top without removing it."], ["Queue", "A first in, first out (FIFO) ADT: add at the rear, remove from the front."],
  ["Enqueue / Dequeue", "Add an item at the rear of a queue / remove the item at the front."], ["Circular queue", "A queue in an array whose pointers wrap round using MOD, so freed space is reused."],
  ["Linked list", "A chain of nodes, each holding data and a pointer to the next node."], ["Node", "One element of a linked list or tree, holding data and pointer(s)."],
  ["Null pointer", "A pointer value meaning there is no node to point to; the end of a list."], ["Start pointer", "The pointer to the first node of a linked list."], ["Free list", "A linked chain of unused nodes, ready for new items."],
  ["Binary tree", "A tree where each node has at most two children, left and right."], ["Root / Leaf", "The first node of a tree / a node with no children."],
  ["Graph", "An ADT of vertices joined by edges, which may be directed or weighted."], ["Adjacency matrix / list", "Two ways to store a graph: a 2D array of edges, or a list of neighbours for each vertex."],
  ["Pre-order", "Traverse node, then left subtree, then right subtree."], ["In-order", "Traverse left subtree, node, right subtree. Sorted output for a binary search tree."], ["Post-order", "Traverse left subtree, right subtree, then the node."],
] });

/* ---- Graph additions ---- */
const GG = { directed: false, weighted: true, nodes: [{ id: "A", x: 45, y: 130 }, { id: "B", x: 140, y: 55 }, { id: "C", x: 140, y: 205 }, { id: "D", x: 245, y: 55 }, { id: "E", x: 320, y: 140 }],
  edges: [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2]] };
$("#gLearn").innerHTML = `<div class="grid2"><div class="lab"><svg viewBox="0 0 360 250" role="img" aria-label="A weighted undirected graph">${Lib.graphSvg(GG)}</svg></div><div>${Lib.matrixHtml(GG)}<p class="note">– means no edge. Symmetric, because the graph is undirected.</p></div></div>${Lib.listHtml(GG)}`;
(() => {
  const el = $("#lab5"), A = Lib.adjOf(GG);
  el.innerHTML = `<svg viewBox="0 0 360 250" role="img" aria-label="Graph with a chosen vertex"></svg><div class="pick"><label>Vertex <select>${GG.nodes.map((n) => `<option>${n.id}</option>`).join("")}</select></label></div><div class="msg" aria-live="polite"></div><div data-m></div>`;
  const svg = $("svg", el), sel = $("select", el), msg = $(".msg", el);
  const run = () => { const v = sel.value, nb = A.get(v), cls = { [v]: "cur" }, on = new Set(); nb.forEach(([b]) => { cls[b] = "ok"; on.add(v + "-" + b); });
    svg.innerHTML = Lib.graphSvg(GG, { cls, on }); msg.style.color = "var(--good)";
    msg.textContent = `${v} has ${nb.length} neighbours: ${nb.map(([b, w]) => `${b} (weight ${w})`).join(", ")}. In the matrix, read row ${v}; in the list, read ${v}'s entry.`;
    $("[data-m]", el).innerHTML = `<div class="grid2"><div>${Lib.matrixHtml(GG)}</div><div>${Lib.listHtml(GG)}</div></div>`; };
  sel.onchange = run; run();
})();
