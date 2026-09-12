
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Search, XCircle, CheckCircle, Flag, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Booking } from '../../types';

export function BookingHistory() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(false);
  const [satisfactionId, setSatisfactionId] = useState<string | null>(null);
  const [confirmingAction, setConfirmingAction] = useState<{id: string, type: 'satisfy' | 'issue' | 'cancel'} | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          tutors!inner(profiles!inner(full_name, profile_photo)),
          children!inner(name),
          lesson_packages!inner(package_type, session_hours, session_minutes)
        `)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      setBookings(data || []);
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'PGRST205' || err?.message?.includes('bookings')) {
        setSchemaError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      const { error } = await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', id);
      if (error) throw error;
      await fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking.');
    }
  };

  
  const [complaintModalId, setComplaintModalId] = useState<string | null>(null);
  const [complaintReason, setComplaintReason] = useState("");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const handleFileComplaint = async (bookingId: string) => {
    if (!complaintReason.trim()) {
      alert("Please enter a reason for the complaint.");
      return;
    }
    
    try {
      setSubmittingComplaint(true);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          has_complaint: true,
          complaint_reason: complaintReason,
          complaint_filed_at: new Date().toISOString(),
          complaint_status: 'open'
        })
        .eq('id', bookingId);
            
      if (error) {
        console.error("Supabase Error:", error);
        alert("Database Error: " + error.message);
        throw error;
      }
      
      setComplaintModalId(null);
      setComplaintReason("");
      await fetchBookings();
      alert("Complaint filed successfully. An admin will review it.");
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to file complaint."));
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const today = new Date();

  
  const upcomingBookings = bookings.filter(b => 
    new Date(b.scheduled_at) >= today && 
    (b.status === 'confirmed' || b.status === 'pending_payment') &&
    !b.tutor_marked_completed
  );
  
  const pastBookings = bookings.filter(b => 
    new Date(b.scheduled_at) < today || 
    b.status === 'cancelled' || 
    b.status === 'completed' ||
    b.tutor_marked_completed
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Booking History</h2>
      </div>

      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'upcoming' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Lessons
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>
        <button
          className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'past' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('past')}
        >
          Past Lessons
          {activeTab === 'past' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-t-full" />
          )}
        </button>
      </div>

      
      {schemaError ? (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
          <h3 className="font-bold text-lg mb-2">Database Setup Required</h3>
          <p>The <strong>bookings</strong> table is missing from your database. Please execute the contents of <code>supabase-phase9.sql</code> in your Supabase SQL Editor to view your booking history.</p>
        </div>
      ) : loading ? (

        <div className="text-center p-12 text-slate-500">Loading bookings...</div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {activeTab === 'upcoming' ? 'No upcoming lessons' : 'No past lessons'}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            {activeTab === 'upcoming' 
              ? 'You have no upcoming lessons yet. Browse tutors to book your first lesson.'
              : 'You have no past lesson history.'}
          </p>
          
          {activeTab === 'upcoming' && (
            <Link 
              to="/tutors" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" /> Find a Tutor
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((booking: any) => (
            <div key={booking.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-6">
              <div className="sm:w-1/4">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Date & Time</div>
                <div className="font-bold text-slate-900 mb-1">
                  {new Date(booking.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="text-slate-600 font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-slate-400" />
                  {new Date(booking.scheduled_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="mt-3 flex gap-2 items-center">
                  <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending_payment' ? 'bg-amber-100 text-amber-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                  {booking.tutor_marked_completed && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold uppercase tracking-wider border border-indigo-200">
                      <CheckCircle className="w-3 h-3" />
                      Completed
                    </span>
                  )}
                </div>
              </div>
              
              <div className="sm:w-2/4">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Details</div>
                <div className="flex items-center gap-3 mb-3">
                  {booking.tutors?.profiles?.profile_photo ? (
                    <img src={booking.tutors.profiles.profile_photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                  )}
                  <div>
                    <div className="font-bold text-slate-900">{booking.tutors?.profiles?.full_name}</div>
                    <div className="text-sm text-slate-500">Tutor</div>
                  </div>
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">Student:</span> {booking.children?.name}
                </div>
                <div className="text-sm text-slate-700">
                  <span className="font-semibold">Package:</span> {booking.lesson_packages?.package_type}
                </div>
              </div>
              
              <div className="sm:w-1/4 flex flex-col justify-between sm:items-end">
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Total</div>
                  <div className="font-extrabold text-slate-900 text-lg">
                    {booking.currency === 'NGN' ? '₦' : '$'}{booking.amount}
                  </div>
                </div>
                
                
                
                {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                  confirmingAction?.id === booking.id && confirmingAction.type === 'cancel' ? (
                    <div className="mt-4 sm:mt-0 flex flex-col items-end gap-1">
                      <span className="text-xs text-slate-500 font-semibold">Are you sure?</span>
                      <div className="flex gap-2">
                        <button onClick={() => handleCancel(booking.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">Yes</button>
                        <button onClick={() => setConfirmingAction(null)} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded font-bold">No</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmingAction({id: booking.id, type: 'cancel'})}
                      className="mt-4 sm:mt-0 text-red-600 hover:text-red-700 font-semibold text-sm flex items-center justify-end transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Cancel Booking
                    </button>
                  )
                )}
                
                {booking.tutor_marked_completed && !booking.has_complaint && (
                  <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                    {complaintModalId === booking.id ? (
                      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex flex-col gap-2 shadow-sm">
                        <span className="text-sm text-amber-900 font-bold">File a Complaint</span>
                        <textarea
                          value={complaintReason}
                          onChange={(e) => setComplaintReason(e.target.value)}
                          placeholder="Reason for complaint..."
                          className="w-full text-sm border border-amber-300 rounded p-2 bg-white"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-1">
                          <button 
                            onClick={() => handleFileComplaint(booking.id)} 
                            disabled={submittingComplaint}
                            className="flex-1 text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded-lg font-bold flex justify-center disabled:opacity-50"
                          >
                            {submittingComplaint ? "Submitting..." : "Submit Complaint"}
                          </button>
                          <button 
                            onClick={() => { setComplaintModalId(null); setComplaintReason(""); }} 
                            className="flex-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-2 py-2 rounded-lg font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setComplaintModalId(booking.id)}
                        className="text-red-600 hover:bg-red-50 border border-red-200 font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                      >
                        <Flag className="w-4 h-4" />
                        File a Complaint
                      </button>
                    )}
                  </div>
                )}
                
                {booking.has_complaint && (
                   <div className="mt-4 text-xs font-bold px-3 py-2 bg-amber-50 text-amber-700 rounded-lg border border-amber-200 flex flex-col gap-1">
                     <div className="flex items-center gap-1">
                       <Flag className="w-3 h-3" />
                       Complaint Filed
                     </div>
                     <span className="text-amber-600 font-normal">Status: {booking.complaint_status.replace(/_/g, ' ')}</span>
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
