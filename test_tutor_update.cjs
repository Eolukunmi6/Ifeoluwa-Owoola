const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  const tutorUid = '4e5553e8-f24f-4d91-9b5a-b507a7b413f9'; // imoleayohgcc1@gmail.com
  
  // get one of their bookings
  const bRes = await client.query(`
    SELECT b.id FROM bookings b 
    JOIN tutors t ON b.tutor_id = t.id 
    WHERE t.profile_id = '${tutorUid}' LIMIT 1
  `);
  const bookingId = bRes.rows[0].id;
  console.log("Found booking:", bookingId);
  
  await client.query(`
    set local role authenticated;
    set local request.jwt.claims = '{"sub": "${tutorUid}", "role": "authenticated"}';
  `);
  
  try {
    const res = await client.query(`
      UPDATE bookings SET tutor_marked_completed = true WHERE id = '${bookingId}' RETURNING *;
    `);
    console.log("Tutor update rows affected:", res.rowCount);
  } catch(e) {
    console.log("Update Error:", e.message);
  }
  
  await client.end();
}
run();
