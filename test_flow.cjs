const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  // 1. Mark booking 'aee75f0c-d27d-42bf-9f16-36320d15518d' as completed by tutor
  await client.query(`
    UPDATE bookings SET tutor_marked_completed = true, tutor_completed_at = now() 
    WHERE id = 'aee75f0c-d27d-42bf-9f16-36320d15518d'
  `);
  console.log("Tutor marked complete.");
  
  // 2. Mark booking 'aee75f0c-d27d-42bf-9f16-36320d15518d' as satisfied by parent
  await client.query(`
    UPDATE bookings SET parent_marked_satisfied = true, parent_satisfied_at = now() 
    WHERE id = 'aee75f0c-d27d-42bf-9f16-36320d15518d'
  `);
  console.log("Parent marked satisfied.");
  
  await client.end();
}
run();
