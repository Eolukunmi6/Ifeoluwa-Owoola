import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { Wallet, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function TutorWallet({ onWithdrawalComplete }: { onWithdrawalComplete: () => void }) {
  const { session, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [pendingBalances, setPendingBalances] = useState<Record<string, number>>({});
  const [hasBankDetails, setHasBankDetails] = useState(false);
  const [tutorCurrency, setTutorCurrency] = useState('USD');
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [confirmingWithdrawal, setConfirmingWithdrawal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallet = async () => {
    try {
      if (!session?.access_token) return;
      
      const res = await fetch('/api/tutor/wallet', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setBalances(data.balances || {});
      setPendingBalances(data.pendingBalances || {});

      // Also check if they have bank details
      if (profile?.id) {
        const { data: tutor } = await supabase.from('tutors').select('id, currency').eq('profile_id', profile.id).single();
        if (tutor) {
          setTutorCurrency(tutor.currency || 'USD');
          const { data: bank } = await supabase.from('tutor_bank_details').select('id').eq('tutor_id', tutor.id).maybeSingle();
          setHasBankDetails(!!bank);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
      setConfirmingWithdrawal(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [session, profile]);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    
    if (!confirmingWithdrawal) {
      setConfirmingWithdrawal(true);
      return;
    }

    setWithdrawing(true);
    setError(null);
    try {
      const res = await fetch('/api/tutor/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ amount: Number(withdrawAmount), currency: tutorCurrency })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setWithdrawAmount('');
      await fetchWallet();
      onWithdrawalComplete();
      setConfirmingWithdrawal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="animate-pulse h-48 bg-slate-100 rounded-2xl w-full"></div>;

  const available = balances[tutorCurrency] || 0;
  const pending = pendingBalances[tutorCurrency] || 0;

  return (
    <div className="bg-slate-900 rounded-2xl p-6 shadow-lg text-white">
      <div className="flex items-center gap-3 mb-6 opacity-80">
        <Wallet className="w-5 h-5 text-emerald-400" />
        <h3 className="font-bold tracking-wide uppercase text-sm">Available Balance</h3>
      </div>

      <div className="mb-4">
        <span className="text-5xl font-black">{tutorCurrency} {available.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      </div>
      
      {pending > 0 && (
        <div className="mb-8 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-1">Pending Completion</div>
            <div className="text-amber-100 font-medium text-sm">Earnings awaiting session completion and parent approval.</div>
          </div>
          <div className="text-xl font-bold text-amber-400">{tutorCurrency} {pending.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
        </div>
      )}
      {pending === 0 && <div className="mb-8"></div>}

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 text-red-200 border border-red-500/30 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleWithdraw} className="bg-white/10 p-4 rounded-xl space-y-3">
        {!hasBankDetails ? (
          <p className="text-sm text-amber-200 font-medium">Please save your bank details below before withdrawing.</p>
        ) : available <= 0 ? (
          <p className="text-sm text-slate-400 font-medium">You don't have enough funds to withdraw yet.</p>
        ) : (
          <>
            <label className="text-sm font-semibold opacity-90 block">Request Withdrawal</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">{tutorCurrency}</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  max={available}
                  required
                  value={withdrawAmount}
                  onChange={e => { setWithdrawAmount(e.target.value); setConfirmingWithdrawal(false); }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-12 pr-4 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none placeholder:text-slate-500"
                  placeholder="0.00"
                />
                <button
                  type="button"
                  onClick={() => { setWithdrawAmount(available.toString()); setConfirmingWithdrawal(false); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded font-bold transition-colors"
                >
                  MAX
                </button>
              </div>
              <button
                type="submit"
                disabled={withdrawing || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > available}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmingWithdrawal ? 'Yes, Withdraw' : 'Withdraw'}
              </button>
            </div>
            <p className="text-xs text-slate-400">Withdrawals take 24 hours to process.</p>
          </>
        )}
      </form>
    </div>
  );
}
