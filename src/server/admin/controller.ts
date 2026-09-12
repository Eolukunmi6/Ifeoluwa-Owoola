import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.");
  }
  return createClient(url, key);
}

export async function confirmPayment(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      res.status(400).json({ error: 'Missing bookingId' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();
    
    // 1. Verify User is Admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }

    // 2. Fetch Booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.status !== 'pending_payment') {
      res.status(400).json({ error: `Cannot confirm booking in status: ${booking.status}` });
      return;
    }

    // 3. Create Payment Record (12% commission logic)
    const amount = Number(booking.amount);
    const platformFee = amount * 0.12;
    const tutorAmount = amount * 0.88;

    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        booking_id: booking.id,
        provider: 'manual_override', // changed from provider to payment_provider
        transaction_reference: `manual_${booking.id}_${Date.now()}`,
        gross_amount: amount,
        platform_fee: platformFee,
        tax: 0,
        tutor_amount: tutorAmount,
        currency: booking.currency,
        status: 'successful',
        admin_id: user.id,
        confirmed_at: new Date().toISOString()
      });

    if (paymentError) {
      console.error("Payment insert error:", paymentError);
      res.status(500).json({ error: 'Failed to create payment record' });
      return;
    }

    // 4. Update Booking Status
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking.id);

    if (updateError) {
      console.error("Booking update error:", updateError);
      res.status(500).json({ error: 'Failed to update booking status' });
      return;
    }

    res.json({ success: true, message: 'Payment manually confirmed successfully' });
  } catch (error: any) {
    console.error('Manual confirmation error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}


export async function declineBooking(req: Request, res: Response): Promise<void> {
  try {
    const { bookingId } = req.body;
    
    if (!bookingId) {
      res.status(400).json({ error: 'Missing bookingId' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();
    
    // 1. Verify User is Admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden. Admin access required.' });
      return;
    }

    // 2. Fetch Booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('id, status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (booking.status === 'confirmed' || booking.status === 'completed' || booking.status === 'cancelled') {
      res.status(400).json({ error: `Cannot decline booking in status: ${booking.status}` });
      return;
    }

    // 3. Update Booking Status to cancelled
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', booking.id);

    if (updateError) {
      console.error("Booking update error:", updateError);
      res.status(500).json({ error: 'Failed to update booking status' });
      return;
    }

    res.json({ success: true, message: 'Booking declined successfully' });
  } catch (error: any) {
    console.error('Decline booking error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
}
