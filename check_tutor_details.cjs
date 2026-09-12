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
    SELECT t.id as tutor_id, p.id as profile_id, p.email, b.id as bank_id
    FROM profiles p
    JOIN tutors t ON p.id = t.profile_id
    LEFT JOIN tutor_bank_details b ON t.id = b.tutor_id
    WHERE p.email = 'eolukunmi6@gmail.com'
  `);
  console.table(res.rows);
  await client.end();
}
run();
