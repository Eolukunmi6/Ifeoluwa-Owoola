import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Heart } from 'lucide-react';

interface SaveTutorButtonProps {
  tutorId: string;
  className?: string;
  iconOnly?: boolean;
}

export function SaveTutorButton({ tutorId, className = '', iconOnly = false }: SaveTutorButtonProps) {
  const { profile } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.role === 'parent' && profile.id) {
      checkSavedStatus();
    } else {
      setLoading(false);
    }
  }, [profile, tutorId]);

  const checkSavedStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_tutors')
        .select('id')
        .match({ parent_id: profile?.id, tutor_id: tutorId })
        .maybeSingle();

      if (error && error.code !== 'PGRST205') {
        console.error('Error checking saved status:', error);
      }
      setIsSaved(!!data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!profile || profile.role !== 'parent') return;

    const currentStatus = isSaved;
    // Optimistic UI update
    setIsSaved(!currentStatus);

    try {
      if (currentStatus) {
        // Unsave
        await supabase
          .from('saved_tutors')
          .delete()
          .match({ parent_id: profile.id, tutor_id: tutorId });
      } else {
        // Save
        await supabase
          .from('saved_tutors')
          .insert({ parent_id: profile.id, tutor_id: tutorId });
      }
    } catch (err) {
      console.error('Error toggling saved tutor:', err);
      // Revert on error
      setIsSaved(currentStatus);
    }
  };

  if (!profile || profile.role !== 'parent') return null;
  if (loading) return null;

  return (
    <button
      onClick={toggleSave}
      className={`transition-colors ${className} ${
        isSaved 
          ? 'text-pink-500 hover:text-pink-600' 
          : 'text-slate-400 hover:text-pink-500'
      }`}
      title={isSaved ? "Unsave Tutor" : "Save Tutor"}
    >
      <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
      {!iconOnly && (
        <span className="ml-2 font-medium">{isSaved ? 'Saved' : 'Save'}</span>
      )}
    </button>
  );
}
