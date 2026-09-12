const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/TutorDashboard.tsx', 'utf8');

content = content.replace("import { TutorBookingsManager } from '../../components/tutor/TutorBookingsManager';", 
  "import { TutorBookingsManager } from '../../components/tutor/TutorBookingsManager';\nimport { TutorEarnings } from './tutor/TutorEarnings';");

content = content.replace("const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'pricing' | 'availability' | 'bookings'>('profile');",
  "const [activeTab, setActiveTab] = useState<'profile' | 'videos' | 'pricing' | 'availability' | 'bookings' | 'earnings'>('profile');");

const earningsTabBtn = `
              <button 
                onClick={() => setActiveTab('earnings')}
                className={\`pb-4 px-6 text-sm font-bold border-b-2 transition-colors \${activeTab === 'earnings' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}\`}
              >
                Earnings
              </button>
            </nav>
`;
content = content.replace("</nav>", earningsTabBtn);

const earningsContent = `
            {activeTab === 'earnings' && tutorData && (
              <TutorEarnings />
            )}
`;
content = content.replace("{activeTab === 'bookings' && tutorData && (", earningsContent + "\n            {activeTab === 'bookings' && tutorData && (");

fs.writeFileSync('src/pages/dashboard/TutorDashboard.tsx', content);
