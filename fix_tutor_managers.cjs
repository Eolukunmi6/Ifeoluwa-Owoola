const fs = require('fs');

// 1. LessonPackagesManager
let lCode = fs.readFileSync('src/components/tutor/LessonPackagesManager.tsx', 'utf8');
if (!lCode.includes('const [deletingId, setDeletingId]')) {
  lCode = lCode.replace(
    'const [saving, setSaving] = useState(false);',
    'const [saving, setSaving] = useState(false);\n  const [deletingId, setDeletingId] = useState<string | null>(null);'
  );
  
  lCode = lCode.replace(
    `const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this package?')) return;
    
    try {
      const { error: dbError } = await supabase
        .from('lesson_packages')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      setPackages(packages.filter(p => p.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete package.');
    }
  };`,
    `const handleDelete = async (id: string) => {
    try {
      const { error: dbError } = await supabase
        .from('lesson_packages')
        .delete()
        .eq('id', id);
        
      if (dbError) {
        alert("Database Error: " + dbError.message);
        throw dbError;
      }
      
      setPackages(packages.filter(p => p.id !== id));
      alert("Package deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete package.');
    } finally {
      setDeletingId(null);
    }
  };`
  );
  
  lCode = lCode.replace(
    `<button
                  onClick={() => handleDelete(pkg.id)}
                  className="flex-1 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>`,
    `{deletingId === pkg.id ? (
                  <div className="flex-1 flex gap-1">
                    <button onClick={() => handleDelete(pkg.id)} className="flex-1 px-1 py-2 bg-red-600 text-white text-xs font-semibold rounded-lg">Yes</button>
                    <button onClick={() => setDeletingId(null)} className="flex-1 px-1 py-2 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">No</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(pkg.id)}
                    className="flex-1 px-3 py-2 bg-red-50 border border-red-100 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
                )}`
  );
  fs.writeFileSync('src/components/tutor/LessonPackagesManager.tsx', lCode);
}

// 2. TeachingVideosManager
let tCode = fs.readFileSync('src/components/tutor/TeachingVideosManager.tsx', 'utf8');
if (!tCode.includes('const [deletingId, setDeletingId]')) {
  tCode = tCode.replace(
    'const [uploading, setUploading] = useState(false);',
    'const [uploading, setUploading] = useState(false);\n  const [deletingId, setDeletingId] = useState<string | null>(null);'
  );
  
  tCode = tCode.replace(
    `const handleDelete = async (id: string, videoUrl: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const { error: dbError } = await supabase
        .from('tutor_videos')
        .delete()
        .eq('id', id);
        
      if (dbError) throw dbError;
      
      const fileName = videoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('tutor-videos').remove([fileName]);
      }
      
      setVideos(videos.filter(v => v.id !== id));
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete video.');
    }
  };`,
    `const handleDelete = async (id: string, videoUrl: string) => {
    try {
      const { error: dbError } = await supabase
        .from('tutor_videos')
        .delete()
        .eq('id', id);
        
      if (dbError) {
        alert("Database Error: " + dbError.message);
        throw dbError;
      }
      
      const fileName = videoUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('tutor-videos').remove([fileName]);
      }
      
      setVideos(videos.filter(v => v.id !== id));
      alert("Video deleted successfully.");
    } catch (err: any) {
      console.error(err);
      alert('Failed to delete video.');
    } finally {
      setDeletingId(null);
    }
  };`
  );
  
  tCode = tCode.replace(
    `<button
                  onClick={() => handleDelete(video.id, video.video_url)}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>`,
    `{deletingId === video.id ? (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                    <button onClick={() => handleDelete(video.id, video.video_url)} className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">Yes, delete</button>
                    <button onClick={() => setDeletingId(null)} className="px-2 py-1 bg-slate-700 text-white text-xs font-bold rounded">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeletingId(video.id)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}`
  );
  fs.writeFileSync('src/components/tutor/TeachingVideosManager.tsx', tCode);
}
