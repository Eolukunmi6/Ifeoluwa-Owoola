const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/TutorDashboard.tsx', 'utf8');

code = code.replace(
  `<button
                onClick={() => setActiveTab('bookings')}
                className={\`pb-4 px-6 text-sm font-bold border-b-2 transition-colors \${activeTab === 'bookings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
              >
                Bookings
              </button>`,
  `<button
                onClick={() => setActiveTab('bookings')}
                className={\`pb-4 px-6 text-sm font-bold border-b-2 transition-colors \${activeTab === 'bookings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={\`pb-4 px-6 text-sm font-bold border-b-2 transition-colors \${activeTab === 'earnings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
              >
                Earnings
              </button>`
);

fs.writeFileSync('src/pages/dashboard/TutorDashboard.tsx', code);
