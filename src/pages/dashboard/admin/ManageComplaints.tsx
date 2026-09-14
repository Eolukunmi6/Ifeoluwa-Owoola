import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export function ManageComplaints() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchComplaints = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tutors!inner(profiles!tutors_profile_id_fkey(full_name, email)),
          children!inner(name),
          profiles!bookings_parent_id_fkey(full_name, email)
        `)
        .not('complaint_status', 'is', null)
        .order('complaint_filed_at', { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const resolveComplaint = async (bookingId: string, resolution: 'tutor_favor' | 'parent_favor') => {
    try {
      setProcessingId(bookingId);
      
      const { error } = await supabase
        .from('bookings')
        .update({
          complaint_status: resolution === 'tutor_favor' ? 'resolved_tutor_favor' : 'resolved_parent_favor',
          has_complaint: resolution === 'parent_favor', // If parent favor, keep complaint active to block tutor pay. If tutor favor, we actually can remove it or just leave has_complaint=false so tutor gets paid.
        })
        .eq('id', bookingId);

      if (error) throw error;
      
      if (resolution === 'tutor_favor') {
        // Tutor gets paid, unflag has_complaint so wallet includes it.
        await supabase
          .from('bookings')
          .update({ has_complaint: false })
          .eq('id', bookingId);
      }

      await fetchComplaints();
    } catch (err) {
      console.error(err);
      alert('Failed to resolve complaint.');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Manage Complaints</h2>
      
      {complaints.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No complaints filed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900">Complaint on Booking</h3>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${c.complaint_status === 'open' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                    {c.complaint_status.replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-slate-500">Tutor:</span>
                    <div className="font-semibold">{c.tutors?.profiles?.full_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Parent:</span>
                    <div className="font-semibold">{c.profiles?.full_name}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Filed On:</span>
                    <div className="font-semibold">{new Date(c.complaint_filed_at).toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500">Booking Amount:</span>
                    <div className="font-semibold text-rose-600">{c.currency} {c.amount}</div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-900">
                  <strong>Reason:</strong> {c.complaint_reason}
                </div>
              </div>

              <div className="md:w-56 flex flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
                {c.complaint_status === 'open' ? (
                  <>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 text-center">Resolution Actions</p>
                    <button
                      onClick={() => resolveComplaint(c.id, 'tutor_favor')}
                      disabled={processingId === c.id}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold py-2.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {processingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Complaint Resolved (Pay Tutor)
                    </button>
                    <button
                      onClick={() => resolveComplaint(c.id, 'parent_favor')}
                      disabled={processingId === c.id}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold py-2.5 px-3 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {processingId === c.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                      Complaint Resolved (Refund Parent)
                    </button>
                  </>
                ) : (
                  <div className="text-center text-sm font-semibold text-slate-400">
                    Resolved
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
