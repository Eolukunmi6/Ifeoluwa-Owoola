const fs = require('fs');
let code = fs.readFileSync('src/components/parent/MyChildrenManager.tsx', 'utf8');

if (!code.includes('const [deletingId, setDeletingId]')) {
  code = code.replace(
    'const [editingId, setEditingId] = useState<string | null>(null);',
    'const [editingId, setEditingId] = useState<string | null>(null);\n  const [deletingId, setDeletingId] = useState<string | null>(null);'
  );
  
  code = code.replace(
    `const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this child?')) return;

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      
      setChildren(children.filter(c => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };`,
    `const handleDelete = async (id: string) => {
    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (deleteError) {
        alert("Database Error: " + deleteError.message);
        throw deleteError;
      }
      
      setChildren(children.filter(c => c.id !== id));
      alert("Child removed successfully.");
    } catch (err: any) {
      setError(err.message);
      alert("Error: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };`
  );

  code = code.replace(
    `<button
                      onClick={() => handleDelete(child.id)}
                      className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>`,
    `{deletingId === child.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(child.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Yes, delete</button>
                        <button onClick={() => setDeletingId(null)} className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(child.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}`
  );

  fs.writeFileSync('src/components/parent/MyChildrenManager.tsx', code);
}
