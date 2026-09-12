const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');

// Add confirmingId state
code = code.replace(
  "const [markingId, setMarkingId] = useState<string | null>(null);",
  "const [markingId, setMarkingId] = useState<string | null>(null);\n  const [confirmingId, setConfirmingId] = useState<string | null>(null);"
);

// Remove window.confirm from handler
code = code.replace(
  `const handleMarkCompleted = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to mark this session as completed?")) return;`,
  `const handleMarkCompleted = async (bookingId: string) => {`
);
code = code.replace(
  `setMarkingId(null);
    }
  };`,
  `setMarkingId(null);
      setConfirmingId(null);
    }
  };`
);

// Update UI
const buttonUI = `
                    {booking.status === 'confirmed' && !booking.tutor_marked_completed && new Date(booking.scheduled_at) < today && (
                      confirmingId === booking.id ? (
                        <div className="mt-3 w-full bg-slate-50 border border-slate-200 p-2 rounded-lg flex flex-col gap-2">
                          <span className="text-xs text-slate-600 font-semibold text-center">Are you sure?</span>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleMarkCompleted(booking.id)}
                              disabled={markingId === booking.id}
                              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 text-xs transition-colors"
                            >
                              {markingId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, Complete'}
                            </button>
                            <button 
                              onClick={() => setConfirmingId(null)}
                              disabled={markingId === booking.id}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-1.5 px-2 rounded flex items-center justify-center text-xs transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmingId(booking.id)}
                          className="mt-3 w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Mark as Completed
                        </button>
                      )
                    )}
`;

code = code.replace(
  /\{booking\.status === 'confirmed' && !booking\.tutor_marked_completed && new Date\(booking\.scheduled_at\) < today && \([\s\S]*?<\/button>\s*\)\}/,
  buttonUI
);

fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', code);
