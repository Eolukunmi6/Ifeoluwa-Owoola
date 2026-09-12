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
    
    let res = await client.query(`
      SELECT b.id FROM bookings b
    `);
    console.log("Bookings visible:", res.rows.length);

    res = await client.query(`
      SELECT p.id FROM profiles p
      JOIN bookings b ON b.parent_id = p.id
    `);
    console.log("Profiles visible via JOIN:", res.rows.length);

    res = await client.query(`
      SELECT c.id FROM children c
      JOIN bookings b ON b.child_id = c.id
    `);
    console.log("Children visible via JOIN:", res.rows.length);

    res = await client.query(`
      SELECT lp.id FROM lesson_packages lp
      JOIN bookings b ON b.lesson_package_id = lp.id
    `);
    console.log("Lesson packages visible via JOIN:", res.rows.length);

  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}
run();
