const { Client } = require('pg');
require('dotenv').config();

async function run() {
  const url = process.env.VITE_SUPABASE_URL;
  // url is https://<ref>.supabase.co
  const ref = url.split('//')[1].split('.')[0];
  // default password is not known, but often we can't connect. Let's try.
  // Actually, wait, if I can't connect to postgres directly, I can't query pg_policies.
}
