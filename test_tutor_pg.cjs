const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });

  try {
    await client.connect();
    
    // Simulate Tutor login
    const tutorProfileId = '30208ee5-b86c-48db-90bf-207ff949b307';
    await client.query(`
      set local role authenticated;
      select set_config('request.jwt.claims', '{"sub": "${tutorProfileId}"}', true);
    `);
    
    const res = await client.query(`
      SELECT b.id, b.status 
      FROM bookings b
      JOIN profiles p ON p.id = b.parent_id
      JOIN children c ON c.id = b.child_id
      JOIN lesson_packages lp ON lp.id = b.lesson_package_id
      WHERE b.tutor_id = '33bcb959-e5cb-4de1-842b-db5937656e6b'
    `);
    console.log("Bookings fetched as tutor with INNER JOINs:");
    console.table(res.rows);
    
    // Test individual RLS
    const profiles = await client.query("SELECT id FROM profiles WHERE id IN (SELECT parent_id FROM bookings WHERE tutor_id = '33bcb959-e5cb-4de1-842b-db5937656e6b')");
    console.log("Profiles visible:", profiles.rows.length);

    const children = await client.query("SELECT id FROM children WHERE id IN (SELECT child_id FROM bookings WHERE tutor_id = '33bcb959-e5cb-4de1-842b-db5937656e6b')");
    console.log("Children visible:", children.rows.length);
    
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}
run();
