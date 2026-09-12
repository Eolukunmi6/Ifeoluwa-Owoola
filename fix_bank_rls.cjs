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
    DROP POLICY IF EXISTS "Tutors can view their own bank details" ON tutor_bank_details;
    DROP POLICY IF EXISTS "Tutors can insert their own bank details" ON tutor_bank_details;
    DROP POLICY IF EXISTS "Tutors can update their own bank details" ON tutor_bank_details;
    
    CREATE POLICY "Tutors can view their own bank details"
      ON tutor_bank_details FOR SELECT
      USING (auth.uid() IN (SELECT profile_id FROM tutors WHERE id = tutor_id));
      
    CREATE POLICY "Tutors can insert their own bank details"
      ON tutor_bank_details FOR INSERT
      WITH CHECK (auth.uid() IN (SELECT profile_id FROM tutors WHERE id = tutor_id));
      
    CREATE POLICY "Tutors can update their own bank details"
      ON tutor_bank_details FOR UPDATE
      USING (auth.uid() IN (SELECT profile_id FROM tutors WHERE id = tutor_id));
  `);
  
  console.log("Bank details RLS fixed!");
  await client.end();
}
run();
