const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  // Create a JWT token for the tutor. We can just use the anon key and RLS simulate? 
  // No, Supabase JS uses the JWT. We don't have the JWT secret.
  
  // Let's run the EXACT query that TutorBookingsManager runs, via pg but formatted like PostgREST
  const res = await client.query(`
    set local role authenticated;
    select set_config('request.jwt.claims', '{"sub": "30208ee5-b86c-48db-90bf-207ff949b307"}', true);
    
    SELECT 
      b.*,
      row_to_json(p) as profiles,
      row_to_json(c) as children,
      row_to_json(lp) as lesson_packages,
      (SELECT json_agg(row_to_json(pay)) FROM payments pay WHERE pay.booking_id = b.id) as payments
    FROM bookings b
    JOIN profiles p ON p.id = b.parent_id
    JOIN children c ON c.id = b.child_id
    JOIN lesson_packages lp ON lp.id = b.lesson_package_id
    WHERE b.tutor_id = '33bcb959-e5cb-4de1-842b-db5937656e6b'
  `);
  
  console.log("DB Result length:", res.length > 2 ? res[2].rows.length : res.rows?.length);
  if (res[2] && res[2].rows.length > 0) {
    console.log(JSON.stringify(res[2].rows, null, 2));
  }
  
  await client.end();
}
run();
