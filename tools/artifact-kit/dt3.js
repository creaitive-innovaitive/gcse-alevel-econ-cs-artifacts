const MONO = "font-family:ui-monospace,Menlo,Consolas,monospace;";
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const A0 = 65;
const shiftText = (t, key, sgn) => [...t].map((c, i) => String.fromCharCode(((c.charCodeAt(0) - A0 + sgn * +key[i % key.length]) % 26 + 26) % 26 + A0)).join("");
const letters = (s) => s.toUpperCase().replace(/[^A-Z]/g, "");

/* ---------- svg bits ---------- */
const GOOD = "var(--good)", BAD = "var(--bad)", ACC = "var(--accent)";
const box = (x, y, w, h, title, col, lines) => SV.rect(x, y, w, h, "", { rx: 12, style: `fill:var(--surface);stroke:${col};stroke-width:3` }) + SV.text(x + w / 2, y + 24, title, "lbl bd", { "text-anchor": "middle", style: `fill:${col}` }) + (lines || []).map((l, i) => SV.text(x + w / 2, y + 52 + i * 26, l[0], "lbl " + (l[1] || ""), { "text-anchor": "middle", style: MONO + "font-size:15px" })).join("");
const chip = (x, y, w, t, col, op = 1) => SV.rect(x, y, w, 28, "", { rx: 14, style: `fill:${col}`, opacity: op }) + SV.text(x + w / 2, y + 19, t, "lbl bd", { "text-anchor": "middle", style: "fill:#fff;font-size:12px", opacity: op });
const arr = (x1, y1, x2, y2, col, dash) => SV.line(x1, y1, x2, y2, "", { style: `stroke:${col};stroke-width:4;${dash ? "stroke-dasharray:7 6" : ""}` }) + SV.arrowHead(x2, y2, x2 >= x1 ? "r" : "l", "").replace('class=""', `style="fill:${col}"`);
const note = (x, y, t, cls = "", anchor = "middle") => SV.text(x, y, t, "lbl bd " + cls, { "text-anchor": anchor });

/* ---------- 1. symmetric ---------- */
function symChart(s) {
  const k = Math.round(s.k), KEY = "KEY 4 2 9 1 3";
  let o = box(30, 40, 190, 130, "Sender", ACC, k === 0 ? [["Plaintext", "sm"], ["HELLO", "t1"]] : k === 1 ? [["Plaintext: HELLO", "sm"], ["↓ encrypt", "t4"], ["LGUMR", "t2"]] : [["Ciphertext", "sm"], ["LGUMR", "t2"]]);
  o += box(540, 40, 190, 130, "Receiver", GOOD, k < 3 ? [["Waiting…", "sm"]] : k === 3 ? [["Ciphertext: LGUMR", "sm"], ["↓ decrypt", "t4"], ["HELLO", "t3"]] : [["Waiting for the key…", "sm"]]);
  o += SV.rect(290, 70, 180, 70, "f1", { rx: 35 }) + note(380, 112, "Internet", "t1");
  o += chip(65, 186, 120, KEY, ACC, k <= 3 ? 1 : 0.35) + chip(575, 186, 120, KEY, GOOD, k <= 3 ? 1 : 0.35);
  if (k === 0) o += note(380, 202, "Both sides already hold the same key", "t1");
  if (k === 1) o += note(380, 202, "The algorithm uses the key to scramble each letter", "t4");
  o += SV.rect(240, 235, 280, 70, "", { rx: 12, style: `fill:var(--surface);stroke:${k === 4 ? BAD : "var(--muted)"};stroke-width:3` }) + note(380, 258, "Eavesdropper", k === 4 ? "t2" : "");
  if (k === 2) o += arr(220, 105, 290, 105, ACC) + arr(470, 105, 540, 105, ACC) + note(380, 40, "LGUMR", "t2") + SV.line(380, 140, 380, 235, "", { style: "stroke:var(--muted);stroke-width:2;stroke-dasharray:5 5" }) + note(380, 284, "sees LGUMR: meaningless", "sm");
  if (k === 3) o += note(380, 284, "(still only has the ciphertext)", "sm");
  if (k === 4) {
    o += arr(220, 105, 290, 105, ACC, 1) + arr(470, 105, 540, 105, ACC, 1) + chip(320, 22, 120, KEY, ACC) + note(380, 62, "key sent by email", "sm");
    o += SV.line(380, 140, 380, 235, "", { style: "stroke:var(--bad);stroke-width:2;stroke-dasharray:5 5" }) + note(380, 284, "copies the key → reads HELLO", "t2");
  }
  return o;
}
Lib.stepper($("#stA"), { w: 760, h: 330, label: "Symmetric encryption with a shared key", base: { k: 0 }, tween: 1, dwell: 4600, draw: symChart, steps: [
  { cap: "<b>Symmetric</b>: sender and receiver both hold the <b>same key</b>. Here, each letter is shifted by the next digit of 4 2 9 1 3.", s: { k: 0 } },
  { cap: "The encryption algorithm uses the key to turn the plaintext <b>HELLO</b> into the ciphertext <b>LGUMR</b>.", s: { k: 1 } },
  { cap: "The ciphertext crosses the internet. An <b>eavesdropper</b> can copy it, but LGUMR means nothing to them.", s: { k: 2 } },
  { cap: "The receiver uses the <b>same key in reverse</b> and gets HELLO back.", s: { k: 3 } },
  { cap: "The weak spot: how did the receiver get the key? If it is sent across the network, the eavesdropper can <b>intercept the key</b> too and decrypt everything. Securing the key is the main <b>drawback</b>.", s: { k: 4 } },
] });

