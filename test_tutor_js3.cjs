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
    set local role authenticated;
    select set_config('request.jwt.claims', '{"sub": "30208ee5-b86c-48db-90bf-207ff949b307"}', true);
    
    SELECT 
      b.id, b.status, b.scheduled_at
    FROM bookings b
    JOIN profiles p ON p.id = b.parent_id
    JOIN children c ON c.id = b.child_id
    JOIN lesson_packages lp ON lp.id = b.lesson_package_id
    WHERE b.tutor_id = '33bcb959-e5cb-4de1-842b-db5937656e6b';
  `);
  
  // Actually, I should just print the last result which is res[2] for multi-statement queries.
  // pg driver returns an array of result objects for multi-statement query strings.
  console.log(res[2].rows);
  
  await client.end();
}
run();
