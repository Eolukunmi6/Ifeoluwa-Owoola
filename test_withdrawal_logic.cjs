const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  // Mark one booking as tutor_completed 2 days ago, and parent pending
  const res = await client.query(`
    UPDATE bookings 
    SET tutor_marked_completed = true, 
        tutor_completed_at = NOW() - INTERVAL '2 days',
        parent_response = 'pending'
    WHERE id = (SELECT id FROM bookings LIMIT 1)
    RETURNING id, tutor_completed_at, parent_response;
  `);
  console.log("Updated to 2 days old:", res.rows);
  
  // Mark another as tutor_completed 1 hour ago
  const res2 = await client.query(`
    UPDATE bookings 
    SET tutor_marked_completed = true, 
        tutor_completed_at = NOW() - INTERVAL '1 hour',
        parent_response = 'pending'
    WHERE id = (SELECT id FROM bookings OFFSET 1 LIMIT 1)
    RETURNING id, tutor_completed_at, parent_response;
  `);
  console.log("Updated to 1 hour old:", res2.rows);

  await client.end();
}
run();
