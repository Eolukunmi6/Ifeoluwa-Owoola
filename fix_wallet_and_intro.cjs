const fs = require('fs');

// 1. IntroductionVideoManager
let iCode = fs.readFileSync('src/components/tutor/IntroductionVideoManager.tsx', 'utf8');
if (!iCode.includes('const [deleting, setDeleting] = useState(false);')) {
  iCode = iCode.replace(
    'const [uploading, setUploading] = useState(false);',
    'const [uploading, setUploading] = useState(false);\n  const [deleting, setDeleting] = useState(false);'
  );
  
  iCode = iCode.replace(
    `const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your introduction video?')) return;
    
    try {
      setError(null);
      setUploading(true);
      const { error: dbError } = await supabase
        .from('tutors')
        .update({ introduction_video: null })
        .eq('id', tutorProfile.id);`,
    `const handleDelete = async () => {
    try {
      setError(null);
      setUploading(true);
      const { error: dbError } = await supabase
        .from('tutors')
        .update({ introduction_video: null })
        .eq('id', tutorProfile.id);`
  );
  
  iCode = iCode.replace(
    `<button
              onClick={handleDelete}
              disabled={uploading}
              className="px-4 py-2 border border-red-200 text-red-600 font-semibold rounded-xl bg-white hover:bg-red-50 transition-colors shadow-sm text-sm disabled:opacity-50"
            >
              Delete
            </button>`,
    `{deleting ? (
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
            )}`
  );
  fs.writeFileSync('src/components/tutor/IntroductionVideoManager.tsx', iCode);
}

// 2. TutorWallet
let wCode = fs.readFileSync('src/components/tutor/TutorWallet.tsx', 'utf8');
if (wCode.includes('if (!window.confirm')) {
  wCode = wCode.replace(
    `if (!window.confirm(\`Are you sure you want to request a withdrawal of \${tutorCurrency} \${withdrawAmount}? This cannot be undone.\`)) {
      return;
    }`,
    `if (!confirmingWithdrawal) {
      setConfirmingWithdrawal(true);
      return;
    }`
  );
  
  // Make sure confirmingWithdrawal is reset
  wCode = wCode.replace(
    `setLoading(false);
    }`,
    `setLoading(false);
      setConfirmingWithdrawal(false);
    }`
  );
  
  // Also we need to make sure the button handles form submission
  wCode = wCode.replace(
    `{withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmingWithdrawal ? 'Confirm?' : 'Withdraw'}`,
    `{withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmingWithdrawal ? 'Yes, Withdraw' : 'Withdraw'}`
  );
  
  wCode = wCode.replace(
    `onChange={e => { setWithdrawAmount(e.target.value); setConfirmingWithdrawal(false); }}`,
    `onChange={e => { setWithdrawAmount(e.target.value); setConfirmingWithdrawal(false); }}` // Same, just checking if it exists
  );
  
  fs.writeFileSync('src/components/tutor/TutorWallet.tsx', wCode);
}

