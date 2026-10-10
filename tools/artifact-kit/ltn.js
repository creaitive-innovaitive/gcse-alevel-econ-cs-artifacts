// uses: econ
/* ---------- 1. stepper: bond price and the market rate ---------- */
Lib.stepper($("#stA"), {
  w: 760, h: 400, label: "Bond price against the market interest rate", base: { r: 5 },
  draw: (s) => {
    const F = frame(760, 400, 70, 730, 20, 350, 10, 0, 52000), price = 500 / (s.r / 100);
    let o = SV.line(F.l, F.t, F.l, F.b, "ax") + SV.line(F.l, F.b, F.r, F.b, "ax") + SV.text(F.l, F.t - 7, "Bond price (£)", "sm", { "text-anchor": "start" }) + SV.text(F.r, F.b + 24, "Market interest rate (%)", "sm", { "text-anchor": "end" });
    [10000, 25000, 50000].forEach((v) => { o += SV.line(F.l, F.Y(v), F.r, F.Y(v), "gr") + SV.text(F.l - 8, F.Y(v) + 4, "£" + v.toLocaleString(), "sm", { "text-anchor": "end" }); });
    [1, 2, 5, 8, 10].forEach((v) => { o += SV.text(F.X(v), F.b + 18, v + "%", "sm", { "text-anchor": "middle" }); });
    const p = []; for (let r = 1; r <= 10; r += 0.1) p.push([F.X(r), F.Y(500 / (r / 100))]);
    o += SV.path(ptsPath(p), "c1") + SV.line(F.X(s.r), F.Y(price), F.X(s.r), F.b, "gr") + SV.line(F.l, F.Y(price), F.X(s.r), F.Y(price), "gr") + SV.circle(F.X(s.r), F.Y(price), 8, "dot2");
    o += SV.text(F.X(s.r) + 14, F.Y(price) - 12, "£" + Math.round(price).toLocaleString(), "lbl bd t2", { "text-anchor": "start" });
    return o;
  },
  steps: [
    { cap: "A bond pays £500 a year. When the market interest rate is <b>5%</b>, it is worth £500 ÷ 0.05 = <b>£10,000</b>.", s: { r: 5 } },
    { cap: "Suppose traders expect rates to rise to <b>8%</b>. Nobody pays £10,000 for a 5% bond when 8% is on offer. The price falls to <b>£6,250</b>. <b>Rates up, bond prices down.</b>", s: { r: 8 } },
    { cap: "If rates <b>fall</b> to 2%, the same bond is worth <b>£25,000</b>. <b>Rates down, bond prices up.</b>", s: { r: 2 } },
    { cap: "At <b>1%</b> the price is very high. If rates rise from 1% to 2%, the price <b>halves</b>. Traders expect that loss, so they sell bonds and <b>hold cash</b>: this is why the money sits idle in a trap.", s: { r: 1 } },
  ],
});

