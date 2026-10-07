# Artifact kit

Shared components for the AS Economics artifacts (stepper animations, sliders, drag-and-drop classify and match, ordering, calculations, quizzes, flashcards, tabs, colour-coded model answers, light/dark theme).

- `lib.css`, `lib.js`: the components.
- `<name>.body.html` and `<name>.js`: the content of each artifact (ped = elasticities, gov = government intervention, ca = comparative advantage, bop = balance of payments).
- `assemble.py <name> "<title>" <slug>` writes `artifacts_src/<slug>/index.html`. Then run `python3 build.py` from the repo root.
- `p4` = A Level Paper 4 20-mark essay guide (`python3 tools/artifact-kit/assemble.py p4 "A-Level Paper 4: The 20-Mark Essay" a-level-paper4-essay`).
- `rec` = A Level CS 19.2 recursion (`python3 tools/artifact-kit/assemble.py rec "A-Level CS 19.2: Recursion" recursion`).
