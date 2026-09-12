const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
  const email = 'imoleasamuel94@gmail.com';
  const newPass = 'password1234';
  
  // Update pass
  await adminSupabase.auth.admin.updateUserById('90a40fc0-2b7b-4b67-9877-6032d83f5517', { password: newPass });
  
  // Sign in
  const { data: { session }, error: signErr } = await supabase.auth.signInWithPassword({ email, password: newPass });
  if (signErr) { console.log(signErr); return; }
  
  // Get booking
  const { data: bookings } = await supabase.from('bookings').select('*').eq('parent_id', session.user.id);
  const booking = bookings[0];
  console.log("Found booking:", booking.id);
  
  // Update
  const { data, error } = await supabase.from('bookings').update({
    parent_marked_satisfied: true,
    parent_satisfied_at: new Date().toISOString()
  }).eq('id', booking.id).select();
  
  console.log("Update Error:", error);
  console.log("Updated data:", data);
}
run();
