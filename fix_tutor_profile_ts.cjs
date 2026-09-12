const fs = require('fs');

let tpCode = fs.readFileSync('src/pages/public/TutorProfileView.tsx', 'utf8');

if (!tpCode.includes('const [deletingVideoId, setDeletingVideoId]')) {
  tpCode = tpCode.replace(
    'const [error, setError] = useState<string | null>(null);',
    'const [error, setError] = useState<string | null>(null);\n  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);'
  );
  fs.writeFileSync('src/pages/public/TutorProfileView.tsx', tpCode);
}
