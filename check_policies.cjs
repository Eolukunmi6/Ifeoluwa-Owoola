const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_policies_for_tables', { table_names: ['bookings', 'payments'] });
  if (error) console.log(error);
  else console.log(data);
}

run();
