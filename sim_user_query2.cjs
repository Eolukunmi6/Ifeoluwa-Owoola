const { Client } = require('pg');
require('dotenv').config();
async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  await client.connect();
  
  // Who is the tutor for bookings?
  const res = await client.query(`SELECT b.tutor_id, t.profile_id FROM bookings b JOIN tutors t ON b.tutor_id = t.id LIMIT 1;`);
  console.log("Tutor with bookings:", res.rows[0]);
  
  const uid = res.rows[0].profile_id;
  
  await client.query(`
    set local role authenticated;
    set local request.jwt.claims = '{"sub": "${uid}", "role": "authenticated"}';
  `);
  
  try {
    const r = await client.query(`
      SELECT b.id 
      FROM bookings b
      JOIN profiles p ON b.parent_id = p.id
      JOIN children c ON b.child_id = c.id
      JOIN lesson_packages lp ON b.lesson_package_id = lp.id
    `);
    console.log("Query Success! rows:", r.rows.length);
  } catch(e) {
    console.log("Query Error:", e.message);
  }
  
  await client.end();
}
run();
