import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';

interface ProtectedRouteProps {
  allowedRoles?: ('tutor' | 'parent' | 'admin')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, profile, loading, refreshProfile } = useAuth();
  const location = useLocation();
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let timer: any;
    if (allowedRoles && !profile && !loading && session) {
      timer = setTimeout(() => {
        if (retryCount < 4) {
          refreshProfile().then(() => setRetryCount(c => c + 1));
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [allowedRoles, profile, loading, session, retryCount, refreshProfile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to home if user does not have the required role
    return <Navigate to="/" replace />;
  }

  // Check if profile is missing entirely (meaning registration failed mid-way)
  // But wait, if they literally just registered and are waiting for the profile fetch, we don't want to boot them.
  // Actually, wait: we shouldn't show a blank page. If profile is missing but session exists, maybe the role is unknown.
  // We'll let them through if no specific roles are required, or block if required.
  if (allowedRoles && !profile) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
           {retryCount >= 4 ? (
             <>
               <h3 className="text-lg font-bold text-red-600 mb-2">Profile Not Found</h3>
               <p className="text-slate-500 text-sm mb-6">
                 We couldn't load your profile. If you just registered, the setup might have been interrupted.
               </p>
               <button 
                 onClick={() => window.location.href = '/tutor/register'} 
                 className="w-full px-4 py-3 bg-sky-500 text-white rounded-xl font-bold hover:bg-sky-600 transition-colors shadow-sm"
               >
                 Return to Registration
               </button>
             </>
           ) : (
             <>
               <h3 className="text-lg font-bold text-slate-900 mb-2">Setting up your profile...</h3>
               <p className="text-slate-500 text-sm">Please wait a moment while we prepare your dashboard.</p>
               <div className="mt-6 flex justify-center">
                 <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
               </div>
             </>
           )}
        </div>
      </div>
    );
  }

  return <Outlet />;
}
