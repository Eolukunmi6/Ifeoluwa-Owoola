const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');

code = code.replace(/parent_marked_satisfied/g, 'parent_response');
code = code.replace(
  /\{!booking\.parent_response && booking\.tutor_marked_completed && \(/g,
  "{booking.parent_response === 'pending' && booking.tutor_marked_completed && ("
);
code = code.replace(
  /\{booking\.parent_response && \(/g,
  "{booking.parent_response === 'satisfied' && ("
);

// We also should handle 'not_satisfied'
if (!code.includes("parent_response === 'not_satisfied'")) {
  code = code.replace(
    /\{booking\.parent_response === 'satisfied' && \(\s*<div className="mt-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 inline-flex items-center justify-center gap-1">\s*<CheckCircle className="w-3 h-3" \/>\s*Parent Approved\s*<\/div>\s*\)\}/,
    `{booking.parent_response === 'satisfied' && (
                      <div className="mt-1 text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200 inline-flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Parent Approved
                      </div>
                    )}
                    {booking.parent_response === 'not_satisfied' && (
                      <div className="mt-1 text-xs font-bold px-2 py-1 bg-rose-50 text-rose-700 rounded border border-rose-200 inline-flex items-center justify-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Disputed
                      </div>
                    )}`
  );
}

fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', code);
