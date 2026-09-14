import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

import { SaveTutorButton } from '../../components/marketplace/SaveTutorButton';

export function TutorProfileView() {
  const { id } = useParams<{ id: string }>();
  const { session, profile: currentUserProfile } = useAuth();
  const navigate = useNavigate();
  
  const [tutor, setTutor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    const fetchTutor = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('tutors')
          .select(`
            id, bio, verified, teaching_age_min, teaching_age_max, currency, certification, experience, introduction_video,
            profiles!inner(id, full_name, profile_photo, country, state, city),
            tutor_subjects(subjects(name)),
            lesson_packages(id, price, active, package_type, session_hours, session_minutes, days_per_week)
          `)
          .eq('id', id)
          .single();
          
        if (fetchError) throw fetchError;
        if (!data) throw new Error('Tutor not found');
        
        // Transform
        const profile: any = data.profiles;
        const subjects = data.tutor_subjects?.map((ts: any) => ts.subjects.name) || [];
        const examinations = []; // Safely default to empty since table doesn't exist yet
        const activePackages = data.lesson_packages?.filter((p: any) => p.active).sort((a: any, b: any) => a.price - b.price) || [];
        
        // Also fetch teaching videos if they exist (handling error if table missing)
        let teaching_videos = [];
        try {
          const { data: vData } = await supabase
            .from('tutor_videos')
            .select('id, title, video_url, description')
            .eq('tutor_id', id);
          if (vData) teaching_videos = vData;
        } catch (e) {
          // Ignore if table missing
        }

        setTutor({
          id: data.id,
          profile_id: profile.id,
          full_name: profile.full_name,
          profile_photo: profile.profile_photo,
          country: profile.country,
          state: profile.state,
          city: profile.city,
          bio: data.bio,
          verified: data.verified,
          teaching_age_min: data.teaching_age_min,
          teaching_age_max: data.teaching_age_max,
          currency: data.currency || 'USD',
          certification: data.certification,
          experience: data.experience,
          introduction_video: data.introduction_video,
          subjects,
          examinations,
          lesson_packages: activePackages,
          teaching_videos
        });
      } catch (err: any) {
        console.error(err);
        setError('Could not load tutor profile. They may not exist or are currently unavailable.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTutor();
  }, [id]);

  const currencySymbols: Record<string, string> = {
    USD: '$', NGN: '₦', GHS: 'GH₵', KES: 'KSh', ZAR: 'R', GBP: '£', EUR: '€'
  };

  const handleBookClick = () => {
    if (!session) {
      setShowAuthPrompt(true);
    } else {
      if (currentUserProfile?.role === 'parent') { navigate(`/book/${id}`); } else { alert('Only parents can book tutors.'); }
    }
  };

  
  const handleDeleteVideo = async (videoId: string, isIntro: boolean = false) => {
    try {
      if (isIntro) {
        const {error} = await supabase.from('tutors').update({ introduction_video: null }).eq('id', id);
        if (error) throw error;
        setTutor({...tutor, introduction_video: null});
      } else {
        const {error} = await supabase.from('tutor_videos').delete().eq('id', videoId);
        if (error) throw error;
        setTutor({...tutor, tutor_videos: tutor.tutor_videos.filter((v: any) => v.id !== videoId)});
      }
    } catch(e:any) {
      alert("Error deleting video: " + e.message);
    } finally {
      setDeletingVideoId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-transparent min-h-screen py-12 px-4 flex justify-center">
        <div className="animate-pulse space-y-8 w-full max-w-4xl">
          <div className="h-64 bg-slate-200 rounded-3xl w-full"></div>
          <div className="h-32 bg-slate-200 rounded-2xl w-full"></div>
          <div className="h-48 bg-slate-200 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="bg-transparent min-h-screen py-20 px-4 text-center flex flex-col items-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Tutor Not Found</h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <Link to="/tutors" className="px-6 py-3 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-colors">
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const symbol = currencySymbols[tutor.currency] || '$';

  return (
    <div className="bg-transparent min-h-screen py-8 md:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link to="/tutors" className="inline-flex items-center text-sm font-semibold text-sky-600 hover:text-sky-700 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Marketplace
        </Link>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200 mb-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img 
              src={tutor.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(tutor.full_name)}&background=0D8ABC&color=fff&size=200`} 
              alt={tutor.full_name} 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-slate-50 shadow-sm shrink-0"
            />
            
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
                    {tutor.full_name}
                    {tutor.verified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-bold uppercase tracking-wider">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </span>
                    )}
                  </h1>
                  <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {[tutor.city, tutor.state, tutor.country].filter(Boolean).join(', ') || 'Location unlisted'}
                  </p>
                </div>
                
                <div className="flex gap-3 w-full md:w-auto">
                  <SaveTutorButton 
                    tutorId={tutor.id} 
                    className="flex items-center justify-center px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm" 
                  />
                  <button 
                    onClick={handleBookClick}
                    className="flex-1 md:flex-none px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-md hover:opacity-90 transition-colors"
                  >
                    Book This Tutor
                  </button>
                </div>
              </div>

              
              <div className="mt-6 flex flex-wrap gap-2">
                {tutor.subjects.map((sub: string) => (
                  <span key={sub} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200">
                    {sub}
                  </span>
                ))}
              </div>
              {tutor.examinations && tutor.examinations.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exam Specializations</p>
                  <div className="flex flex-wrap gap-2">
                    {tutor.examinations.map((exam: string) => (
                      <span key={exam} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold uppercase tracking-wider border border-indigo-100">
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Bio, Intro, Experience */}
          <div className="lg:col-span-2 space-y-8">
            
            {tutor.introduction_video && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Introduction Video</h2>
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900">
                  <video src={tutor.introduction_video} controls className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About Me</h2>
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">{tutor.bio}</p>
              </div>
            </div>

            {(tutor.experience || tutor.certification) && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Qualifications</h2>
                <div className="space-y-6">
                  {tutor.certification && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Certification & Education</h3>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap">{tutor.certification}</p>
                    </div>
                  )}
                  {tutor.experience && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Teaching Experience</h3>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap">{tutor.experience}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tutor.teaching_videos && tutor.teaching_videos.length > 0 && (
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Teaching Examples</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tutor.teaching_videos.map((v: any) => (
                    <div key={v.id} className="group rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                      <div className="aspect-video bg-black relative">
                         <video src={v.video_url} className="w-full h-full object-cover" controls preload="metadata" />
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-slate-900 line-clamp-1">{v.title}</h4>
                        {v.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{v.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar: Lesson Packages */}
          <div className="space-y-6">
            
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Lesson Packages
              </h2>
              
              {tutor.lesson_packages.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No active lesson packages currently available.</p>
              ) : (
                <div className="space-y-4">
                  {tutor.lesson_packages.map((pkg: any) => (
                    <div key={pkg.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {pkg.package_type}
                        </span>
                        <p className="text-lg font-bold text-slate-900">
                          {symbol}{pkg.price.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      
                      <div className="text-sm text-slate-600 font-medium">
                        {pkg.session_hours > 0 && `${pkg.session_hours} hr `}
                        {pkg.session_minutes > 0 && `${pkg.session_minutes} min `}
                        per session
                      </div>
                      
                      {pkg.package_type !== 'Daily' && pkg.days_per_week && (
                        <div className="text-xs text-slate-500 mt-1">
                          {pkg.days_per_week} day{pkg.days_per_week > 1 ? 's' : ''} a week
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 shadow-sm text-white">
               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Student Age Range</h3>
               <p className="text-xl font-bold flex items-center gap-2">
                 <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                 </svg>
                 {tutor.teaching_age_min} - {tutor.teaching_age_max} years old
               </p>
            </div>

          </div>
        </div>
      </div>

      {/* Registration Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button 
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">Join to book</h3>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Create a free parent account to start booking sessions with top educators and managing your child's learning.
            </p>
            <div className="space-y-3">
              <Link to="/register" className="block w-full py-3.5 bg-gradient-to-r from-fuchsia-500 to-violet-500 text-white text-center font-bold rounded-xl shadow-md hover:opacity-90 transition-colors">
                Create Parent Account
              </Link>
              <Link to="/login" className="block w-full py-3.5 bg-slate-50 text-slate-700 text-center font-bold rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                Log In
              </Link>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
