import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { initializePaystack } from './paystack.js';
import { initializeFlutterwave } from './flutterwave.js';
// import { initializeLemonSqueezy } from './lemonSqueezy.js'; // Future

// We need service role key to insert into payments and update bookings securely from the backend
function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }
  return createClient(url, key);
}

// 1. Initialize Checkout
export async function initializeCheckout(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId } = req.body;
    
    // We expect the request to have an Authorization header with the user's JWT
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();
    
    // Verify user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get Booking Details
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, profiles!bookings_parent_id_fkey(country, email, full_name)')
      .eq('id', bookingId)
      .eq('parent_id', user.id)
      .single();

    if (bookingError || !booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.status !== 'pending_payment') {
      res.status(400).json({ error: 'Booking is not pending payment' });
      return;
    }

    const parentCountry = booking.profiles?.country?.toLowerCase() || '';
    const email = booking.profiles?.email || user.email;
    const amount = booking.amount;
    const currency = booking.currency;

    // Routing Logic
    let checkoutUrl = '';

    if (parentCountry === 'nigeria') {
      checkoutUrl = await initializePaystack(bookingId, email, amount, currency);
    } else if (['ghana', 'kenya', 'south africa', 'uganda', 'tanzania', 'rwanda', 'zambia'].includes(parentCountry)) {
      // African countries -> Flutterwave
      checkoutUrl = await initializeFlutterwave(bookingId, email, amount, currency, booking.profiles?.full_name);
    } else {
      res.status(400).json({ error: 'REGION_NOT_SUPPORTED' });
      return;
    }

    res.json({ checkoutUrl });

  } catch (error: any) {
    console.error('Checkout initialization error:', error);
    res.status(500).json({ error: error.message || 'Failed to initialize checkout' });
  }
}

// Webhook Helpers
async function processSuccessfulPayment(bookingId: string, provider: string, transactionReference: string, grossAmount: number, currency: string) {
  const supabase = getSupabaseClient();
  
  // Get platform settings
  const { data: settings, error: settingsError } = await supabase
    .from('platform_settings')
    .select('*')
    .limit(1)
    .single();

  if (settingsError || !settings) {
    throw new Error("Failed to fetch platform settings");
  }

  const feePercent = settings.platform_fee_percent;
  const taxPercent = settings.tax_percent;
  
  const platformFee = (grossAmount * feePercent) / 100;
  const tax = (grossAmount * taxPercent) / 100;
  const tutorAmount = grossAmount - platformFee - tax;

  // Insert payment record
  const { error: insertError } = await supabase
    .from('payments')
    .insert({
      booking_id: bookingId,
      provider: provider,
      transaction_reference: transactionReference,
      gross_amount: grossAmount,
      platform_fee: platformFee,
      tax: tax,
      tutor_amount: tutorAmount,
      currency: currency,
      status: 'successful'
    });

  if (insertError) {
    // If it's a unique constraint error on transaction_reference, we already processed it.
    if (insertError.code === '23505') {
       return; // Already processed
    }
    throw insertError;
  }

  // Update booking status
  const { error: updateError } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId);
    
  if (updateError) throw updateError;
}

// 2. Paystack Webhook
export async function handlePaystackWebhook(req: any, res: Response): Promise<void> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    console.error("Missing PAYSTACK_SECRET_KEY");
    res.sendStatus(500);
    return;
  }

  const hash = crypto.createHmac('sha512', secret).update(req.rawBody).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    res.sendStatus(400); // Invalid signature
    return;
  }

  const event = req.body;
  if (event.event === 'charge.success') {
    const bookingId = event.data.metadata.bookingId;
    const amount = event.data.amount / 100; // Paystack returns kobo
    const currency = event.data.currency;
    const reference = event.data.reference;

    try {
      await processSuccessfulPayment(bookingId, 'paystack', reference, amount, currency);
    } catch (e) {
      console.error("Error processing paystack success:", e);
      res.sendStatus(500);
      return;
    }
  }

  res.sendStatus(200);
}

// 3. Flutterwave Webhook
export async function handleFlutterwaveWebhook(req: Request, res: Response): Promise<void> {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash) {
    console.error("Missing FLW_SECRET_HASH");
    res.sendStatus(500);
    return;
  }

  const signature = req.headers['verif-hash'];
  if (!signature || signature !== secretHash) {
    res.sendStatus(400); // Invalid signature
    return;
  }

  const event = req.body;
  if (event.event === 'charge.completed' && event.data.status === 'successful') {
    const bookingId = event.data.tx_ref; // We will use bookingId as tx_ref
    const amount = event.data.amount;
    const currency = event.data.currency;
    const reference = event.data.flw_ref; // The actual FLW transaction reference

    try {
      await processSuccessfulPayment(bookingId, 'flutterwave', reference, amount, currency);
    } catch (e) {
      console.error("Error processing flutterwave success:", e);
      res.sendStatus(500);
      return;
    }
  }

  res.sendStatus(200);
}
