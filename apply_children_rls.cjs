const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  const client = new Client({ connectionString });

  try {
    await client.connect();
    const sql = fs.readFileSync('fix_children_rls.sql', 'utf8');
    await client.query(sql);
    console.log("RLS policy for children applied successfully!");
    
    // Test the visibility again!
    const tutorProfileId = '30208ee5-b86c-48db-90bf-207ff949b307';
    await client.query("BEGIN;");
    await client.query(`
      set local role authenticated;
      select set_config('request.jwt.claims', '{"sub": "${tutorProfileId}"}', true);
    `);
    
    const res = await client.query(`
      SELECT c.id FROM children c
      JOIN bookings b ON b.child_id = c.id
    `);
    console.log("Children visible via JOIN:", res.rows.length);
    await client.query("COMMIT;");
    
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}

run();
