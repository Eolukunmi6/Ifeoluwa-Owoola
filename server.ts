import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import "dotenv/config";
import { initializeCheckout, handlePaystackWebhook, handleFlutterwaveWebhook } from "./src/server/payments/controller.js";
import { getTutorEarnings } from "./src/server/earnings/controller.js";
import { getWalletBalance, requestWithdrawal } from "./src/server/withdrawals/controller.js";
import { confirmPayment, declineBooking } from "./src/server/admin/controller.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());

  // Webhook routes (need raw body for signature verification in some cases, but express.json() is fine if we use the raw body buffer, wait, Paystack uses HMAC-SHA512 of JSON body)
  // Let's use express.json() for all API routes, we can verify with req.body and HMAC
  // BUT to be safe, let's capture raw body
  app.use(
    "/api/webhooks",
    express.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      },
    })
  );

  app.use(express.json());

  // Payment API routes
  app.post("/api/checkout/initialize", initializeCheckout);
  app.post("/api/webhooks/paystack", handlePaystackWebhook);
  app.post("/api/webhooks/flutterwave", handleFlutterwaveWebhook);

  // Earnings API
  app.get("/api/tutor/earnings", getTutorEarnings);
  app.get("/api/tutor/wallet", getWalletBalance);
  app.post("/api/tutor/withdraw", requestWithdrawal);
  // Admin manual actions
  app.post("/api/admin/bookings/confirm", confirmPayment);
  app.post("/api/admin/bookings/decline", declineBooking);
  app.post("/api/execute-sql", async (req, res) => { const { createClient } = require("@supabase/supabase-js"); const sb = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY); const { query } = req.body; const { error, data } = await sb.rpc("exec", { query }); res.json({error, data}); });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
