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
