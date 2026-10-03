-- Safe to run more than once. Supabase: SQL Editor > New query > paste the CONTENTS of this file > Run.
--
-- Access model: no self-service. A student has one or two login emails (any provider), same password for both.
-- (Earlier note: no emails are sent.) An admin adds each student with an assigned password.
-- Sign-up only succeeds when the password typed matches the one on the class list (checked in the
-- database against the hash), so only the student who was given the password can create the login.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.admins (
  email            text primary key check (email = lower(email)),
  name             text not null,
  initial_password text            -- set by hand in SQL, never committed to the repo
);
alter table public.admins add column if not exists initial_password text;
insert into public.admins (email, name) values
  ('gary.byatt@danang.sis.edu.vn', 'Gary Byatt'),
  ('gbyatt@gmail.com', 'Gary Byatt')
on conflict (email) do nothing;

-- Co-teachers: can open every subject, but have no admin access and see no student data.
create table if not exists public.teachers (
  email    text primary key check (email = lower(email)),
  name     text not null,
  password text not null
);
alter table public.teachers enable row level security;

create table if not exists public.profiles (
  email        text primary key check (email = lower(email)),
  name         text not null,
  subjects     text[] not null default '{}',   -- any of: ig-econ, ig-cs, a-econ, a-cs
  password     text not null default '',       -- assigned password, visible to admins only
  created_at   timestamptz not null default now(),
  signed_up_at timestamptz,
  last_seen    timestamptz
);
-- v3: any email address allowed, plus an optional second login email.
alter table public.profiles drop constraint if exists profiles_email_check;
alter table public.profiles drop constraint if exists profiles_email_lower;
alter table public.profiles add constraint profiles_email_lower check (email = lower(email));
alter table public.profiles add column if not exists email2 text;
alter table public.profiles drop constraint if exists profiles_email2_check;
alter table public.profiles add constraint profiles_email2_check check (email2 is null or (email2 = lower(email2) and email2 <> email));
create unique index if not exists profiles_email2_key on public.profiles (email2) where email2 is not null;
alter table public.profiles add column if not exists password text not null default '';
alter table public.profiles add column if not exists classes text[] not null default '{}';    -- ig1-cs, ig2-cs, a-cs, ig2-econ, a-econ
alter table public.profiles add column if not exists requested text[] not null default '{}';  -- subjects awaiting approval

create table if not exists public.progress (
  email   text not null check (email = lower(email)),
  slug    text not null,
  done_at timestamptz not null default now(),
  primary key (email, slug)
);

alter table public.admins   enable row level security;   -- no policies: clients never read it directly
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = lower(auth.jwt() ->> 'email'))
$$;

-- The profile key (primary email) behind whichever login email is signed in.
create or replace function public.my_key() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select email from profiles
                    where email = lower(auth.jwt() ->> 'email') or email2 = lower(auth.jwt() ->> 'email') limit 1),
                  lower(auth.jwt() ->> 'email'))
$$;

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins   where email = lower(auth.jwt() ->> 'email'))
      or exists (select 1 from teachers where email = lower(auth.jwt() ->> 'email'))
      or exists (select 1 from profiles where email = lower(auth.jwt() ->> 'email') or email2 = lower(auth.jwt() ->> 'email'))
$$;

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (is_admin()) with check (is_admin());

drop policy if exists teachers_admin_all on public.teachers;
create policy teachers_admin_all on public.teachers
  for all using (is_admin()) with check (is_admin());

drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress
  for select using (email = my_key() or is_admin());
drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress
  for insert with check (email = my_key() and is_member());
drop policy if exists progress_delete on public.progress;
create policy progress_delete on public.progress
  for delete using (email = my_key());

-- No address may appear twice across primary/second emails, or collide with an admin.
create or replace function public.check_profile_emails() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from profiles where email <> new.email and (email = new.email or email2 = new.email))
     or exists (select 1 from admins where email = new.email)
     or exists (select 1 from teachers where email = new.email) then
    raise exception 'Email % is already in use', new.email;
  end if;
  if new.email2 is not null and (
       exists (select 1 from profiles where email <> new.email and (email = new.email2 or email2 = new.email2))
       or exists (select 1 from profiles where email = new.email2)
       or exists (select 1 from admins where email = new.email2)
       or exists (select 1 from teachers where email = new.email2)) then
    raise exception 'Email % is already in use', new.email2;
  end if;
  return new;
