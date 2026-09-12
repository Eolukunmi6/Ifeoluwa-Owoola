import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // We can poll the booking status to ensure the webhook was processed
    if (!bookingId) return;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const { data } = await supabase
        .from('bookings')
        .select('status')
        .eq('id', bookingId)
        .single();
        
      if (data?.status === 'confirmed' || data?.status === 'completed') {
        setConfirmed(true);
        setLoading(false);
        clearInterval(interval);
      } else if (attempts > 10) {
        // Stop polling after 10 seconds, maybe webhook is delayed
        setLoading(false);
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 sm:p-10 text-center shadow-sm border border-slate-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">Payment Successful</h1>
        
        {loading ? (
          <p className="text-slate-500 mb-8">Confirming your booking details...</p>
        ) : confirmed ? (
          <p className="text-slate-500 mb-8">Your lesson has been confirmed and scheduled! The tutor has been notified.</p>
        ) : (
          <p className="text-slate-500 mb-8">We received your payment. Your booking should be confirmed shortly once the provider notifies us.</p>
        )}

        <Link 
          to="/dashboard/parent"
          className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          Go to Dashboard <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
