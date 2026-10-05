const W = 640, MONO = "font-family:var(--mono);", INF = Infinity;
const hdr = (t) => SV.text(14, 26, t, "lbl bd", { "text-anchor": "start" });
/* demo graph (weighted, undirected), drawn in a 360 x 250 box */
const GD = { directed: false, weighted: true,
  nodes: [{ id: "A", x: 45, y: 130 }, { id: "B", x: 140, y: 55 }, { id: "C", x: 140, y: 205 }, { id: "D", x: 245, y: 55 }, { id: "E", x: 320, y: 140 }],
  edges: [["A", "B", 4], ["A", "C", 2], ["B", "C", 1], ["B", "D", 5], ["C", "D", 8], ["C", "E", 10], ["D", "E", 2]] };
const shifted = (g, dx, dy) => ({ ...g, nodes: g.nodes.map((n) => ({ ...n, x: n.x + dx, y: n.y + dy })) });

function dijkstra(g, s) {
  const A = Lib.adjOf(g), dist = {}, prev = {}, done = new Set(), order = [];
  g.nodes.forEach((n) => { dist[n.id] = INF; prev[n.id] = null; }); dist[s] = 0;
  while (done.size < g.nodes.length) {
    let cur = null; g.nodes.forEach((n) => { if (!done.has(n.id) && dist[n.id] < INF && (cur === null || dist[n.id] < dist[cur])) cur = n.id; });
    if (cur === null) break; done.add(cur); order.push(cur);
    A.get(cur).forEach(([nb, w]) => { if (!done.has(nb) && dist[cur] + w < dist[nb]) { dist[nb] = dist[cur] + w; prev[nb] = cur; } });
  }
  return { dist, prev, order };
}
const pathTo = (prev, t) => { const p = []; for (let v = t; v; v = prev[v]) p.unshift(v); return p; };
const fmtD = (d) => (d === INF ? "∞" : d);

/* ---------- Learn: same graph three ways ---------- */
(() => {
  const el = $("#learnGraph");
  el.innerHTML = `<div class="two"><div class="lab"><svg viewBox="0 0 360 250" role="img" aria-label="A weighted undirected graph with five vertices">${Lib.graphSvg(GD)}</svg></div><div>${Lib.matrixHtml(GD)}<p class="note">Weighted matrix: – means no edge. It is symmetric because the graph is undirected.</p></div></div>${Lib.listHtml(GD)}`;
})();

/* ---------- Watch 1: building the matrix ---------- */
function matSvg(k) {
  const g = { ...GD, edges: GD.edges.slice(0, k) }, last = k > 0 ? GD.edges[k - 1] : null, ids = GD.nodes.map((n) => n.id), x0 = 420, y0 = 70, c = 40;
  let s = hdr(k ? `Edge ${k} of ${GD.edges.length}` : "No edges added yet") + `<g transform="translate(0,16)">` + Lib.graphSvg(g, { on: last ? new Set([last[0] + "-" + last[1]]) : new Set() }) + "</g>";
  s += SV.text(x0 + (5 * c) / 2, 50, "Adjacency matrix", "lbl bd", { "text-anchor": "middle" });
  ids.forEach((id, i) => { s += SV.text(x0 + (i + 0.5) * c, y0 - 6, id, "lbl bd", { "text-anchor": "middle" }) + SV.text(x0 - 14, y0 + (i + 0.5) * c + 5, id, "lbl bd", { "text-anchor": "middle" }); });
  ids.forEach((a, r) => ids.forEach((b, q) => {
    const e = g.edges.find(([x, y]) => (x === a && y === b) || (x === b && y === a)), hot = last && ((last[0] === a && last[1] === b) || (last[0] === b && last[1] === a));
    s += SV.rect(x0 + q * c, y0 + r * c, c - 2, c - 2, "cell" + (hot ? " cell-warn" : e ? " cell-cur" : ""), { rx: 5 }) + SV.text(x0 + (q + 0.5) * c - 1, y0 + (r + 0.5) * c + 5, e ? e[2] : "–", "lbl bd", { "text-anchor": "middle", style: MONO + (e ? "" : "opacity:.35") });
  }));
  return s;
}
Lib.stepper($("#stMat"), { w: W, h: 290, label: "Building an adjacency matrix", base: { k: 0 }, tween: 1, dwell: 2500, draw: (s) => matSvg(Math.round(s.k)), steps: [
  { cap: "A weighted, undirected graph with 5 vertices. The matrix is empty: no edges yet. – means no edge.", s: { k: 0 } },
  ...GD.edges.map(([a, b, w], i) => ({ cap: `Edge ${a}–${b} has weight <b>${w}</b>. It is undirected, so it fills <b>two</b> cells: row ${a}, column ${b} and row ${b}, column ${a}.`, s: { k: i + 1 } })),
  { cap: "All 7 edges added: 14 filled cells, mirrored across the diagonal. An undirected matrix is always <b>symmetric</b>.", s: { k: 7 } },
] });