/* ---------- 2. stepper: how QE works ---------- */
Lib.stepper($("#stB"), {
  w: 760, h: 360, label: "Flow of money in quantitative easing", base: { a: 0, b: 0, c: 0, d: 0 },
  draw: (s) => {
    const box = (x, y, w, h, t1, t2, op, cls) => op ? SV.rect(x, y, w, h, cls, { rx: 12, opacity: op, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + w / 2, y + h / 2 - 4, t1, "lbl bd", { "text-anchor": "middle", opacity: op }) + SV.text(x + w / 2, y + h / 2 + 16, t2, "sm", { "text-anchor": "middle", opacity: op }) : "";
    const arrow = (x1, y1, x2, y2, label, op) => op ? SV.line(x1, y1, x2, y2, "c1", { opacity: op }) + SV.arrowHead(x2, y2, x2 > x1 ? "r" : "d", "dot1") + SV.text((x1 + x2) / 2, y1 - 10, label, "sm", { "text-anchor": "middle", opacity: op }) : "";
    let o = box(40, 120, 190, 90, "Central bank", "creates money", 1, "f1");
    o += box(285, 120, 190, 90, "Banks, pension funds", "sell bonds, receive cash", s.b, "f3");
    o += box(530, 120, 190, 90, "Households and firms", "borrow and spend", s.c, "f4");
    o += arrow(232, 165, 283, 165, "buys bonds", s.b) + arrow(477, 165, 528, 165, "lend and invest", s.c);
    if (s.d) o += SV.text(380, 290, "Higher bond prices, lower yields, a wealth effect, and AD may rise", "lbl bd t3", { "text-anchor": "middle", opacity: s.d }) + SV.text(380, 316, "Risk: the cash may be held idle, which is the trap", "sm", { "text-anchor": "middle", opacity: s.d });
    return o;
  },
  steps: [
    { cap: "Rates are at the floor, so the central bank <b>creates money electronically</b>. It is a digital entry, not printed notes.", s: {} },
    { cap: "It uses the money to <b>buy bonds</b> from banks, pension funds and other investors. Bond prices rise, so long-term yields fall.", s: { b: 1 } },
    { cap: "The sellers hold cash. If they <b>lend and invest</b> it, borrowing is cheaper and spending rises.", s: { b: 1, c: 1 } },
    { cap: "Higher asset prices make people feel richer. If spending rises enough, <b>inflation returns</b>. But if the cash is hoarded, QE has little effect.", s: { b: 1, c: 1, d: 1 } },
  ],
});

/* ---------- Lab 1: bond price ---------- */
Lib.slider($("#sl1"), { id: "a1", label: "Market interest rate", min: 2, max: 10, step: 0.5, value: 5, fmt: (v) => v.toFixed(1) + "%", onInput: (r) => {
  const p = 500 / (r / 100), c = (p / 10000 - 1) * 100;
  $("#b1").textContent = "£" + Math.round(p).toLocaleString("en-GB"); $("#b2").textContent = (c >= 0 ? "+" : "") + c.toFixed(0) + "%";
  $("#v1").textContent = r > 5 ? "Bond prices fell. Holders who expected this sold early." : r < 5 ? "Bond prices rose. A rate cut delivers a gain." : "No change.";
  const base = 130, h = (v) => (v / 25000) * 220;
  $("#lab1").innerHTML = SV.line(60, 260, 440, 260, "ax") + SV.rect(100, 260 - h(10000), 100, h(10000), "f1") + SV.rect(280, 260 - h(p), 100, h(p), p >= 10000 ? "f3" : "f2")
    + SV.text(150, 280, "At 5%", "lbl", { "text-anchor": "middle" }) + SV.text(330, 280, "At " + r.toFixed(1) + "%", "lbl", { "text-anchor": "middle" })
    + SV.text(150, 260 - h(10000) - 8, "£10,000", "lbl bd", { "text-anchor": "middle" }) + SV.text(330, 260 - h(p) - 8, "£" + Math.round(p).toLocaleString("en-GB"), "lbl bd", { "text-anchor": "middle" });
} });

/* ---------- Lab 2: real interest rate ---------- */
Lib.slider($("#sl2"), { id: "a2", label: "Inflation rate", min: -3, max: 3, step: 0.5, value: -2, fmt: (v) => v.toFixed(1) + "%", onInput: (i) => {
  const r = 0 - i;
  $("#r1").textContent = (r > 0 ? "+" : "") + r.toFixed(1) + "%";
  $("#v2").textContent = r > 0 ? "Deflation makes the real rate positive even at a 0% nominal rate. Borrowing is discouraged and spending is delayed." : r < 0 ? "Inflation makes the real rate negative, which encourages spending and borrowing." : "Real rate is zero.";
} });

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), {
  prompt: "Does each event push bond prices up or down?",
  buckets: [{ label: "Bond prices rise" }, { label: "Bond prices fall" }],
  items: [{ text: "Market interest rates fall", b: 0 }, { text: "Central bank buys bonds", b: 0 }, { text: "Traders expect rates to fall", b: 0 }, { text: "Market interest rates rise", b: 1 }, { text: "Traders expect rates to rise", b: 1 }, { text: "Government issues many new cheaper bonds", b: 1 }],
  done: "Rule: interest rates and bond prices move in opposite directions.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Bond", "A loan to the government that pays a fixed amount of interest"],
  ["Liquidity trap", "Rates near zero and people hold cash instead of spending"],
  ["Quantitative easing", "Central bank creates money to buy bonds"],
  ["Deflation", "A sustained fall in the general price level"],
  ["Real interest rate", "Nominal rate minus inflation"],
  ["Effective lower bound", "The level near zero below which rate cuts stop working"],
] });
Lib.order($("#o1"), { prompt: "Put the QE chain in order.", items: [
  "The central bank creates money electronically.",
  "It buys bonds from banks and other investors.",
  "Bond prices rise and long-term yields fall.",
  "Borrowing becomes cheaper and asset prices rise.",
  "Spending rises and inflation may return.",
] });
Lib.calc($("#c1"), { qs: [
  { q: "A bond pays £500 a year for ever. The market rate is 5%. What is its price (£)?", a: 10000, unit: "£", hint: "Price = payment ÷ rate.", sol: "500 ÷ 0.05 = £10,000." },
  { q: "The market rate rises to 8%. What is the price now (£)?", a: 6250, unit: "£", sol: "500 ÷ 0.08 = £6,250." },
  { q: "What is the percentage change in price from £10,000 to £6,250?", a: -37.5, unit: "%", hint: "(new − old) ÷ old × 100.", sol: "(6,250 − 10,000) ÷ 10,000 × 100 = −37.5%." },
  { q: "The policy rate is 0% and prices are falling at 1.5% a year. What is the real interest rate (%)?", a: 1.5, unit: "%", hint: "Real rate = nominal − inflation.", sol: "0 − (−1.5) = +1.5%." },
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "When interest rates rise, the price of an existing bond usually", opts: ["rises", "falls", "stays the same", "doubles"], a: 1, why: "Its fixed interest is less attractive than new bonds, so its price falls until the return matches the market." },
  { q: "Why do traders sell bonds when interest rates are very low?", opts: ["They expect rates to rise and bond prices to fall", "They expect rates to fall further", "Bonds are illegal", "The government forces them to"], a: 0, why: "Expected rises in rates mean expected falls in bond prices, so they sell and hold cash." },
  { q: "Quantitative easing involves the central bank", opts: ["raising taxes", "creating money to buy bonds", "setting prices", "lending to households directly"], a: 1, why: "It creates money electronically and buys bonds, mainly from banks and investors." },
  { q: "In a liquidity trap, extra money supply", opts: ["always raises inflation", "is likely to be held idle", "lowers rates below zero", "cuts government debt"], a: 1, why: "People prefer cash, so extra money does not lower rates or raise spending." },
  { q: "Deflation is dangerous when interest rates are zero because", opts: ["real interest rates rise and spending is delayed", "taxes rise", "bonds become illegal", "the central bank cuts rates below zero"], a: 0, why: "Falling prices raise the real rate and encourage delaying purchases, while the nominal rate cannot fall further." },
] });
Lib.cards($("#fc1"), { cards: [
  ["What is a liquidity trap?", "Interest rates are at or near 0%, and people prefer to hold cash rather than spend or invest, so monetary policy cannot raise GDP."],
  ["Why do bond prices fall when interest rates rise?", "Existing bonds pay a fixed rate. If new bonds pay more, nobody will pay full price for the old ones, so their price falls until the return matches the market."],
  ["Why do traders sell bonds when rates are very low?", "They expect rates to rise, which means bond prices will fall. They sell to avoid the loss and hold cash."],
  ["How does QE work, and why might it fail in a trap?", "The central bank creates digital money and buys bonds, adding money to the economy. It can fail if banks and households hold the extra money as idle cash."],
  ["Why is deflation dangerous when interest rates are already zero?", "Falling prices make cash more valuable, so people delay spending. The real interest rate rises, and the central bank cannot cut the nominal rate further."],
] });
