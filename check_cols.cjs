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
    SELECT column_name, column_default
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name IN ('tutor_marked_completed', 'parent_marked_satisfied');
  `);
  console.table(res.rows);
  await client.end();
}
run();
