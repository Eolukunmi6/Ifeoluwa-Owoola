const fs = require('fs');
let wc = fs.readFileSync('src/server/withdrawals/controller.ts', 'utf8');
wc = wc.replace(/parent_marked_satisfied/g, 'parent_response, tutor_completed_at');
wc = wc.replace(
  /b\?\.parent_marked_satisfied === true/g,
  "(b?.parent_response === 'satisfied' || (b?.parent_response === 'pending' && b?.tutor_completed_at && new Date(b.tutor_completed_at).getTime() < Date.now() - 24 * 60 * 60 * 1000))"
);
fs.writeFileSync('src/server/withdrawals/controller.ts', wc);

let mwc = fs.readFileSync('src/pages/dashboard/admin/ManageWithdrawals.tsx', 'utf8');
mwc = mwc.replace(/parent_marked_satisfied/g, 'parent_response, tutor_completed_at');
mwc = mwc.replace(
  /p\.bookings\?\.parent_marked_satisfied === true/g,
  "(p.bookings?.parent_response === 'satisfied' || (p.bookings?.parent_response === 'pending' && p.bookings?.tutor_completed_at && new Date(p.bookings.tutor_completed_at).getTime() < Date.now() - 24 * 60 * 60 * 1000))"
);
fs.writeFileSync('src/pages/dashboard/admin/ManageWithdrawals.tsx', mwc);
