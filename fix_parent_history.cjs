const fs = require('fs');
let code = fs.readFileSync('src/components/parent/BookingHistory.tsx', 'utf8');

code = code.replace(/parent_marked_satisfied: true/g, "parent_response: 'satisfied'");
code = code.replace(/parent_marked_satisfied/g, 'parent_response');

// Add handleNotSatisfied
const handleSatisfiedStr = `  const handleSatisfied = async (bookingId: string) => {`;
const handleNotSatisfiedStr = `  const handleNotSatisfied = async (bookingId: string) => {
    try {
      setSatisfactionId(bookingId + '-not');
      const { error } = await supabase
        .from('bookings')
        .update({ 
          parent_response: 'not_satisfied',
          parent_satisfied_at: new Date().toISOString()
        })
        .eq('id', bookingId);
            
      if (error) {
        console.error("Supabase Error:", error);
        alert("Database Error: " + error.message);
        throw error;
      }
      
      await fetchBookings();
    } catch (err) {
      alert('Failed to update satisfaction.');
    } finally {
      setSatisfactionId(null);
    }
  };

  const handleSatisfied = async (bookingId: string) => {`;

code = code.replace(handleSatisfiedStr, handleNotSatisfiedStr);

// UI logic
// Before: !booking.parent_response && !booking.parent_issue_reported
// Now: booking.tutor_marked_completed && booking.parent_response === 'pending'
code = code.replace(
  /\{booking\.status === 'confirmed' && new Date\(booking\.scheduled_at\) < today && !booking\.parent_response && !booking\.parent_issue_reported && \(/g,
  "{booking.status === 'confirmed' && booking.tutor_marked_completed && booking.parent_response === 'pending' && ("
);

// We need to add the Not Satisfied button
code = code.replace(
  /\{satisfactionId === booking\.id \? 'Updating\.\.\.' : 'Confirm Satisfaction'\}\s*<\/button>/,
  `{satisfactionId === booking.id ? 'Updating...' : 'Confirm Satisfaction'}
                    </button>
                    <button 
                      onClick={() => handleNotSatisfied(booking.id)}
                      disabled={satisfactionId !== null}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors border border-rose-200"
                    >
                      {satisfactionId === booking.id + '-not' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                      Not Satisfied
                    </button>`
);

// Fix the parent approved label logic
code = code.replace(
  /\{booking\.parent_response && \(\s*<div className="mt-4 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 inline-flex items-center justify-center gap-1 w-fit">\s*<CheckCircle className="w-4 h-4" \/>\s*Satisfaction Confirmed\s*<\/div>\s*\)\}/,
  `{booking.parent_response === 'satisfied' && (
                  <div className="mt-4 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 inline-flex items-center justify-center gap-1 w-fit">
                    <CheckCircle className="w-4 h-4" />
                    Satisfaction Confirmed
                  </div>
                )}
                {booking.parent_response === 'not_satisfied' && (
                  <div className="mt-4 text-xs font-bold px-2 py-1 bg-rose-50 text-rose-700 rounded border border-rose-200 inline-flex items-center justify-center gap-1 w-fit">
                    <XCircle className="w-4 h-4" />
                    Marked Not Satisfied
                  </div>
                )}
                {!booking.tutor_marked_completed && new Date(booking.scheduled_at) < today && booking.status === 'confirmed' && (
                   <div className="mt-4 text-xs font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-200 inline-flex items-center justify-center w-fit">
                     Awaiting Tutor Completion
                   </div>
                )}`
);

fs.writeFileSync('src/components/parent/BookingHistory.tsx', code);
