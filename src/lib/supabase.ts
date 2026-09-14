import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.error('Missing Supabase environment variables! VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set.');
  
  if (typeof document !== 'undefined') {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;padding:20px;z-index:99999;text-align:center;font-family:sans-serif;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
    errorDiv.innerHTML = `
      <h3 style="margin:0 0 10px 0;font-size:18px;font-weight:bold;">Configuration Error</h3>
      <p style="margin:0;">Missing <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> environment variables.</p>
      <p style="margin:10px 0 0 0;font-size:14px;">If you are deploying on Vercel, go to <strong>Settings &gt; Environment Variables</strong>, add both keys, and trigger a new deployment.</p>
    `;
    // Wait for DOM to be ready
    if (document.body) {
      document.body.prepend(errorDiv);
    } else {
      document.addEventListener('DOMContentLoaded', () => document.body.prepend(errorDiv));
    }
  }
}

// We export the client.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});
