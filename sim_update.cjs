const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  // Get a booking
  const bRes = await client.query(`SELECT b.id, b.tutor_id, t.profile_id as tutor_uid FROM bookings b JOIN tutors t ON b.tutor_id = t.id LIMIT 1`);
  const bookingId = bRes.rows[0].id;
  const tutorUid = bRes.rows[0].tutor_uid;
  
  await client.query(`
    set local role authenticated;
    set local request.jwt.claims = '{"sub": "${tutorUid}", "role": "authenticated"}';
  `);
  
  try {
    const res = await client.query(`
      UPDATE bookings SET tutor_marked_completed = true WHERE id = '${bookingId}' RETURNING *;
    `);
    console.log("Update rows affected:", res.rowCount);
  } catch(e) {
    console.log("Update Error:", e.message);
  }
  
  await client.end();
}
run();
