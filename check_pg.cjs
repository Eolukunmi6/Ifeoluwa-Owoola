const { Client } = require('pg');
require('dotenv').config();

const connectionString = process.env.VITE_SUPABASE_URL
  .replace('https://', 'postgres://postgres.yxcjqwqwdfewfewf:') // need actual project ref... wait, url is https://qbn42bd3otfn4bxgtxltaw.supabase.co
  // Actually, I can just use Supabase JS to select from pg_policies if I have service role! Wait, pg_policies is usually blocked from API.
