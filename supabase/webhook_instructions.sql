-- Trigger to call edge function on visitor insert/update
create function public.handle_visitor_notification()
returns trigger as $$
declare
  edge_function_url text := 'https://nseovznjctqxefqopfaj.supabase.co/functions/v1/send-web-push';
  anon_key text := 'YOUR_ANON_KEY_HERE'; -- The webhook sends the payload, edge function uses service role, so this is just to invoke the function. Or you can use the built-in webhook feature in the Supabase Dashboard.
begin
  -- Note: It is much easier and safer to use the Supabase Dashboard -> Database -> Webhooks UI 
  -- to create a webhook that calls the `send-web-push` edge function on INSERT and UPDATE of the `visitors` table.
  -- No SQL trigger is strictly necessary if you use the Webhooks UI.
  return new;
end;
$$ language plpgsql security definer;
