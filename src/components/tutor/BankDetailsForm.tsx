import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Loader2, Landmark, CheckCircle } from 'lucide-react';

export function BankDetailsForm({ onSave }: { onSave?: () => void }) {
  const { session, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    account_name: '',
    account_number: '',
    bank_name: '',
    country: '',
    currency: ''
  });

  const [tutorId, setTutorId] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        if (!profile?.id) return;
        
        const { data: tutor, error: tErr } = await supabase
          .from('tutors')
          .select('id, currency')
          .eq('profile_id', profile.id)
          .single();
          
        if (tErr) throw tErr;
        setTutorId(tutor.id);
        
        // Default currency to the tutor's base currency if not set
        setFormData(prev => ({ ...prev, currency: tutor.currency || 'USD' }));

        const { data: bank, error: bErr } = await supabase
          .from('tutor_bank_details')
          .select('*')
          .eq('tutor_id', tutor.id)
          .maybeSingle();

        if (bErr) throw bErr;
        
        if (bank) {
          setFormData({
            account_name: bank.account_name,
            account_number: bank.account_number,
            bank_name: bank.bank_name,
            country: bank.country,
            currency: bank.currency
          });
        }
      } catch (err: any) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tutorId) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Upsert: check if it exists first to get the ID, or just use an upsert on tutor_id if it's unique
      // Wait, we didn't add a unique constraint on tutor_id. We should find the existing record first.
      const { data: existing } = await supabase
        .from('tutor_bank_details')
        .select('id')
        .eq('tutor_id', tutorId)
        .maybeSingle();
        
      if (existing) {
        const { error } = await supabase
          .from('tutor_bank_details')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tutor_bank_details')
          .insert({
            tutor_id: tutorId,
            ...formData
          });
        if (error) throw error;
      }
      
      setSuccess(true);
      if (onSave) onSave();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save bank details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-slate-100 rounded-2xl w-full"></div>;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Remittance Details</h3>
          <p className="text-sm text-slate-500">Where we should send your earnings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Bank details saved successfully.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Account Name</label>
            <input
              type="text"
              required
              value={formData.account_name}
              onChange={e => setFormData({...formData, account_name: e.target.value})}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="e.g. John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Account Number</label>
            <input
              type="text"
              required
              value={formData.account_number}
              onChange={e => setFormData({...formData, account_number: e.target.value})}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bank Name</label>
            <input
              type="text"
              required
              value={formData.bank_name}
              onChange={e => setFormData({...formData, bank_name: e.target.value})}
              className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Chase, GTBank"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Currency</label>
              <select
                required
                value={formData.currency}
                onChange={e => setFormData({...formData, currency: e.target.value})}
                className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none bg-slate-50 cursor-not-allowed"
                disabled
                title="Your bank currency must match your platform base currency"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="NGN">NGN</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Details
          </button>
        </div>
      </form>
    </div>
  );
}
