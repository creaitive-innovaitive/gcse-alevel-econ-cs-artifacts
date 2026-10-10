# Artifact kit

Shared components for the AS Economics artifacts (stepper animations, sliders, drag-and-drop classify and match, ordering, calculations, quizzes, flashcards, tabs, colour-coded model answers, light/dark theme).

- `lib.css`, `lib.js`: the components.
- `<name>.body.html` and `<name>.js`: the content of each artifact (ped = elasticities, gov = government intervention, ca = comparative advantage, bop = balance of payments).
- `assemble.py <name> "<title>" <slug>` writes `artifacts_src/<slug>/index.html`. Then run `python3 build.py` from the repo root.
- `p4` = A Level Paper 4 20-mark essay guide (`python3 tools/artifact-kit/assemble.py p4 "A-Level Paper 4: The 20-Mark Essay" a-level-paper4-essay`).
- `rec` = A Level CS 19.2 recursion (`python3 tools/artifact-kit/assemble.py rec "A-Level CS 19.2: Recursion" recursion`).
- `dt1`, `dt2`, `dt3` = IGCSE CS chapter 2 (2.1 transmission, 2.2 error detection, 2.3 encryption): `python3 tools/artifact-kit/assemble.py dt1 "Types and Methods of Data Transmission" ig-cs-data-transmission` (likewise `dt2` → `ig-cs-error-detection`, `dt3` → `ig-cs-encryption`).
- `fif` = A Level Econ ch 34 Firm in Focus (`python3 tools/artifact-kit/assemble.py fif "Firm in Focus" firm-in-focus`). An optional `<name>.css` next to the body is appended to `lib.css` (used for the older Learn content's chart classes).
- `mkt` = A Level Econ ch 35 Market Structures Lab (`python3 tools/artifact-kit/assemble.py mkt "Market Structures Lab" market-structures-lab`). A first line of `// uses: econ` in a `.js` file pulls in `econ.js` (cost-curve helpers).
