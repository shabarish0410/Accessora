const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://nseovznjctqxefqopfaj.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92em5qY3RxeGVmcW9wZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzAxNjgsImV4cCI6MjEwNDEwNjE2OH0.9vJ1f8CMtm9NklBybtyclv9ILmcxgmrV1K61RRUNCVE'
);

async function test() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'guard@sbit.in',
    password: 'guard123'
  });
  console.log("Login Result:", data, error);
}

test();
