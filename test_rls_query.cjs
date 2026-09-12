const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { session }, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'testadmin2@example.com', // Let's try admin, or just run with service role and set auth.uid
    password: 'password123'
  });
  
}
run();
