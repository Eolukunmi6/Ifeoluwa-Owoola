import React, { useState, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { TutorProfile } from '../../types';

interface IntroductionVideoManagerProps {
  tutorProfile: TutorProfile;
  onUpdate: (videoUrl: string | null) => void;
}

export function IntroductionVideoManager({ tutorProfile, onUpdate }: IntroductionVideoManagerProps) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file.');
      }

      // Validate file size (e.g. max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('Video must be smaller than 50MB.');
      }

      setUploading(true);

      // Validate duration (max 5 minutes)
      const duration = await getVideoDuration(file);
      if (duration > 300) {
        throw new Error('Introduction video cannot be longer than 5 minutes.');
      }

      // Upload to Storage
      const fileExt = file.name.split('.').pop();
      const userId = session?.user.id;
      if (!userId) throw new Error('User not authenticated');

      const fileName = `${userId}/intro_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('tutor-videos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('tutor-videos').getPublicUrl(fileName);
      
      if (!data?.publicUrl) {
        throw new Error('Failed to get public URL for video.');
      }

      // Update Tutor profile
      const { error: dbError } = await supabase
        .from('tutors')
        .update({ introduction_video: data.publicUrl })
        .eq('id', tutorProfile.id);

      if (dbError) throw dbError;

      onUpdate(data.publicUrl);
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your introduction video?')) return;
    
    try {
      setError(null);
      setUploading(true);

      const { error: dbError } = await supabase
        .from('tutors')
        .update({ introduction_video: null })
        .eq('id', tutorProfile.id);

      if (dbError) throw dbError;

      onUpdate(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during deletion.');
    } finally {
      setUploading(false);
    }
  };

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => {
        reject(new Error('Failed to load video metadata.'));
      };
      video.src = window.URL.createObjectURL(file);
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
      <h2 className="text-lg font-bold text-slate-900 mb-2">Introduction Video</h2>
      <p className="text-sm text-slate-500 mb-6">
        Introduce yourself or demonstrate how you teach (optional). Max 5 minutes, 50MB.
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {tutorProfile.introduction_video ? (
        <div className="space-y-4">
          <div className="aspect-video w-full max-w-2xl bg-black rounded-xl overflow-hidden border border-slate-200">
            <video 
              src={tutorProfile.introduction_video} 
              controls 
              className="w-full h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="flex gap-4">
            <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-slate-200 font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm text-sm">
              {uploading ? 'Uploading...' : 'Replace Video'}
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={uploading}
                ref={fileInputRef}
                className="hidden"
              />
            </label>
            {deleting ? (
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={uploading} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-xl text-sm">Yes, delete</button>
                <button onClick={() => setDeleting(false)} disabled={uploading} className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setDeleting(true)}
                disabled={uploading}
                className="px-4 py-2 border border-red-200 text-red-600 font-semibold rounded-xl bg-white hover:bg-red-50 transition-colors shadow-sm text-sm disabled:opacity-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-slate-200 font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm text-sm">
            {uploading ? 'Uploading...' : 'Upload Video'}
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              disabled={uploading}
              ref={fileInputRef}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}