/* ---------- Watch 2: Dijkstra ---------- */
const DJ_PS = ["FOR EACH v IN Vertices", "   Dist[v] ← INFINITY", "   Prev[v] ← NULL", "   Visited[v] ← FALSE", "NEXT v", "Dist[Start] ← 0", "REPEAT", "   Current ← unvisited vertex with smallest Dist", "   Visited[Current] ← TRUE", "   FOR EACH Neighbour OF Current", "      IF Visited[Neighbour] = FALSE THEN", "         NewDist ← Dist[Current] + Weight(Current, Neighbour)", "         IF NewDist < Dist[Neighbour] THEN", "            Dist[Neighbour] ← NewDist", "            Prev[Neighbour] ← Current", "         ENDIF", "      ENDIF", "   NEXT Neighbour", "UNTIL all vertices are visited"];
const DJ_PY = ["dist = {v: INF for v in graph}", "prev = {v: None for v in graph}", "dist[start] = 0", "visited = set()", "while len(visited) < len(graph):", "    current = min((v for v in graph if v not in visited), key=dist.get)", "    visited.add(current)", "    for neighbour, w in graph[current].items():", "        if neighbour not in visited:", "            new = dist[current] + w", "            if new < dist[neighbour]:", "                dist[neighbour] = new", "                prev[neighbour] = current"];
function djSvg(S, o = {}) {
  const cls = {}; S.done.forEach((v) => (cls[v] = "ok")); if (o.cur) cls[o.cur] = "cur"; if (o.nb) cls[o.nb] = "warn";
  const sub = {}; GD.nodes.forEach((n) => (sub[n.id] = fmtD(S.dist[n.id])));
  let s = hdr("Dijkstra's algorithm: start at A") + `<g transform="translate(0,18)">` + Lib.graphSvg(GD, { cls, sub, on: new Set(o.on || []) }) + "</g>";
  const cx = [400, 455, 515, 580], head = ["Vertex", "Dist", "Prev", "Done"];
  head.forEach((h, i) => (s += SV.text(cx[i], 52, h, "sm bd", { "text-anchor": "middle" })));
  GD.nodes.forEach((n, r) => {
    const y = 84 + r * 32, hot = o.changed === n.id, v = n.id;
    s += SV.rect(cx[0] - 28, y - 21, 236, 28, "cell" + (hot ? " cell-ok" : o.cur === v ? " cell-cur" : ""), { rx: 6 });
    [v, fmtD(S.dist[v]), S.prev[v] || "–", S.done.has(v) ? "✓" : ""].forEach((t, i) => (s += SV.text(cx[i], y - 1, t, "lbl bd" + (hot && i === 1 ? " t3" : ""), { "text-anchor": "middle", style: MONO })));
  });
  if (o.note) s += SV.text(W / 2, 282, o.note, "lbl bd " + (o.nc || ""), { "text-anchor": "middle" });
  return s;
}
function djFrames() {
  const A = Lib.adjOf(GD), S = { dist: {}, prev: {}, done: new Set() }, F = [];
  GD.nodes.forEach((n) => { S.dist[n.id] = INF; S.prev[n.id] = null; }); S.dist.A = 0;
  const snap = () => ({ dist: { ...S.dist }, prev: { ...S.prev }, done: new Set(S.done) });
  const f = (cap, ps, py, o) => F.push({ cap, ps, py, svg: djSvg(snap(), o) });
  f("Every distance starts at ∞ and every Prev at nothing. The start vertex A gets distance <b>0</b>. Nothing is visited.", [0, 1, 2, 3, 4, 5], [0, 1, 2, 3]);
  while (S.done.size < GD.nodes.length) {
    let cur = null; GD.nodes.forEach((n) => { if (!S.done.has(n.id) && S.dist[n.id] < INF && (cur === null || S.dist[n.id] < S.dist[cur])) cur = n.id; });
    if (cur === null) break;
    S.done.add(cur); f(`The unvisited vertex with the smallest distance is <b>${cur}</b> (${S.dist[cur]}). Mark it visited: its distance is now final.`, [7, 8], [5, 6], { cur });
    A.get(cur).forEach(([nb, w]) => {
      if (S.done.has(nb)) return;
      const nd = S.dist[cur] + w, better = nd < S.dist[nb], old = S.dist[nb];
      if (better) { S.dist[nb] = nd; S.prev[nb] = cur; }
      f(`${cur} → ${nb}: ${S.dist[cur]} + ${w} = <b>${nd}</b>. ${better ? `That is less than ${fmtD(old)}, so update Dist[${nb}] = ${nd} and Prev[${nb}] = ${cur}.` : `That is not less than ${fmtD(old)}, so no change.`}`, better ? [9, 10, 11, 12, 13, 14] : [9, 10, 11, 12], better ? [7, 8, 9, 10, 11, 12] : [7, 8, 9, 10], { cur, nb, on: [cur + "-" + nb], changed: better ? nb : null });
    });
  }
  const p = pathTo(S.prev, "E"), on = p.slice(1).map((v, i) => p[i] + "-" + v);
  f(`All vertices are visited. Follow Prev back from E: <b>${p.join(" → ")}</b>, total <b>${S.dist.E}</b>.`, [18], [4], { on, note: `Shortest A to E: ${p.join(" → ")} = ${S.dist.E}`, nc: "t3" });
  return F;
}
Lib.algo($("#aDij"), { w: W, h: 295, label: "Dijkstra's algorithm animation", pseudo: DJ_PS, py: DJ_PY, dwell: 2600, frames: djFrames() });

