-- ============================================================
-- CUSTOM AUTH SCHEMA - No Supabase Auth emails required
-- ============================================================

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- DROP OLD TABLES (clean slate)
-- ============================================================
drop table if exists public.visitors cascade;
drop table if exists public.app_sessions cascade;
drop table if exists public.app_users cascade;

-- ============================================================
-- CUSTOM USERS TABLE (replaces auth.users)
-- ============================================================
create table public.app_users (
  id uuid default uuid_generate_v4() primary key,
  username text not null unique,
  password_hash text not null,
  role text not null check (role in ('guard', 'chairman', 'incharge', 'admin')) default 'guard',
  full_name text,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- ============================================================
-- SESSIONS TABLE
-- ============================================================
create table public.app_sessions (
  token uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.app_users(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  expires_at timestamp with time zone default (timezone('utc', now()) + interval '30 days') not null
);

-- ============================================================
-- VISITORS TABLE (references app_users instead of auth.users)
-- ============================================================
create table public.visitors (
  id uuid default uuid_generate_v4() primary key,
  temp_id text not null,
  name text not null,
  purpose text not null check (purpose in ('VIP', 'Admissions', 'Delivery', 'Others')),
  reason text,
  organisation text,
  mobile text not null,
  origin text,
  photo_path text,
  status text not null check (status in ('pending', 'approved', 'accepted', 'rejected', 'inside', 'exited', 'completed', 'waiting')),
  arrival_time timestamp with time zone default timezone('utc', now()) not null,
  departure_time timestamp with time zone,
  decided_by text,
  chairman_decision text check (chairman_decision in ('accepted', 'rejected', 'waiting')),
  chairman_feedback text,
  hold_duration text,
  decision_at timestamp with time zone,
  purpose_original text,
  purpose_english text,
  origin_original text,
  origin_english text,
  input_language text default 'english',
  created_by uuid references public.app_users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc', now()) not null,
  updated_at timestamp with time zone default timezone('utc', now()) not null
);

-- ============================================================
-- HELPER: get current user from session token
-- Called with the token passed as a Postgres config variable
-- ============================================================
create or replace function public.get_session_user(p_token uuid)
returns table(user_id uuid, role text)
language plpgsql security definer as $$
begin
  return query
    select s.user_id, u.role
    from public.app_sessions s
    join public.app_users u on u.id = s.user_id
    where s.token = p_token
      and s.expires_at > timezone('utc', now());
end;
$$;

-- ============================================================
-- RPC: LOGIN
-- ============================================================
create or replace function public.login(p_username text, p_password text)
returns table(token uuid, role text, user_id uuid, full_name text)
language plpgsql security definer as $$
declare
  v_user public.app_users;
  v_token uuid;
begin
  -- Find user by username
  select * into v_user
  from public.app_users
  where username = lower(trim(p_username));

  -- Verify password
  if v_user.id is null or v_user.password_hash != crypt(p_password, v_user.password_hash) then
    raise exception 'Invalid username or password';
  end if;

  -- Create session
  insert into public.app_sessions (user_id)
  values (v_user.id)
  returning app_sessions.token into v_token;

  return query select v_token, v_user.role, v_user.id, v_user.full_name;
end;
$$;

-- ============================================================
-- RPC: LOGOUT
-- ============================================================
create or replace function public.logout(p_token uuid)
returns void language plpgsql security definer as $$
begin
  delete from public.app_sessions where token = p_token;
end;
$$;

-- ============================================================
-- RPC: GET CURRENT USER (validate token)
-- ============================================================
create or replace function public.get_current_user(p_token uuid)
returns table(user_id uuid, role text, username text, full_name text)
language plpgsql security definer as $$
begin
  return query
    select u.id, u.role, u.username, u.full_name
    from public.app_sessions s
    join public.app_users u on u.id = s.user_id
    where s.token = p_token
      and s.expires_at > timezone('utc', now());
end;
$$;

-- ============================================================
-- RPC: CREATE GUARD (called by Incharge)
-- ============================================================
create or replace function public.create_guard(
  p_token uuid,
  p_username text,
  p_password text,
  p_full_name text default null
)
returns table(guard_id uuid, guard_username text)
language plpgsql security definer as $$
declare
  v_caller_role text;
  v_new_id uuid;
begin
  -- Verify caller is incharge or admin
  select u.role into v_caller_role
  from public.app_sessions s
  join public.app_users u on u.id = s.user_id
  where s.token = p_token and s.expires_at > timezone('utc', now());

  if v_caller_role not in ('incharge', 'admin') then
    raise exception 'Only an Incharge or Admin can create guards';
  end if;

  -- Check username not already taken
  if exists (select 1 from public.app_users where username = lower(trim(p_username))) then
    raise exception 'Username "%" is already taken', p_username;
  end if;

  -- Insert new guard
  insert into public.app_users (username, password_hash, role, full_name)
  values (
    lower(trim(p_username)),
    crypt(p_password, gen_salt('bf')),
    'guard',
    coalesce(p_full_name, p_username)
  )
  returning id into v_new_id;

  return query select v_new_id, lower(trim(p_username));
end;
$$;

-- ============================================================
-- RPC: DELETE GUARD (called by Incharge)
-- ============================================================
create or replace function public.delete_guard(
  p_token uuid,
  p_guard_id uuid
)
returns void language plpgsql security definer as $$
declare
  v_caller_role text;
  v_target_role text;
begin
  -- Verify caller is incharge or admin
  select u.role into v_caller_role
  from public.app_sessions s
  join public.app_users u on u.id = s.user_id
  where s.token = p_token and s.expires_at > timezone('utc', now());

  if v_caller_role not in ('incharge', 'admin') then
    raise exception 'Only an Incharge or Admin can delete guards';
  end if;

  -- Verify target is a guard
  select role into v_target_role from public.app_users where id = p_guard_id;
  if v_target_role != 'guard' then
    raise exception 'You can only delete guard accounts';
  end if;

  -- Null out visitor references (preserve history)
  update public.visitors set created_by = null where created_by = p_guard_id;

  -- Delete sessions and user
  delete from public.app_sessions where user_id = p_guard_id;
  delete from public.app_users where id = p_guard_id;
end;
$$;

-- ============================================================
-- RLS (Row Level Security)
-- We use a simple approach: allow all reads/writes via the
-- service role (from our RPCs) and restrict direct table
-- access to authenticated Supabase sessions only.
-- Since we manage auth ourselves, we DISABLE RLS on these
-- tables and protect them via the SECURITY DEFINER RPCs.
-- ============================================================
alter table public.app_users disable row level security;
alter table public.app_sessions disable row level security;
alter table public.visitors disable row level security;

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public)
values ('visitor-photos', 'visitor-photos', true)
on conflict (id) do update set public = true;

-- ============================================================
-- SEED DATA (default accounts, no emails!)
-- ============================================================
insert into public.app_users (username, password_hash, role, full_name) values
  ('guard',    crypt('guard123',    gen_salt('bf')), 'guard',    'Default Guard'),
  ('chairman', crypt('chairman123', gen_salt('bf')), 'chairman', 'Chairman'),
  ('incharge', crypt('incharge123', gen_salt('bf')), 'incharge', 'Incharge')
on conflict (username) do nothing;

-- ============================================================
-- RPC: LIST GUARDS (used by Incharge dashboard)
-- ============================================================
create or replace function public.list_guards()
returns table(id uuid, username text, full_name text)
language plpgsql security definer as $$
begin
  return query
    select u.id, u.username, u.full_name
    from public.app_users u
    where u.role = 'guard'
    order by u.created_at desc;
end;
$$;

-- ============================================================
-- GRANTS (allow frontend anon key to call RPCs and tables)
-- ============================================================
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.visitors to anon, authenticated;
grant execute on function public.login(text, text) to anon, authenticated;
grant execute on function public.logout(uuid) to anon, authenticated;
grant execute on function public.get_current_user(uuid) to anon, authenticated;
grant execute on function public.create_guard(uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_guard(uuid, uuid) to anon, authenticated;
grant execute on function public.list_guards() to anon, authenticated;

-- ============================================================
-- RPC: CHANGE PASSWORD
-- ============================================================
create or replace function public.change_password(p_token uuid, p_old_password text, p_new_password text)
returns boolean
language plpgsql security definer as $$
declare
  v_user_id uuid;
  v_hash text;
begin
  -- Validate session and get user
  select u.id, u.password_hash into v_user_id, v_hash
  from public.app_sessions s
  join public.app_users u on u.id = s.user_id
  where s.token = p_token and s.expires_at > timezone('utc', now());

  if v_user_id is null then
    raise exception 'Invalid or expired session';
  end if;

  -- Verify old password
  if v_hash != crypt(p_old_password, v_hash) then
    raise exception 'Incorrect old password';
  end if;

  -- Update to new password
  update public.app_users
  set password_hash = crypt(p_new_password, gen_salt('bf'))
  where id = v_user_id;

  return true;
end;
$$;

grant execute on function public.change_password(uuid, text, text) to anon, authenticated;

-- ============================================================
-- ENABLE REAL-TIME
-- ============================================================
alter publication supabase_realtime add table public.visitors;
-- ============================================================
-- RPC: UPDATE PROFILE
-- ============================================================
create or replace function public.update_profile(p_token uuid, p_username text, p_full_name text)
returns boolean
language plpgsql security definer as $$
declare
  v_user_id uuid;
begin
  -- Validate session and get user
  select s.user_id into v_user_id
  from public.app_sessions s
  where s.token = p_token and s.expires_at > timezone('utc', now());

  if v_user_id is null then
    raise exception 'Invalid or expired session';
  end if;

  -- Check if username is already taken by someone else
  if exists (select 1 from public.app_users where username = lower(trim(p_username)) and id != v_user_id) then
    raise exception 'Username "%" is already taken', p_username;
  end if;

  -- Update profile
  update public.app_users
  set 
    username = lower(trim(p_username)),
    full_name = trim(p_full_name)
  where id = v_user_id;

  return true;
end;
$$;

grant execute on function public.update_profile(uuid, text, text) to anon, authenticated;

