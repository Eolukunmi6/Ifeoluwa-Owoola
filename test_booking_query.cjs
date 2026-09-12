const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
  const client = new Client({ connectionString });

  try {
    await client.connect();
    const res = await client.query(`
      SELECT b.id, b.status, b.scheduled_at, b.tutor_id, t.profile_id
      FROM bookings b
      JOIN tutors t ON t.id = b.tutor_id
      WHERE t.profile_id = '30208ee5-b86c-48db-90bf-207ff949b307' -- hawaiiandbeat tutor profile_id
    `);
    console.log("Bookings for Tutor:");
    console.table(res.rows);
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}
run();
