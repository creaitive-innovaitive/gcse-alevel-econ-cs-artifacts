-- Run once in Supabase: SQL Editor > New query > paste > Run.
-- Roster-based access: only emails an admin has added (or listed in admins) can create an account.

create table public.admins (
  email text primary key check (email = lower(email)),
  name  text not null
);
insert into public.admins (email, name) values
  ('gary.byatt@danang.sis.edu.vn', 'Gary Byatt'),
  ('gbyatt@gmail.com', 'Gary Byatt');

create table public.profiles (
  email        text primary key check (email = lower(email) and email like '%@danang.sis.edu.vn'),
  name         text not null,
  subjects     text[] not null default '{}',   -- any of: ig-econ, ig-cs, a-econ, a-cs
  created_at   timestamptz not null default now(),
  signed_up_at timestamptz,
  last_seen    timestamptz
);

create table public.progress (
  email   text not null check (email = lower(email)),
  slug    text not null,
  done_at timestamptz not null default now(),
  primary key (email, slug)
);

alter table public.admins   enable row level security;   -- no policies: clients never read it directly
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins where email = lower(auth.jwt() ->> 'email'))
$$;

create function public.is_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from admins   where email = lower(auth.jwt() ->> 'email'))
      or exists (select 1 from profiles where email = lower(auth.jwt() ->> 'email'))
$$;

create policy profiles_admin_all on public.profiles
  for all using (is_admin()) with check (is_admin());

create policy progress_select on public.progress
  for select using (email = lower(auth.jwt() ->> 'email') or is_admin());
create policy progress_insert on public.progress
  for insert with check (email = lower(auth.jwt() ->> 'email') and is_member());
create policy progress_delete on public.progress
  for delete using (email = lower(auth.jwt() ->> 'email'));

-- Block sign-up for anyone not on the roster (enforced server-side, not just in the form).
create function public.gate_signup() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from admins where email = lower(new.email))
     or exists (select 1 from profiles where email = lower(new.email)) then
    update profiles set signed_up_at = now() where email = lower(new.email);
    return new;
  end if;
  raise exception 'Sign-up is only open to students registered by their teacher.';
end $$;

create trigger gate_signup before insert on auth.users
  for each row execute function public.gate_signup();

-- Who am I? Returns null if the signed-in user is not on the roster.
create function public.whoami() returns json
language plpgsql security definer set search_path = public as $$
declare e text := lower(auth.jwt() ->> 'email'); a admins; p profiles;
begin
  if e is null then return null; end if;
  select * into a from admins where email = e;
  if found then
    return json_build_object('email', e, 'name', a.name, 'is_admin', true,
                             'subjects', array['ig-econ','ig-cs','a-econ','a-cs']);
  end if;
  update profiles set last_seen = now() where email = e returning * into p;
  if not found then return null; end if;
  return json_build_object('email', e, 'name', p.name, 'is_admin', false, 'subjects', p.subjects);
end $$;

-- Admin: every progress row in one JSON value (avoids the 1000-row API cap).
create function public.admin_progress() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  return coalesce((select json_agg(json_build_object('email', email, 'slug', slug, 'done_at', done_at)) from progress), '[]'::json);
end $$;

-- Admin: remove a student, their login and their progress.
create function public.admin_delete_student(target text) returns void
language plpgsql security definer set search_path = public, auth as $$
begin
  if not is_admin() then raise exception 'Admins only'; end if;
  target := lower(target);
  delete from progress where email = target;
  delete from auth.users where email = target;
  delete from profiles where email = target;
end $$;
