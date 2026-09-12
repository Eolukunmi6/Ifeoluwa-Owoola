const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');

// Add CheckCircle import
code = code.replace(
  "import { Calendar, Clock, User, FileText } from 'lucide-react';",
  "import { Calendar, Clock, User, FileText, CheckCircle, Loader2 } from 'lucide-react';"
);

// Add state for marking
code = code.replace(
  "const [schemaError, setSchemaError] = useState(false);",
  `const [schemaError, setSchemaError] = useState(false);\n  const [markingId, setMarkingId] = useState<string | null>(null);`
);

// Add handleMarkCompleted function
const handleMarkCompleted = `
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
`;

code = code.replace("const today = new Date();", handleMarkCompleted);

// Update filter logic
code = code.replace(
  "const upcomingBookings = bookings.filter(b => \n    (b.status === 'confirmed' || b.status === 'pending_payment') && new Date(b.scheduled_at) >= today\n  );",
  `const upcomingBookings = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'pending_payment') && 
    (!b.tutor_marked_completed) && 
    b.status !== 'cancelled'
  );`
);

code = code.replace(
  "const pastBookings = bookings.filter(b => \n    new Date(b.scheduled_at) < today || b.status === 'cancelled' || b.status === 'completed'\n  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());",
  `const pastBookings = bookings.filter(b => 
    b.tutor_marked_completed || b.status === 'cancelled' || b.status === 'completed'
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());`
);

// Add UI for the button
const buttonUI = `
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
                      <div className="mt-3 text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Tutor Completed
                      </div>
                    )}
                    {!booking.parent_marked_satisfied && booking.tutor_marked_completed && (
                      <div className="mt-1 text-[10px] text-slate-500 font-medium">Pending parent approval</div>
                    )}
                    {booking.parent_marked_satisfied && (
                      <div className="mt-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Parent Approved
                      </div>
                    )}
                  </div>
`;

code = code.replace(
  /<div className="mt-3">\s*<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">\s*{booking\.status === 'confirmed' \? 'Net Earnings' : 'Gross Amount'}\s*<\/span>\s*<div className="font-extrabold text-slate-900 text-lg">\s*{booking\.currency === 'NGN' \? '₦' : '\$'}\s*{booking\.status === 'confirmed' \? \(booking\.payments\?\.\[0\]\?\.tutor_amount \|\| booking\.amount \* 0\.88\) : booking\.amount}\s*<\/div>\s*<\/div>/,
  buttonUI
);


fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', code);
