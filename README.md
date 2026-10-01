# GCSE & A-Level Artifacts: Economics and Computer Science

Static site for IGCSE and A-Level Economics and Computer Science classroom activities. Hosted on GitHub Pages from `docs/`.

## Adding an artifact

1. Drop its HTML (plus any supporting files) in `artifacts_src/<slug>/`, main page as `index.html`.
2. Add an entry to `ARTIFACTS` in `site_data.py` with its chapter placement. The first placement is where the back link goes.
3. `python3 build.py`, commit, push. Pages redeploys.

Course structure (chapters, sections, AS/A Level split) also lives in `site_data.py`. `docs/` is generated, don't edit it by hand.

## Profile setup (Supabase)

No emails are involved. Admins add each student with an assigned password (generated from academic words, e.g. `OutcomeMethod47`) and give it to them. A student signs in on the Profile page with their school email and that password; the first sign-in creates the login, and the database only accepts it when the password matches the class list.

1. Create a Supabase project. Put its URL and public (publishable) key in `assets/config.js`, run `python3 build.py`, push.
2. SQL Editor: paste the contents of `supabase/schema.sql` and run it. Safe to re-run.
3. Authentication > Sign In / Providers > Email: turn **Confirm email OFF**. Leave other providers off.
4. Set admin passwords by hand (never commit them):
   `update public.admins set initial_password = '...' where email = '...';`
5. Sign in on the Profile page as an admin once, then add students from the Admin panel.

Admin panel: add students, edit name/subjects/password, collapsible list of assigned passwords (name, email, password), Reset login (deletes the login but keeps progress; the student signs in again with the list password), delete student, progress CSV. Students can change their own password; the list then shows the original, so use Reset login if one is forgotten.
