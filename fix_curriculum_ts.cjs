const fs = require('fs');

let mcCode = fs.readFileSync('src/pages/dashboard/admin/ManageCurriculum.tsx', 'utf8');

if (!mcCode.includes('const [processingId, setProcessingId]')) {
  mcCode = mcCode.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [processingId, setProcessingId] = useState<string | null>(null);\n  const [confirmingId, setConfirmingId] = useState<string | null>(null);'
  );
  fs.writeFileSync('src/pages/dashboard/admin/ManageCurriculum.tsx', mcCode);
}
