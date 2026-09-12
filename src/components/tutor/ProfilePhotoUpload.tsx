import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../providers/AuthProvider';

interface ProfilePhotoUploadProps {
  currentPhotoUrl: string | null;
  onUploadSuccess: (url: string) => void;
}

export function ProfilePhotoUpload({ currentPhotoUrl, onUploadSuccess }: ProfilePhotoUploadProps) {
  const { session } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError(null);
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const userId = session?.user.id;
      
      if (!userId) throw new Error('User not authenticated');

      const fileName = `${userId}/${Math.random()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('tutor-profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage.from('tutor-profiles').getPublicUrl(fileName);
      
      if (data?.publicUrl) {
        onUploadSuccess(data.publicUrl);
      }
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
      <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center shrink-0">
        {currentPhotoUrl ? (
          <img src={currentPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-slate-400 text-sm font-medium">No Photo</span>
        )}
      </div>
      
      <div className="flex flex-col justify-center">
        <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-slate-200 font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm text-sm">
          {uploading ? 'Uploading...' : 'Upload new photo'}
          <input
            type="file"
            accept="image/*"
            onChange={uploadPhoto}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="mt-2 text-xs text-slate-500">
          Recommended: Square JPG, PNG. Max 2MB.
        </p>
        {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
      </div>
    </div>
  );
}
