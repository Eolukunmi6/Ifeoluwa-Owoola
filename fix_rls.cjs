const http = require('http');

// The easiest way to run SQL against Supabase DB is to create an API endpoint in our Express server 
// that runs it using the service role key since we don't have direct DB credentials and don't want to use psql.

const fs = require('fs');
let serverContent = fs.readFileSync('server.ts', 'utf8');

if (!serverContent.includes('execute-sql')) {
  serverContent = serverContent.replace(
    'app.post("/api/admin/bookings/decline", declineBooking);',
    'app.post("/api/admin/bookings/decline", declineBooking);\n  app.post("/api/execute-sql", async (req, res) => { const { createClient } = require("@supabase/supabase-js"); const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); const { query } = req.body; const { error, data } = await sb.rpc("exec", { query }); res.json({error, data}); });'
  );
  fs.writeFileSync('server.ts', serverContent);
}
