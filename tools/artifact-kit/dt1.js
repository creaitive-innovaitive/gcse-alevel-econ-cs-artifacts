const MONO = "font-family:ui-monospace,Menlo,Consolas,monospace;";
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const ones = (s) => [...s].reduce((n, c) => n + c.charCodeAt(0).toString(2).split("1").length - 1, 0);

/* ---------- shared network layout (computer A, three layers of routers, computer B) ---------- */
const NODES = { A: [50, 150], R1: [190, 50], R2: [190, 150], R3: [190, 250], R4: [360, 100], R5: [360, 200], R6: [530, 100], R7: [530, 200], B: [710, 150] };
const EDGES = [["A", "R1"], ["A", "R2"], ["A", "R3"], ["R1", "R4"], ["R2", "R4"], ["R2", "R5"], ["R3", "R5"], ["R4", "R6"], ["R4", "R7"], ["R5", "R6"], ["R5", "R7"], ["R6", "B"], ["R7", "B"]];
const ADJ = {}; EDGES.forEach(([a, b]) => { (ADJ[a] = ADJ[a] || []).push(b); (ADJ[b] = ADJ[b] || []).push(a); });
const PCOL = ["var(--accent)", "var(--bad)", "var(--good)", "var(--warn)", "var(--n)", "var(--k)"];
function paths(failed) {
  const out = [];
  (function dfs(n, seen) {
    if (n === "B") return out.push(seen);
    ADJ[n].forEach((m) => { if (!seen.includes(m) && !failed.has(m) && !(n !== "A" && m === "A")) dfs(m, [...seen, m]); });
  })("A", ["A"]);
  return out.filter((p) => p.every((n, i) => i === 0 || NODES[n][0] > NODES[p[i - 1]][0]));
}
function netBase(failed, click, mid = "") {
  let o = "";
  EDGES.forEach(([a, b]) => { o += SV.line(NODES[a][0], NODES[a][1], NODES[b][0], NODES[b][1], "edge"); });
  o += mid;
  Object.entries(NODES).forEach(([id, [x, y]]) => {
    const isR = id[0] === "R", bad = failed && failed.has(id);
    o += `<g class="${isR && click ? "netbtn" : ""}" data-n="${id}">` + (isR ? SV.circle(x, y, 19, "nd" + (bad ? " nd-no" : ""), { "data-n": id }) : SV.rect(x - 28, y - 22, 56, 44, "f1", { rx: 10 }) + SV.rect(x - 28, y - 22, 56, 44, "ax", { rx: 10 })) + SV.text(x, y + 5, id, "lbl bd", { "text-anchor": "middle", "pointer-events": "none" }) + `</g>`;
  });
  return o;
}
function along(pts, u) {
  const segs = []; let tot = 0;
  for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); tot += l; }
  let d = u * tot;
  for (let i = 0; i < segs.length; i++) { if (d <= segs[i] || i === segs.length - 1) { const t = clamp(d / segs[i]); return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t]; } d -= segs[i]; }
}
const pkt = (x, y, n, col, op = 1) => SV.rect(x - 14, y - 11, 28, 22, "", { rx: 5, style: `fill:${col}`, opacity: op }) + SV.text(x, y + 5, n, "lbl bd", { "text-anchor": "middle", style: "fill:#fff", opacity: op });

