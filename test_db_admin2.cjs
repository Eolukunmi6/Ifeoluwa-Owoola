const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: user, error: userError } = await supabase.auth.admin.createUser({
    email: 'testadmin2@example.com',
    password: 'password123',
    email_confirm: true
  });
  
  if (userError) {
    console.log("Create user error:", userError.message);
    return;
  }
  
  const { error } = await supabase.from('profiles').insert({
    id: user.user.id,
    role: 'admin',
    full_name: 'Test Admin',
    email: 'testadmin2@example.com'
  });
  console.log("Insert admin error:", error ? error.message : "Success");
}
check();
