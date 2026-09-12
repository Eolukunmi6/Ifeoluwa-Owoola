const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const tutorId = '35604a85-8579-42d0-93ef-998274fa5ede'; // Tutor with bookings
  
  const res = await fetch('http://localhost:3000/api/tutor/wallet', {
    headers: { 
      // We can't hit the API without a valid token. Let's just run the internal logic.
    }
  });
}
run();
