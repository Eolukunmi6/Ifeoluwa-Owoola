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
    SELECT b.id, 
      (SELECT id FROM profiles p WHERE p.id = b.parent_id) as parent,
      (SELECT id FROM children c WHERE c.id = b.child_id) as child,
      (SELECT id FROM lesson_packages lp WHERE lp.id = b.lesson_package_id) as package
    FROM bookings b
  `);
  console.table(res.rows);
  await client.end();
}
run();
