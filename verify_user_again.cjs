const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error("List users error:", error);
    return;
  }
  const users = data.users.filter(u => u.email === 'eolukunmi6@gmail.com');
  console.log("Found users matching email:", users.length);
  
  if (users.length > 0) {
    const user = users[0];
    console.log("User ID:", user.id);
    console.log("User role:", user.role);
    console.log("User email confirmed at:", user.email_confirmed_at);
    
    // reset again just to be absolutely sure
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: 'Password123!' }
    );
    if (updateError) console.error("Update error:", updateError);
    else console.log('Password reset again to Password123!');
    
    // verify with anon key
    const supabaseAnon = createClient(supabaseUrl, process.env.VITE_SUPABASE_ANON_KEY);
    const { data: loginData, error: loginError } = await supabaseAnon.auth.signInWithPassword({
      email: 'eolukunmi6@gmail.com',
      password: 'Password123!'
    });
    if (loginError) {
      console.error("Login verification failed:", loginError.message);
    } else {
      console.log("Login verification successful! Token received.");
    }
  }
}
run();
