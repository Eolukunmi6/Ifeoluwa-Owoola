import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function WithdrawalHistory({ refreshTrigger }: { refreshTrigger: number }) {
  const { profile } = useAuth();
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        if (!profile?.id) return;
        const { data: tutor } = await supabase.from('tutors').select('id').eq('profile_id', profile.id).single();
        if (!tutor) return;

        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .eq('tutor_id', tutor.id)
          .order('requested_at', { ascending: false });

        if (error) throw error;
        setWithdrawals(data || []);
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [profile, refreshTrigger]);

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full"></div>;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'processing': return <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />;
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <Clock className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Paid</span>;
      case 'processing': return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Processing</span>;
      case 'pending': return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Pending</span>;
      case 'failed': return <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Failed</span>;
      default: return <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-xl font-bold text-slate-900">Withdrawal History</h3>
        <p className="text-sm text-slate-500 mt-1">Past and pending withdrawal requests.</p>
      </div>

      {withdrawals.length === 0 ? (
        <div className="p-12 text-center text-slate-500 font-medium">
          No withdrawals found.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {withdrawals.map(w => (
            <div key={w.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getStatusIcon(w.status)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-lg">{w.currency} {Number(w.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Requested on {new Date(w.requested_at).toLocaleDateString()}
                    {w.processed_at && w.status === 'paid' && ` • Paid on ${new Date(w.processed_at).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(w.status)}
                <span className="text-xs text-slate-400 font-medium font-mono">
                  To: {w.bank_details_snapshot.bank_name} (...{w.bank_details_snapshot.account_number.slice(-4)})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