/* ---------- Lab 1: graph builder ---------- */
(() => {
  const el = $("#lab1"), ids = "ABCDEF".split(""), pos = { A: [90, 60], B: [250, 40], C: [410, 60], D: [90, 190], E: [250, 215], F: [410, 190] };
  const start = () => ({ directed: false, weighted: false, nodes: ids.map((id) => ({ id, x: pos[id][0] + 70, y: pos[id][1] })), edges: [["A", "B", 3], ["A", "D", 7], ["B", "C", 2], ["B", "E", 5], ["D", "E", 1], ["E", "F", 4]] });
  let g = start();
  const opt = (sel) => ids.map((i) => `<option${i === sel ? " selected" : ""}>${i}</option>`).join("");
  el.innerHTML = `<svg viewBox="0 0 ${W} 260" role="img" aria-label="Graph builder"></svg>
    <div class="pick"><label>From <select data-f>${opt("C")}</select></label><label>To <select data-t>${opt("F")}</select></label><label data-wl hidden>Weight <input type="number" min="1" max="99" value="6" data-w></label><button class="b pri" data-k="add">Add edge</button><button class="b" data-k="rem">Remove edge</button></div>
    <div class="pick"><label><input type="checkbox" data-dir> Directed</label><label><input type="checkbox" data-wt> Weighted</label><button class="b" data-k="reset">Reset</button><button class="b" data-k="clear">Clear all</button></div>
    <div class="msg" aria-live="polite"></div><div class="two"><div><h3>Adjacency matrix</h3><div data-m></div></div><div><h3>Adjacency list</h3><div data-l></div></div></div>`;
  const svg = $("svg", el), msg = $(".msg", el), F = $("[data-f]", el), T = $("[data-t]", el), Wt = $("[data-w]", el), dir = $("[data-dir]", el), wt = $("[data-wt]", el);
  const find = (a, b) => g.edges.findIndex(([x, y]) => (x === a && y === b) || (!g.directed && x === b && y === a));
  const draw = (m, bad, hl) => { svg.innerHTML = Lib.graphSvg(g); $("[data-m]", el).innerHTML = Lib.matrixHtml(g, { hl }); $("[data-l]", el).innerHTML = Lib.listHtml(g); msg.textContent = m || ""; msg.style.color = bad ? "var(--bad)" : "var(--good)"; $("[data-wl]", el).hidden = !g.weighted; };
  el.onclick = (e) => { const k = e.target.dataset.k; if (!k) return; const a = F.value, b = T.value;
    if (k === "reset") { g = { ...start(), directed: dir.checked, weighted: wt.checked }; return draw("Reset to the example graph."); }
    if (k === "clear") { g.edges = []; return draw("All edges removed."); }
    if (a === b) return draw("An edge needs two different vertices.", true);
    const i = find(a, b);
    if (k === "add") { const w = +Wt.value || 1; if (i >= 0) g.edges[i][2] = w; else g.edges.push([a, b, w]); return draw(i >= 0 ? `Edge ${a}–${b} already existed; weight updated.` : `Added ${g.directed ? a + " → " + b : a + " – " + b}${g.weighted ? " (weight " + w + ")" : ""}. ${g.directed ? "One cell changes." : "Two cells change: the matrix stays symmetric."}`, false, [a, b]); }
    if (i < 0) return draw(`There is no edge ${a}${g.directed ? " → " : "–"}${b} to remove.`, true);
    g.edges.splice(i, 1); draw(`Removed edge ${a}${g.directed ? " → " : "–"}${b}.`, false, [a, b]); };
  dir.onchange = () => { g.directed = dir.checked; draw(g.directed ? "Directed: row = from, column = to. A → B is not the same as B → A." : "Undirected: every edge works both ways."); };
  wt.onchange = () => { g.weighted = wt.checked; draw(g.weighted ? "Weighted: the matrix and list now show each edge's weight." : "Unweighted: 1 means an edge, 0 means none."); };
  draw("Edges can be added between any two different vertices.");
})();

