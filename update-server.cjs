const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('getTutorEarnings')) {
  content = content.replace(
    'import { initializeCheckout, handlePaystackWebhook, handleFlutterwaveWebhook } from "./src/server/payments/controller.js";',
    'import { initializeCheckout, handlePaystackWebhook, handleFlutterwaveWebhook } from "./src/server/payments/controller.js";\nimport { getTutorEarnings } from "./src/server/earnings/controller.js";'
  );

  content = content.replace(
    'app.post("/api/webhooks/flutterwave", handleFlutterwaveWebhook);',
    'app.post("/api/webhooks/flutterwave", handleFlutterwaveWebhook);\n\n  // Earnings API\n  app.get("/api/tutor/earnings", getTutorEarnings);'
  );

  fs.writeFileSync('server.ts', content);
}
