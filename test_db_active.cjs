const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  let { error: err1 } = await supabase.from('profiles').update({ active: true }).neq('id', '00000000-0000-0000-0000-000000000000');
  console.log("Profiles active update:", err1 ? err1.message : "Success");
}
check();