/* ---------- Lab 2: shortest path finder ---------- */
(() => {
  const el = $("#lab2"), opt = (sel) => "ABCDE".split("").map((i) => `<option${i === sel ? " selected" : ""}>${i}</option>`).join("");
  el.innerHTML = `<svg viewBox="0 0 ${W} 260" role="img" aria-label="Shortest path finder"></svg><div class="pick"><label>Start <select data-s>${opt("A")}</select></label><label>End <select data-e>${opt("E")}</select></label></div><div class="msg" aria-live="polite"></div><div class="listrow" data-d></div>`;
  const svg = $("svg", el), S = $("[data-s]", el), E = $("[data-e]", el), msg = $(".msg", el), d = $("[data-d]", el), G = shifted(GD, 140, 5);
  const run = () => {
    const r = dijkstra(GD, S.value), p = pathTo(r.prev, E.value), on = new Set(p.slice(1).map((v, i) => p[i] + "-" + v)), cls = {}; p.forEach((v) => (cls[v] = "ok"));
    const sub = {}; GD.nodes.forEach((n) => (sub[n.id] = r.dist[n.id]));
    svg.innerHTML = Lib.graphSvg(G, { on, cls, sub });
    msg.textContent = S.value === E.value ? "Start and end are the same vertex: distance 0." : `Shortest ${S.value} to ${E.value}: ${p.join(" → ")}, total ${r.dist[E.value]}.`;
    d.textContent = "Finished order: " + r.order.join(", ") + "   ·   distances from " + S.value + ": " + GD.nodes.map((n) => n.id + "=" + r.dist[n.id]).join(", ");
  };
  S.onchange = E.onchange = run; run();
})();

