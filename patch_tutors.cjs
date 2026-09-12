const fs = require('fs');
const file = 'src/pages/public/TutorsList.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `        // Transform data
        const transformedTutors = (data || []).map((t: any) => {
          const profile: any = t.profiles;
          const subjects = t.tutor_subjects.map((ts: any) => ts.subjects.name);
          const examinations = []; // Safely default to empty since table doesn't exist yet
          const activePackages = t.lesson_packages.filter((p: any) => p.active);
          const startingPrice = activePackages.length > 0 
            ? Math.min(...activePackages.map((p: any) => p.price))
            : 0;`;

const replacement = `        // Transform data
        const transformedTutors = (data || []).map((t: any) => {
          const profile: any = t.profiles || {};
          const subjects = (t.tutor_subjects || []).map((ts: any) => ts.subjects?.name).filter(Boolean);
          const examinations = []; // Safely default to empty since table doesn't exist yet
          const activePackages = (t.lesson_packages || []).filter((p: any) => p.active);
          const startingPrice = activePackages.length > 0 
            ? Math.min(...activePackages.map((p: any) => p.price))
            : 0;`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
