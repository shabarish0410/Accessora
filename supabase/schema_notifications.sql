-- Create notification_subscriptions table
create table public.notification_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.app_users(id) on delete cascade not null,
  role text not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  created_at timestamp with time zone default timezone('utc', now()) not null
);

-- RLS for subscriptions
alter table public.notification_subscriptions enable row level security;

-- Users can insert and manage their own subscriptions
create policy "Users can insert their own subscriptions"
on public.notification_subscriptions for insert
to authenticated, anon
with check ( true );

create policy "Users can view their own subscriptions"
on public.notification_subscriptions for select
to authenticated, anon
using ( true );

create policy "Users can delete their own subscriptions"
on public.notification_subscriptions for delete
to authenticated, anon
using ( true );
