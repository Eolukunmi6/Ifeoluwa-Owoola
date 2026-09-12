require('dotenv').config();
console.log("SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "EXISTS" : "MISSING");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "EXISTS" : "MISSING");