/* ---------- 2. asymmetric ---------- */
function asyChart(s) {
  const k = Math.round(s.k);
  let o = box(30, 30, 190, 150, "Tom", ACC, k === 2 ? [["Document", "sm"], ["↓ encrypt with", "t4"], ["Jane's PUBLIC key", "t3"]] : k >= 3 ? [["Sent the ciphertext", "sm"]] : [["Has a document", "sm"]]);
  o += box(540, 30, 190, 150, "Jane", GOOD, k === 4 ? [["Ciphertext", "sm"], ["↓ decrypt with", "t4"], ["her PRIVATE key", "t2"], ["Document ✓", "t3"]] : []);
  o += chip(560, 190, 150, "PUBLIC KEY", GOOD) + chip(560, 224, 150, "PRIVATE KEY (secret)", BAD);
  if (k >= 1) o += chip(60, 190, 150, "Jane's PUBLIC key", GOOD);
  o += SV.rect(290, 250, 180, 70, "", { rx: 12, style: "fill:var(--surface);stroke:var(--muted);stroke-width:3" }) + note(380, 272, "Eavesdropper", "");
  if (k === 0) o += note(380, 100, "Jane makes a linked pair of keys", "t1") + note(380, 126, "one cannot be worked out from the other", "sm");
  if (k === 1) o += arr(540, 90, 230, 90, GOOD) + note(380, 70, "Jane sends her PUBLIC key", "t3") + SV.line(380, 100, 380, 250, "", { style: "stroke:var(--muted);stroke-width:2;stroke-dasharray:5 5" }) + chip(305, 190, 150, "copy of the PUBLIC key", GOOD) + note(380, 308, "anyone, even an eavesdropper, may have it", "sm");
  if (k === 2) o += note(380, 100, "Jane's public key encrypts it", "t3");
  if (k === 3) o += arr(220, 100, 540, 100, ACC) + note(380, 80, "ciphertext", "t2") + SV.line(380, 110, 380, 250, "", { style: "stroke:var(--muted);stroke-width:2;stroke-dasharray:5 5" }) + chip(305, 190, 150, "copy of the PUBLIC key", GOOD) + note(380, 308, "has the ciphertext and the public key, but cannot decrypt", "t2");
  if (k === 4) o += note(380, 100, "Only Jane's private key unlocks it", "t3");
  return o;
}
Lib.stepper($("#stB"), { w: 760, h: 330, label: "Asymmetric encryption: Tom sends Jane a document", base: { k: 0 }, tween: 1, dwell: 4800, draw: asyChart, steps: [
  { cap: "Jane generates a matching <b>pair of keys</b>: a public key and a private key. She keeps both on her computer.", s: { k: 0 } },
  { cap: "Jane sends her <b>public key</b> to Tom. It does not matter if others see it. Her <b>private key</b> never leaves her computer.", s: { k: 1 } },
  { cap: "Tom uses <b>Jane's public key</b> to encrypt the confidential document.", s: { k: 2 } },
  { cap: "He sends the ciphertext to Jane. An eavesdropper has the ciphertext <b>and</b> Jane's public key, but the public key can only <b>encrypt</b>, not decrypt.", s: { k: 3 } },
  { cap: "Jane uses her matching <b>private key</b> to decrypt it. No secret key ever had to travel across the network.", s: { k: 4 } },
] });

