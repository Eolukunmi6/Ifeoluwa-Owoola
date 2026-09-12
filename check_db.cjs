const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data: profiles, error: profileErr } = await supabase.from('profiles').select('*').eq('role', 'tutor').limit(3);
  console.log("Profiles:", profiles);
  const { data: tutors, error: tutorsErr } = await supabase.from('tutors').select('*').limit(3);
  console.log("Tutors:", tutors);
}
run();
