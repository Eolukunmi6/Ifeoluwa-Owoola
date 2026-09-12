const fs = require('fs');
let code = fs.readFileSync('src/components/parent/BookingHistory.tsx', 'utf8');

// We will simplify the UI to a direct click with inline loading state, 
// no two-step confirmation (to avoid state complexity), and explicit success/error toasts.

code = code.replace(
  `const handleSatisfied = async (bookingId: string) => {
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
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Failed to mark as satisfied."));
    } finally {
      setSatisfactionId(null);
      setConfirmingAction(null);
    }
  };`,
  `const handleSatisfied = async (bookingId: string) => {
    try {
      setSatisfactionId(bookingId);
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          parent_marked_satisfied: true,
          parent_satisfied_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select();
        
      if (error) {
        console.error("Supabase Error:", error);
        alert("Database Error: " + error.message);
        throw error;
      }
      
      console.log("Updated booking:", data);
      alert("Success! The session has been marked as satisfied.");
      
      await fetchBookings();
    } catch (err: any) {
      console.error("Catch Error:", err);
      alert("Error: " + (err.message || "Failed to mark as satisfied."));
    } finally {
      setSatisfactionId(null);
      setConfirmingAction(null);
    }
  };`
);

// Remove the two-step confirmation for satisfy to reduce surface area for bugs
const buttonUI = `
                {booking.status === 'confirmed' && new Date(booking.scheduled_at) < today && !booking.parent_marked_satisfied && !booking.parent_issue_reported && (
                  <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => handleSatisfied(booking.id)}
                      disabled={satisfactionId === booking.id}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors disabled:opacity-70"
                    >
                      {satisfactionId === booking.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      {satisfactionId === booking.id ? 'Updating...' : 'Confirm Satisfaction'}
                    </button>
                    
                    {confirmingAction?.id === booking.id && confirmingAction.type === 'issue' ? (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 flex flex-col gap-2">
                        <span className="text-xs text-amber-800 font-semibold text-center">Report issue to Admin?</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleIssue(booking.id)} className="flex-1 text-xs bg-amber-600 text-white px-2 py-1.5 rounded font-bold flex justify-center">
                            Yes, Report
                          </button>
                          <button onClick={() => setConfirmingAction(null)} className="flex-1 text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmingAction({id: booking.id, type: 'issue'})}
                        className="text-slate-500 hover:text-amber-600 font-semibold py-1 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                      >
                        <Flag className="w-3 h-3" />
                        Report Issue
                      </button>
                    )}
                  </div>
                )}
`;

code = code.replace(
  /\{booking\.status === 'confirmed' && new Date\(booking\.scheduled_at\) < today && !booking\.parent_marked_satisfied && !booking\.parent_issue_reported && \([\s\S]*?<\/button>\s*<\/div>\s*\)\}/,
  buttonUI
);

fs.writeFileSync('src/components/parent/BookingHistory.tsx', code);