/* ---------- Lab 1: cipher ---------- */
(() => {
  const m = $("#cm"), k1 = $("#ck1"), k2 = $("#ck2"), co = $("#co"), cd = $("#cd"), ct = $("#ct"), cv = $("#cv"); let linked = true;
  const digs = (s) => s.replace(/[^0-9]/g, "");
  k2.addEventListener("input", () => (linked = false));
  function upd() {
    const p = letters(m.value), K1 = digs(k1.value); if (linked) k2.value = k1.value; const K2 = digs(k2.value);
    if (!K1 || !K2 || !p) { co.textContent = cd.textContent = "…"; ct.innerHTML = ""; cv.textContent = "Enter a message and a key made of digits."; return; }
    const c = shiftText(p, K1, 1), d = shiftText(c, K2, -1), same = d === p;
    co.textContent = c; cd.textContent = d; cd.className = "out " + (same ? "good" : "bad");
    const n = Math.min(p.length, 14);
    ct.innerHTML = `<tr><th>Plaintext</th>${[...p.slice(0, n)].map((x) => `<td>${x}</td>`).join("")}</tr><tr><th>Key digit</th>${[...p.slice(0, n)].map((_, i) => `<td>+${K1[i % K1.length]}</td>`).join("")}</tr><tr><th>Ciphertext</th>${[...c.slice(0, n)].map((x) => `<td><b>${x}</b></td>`).join("")}</tr>`;
    cv.innerHTML = same ? `Same key at both ends, so the receiver recovers the plaintext. A ${K1.length}-digit key has 10<sup>${K1.length}</sup> possible values.` : `<b>Different keys</b>, so the receiver gets gibberish. Symmetric encryption only works if both sides hold <b>exactly the same key</b>.`;
  }
  [m, k1, k2].forEach((e) => e.addEventListener("input", upd)); upd();
})();

/* ---------- Lab 2: cracking time ---------- */
(() => {
  const KEYS = [["10 denary digits", 1e10], ["8 bits", 2 ** 8], ["16 bits", 2 ** 16], ["32 bits", 2 ** 32], ["40 bits", 2 ** 40], ["56 bits", 2 ** 56], ["64 bits", 2 ** 64], ["128 bits", 2 ** 128], ["256 bits", 2 ** 256]];
  const sci = (x) => { const e = Math.floor(Math.log10(x)); return e < 6 ? Math.round(x).toLocaleString("en-GB") : (x / 10 ** e).toFixed(1) + " × 10<sup>" + e + "</sup>"; };
  const dur = (s) => s < 1 ? "under a second" : s < 60 ? Math.round(s) + " seconds" : s < 3600 ? Math.round(s / 60) + " minutes" : s < 86400 ? Math.round(s / 3600) + " hours" : s < 3.156e7 ? Math.round(s / 86400) + " days" : s / 3.156e7 < 1e6 ? Math.round(s / 3.156e7).toLocaleString("en-GB") + " years" : (s / 3.156e7 / 10 ** Math.floor(Math.log10(s / 3.156e7))).toFixed(1) + " × 10<sup>" + Math.floor(Math.log10(s / 3.156e7)) + "</sup> years";
  let ks, rs;
  function upd() {
    if (!ks || !rs) return;
    const [lab, n] = KEYS[ks.get()], rate = 10 ** rs.get(), t = n / rate, yrs = t / 3.156e7;
    $("#ka").innerHTML = sci(n); $("#kb").innerHTML = dur(t);
    $("#kv").innerHTML = yrs > 1.4e10 ? `Trying every possible key of ${lab} would take far longer than the age of the universe (about 1.4 × 10<sup>10</sup> years). Brute force is not realistic.` : t < 3600 ? `A key of ${lab} could be tried in ${dur(t)} at this speed. That is not secure.` : `At ${sci(rate)} keys per second, ${dur(t)} are needed to try every key of ${lab}. Longer keys make brute force much slower.`;
  }
  ks = Lib.slider($("#k1"), { id: "kk1", label: "Key size", min: 0, max: 8, value: 0, fmt: (i) => KEYS[i][0], onInput: upd });
  rs = Lib.slider($("#k2"), { id: "kk2", label: "Keys tried per second", min: 3, max: 15, value: 9, fmt: (e) => "10^" + e, onInput: upd });
  upd();
})();

