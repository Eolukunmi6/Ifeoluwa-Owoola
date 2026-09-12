const fs = require('fs');

let code = fs.readFileSync('src/pages/dashboard/admin/ManageParents.tsx', 'utf8');

if (code.includes('window.confirm')) {
  code = code.replace(
    'const [processingId, setProcessingId] = useState<string | null>(null);',
    'const [processingId, setProcessingId] = useState<string | null>(null);\n  const [confirmingId, setConfirmingId] = useState<string | null>(null);'
  );
  
  code = code.replace(
    `if (!window.confirm(\`Are you sure you want to \${currentStatus ? 'block' : 'unblock'} this parent?\`)) return;`,
    ''
  );
  
  code = code.replace(
    `const toggleActive = async (profileId: string, currentStatus: boolean) => {
    const check = await supabase.from('profiles').update({active: true}).eq('id', '00000000-0000-0000-0000-000000000000');
    if (check.error && check.error.message.includes('active')) {
      alert("The 'active' column does not exist yet. Please run supabase-phase12.sql in your Supabase SQL Editor.");
      return;
    }
    
    setProcessingId(profileId);
    await supabase.from('profiles').update({ active: !currentStatus }).eq('id', profileId);
    await fetchParents();
    setProcessingId(null);
  };`,
    `const toggleActive = async (profileId: string, currentStatus: boolean) => {
    try {
      setProcessingId(profileId);
      const { error } = await supabase.from('profiles').update({ active: !currentStatus }).eq('id', profileId);
      if (error) throw error;
      await fetchParents();
    } catch (err: any) {
      console.error(err);
      alert("Error: " + err.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };`
  );
  
  code = code.replace(
    `                    <button
                      onClick={() => toggleActive(p.id, isActive)}
                      disabled={processingId === p.id}
                      className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 \${
                        isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }\`}
                    >
                      {isActive ? 'Block' : 'Unblock'}
                    </button>`,
    `{confirmingId === p.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleActive(p.id, isActive)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white">Confirm</button>
                        <button onClick={() => setConfirmingId(null)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(p.id)}
                        disabled={processingId === p.id}
                        className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 \${
                          isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }\`}
                      >
                        {isActive ? 'Block' : 'Unblock'}
                      </button>
                    )}`
  );
  
  fs.writeFileSync('src/pages/dashboard/admin/ManageParents.tsx', code);
}