/* ---------- 1. packet switching ---------- */
const WR = [["A", "R1", "R4", "R6", "B"], ["A", "R2", "R4", "R7", "B"], ["A", "R3", "R5", "R7", "B"], ["A", "R2", "R5", "R6", "B"], ["A", "R1", "R4", "R7", "B"]].map((r) => r.map((n) => NODES[n]));
const SPEED = [0.85, 1.0, 0.6, 0.75, 0.7];
const ARRIVE = [1, 0, 4, 2, 3]; // packet index -> arrival slot (P2,P1,P4,P5,P3)
function psChart(s) {
  let m = "";
  if (s.spl > 0.02) WR.forEach((r, i) => { if (s.p > 0.02) m += SV.path(ptsPath(r.map(([x, y]) => [x, y + (i - 2) * 3])), "", { style: `stroke:${PCOL[i]};stroke-width:3;fill:none`, opacity: 0.35 }); });
  let o = netBase(null, false, m);
  if (s.spl < 0.98) o += SV.rect(8, 58, 84, 42, "f4", { rx: 8, opacity: 1 - s.spl }) + SV.text(50, 85, "Photo", "lbl bd t4", { "text-anchor": "middle", opacity: 1 - s.spl });
  if (s.spl > 0.02) WR.forEach((r, i) => {
    const u = clamp(s.p * SPEED[i]), [x, y] = along(r, u), sx = 50, sy = 100 + i * 25;
    if (u >= 0.999) return;
    o += pkt(sx + (x - sx) * clamp(u * 12), sy + (y - sy) * clamp(u * 12), i + 1, PCOL[i], s.spl);
  });
  o += SV.text(380, 300, "Packets as they arrive at B", "sm", { "text-anchor": "middle" });
  WR.forEach((r, i) => {
    const arrived = clamp(s.p * SPEED[i]) >= 0.999; if (!arrived) return;
    const slot = (1 - s.asm) * ARRIVE[i] + s.asm * i;
    o += pkt(260 + slot * 60, 322, i + 1, PCOL[i]);
  });
  if (s.asm > 0.9) o += SV.text(380, 354, "Sequence numbers 1 to 5: the photo is rebuilt", "lbl bd t3", { "text-anchor": "middle" });
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 365, label: "A photo split into five packets and routed across a network", base: { spl: 0, p: 0, asm: 0 }, tween: 900, dwell: 4800, draw: psChart, steps: [
  { cap: "Computer A wants to send a <b>photograph</b> to computer B. In between is a network of routers (R1 to R7).", s: { spl: 0, p: 0, asm: 0 } },
  { cap: "The photo is <b>split into five packets</b>. Each has a header (addresses and sequence number 1 to 5), a payload and a trailer.", s: { spl: 1, p: 0, asm: 0 } },
  { cap: "Each packet is sent <b>independently</b>. At every router, the destination address in the header decides which way it goes next, so the packets take <b>different routes</b>.", s: { spl: 1, p: 0.55, asm: 0 } },
  { cap: "The packets reach B in a <b>different order</b> from the one they were sent in: here 2, 1, 4, 5, 3.", s: { spl: 1, p: 1.7, asm: 0 } },
  { cap: "B uses the <b>sequence numbers</b> in the headers to put the packets back in order and rebuild the photo.", s: { spl: 1, p: 1.7, asm: 1 } },
] });

