import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Shield, ShieldOff, Ban, CheckCircle, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ManageTutors() {
  const [tutors, setTutors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<{id: string, action: string} | null>(null);
  const [editingBioId, setEditingBioId] = useState<string | null>(null);
  const [bioInput, setBioInput] = useState("");

  const fetchTutors = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tutors')
      .select('*, profiles!tutors_profile_id_fkey(full_name, email, country, active)');
    
    if (error && error.message.includes('active')) {
      const { data: fallbackData } = await supabase.from('tutors').select('*, profiles!tutors_profile_id_fkey(full_name, email, country)');
      if (fallbackData) setTutors(fallbackData.map(t => ({...t, profiles: {...t.profiles, active: true}})));
    } else if (!error && data) {
      setTutors(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTutors();
  }, []);

  
  const handleSaveBio = async (tutorId: string) => {
    try {
      setProcessingId(tutorId);
      const { error } = await supabase.from('tutors').update({ bio: bioInput }).eq('id', tutorId);
      if (error) throw error;
      await fetchTutors();
      setEditingBioId(null);
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };

  const toggleVerified = async (tutorId: string, currentStatus: boolean) => {
    try {
      setProcessingId(tutorId);
      const { error } = await supabase.from('tutors').update({ verified: !currentStatus }).eq('id', tutorId);
      if (error) throw error;
      await fetchTutors();
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };

  const toggleActive = async (profileId: string, currentStatus: boolean) => {
    try {
      setProcessingId(profileId);
      const { error } = await supabase.from('profiles').update({ active: !currentStatus }).eq('id', profileId);
      if (error) throw error;
      await fetchTutors();
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Manage Tutors</h2>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
            <tr>
              <th className="px-6 py-4">Name / Email</th>
              <th className="px-6 py-4">Location</th>
              <th className="px-6 py-4 text-center">Verified</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tutors.map(t => {
              const profileActive = t.profiles?.active ?? true;
              return (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{t.profiles?.full_name}</p>
                    <p className="text-slate-500">{t.profiles?.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{t.profiles?.country || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">
                    {t.verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                        Unverified
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {profileActive ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Active</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700">Blocked</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <Link to={`/tutors/${t.id}`} target="_blank" className="px-3 py-1.5 text-xs font-bold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors inline-flex items-center gap-1">View <ExternalLink className="w-3 h-3" /></Link>
                    {confirmingId?.id === t.id && confirmingId?.action === 'verify' ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => toggleVerified(t.id, t.verified)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId({id: t.id, action: 'verify'})}
                          disabled={processingId === t.id}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          {t.verified ? 'Remove Badge' : 'Verify Badge'}
                        </button>
                      )}
                    {editingBioId === t.id ? (
                        <div className="flex flex-col gap-1 mt-2">
                          <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} className="w-full text-xs p-1 border rounded" rows={3}></textarea>
                          <div className="flex gap-1">
                            <button onClick={() => handleSaveBio(t.id)} className="flex-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded">Save</button>
                            <button onClick={() => setEditingBioId(null)} className="flex-1 px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingBioId(t.id); setBioInput(t.bio || ''); }}
                          disabled={processingId === t.id}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          Edit Bio
                        </button>
                      )}
                    <button
                      onClick={() => toggleActive(t.profile_id, profileActive)}
                      disabled={processingId === t.profile_id}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 ${
                        profileActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {profileActive ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              );
            })}
            {tutors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No tutors found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