/* ---------- Lab 3: how many keys ---------- */
(() => {
  const svg = $("#net"); let sl;
  function upd() {
    if (!sl) return;
    const n = sl.get(), sym = (n * (n - 1)) / 2, pts = Array.from({ length: n }, (_, i) => [160 + 130 * Math.cos((2 * Math.PI * i) / n - Math.PI / 2), 160 + 130 * Math.sin((2 * Math.PI * i) / n - Math.PI / 2)]);
    let o = "";
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) o += SV.line(pts[i][0].toFixed(1), pts[i][1].toFixed(1), pts[j][0].toFixed(1), pts[j][1].toFixed(1), "", { style: `stroke:var(--accent);stroke-width:${n > 15 ? 0.6 : 1.4};opacity:${n > 15 ? 0.5 : 0.7}` });
    pts.forEach((p) => (o += SV.circle(p[0].toFixed(1), p[1].toFixed(1), n > 15 ? 5 : 8, "dot1")));
    svg.innerHTML = o;
    $("#na").textContent = sym; $("#nb").textContent = n;
    $("#nv").innerHTML = `With ${n} people, symmetric encryption needs <b>${sym}</b> different secret keys (one per pair of people, each shared secretly). Asymmetric needs <b>${n}</b> key pairs, one per person, and only the public halves are handed out.`;
  }
  sl = Lib.slider($("#n1"), { id: "nn", label: "Number of people", min: 2, max: 30, value: 5, onInput: upd });
  upd();
})();

/* ---------- Lab 4: which key ---------- */
(() => {
  const el = $("#kch"), v = $("#kvv");
  const opts = [
    ["Jane's public key", 1, "Correct. Jane sent Tom her public key, so he has it. Only Jane's matching private key can decrypt the result, and she has never shared that."],
    ["Jane's private key", 0, "Tom does not have it. A private key is known only to its owner and is never sent to anyone."],
    ["Tom's public key", 0, "Anyone can have Tom's public key. Jane would need Tom's matching private key to decrypt, and only Tom has it. This would help someone sending a message to Tom, not Jane."],
    ["A secret key that only Tom knows", 0, "If only Tom knows the key, Jane cannot decrypt. And sending it to her would bring back the symmetric key-security problem."],
  ];
  el.innerHTML = opts.map((o, i) => `<button type="button" data-i="${i}">${o[0]}</button>`).join("");
  $$("button", el).forEach((b) => (b.onclick = () => { const o = opts[+b.dataset.i]; $$("button", el).forEach((x) => x.classList.remove("ok", "no")); b.classList.add(o[1] ? "ok" : "no"); v.innerHTML = (o[1] ? "✓ " : "✗ ") + o[2]; }));
})();

/* ---------- Practise ---------- */
Lib.classify($("#cl1"), { prompt: "Drag each statement to the type of encryption it describes.", buckets: [{ label: "Symmetric" }, { label: "Asymmetric" }], items: [
  { text: "One key encrypts and decrypts", b: 0 }, { text: "Both sides need the same key", b: 0 }, { text: "The key must be sent to the receiver", b: 0 }, { text: "Main drawback: the key could be intercepted", b: 0 },
  { text: "Uses a public key and a private key", b: 1 }, { text: "The private key is never shared", b: 1 }, { text: "Created to fix the key-security problem", b: 1 }, { text: "Two-way messages need each person to have a key pair", b: 1 },
], done: "One shared key, or a linked pair." });