/* ---------- 2. serial versus parallel ---------- */
const BYTE = "10011011", OFF = [0, 0.8, 0.3, 1.0, 0.5, 0.9, 0.2, 0.6];
const bitC = (x, y, b, op = 1) => SV.circle(x, y, 13, "", { style: `fill:${b === "1" ? "var(--accent)" : "var(--soft)"};stroke:var(--accent);stroke-width:2`, opacity: op }) + SV.text(x, y + 5, b, "lbl bd", { "text-anchor": "middle", style: MONO + (b === "1" ? "fill:#fff" : ""), opacity: op });
function spChart(s) {
  const D = 3, X0 = 170, X1 = 590;
  let o = SV.rect(30, 20, 120, 260, "f1", { rx: 10 }) + SV.rect(610, 20, 120, 260, "f3", { rx: 10 }) + SV.text(90, 14, "Sender", "lbl bd", { "text-anchor": "middle" }) + SV.text(670, 14, "Receiver", "lbl bd", { "text-anchor": "middle" });
  if (s.mode < 0.5) {
    o += SV.line(X0, 150, X1, 150, "ax") + SV.text(380, 190, "one wire", "sm", { "text-anchor": "middle" });
    let sent = "", got = "";
    [...BYTE].forEach((b, i) => {
      const f = clamp((s.t - i) / D);
      if (f <= 0) sent += b; else if (f >= 1) got += b; else o += bitC(X0 + f * (X1 - X0), 150, b);
    });
    o += SV.text(90, 155, sent || "·", "lbl bd", { "text-anchor": "middle", style: MONO + "font-size:20px;letter-spacing:2px" }) + SV.text(670, 155, got || "·", "lbl bd t3", { "text-anchor": "middle", style: MONO + "font-size:20px;letter-spacing:2px" });
    o += SV.text(380, 250, `Clock tick ${Math.min(8, Math.floor(s.t))} of 8: bits delivered in order`, "sm bd", { "text-anchor": "middle" });
  } else {
    [...BYTE].forEach((b, i) => {
      const y = 48 + i * 29, f = clamp((s.t - s.sk * OFF[i] * 1.5) / D);
      o += SV.line(X0, y, X1, y, "ax", { style: "stroke-width:1.5" });
      if (f <= 0) o += bitC(90, y, b, 1); else if (f >= 1) o += bitC(670, y, b); else o += bitC(X0 + f * (X1 - X0), y, b);
    });
    o += SV.text(380, 292, s.sk > 0.5 ? "Long cable: bits drift out of step (skew)" : "Short cable: all 8 bits arrive together, in one clock tick", "sm bd", { "text-anchor": "middle" });
  }
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 300, label: "Serial and parallel transmission of one byte", base: { mode: 0, t: 0, sk: 0 }, tween: 700, dwell: 4200, draw: spChart, steps: [
  { cap: "<b>Serial</b>: the byte 10011011 waits at the sender. There is only <b>one wire</b>, so only one bit can travel at a time.", s: { mode: 0, t: 0, sk: 0 } },
  { cap: "The bits leave <b>one after the other</b>, in a single stream. Some have arrived, some are on the wire, some are still waiting.", s: { mode: 0, t: 5, sk: 0 } },
  { cap: "After <b>8 clock ticks</b> the whole byte has arrived, and in the right order. Serial is slower but reliable, even over long distances.", s: { mode: 0, t: 11, sk: 0 } },
  { cap: "<b>Parallel</b>: the same byte, but now with <b>8 wires</b>, one for each bit.", s: { mode: 1, t: 0, sk: 0 } },
  { cap: "Over a short distance all 8 bits arrive <b>at the same time</b>, in just one clock tick. Parallel is faster.", s: { mode: 1, t: 3.5, sk: 0 } },
  { cap: "Over a long cable the bits may arrive at slightly different times. This is <b>skew</b>. The byte can be corrupted, so parallel suits short distances.", s: { mode: 1, t: 2.6, sk: 1 } },
] });

/* ---------- 3. duplex modes ---------- */
function dupChart(s) {
  let o = SV.rect(40, 70, 140, 120, "f1", { rx: 12 }) + SV.rect(580, 70, 140, 120, "f3", { rx: 12 }) + SV.text(110, 138, s.m < 0.5 ? "Computer" : "A", "lbl bd", { "text-anchor": "middle", style: "font-size:18px" }) + SV.text(650, 138, s.m < 0.5 ? "Printer" : "B", "lbl bd", { "text-anchor": "middle", style: "font-size:18px" });
  const arrow = (y, dir, op) => op > 0.02 ? SV.line(210, y, 550, y, "c1", { opacity: op, style: "stroke-width:6" }) + (dir ? SV.arrowHead(560, y, "r", "dot1").replace("/>", ` opacity="${op}"/>`) : SV.arrowHead(200, y, "l", "dot1").replace("/>", ` opacity="${op}"/>`)) : "";
  o += arrow(s.m > 0.5 && s.b > 0.5 && s.a > 0.5 ? 110 : 130, 1, s.a) + arrow(s.m > 0.5 && s.b > 0.5 && s.a > 0.5 ? 160 : 130, 0, s.b);
  return o;
}
Lib.stepper($("#stC"), { w: 760, h: 260, label: "Simplex, half-duplex and full-duplex transmission", base: { m: 0, a: 0, b: 0 }, tween: 500, dwell: 4200, draw: dupChart, steps: [
  { cap: "<b>Simplex</b>: data travels in <b>one direction only</b>. A computer sends a document to a printer, and the printer never sends data back along this link.", s: { m: 0, a: 1, b: 0 } },
  { cap: "<b>Half-duplex</b>: data can go both ways, but <b>not at the same time</b>. First A sends while B listens, like a walkie-talkie.", s: { m: 1, a: 1, b: 0 } },
  { cap: "Then they swap: B sends while A listens. Only one direction is in use at any moment.", s: { m: 1, a: 0, b: 1 } },
  { cap: "<b>Full-duplex</b>: data goes both ways <b>at the same time</b>, like a phone call or a broadband connection.", s: { m: 1, a: 1, b: 1 } },
] });