end $$;
drop trigger if exists check_profile_emails on public.profiles;
create trigger check_profile_emails before insert or update of email, email2 on public.profiles
  for each row execute function public.check_profile_emails();

-- Sign-up gate: the password supplied must match the assigned one (admins: admins.initial_password).
create or replace function public.gate_signup() returns trigger
language plpgsql security definer set search_path = public, extensions as $$
declare a admins; p profiles;
begin
  select * into a from admins where email = lower(new.email);
  if found and a.initial_password is not null and a.initial_password <> ''
     and new.encrypted_password = crypt(a.initial_password, new.encrypted_password) then
    return new;
  end if;
  if exists (select 1 from teachers t where t.email = lower(new.email) and t.password <> ''
             and new.encrypted_password = crypt(t.password, new.encrypted_password)) then
    return new;
  end if;
  select * into p from profiles where email = lower(new.email) or email2 = lower(new.email);
  if found and p.password <> '' and new.encrypted_password = crypt(p.password, new.encrypted_password) then
    update profiles set signed_up_at = coalesce(signed_up_at, now()) where email = p.email;
    return new;
  end if;
  raise exception 'Sign-up refused';
end $$;

drop trigger if exists gate_signup on auth.users;
create trigger gate_signup before insert on auth.users
  for each row execute function public.gate_signup();

-- Nobody can change their login email (stops a student re-pointing their account at an admin address).
create or replace function public.lock_email() returns trigger
language plpgsql as $$
begin
  if new.email is distinct from old.email then raise exception 'Email cannot be changed'; end if;
  return new;
end $$;

drop trigger if exists lock_email on auth.users;
create trigger lock_email before update of email on auth.users
  for each row execute function public.lock_email();

-- Who am I? Returns null if the signed-in user is not on the roster.
create or replace function public.whoami() returns json
language plpgsql security definer set search_path = public as $$
declare e text := lower(auth.jwt() ->> 'email'); a admins; p profiles;
begin
  if e is null then return null; end if;
  select * into a from admins where email = e;
  if found then
    return json_build_object('email', e, 'name', a.name, 'is_admin', true,
                             'subjects', array['ig-econ','ig-cs','a-econ','a-cs'], 'requested', array[]::text[]);
  end if;
  if exists (select 1 from teachers where email = e) then
    return json_build_object('email', e, 'name', (select name from teachers where email = e), 'is_admin', false, 'is_teacher', true,
                             'subjects', array['ig-econ','ig-cs','a-econ','a-cs'], 'requested', array[]::text[]);
  end if;
  update profiles set last_seen = now() where email = e or email2 = e returning * into p;
  if not found then return null; end if;
  return json_build_object('email', p.email, 'email2', p.email2, 'login', e, 'name', p.name, 'is_admin', false,
                           'subjects', p.subjects, 'requested', p.requested);
end $$;

-- Admin: every progress row in one JSON value (avoids the 1000-row API cap).
create or replace function public.admin_progress() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  return coalesce((select json_agg(json_build_object('email', email, 'slug', slug, 'done_at', done_at)) from progress), '[]'::json);
end $$;

-- Admin: remove a student, their login and their progress.
create or replace function public.admin_delete_student(target text) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  target := lower(target);
  delete from progress where email = target;
  delete from auth.users where email = target or email = (select email2 from profiles where email = target);
  delete from profiles where email = target;
end $$;

