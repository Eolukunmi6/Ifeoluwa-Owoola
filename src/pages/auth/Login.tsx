import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

export function Login() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned from login.');

      // Wait a moment for auth state listener to potentially fire, or forcefully fetch profile
      await refreshProfile();

      // Fetch the role explicitly to route correctly
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('Could not find user profile.');
      }

      // Redirect based on role
      if (profileData.role === 'tutor') {
        navigate('/dashboard/tutor');
      } else if (profileData.role === 'parent') {
        navigate('/dashboard/parent');
      } else if (profileData.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/');
      }

    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-transparent px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 mt-4">
            <img src="/logo.png" alt="Auralearn Logo" className="h-28 sm:h-36 w-auto object-contain mix-blend-multiply scale-[1.3] sm:scale-[1.4]" />
          </div>
          <h2 className="text-[24px] font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-slate-500 text-[14px]">Log in to your Auralearn account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Email address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-[14px]"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="block text-[12px] font-bold text-slate-500 uppercase tracking-wide">Password</label>
              <Link to="/forgot-password" className="text-[12px] font-semibold text-sky-500 hover:text-sky-600">Forgot password?</Link>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 py-3.5 rounded-xl font-black tracking-wide hover:opacity-90 transition-all shadow-[0_4px_14px_0_rgba(251,191,36,0.39)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-sky-500 hover:text-sky-600">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
