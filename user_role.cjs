const { Client } = require('pg');
require('dotenv').config();
async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  await client.connect();
  
  const uid = '005d7512-6e78-49f3-b59e-77a7a214b2e0'; 
  const res = await client.query(`SELECT role, full_name FROM profiles WHERE id = '${uid}'`);
  console.log(res.rows[0]);
  
  const res2 = await client.query(`SELECT id FROM tutors WHERE profile_id = '${uid}'`);
  console.log("Tutor row:", res2.rows[0]);
  
  await client.end();
}
run();