-- Creates a ready-to-use, already-confirmed login directly (no sign-up, no email, no Confirm-email setting).
-- Internal: not callable from the website. Used by the admin functions below and by the bootstrap line at the end.
create or replace function public._create_login(_email text, _password text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
declare uid uuid := gen_random_uuid(); e text := lower(_email);
begin
  if exists (select 1 from auth.users where email = e) then return; end if;
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
      confirmation_token, recovery_token, email_change_token_new, email_change,
      email_change_token_current, phone_change, phone_change_token, reauthentication_token)
  values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', e,
      crypt(_password, gen_salt('bf')), now(),
      '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '', '', '', '', '');
  insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  values (gen_random_uuid(), uid, uid::text,
      jsonb_build_object('sub', uid::text, 'email', e, 'email_verified', true, 'phone_verified', false),
      'email', now(), now(), now());
  update profiles set signed_up_at = coalesce(signed_up_at, now()) where email = e or email2 = e;
end $$;
revoke all on function public._create_login(text, text) from public, anon, authenticated;

-- Admin: create the login for a student already on the list, using the password on the list.
create or replace function public.admin_create_login(target text) returns void
language plpgsql security definer set search_path = public as $$
declare pw text;
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  select password into pw from profiles where email = lower(target) or email2 = lower(target);
  if pw is null or pw = '' then raise exception 'No password set for %', target; end if;
  perform _create_login(target, pw);
end $$;

