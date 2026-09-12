const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  // Set the user to the tutor eolukunmi6@gmail.com
  const uid = '005d7512-6e78-49f3-b59e-77a7a214b2e0'; 
  
  await client.query(`
    set local role authenticated;
    set local request.jwt.claims = '{"sub": "${uid}", "role": "authenticated"}';
  `);
  
  try {
    const res = await client.query(`
      SELECT b.id 
      FROM bookings b
      JOIN profiles p ON b.parent_id = p.id
      JOIN children c ON b.child_id = c.id
      JOIN lesson_packages lp ON b.lesson_package_id = lp.id
      LEFT JOIN payments pay ON pay.booking_id = b.id
      WHERE b.tutor_id = (SELECT id FROM tutors WHERE profile_id = '${uid}')
    `);
    console.log("Query Success! rows:", res.rows.length);
  } catch(e) {
    console.log("Query Error:", e.message);
  }
  
  await client.end();
}
run();
