const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/admin/ManageBookings.tsx', 'utf8');

code = code.replace(/parent_marked_satisfied/g, 'parent_response');
code = code.replace(
  /b\.parent_response \? 'bg-blue-50/g,
  "b.parent_response === 'satisfied' ? 'bg-blue-50"
);
code = code.replace(
  /b\.parent_response \? 'Satisfied'/g,
  "b.parent_response === 'satisfied' ? 'Satisfied'"
);

// We want to handle not_satisfied and auto approve logic visually if we want.
// For now, just fix the ternary syntax:
// Parent: {b.parent_response === 'satisfied' ? 'Satisfied' : b.parent_issue_reported ? 'Flagged' : 'Pending'}
// Let's add disputed
code = code.replace(
  /b\.parent_issue_reported \? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'/g,
  "b.parent_response === 'not_satisfied' ? 'bg-rose-50 text-rose-700 border-rose-200' : b.parent_issue_reported ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'"
);
code = code.replace(
  /b\.parent_issue_reported \? 'Flagged' : 'Pending'/g,
  "b.parent_response === 'not_satisfied' ? 'Disputed' : b.parent_issue_reported ? 'Flagged' : 'Pending'"
);

fs.writeFileSync('src/pages/dashboard/admin/ManageBookings.tsx', code);
