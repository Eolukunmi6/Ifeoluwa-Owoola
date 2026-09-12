const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('profiles')
    .select('*, tutors(*)')
    .eq('role', 'tutor')
    .limit(4);
  if (error) console.error(error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
run();
