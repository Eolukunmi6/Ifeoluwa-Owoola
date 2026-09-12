import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Subject, TutorVideo } from '../../types';
import { VideoUploadForm } from './VideoUploadForm';

interface TeachingVideosManagerProps {
  tutorId: string;
  subjects: Subject[];
}

export function TeachingVideosManager({ tutorId, subjects }: TeachingVideosManagerProps) {
  const [videos, setVideos] = useState<TutorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<TutorVideo | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('tutor_videos')
        .select(`
          *,
          subjects (*)
        `)
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        if (fetchError.code === 'PGRST205') {
           console.warn("tutor_videos table not found yet");
        } else {
           throw fetchError;
        }
      } else if (data) {
        setVideos(data as unknown as TutorVideo[]);
      }
    } catch (err: any) {
      console.error('Error fetching teaching videos:', err);
      setError('Failed to load teaching videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [tutorId]);

  const handleDelete = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('tutor_videos')
        .delete()
        .eq('id', videoId);
        
      if (deleteError) throw deleteError;
      
      setVideos(videos.filter(v => v.id !== videoId));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete video.');
    }
  };

  const handleEdit = (video: TutorVideo) => {
    setEditingVideo(video);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingVideo(null);
    fetchVideos();
  };

  if (loading) {
    return <div className="animate-pulse h-32 bg-slate-100 rounded-2xl w-full"></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Teaching Videos</h2>
          <p className="text-sm text-slate-500">Upload sample lessons or educational content.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setEditingVideo(null); setShowForm(true); }}
            className="px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-xl shadow-sm hover:bg-slate-800 transition-colors"
          >
            + Upload Video
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl font-medium">
          {error}
        </div>
      )}

      {showForm && (
        <VideoUploadForm
          tutorId={tutorId}
          subjects={subjects}
          videoToEdit={editingVideo}
          onSuccess={handleSuccess}
          onCancel={() => { setShowForm(false); setEditingVideo(null); }}
        />
      )}

      {!showForm && videos.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 mb-4 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No videos yet</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm">
            Upload your first teaching video to show parents your teaching style and expertise.
          </p>
          <button
            onClick={() => { setEditingVideo(null); setShowForm(true); }}
            className="px-6 py-2.5 bg-sky-500 text-white font-bold rounded-xl shadow-md hover:bg-sky-600 transition-colors"
          >
            Upload Your First Video
          </button>
        </div>
      )}

      {!showForm && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map(video => (
            <div key={video.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-video bg-black relative">
                <video src={video.video_url} controls className="w-full h-full object-cover">
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-900 line-clamp-1 flex-1 mr-4">{video.title}</h4>
                  {video.subjects && (
                    <span className="shrink-0 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {video.subjects.name}
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                  {video.description || 'No description provided.'}
                </p>
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleEdit(video)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(video.id)}
                    className="flex-1 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
