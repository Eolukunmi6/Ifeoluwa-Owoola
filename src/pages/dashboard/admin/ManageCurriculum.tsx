import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, Plus, Edit2, Trash2 } from 'lucide-react';

export function ManageCurriculum() {
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<any[]>([]);

  // Simple state for newly added items
  const [newSubject, setNewSubject] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newExamName, setNewExamName] = useState('');
  const [newExamCountryId, setNewExamCountryId] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const [subRes, curRes, exRes] = await Promise.all([
      supabase.from('subjects').select('*').order('name'),
      supabase.from('countries').select('*').order('name'),
      supabase.from('examinations').select('*, countries(name)').order('name')
    ]);
    if (subRes.data) setSubjects(subRes.data);
    if (curRes.data) {
      setCountries(curRes.data);
      if (curRes.data.length > 0) setNewExamCountryId(curRes.data[0].id);
    }
    if (exRes.data) setExaminations(exRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    await supabase.from('subjects').insert({ name: newSubject, active: true });
    setNewSubject('');
    fetchData();
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry.trim()) return;
    await supabase.from('countries').insert({ name: newCountry, active: true });
    setNewCountry('');
    fetchData();
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamName.trim() || !newExamCountryId) return;
    await supabase.from('examinations').insert({ name: newExamName, country_id: newExamCountryId, active: true });
    setNewExamName('');
    fetchData();
  };

  const toggleActive = async (table: string, id: string, current: boolean) => {
    if (!window.confirm(`Are you sure you want to ${current ? 'deactivate' : 'activate'} this item?`)) return;
    await supabase.from(table).update({ active: !current }).eq('id', id);
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Countries</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="New Country Name"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200"
            value={newCountry}
            onChange={e => setNewCountry(e.target.value)}
          />
          <button onClick={handleAddCountry} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {countries.map(c => (
            <div key={c.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
              <span className={`font-semibold ${!c.active && 'text-slate-400 line-through'}`}>{c.name}</span>
              {confirmingId === c.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => toggleActive('countries', c.id, c.active)} className="px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-2 py-1 text-xs font-semibold rounded bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(c.id)}
                          disabled={processingId === c.id}
                          className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${c.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                        >
                          {c.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Examinations</h2>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <select 
            className="px-4 py-2 rounded-xl border border-slate-200"
            value={newExamCountryId}
            onChange={e => setNewExamCountryId(e.target.value)}
          >
            {countries.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="New Examination Name"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200"
            value={newExamName}
            onChange={e => setNewExamName(e.target.value)}
          />
          <button onClick={handleAddExam} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {examinations.map(ex => (
            <div key={ex.id} className="p-4 border border-slate-200 rounded-xl flex flex-col justify-between items-start bg-slate-50 gap-2">
              <div>
                <span className={`font-semibold ${!ex.active && 'text-slate-400 line-through'}`}>{ex.name}</span>
                <p className="text-xs text-slate-500">{ex.countries?.name}</p>
              </div>
              <button onClick={() => toggleActive('examinations', ex.id, ex.active)} className="text-xs font-bold text-sky-600 hover:text-sky-800 self-end">
                {ex.active ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Subjects</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="New Subject Name"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200"
            value={newSubject}
            onChange={e => setNewSubject(e.target.value)}
          />
          <button onClick={handleAddSubject} className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {subjects.map(s => (
            <div key={s.id} className="p-4 border border-slate-200 rounded-xl flex justify-between items-center bg-slate-50">
              <span className={`font-semibold ${!s.active && 'text-slate-400 line-through'}`}>{s.name}</span>
              <button onClick={() => toggleActive('subjects', s.id, s.active)} className="text-xs font-bold text-sky-600 hover:text-sky-800">
                {s.active ? 'Hide' : 'Show'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
