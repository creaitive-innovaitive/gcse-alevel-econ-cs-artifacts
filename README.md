# GCSE & A-Level Artifacts: Economics and Computer Science

Static site for IGCSE and A-Level Economics and Computer Science classroom activities. Hosted on GitHub Pages from `docs/`.

## Adding an artifact

1. Drop its HTML (plus any supporting files) in `artifacts_src/<slug>/`, main page as `index.html`.
2. Add an entry to `ARTIFACTS` in `site_data.py` with its chapter placement. The first placement is where the back link goes.
3. `python3 build.py`, commit, push. Pages redeploys.

Course structure (chapters, sections, AS/A Level split) also lives in `site_data.py`. `docs/` is generated, don't edit it by hand.

## Profile setup (Supabase)

No emails and no self sign-up. The Admin panel creates each student's login with a generated password (two academic words plus two digits, e.g. `OutcomeMethod47`), which you give to the student. Students sign in on the Profile page with their school email and that password.

1. Create a Supabase project. Put its URL and public (publishable) key in `assets/config.js`, run `python3 build.py`, push.
2. SQL Editor: paste the contents of `supabase/schema.sql` and run it. Safe to re-run.
3. Set admin passwords by hand (never commit them), then re-run the last two statements of the schema:
   `update public.admins set initial_password = '...' where email = '...';`
4. Optional hardening: Authentication > Sign In / Providers > turn off "Allow new users to sign up".
5. Sign in on the Profile page as an admin, then add students from the Admin panel.

Admin panel: add students, edit name/subjects/password, collapsible list of assigned passwords, Reset login (recreates the login with the listed password, keeps progress), delete student, progress CSV.
