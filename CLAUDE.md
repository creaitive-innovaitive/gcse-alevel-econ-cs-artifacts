# Econ & CS Artifacts site

Static GitHub Pages site for Gary's teaching artifacts (IGCSE/A-Level Econ and CS), with Supabase logins, progress and assessments. Live: https://creaitive-innovaitive.github.io/gcse-alevel-econ-cs-artifacts/

- Build: `python3 build.py` (reads `site_data.py`, `artifacts_src/`, `assessments/`; writes `docs/`). Commit and push after every change.
- Push as creaitive-innovaitive without switching the global gh account:
  `git push -q "https://x-access-token:$(gh auth token --user creaitive-innovaitive)@github.com/creaitive-innovaitive/gcse-alevel-econ-cs-artifacts.git" main`
- New artifact: put it in `artifacts_src/<slug>/`, register in `site_data.py` ARTIFACTS, build. AS Econ artifacts are assembled from `tools/artifact-kit` (see its README).
- Assessments: `assessments/<slug>.json` (MCQ, number, single key-term only; no written answers). Build writes `supabase/assessments_seed.sql`. Marking is server-side in `supabase/schema.sql`.
- Supabase SQL: Gary pastes `supabase/schema.sql` / `assessments_seed.sql` into the SQL Editor himself. Copy with `LC_ALL=en_US.UTF-8 pbcopy < file` (plain pbcopy garbles non-ASCII). Both files are safe to rerun.
- Model answers use hedged wording (could, may, likely to), not will/always/must, unless the question demands it.
- Admin emails: gary.byatt@danang.sis.edu.vn, gbyatt@gmail.com. Never commit passwords.
