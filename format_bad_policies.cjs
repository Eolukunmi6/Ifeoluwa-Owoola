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
    SELECT tablename, policyname, qual, with_check 
    FROM pg_policies 
  `);
  
  const bad = res.rows.filter(r => 
    (r.qual && r.qual.includes('auth.uid()') && r.qual.includes('tutor_id') && !r.qual.includes('profile_id')) || 
    (r.with_check && r.with_check.includes('auth.uid()') && r.with_check.includes('tutor_id') && !r.with_check.includes('profile_id'))
  );
  
  console.log(JSON.stringify(bad, null, 2));
  await client.end();
}
run();