/* ---------- Lab 1: packet builder ---------- */
(() => {
  const inp = $("#pmsg"), box = $("#pks"), v = $("#pv"), SRC = "192.168.1.20", DST = "203.0.113.9";
  const show = (c) => { const n = c.charCodeAt(0); return n < 32 || n > 126 ? "▯" : c; };
  let size = 5, P = [], order = [], asm = false, kind = "one";
  const sel = document.createElement("div");
  sel.innerHTML = `<label class="note">When I corrupt a packet: <select class="sel" id="pk">
    <option value="one">flip 1 bit</option><option value="two">swap two bits (one 1→0, one 0→1)</option></select></label>`;
  const sl = Lib.slider($("#plen"), { id: "pl", label: "Characters per packet", min: 2, max: 10, value: 5, onInput: (x) => { size = x; build(); } });
  $("#plen").appendChild(sel);
  $("#pk").onchange = (e) => (kind = e.target.value);
  function build() {
    const t = inp.value.toUpperCase() || " ", n = Math.ceil(t.length / size);
    P = Array.from({ length: n }, (_, i) => { const s = t.slice(i * size, (i + 1) * size); return { seq: i + 1, text: s, rx: s, bad: false, ones: ones(s) }; });
    order = P.map((p, i) => i); asm = false; draw();
    v.textContent = `${t.length} characters at ${size} per packet = ${n} packets. Trailer value = number of 1-bits in the payload.`;
  }
  function corrupt(p) {
    const c = p.text.charCodeAt(0); let m = c;
    if (kind === "one") m = c ^ 1; else { let s = [0, 1, 2, 3, 4, 5, 6].find((b) => c & (1 << b)), u = [0, 1, 2, 3, 4, 5, 6].find((b) => !(c & (1 << b))); m = c ^ (1 << s) ^ (1 << u); }
    p.rx = String.fromCharCode(m) + p.text.slice(1);
  }
  function draw() {
    box.innerHTML = order.map((i) => {
      const p = P[i], got = ones(p.rx), ok = got === p.ones;
      return `<div class="pk${p.bad ? " bad" : ""}" data-i="${i}"><div class="h"><small>Header</small>${SRC} → ${DST}<br>seq ${p.seq} of ${P.length} · ${p.text.length} B</div>
        <div class="p"><small>Payload</small>${[...p.rx].map((c, k) => `<span style="${c !== p.text[k] ? "color:var(--bad);text-decoration:underline" : ""}">${esc(show(c)) === " " ? "␣" : esc(show(c))}</span>`).join("")}</div>
        <div class="t"><small>Trailer · CRC sent</small>${p.ones} = 0x${p.ones.toString(16).toUpperCase()}</div>
        <div><small class="note" style="display:block;font:700 .62rem var(--sans);letter-spacing:.08em;text-transform:uppercase">Receiver counts</small>${got} ${p.bad ? (ok ? '<span class="flag">not caught!</span>' : '<span class="flag">mismatch</span>') : '<span class="okf">match</span>'}<br><button class="b" data-c="${i}" style="margin-top:4px;padding:3px 9px">${p.bad ? "Re-send" : "Corrupt"}</button></div></div>`;
    }).join("");
    $$("[data-c]", box).forEach((b) => (b.onclick = () => {
      const p = P[+b.dataset.c]; p.bad = !p.bad; p.rx = p.text; if (p.bad) corrupt(p); draw();
      const caught = ones(p.rx) !== p.ones;
      v.innerHTML = p.bad ? (caught ? `Packet ${p.seq}: the receiver counts ${ones(p.rx)} one-bits but the trailer says ${p.ones}. <b>Mismatch, so the packet is re-sent.</b>` : `Packet ${p.seq} is corrupted, but the count of 1-bits is still ${p.ones}, so this simple check <b>misses it</b>. Real CRCs use a stronger calculation, which would catch this.`) : `Packet ${p.seq} re-sent and received correctly.`;
    }));
  }
  $("#pshuf").onclick = () => { let o; do { o = shuffle(P.map((p, i) => i)); } while (P.length > 1 && o.every((x, i) => x === i)); order = o; asm = false; draw(); v.textContent = `Packets arrived in this order: ${order.map((i) => P[i].seq).join(", ")}. They are out of sequence.`; };
  $("#pasm").onclick = () => {
    order = P.map((p, i) => i); draw();
    const failed = P.filter((p) => ones(p.rx) !== p.ones).map((p) => p.seq);
    v.innerHTML = failed.length ? `Reassembled using the sequence numbers, but packet${failed.length > 1 ? "s" : ""} ${failed.join(", ")} failed the CRC check and must be re-sent first.` : `Reassembled using the sequence numbers: <b>${esc(P.map((p) => p.rx).join("").replace(/ /g, "␣"))}</b>`;
  };
  $("#prst").onclick = build;
  inp.addEventListener("input", build);
  build();
})();

