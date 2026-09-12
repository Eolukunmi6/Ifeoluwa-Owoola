import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export function ManageWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<{id: string, action: string} | null>(null);

  const [tutorBalances, setTutorBalances] = useState<Record<string, number>>({});
  
  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*, tutors!inner(profiles!tutors_profile_id_fkey(full_name))')
        .order('requested_at', { ascending: false });
        
      
      if (!error && data) {
        setWithdrawals(data);
        
        // Fetch balances to validate eligibility
        const { data: payments } = await supabase
          .from('payments')
          .select('tutor_amount, currency, bookings!inner(tutor_id, tutor_marked_completed, has_complaint, complaint_status)')
          .eq('status', 'successful');
          
        const { data: allWithdrawals } = await supabase
          .from('withdrawals')
          .select('amount, currency, tutor_id, status')
          .neq('status', 'failed');
          
        const balances: Record<string, number> = {};
        (payments || []).forEach((p: any) => {
          if (p.bookings?.tutor_marked_completed === true && !p.bookings?.has_complaint) {
             const key = p.bookings.tutor_id + '_' + p.currency;
             balances[key] = (balances[key] || 0) + Number(p.tutor_amount);
          }
        });
        
        (allWithdrawals || []).forEach((w: any) => {
          const key = w.tutor_id + '_' + w.currency;
          balances[key] = (balances[key] || 0) - Number(w.amount);
        });
        
        setTutorBalances(balances);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateStatus = async (id: string, status: 'paid' | 'failed' | 'processing') => {
    if (!window.confirm(`Are you sure you want to mark this withdrawal as ${status.toUpperCase()}?`)) return;
    
    setProcessingId(id);
    try {
      const updateData: any = { status };
      if (status === 'paid' || status === 'failed') {
        updateData.processed_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('withdrawals')
        .update(updateData)
        .eq('id', id)
        .select();

      if (!error && (!data || data.length === 0)) throw new Error("Update blocked by RLS or record not found");
        
      if (error) throw error;
      await fetchWithdrawals();
    } catch (err: any) {
      console.error("Update withdrawal error:", err);
      alert("Failed to update withdrawal: " + (err.message || "Unknown error"));
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full"></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Withdrawals</h2>
        <p className="text-sm text-slate-500 mt-1">
          Review and process tutor withdrawal requests. Real bank transfers must be executed manually in your payout provider dashboard (e.g. Paystack Transfers) before marking them as "Paid" here.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Requested</th>
              <th className="px-6 py-4">Tutor</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Bank Details (Snapshot)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {withdrawals.map(w => (
              <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                  {new Date(w.requested_at).toLocaleDateString()}
                  <br/>
                  {new Date(w.requested_at).toLocaleTimeString()}
                </td>
                
                <td className="px-6 py-4 font-semibold text-slate-900">
                  {w.tutors?.profiles?.full_name}
                  {tutorBalances[w.tutor_id + '_' + w.currency] < 0 && (
                     <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200 w-fit">
                       <AlertTriangle className="w-3 h-3" />
                       Warning: Deficit balance ({w.currency} {tutorBalances[w.tutor_id + '_' + w.currency]}). Includes ineligible earnings.
                     </div>
                  )}
                </td>

                <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                  {w.currency} {Number(w.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                  <p><span className="font-semibold">Bank:</span> {w.bank_details_snapshot.bank_name}</p>
                  <p><span className="font-semibold">Acct:</span> {w.bank_details_snapshot.account_number}</p>
                  <p><span className="font-semibold">Name:</span> {w.bank_details_snapshot.account_name}</p>
                  <p><span className="font-semibold">Country:</span> {w.bank_details_snapshot.country}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    w.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    w.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                    w.status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {w.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                  {(w.status === 'pending' || w.status === 'processing') && (
                    <>
                      <button
                        onClick={() => updateStatus(w.id, 'paid')}
                        disabled={processingId === w.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {processingId === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Mark as Paid
                      </button>
                      <button
                        onClick={() => updateStatus(w.id, 'failed')}
                        disabled={processingId === w.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                      >
                        {processingId === w.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        Fail
                      </button>
                    </>
                  )}
                  {(w.status === 'paid' || w.status === 'failed') && (
                    <span className="text-xs text-slate-400 font-medium">Processed</span>
                  )}
                </td>
              </tr>
            ))}
            {withdrawals.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No withdrawal requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
