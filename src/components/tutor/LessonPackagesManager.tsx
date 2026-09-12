import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { LessonPackage, TutorProfile } from '../../types';

interface LessonPackagesManagerProps {
  tutorProfile: TutorProfile;
  onCurrencyUpdate: (currency: string) => void;
}

const PACKAGE_TYPES = ['Daily', 'Weekly', 'Monthly', '3-Month'];
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' }
];

export function LessonPackagesManager({ tutorProfile, onCurrencyUpdate }: LessonPackagesManagerProps) {
  const [packages, setPackages] = useState<LessonPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [packageType, setPackageType] = useState<string>(PACKAGE_TYPES[0]);
  const [sessionHours, setSessionHours] = useState<number>(1);
  const [sessionMinutes, setSessionMinutes] = useState<number>(0);
  const [daysPerWeek, setDaysPerWeek] = useState<number>(1);
  const [price, setPrice] = useState<string>('');
  const [currency, setCurrency] = useState<string>(tutorProfile.currency || 'USD');
  
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('lesson_packages')
        .select('*')
        .eq('tutor_id', tutorProfile.id)
        .order('created_at', { ascending: true });

      if (fetchError) {
        if (fetchError.code === 'PGRST205') {
          console.warn("lesson_packages table not found yet");
        } else {
          throw fetchError;
        }
      } else if (data) {
        setPackages(data as LessonPackage[]);
      }
    } catch (err: any) {
      console.error('Error fetching lesson packages:', err);
      setError('Failed to load lesson packages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [tutorProfile.id]);

  useEffect(() => {
    if (tutorProfile.currency) {
      setCurrency(tutorProfile.currency);
    }
  }, [tutorProfile.currency]);

  const handleEdit = (pkg: LessonPackage) => {
    setEditingId(pkg.id);
    setPackageType(pkg.package_type);
    setSessionHours(pkg.session_hours);
    setSessionMinutes(pkg.session_minutes);
    setDaysPerWeek(pkg.days_per_week || 1);
    setPrice(pkg.price.toString());
    setShowForm(true);
    setError(null);
  };

  const resetForm = () => {
    setEditingId(null);
    setPackageType(PACKAGE_TYPES[0]);
    setSessionHours(1);
    setSessionMinutes(0);
    setDaysPerWeek(1);
    setPrice('');
    setShowForm(false);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError('Price must be greater than 0.');
      return;
    }

    if (sessionHours < 0 || sessionMinutes < 0 || (sessionHours === 0 && sessionMinutes === 0)) {
      setError('Session length must be greater than 0.');
      return;
    }

    // Check for duplicates
    if (!editingId && packages.some(p => p.package_type === packageType && p.session_hours === sessionHours && p.session_minutes === sessionMinutes)) {
      setError('You already have a package of this type and length.');
      return;
    }

    try {
      setSaving(true);
      
      // Update currency globally if changed
      if (currency !== tutorProfile.currency) {
        const { error: profileError } = await supabase
          .from('tutors')
          .update({ currency })
          .eq('id', tutorProfile.id);
          
        if (profileError) throw profileError;
        onCurrencyUpdate(currency);
      }

      if (editingId) {
        const { error: dbError } = await supabase
          .from('lesson_packages')
          .update({ 
            package_type: packageType,
            session_hours: sessionHours,
            session_minutes: sessionMinutes,
            days_per_week: packageType !== 'Daily' ? daysPerWeek : null,
            price: numPrice 
          })
          .eq('id', editingId);
        
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase
          .from('lesson_packages')
          .insert({
            tutor_id: tutorProfile.id,
            package_type: packageType,
            session_hours: sessionHours,
            session_minutes: sessionMinutes,
            days_per_week: packageType !== 'Daily' ? daysPerWeek : null,
            price: numPrice,
            active: true
          });
        
        if (dbError) {
          if (dbError.code === '23505') {
            throw new Error('You already have a package of this type and length.');
          }
          throw dbError;
        }
      }
      
      resetForm();
      fetchPackages();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to save lesson package.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error: dbError } = await supabase
        .from('lesson_packages')
        .delete()
        .eq('id', id);
        
      if (dbError) {
        alert("Database Error: " + dbError.message);
        throw dbError;
      }
      
      setPackages(packages.filter(p => p.id !== id));
      alert("Package deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete package.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      setPackages(packages.map(p => p.id === id ? { ...p, active: !currentStatus } : p));
      
      const { error: dbError } = await supabase
        .from('lesson_packages')
        .update({ active: !currentStatus })
        .eq('id', id);
        
      if (dbError) throw dbError;
    } catch (err: any) {
      console.error(err);
      alert('Failed to update package status.');
      fetchPackages();
    }
  };

  const currentCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  const formatSessionLength = (hours: number, minutes: number) => {
    const parts = [];
    if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
    if (minutes > 0) parts.push(`${minutes} min`);
    return parts.join(' ') || '0 min';
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-slate-100 rounded-2xl w-full"></div>;
  }

  const maxReached = packages.length >= 5;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Lesson Packages</h2>
          <p className="text-sm text-slate-500">Set your package types, durations, and pricing ({packages.length}/5 used).</p>
        </div>
      </div>

      {error && !showForm && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4">{editingId ? 'Edit Package' : 'New Package'}</h3>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Package Type *</label>
                <select
                  value={packageType}
                  onChange={e => setPackageType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
                >
                  {PACKAGE_TYPES.map(pt => (
                    <option key={pt} value={pt}>{pt}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Currency *</label>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.code} ({c.symbol}) - {c.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Applies to all your packages.</p>
              </div>
            </div>
            
            <div className={`grid grid-cols-1 md:grid-cols-${packageType !== 'Daily' ? '4' : '3'} gap-4`}>
              {packageType !== 'Daily' && (
                <div>
                  <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Days Per Week *</label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    required
                    value={daysPerWeek}
                    onChange={e => setDaysPerWeek(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
                  />
                </div>
              )}
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Session Hours</label>
                <input
                  type="number"
                  min="0"
                  max="24"
                  value={sessionHours}
                  onChange={e => setSessionHours(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Session Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={sessionMinutes}
                  onChange={e => setSessionMinutes(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Price *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    {CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
                  </span>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
                    placeholder="e.g. 5000"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Package'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && packages.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No lesson packages</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            Set up your first package to allow students to book sessions with you.
          </p>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 transition-colors"
          >
            Add Lesson Package
          </button>
        </div>
      )}

      {!showForm && packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {packages.map(pkg => (
            <div key={pkg.id} className={`bg-white border rounded-2xl p-5 shadow-sm transition-all flex flex-col ${pkg.active ? 'border-slate-200' : 'border-slate-200 opacity-60'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {pkg.package_type}
                </span>
                <div className="flex items-center">
                  <span className="text-xs font-semibold text-slate-500 mr-2">{pkg.active ? 'Active' : 'Inactive'}</span>
                  <button 
                    onClick={() => handleToggleActive(pkg.id, pkg.active)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pkg.active ? 'bg-sky-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pkg.active ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="font-bold text-lg text-slate-900 mt-1">
                  {currentCurrency.symbol}{pkg.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {formatSessionLength(pkg.session_hours, pkg.session_minutes)} per session
                  {pkg.package_type !== 'Daily' && pkg.days_per_week ? ` • ${pkg.days_per_week} day${pkg.days_per_week > 1 ? 's' : ''}/week` : ''}
                </p>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                >
                  Edit
                </button>
                {deletingId === pkg.id ? (
                  <div className="flex-1 flex gap-1">
                    <button onClick={() => handleDelete(pkg.id)} className="flex-1 px-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg">Yes</button>
                    <button onClick={() => setDeletingId(null)} className="flex-1 px-1 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(pkg.id)}
                    className="flex-1 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!showForm && packages.length > 0 && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          {maxReached ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm p-4 rounded-xl font-medium text-center">
              You've reached the maximum of 5 lesson packages. Edit or delete one to add a new one.
            </div>
          ) : (
            <div className="text-center">
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition-colors"
              >
                + Add More Package
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