/* ---------- Lab 3: dense or sparse ---------- */
(() => {
  const fmt = (n) => n.toLocaleString("en-GB"); let a, b;
  a = Lib.slider($("#gv1"), { id: "gvn", label: "Vertices (n)", min: 5, max: 500, step: 5, value: 100, fmt, onInput: upd });
  b = Lib.slider($("#gv2"), { id: "gve", label: "Edges as a share of the maximum possible", min: 1, max: 100, step: 1, value: 3, fmt: (v) => v + "%", onInput: upd });
  function upd() {
    if (!a || !b) return;
    const n = a.get(), max = (n * (n - 1)) / 2, e = Math.max(n - 1, Math.round((max * b.get()) / 100)), cells = n * n, ent = 2 * e;
    $("#rMat").textContent = fmt(cells); $("#rLst").textContent = fmt(ent); $("#rDen").textContent = `${fmt(e)} / ${fmt(max)}`;
    $("#rVer").textContent = ent < cells / 3 ? `Sparse: the list stores ${fmt(Math.round(cells / ent))} times fewer entries than the matrix has cells. Use an adjacency list.` : "Dense: the list is almost as big as the matrix, and a matrix gives instant edge look-ups. An adjacency matrix is reasonable.";
  }
  upd();
})();

/* ---------- Practise ---------- */
$("#refG").innerHTML = `<svg viewBox="0 0 360 250" role="img" aria-label="Weighted graph used in the calculations. Edges: A-B 4, A-C 2, B-C 1, B-D 5, C-D 8, C-E 10, D-E 2">${Lib.graphSvg(GD)}</svg><p class="note">A–B 4, A–C 2, B–C 1, B–D 5, C–D 8, C–E 10, D–E 2</p>`;
$("#refG svg").style.maxWidth = "420px";

Lib.classify($("#cl1"), { prompt: "Drag each relationship to the type of graph edge it needs.", buckets: [{ label: "Undirected edge" }, { label: "Directed edge" }], items: [
  { text: "Two people who are friends with each other", b: 0 }, { text: "One account following another", b: 1 }, { text: "A hyperlink from page X to page Y", b: 1 },
  { text: "A two-way road between two towns", b: 0 }, { text: "A one-way street", b: 1 }, { text: "Two authors who wrote a paper together", b: 0 },
  { text: "Course A must be passed before course B", b: 1 }, { text: "A cable linking two computers (data flows both ways)", b: 0 },
], done: "If the relationship works both ways, use an undirected edge. If it has a direction, use a directed one." });

Lib.classify($("#cl2"), { prompt: "Drag each statement to the representation it describes.", buckets: [{ label: "Adjacency matrix" }, { label: "Adjacency list" }], items: [
  { text: "Checking whether an edge exists is one array look-up", b: 0 }, { text: "Uses less memory when there are few edges", b: 1 }, { text: "Always needs n × n cells", b: 0 },
  { text: "Easy to read off all the neighbours of a vertex", b: 1 }, { text: "Symmetric when the graph is undirected", b: 0 }, { text: "Best for a sparse graph such as the web", b: 1 }, { text: "Suits a dense graph with many edges", b: 0 },
], done: "Matrix: fast edge check, n × n memory. List: compact, best for sparse graphs." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Vertex", "A point in a graph (also called a node)"], ["Edge", "A connection between two vertices (also called an arc)"], ["Weight", "A value on an edge, such as distance or time"],
  ["Path", "A sequence of vertices joined by edges"], ["Cycle", "A path that starts and ends at the same vertex"], ["Connected graph", "There is a path between every pair of vertices"],
  ["Heuristic", "An estimate of the distance to the goal, used by A*"],
] });

Lib.order($("#o1"), { prompt: "Put the steps of Dijkstra's algorithm in the right order.", items: [
  "Set every distance to infinity, except the start vertex which is 0", "Choose the unvisited vertex with the smallest distance", "Mark that vertex as visited",
  "For each unvisited neighbour, calculate the distance through the chosen vertex", "If the new distance is smaller, update the distance and the previous vertex", "Repeat until the destination (or every vertex) is visited", "Follow the previous vertices back to read off the path",
], done: "Choose, mark, update, repeat, then read the path backwards." });

