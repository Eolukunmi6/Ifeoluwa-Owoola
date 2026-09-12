const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('profiles')
    .select(`
      *,
      tutors (
        *,
        tutor_subjects (
          subjects (
            name
          )
        )
      )
    `)
    .eq('role', 'tutor')
    .limit(3);
  if(error) console.error(error);
  console.log("Data:", JSON.stringify(data, null, 2));
}
run();
