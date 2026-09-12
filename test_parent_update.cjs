const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  // Find a booking for a parent
  const resB = await client.query(`SELECT id, parent_id FROM bookings LIMIT 1`);
  if (resB.rows.length === 0) {
    console.log("No bookings found.");
    return;
  }
  const booking = resB.rows[0];
  
  // Set role to authenticated user and simulate the parent
  await client.query(`
    set local role authenticated;
    set local request.jwt.claims = '{"sub": "${booking.parent_id}", "role": "authenticated"}';
  `);
  
  try {
    const res = await client.query(`
      UPDATE bookings 
      SET parent_marked_satisfied = true, parent_satisfied_at = now()
      WHERE id = '${booking.id}'
      RETURNING *;
    `);
    console.log("Update Success, rows affected:", res.rowCount);
  } catch (e) {
    console.log("Update Error:", e.message);
  }
  
  await client.end();
}
run();