Lib.classify($("#cl2"), { prompt: "Which key does each statement describe?", buckets: [{ label: "Public key" }, { label: "Private key" }], items: [
  { text: "Available to everybody", b: 0 }, { text: "Used by Tom to encrypt a message to Jane (Jane's)", b: 0 }, { text: "Can be sent across the internet safely", b: 0 }, { text: "Cannot decrypt a message it encrypted", b: 0 },
  { text: "Known only to its owner", b: 1 }, { text: "Used by Jane to decrypt Tom's message", b: 1 }, { text: "Never sent to anyone", b: 1 }, { text: "Must be kept secret", b: 1 },
], done: "Public to encrypt, private to decrypt." });

Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Plaintext", "The original data before it is encrypted"], ["Ciphertext", "The encrypted data produced by the algorithm"], ["Encryption", "Making data meaningless without the correct key"], ["Eavesdropper", "A hacker who intercepts data on a network"],
  ["Symmetric encryption", "The same key encrypts and decrypts"], ["Asymmetric encryption", "A public key and a private key are used"], ["Public key", "A key that is known to all users"], ["Private key", "A key known only to one user"],
] });

Lib.order($("#o1"), { prompt: "Put the steps for Tom to send Jane a confidential document in the right order.", items: [
  "Jane generates a matching public key and private key", "Jane sends her public key to Tom", "Tom encrypts the document using Jane's public key", "Tom sends the encrypted document to Jane", "Jane decrypts the document using her private key",
], done: "Generate, share public, encrypt, send, decrypt." });

Lib.calc($("#c1"), { qs: [
  { q: "Key 3 1 2 (repeating). Encrypt the word CAT.", t: ["FBV"], ph: "3 letters", sol: "C+3 = F, A+1 = B, T+2 = V → FBV.", hint: "Shift each letter by the next key digit." },
  { q: "Key 4 2 9. Decrypt GQV.", t: ["COM"], ph: "3 letters", sol: "G−4 = C, Q−2 = O, V−9 = M → COM.", hint: "Shift each letter back." },
  { q: "Key 2 4 1 (repeating). Encrypt DOG.", t: ["FSH"], ph: "3 letters", sol: "D+2 = F, O+4 = S, G+1 = H → FSH." },
  { q: "Key 1 1 1 1 1. Decrypt IFMMP.", t: ["HELLO"], ph: "5 letters", sol: "Each letter goes back one: I→H, F→E, M→L, M→L, P→O → HELLO." },
  { q: "How many different keys are possible with a 4-digit denary key (0000 to 9999)?", a: 10000, sol: "10⁴ = 10,000 keys.", hint: "Each of 4 digits has 10 values." },
  { q: "How many different keys are possible with an 8-bit key?", a: 256, sol: "2⁸ = 256 keys.", hint: "Each bit has 2 values." },
  { q: "Six colleagues each want a private symmetric channel with every other colleague. How many different secret keys are needed (one per pair)?", a: 15, sol: "6 × 5 ÷ 2 = 15 keys.", hint: "Count the pairs. A and B share one key; B and A is the same pair." },
  { q: "Those six colleagues use asymmetric encryption instead. How many key pairs are generated?", a: 6, sol: "One key pair per person: 6 pairs (each person shares only their public key)." },
] });

