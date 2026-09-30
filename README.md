# GCSE & A-Level Artifacts: Economics and Computer Science

Static site for IGCSE and A-Level Economics and Computer Science classroom activities. Hosted on GitHub Pages from `docs/`.

## Adding an artifact

1. Drop its HTML (plus any supporting files) in `artifacts_src/<slug>/`, main page as `index.html`.
2. Add an entry to `ARTIFACTS` in `site_data.py` with its chapter placement. The first placement is where the back link goes.
3. `python3 build.py`, commit, push. Pages redeploys.

Course structure (chapters, sections, AS/A Level split) also lives in `site_data.py`. `docs/` is generated, don't edit it by hand.

## Profile setup (Supabase)

The profile page needs a Supabase project (free tier is fine). Until `assets/config.js` is filled in, the page shows "Accounts are not switched on yet".

1. Create a project at supabase.com. Note the Project URL and the `anon` public key (Project Settings > API).
2. SQL Editor > New query > paste `supabase/schema.sql` > Run. This creates the tables, row-level security rules, the sign-up gate and the admin functions. The two admin emails are listed at the top of the file.
3. Put the URL and anon key in `assets/config.js`, run `python3 build.py`, commit and push. The anon key is safe to publish.
4. Authentication > URL Configuration: set Site URL to `https://creaitive-innovaitive.github.io/gcse-alevel-econ-cs-artifacts/` and add `.../profile/` to Redirect URLs.
5. Authentication > Providers: leave Email on, "Confirm email" on, everything else off. Set minimum password length to 8.
6. Authentication > SMTP Settings: enable custom SMTP so confirmation and reset emails come from the school account (Microsoft 365: `smtp.office365.com`, port 587, your school login; the school may need to allow SMTP AUTH for that mailbox). Without this Supabase sends from its own address at a low rate limit.
7. Sign up on the Profile page with `gary.byatt@danang.sis.edu.vn` first (admin). Then add students from the Admin panel.

How it works: an admin adds students (name, school email, subjects) to the class list. Only listed emails can create an account, enforced by a database trigger. Students confirm their email, set a password, and see their subjects and progress. Students mark artifacts done from the chapter page or the button on the artifact itself. Admins can add, edit and delete students, change subjects, send password-reset emails and export progress as CSV. Passwords are never visible to anyone, including admins.
