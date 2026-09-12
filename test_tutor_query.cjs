const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const tutorId = '33bcb959-e5cb-4de1-842b-db5937656e6b';
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      profiles!inner(full_name, profile_photo),
      children!inner(name),
      lesson_packages!inner(package_type, session_hours, session_minutes),
      payments(tutor_amount)
    `)
    .eq('tutor_id', tutorId)
    .order('scheduled_at', { ascending: true });
    
  if (error) console.log("Query Error:", error.message, error.hint, error.details);
  else console.log("Query Success, rows:", data.length);
}
run();
