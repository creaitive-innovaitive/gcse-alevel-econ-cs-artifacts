const LINES = ["total = 0", "FOR i = 1 TO 5", "total = total + i", "NEXT i", "OUTPUT total"];
Lib.stepper($("#stA"), {
  w: 760, h: 330, label: "A compiler reports errors before running; an interpreter runs lines until it hits the error", base: { c: 0, i: 0 },
  draw: (s) => {
    const col = (x, title, k, cls) => {
      let o = SV.text(x + 150, 34, title, "lbl bd", { "text-anchor": "middle" });
      LINES.forEach((l, n) => { const done = n < k, bad = n === 2 && k >= 3, y = 54 + n * 46; o += SV.rect(x, y, 300, 38, bad ? "f2" : done ? cls : "cell", { rx: 8, style: "stroke:var(--line);stroke-width:2" }) + SV.text(x + 12, y + 25, l, "lbl", { "text-anchor": "start" }); });
      return o;
    };
    return col(30, "Compiler", s.c, "f3") + col(400, "Interpreter", s.i, "f3");
  },
  steps: [
    { cap: "Line 3 has a <b>syntax error</b>. See how each translator handles the same five lines.", s: { c: 0, i: 0 } },
    { cap: "The <b>interpreter</b> translates and runs line by line. Lines 1 and 2 run fine.", s: { c: 0, i: 2 } },
    { cap: "At line 3 the interpreter <b>stops at the first error</b>. Lines 4 and 5 never run.", s: { c: 0, i: 3 } },
    { cap: "The <b>compiler</b> translates the <b>whole program first</b>. It finds the error in line 3, reports it and produces <b>no program to run</b>.", s: { c: 3, i: 3 } },
  ],
});
function trLab(n) {
  $("#v1").innerHTML = `<b>Compiler:</b> translates all 5 lines first, reports the error in line ${n}, and produces no program. 0 lines run.`;
  $("#v2").innerHTML = `<b>Interpreter:</b> runs lines 1 to ${n - 1} and stops at line ${n}. ${n - 1} line${n - 1 === 1 ? "" : "s"} run before it stops.`;
  let o = SV.text(170, 28, "Compiler", "lbl bd", { "text-anchor": "middle" }) + SV.text(520, 28, "Interpreter", "lbl bd", { "text-anchor": "middle" });
  for (let i = 1; i <= 5; i++) { const y = 40 + (i - 1) * 40, bad = i === n;
    o += SV.rect(30, y, 280, 32, bad ? "f2" : "cell", { rx: 8, style: "stroke:var(--line);stroke-width:2" }) + SV.text(44, y + 21, "Line " + i + (bad ? " (error)" : ""), "lbl", { "text-anchor": "start" });
    o += SV.rect(380, y, 280, 32, bad ? "f2" : i < n ? "f3" : "cell", { rx: 8, style: "stroke:var(--line);stroke-width:2" }) + SV.text(394, y + 21, "Line " + i + (bad ? " (error: stops)" : i < n ? " (runs)" : " (never runs)"), "lbl", { "text-anchor": "start" }); }
  $("#lab1").innerHTML = o;
}
Lib.slider($("#sl1"), { id: "a1", label: "Line containing the syntax error", min: 1, max: 5, step: 1, value: 3, fmt: (v) => "Line " + v, onInput: (n) => $("#lab1") && $("#v1") && trLab(n) });
trLab(3);
Lib.classify($("#cl1"), {
  prompt: "Sort each item by category.",
  buckets: [{ label: "Operating system job" }, { label: "Utility software" }, { label: "Application software" }, { label: "Translator / development" }],
  items: [
    { text: "Peripheral management", b: 0 }, { text: "Memory management", b: 0 }, { text: "User account management", b: 0 },
    { text: "Disk defragmentation", b: 1 }, { text: "Anti-virus software", b: 1 }, { text: "Backup utility", b: 1 }, { text: "File compression", b: 1 },
    { text: "Word processor", b: 2 }, { text: "Spreadsheet", b: 2 }, { text: "Web browser", b: 2 },
    { text: "Assembler", b: 3 }, { text: "Compiler", b: 3 }, { text: "IDE", b: 3 },
  ],
  done: "Operating systems manage; utilities look after; applications do tasks; translators turn code into machine code.",
});
Lib.match($("#m1"), { prompt: "Match each term to its meaning.", pairs: [
  ["Operating system", "Manages hardware, memory and files so applications can run"],
  ["Compiler", "Translates the whole program into machine code before it runs"],
  ["Interpreter", "Translates and runs one line at a time"],
  ["Bespoke software", "Written to a specific customer's requirements"],
  ["Firmware", "Permanent software stored on a ROM chip in a device"],
  ["Source code", "Code as typed by the programmer, before translation"],
] });
Lib.quiz($("#qz1"), { qs: [
  { q: "Which type of translator stops at the first error it finds?", opts: ["Compiler", "Interpreter", "Assembler", "Linker"], a: 1, why: "It translates and runs line by line, so it stops where the error is." },
  { q: "Anti-virus software is", opts: ["application software", "utility software", "firmware", "source code"], a: 1, why: "It looks after the computer rather than doing a user task." },
  { q: "A program runs but displays the wrong total. This is a", opts: ["syntax error", "logic error", "compiler error", "hardware error"], a: 1, why: "The program ran, so the rules were followed, but the steps were wrong." },
  { q: "Software written for one customer's needs is", opts: ["off-the-shelf", "bespoke", "firmware", "utility"], a: 1, why: "Bespoke software is written to a specific customer's requirements." },
] });
Lib.cards($("#fc1"), { cards: [
  ["Operating system", "Software that manages hardware, memory, files and users so applications can run."],
  ["Utility software", "Housekeeping software such as anti-virus, defragmentation, compression and backup."],
  ["Application software", "Software for the user's tasks, such as word processors and games."],
  ["Compiler", "Translates a whole high-level program into machine code before it runs."],
  ["Interpreter", "Translates and runs a program line by line, stopping at the first error."],
  ["Source code", "Program code as typed by the programmer."],
  ["Machine code", "Binary instructions the processor executes directly."],
  ["Bespoke software", "Software written for one customer's specific needs."],
  ["Off-the-shelf software", "Software made for many customers and bought as it is."],
  ["Firmware", "Permanent software stored on a ROM chip inside a device."],
  ["IDE", "Integrated development environment: an editor, translator and debugger in one package."],
  ["Syntax error", "A mistake in the rules of the language; the program cannot run."],
  ["Logic error", "A mistake in the steps; the program runs but gives wrong results."],
] });
