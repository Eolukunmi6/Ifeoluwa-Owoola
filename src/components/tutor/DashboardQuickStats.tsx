import React, { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Wallet, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function DashboardQuickStats() {
  const { session, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [netThisMonth, setNetThisMonth] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!session?.access_token || !profile?.id) return;
        
        // 1. Fetch preferred tutor currency
        const { data: tutor } = await supabase
          .from('tutors')
          .select('currency')
          .eq('profile_id', profile.id)
          .single();
          
        const preferredCurrency = tutor?.currency || 'USD';
        setCurrency(preferredCurrency);

        // 2. Fetch Earnings
        const response = await fetch('/api/tutor/earnings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        const data = await response.json();

        if (response.ok && data.payments) {
          const now = new Date();
          let monthTotal = 0;
          
          data.payments.forEach((tx: any) => {
            if (tx.currency === preferredCurrency) {
              const txDate = new Date(tx.created_at);
              if (txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()) {
                monthTotal += Number(tx.tutor_amount);
              }
            }
          });
          
          setNetThisMonth(monthTotal);
          setBookingCount(data.payments.length); // Total bookings paid
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [session, profile]);

  if (loading) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-emerald-50 rounded-xl">
          <Wallet className="w-6 h-6 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Net Earnings (This Month)</p>
          <p className="text-xl font-bold text-slate-900">
            {currency} {netThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-sky-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-sky-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-500">Total Paid Bookings</p>
          <p className="text-xl font-bold text-slate-900">{bookingCount}</p>
        </div>
      </div>
    </div>
  );
}
