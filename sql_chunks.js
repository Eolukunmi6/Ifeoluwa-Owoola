const fs = require('fs');

const phase12 = fs.readFileSync('supabase-phase12.sql', 'utf8');

console.log("\n\n=== PHASE 12 SQL (First Half) ===\n");
console.log(phase12.substring(0, phase12.length / 2));

console.log("\n\n=== PHASE 12 SQL (Second Half) ===\n");
console.log(phase12.substring(phase12.length / 2));

