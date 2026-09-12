const fs = require('fs');

const f1 = 'src/components/tutor/TransactionHistory.tsx';
let c1 = fs.readFileSync(f1, 'utf8');
c1 = c1.replace(/lesson_packages: \{ title: string \}/g, 'lesson_packages: { package_type: string }');
c1 = c1.replace(/lesson_packages\?\.title/g, 'lesson_packages?.package_type');
fs.writeFileSync(f1, c1);

const f2 = 'src/components/tutor/TransactionDetailsModal.tsx';
let c2 = fs.readFileSync(f2, 'utf8');
c2 = c2.replace(/lesson_packages: \{ title: string \}/g, 'lesson_packages: { package_type: string }');
c2 = c2.replace(/lesson_packages\?\.title/g, 'lesson_packages?.package_type');
fs.writeFileSync(f2, c2);