/* ---------- Lab 2: packet switching network ---------- */
(() => {
  const svg = $("#net"), tab = $("#ntab"), v = $("#nv"), failed = new Set();
  let run = null;
  function draw() {
    let m = "";
    if (run) run.forEach((r, i) => { m += SV.path(ptsPath(r.route.map((n) => [NODES[n][0], NODES[n][1] + (i - 2.5) * 3.2])), "", { style: `stroke:${PCOL[i]};stroke-width:3;fill:none`, opacity: 0.7 }); });
    svg.innerHTML = netBase(failed, true, m) + SV.text(380, 292, "Click a router R1 to R7 to break it or repair it", "sm", { "text-anchor": "middle" });
  }
  svg.addEventListener("click", (e) => { const n = e.target.closest("[data-n]"); if (!n || n.dataset.n[0] !== "R") return; const id = n.dataset.n; failed.has(id) ? failed.delete(id) : failed.add(id); run = null; tab.innerHTML = ""; v.textContent = failed.size ? `Broken or busy: ${[...failed].join(", ")}.` : ""; draw(); });
  $("#nclr").onclick = () => { failed.clear(); run = null; tab.innerHTML = ""; v.textContent = "All routers working."; draw(); };
  $("#nsend").onclick = () => {
    const ps = paths(failed);
    if (!ps.length) { run = null; tab.innerHTML = ""; v.innerHTML = `<b>No working route.</b> Every path from A to B passes through a broken router, so the packets cannot be delivered.`; draw(); return; }
    run = Array.from({ length: 6 }, (_, i) => { const route = pick(ps), delays = route.slice(1).map(() => 1 + Math.floor(Math.random() * 4)); return { seq: i + 1, route, time: delays.reduce((a, b) => a + b, 0) }; });
    const arr = [...run].sort((a, b) => a.time - b.time || a.seq - b.seq);
    tab.innerHTML = `<tr><th>Packet</th><th>Route taken</th><th>Time</th><th>Arrives</th></tr>` + run.map((r) => `<tr><td><b style="color:${PCOL[r.seq - 1]}">${r.seq}</b></td><td>${r.route.join(" → ")}</td><td>${r.time}</td><td>${arr.indexOf(r) + 1}</td></tr>`).join("");
    const same = arr.every((r, i) => r.seq === i + 1);
    v.innerHTML = `Arrival order: <b>${arr.map((r) => r.seq).join(", ")}</b>. ` + (same ? "This time they happened to arrive in order. Send again and they probably will not." : "The packets arrived out of sequence, so B reassembles them using the sequence numbers in the headers.") + (failed.size ? " The packets were re-routed around the broken routers." : "");
    draw();
  };
  draw();
})();

