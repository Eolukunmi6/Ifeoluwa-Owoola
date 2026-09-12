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
    
    const bookingsCols = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
    `);
    console.log("Bookings columns:", bookingsCols.rows.map(r => r.column_name).join(', '));
    
  } catch (err) {
    console.error(err.message);
  } finally {
    await client.end();
  }
}
run();
