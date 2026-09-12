const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
    const { data: { user } } = await supabase.auth.signInWithPassword({email: 'admin@edumatics.com', password: 'password'});
    if (!user) { console.log("Login failed"); return; }
    
    // First, let's fetch a withdrawal
    const { data: wList, error: getErr } = await supabase.from('withdrawals').select('*').limit(1);
    console.log("Withdrawals seen:", wList, getErr);
    
    if (wList && wList.length > 0) {
        const id = wList[0].id;
        const { data, error } = await supabase.from('withdrawals').update({ status: 'processing' }).eq('id', id).select();
        console.log("Update result:", data, error);
    }
}
run();
