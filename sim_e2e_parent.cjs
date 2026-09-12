const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  await client.connect();

  // Find a booking that the tutor HAS marked completed but parent HAS NOT marked satisfied
  const res = await client.query(`
    SELECT b.id, b.parent_id, p.email 
    FROM bookings b
    JOIN profiles p ON b.parent_id = p.id
    WHERE b.tutor_marked_completed = true AND b.parent_marked_satisfied = false
    LIMIT 1
  `);
  
  if (res.rows.length === 0) {
    console.log("No bookings found where tutor completed but parent did not.");
    return;
  }
  
  const b = res.rows[0];
  console.log("Found booking:", b.id, "for parent email:", b.email);
  
  // Set password so we can log in
  await adminSupabase.auth.admin.updateUserById(b.parent_id, { password: 'password1234' });
  
  // Login as parent
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  const { data: { session }, error: signErr } = await supabase.auth.signInWithPassword({ email: b.email, password: 'password1234' });
  if (signErr) { console.log(signErr); return; }
  
  // Try to update exactly as the frontend does
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      parent_marked_satisfied: true,
      parent_satisfied_at: new Date().toISOString()
    })
    .eq('id', b.id)
    .select();
    
  console.log("Update Error:", error);
  console.log("Updated rows:", data ? data.length : 0);
  
  await client.end();
}
run();
