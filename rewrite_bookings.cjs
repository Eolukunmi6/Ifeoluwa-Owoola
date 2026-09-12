const fs = require('fs');

const content = `import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, FileText, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Booking } from '../../types';

export function TutorBookingsManager({ tutorId }: { tutorId: string }) {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [schemaError, setSchemaError] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select(\`
          *,
          profiles!inner(full_name, profile_photo),
          children!inner(name),
          lesson_packages!inner(package_type, session_hours, session_minutes),
          payments(tutor_amount)
        \`)
        .eq('tutor_id', tutorId)
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
    if (tutorId) fetchBookings();
  }, [tutorId]);

  const handleMarkCompleted = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to mark this session as completed?")) return;
    
    try {
      setMarkingId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          tutor_marked_completed: true,
          tutor_completed_at: new Date().toISOString()
        })
        .eq('id', bookingId);
        
      if (error) throw error;
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as completed.");
    } finally {
      setMarkingId(null);
    }
  };

  const today = new Date();
  
  const upcomingBookings = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'pending_payment') && 
    (!b.tutor_marked_completed) && 
    b.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(b => 
    b.tutor_marked_completed || b.status === 'cancelled' || b.status === 'completed'
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div>
      <div className="flex gap-4 border-b border-slate-200 mb-6">
        <button
          className={\`pb-3 font-medium text-sm transition-colors relative \${activeTab === 'upcoming' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}\`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming / Action Required
          {activeTab === 'upcoming' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full" />
          )}
        </button>
        <button
          className={\`pb-3 font-medium text-sm transition-colors relative \${activeTab === 'past' ? 'text-sky-600' : 'text-slate-500 hover:text-slate-700'}\`}
          onClick={() => setActiveTab('past')}
        >
          Past Sessions
          {activeTab === 'past' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-600 rounded-t-full" />
          )}
        </button>
      </div>
      
      {schemaError ? (
        <div className="mb-6 p-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-medium">
          <h3 className="font-bold text-lg mb-2">Database Setup Required</h3>
          <p>The <strong>bookings</strong> table is missing from your database. Please ask the administrator to execute the <code>supabase-phase9.sql</code> script in the Supabase SQL Editor.</p>
        </div>
      ) : loading ? (
        <div className="text-center p-12 text-slate-500">Loading bookings...</div>
      ) : displayedBookings.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {activeTab === 'upcoming' ? 'No sessions require action' : 'No past sessions'}
          </h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {activeTab === 'upcoming' 
              ? 'When parents book lessons with you, they will appear here.'
              : 'You have no past session history.'}
          </p>
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
                <div className="mt-3">
                  <span className={\`inline-flex px-2 py-1 rounded text-xs font-bold uppercase tracking-wider \${
                    booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                    booking.status === 'pending_payment' ? 'bg-amber-100 text-amber-700' :
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }\`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="sm:w-3/4 flex flex-col sm:flex-row gap-6 justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Parent & Student</div>
                  <div className="flex items-center gap-3 mb-3">
                    {booking.profiles?.profile_photo ? (
                      <img src={booking.profiles.profile_photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{booking.profiles?.full_name}</div>
                      <div className="text-sm text-slate-500">Parent</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">Student:</span> {booking.children?.name}
                  </div>
                </div>
                
                <div className="sm:text-right">
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Package Details</div>
                  <div className="flex items-center sm:justify-end gap-1.5 text-slate-700 font-semibold mb-1">
                    <FileText className="w-4 h-4 text-slate-400" />
                    {booking.lesson_packages?.package_type}
                  </div>
                  <div className="text-sm text-slate-500">
                    {booking.lesson_packages?.session_hours ? \`\${booking.lesson_packages.session_hours} hr \` : ''}
                    {booking.lesson_packages?.session_minutes ? \`\${booking.lesson_packages.session_minutes} min\` : ''}
                  </div>
                  
                  <div className="mt-3">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {booking.status === 'confirmed' ? 'Net Earnings' : 'Gross Amount'}
                    </span>
                    <div className="font-extrabold text-slate-900 text-lg">
                      {booking.currency === 'NGN' ? '₦' : '$'}
                      {booking.status === 'confirmed' ? (booking.payments?.[0]?.tutor_amount || booking.amount * 0.88) : booking.amount}
                    </div>
                    
                    {booking.status === 'confirmed' && !booking.tutor_marked_completed && new Date(booking.scheduled_at) < today && (
                      <button 
                        onClick={() => handleMarkCompleted(booking.id)}
                        disabled={markingId === booking.id}
                        className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                      >
                        {markingId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Mark as Completed
                      </button>
                    )}
                    
                    {booking.tutor_marked_completed && (
                      <div className="mt-3 text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 inline-flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Tutor Completed
                      </div>
                    )}
                    {!booking.parent_marked_satisfied && booking.tutor_marked_completed && (
                      <div className="mt-1 text-[10px] text-slate-500 font-medium">Pending parent approval</div>
                    )}
                    {booking.parent_marked_satisfied && (
                      <div className="mt-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 inline-flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Parent Approved
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;
fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', content);
