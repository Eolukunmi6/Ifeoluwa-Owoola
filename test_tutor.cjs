const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
    email: 'imoleayosamuel123@gmail.com', // Let's log in as a tutor, wait, I don't know a tutor's password.
    password: 'password123' 
  });
  console.log(authError)
}
run();
