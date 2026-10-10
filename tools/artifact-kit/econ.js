/* shared cost-curve helpers: include in an artifact with a first line of  // uses: econ */
/* ---------- shared maths ---------- */
// Cost model used throughout: VC = Q^3 - 6Q^2 + 15Q, FC set per lab (20 unless a slider changes it).
const MC = (q) => 3 * q * q - 12 * q + 15, AVC = (q) => q * q - 6 * q + 15, ATC = (q, fc = 20) => AVC(q) + fc / q;
const clamp01 = (x) => Math.max(0, Math.min(1, x));
function frame(W, H, l, r, t, b, xmax, ymin, ymax) {
  return { X: (q) => l + ((r - l) * q) / xmax, Y: (v) => b - ((b - t) * (v - ymin)) / (ymax - ymin), l, r, t, b, ymax, ymin };
}
function curve(f, q0, q1, F) {
  const p = [];
  for (let q = q0; q <= q1 + 1e-9; q += 0.05) { const v = f(q); if (v > F.ymax || v < F.ymin) continue; p.push([F.X(q), F.Y(v)]); }
  return ptsPath(p);
}
function axes(F, xl, yl, y0 = 0) {
  return SV.line(F.l, F.t, F.l, F.Y(y0)) + SV.line(F.l, F.Y(y0), F.r, F.Y(y0)) + SV.text(F.l, F.t - 7, yl, "sm", { "text-anchor": "start" }) + SV.text(F.r, F.b + 24, xl, "sm", { "text-anchor": "end" });
}
const costSet = (F, fc, o = {}) => {
  const op = (k) => (o[k] === undefined ? 1 : o[k]);
  let s = "";
  if (op("a")) s += SV.path(curve((q) => fc / q, 0.4, 5.5, F), "c4", { opacity: op("a") }) + SV.text(F.X(0.65), F.Y(Math.min(F.ymax - 2, fc / 0.65)) + 2, "AFC", "lbl bd t4", { opacity: op("a") });
  if (op("v")) s += SV.path(curve(AVC, 0.05, 5.5, F), "c3", { opacity: op("v") }) + SV.text(F.X(1.1), F.Y(AVC(1.1)) - 8, "AVC", "lbl bd t3", { opacity: op("v") });
  if (op("t")) s += SV.path(curve((q) => ATC(q, fc), 0.4, 5.5, F), "c1", { opacity: op("t") }) + SV.text(F.X(1.1), F.Y(ATC(1.1, fc)) - 8, "ATC", "lbl bd t1", { opacity: op("t") });
  if (op("m")) s += SV.path(curve(MC, 0.05, 5.5, F), "c2", { opacity: op("m") }) + SV.text(F.X(5.2), F.Y(MC(5.2)) + 2, "MC", "lbl bd t2", { opacity: op("m"), "text-anchor": "end" });
  return s;
};