/* ---------- Lab 3: serial or parallel ---------- */
(() => {
  const svg = $("#par"); let ls, ds;
  function upd() {
    if (!ls || !ds) return;
    const L = ls.get(), N = ds.get(), risk = L <= 5 ? "Low" : L <= 20 ? "Medium" : "High";
    $("#sa").textContent = N * 8; $("#sb").textContent = N; $("#sc").textContent = risk;
    $("#sv").textContent = risk === "High" ? `At ${L} m, parallel bits may arrive out of step and the data could be corrupted. Serial is slower (${N * 8} ticks) but the bits stay in order, so it is the safer choice.` : risk === "Medium" ? `At ${L} m skew starts to matter. Parallel is still 8 times faster, but the risk is growing.` : `At ${L} m, parallel sends ${N} byte${N > 1 ? "s" : ""} in ${N} ticks against ${N * 8} for serial, and the bits stay in step.`;
    let o = SV.text(60, 20, "Sender", "lbl bd") + SV.text(500, 20, "Receiver", "lbl bd", { "text-anchor": "end" });
    o += SV.line(480, 30, 480, 270, "gr");
    OFF.forEach((f, i) => {
      const y = 45 + i * 29, dx = (f - 0.5) * (L / 50) * 120;
      o += SV.line(60, y, 500, y, "ax", { style: "stroke-width:1.5" }) + bitC(480 + dx, y, BYTE[i]) ;
    });
    o += SV.text(280, 290, "Where each bit of one byte lands on the receiving end", "sm", { "text-anchor": "middle" });
    svg.innerHTML = o;
  }
  ls = Lib.slider($("#s1"), { id: "sl1", label: "Cable length", min: 1, max: 50, value: 3, fmt: (x) => x + " m", onInput: upd });
  ds = Lib.slider($("#s2"), { id: "sl2", label: "Data to send", min: 1, max: 100, value: 10, fmt: (x) => x + (x === 1 ? " byte" : " bytes"), onInput: upd });
  upd();
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each statement to the transmission method it describes.", buckets: [{ label: "Serial" }, { label: "Parallel" }], items: [
  { text: "One bit at a time", b: 0 }, { text: "A single wire or channel", b: 0 }, { text: "Works well over long distances", b: 0 }, { text: "Bits always arrive in the correct order", b: 0 }, { text: "Cheaper: fewer wires needed", b: 0 }, { text: "Used by USB", b: 0 },
  { text: "Several bits (a byte) at once", b: 1 }, { text: "Several wires or channels", b: 1 }, { text: "Faster transmission rate", b: 1 }, { text: "Bits can become skewed", b: 1 }, { text: "Used inside the computer between components", b: 1 }, { text: "Best for short distances", b: 1 },
], done: "Serial for distance and reliability, parallel for speed over short distances." });

Lib.match($("#m1"), { prompt: "Match each description to its transmission mode.", pairs: [
  ["Simplex", "One direction only, such as computer to printer"], ["Half-duplex", "Both directions, but not at the same time, such as a walkie-talkie"], ["Full-duplex", "Both directions at the same time, such as a broadband connection"],
  ["Serial", "One bit at a time down a single wire"], ["Parallel", "A byte at a time down several wires"], ["Skew", "Bits arriving out of step with each other"],
] });

