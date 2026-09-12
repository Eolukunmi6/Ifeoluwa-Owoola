const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function run() {
  const url = process.env.VITE_SUPABASE_URL;
  const ref = url.replace('https://', '').split('.')[0];
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!password) {
    console.error("SUPABASE_DB_PASSWORD is not set in the environment!");
    process.exit(1);
  }

  // Construct direct connection string
  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;

  const client = new Client({
    connectionString: connectionString,
    connectionTimeoutMillis: 10000
  });

  try {
    console.log("Connecting to the database...");
    await client.connect();
    console.log("Connected successfully!");
    
    const sql = fs.readFileSync('supabase-phase14-tutor-rls.sql', 'utf8');
    console.log("Applying RLS policies...");
    await client.query(sql);
    console.log("RLS policies applied successfully!");
    
  } catch (err) {
    console.error("Database connection/execution error:");
    console.error(err.message);
  } finally {
    await client.end();
  }
}

run();
