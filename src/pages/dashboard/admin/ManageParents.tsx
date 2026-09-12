import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2 } from 'lucide-react';

export function ManageParents() {
  const [parents, setParents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const fetchParents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*, children(id), bookings(id)')
      .eq('role', 'parent');
    
    if (error && error.message.includes('active')) {
      const { data: fallbackData } = await supabase.from('profiles').select('*, children(id), bookings(id)').eq('role', 'parent');
      if (fallbackData) setParents(fallbackData.map(p => ({...p, active: true})));
    } else if (!error && data) {
      setParents(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchParents();
  }, []);

  const toggleActive = async (profileId: string, currentStatus: boolean) => {
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
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Parents</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Name / Email</th>
              <th className="px-6 py-4">Children</th>
              <th className="px-6 py-4">Bookings</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {parents.map(p => {
              const isActive = p.active ?? true;
              return (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{p.full_name}</p>
                    <p className="text-slate-500">{p.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{p.children?.length || 0}</td>
                  <td className="px-6 py-4 text-slate-600">{p.bookings?.length || 0}</td>
                  <td className="px-6 py-4 text-center">
                    {isActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Blocked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
{confirmingId === p.id ? (
                      <div className="flex justify-end gap-2">
                        <button onClick={() => toggleActive(p.id, isActive)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white">Confirm</button>
                        <button onClick={() => setConfirmingId(null)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700">Cancel</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmingId(p.id)}
                        disabled={processingId === p.id}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                          isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        {isActive ? 'Block' : 'Unblock'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {parents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No parents found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
