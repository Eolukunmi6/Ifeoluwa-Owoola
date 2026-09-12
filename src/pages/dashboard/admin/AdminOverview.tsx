import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Users, GraduationCap, CalendarCheck, Wallet, ArrowDownToLine, Loader2 } from 'lucide-react';

export function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    tutors: 0,
    parents: 0,
    bookings: 0,
    platformEarnings: 0,
    payoutsOwed: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [tutorsRes, parentsRes, bookingsRes, paymentsRes] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'tutor'),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'parent'),
          supabase.from('bookings').select('id', { count: 'exact', head: true }),
          supabase.from('payments').select('platform_fee, tax, tutor_amount').eq('status', 'successful')
        ]);

        let pEarnings = 0;
        let pOwed = 0;

        if (paymentsRes.data) {
          paymentsRes.data.forEach(p => {
            pEarnings += (p.platform_fee + p.tax);
            pOwed += p.tutor_amount;
          });
        }

        setStats({
          tutors: tutorsRes.count || 0,
          parents: parentsRes.count || 0,
          bookings: bookingsRes.count || 0,
          platformEarnings: pEarnings,
          payoutsOwed: pOwed
        });
      } catch (err) {
        console.error("Failed to load admin stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  const cards = [
    { label: 'Total Tutors', value: stats.tutors, icon: <GraduationCap className="w-6 h-6 text-sky-600" />, bg: 'bg-sky-50' },
    { label: 'Total Parents', value: stats.parents, icon: <Users className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
    { label: 'Total Bookings', value: stats.bookings, icon: <CalendarCheck className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50' },
    { label: 'Platform Earnings (Fees + Tax)', value: `$${stats.platformEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <Wallet className="w-6 h-6 text-amber-600" />, bg: 'bg-amber-50' },
    { label: 'Tutor Payouts Owed', value: `$${stats.payoutsOwed.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: <ArrowDownToLine className="w-6 h-6 text-rose-600" />, bg: 'bg-rose-50' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="p-6 rounded-2xl border border-slate-100 shadow-sm bg-white">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${c.bg}`}>
              {c.icon}
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{c.label}</p>
            <p className="text-2xl font-bold text-slate-900">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
