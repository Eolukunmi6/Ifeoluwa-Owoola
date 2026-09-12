const fs = require('fs');
let tutorCode = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');
tutorCode = tutorCode.replace(
  'alert("Failed to mark as completed.");',
  'alert("Error: " + (err.message || "Failed to mark as completed."));'
);
fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', tutorCode);

let parentCode = fs.readFileSync('src/components/parent/BookingHistory.tsx', 'utf8');
parentCode = parentCode.replace(
  'alert("Failed to mark as satisfied.");',
  'alert("Error: " + (err.message || "Failed to mark as satisfied."));'
);
parentCode = parentCode.replace(
  'alert("Failed to report issue.");',
  'alert("Error: " + (err.message || "Failed to report issue."));'
);
fs.writeFileSync('src/components/parent/BookingHistory.tsx', parentCode);
