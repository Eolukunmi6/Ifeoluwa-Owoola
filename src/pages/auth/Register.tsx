import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

export function Register() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    country: '',
    state: '',
    city: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Basic validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.country || !formData.state || !formData.city) {
      setError('All fields are required.');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed, no user returned.');
      
      // If email confirmations are enabled in Supabase, session will be null
      if (!authData.session) {
        throw new Error('Supabase "Confirm Email" is enabled. Please disable it in Supabase Auth settings (Authentication > Providers > Email) for this registration flow to work, or use a Postgres Trigger.');
      }

      // 2. Insert into profiles
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          role: 'parent',
          full_name: formData.fullName,
          email: formData.email,
          country: formData.country,
          state: formData.state,
          city: formData.city
        }
      ]);

      if (profileError) throw profileError;

      // 3. Insert into parents
      const { error: parentError } = await supabase.from('parents').insert([
        { profile_id: authData.user.id }
      ]);

      if (parentError) throw parentError;

      // Success! Refresh profile context and redirect
      await refreshProfile();
      navigate('/dashboard/parent');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-transparent px-4 py-12">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 mt-4">
            <img src="/logo.png" alt="Auralearn Logo" className="h-28 sm:h-36 w-auto object-contain mix-blend-multiply scale-[1.3] sm:scale-[1.4]" />
          </div>
          <h2 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Create an Account</h2>
          <p className="mt-2 text-slate-500 text-[14px]">Join Auralearn as a parent</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Full name</label>
              <input 
                type="text" 
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                placeholder="Jane Doe"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Email address</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                placeholder="you@example.com"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px] pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="mt-2 text-[12px] text-slate-400">Must be at least 8 characters long</p>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Country</label>
              <input 
                type="text" 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                placeholder="United States"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">State/Province</label>
              <input 
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                placeholder="California"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">City</label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
                placeholder="San Francisco"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.39)] disabled:opacity-70 disabled:cursor-not-allowed mt-4"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sky-500 hover:text-sky-600">Log in</Link>
        </div>
      </div>
    </div>
  );
}