(() => {
  const el = $("#drill"), WORDS = ["CAT", "DOG", "SUN", "MAP", "DATA", "CODE", "BYTE", "KEY", "CHIP", "LOGIN"];
  el.innerHTML = `<label>Practise: <select data-m><option value="enc">Encrypt (plaintext → ciphertext)</option><option value="dec">Decrypt (ciphertext → plaintext)</option></select></label>
    <div class="qline" aria-live="polite"></div>
    <div class="row"><input type="text" autocomplete="off" autocapitalize="characters" aria-label="Your answer"><button class="b pri" data-a="c">Check</button><button class="b" data-a="s">Show working</button><button class="b" data-a="n">New question</button><span class="fb" aria-live="polite"></span></div><p class="note" data-st></p><p class="note" data-w></p>`;
  const ql = $(".qline", el), md = $("[data-m]", el), inp = $("input", el), fb = $(".fb", el), st = $("[data-st]", el), wk = $("[data-w]", el);
  let ans = "", work = "", streak = 0, best = 0, solved = false;
  function gen() {
    const w = pick(WORDS), key = Array.from({ length: 3 }, () => 1 + Math.floor(Math.random() * 9)).join(""), c = shiftText(w, key, 1); solved = false;
    if (md.value === "enc") { ans = c; ql.textContent = `Key ${key.split("").join(" ")} (repeating). Encrypt ${w}.`; work = [...w].map((x, i) => `${x}+${key[i % 3]}=${c[i]}`).join(", "); }
    else { ans = w; ql.textContent = `Key ${key.split("").join(" ")} (repeating). Decrypt ${c}.`; work = [...c].map((x, i) => `${x}−${key[i % 3]}=${w[i]}`).join(", "); }
    inp.value = ""; fb.textContent = ""; fb.className = "fb"; wk.textContent = "";
  }
  const check = () => { const good = inp.value.replace(/\s/g, "").toUpperCase() === ans; if (!solved) { streak = good ? streak + 1 : 0; best = Math.max(best, streak); } if (good) solved = true; fb.textContent = good ? "✓ Correct" : "✗ Not quite"; fb.className = "fb " + (good ? "ok" : "no"); st.textContent = `Streak ${streak} · best ${best}`; };
  $("[data-a=c]", el).onclick = check; inp.addEventListener("keydown", (e) => e.key === "Enter" && (solved ? gen() : check()));
  $("[data-a=n]", el).onclick = gen; md.onchange = () => { streak = 0; st.textContent = ""; gen(); };
  $("[data-a=s]", el).onclick = () => { streak = 0; solved = true; wk.textContent = "Working: " + work; st.textContent = "Streak 0 · best " + best; };
  gen();
})();

Lib.quiz($("#qz1"), { qs: [
  { q: "What is ciphertext?", opts: ["The key used to encrypt", "The original message", "The encrypted message", "The algorithm"], a: 2, why: "Ciphertext is the output of the encryption algorithm." },
  { q: "Which key does the receiver keep private in asymmetric encryption?", opts: ["The public key", "The private key", "Both keys", "Neither key"], a: 1, why: "The private key is known only to its owner, the receiver." },
  { q: "Tom sends Jane a confidential file using asymmetric encryption. Which key does Tom use to encrypt it?", opts: ["Tom's private key", "Tom's public key", "Jane's public key", "Jane's private key"], a: 2, why: "Jane's public key. Only Jane's private key can decrypt it." },
  { q: "What is the main drawback of symmetric encryption?", opts: ["It cannot encrypt text", "The shared key has to be sent, so it could be intercepted", "It uses two keys", "It only works on one computer"], a: 1, why: "Both sides need the same key, so it must be passed on securely." },
  { q: "Encryption…", opts: ["stops data being intercepted", "makes intercepted data meaningless without the key", "deletes the data after sending", "makes the data faster"], a: 1, why: "Encryption cannot prevent interception; it makes the intercepted data unreadable." },
  { q: "Why is a 256-bit key better than a 10-digit denary key?", opts: ["It is easier to remember", "It has far more possible values, so is far harder to crack", "It needs no algorithm", "It is shorter"], a: 1, why: "2²⁵⁶ possible keys against 10¹⁰." },
  { q: "For two-way encrypted communication between Tom and Jane using asymmetric encryption, which is needed?", opts: ["Only Jane has a key pair", "Each has a key pair and shares the public key", "Both use the same single key", "No keys at all"], a: 1, why: "Each person needs their own pair and sends their public key to the other." },
] });

Lib.cards($("#fc1"), { cards: [
  ["Encryption", "Making data meaningless using an encryption key. Without the correct decryption key it cannot be decoded."], ["Plaintext", "The original text or data before it goes through an encryption algorithm."],
  ["Ciphertext", "The encrypted data produced when plaintext goes through an encryption algorithm."], ["Encryption algorithm", "The software that takes plaintext and generates ciphertext, using a key."],
  ["Eavesdropper", "Another name for a hacker who intercepts data being transmitted on a wired or wireless network."], ["Symmetric encryption", "Encryption in which the same key is used to encrypt and to decrypt."],
  ["Asymmetric encryption", "Encryption that uses a public key and a private key."], ["Public key", "A key that is known to all users."], ["Private key", "A key known only to a single computer or user."],
  ["Key distribution problem", "The difficulty of getting a shared secret key to the receiver without it being intercepted."], ["Quantum computer (A Level extension)", "A computer that performs calculations based on probability rather than simple 0 or 1 values, with the potential to process far more data."],
] });
