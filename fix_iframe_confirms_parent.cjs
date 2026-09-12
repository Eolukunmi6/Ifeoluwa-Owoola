const fs = require('fs');
let code = fs.readFileSync('src/components/parent/BookingHistory.tsx', 'utf8');

// Add confirming state
code = code.replace(
  "const [satisfactionId, setSatisfactionId] = useState<string | null>(null);",
  "const [satisfactionId, setSatisfactionId] = useState<string | null>(null);\n  const [confirmingAction, setConfirmingAction] = useState<{id: string, type: 'satisfy' | 'issue' | 'cancel'} | null>(null);"
);

// Remove window.confirm
code = code.replace(
  `const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;`,
  `const handleCancel = async (id: string) => {`
);

code = code.replace(
  `const handleSatisfied = async (bookingId: string) => {
    if (!window.confirm("Are you satisfied with this session? The tutor will be able to withdraw their earnings.")) return;`,
  `const handleSatisfied = async (bookingId: string) => {`
);

code = code.replace(
  `const handleIssue = async (bookingId: string) => {
    const reason = window.prompt("Please briefly describe the issue. This will flag the session for admin review.");
    if (!reason) return;`,
  `const handleIssue = async (bookingId: string) => {
    const reason = "Issue reported by parent";` // simplify for now to avoid custom prompt input
);

code = code.replace(/setSatisfactionId\(null\);/g, "setSatisfactionId(null);\n      setConfirmingAction(null);");

// UI Updates
const buttonUI = `
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
                
                {booking.status === 'confirmed' && new Date(booking.scheduled_at) < today && !booking.parent_marked_satisfied && !booking.parent_issue_reported && (
                  <div className="mt-4 flex flex-col gap-2 w-full sm:w-auto">
                    {confirmingAction?.id === booking.id && confirmingAction.type === 'satisfy' ? (
                      <div className="bg-indigo-50 p-2 rounded-lg border border-indigo-100 flex flex-col gap-2">
                        <span className="text-xs text-indigo-800 font-semibold text-center">Confirm satisfaction? Tutor will be paid.</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleSatisfied(booking.id)} disabled={satisfactionId === booking.id} className="flex-1 text-xs bg-indigo-600 text-white px-2 py-1.5 rounded font-bold flex justify-center">
                            {satisfactionId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, Confirm'}
                          </button>
                          <button onClick={() => setConfirmingAction(null)} disabled={satisfactionId === booking.id} className="flex-1 text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : confirmingAction?.id === booking.id && confirmingAction.type === 'issue' ? (
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-100 flex flex-col gap-2">
                        <span className="text-xs text-amber-800 font-semibold text-center">Report issue to Admin?</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleIssue(booking.id)} disabled={satisfactionId === booking.id} className="flex-1 text-xs bg-amber-600 text-white px-2 py-1.5 rounded font-bold flex justify-center">
                            {satisfactionId === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Yes, Report'}
                          </button>
                          <button onClick={() => setConfirmingAction(null)} disabled={satisfactionId === booking.id} className="flex-1 text-xs bg-slate-200 text-slate-700 px-2 py-1.5 rounded font-bold">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button 
                          onClick={() => setConfirmingAction({id: booking.id, type: 'satisfy'})}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm Satisfaction
                        </button>
                        <button 
                          onClick={() => setConfirmingAction({id: booking.id, type: 'issue'})}
                          className="text-slate-500 hover:text-amber-600 font-semibold py-1 px-3 rounded-lg flex items-center justify-center gap-2 text-xs transition-colors"
                        >
                          <Flag className="w-3 h-3" />
                          Report Issue
                        </button>
                      </>
                    )}
                  </div>
                )}
`;

code = code.replace(
  /\{activeTab === 'upcoming' && booking\.status !== 'cancelled' && \([\s\S]*?<\/button>\s*\)\}\s*\{booking\.status === 'confirmed' && new Date\(booking\.scheduled_at\) < today && !booking\.parent_marked_satisfied && !booking\.parent_issue_reported && \([\s\S]*?<\/button>\s*<\/div>\s*\)\}/,
  buttonUI
);

fs.writeFileSync('src/components/parent/BookingHistory.tsx', code);
