const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const {data, error} = await supabase.rpc('execute_sql', { sql_statement: "SELECT tablename, policyname, cmd, qual, with_check FROM pg_policies WHERE tablename = 'withdrawals';" });
  console.log(data, error);
}
check();
