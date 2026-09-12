const fs = require('fs');

// 1. ManageTutors.tsx
let mtCode = fs.readFileSync('src/pages/dashboard/admin/ManageTutors.tsx', 'utf8');
if (mtCode.includes('window.confirm') || mtCode.includes('window.prompt')) {
  // Add confirming and editing state
  mtCode = mtCode.replace(
    'const [processingId, setProcessingId] = useState<string | null>(null);',
    'const [processingId, setProcessingId] = useState<string | null>(null);\n  const [confirmingId, setConfirmingId] = useState<{id: string, action: string} | null>(null);\n  const [editingBioId, setEditingBioId] = useState<string | null>(null);\n  const [bioInput, setBioInput] = useState("");'
  );
  
  // replace functions
  mtCode = mtCode.replace(
    /const editBio = async \([\s\S]*?setProcessingId\(null\);\n    }\n  };/,
    `const handleSaveBio = async (tutorId: string) => {
    try {
      setProcessingId(tutorId);
      const { error } = await supabase.from('tutors').update({ bio: bioInput }).eq('id', tutorId);
      if (error) throw error;
      await fetchTutors();
      setEditingBioId(null);
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
    }
  };`
  );
  
  mtCode = mtCode.replace(
    /const toggleVerified = async \([\s\S]*?setProcessingId\(null\);\n  };/,
    `const toggleVerified = async (tutorId: string, currentStatus: boolean) => {
    try {
      setProcessingId(tutorId);
      const { error } = await supabase.from('tutors').update({ verified: !currentStatus }).eq('id', tutorId);
      if (error) throw error;
      await fetchTutors();
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };`
  );

  mtCode = mtCode.replace(
    /if \(!window\.confirm\(\`Are you sure you want to \$\{currentStatus \? 'block' : 'unblock'\} this user\?\`\)\) return;/g,
    ""
  );

  mtCode = mtCode.replace(
    /const toggleActive = async \([\s\S]*?setProcessingId\(null\);\n  };/,
    `const toggleActive = async (profileId: string, currentStatus: boolean) => {
    try {
      setProcessingId(profileId);
      const { error } = await supabase.from('profiles').update({ active: !currentStatus }).eq('id', profileId);
      if (error) throw error;
      await fetchTutors();
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };`
  );
  
  // update UI buttons
  // Action buttons
  mtCode = mtCode.replace(
    /<button\s*onClick=\{\(\) => toggleActive\(t.id, isActive\)\}[\s\S]*?\{isActive \? 'Block' : 'Unblock'\}\s*<\/button>/,
    `{confirmingId?.id === t.id && confirmingId?.action === 'block' ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => toggleActive(t.id, isActive)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId({id: t.id, action: 'block'})}
                          disabled={processingId === t.id}
                          className={\`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 \${
                            isActive ? 'bg-rose-50 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }\`}
                        >
                          {isActive ? 'Block' : 'Unblock'}
                        </button>
                      )}`
  );
  
  mtCode = mtCode.replace(
    /<button\s*onClick=\{\(\) => toggleVerified\(t.id, t.verified\)\}[\s\S]*?\{t.verified \? 'Remove Badge' : 'Verify Badge'\}\s*<\/button>/,
    `{confirmingId?.id === t.id && confirmingId?.action === 'verify' ? (
                        <div className="flex flex-col gap-1">
                          <button onClick={() => toggleVerified(t.id, t.verified)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId({id: t.id, action: 'verify'})}
                          disabled={processingId === t.id}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          {t.verified ? 'Remove Badge' : 'Verify Badge'}
                        </button>
                      )}`
  );
  
  mtCode = mtCode.replace(
    /<button\s*onClick=\{\(\) => editBio\(t\)\}[\s\S]*?Edit Bio\s*<\/button>/,
    `{editingBioId === t.id ? (
                        <div className="flex flex-col gap-1 mt-2">
                          <textarea value={bioInput} onChange={e => setBioInput(e.target.value)} className="w-full text-xs p-1 border rounded" rows={3}></textarea>
                          <div className="flex gap-1">
                            <button onClick={() => handleSaveBio(t.id)} className="flex-1 px-2 py-1 text-xs bg-emerald-600 text-white rounded">Save</button>
                            <button onClick={() => setEditingBioId(null)} className="flex-1 px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setEditingBioId(t.id); setBioInput(t.bio || ''); }}
                          disabled={processingId === t.id}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          Edit Bio
                        </button>
                      )}`
  );
  fs.writeFileSync('src/pages/dashboard/admin/ManageTutors.tsx', mtCode);
}

// 2. ManageCurriculum.tsx
let mcCode = fs.readFileSync('src/pages/dashboard/admin/ManageCurriculum.tsx', 'utf8');
if (mcCode.includes('window.confirm')) {
  mcCode = mcCode.replace(
    'const [processingId, setProcessingId] = useState<string | null>(null);',
    'const [processingId, setProcessingId] = useState<string | null>(null);\n  const [confirmingId, setConfirmingId] = useState<string | null>(null);'
  );
  
  mcCode = mcCode.replace(
    /const toggleActive = async \([\s\S]*?setProcessingId\(null\);\n  };/,
    `const toggleActive = async (table: 'subjects' | 'countries' | 'examinations', id: string, current: boolean) => {
    try {
      setProcessingId(id);
      const { error } = await supabase.from(table).update({ active: !current }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch(e: any) {
      alert("Error: " + e.message);
    } finally {
      setProcessingId(null);
      setConfirmingId(null);
    }
  };`
  );
  
  // Update toggle buttons for subjects, countries, examinations
  mcCode = mcCode.replace(
    /<button\s*onClick=\{\(\) => toggleActive\('subjects', s\.id, s\.active\)\}[\s\S]*?\{s\.active \? 'Deactivate' : 'Activate'\}\s*<\/button>/,
    `{confirmingId === s.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => toggleActive('subjects', s.id, s.active)} className="px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-2 py-1 text-xs font-semibold rounded bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(s.id)}
                          disabled={processingId === s.id}
                          className={\`px-3 py-1 text-xs font-semibold rounded-lg transition-colors \${s.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}\`}
                        >
                          {s.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}`
  );
  mcCode = mcCode.replace(
    /<button\s*onClick=\{\(\) => toggleActive\('countries', c\.id, c\.active\)\}[\s\S]*?\{c\.active \? 'Deactivate' : 'Activate'\}\s*<\/button>/,
    `{confirmingId === c.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => toggleActive('countries', c.id, c.active)} className="px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-2 py-1 text-xs font-semibold rounded bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(c.id)}
                          disabled={processingId === c.id}
                          className={\`px-3 py-1 text-xs font-semibold rounded-lg transition-colors \${c.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}\`}
                        >
                          {c.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}`
  );
  mcCode = mcCode.replace(
    /<button\s*onClick=\{\(\) => toggleActive\('examinations', e\.id, e\.active\)\}[\s\S]*?\{e\.active \? 'Deactivate' : 'Activate'\}\s*<\/button>/,
    `{confirmingId === e.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => toggleActive('examinations', e.id, e.active)} className="px-2 py-1 text-xs font-semibold rounded bg-red-600 text-white">Yes</button>
                          <button onClick={() => setConfirmingId(null)} className="px-2 py-1 text-xs font-semibold rounded bg-slate-200 text-slate-700">No</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(e.id)}
                          disabled={processingId === e.id}
                          className={\`px-3 py-1 text-xs font-semibold rounded-lg transition-colors \${e.active ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}\`}
                        >
                          {e.active ? 'Deactivate' : 'Activate'}
                        </button>
                      )}`
  );
  fs.writeFileSync('src/pages/dashboard/admin/ManageCurriculum.tsx', mcCode);
}

// 3. TutorProfileView.tsx
let tpCode = fs.readFileSync('src/pages/public/TutorProfileView.tsx', 'utf8');
if (tpCode.includes('window.confirm')) {
  tpCode = tpCode.replace(
    'const [playingVideo, setPlayingVideo] = useState<string | null>(null);',
    'const [playingVideo, setPlayingVideo] = useState<string | null>(null);\n  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);'
  );
  
  tpCode = tpCode.replace(
    /const handleDeleteVideo = async \([\s\S]*?\}\n  };/,
    `const handleDeleteVideo = async (videoId: string, isIntro: boolean = false) => {
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
  };`
  );
  
  // replace intro video delete
  tpCode = tpCode.replace(
    /<button\s*onClick=\{\(\) => handleDeleteVideo\(tutor\.id, true\)\}[\s\S]*?<\/button>/,
    `{deletingVideoId === 'intro' ? (
                <div className="absolute top-2 right-2 flex gap-1 z-10 bg-white/90 p-1 rounded-lg backdrop-blur">
                  <button onClick={() => handleDeleteVideo(tutor.id, true)} className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">Yes</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeletingVideoId(null); }} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded">No</button>
                </div>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeletingVideoId('intro'); }}
                  className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors z-10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}`
  );
  
  // replace lesson video delete
  tpCode = tpCode.replace(
    /<button\s*onClick=\{\(\) => handleDeleteVideo\(video\.id\)\}[\s\S]*?<\/button>/,
    `{deletingVideoId === video.id ? (
                  <div className="absolute top-2 right-2 flex flex-col gap-1 z-10 bg-white/90 p-1 rounded-lg backdrop-blur">
                    <button onClick={() => handleDeleteVideo(video.id)} className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded">Yes, delete</button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingVideoId(null); }} className="px-2 py-1 bg-slate-200 text-slate-700 text-xs font-bold rounded">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeletingVideoId(video.id); }}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}`
  );
  
  fs.writeFileSync('src/pages/public/TutorProfileView.tsx', tpCode);
}
