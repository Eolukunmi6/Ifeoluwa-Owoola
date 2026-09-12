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

export async function getTutorEarnings(req: Request, res: Response): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseClient = getSupabaseClient();
    
    // 1. Verify User
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // 2. Get Tutor ID
    const { data: tutor, error: tutorError } = await supabaseClient
      .from('tutors')
      .select('id')
      .eq('profile_id', user.id)
      .single();

    if (tutorError || !tutor) {
      res.status(404).json({ error: 'Tutor profile not found' });
      return;
    }

    // 3. Get all successful payments for this tutor's bookings
    // Using service role to bypass the RLS restriction issue on payments table
    const { data: payments, error: paymentsError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        bookings!inner(
          id,
          tutor_id,
          scheduled_at,
          lesson_packages(package_type),
          profiles!bookings_parent_id_fkey(full_name)
        )
      `)
      .eq('bookings.tutor_id', tutor.id)
      .eq('status', 'successful')
      .order('created_at', { ascending: false });

    if (paymentsError) {
      console.error(paymentsError);
      res.status(500).json({ error: 'Failed to fetch payments' });
      return;
    }

    res.json({ payments: payments || [] });
  } catch (error: any) {
    console.error('Tutor earnings fetch error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch earnings' });
  }
}
