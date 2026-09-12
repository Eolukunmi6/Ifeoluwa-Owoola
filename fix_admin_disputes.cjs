const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/admin/ManageBookings.tsx', 'utf8');

const handleResolveStr = `  const handleResolveDispute = async (id: string, newResponse: 'satisfied' | 'pending') => {
    try {
      setProcessingId(id);
      const { error } = await supabase
        .from('bookings')
        .update({ parent_response: newResponse })
        .eq('id', id);
      if (error) throw error;
      await fetchBookings();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return`;

code = code.replace(/  if \(loading\) return/, handleResolveStr);

const actionStr = `{(b.status === 'pending_payment' || b.status === 'pending') && (`;
const replaceStr = `{b.parent_response === 'not_satisfied' && (
                    <div className="flex justify-end gap-2 mb-2">
                      <button
                        onClick={() => handleResolveDispute(b.id, 'satisfied')}
                        disabled={processingId === b.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        title="Force approve for tutor"
                      >
                        Force Approve
                      </button>
                      <button
                        onClick={() => handleResolveDispute(b.id, 'pending')}
                        disabled={processingId === b.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        title="Reset to pending"
                      >
                        Reset Pending
                      </button>
                    </div>
                  )}
                  {(b.status === 'pending_payment' || b.status === 'pending') && (`;

code = code.replace(actionStr, replaceStr);

fs.writeFileSync('src/pages/dashboard/admin/ManageBookings.tsx', code);
