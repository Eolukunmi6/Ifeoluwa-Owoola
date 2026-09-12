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

export async function getWalletBalance(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: tutor, error: tutorError } = await supabaseClient
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single();
      
    if (tutorError || !tutor) {
      res.status(404).json({ error: 'Tutor profile not found' });
      return;
    }

    // Get successful payments
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('tutor_amount, currency, bookings!inner(tutor_id, tutor_marked_completed, has_complaint, complaint_status)')
      .eq('bookings.tutor_id', tutor.id)
      .eq('status', 'successful');

    // Get non-failed withdrawals
    const { data: withdrawals } = await supabaseClient
      .from('withdrawals')
      .select('amount, currency, status')
      .eq('tutor_id', tutor.id)
      .neq('status', 'failed');

    const balances: Record<string, number> = {};
    const pendingBalances: Record<string, number> = {};

    (payments || []).forEach(p => {
      const b = Array.isArray(p.bookings) ? p.bookings[0] : p.bookings;
      const isEligible = b?.tutor_marked_completed === true && !b?.has_complaint;
      
      if (isEligible) {
        if (!balances[p.currency]) balances[p.currency] = 0;
        balances[p.currency] += Number(p.tutor_amount);
      } else {
        if (!pendingBalances[p.currency]) pendingBalances[p.currency] = 0;
        pendingBalances[p.currency] += Number(p.tutor_amount);
      }
    });

    (withdrawals || []).forEach(w => {
      if (!balances[w.currency]) balances[w.currency] = 0;
      balances[w.currency] -= Number(w.amount);
    });

    // Clean up floating point math
    Object.keys(balances).forEach(curr => {
      balances[curr] = Math.max(0, Number(balances[curr].toFixed(2)));
    });
    
    Object.keys(pendingBalances).forEach(curr => {
      pendingBalances[curr] = Math.max(0, Number(pendingBalances[curr].toFixed(2)));
    });

    res.json({ balances, pendingBalances });
  } catch (error: any) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch wallet balance' });
  }
}

export async function requestWithdrawal(req: Request, res: Response): Promise<void> {
  try {
    const { amount, currency } = req.body;
    
    if (!amount || amount <= 0 || !currency) {
      res.status(400).json({ error: 'Invalid withdrawal amount or currency' });
      return;
    }

    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: tutor, error: tutorError } = await supabaseClient
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single();
      
    if (tutorError || !tutor) {
      res.status(404).json({ error: 'Tutor profile not found' });
      return;
    }

    // Verify bank details exist
    const { data: bankDetails, error: bankError } = await supabaseClient
      .from('tutor_bank_details')
      .select('*')
      .eq('tutor_id', tutor.id)
      .single();

    if (bankError || !bankDetails) {
      res.status(400).json({ error: 'Bank details not found. Please save them before withdrawing.' });
      return;
    }

    if (bankDetails.currency !== currency) {
       res.status(400).json({ error: `You can only withdraw in your bank's currency (${bankDetails.currency}).` });
       return;
    }

    // Server-side calculation of available balance
    const { data: payments } = await supabaseClient
      .from('payments')
      .select('tutor_amount, currency, bookings!inner(tutor_id, tutor_marked_completed, has_complaint, complaint_status)')
      .eq('bookings.tutor_id', tutor.id)
      .eq('status', 'successful')
      .eq('currency', currency);

    const { data: withdrawals } = await supabaseClient
      .from('withdrawals')
      .select('amount, currency, status')
      .eq('tutor_id', tutor.id)
      .eq('currency', currency)
      .neq('status', 'failed');

    let availableBalance = 0;
    (payments || []).forEach(p => {
      const b = Array.isArray(p.bookings) ? p.bookings[0] : p.bookings;
      if (b?.tutor_marked_completed === true && !b?.has_complaint) {
        availableBalance += Number(p.tutor_amount);
      }
    });
    (withdrawals || []).forEach(w => availableBalance -= Number(w.amount));

    availableBalance = Number(availableBalance.toFixed(2));

    if (amount > availableBalance) {
      res.status(400).json({ error: `Requested amount exceeds available balance of ${currency} ${availableBalance}` });
      return;
    }

    // Insert withdrawal
    const { error: insertError } = await supabaseClient
      .from('withdrawals')
      .insert({
        tutor_id: tutor.id,
        amount: Number(amount),
        currency: currency,
        status: 'pending',
        bank_details_snapshot: bankDetails
      });

    if (insertError) {
      console.error(insertError);
      res.status(500).json({ error: 'Failed to process withdrawal request.' });
      return;
    }

    res.json({ success: true, message: 'Withdrawal requested successfully.' });
  } catch (error: any) {
    console.error('Withdrawal request error:', error);
    res.status(500).json({ error: error.message || 'Failed to request withdrawal' });
  }
}