Lib.calc($("#c1"), { qs: [
  { q: "An undirected graph has 7 edges. How many 1s are in its unweighted adjacency matrix?", a: 14, hint: "Each undirected edge fills two cells.", sol: "7 × 2 = <b>14</b>." },
  { q: "A graph has 8 vertices. How many cells are in its adjacency matrix?", a: 64, hint: "n × n.", sol: "8 × 8 = <b>64</b>." },
  { q: "A directed graph has 6 edges. How many 1s are in its adjacency matrix?", a: 6, hint: "One cell per directed edge.", sol: "<b>6</b>." },
  { q: "In the graph shown, how many edges does vertex C have (its degree)?", a: 4, hint: "C is joined to A, B, D and E.", sol: "C–A, C–B, C–D, C–E: <b>4</b>." },
  { q: "Using Dijkstra's algorithm, what is the shortest distance from A to D?", a: 8, hint: "Try A → C → B → D.", sol: "A → C (2) → B (1) → D (5) = <b>8</b>." },
  { q: "What is the shortest distance from A to E?", a: 10, hint: "Go through D: D–E costs 2.", sol: "A → C → B → D → E = 2 + 1 + 5 + 2 = <b>10</b>." },
  { q: "After vertices A and C are finished, what is Dist[B]?", a: 3, hint: "A–B is 4. But A → C → B?", sol: "2 + 1 = 3, which is less than 4. Dist[B] = <b>3</b>." },
] });

Lib.quiz($("#qz1"), { qs: [
  { q: "In a graph, what does an edge represent?", opts: ["A data value stored in a vertex", "A connection between two vertices", "The first vertex in the graph", "The total number of vertices"], a: 1, why: "Vertices hold the items; edges connect pairs of vertices." },
  { q: "What is true of the adjacency matrix of an undirected graph?", opts: ["It has more rows than columns", "It is symmetric", "It contains only zeros", "It must be weighted"], a: 1, why: "An undirected edge A–B fills both [A][B] and [B][A], so the matrix mirrors across the diagonal." },
  { q: "A graph has 100,000 vertices but each vertex has only about 5 neighbours. Which representation suits it?", opts: ["Adjacency matrix", "Adjacency list", "Neither can store it", "Both use the same memory"], a: 1, why: "It is sparse. A matrix would need 10 billion cells; a list needs about 500,000 entries." },
  { q: "Which condition does Dijkstra's algorithm require?", opts: ["The graph is a tree", "No negative edge weights", "The graph is directed", "All weights are equal"], a: 1, why: "Once a vertex is marked finished its distance is final. A negative weight could later reduce it, which breaks that assumption." },
  { q: "How does A* differ from Dijkstra's algorithm?", opts: ["It ignores edge weights", "It uses a heuristic estimate of the distance to the goal", "It only works on trees", "It always visits every vertex"], a: 1, why: "A* picks the vertex with the lowest g + h, where h is the heuristic estimate to the goal." },
  { q: "Which statement about a tree is correct?", opts: ["A tree is a connected graph with no cycles", "A tree is a graph where every vertex has a cycle", "A tree can never be a graph", "A tree has no edges"], a: 0, why: "A tree is a special kind of graph: connected, with no cycles." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Graph", "An abstract data type of vertices (nodes) joined by edges (arcs)."], ["Vertex / node", "A point in a graph, such as a town or a person."], ["Edge / arc", "A connection between two vertices."],
  ["Directed graph", "A graph whose edges have a direction (drawn as arrows)."], ["Undirected graph", "A graph whose edges work in both directions."], ["Weighted graph", "A graph whose edges carry a value such as distance, cost or time."],
  ["Path", "A sequence of vertices where each consecutive pair is joined by an edge."], ["Cycle", "A path that starts and ends at the same vertex."], ["Degree", "The number of edges at a vertex."],
  ["Adjacency matrix", "A 2D array with a row and column per vertex; cell [r][c] shows whether (and with what weight) there is an edge from r to c."], ["Adjacency list", "For each vertex, a list of the vertices it is joined to."],
  ["Dijkstra's algorithm", "Finds the shortest path from a start vertex to every other vertex in a graph with non-negative weights."], ["A* algorithm", "A shortest-path algorithm that uses a heuristic estimate to the goal (f = g + h) to explore fewer vertices."], ["Heuristic", "An estimate of the remaining distance to the goal, used to guide A*."],
] });
