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
    SELECT proname, prosrc 
    FROM pg_proc 
    WHERE prosrc ILIKE '%tutor_marked_completed%';
  `);
  console.table(res.rows);
  await client.end();
}
run();
