const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const { data: { session }, error: signInErr } = await supabase.auth.signInWithPassword({
    email: 'imoleasamuel94@gmail.com', // Let's try this parent
    password: 'password123'
  });
  
  if (signInErr) {
    console.log("Could not sign in:", signInErr.message);
    return;
  }
  
  // Find a booking for this parent
  const { data: bookings, error: bErr } = await supabase
    .from('bookings')
    .select('id, parent_id, status, scheduled_at, tutor_marked_completed')
    .eq('parent_id', session.user.id);
    
  if (bErr) {
    console.log("Error fetching bookings", bErr);
    return;
  }
  
  if (bookings.length === 0) {
    console.log("No bookings found for parent.");
    return;
  }
  
  const booking = bookings[0];
  console.log("Found booking:", booking);
  
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      parent_marked_satisfied: true,
      parent_satisfied_at: new Date().toISOString()
    })
    .eq('id', booking.id);
    
  console.log("Frontend Update result error:", error ? error.message : "Success");
}
run();
