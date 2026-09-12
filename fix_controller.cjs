const fs = require('fs');
let code = fs.readFileSync('src/server/withdrawals/controller.ts', 'utf8');

code = code.replace(
  `const isEligible = p.bookings?.tutor_marked_completed === true && p.bookings?.parent_marked_satisfied === true;`,
  `const b = Array.isArray(p.bookings) ? p.bookings[0] : p.bookings;
      const isEligible = b?.tutor_marked_completed === true && b?.parent_marked_satisfied === true;`
);

code = code.replace(
  `if (p.bookings?.tutor_marked_completed === true && p.bookings?.parent_marked_satisfied === true) {`,
  `const b = Array.isArray(p.bookings) ? p.bookings[0] : p.bookings;
      if (b?.tutor_marked_completed === true && b?.parent_marked_satisfied === true) {`
);

fs.writeFileSync('src/server/withdrawals/controller.ts', code);
