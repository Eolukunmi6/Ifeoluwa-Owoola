import React, { useState, useEffect } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import { MyChildrenManager } from '../../components/parent/MyChildrenManager';
import { SavedTutorsManager } from '../../components/parent/SavedTutorsManager';
import { BookingHistory } from '../../components/parent/BookingHistory';
import { Users, Heart, Calendar, LogOut, ChevronRight } from 'lucide-react';

type Tab = 'overview' | 'children' | 'saved' | 'history';

export function ParentDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  
  const [childrenCount, setChildrenCount] = useState<number | null>(null);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  useEffect(() => {
    if (profile?.id) {
      const fetchCounts = async () => {
        try {
          const { count: cCount, error: cErr } = await supabase
            .from('children')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', profile.id);
            
          if (!cErr || cErr.code === 'PGRST205') setChildrenCount(cCount || 0);

          const { count: sCount, error: sErr } = await supabase
            .from('saved_tutors')
            .select('*', { count: 'exact', head: true })
            .eq('parent_id', profile.id);
            
          if (!sErr || sErr.code === 'PGRST205') setSavedCount(sCount || 0);
        } catch (e) {
          console.error(e);
        }
      };
      fetchCounts();
    }
  }, [profile?.id, activeTab]);

  // To fix the "stuck loading" issue for new users, we don't rely on complex joined fetches for the initial render
  
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl">
                  {profile?.full_name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 line-clamp-1">{profile?.full_name}</h2>
                  <p className="text-xs text-slate-500">Parent Account</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" /> Overview
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('children')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'children' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4" /> My Children
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'saved' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Heart className="w-4 h-4" /> Saved Tutors
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4" /> Booking History
                  </div>
                </button>
              </nav>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Parent'}!
                </h1>
                <p className="text-slate-500 mb-8">Manage your children's learning and book lessons.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{childrenCount !== null ? childrenCount : '-'}</div>
                    <div className="text-sm font-medium text-slate-500">Children</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center mb-4">
                      <Heart className="w-5 h-5 text-pink-500" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">{savedCount !== null ? savedCount : '-'}</div>
                    <div className="text-sm font-medium text-slate-500">Saved Tutors</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="text-3xl font-bold text-slate-900 mb-1">0</div>
                    <div className="text-sm font-medium text-slate-500">Upcoming Lessons</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button onClick={() => setActiveTab('children')} className="text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-40">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Manage Children</h3>
                      <p className="text-sm text-slate-500 mt-1">Add or update your children's profiles.</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                      </div>
                    </div>
                  </button>
                  <button onClick={() => setActiveTab('saved')} className="text-left bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between h-40">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Saved Tutors</h3>
                      <p className="text-sm text-slate-500 mt-1">View the tutors you've bookmarked.</p>
                    </div>
                    <div className="flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-pink-50 transition-colors">
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-pink-600" />
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
            
            {activeTab === 'children' && <MyChildrenManager />}
            {activeTab === 'saved' && <SavedTutorsManager />}
            {activeTab === 'history' && <BookingHistory />}
          </div>
        </div>
      </div>
    </div>
  );
}
