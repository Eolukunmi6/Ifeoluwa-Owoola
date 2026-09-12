const fs = require('fs');
let content = fs.readFileSync('src/server/earnings/controller.ts', 'utf8');
content = content.replace(/lesson_packages\(title\)/g, 'lesson_packages(package_type)');
fs.writeFileSync('src/server/earnings/controller.ts', content);
