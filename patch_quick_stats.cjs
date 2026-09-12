const fs = require('fs');
let content = fs.readFileSync('src/pages/dashboard/TutorDashboard.tsx', 'utf8');

content = content.replace("import { TutorEarnings } from './tutor/TutorEarnings';", 
  "import { TutorEarnings } from './tutor/TutorEarnings';\nimport { DashboardQuickStats } from '../../components/tutor/DashboardQuickStats';");

const insertPoint = "{dbError && (";
const newContent = `
        <DashboardQuickStats />
        
        {dbError && (
`;

content = content.replace(insertPoint, newContent);

fs.writeFileSync('src/pages/dashboard/TutorDashboard.tsx', content);
