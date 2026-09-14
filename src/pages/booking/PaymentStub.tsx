import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { CreditCard, AlertCircle, Loader2 } from 'lucide-react';

export function PaymentStub() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedRegion, setUnsupportedRegion] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id || !profile) return;
      
      const { data, error } = await supabase
        .from('bookings')
        .select('*, profiles!bookings_parent_id_fkey(country)')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(error);
        setError("Failed to load booking.");
        return;
      }
      
      setAmount(data.amount);
      setCurrency(data.currency);
      
      const country = data.profiles?.country?.toLowerCase() || '';
      
      // Determine if region is supported
      if (country === 'nigeria' || ['ghana', 'kenya', 'south africa', 'uganda', 'tanzania', 'rwanda', 'zambia'].includes(country)) {
        setUnsupportedRegion(false);
      } else {
        setUnsupportedRegion(true);
      }
    };
    
    fetchBooking();
  }, [id, profile]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ bookingId: id })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Checkout initialization failed');
      }
      
      // Redirect to provider checkout URL
      window.location.href = data.checkoutUrl;
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to payment provider.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="w-8 h-8 text-sky-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Proceed to Payment</h1>
        
        {amount !== null && currency !== null && (
          <div className="text-3xl font-extrabold text-slate-900 mb-6">
            {currency === 'NGN' ? '₦' : currency === 'USD' ? '$' : currency} {amount}
          </div>
        )}

        {unsupportedRegion ? (
          <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700 mb-2">Region Not Supported</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              This region isn't supported for payments yet. We are working on adding more payment providers soon.
            </p>
          </div>
        ) : (
          <p className="text-slate-500 mb-8 leading-relaxed">
            Click the button below to proceed to our secure payment gateway to complete your booking.
          </p>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {!unsupportedRegion && (
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Pay Now'}
            </button>
          )}
          
          <button
            onClick={() => navigate('/dashboard/parent')}
            disabled={loading}
            className="w-full py-4 bg-white text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
