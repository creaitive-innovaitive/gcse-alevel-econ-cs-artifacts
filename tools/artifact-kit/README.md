# Artifact kit

Shared components for the AS Economics artifacts (stepper animations, sliders, drag-and-drop classify and match, ordering, calculations, quizzes, flashcards, tabs, colour-coded model answers, light/dark theme).

- `lib.css`, `lib.js`: the components.
- `<name>.body.html` and `<name>.js`: the content of each artifact (ped = elasticities, gov = government intervention, ca = comparative advantage, bop = balance of payments).
- `assemble.py <name> "<title>" <slug>` writes `artifacts_src/<slug>/index.html`. Then run `python3 build.py` from the repo root.
