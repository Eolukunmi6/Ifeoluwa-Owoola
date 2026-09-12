// I don't have a token. I'll just check if the relation is correct.
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: tutor } = await sb.from('tutors').select('*').eq('id', '33bcb959-e5cb-4de1-842b-db5937656e6b').single();
  console.log("Tutor:", tutor);
}
run();
