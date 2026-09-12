const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email: 'hawaiiandbeat@gmail.com',
    password: 'password123'
  });
  
  if (error) {
    console.log("Could not sign in:", error.message);
    return;
  }
  
  // Call Wallet API directly to avoid restarting the server just for testing
  const res = await fetch('http://localhost:3000/api/tutor/wallet', {
    headers: { Authorization: `Bearer ${session.access_token}` }
  });
  const data = await res.json();
  console.log("Wallet API response:", data);
}
run();
