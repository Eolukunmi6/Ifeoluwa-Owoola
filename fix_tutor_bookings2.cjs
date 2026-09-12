const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorBookingsManager.tsx', 'utf8');

// The mangled part is:
// {booking.currency === 'NGN' ? '₦' : '                </div>              </div>            </div>          ))}        </div>      )}    </div>  );}}                      {booking.status === 'confirmed' ? (booking.payments?.[0]?.tutor_amount || booking.amount * 0.88) : booking.amount}                    </div> 

code = code.replace(
  /\{booking\.currency === 'NGN' \? '₦' : '[\s\S]*\}\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\)\}\s*<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\}\s*\{booking\.status === 'confirmed' \? \(booking\.payments\?\.\[0\]\?\.tutor_amount \|\| booking\.amount \* 0\.88\) : booking\.amount\}\s*<\/div>/,
  `{booking.currency === 'NGN' ? '₦' : '$'}
                      {booking.status === 'confirmed' ? (booking.payments?.[0]?.tutor_amount || booking.amount * 0.88) : booking.amount}
                    </div>`
);

fs.writeFileSync('src/components/tutor/TutorBookingsManager.tsx', code);
