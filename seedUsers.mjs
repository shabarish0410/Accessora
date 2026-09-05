import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8').split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) acc[key.trim()] = value.join('=').trim();
  return acc;
}, {});

const supabase = createClient(
  env.EXPO_PUBLIC_SUPABASE_URL,
  env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  const users = [
    { email: 'guard@sbit.in', password: 'guard123', role: 'guard' },
    { email: 'chairman@sbit.in', password: 'chairman123', role: 'chairman' },
    { email: 'incharge@sbit.in', password: 'incharge123', role: 'incharge' }
  ];

  for (const u of users) {
    const { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
      options: {
        data: {
          role: u.role,
          full_name: u.role.charAt(0).toUpperCase() + u.role.slice(1)
        }
      }
    });

    if (error) {
      console.error(`Failed to create ${u.email}:`, error.message);
    } else {
      console.log(`Successfully created ${u.email}`);
    }
  }
}

seed();
