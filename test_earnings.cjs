const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        bookings!inner(
          id,
          tutor_id,
          scheduled_at,
          lesson_packages(package_type),
          profiles!bookings_parent_id_fkey(full_name)
        )
      `)
      .limit(1);
  console.log("Payments Error:", paymentsError);
  console.log("Payments Data:", JSON.stringify(payments, null, 2));
}
run();
