const { Client } = require('pg');
require('dotenv').config();
async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  await client.connect();
  
  const res = await client.query(`
    SELECT b.id, p1.full_name as parent, p1.email as p_email, 
           t.profile_id as tutor_prof_id, p2.full_name as tutor, p2.email as t_email
    FROM bookings b
    JOIN profiles p1 ON b.parent_id = p1.id
    JOIN tutors t ON b.tutor_id = t.id
    JOIN profiles p2 ON t.profile_id = p2.id
  `);
  console.table(res.rows);
  
  await client.end();
}
run();
