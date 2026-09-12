const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function run() {
  const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { users }, error } = await sb.auth.admin.listUsers();
  const user = users.find(u => u.id === '30208ee5-b86c-48db-90bf-207ff949b307');
  console.log("Email:", user?.email);
}
run();
