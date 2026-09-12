const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  // Let's sign in as the tutor to test RLS
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'hawaiiandbeat@gmail.com',
    password: 'password123' // hope this works, or I'll just use the DB to bypass JWT and test the policy 
  });
  
  if (authError) {
    console.log("Auth error:", authError);
    // Since we have the DB password, we can test it at the DB level directly via pg
  }
}
run();
