const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');

code = code.replace(
  `const handleMarkCompleted = async (bookingId: string) => {
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
    } catch (err: any) {
      console.error(err);
      alert("Error: " + (err.message || "Failed to mark as completed."));
    } finally {
      setMarkingId(null);
      setConfirmingId(null);
    }
  };`,
  `const handleMarkCompleted = async (bookingId: string) => {
    try {
      setMarkingId(bookingId);
      const { data, error } = await supabase
        .from('bookings')
        .update({ 
          tutor_marked_completed: true,
          tutor_completed_at: new Date().toISOString()
        })
        .eq('id', bookingId)
        .select();
        
      if (error) {
        console.error("Supabase Error:", error);
        alert("Database Error: " + error.message);
        throw error;
      }
      
      console.log("Updated booking:", data);
      alert("Success! Marked as completed.");
      
      await fetchBookings();
    } catch (err: any) {
      console.error("Catch Error:", err);
      alert("Error: " + (err.message || "Failed to mark as completed."));
    } finally {
      setMarkingId(null);
      setConfirmingId(null);
    }
  };`
);

fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', code);
