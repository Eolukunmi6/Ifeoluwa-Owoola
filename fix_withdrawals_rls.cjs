const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = process.env.VITE_SUPABASE_URL.replace('https://', '').split('.')[0];
  const client = new Client({
    connectionString: `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`
  });
  
  await client.connect();
  
  await client.query(`
    DROP POLICY IF EXISTS "Tutors can view their own withdrawals" ON withdrawals;
    DROP POLICY IF EXISTS "Tutors can request withdrawals" ON withdrawals;
    
    CREATE POLICY "Tutors can view their own withdrawals"
      ON withdrawals FOR SELECT
      USING (auth.uid() IN (SELECT profile_id FROM tutors WHERE id = tutor_id));
      
    CREATE POLICY "Tutors can request withdrawals"
      ON withdrawals FOR INSERT
      WITH CHECK (
        auth.uid() IN (SELECT profile_id FROM tutors WHERE id = tutor_id) 
        AND status = 'pending'
      );
  `);
  
  console.log("Withdrawals RLS fixed!");
  await client.end();
}
run();
