const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('payments').select('*').limit(1);
  console.log("Payments table:", error ? error.message : "Exists! Rows: " + data.length);
}
check();