-- Admin: recreate a student's login(s) with the password currently on the list (keeps their progress).
create or replace function public.admin_reset_login(target text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare p profiles;
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  target := lower(target);
  if exists (select 1 from admins where email = target) then raise exception 'Cannot reset an admin'; end if;
  select * into p from profiles where email = target;
  if not found or p.password = '' then raise exception 'No password set for %', target; end if;
  delete from auth.users where email = p.email or email = p.email2;
  perform _create_login(p.email, p.password);
  if p.email2 is not null then perform _create_login(p.email2, p.password); end if;
end $$;

-- Admin: set, change or remove a student's second login email.
create or replace function public.admin_set_email2(target text, new_email2 text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare p profiles; n text := nullif(lower(trim(coalesce(new_email2, ''))), '');
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  select * into p from profiles where email = lower(target);
  if not found then raise exception 'No such student'; end if;
  if p.email2 is not null then delete from auth.users where email = p.email2; end if;
  update profiles set email2 = n where email = p.email;
  if n is not null then
    if p.password = '' then raise exception 'No password set for %', target; end if;
    perform _create_login(n, p.password);
  end if;
end $$;

-- Student: change password. Applies to both of their login emails so they stay in step.
create or replace function public.set_my_password(new_password text) returns void
language plpgsql security definer set search_path = public, extensions, auth as $$
declare e text := lower(auth.jwt() ->> 'email'); k text; e2 text;
begin
  if e is null then raise exception 'Not signed in'; end if;
  if length(new_password) < 8 then raise exception 'Password must be at least 8 characters'; end if;
  k := my_key();
  select email2 into e2 from profiles where email = k;
  update auth.users set encrypted_password = crypt(new_password, gen_salt('bf')), updated_at = now()
   where email = e or email = k or (e2 is not null and email = e2);
end $$;

-- Admin: add a co-teacher with their own login (generated password is passed in from the admin panel).
create or replace function public.admin_add_teacher(t_name text, t_email text, t_password text) returns void
language plpgsql security definer set search_path = public as $$
declare e text := lower(trim(t_email));
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  if length(t_password) < 8 then raise exception 'Password too short'; end if;
  if exists (select 1 from admins where email = e) or exists (select 1 from teachers where email = e)
     or exists (select 1 from profiles where email = e or email2 = e) then
    raise exception 'Email % is already in use', e;
  end if;
  insert into teachers (email, name, password) values (e, trim(t_name), t_password);
  perform _create_login(e, t_password);
end $$;

create or replace function public.admin_remove_teacher(t_email text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare e text := lower(t_email);
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  delete from progress where email = e;
  delete from auth.users where email = e;
  delete from teachers where email = e;
end $$;

-- Student asks to join a subject; an admin approves or declines from the admin panel.
create or replace function public.request_subject(subject text) returns void
language plpgsql security definer set search_path = public as $$
declare e text := my_key();
begin
  if subject <> all (array['ig-econ','ig-cs','a-econ','a-cs']) then raise exception 'Unknown subject'; end if;
  update profiles set requested = array_append(requested, subject)
   where email = e and not (subject = any (subjects)) and not (subject = any (requested));
end $$;

create or replace function public.cancel_request(subject text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update profiles set requested = array_remove(requested, subject) where email = my_key();
end $$;

-- ===================== Assessments (v4) =====================
-- Answer keys live in a table no client can read. Marking happens inside submit_assessment().
create table if not exists public.assessments (
  slug       text primary key,
  title      text not null,
  pass_pct   int  not null default 80,
  questions  jsonb not null,          -- full questions incl. answer keys, feedback
  updated_at timestamptz not null default now()
);
alter table public.assessments enable row level security;   -- no policies: unreadable from the website

create table if not exists public.assessment_attempts (
  id           bigint generated always as identity primary key,
  email        text not null,
  slug         text not null,
  answers      jsonb not null,
  score        int not null,
  max_score    int not null,
  pct          int not null,
  result       jsonb not null,
  submitted_at timestamptz not null default now(),
  reset_at     timestamptz            -- set when the teacher allows a retake; row stays as history
);
alter table public.assessment_attempts add column if not exists retake_requested_at timestamptz;
create unique index if not exists attempts_one_live on public.assessment_attempts (email, slug) where reset_at is null;
alter table public.assessment_attempts enable row level security;   -- reads only through the functions below

create or replace function public.has_assessment(_slug text) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from assessments where slug = _slug)
$$;

-- Lessons with an assessment are completed by passing it (or by the teacher), not by self-marking.
drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress
  for insert with check (email = my_key() and is_member() and not has_assessment(slug));
drop policy if exists progress_delete on public.progress;
create policy progress_delete on public.progress
  for delete using (email = my_key() and not has_assessment(slug));

-- Lowercase, strip punctuation, collapse spaces.
create or replace function public._norm(t text) returns text
language sql immutable as $$
  select trim(regexp_replace(regexp_replace(regexp_replace(lower(replace(coalesce(t, ''), chr(8722), '-')), '[^a-z0-9.% -]+', ' ', 'g'), '\.( |$)', ' ', 'g'), '\s+', ' ', 'g'))
$$;

-- Does the typed answer contain the phrase? A trailing * allows any word ending (opportunit* matches opportunity/opportunities).
create or replace function public._hit(typed text, alt text) returns boolean
language plpgsql immutable as $$
declare a text := public._norm(replace(alt, '*', '')); pat text;
begin
  if a = '' then return false; end if;
  pat := '(^| )' || regexp_replace(a, '([.%-])', '\\\1', 'g') || case when right(alt, 1) = '*' then '' else '( |$)' end;
  return public._norm(typed) ~ pat;
end $$;

create or replace function public._first_number(t text) returns numeric
language sql immutable as $$
  select (regexp_match(replace(replace(coalesce(t, ''), ',', ''), chr(8722), '-'), '-?\d+(?:\.\d+)?'))[1]::numeric
$$;

-- Mark one question. Returns marks gained.
create or replace function public._mark(q jsonb, typed text) returns int
language plpgsql immutable as $$
declare t text := q ->> 'type'; got int := 0; g jsonb; alt jsonb; n numeric;
begin
  if typed is null or btrim(typed) = '' then return 0; end if;
  if t = 'mcq' then
    return case when btrim(typed) = (q ->> 'ans') then coalesce((q ->> 'marks')::int, 1) else 0 end;
  elsif t = 'num' then
    n := public._first_number(typed);
    if n is not null and q ->> 'abs' = 'true' then n := abs(n); end if;
    if n is not null and abs(n - (q ->> 'ans')::numeric) <= coalesce((q ->> 'tol')::numeric, 0) then
      return coalesce((q ->> 'marks')::int, 1);
    end if;
    return 0;
  else
    for g in select * from jsonb_array_elements(q -> 'groups') loop
      for alt in select * from jsonb_array_elements(g) loop
        if public._hit(typed, alt #>> '{}') then got := got + 1; exit; end if;
      end loop;
    end loop;
    return least(got, coalesce((q ->> 'marks')::int, jsonb_array_length(q -> 'groups')));
  end if;
end $$;

-- Questions without keys or feedback, plus this student's live attempt (with feedback) if they have one.
create or replace function public.get_assessment(_slug text) returns json
language plpgsql security definer set search_path = public as $$
declare a assessments; att assessment_attempts; e text := my_key();
begin
  if not is_member() then raise exception 'Sign in first'; end if;
  select * into a from assessments where slug = _slug;
  if not found then return null; end if;
  select * into att from assessment_attempts where email = e and slug = _slug and reset_at is null;
  return json_build_object(
    'slug', a.slug, 'title', a.title, 'pass', a.pass_pct,
    'questions', (select json_agg(jsonb_build_object('id', q ->> 'id', 'type', q ->> 'type', 'q', q ->> 'q',
                    'opts', q -> 'opts', 'code', q ->> 'code', 'marks', coalesce((q ->> 'marks')::int, 1), 'topic', q ->> 'topic', 'hint', q ->> 'hint'))
                  from jsonb_array_elements(a.questions) q),
    'attempt', case when att.id is null then null else json_build_object('answers', att.answers, 'score', att.score, 'max', att.max_score,
                    'pct', att.pct, 'result', att.result, 'at', att.submitted_at, 'requested', att.retake_requested_at) end);
end $$;

-- One attempt only. Marks, stores, auto-completes the lesson at/above the pass mark, returns the full feedback.
create or replace function public.submit_assessment(_slug text, _answers jsonb) returns json
language plpgsql security definer set search_path = public as $$
declare a assessments; e text := my_key(); q jsonb; typed text; got int; tot int := 0; sc int := 0;
        items jsonb := '[]'::jsonb; p int; weak text[] := '{}'; res jsonb;
begin
  if not is_member() then raise exception 'Sign in first'; end if;
  if exists (select 1 from admins where email = lower(auth.jwt() ->> 'email'))
     or exists (select 1 from teachers where email = lower(auth.jwt() ->> 'email')) then
    raise exception 'Teacher accounts preview the assessment but do not submit it';
  end if;
  select * into a from assessments where slug = _slug;
  if not found then raise exception 'No assessment for this lesson'; end if;
  if exists (select 1 from assessment_attempts where email = e and slug = _slug and reset_at is null) then
    raise exception 'Already submitted. Ask your teacher to reset it for a retake.';
  end if;
  for q in select * from jsonb_array_elements(a.questions) loop
    typed := _answers ->> (q ->> 'id');
    got := _mark(q, typed);
    tot := tot + coalesce((q ->> 'marks')::int, case when q ->> 'type' = 'text' then jsonb_array_length(q -> 'groups') else 1 end);
    sc := sc + got;
    items := items || jsonb_build_array(jsonb_build_object('id', q ->> 'id', 'got', got,
        'max', coalesce((q ->> 'marks')::int, case when q ->> 'type' = 'text' then jsonb_array_length(q -> 'groups') else 1 end),
        'q', q ->> 'q', 'code', q ->> 'code', 'typed', case when q ->> 'type' = 'mcq' and typed ~ '^[0-9]+$' then q -> 'opts' ->> typed::int else typed end, 'model', q ->> 'model', 'feedback', case when got >= coalesce((q ->> 'marks')::int, 1) then q ->> 'ok'
                         when got > 0 and q ? 'fb_part' then q ->> 'fb_part' else q ->> 'fb' end,
        'topic', q ->> 'topic'));
  end loop;
  p := case when tot = 0 then 0 else round(100.0 * sc / tot) end;
  res := jsonb_build_object('items', items);
  insert into assessment_attempts (email, slug, answers, score, max_score, pct, result) values (e, _slug, _answers, sc, tot, p, res);
  if p >= a.pass_pct then
    insert into progress (email, slug) values (e, _slug) on conflict do nothing;
  end if;
  return json_build_object('score', sc, 'max', tot, 'pct', p, 'pass', a.pass_pct, 'result', res);
end $$;

-- Student: my own scores (slug, pct, when).
create or replace function public.my_attempts() returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('slug', slug, 'pct', pct, 'score', score, 'max', max_score, 'at', submitted_at) order by submitted_at desc), '[]'::json)
  from assessment_attempts where email = my_key() and reset_at is null
$$;

-- Student: after passing, start a fresh attempt for practice. The pass stays recorded (lesson stays complete); the old attempt is kept as history.
create or replace function public.retake_assessment(_slug text) returns void
language plpgsql security definer set search_path = public as $$
declare e text := my_key(); pass int;
begin
  select pass_pct into pass from assessments where slug = _slug;
  update assessment_attempts set reset_at = now()
   where email = e and slug = _slug and reset_at is null and pct >= coalesce(pass, 80);
  if not found then raise exception 'You can retake an assessment once you have passed it. Otherwise ask your teacher.'; end if;
end $$;

-- Student: ask the teacher for a retake after not passing.
create or replace function public.request_retake(_slug text) returns void
language plpgsql security definer set search_path = public as $$
declare e text := my_key(); pass int;
begin
  select pass_pct into pass from assessments where slug = _slug;
  update assessment_attempts set retake_requested_at = now()
   where email = e and slug = _slug and reset_at is null and pct < coalesce(pass, 80) and retake_requested_at is null;
  if not found then raise exception 'No retake request is needed or one is already waiting.'; end if;
end $$;

create or replace function public.admin_decline_retake(_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  update assessment_attempts set retake_requested_at = null where id = _id;
end $$;

-- Admin: counts for the navbar bell.
create or replace function public.admin_notifications() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then return json_build_object('approvals', 0, 'retakes', 0); end if;
  return json_build_object(
    'approvals', (select coalesce(sum(cardinality(requested)), 0) from profiles),
    'retakes', (select count(*) from assessment_attempts where retake_requested_at is not null and reset_at is null));
end $$;

-- Admin: every attempt (history included) with its feedback.
create or replace function public.admin_attempts() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  return coalesce((select json_agg(json_build_object('id', id, 'email', email, 'slug', slug, 'score', score, 'max', max_score, 'pct', pct,
            'result', result, 'at', submitted_at, 'reset_at', reset_at, 'requested_at', retake_requested_at) order by submitted_at desc) from assessment_attempts), '[]'::json);
end $$;

-- Admin: allow a retake (the old attempt stays as history).
create or replace function public.admin_reset_attempt(_id bigint) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  update assessment_attempts set reset_at = now() where id = _id and reset_at is null;
end $$;

-- Admin: mark a lesson done / not done for a student, whatever their score.
create or replace function public.admin_set_done(_email text, _slug text, _done boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  if _done then insert into progress (email, slug) values (lower(_email), _slug) on conflict do nothing;
  else delete from progress where email = lower(_email) and slug = _slug; end if;
end $$;

create or replace function public.admin_delete_student(target text) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  target := lower(target);
  delete from progress where email = target;
  delete from assessment_attempts where email = target;
  delete from auth.users where email = target or email = (select email2 from profiles where email = target);
  delete from profiles where email = target;
end $$;

-- Chapter review vs additional resource (or hidden = deleted), set by an admin from the site. Overrides the default in site_data.py.
create table if not exists public.artifact_roles (
  slug       text primary key,
  role       text not null check (role in ('review', 'resource')),
  updated_at timestamptz not null default now()
);
alter table public.artifact_roles drop constraint if exists artifact_roles_role_check;
alter table public.artifact_roles add constraint artifact_roles_role_check check (role in ('review', 'resource', 'hidden'));
alter table public.artifact_roles enable row level security;
drop policy if exists artifact_roles_read on public.artifact_roles;
create policy artifact_roles_read on public.artifact_roles for select using (true);
drop policy if exists artifact_roles_admin on public.artifact_roles;
create policy artifact_roles_admin on public.artifact_roles
  for all using (is_admin()) with check (is_admin());

-- Bootstrap: create the admin logins from admins.initial_password.
select public._create_login(email, initial_password) from public.admins where initial_password is not null and initial_password <> '';

select a.email, (a.initial_password is not null) as has_password, exists (select 1 from auth.users u where u.email = a.email) as login_exists
from public.admins a;
