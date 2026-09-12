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
    SELECT b.id, b.status, b.tutor_marked_completed, b.parent_marked_satisfied, p.status as p_status, p.tutor_amount 
    FROM bookings b
    LEFT JOIN payments p ON p.booking_id = b.id
  `);
  console.table(res.rows);
  await client.end();
}
run();
