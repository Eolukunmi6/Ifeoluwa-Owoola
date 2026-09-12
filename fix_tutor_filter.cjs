const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');

code = code.replace(
  `const upcomingBookings = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'pending_payment') && 
    (!b.tutor_marked_completed) && 
    b.status !== 'cancelled'
  );
  
  const pastBookings = bookings.filter(b => 
    b.tutor_marked_completed || b.status === 'cancelled' || b.status === 'completed'
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());`,
  `const upcomingBookings = bookings.filter(b => 
    (b.status === 'confirmed' || b.status === 'pending_payment') && 
    new Date(b.scheduled_at) >= today
  ).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  
  const pastBookings = bookings.filter(b => 
    new Date(b.scheduled_at) < today || b.status === 'cancelled' || b.status === 'completed' || b.tutor_marked_completed
  ).sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());`
);

code = code.replace("Upcoming / Action Required", "Upcoming Sessions");
code = code.replace("No sessions require action", "No upcoming sessions");

fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', code);
