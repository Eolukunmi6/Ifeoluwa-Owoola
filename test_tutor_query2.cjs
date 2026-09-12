const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Let's get the tutor profile
  const { data: tutor } = await supabaseAdmin.from('tutors').select('profile_id').eq('id', '33bcb959-e5cb-4de1-842b-db5937656e6b').single();
  const profileId = tutor.profile_id;
  
  // Create a JWT token for the tutor manually (Supabase allows this with service role by just using auth.admin.generateLink or we can just fetch via service role but we want to simulate RLS).
  // Actually, we can use Supabase POST /rest/v1/rpc/ ... wait.
  
  // Let's just check the RLS policy by looking at what Supabase returns for the anon key + simulated JWT? No, we don't have the JWT secret.
  
  // Let's just run the query with service role to ensure the JOINs don't filter out the row!
  const { data, error } = await supabaseAdmin
        .from('bookings')
        .select(`
          *,
          profiles!inner(full_name, profile_photo),
          children!inner(name),
          lesson_packages!inner(package_type, session_hours, session_minutes),
          payments(tutor_amount)
        `)
        .eq('tutor_id', '33bcb959-e5cb-4de1-842b-db5937656e6b')
        .order('scheduled_at', { ascending: true });
        
  console.log("Error:", error);
  console.log("Data length:", data?.length);
}
run();
