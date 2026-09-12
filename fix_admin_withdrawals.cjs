const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/admin/ManageWithdrawals.tsx', 'utf8');

if (code.includes('window.confirm')) {
  code = code.replace(
    'const [processingId, setProcessingId] = useState<string | null>(null);',
    'const [processingId, setProcessingId] = useState<string | null>(null);\n  const [confirmingId, setConfirmingId] = useState<{id: string, action: string} | null>(null);'
  );
  
  code = code.replace(
    `const updateStatus = async (id: string, status: 'paid' | 'failed') => {
    if (!window.confirm(\`Are you sure you want to mark this withdrawal as \${status.toUpperCase()}?\`)) return;
    
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ 
          status, 
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
            
      if (error) throw error;
      await fetchWithdrawals();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };`,
    `const updateStatus = async (id: string, status: 'paid' | 'failed') => {
    setProcessingId(id);
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ 
          status, 
          processed_at: new Date().toISOString()
        })
        .eq('id', id);
            
      if (error) throw error;
      alert("Status updated successfully.");
      await fetchWithdrawals();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };`
  );
  
  code = code.replace(
    `<button
                            onClick={() => updateStatus(w.id, 'paid')}
                            disabled={processingId === w.id}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-xs"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => updateStatus(w.id, 'failed')}
                            disabled={processingId === w.id}
                            className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1 px-3 rounded text-xs"
                          >
                            Mark Failed
                          </button>`,
    `{confirmingId?.id === w.id ? (
                          <div className="flex flex-col gap-1 w-24">
                            <button onClick={() => updateStatus(w.id, confirmingId.action as 'paid'|'failed')} className="bg-emerald-600 text-white font-bold py-1 px-3 rounded text-xs">Confirm</button>
                            <button onClick={() => setConfirmingId(null)} className="bg-slate-200 text-slate-700 font-bold py-1 px-3 rounded text-xs">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => setConfirmingId({id: w.id, action: 'paid'})}
                              disabled={processingId === w.id}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => setConfirmingId({id: w.id, action: 'failed'})}
                              disabled={processingId === w.id}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-1 px-3 rounded text-xs"
                            >
                              Mark Failed
                            </button>
                          </>
                        )}`
  );
  
  fs.writeFileSync('src/pages/dashboard/admin/ManageWithdrawals.tsx', code);
}
