const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  try {
    const res = await client.query(`SELECT * FROM cron.job;`);
    console.table(res.rows);
  } catch (e) {
    console.log("No pg_cron");
  }
  await client.end();
}
run();
