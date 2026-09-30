# GCSE & A-Level Artifacts: Economics and Computer Science

Static site for IGCSE and A-Level Economics and Computer Science classroom activities. Hosted on GitHub Pages from `docs/`.

## Adding an artifact

1. Drop its HTML (plus any supporting files) in `artifacts_src/<slug>/`, main page as `index.html`.
2. Add an entry to `ARTIFACTS` in `site_data.py` with its chapter placement. The first placement is where the back link goes.
3. `python3 build.py`, commit, push. Pages redeploys.

Course structure (chapters, sections, AS/A Level split) also lives in `site_data.py`. `docs/` is generated, don't edit it by hand.

## Profile / student accounts (not built yet)

Needs a backend, since GitHub Pages is static. Plan: Supabase Auth, with signup restricted to `@danang.sis.edu.vn` (enforced server-side by a before-user-created hook, not just in the form) and custom SMTP so reset emails send from the school account. Note that anything in `docs/` is public, so per-subject access control will only apply to profile data, not to the artifacts themselves.
