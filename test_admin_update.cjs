const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabaseAnon = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    // get a user who is admin
    const {data: adminUser} = await supabaseAdmin.from('profiles').select('id, email').eq('role', 'admin').limit(1).single();
    if (!adminUser) return console.log("no admin");
    console.log("Admin:", adminUser);

    // sign in as admin
    const { data: { user, session }, error: authErr } = await supabaseAnon.auth.signInWithPassword({
        email: 'eolukunmi6@gmail.com', 
        password: 'Password123!'
    });
    if (authErr) return console.log("Auth err:", authErr);
    console.log("Logged in:", user.email);

    // get a withdrawal
    const { data: wList } = await supabaseAdmin.from('withdrawals').select('*').limit(1);
    if (!wList || wList.length === 0) return console.log("no withdrawals");
    const id = wList[0].id;
    console.log("Withdrawal ID:", id);

    // Try update as admin
    const { data, error } = await supabaseAnon.from('withdrawals').update({ status: 'processing' }).eq('id', id).select();
    console.log("Update result:", data, error);
}
run();
