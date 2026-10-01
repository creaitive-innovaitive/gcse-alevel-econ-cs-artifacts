-- Safe to run more than once. Supabase: SQL Editor > New query > paste the CONTENTS of this file > Run.
--
-- Access model: no emails, no self-service. An admin adds each student with an assigned password.
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

create table if not exists public.profiles (
  email        text primary key check (email = lower(email) and email like '%@danang.sis.edu.vn'),
  name         text not null,
  subjects     text[] not null default '{}',   -- any of: ig-econ, ig-cs, a-econ, a-cs
  password     text not null default '',       -- assigned password, visible to admins only
  created_at   timestamptz not null default now(),
  signed_up_at timestamptz,
  last_seen    timestamptz
);
alter table public.profiles add column if not exists password text not null default '';
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

create or replace function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins   where email = lower(auth.jwt() ->> 'email'))
      or exists (select 1 from profiles where email = lower(auth.jwt() ->> 'email'))
$$;

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all using (is_admin()) with check (is_admin());

drop policy if exists progress_select on public.progress;
create policy progress_select on public.progress
  for select using (email = lower(auth.jwt() ->> 'email') or is_admin());
drop policy if exists progress_insert on public.progress;
create policy progress_insert on public.progress
  for insert with check (email = lower(auth.jwt() ->> 'email') and is_member());
drop policy if exists progress_delete on public.progress;
create policy progress_delete on public.progress
  for delete using (email = lower(auth.jwt() ->> 'email'));

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
  select * into p from profiles where email = lower(new.email);
  if found and p.password <> '' and new.encrypted_password = crypt(p.password, new.encrypted_password) then
    update profiles set signed_up_at = now() where email = p.email;
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
  update profiles set last_seen = now() where email = e returning * into p;
  if not found then return null; end if;
  return json_build_object('email', e, 'name', p.name, 'is_admin', false, 'subjects', p.subjects, 'requested', p.requested);
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
  delete from auth.users where email = target;
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
  update profiles set signed_up_at = now() where email = e;
end $$;
revoke all on function public._create_login(text, text) from public, anon, authenticated;

-- Admin: create the login for a student already on the list, using the password on the list.
create or replace function public.admin_create_login(target text) returns void
language plpgsql security definer set search_path = public as $$
declare pw text;
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  select password into pw from profiles where email = lower(target);
  if pw is null or pw = '' then raise exception 'No password set for %', target; end if;
  perform _create_login(target, pw);
end $$;

-- Admin: recreate a student's login with the password currently on the list (keeps their progress).
create or replace function public.admin_reset_login(target text) returns void
language plpgsql security definer set search_path = public, auth as $$
declare pw text;
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  target := lower(target);
  if exists (select 1 from admins where email = target) then raise exception 'Cannot reset an admin'; end if;
  select password into pw from profiles where email = target;
  if pw is null or pw = '' then raise exception 'No password set for %', target; end if;
  delete from auth.users where email = target;
  perform _create_login(target, pw);
end $$;

-- Student asks to join a subject; an admin approves or declines from the admin panel.
create or replace function public.request_subject(subject text) returns void
language plpgsql security definer set search_path = public as $$
declare e text := lower(auth.jwt() ->> 'email');
begin
  if subject <> all (array['ig-econ','ig-cs','a-econ','a-cs']) then raise exception 'Unknown subject'; end if;
  update profiles set requested = array_append(requested, subject)
   where email = e and not (subject = any (subjects)) and not (subject = any (requested));
end $$;

create or replace function public.cancel_request(subject text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update profiles set requested = array_remove(requested, subject) where email = lower(auth.jwt() ->> 'email');
end $$;

-- Bootstrap: create the admin logins from admins.initial_password.
select public._create_login(email, initial_password) from public.admins where initial_password is not null and initial_password <> '';

select a.email, (a.initial_password is not null) as has_password, exists (select 1 from auth.users u where u.email = a.email) as login_exists
from public.admins a;
