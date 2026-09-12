import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Loader2, AlertCircle } from 'lucide-react';

export function ManageSettings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    platform_fee_percent: 0,
    tax_percent: 0
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase.from('platform_settings').select('*').single();
      if (!error && data) {
        setSettings(data);
        setFormData({
          platform_fee_percent: data.platform_fee_percent,
          tax_percent: data.tax_percent
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    
    const { error } = await supabase
      .from('platform_settings')
      .update({
        platform_fee_percent: formData.platform_fee_percent,
        tax_percent: formData.tax_percent
      })
      .eq('id', settings.id);
      
    if (error) {
      alert("Failed to save settings: " + error.message);
    } else {
      alert("Settings updated successfully!");
    }
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-sky-500" /></div>;

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Platform Settings</h2>
      
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-8">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> Changing these percentages will only affect <em>future</em> transactions. Past transactions will retain the rates applied at the time of purchase.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Platform Fee (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            value={formData.platform_fee_percent}
            onChange={(e) => setFormData({...formData, platform_fee_percent: parseFloat(e.target.value) || 0})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-900 mb-2">Tax Rate (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            required
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
            value={formData.tax_percent}
            onChange={(e) => setFormData({...formData, tax_percent: parseFloat(e.target.value) || 0})}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-sky-500 text-white font-bold rounded-xl hover:bg-sky-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
