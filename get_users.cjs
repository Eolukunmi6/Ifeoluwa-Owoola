const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: users, error } = await supabase.auth.admin.listUsers();
  if (error) console.log(error);
  else console.log(users.users.map(u => ({ email: u.email, id: u.id })));
}
run();
