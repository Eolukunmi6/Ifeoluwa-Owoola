const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
const adminSupabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  await client.connect();

  // 1. Create a dummy parent and tutor directly to ensure we know the credentials
  const pEmail = 'testparent202@example.com';
  const pPass = 'password123';
  const { data: pData, error: pErr } = await supabase.auth.signUp({ email: pEmail, password: pPass });
  
  if (pErr) { console.log("Signup err", pErr); return; }
  
  // Create profile
  await client.query(`UPDATE profiles SET full_name = 'Test Parent', role = 'parent' WHERE id = '${pData.user.id}'`);
  
  // Find a tutor
  const tRes = await client.query(`SELECT id FROM tutors LIMIT 1`);
  const tutorId = tRes.rows[0].id;
  
  // Insert a child
  const cRes = await client.query(`INSERT INTO children (parent_id, name, age, learning_goals) VALUES ('${pData.user.id}', 'Timmy', 10, 'Math') RETURNING id`);
  const childId = cRes.rows[0].id;
  
  // Insert a past booking
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 2);
  
  const pkgRes = await client.query(`SELECT id FROM lesson_packages WHERE tutor_id = '${tutorId}' LIMIT 1`);
  const packageId = pkgRes.rows[0].id;
  
  const bRes = await client.query(`
    INSERT INTO bookings (parent_id, child_id, tutor_id, lesson_package_id, scheduled_at, amount, currency, status, tutor_marked_completed)
    VALUES ('${pData.user.id}', '${childId}', '${tutorId}', '${packageId}', '${pastDate.toISOString()}', 1000, 'NGN', 'confirmed', true)
    RETURNING id
  `);
  const bookingId = bRes.rows[0].id;
  
  console.log("Created booking:", bookingId);
  
  // NOW simulate the parent clicking the button
  await supabase.auth.signInWithPassword({ email: pEmail, password: pPass });
  
  console.log("Simulating parent clicking Satisfied...");
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      parent_marked_satisfied: true,
      parent_satisfied_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select();
    
  console.log("Result:", error ? error.message : "Success!", data);
  
  await client.end();
}
run();
