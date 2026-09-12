const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const tutorId = '33bcb959-e5cb-4de1-842b-db5937656e6b';
  const { data: payments } = await supabase
      .from('payments')
      .select('tutor_amount, currency, bookings!inner(tutor_id, tutor_marked_completed, parent_marked_satisfied)')
      .eq('bookings.tutor_id', tutorId)
      .eq('status', 'successful');
      
  const balances = {};
  const pendingBalances = {};
  
  (payments || []).forEach(p => {
    const isEligible = p.bookings?.tutor_marked_completed === true && p.bookings?.parent_marked_satisfied === true;
    
    if (isEligible) {
      if (!balances[p.currency]) balances[p.currency] = 0;
      balances[p.currency] += Number(p.tutor_amount);
    } else {
      if (!pendingBalances[p.currency]) pendingBalances[p.currency] = 0;
      pendingBalances[p.currency] += Number(p.tutor_amount);
    }
  });
  
  console.log("Eligible:", balances);
  console.log("Pending:", pendingBalances);
}
run();
