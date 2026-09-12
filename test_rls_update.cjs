const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { session }, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'eolukunmi6@gmail.com', // user email
    password: 'password123'
  });
  
  if (signInErr) {
    console.log("Could not sign in:", signInErr.message);
    return;
  }
  
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      tutor_marked_completed: true,
      tutor_completed_at: new Date().toISOString()
    })
    .eq('id', 'aee75f0c-d27d-42bf-9f16-36320d15518d');
    
  console.log("Update result:", error ? error.message : "Success");
}
run();