Lib.order($("#o1"), { prompt: "Put the steps of packet switching in the right order.", items: [
  "The message is split into data packets", "Each packet gets a header with the sender and receiver IP addresses and a sequence number", "Each router reads the destination address and chooses the next route for each packet", "The packets travel independently and may arrive out of order", "The receiving computer uses the sequence numbers to put the packets back in order",
], done: "Split, label, route, arrive, reassemble." });

Lib.classify($("#cl2"), { prompt: "Is each statement a benefit or a drawback of the system named in its bucket?", buckets: [{ label: "Benefit of packet switching" }, { label: "Drawback of packet switching" }, { label: "Benefit of USB" }, { label: "Drawback of USB" }], items: [
  { text: "Faulty lines can be avoided by re-routing", b: 0 }, { text: "No single line is tied up", b: 0 },
  { text: "Packets can be lost and re-sent", b: 1 }, { text: "Delay while packets are put in order", b: 1 },
  { text: "Devices detected automatically", b: 2 }, { text: "Supplies +5 V power through the cable", b: 2 },
  { text: "Standard cables limited to about 5 m", b: 3 }, { text: "Slower than Ethernet", b: 3 },
], done: "Always give a point that belongs to the system in the question." });

Lib.calc($("#c1"), { qs: [
  { q: "A file of 1,024 KiB is sent in packets whose payload is 64 KiB each. How many packets are needed?", a: 16, sol: "1,024 ÷ 64 = 16 packets.", hint: "Divide the file size by the payload size." },
  { q: "A file of 300 KiB is split into packets of 64 KiB payload. How many packets are needed (the last one may be partly full)?", a: 5, sol: "300 ÷ 64 = 4.69, so 4 full packets and a fifth part-full one = 5 packets.", hint: "Round up: a partly full packet is still a packet." },
  { q: "A payload is: 11110000 10000011 00110011 00111111 11111110 11100011. How many 1-bits does it contain (the CRC value sent in the trailer)?", a: 29, sol: "4 + 3 + 4 + 6 + 7 + 5 = 29.", hint: "Count each byte's 1-bits, then add." },
  { q: "Write that total, 29, as a hex value.", t: ["1D"], ph: "hex", sol: "29 = 16 + 13 = 1D in hex (D = 13).", hint: "16 goes into 29 once, remainder 13." },
  { q: "5 bytes are sent serially, one bit per clock tick. How many clock ticks are needed?", a: 40, sol: "5 bytes × 8 bits = 40 ticks.", hint: "A byte is 8 bits." },
  { q: "The same 5 bytes are sent in parallel over 8 wires, one byte per clock tick. How many ticks?", a: 5, sol: "One byte per tick, so 5 ticks." },
  { q: "A standard USB cable has four wires. How many of them carry data?", a: 2, sol: "Two carry data (white and green); the other two supply power (red and black)." },
  { q: "A packet is given a hop number of 10. It passes through 4 routers. What is its hop number now?", a: 6, sol: "The number goes down by 1 at each router: 10 − 4 = 6." },
] });

