import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../../providers/AuthProvider';

export function ManageBookings() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'payments'>('bookings');
  const [payments, setPayments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<{ id: string, action: 'accept' | 'decline' } | null>(null);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  

  
  
  const handleConfirm = async (bookingId: string) => {
    setProcessingId(bookingId);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/bookings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to accept booking');
      
            setMessage({ type: 'success', text: 'Booking accepted successfully!' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unknown error occurred.' });
    } finally {
      setProcessingId(null);
      setConfirmingAction(null);
    }
  };

  const handleDecline = async (bookingId: string) => {
    setProcessingId(bookingId);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/bookings/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ bookingId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to decline booking');
      
            setMessage({ type: 'success', text: 'Booking declined successfully!' });
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'An unknown error occurred.' });
    } finally {
      setProcessingId(null);
      setConfirmingAction(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    const [bRes, pRes] = await Promise.all([
      supabase.from('bookings').select('*, profiles!bookings_parent_id_fkey(full_name), tutors!inner(profiles!tutors_profile_id_fkey(full_name))').order('created_at', { ascending: false }),
      supabase.from('payments').select('*, bookings!inner(profiles!bookings_parent_id_fkey(full_name), tutors!inner(profiles!tutors_profile_id_fkey(full_name)))').order('created_at', { ascending: false })
    ]);
    if (bRes.data) setBookings(bRes.data);
    if (pRes.data) setPayments(pRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);


  const handleResolveDispute = async (id: string, newResponse: 'satisfied' | 'pending') => {
    try {
      setProcessingId(id);
      const { error } = await supabase
        .from('bookings')
        .update({ parent_response: newResponse })
        .eq('id', id);
      if (error) throw error;
      await fetchData();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    
    <div>
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
          {message.text}
        </div>
      )}
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Manage Bookings & Payments</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('bookings')} className={`px-4 py-1.5 rounded-lg text-sm font-bold ${activeTab === 'bookings' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Bookings</button>
          <button onClick={() => setActiveTab('payments')} className={`px-4 py-1.5 rounded-lg text-sm font-bold ${activeTab === 'payments' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Payments</button>
        </div>
      </div>
      
      {activeTab === 'bookings' && (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">

          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Parent</th>
              <th className="px-6 py-4">Tutor</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {bookings.map(b => (
              <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                  {new Date(b.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {b.profiles?.full_name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {b.tutors?.profiles?.full_name}
                </td>
                <td className="px-6 py-4 text-slate-900 font-medium">
                  {b.currency} {b.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    b.status === 'confirmed' || b.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : b.status === 'cancelled' 
                      ? 'bg-rose-100 text-rose-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  
                  {(b.status === 'confirmed' || b.status === 'completed') && (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex w-fit ${b.tutor_marked_completed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        Tutor: {b.tutor_marked_completed ? 'Completed' : 'Pending'}
                      </div>
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex w-fit ${b.has_complaint ? 'bg-rose-50 text-rose-700 border-rose-200' : b.tutor_marked_completed ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        Parent: {b.has_complaint ? 'Complaint' : b.tutor_marked_completed ? 'No Complaint' : 'Pending'}
                      </div>
                    </div>
                  )}

                </td>
                <td className="px-6 py-4 text-right">
                  {false && (
                    <div className="flex justify-end gap-2 mb-2">
                      <button
                        onClick={() => handleResolveDispute(b.id, 'satisfied')}
                        disabled={processingId === b.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        title="Force approve for tutor"
                      >
                        Force Approve
                      </button>
                      <button
                        onClick={() => handleResolveDispute(b.id, 'pending')}
                        disabled={processingId === b.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        title="Reset to pending"
                      >
                        Reset Pending
                      </button>
                    </div>
                  )}
                  {(b.status === 'pending_payment' || b.status === 'pending') && (
                    confirmingAction?.id === b.id ? (
                      <div className="flex flex-col gap-2 items-end">
                        <span className="text-xs text-slate-500 mb-1">Are you sure?</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => confirmingAction.action === 'accept' ? handleConfirm(b.id) : handleDecline(b.id)}
                            disabled={processingId === b.id}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                              confirmingAction.action === 'accept' ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'
                            }`}
                          >
                            {processingId === b.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, Confirm'}
                          </button>
                          <button
                            onClick={() => setConfirmingAction(null)}
                            disabled={processingId === b.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setConfirmingAction({ id: b.id, action: 'accept' })}
                          disabled={processingId === b.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Accept
                        </button>
                        <button
                          onClick={() => setConfirmingAction({ id: b.id, action: 'decline' })}
                          disabled={processingId === b.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          Decline
                        </button>
                      </div>
                    )
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No bookings found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      )}

      {activeTab === 'payments' && (
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Parties</th>
              <th className="px-6 py-4">Gross</th>
              <th className="px-6 py-4">Fees + Tax</th>
              <th className="px-6 py-4">Net Tutor</th>
              <th className="px-6 py-4">Provider</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <p className="font-semibold text-slate-900 text-xs">P: {p.bookings?.profiles?.full_name}</p>
                  <p className="text-slate-500 text-xs">T: {p.bookings?.tutors?.profiles?.full_name}</p>
                </td>
                <td className="px-6 py-4 text-slate-900 font-bold whitespace-nowrap">
                  {p.currency} {p.gross_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="px-6 py-4 text-rose-600 font-medium whitespace-nowrap">
                  -{p.currency} {(p.tax + p.platform_fee).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="px-6 py-4 text-emerald-600 font-bold whitespace-nowrap">
                  {p.currency} {p.tutor_amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                </td>
                <td className="px-6 py-4 text-slate-500">
                  <span className="capitalize">{p.payment_provider}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    p.status === 'successful' ? 'bg-emerald-100 text-emerald-700' : 
                    p.status === 'failed' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500">No payments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}

