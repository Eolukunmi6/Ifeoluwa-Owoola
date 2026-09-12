const fs = require('fs');

function fixWithdrawalCtrl() {
  let text = fs.readFileSync('src/server/withdrawals/controller.ts', 'utf8');
  text = text.replace(/b\?\.parent_response, tutor_completed_at === true/g, "(b?.parent_response === 'satisfied' || (b?.parent_response === 'pending' && b?.tutor_completed_at && new Date(b.tutor_completed_at).getTime() < Date.now() - 24 * 60 * 60 * 1000))");
  fs.writeFileSync('src/server/withdrawals/controller.ts', text);
}

function fixManage() {
  let text = fs.readFileSync('src/pages/dashboard/admin/ManageWithdrawals.tsx', 'utf8');
  text = text.replace(/p\.bookings\?\.parent_response, tutor_completed_at === true/g, "(p.bookings?.parent_response === 'satisfied' || (p.bookings?.parent_response === 'pending' && p.bookings?.tutor_completed_at && new Date(p.bookings.tutor_completed_at).getTime() < Date.now() - 24 * 60 * 60 * 1000))");
  fs.writeFileSync('src/pages/dashboard/admin/ManageWithdrawals.tsx', text);
}

fixWithdrawalCtrl();
fixManage();
