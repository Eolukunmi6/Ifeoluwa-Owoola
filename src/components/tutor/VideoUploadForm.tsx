import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';
import { Subject, TutorVideo } from '../../types';

interface VideoUploadFormProps {
  tutorId: string;
  subjects: Subject[];
  videoToEdit?: TutorVideo | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function VideoUploadForm({ tutorId, subjects, videoToEdit, onSuccess, onCancel }: VideoUploadFormProps) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(videoToEdit?.title || '');
  const [description, setDescription] = useState(videoToEdit?.description || '');
  const [subjectId, setSubjectId] = useState(videoToEdit?.subject_id || (subjects.length > 0 ? subjects[0].id : ''));
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }
    if (!videoToEdit && !file) {
      setError('Please select a video file to upload.');
      return;
    }
    if (file && !file.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }
    if (file && file.size > 100 * 1024 * 1024) {
      setError('Video must be smaller than 100MB.');
      return;
    }

    try {
      setUploading(true);
      let videoUrl = videoToEdit?.video_url || '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const userId = session?.user.id;
        if (!userId) throw new Error('User not authenticated');

        const fileName = `${userId}/teaching_${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('tutor-videos')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('tutor-videos').getPublicUrl(fileName);
        if (!data?.publicUrl) throw new Error('Failed to get public URL for video.');
        videoUrl = data.publicUrl;
      }

      if (videoToEdit) {
        // Update existing record
        const { error: dbError } = await supabase
          .from('tutor_videos')
          .update({
            title,
            description,
            subject_id: subjectId,
            ...(file ? { video_url: videoUrl } : {})
          })
          .eq('id', videoToEdit.id);

        if (dbError) throw dbError;
      } else {
        // Insert new record
        const { error: dbError } = await supabase
          .from('tutor_videos')
          .insert({
            tutor_id: tutorId,
            subject_id: subjectId,
            title,
            description,
            video_url: videoUrl
          });

        if (dbError) throw dbError;
      }

      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{videoToEdit ? 'Edit Video' : 'Upload New Teaching Video'}</h3>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
            placeholder="e.g. Introduction to Fractions"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Subject *</label>
          <select
            value={subjectId}
            onChange={e => setSubjectId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Description</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm resize-none"
            placeholder="What will students learn in this video?"
          />
        </div>

        <div>
          <label className="block text-[12px] font-bold text-slate-500 uppercase mb-2 tracking-wide">Video File {videoToEdit ? '(Leave blank to keep existing)' : '*'}</label>
          <input
            type="file"
            accept="video/*"
            onChange={e => setFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all outline-none text-slate-900 text-sm"
          />
          <p className="text-xs text-slate-500 mt-2">Max file size: 100MB.</p>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 transition-colors disabled:opacity-50"
          >
            {uploading ? 'Saving...' : 'Save Video'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={uploading}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
