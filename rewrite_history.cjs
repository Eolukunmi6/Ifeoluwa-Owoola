const fs = require('fs');

let code = fs.readFileSync('src/components/parent/BookingHistory.tsx', 'utf8');

const oldHandleSatisfied = code.substring(code.indexOf('const handleSatisfied ='), code.indexOf('const handleIssue ='));
const newHandleSatisfied = `const handleSatisfied = async (bookingId: string) => {
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
  };
  
  `;

code = code.replace(oldHandleSatisfied, newHandleSatisfied);
fs.writeFileSync('src/components/parent/BookingHistory.tsx', code);
