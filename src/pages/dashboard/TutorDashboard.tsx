import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { supabase } from '../../lib/supabase';
import { TutorProfile, Subject } from '../../types';

import { TeachingVideosManager } from '../../components/tutor/TeachingVideosManager';
import { IntroductionVideoManager } from '../../components/tutor/IntroductionVideoManager';
import { LessonPackagesManager } from '../../components/tutor/LessonPackagesManager';
import { AvailabilityManager } from '../../components/tutor/AvailabilityManager';
import { TutorBookingsManager } from '../../components/tutor/TutorBookingsManager';
import { TutorEarnings } from './tutor/TutorEarnings';
import { DashboardQuickStats } from '../../components/tutor/DashboardQuickStats';

export function TutorDashboard() {
  const { profile, signOut, session } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);
  const [tutorData, setTutorData] = useState<TutorProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [startingPrice, setStartingPrice] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'pricing' | 'availability' | 'bookings' | 'earnings'>('profile');

  useEffect(() => {
    const fetchTutorInfo = async () => {
      if (!session?.user.id) return;
      
      try {
        const { data: tData, error: tError } = await supabase
          .from('tutors')
          .select('*')
          .eq('profile_id', session.user.id)
          .maybeSingle();
          
        if (tError) throw tError;
        setTutorData(tData);

        if (tData) {
          const { data: tsData } = await supabase
            .from('tutor_subjects')
            .select('subjects(*)')
            .eq('tutor_id', tData.id);
            
          if (tsData) {
            setSubjects(tsData.map((ts: any) => ts.subjects).filter(Boolean));
          }

          const { data: lpData } = await supabase
            .from('lesson_packages')
            .select('price')
            .eq('tutor_id', tData.id)
            .eq('active', true)
            .order('price', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (lpData) {
            setStartingPrice(lpData.price);
          }
        }
      } catch (err: any) {
        console.error('Error fetching tutor dashboard data:', err);
        if (err.code === 'PGRST205') {
          setDbError('Database tables are missing. Please run the SQL setup script in your Supabase SQL Editor.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTutorInfo();
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex justify-center py-20">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isProfileComplete = tutorData?.bio && subjects.length > 0;

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Welcome, {profile?.full_name || 'Tutor'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your tutoring profile and availability.
            </p>
          </div>
          <button
            onClick={signOut}
            className="mt-4 sm:mt-0 px-5 py-2.5 border border-slate-200 font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            Sign Out
          </button>
        </div>

        
        <DashboardQuickStats />
        
        {dbError && (

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col items-center text-center">
             <div className="text-red-500 mb-2">
               <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
             </div>
             <h2 className="text-lg font-bold text-red-900">Database Setup Incomplete</h2>
             <p className="text-red-700 text-sm mt-1">{dbError}</p>
          </div>
        )}

        {/* Profile Completion Prompt OR Dashboard Content */}
        {!dbError && (!isProfileComplete ? (
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-sky-900 mb-2">Complete Your Profile</h2>
            <p className="text-sky-800 text-sm mb-6 max-w-md mx-auto">
              You need to add a bio and select your teaching subjects before parents can find you in the marketplace.
            </p>
            <button
              onClick={() => navigate('/dashboard/tutor/profile')}
              className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-colors"
            >
              Set Up Profile
            </button>
          </div>
        ) : (
          <div>
            <div className="flex border-b border-slate-200 mb-6">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Profile Preview
              </button>
              <button
                onClick={() => setActiveTab('videos')}
                className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'videos' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Videos
              </button>
              <button
                onClick={() => setActiveTab('pricing')}
                className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'pricing' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Pricing
              </button>
              <button
                onClick={() => setActiveTab('availability')}
                className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'availability' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Availability
              </button>
            
              <button
                onClick={() => setActiveTab('bookings')}
                className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'bookings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${activeTab === 'earnings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Earnings
              </button>
            </div>

            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02)] border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-900">Profile Preview</h2>
                  <button
                    onClick={() => navigate('/dashboard/tutor/profile')}
                    className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                    {profile?.profile_photo ? (
                      <img src={profile.profile_photo} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">No Photo</div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-slate-900">{profile?.full_name}</h3>
                      <p className="text-slate-500 text-sm mt-1">
                        {[profile?.city, profile?.state, profile?.country].filter(Boolean).join(', ') || 'Location not set'}
                        {tutorData?.experience ? ` • ${tutorData.experience} years experience` : ''}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Subjects</h4>
                      <div className="flex flex-wrap gap-2">
                        {subjects.map(sub => (
                          <span key={sub.id} className="px-3 py-1 bg-sky-50 text-sky-700 rounded-full text-xs font-semibold border border-sky-100">
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio</h4>
                      <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                        {tutorData?.bio}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Certification</h4>
                        <p className="text-sm font-medium text-slate-900">{tutorData?.certification || 'Not specified'}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teaching Age Range</h4>
                        <p className="text-sm font-medium text-slate-900">
                          {(tutorData?.teaching_age_min || tutorData?.teaching_age_max) 
                            ? `${tutorData?.teaching_age_min || '?'} to ${tutorData?.teaching_age_max || '?'} years old` 
                            : 'Not specified'}
                        </p>
                      </div>
                      {startingPrice !== null && (
                        <div className="col-span-2 mt-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Starting Price</h4>
                          <p className="text-lg font-bold text-sky-600">
                            {tutorData?.currency === 'USD' ? '$' : 
                             tutorData?.currency === 'NGN' ? '₦' : 
                             tutorData?.currency === 'GHS' ? 'GH₵' : 
                             tutorData?.currency === 'KES' ? 'KSh' : 
                             tutorData?.currency === 'ZAR' ? 'R' : 
                             tutorData?.currency === 'GBP' ? '£' : 
                             tutorData?.currency === 'EUR' ? '€' : 
                             tutorData?.currency ? tutorData.currency + ' ' : '$'}
                            {startingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'videos' && tutorData && session?.user.id && (
              <div>
                <IntroductionVideoManager 
                  tutorProfile={tutorData} 
                  onUpdate={(videoUrl) => setTutorData({ ...tutorData, introduction_video: videoUrl })}
                />
                <TeachingVideosManager tutorId={tutorData.id} subjects={subjects} />
              </div>
            )}

            {activeTab === 'pricing' && tutorData && (
              <LessonPackagesManager 
                tutorProfile={tutorData} 
                onCurrencyUpdate={(currency) => setTutorData({ ...tutorData, currency })}
              />
            )}

            {activeTab === 'availability' && tutorData && (
              <AvailabilityManager tutorId={tutorData.id} />
            )}

            
            {activeTab === 'earnings' && tutorData && (
              <TutorEarnings />
            )}

            {activeTab === 'bookings' && tutorData && (
              <TutorBookingsManager tutorId={tutorData.id} />
            )}
          </div>

        ))}
      </div>
    </div>
  );
}