(() => {
  const el = $("#drill");
  el.innerHTML = `<div class="qline" aria-live="polite"></div>
    <div class="row"><select class="sel" data-m aria-label="Method"><option value="">Method…</option><option value="Serial">Serial</option><option value="Parallel">Parallel</option></select>
    <select class="sel" data-d aria-label="Direction"><option value="">Direction…</option><option value="Simplex">Simplex</option><option value="Half-duplex">Half-duplex</option><option value="Full-duplex">Full-duplex</option></select>
    <button class="b pri" data-a="c">Check</button><button class="b" data-a="n">New question</button><span class="fb" aria-live="polite"></span></div><p class="note" data-s></p>`;
  const ql = $(".qline", el), sm = $("[data-m]", el), sd = $("[data-d]", el), fb = $(".fb", el), st = $("[data-s]", el);
  const D = [["Simplex", "in one direction only"], ["Half-duplex", "in both directions, but only one way at a time"], ["Full-duplex", "in both directions at the same time"]];
  let ans = [], streak = 0, best = 0, solved = false;
  function gen() {
    const n = pick([1, 1, 8, 16]), d = pick(D); ans = [n === 1 ? "Serial" : "Parallel", d[0]]; solved = false;
    ql.textContent = `Data is sent ${n} bit${n > 1 ? "s" : ""} at a time, ${d[1]}. Name the transmission type.`;
    sm.value = sd.value = ""; fb.textContent = ""; fb.className = "fb";
  }
  $("[data-a=c]", el).onclick = () => {
    const good = sm.value === ans[0] && sd.value === ans[1];
    if (!solved) { streak = good ? streak + 1 : 0; best = Math.max(best, streak); }
    if (good) solved = true;
    fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); st.textContent = `Streak ${streak} · best ${best}`;
  };
  $("[data-a=n]", el).onclick = gen; gen();
})();

Lib.quiz($("#qz1"), { qs: [
  { q: "What is stored in the trailer of a data packet?", opts: ["The IP addresses of sender and receiver", "The actual data", "An end marker and an error check", "The sequence number"], a: 2, why: "The trailer identifies the end of the packet and holds the CRC error check." },
  { q: "Which statement about packet switching is correct?", opts: ["All packets must follow the same route", "Packets always arrive in the order sent", "Routers choose the next step using the destination address", "A single line is tied up for the whole message"], a: 2, why: "Each router reads the destination IP address in the header and decides where to send the packet next." },
  { q: "Data can travel in both directions, but not at the same time. What is this called?", opts: ["Simplex", "Half-duplex", "Full-duplex", "Parallel"], a: 1, why: "Half-duplex: both directions, taking turns." },
  { q: "Why is parallel transmission not used over long distances?", opts: ["It is too slow", "It uses only one wire", "The bits can become skewed", "It cannot carry bytes"], a: 2, why: "Over long distances the bits on different wires can arrive out of step." },
  { q: "How many wires in a USB cable are used for data?", opts: ["1", "2", "4", "8"], a: 1, why: "Two data wires (white and green) and two power wires (red and black)." },
  { q: "Which of these is a benefit of USB?", opts: ["Maximum cable length of 5 m", "Devices are detected automatically", "Slower than Ethernet", "Cannot supply power"], a: 1, why: "The other options are drawbacks or false." },
  { q: "Which part of a packet allows the packets to be put back in order?", opts: ["Payload", "Trailer", "Sequence number in the header", "CRC"], a: 2, why: "The sequence number in the header." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Data packet", "A small part of a message sent over a network. Packets are reassembled at the destination."], ["Packet header", "The part of a packet holding the sender and receiver IP addresses, the sequence number and the packet size."], ["Payload", "The actual data carried in a packet."],
  ["Packet trailer", "The part of a packet that marks the end and holds the CRC error check."], ["Cyclic redundancy check (CRC)", "An error check where the 1-bits in the payload are counted and stored in the trailer. The receiver repeats the count and compares."],
  ["Packet switching", "Sending a message as packets which travel independently by different routes and are reassembled at the destination."], ["Router", "A device that moves data packets between networks, choosing the next step using the destination address."], ["Node", "A stage in a network that can receive and send packets. Routers are nodes."],
  ["Simplex", "Data can be sent in one direction only."], ["Half-duplex", "Data can be sent in both directions, but not at the same time."], ["Full-duplex", "Data can be sent in both directions at the same time."],
  ["Serial transmission", "Sending data one bit at a time down a single wire or channel."], ["Parallel transmission", "Sending several bits (usually a byte) at the same time down several wires."], ["Skew", "Bits arriving out of step with each other, so the data is no longer synchronised."],
  ["USB", "Universal Serial Bus: a type of serial transmission that has become the industry standard for connecting devices."], ["Hop number", "A number in a packet header, reduced by 1 at each router, that stops lost packets circulating forever."],
] });
