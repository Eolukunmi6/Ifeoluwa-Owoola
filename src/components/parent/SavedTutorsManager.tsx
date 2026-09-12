import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { SavedTutor } from '../../types';
import { Link } from 'react-router-dom';
import { Heart, HeartOff, Star } from 'lucide-react';

export function SavedTutorsManager() {
  const { profile } = useAuth();
  const [savedTutors, setSavedTutors] = useState<SavedTutor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedTutors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('saved_tutors')
        .select(`
          *,
          tutor_profiles:tutor_id(*),
          profiles:tutor_id(*)
        `)
        .eq('parent_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error && error.code !== 'PGRST205') throw error;
      setSavedTutors(data || []);
    } catch (err) {
      console.error('Error fetching saved tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.id) fetchSavedTutors();
  }, [profile?.id]);

  const handleUnsave = async (tutorId: string) => {
    try {
      // Optimistic update
      setSavedTutors(savedTutors.filter(st => st.tutor_id !== tutorId));
      
      await supabase
        .from('saved_tutors')
        .delete()
        .match({ parent_id: profile?.id, tutor_id: tutorId });
    } catch (err) {
      console.error('Error unsaving tutor:', err);
      // Revert on error
      fetchSavedTutors();
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading saved tutors...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-6">Saved Tutors</h2>
      
      {savedTutors.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-pink-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">You haven't saved any tutors yet</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Browse the marketplace to find and save tutors you're interested in.
          </p>
          <Link 
            to="/tutors" 
            className="inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Browse Tutors
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTutors.map((st) => (
            <div key={st.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              <div className="p-5 flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                  {st.profiles?.profile_photo ? (
                    <img src={st.profiles.profile_photo} alt={st.profiles.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-400">
                      {st.profiles?.full_name?.charAt(0) || 'T'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{st.profiles?.full_name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-medium text-sm">New</span>
                  </div>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-1">{st.tutor_profiles?.bio || 'Tutor'}</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 mt-auto flex gap-3">
                <Link 
                  to={`/tutor/${st.tutor_id}`}
                  className="flex-1 px-4 py-2 bg-white border border-slate-200 text-center text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  View Profile
                </Link>
                <button
                  onClick={() => handleUnsave(st.tutor_id)}
                  className="px-4 py-2 border border-slate-200 text-slate-400 bg-white rounded-xl hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                  title="Unsave Tutor"
                >
                  <HeartOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
