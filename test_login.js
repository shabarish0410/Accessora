const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nseovznjctqxefqopfaj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zZW92em5qY3RxeGVmcW9wZmFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1MzAxNjgsImV4cCI6MjEwNDEwNjE2OH0.9vJ1f8CMtm9NklBybtyclv9ILmcxgmrV1K61RRUNCVE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Attempting sign up...');
  const { data, error } = await supabase.auth.signUp({
    email: 'test_signup@sbit.in',
    password: 'password123',
    options: {
      data: { role: 'guard' }
    }
  });
  
  if (error) {
    console.error('Sign up failed:', error.message);
  } else {
    console.log('Sign up successful!', data);
    console.log('Is email confirmation required?', data.user?.identities?.length === 0 || !data.session);
  }
}

test();
