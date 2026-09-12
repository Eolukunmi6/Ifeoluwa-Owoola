import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, LogIn, Menu, X } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';

export function Navbar() {
  const { session, profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex justify-between items-center h-[72px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              E
            </div>
            <Link to="/" className="font-extrabold text-[24px] text-sky-500 tracking-[-1px] flex items-center gap-2">
              EduMatics
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6 text-[14px] font-medium text-slate-500">
            <Link to="/tutors" className="hover:text-sky-500 transition-colors">
              Find Tutors
            </Link>
            <Link to="/subjects" className="hover:text-sky-500 transition-colors">
              Subjects
            </Link>
            <Link to="/how-it-works" className="hover:text-sky-500 transition-colors">
              How It Works
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {session ? (
              <>
                {profile && (
                  <Link to={`/dashboard/${profile.role}`} className="text-slate-900 font-semibold text-[14px] px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="px-5 py-2.5 rounded-xl text-sky-500 bg-sky-50 font-semibold text-[14px] hover:bg-sky-100 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/tutor/register" className="bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-semibold text-[14px] px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm">
                  Register as Tutor
                </Link>
                <Link
                  to="/login"
                  className="text-slate-900 font-semibold text-[14px] px-3 py-2.5 hover:text-sky-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold text-[14px] hover:opacity-90 transition-all shadow-sm"
                >
                  Create Parent Account
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-slate-900 p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4 flex flex-col">
              <Link to="/tutors" className="text-slate-600 font-semibold py-2 px-3 hover:bg-slate-50 rounded-lg">
                Find Tutors
              </Link>
              <Link to="/subjects" className="text-slate-600 font-semibold py-2 px-3 hover:bg-slate-50 rounded-lg">
                Subjects
              </Link>
              <Link to="/how-it-works" className="text-slate-600 font-semibold py-2 px-3 hover:bg-slate-50 rounded-lg">
                How It Works
              </Link>
              
              <div className="h-px bg-slate-100 my-2" />

              {session ? (
                <>
                  {profile && (
                    <Link to={`/dashboard/${profile.role}`} className="text-sky-600 font-bold py-2 px-3 hover:bg-sky-50 rounded-lg">
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="text-left text-red-600 font-semibold py-2 px-3 hover:bg-red-50 rounded-lg"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/tutor/register" className="bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-bold py-3 px-4 rounded-xl text-center mt-2 shadow-sm">
                    Register as Tutor
                  </Link>
                  <Link to="/login" className="text-slate-900 font-bold py-2 px-3 hover:bg-slate-50 rounded-lg">
                    Login
                  </Link>
                  <Link to="/register" className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-4 rounded-xl text-center mt-2 shadow-sm">
                    Create Parent Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
