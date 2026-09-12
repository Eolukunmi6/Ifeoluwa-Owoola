const fs = require('fs');
let code = fs.readFileSync('src/components/parent/BookingHistory.tsx', 'utf8');

// Imports
code = code.replace(
  "import { Calendar, Clock, Search, XCircle } from 'lucide-react';",
  "import { Calendar, Clock, Search, XCircle, CheckCircle, Flag, Loader2 } from 'lucide-react';"
);

// State
code = code.replace(
  "const [schemaError, setSchemaError] = useState(false);",
  `const [schemaError, setSchemaError] = useState(false);\n  const [satisfactionId, setSatisfactionId] = useState<string | null>(null);`
);

// Handler
const handleSatisfied = `
  const handleSatisfied = async (bookingId: string) => {
    if (!window.confirm("Are you satisfied with this session? The tutor will be able to withdraw their earnings.")) return;
    try {
      setSatisfactionId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          parent_marked_satisfied: true,
          parent_satisfied_at: new Date().toISOString()
        })
        .eq('id', bookingId);
      if (error) throw error;
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert("Failed to mark as satisfied.");
    } finally {
      setSatisfactionId(null);
    }
  };

  const handleIssue = async (bookingId: string) => {
    const reason = window.prompt("Please briefly describe the issue. This will flag the session for admin review.");
    if (!reason) return;
    try {
      setSatisfactionId(bookingId);
      const { error } = await supabase
        .from('bookings')
        .update({ 
          parent_issue_reported: true,
          parent_issue_details: reason
        })
        .eq('id', bookingId);
      if (error) throw error;
      fetchBookings();
      alert("Issue reported successfully. The admin will review it.");
    } catch (err) {
      console.error(err);
      alert("Failed to report issue.");
    } finally {
      setSatisfactionId(null);
    }
  };

  const today = new Date();
`;

code = code.replace("const today = new Date();", handleSatisfied);


// UI
const buttonUI = `
                {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                  <button 
                    onClick={() => handleCancel(booking.id)}
                    className="mt-4 sm:mt-0 text-red-600 hover:text-red-700 font-semibold text-sm flex items-center justify-end transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Cancel Booking
                  </button>
                )}
                
                {booking.status === 'confirmed' && new Date(booking.scheduled_at) < today && !booking.parent_marked_satisfied && !booking.parent_issue_reported && (
                  <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleSatisfied(booking.id)}
                      disabled={satisfactionId === booking.id}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                    >
                      {satisfactionId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Confirm Satisfaction
                    </button>
                    <button 
                      onClick={() => handleIssue(booking.id)}
                      disabled={satisfactionId === booking.id}
                      className="text-slate-500 hover:text-amber-600 font-semibold py-1 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                    >
                      <Flag className="w-3 h-3" />
                      Report Issue
                    </button>
                  </div>
                )}
                
                {booking.parent_marked_satisfied && (
                   <div className="mt-4 text-xs font-bold px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200 inline-flex items-center justify-center gap-1">
                     <CheckCircle className="w-3 h-3" />
                     Satisfied
                   </div>
                )}
                {booking.parent_issue_reported && (
                   <div className="mt-4 text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded border border-amber-200 inline-flex items-center justify-center gap-1">
                     <Flag className="w-3 h-3" />
                     Issue Reported
                   </div>
                )}
`;

code = code.replace(
  /\{activeTab === 'upcoming' && booking\.status !== 'cancelled' && \(\s*<button \s*onClick=\{\(\) => handleCancel\(booking\.id\)\}\s*className="mt-4 sm:mt-0 text-red-600 hover:text-red-700 font-semibold text-sm flex items-center justify-end transition-colors"\s*>\s*<XCircle className="w-4 h-4 mr-1" \/> Cancel Booking\s*<\/button>\s*\)\}/,
  buttonUI
);

// We need to also adjust the schema in DB for parent_issue_reported
fs.writeFileSync('src/components/parent/BookingHistory.tsx', code);
