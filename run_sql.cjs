const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  await client.connect();
  const sql = fs.readFileSync('update_parent_response.sql', 'utf8');
  await client.query(sql);
  console.log("SQL executed");
  await client.end();
}
run();
