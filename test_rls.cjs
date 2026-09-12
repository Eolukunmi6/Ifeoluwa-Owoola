const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const sbAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Let's just create a test RPC using REST? No.
  console.log("No simple way to test RLS without the user's JWT");
}
run();
