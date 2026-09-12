const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const newSubjects = [
    'High School Mathematics', 
    'High School English', 
    'Biology', 
    'Chemistry', 
    'Physics', 
    'Commerce', 
    'Accounting', 
    'Economics', 
    'Geography'
  ];
  
  for (const name of newSubjects) {
    const { data, error } = await supabase.from('subjects').select('*').eq('name', name);
    if (error) {
        console.error("Error checking:", name, error);
        continue;
    }
    if (data && data.length === 0) {
      const { error: insertErr } = await supabase.from('subjects').insert({ name, active: true });
      if (insertErr) console.error("Error inserting:", name, insertErr);
      else console.log('Inserted:', name);
    } else {
      console.log('Already exists:', name);
    }
  }
  
  const { data: all, error: allErr } = await supabase.from('subjects').select('*');
  if (allErr) console.error("Error fetching all:", allErr);
  console.log('\nTotal subjects:', all?.length);
  console.log(all?.map(s => s.name));
}
run();
