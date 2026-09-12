const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard/admin/ManageBookings.tsx', 'utf8');

const badges = `
                  <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold \${
                    b.status === 'confirmed' || b.status === 'completed' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : b.status === 'cancelled' 
                      ? 'bg-rose-100 text-rose-700' 
                      : 'bg-amber-100 text-amber-700'
                  }\`}>
                    {b.status.replace('_', ' ')}
                  </span>
                  
                  {(b.status === 'confirmed' || b.status === 'completed') && (
                    <div className="flex flex-col gap-1 mt-2">
                      <div className={\`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex w-fit \${b.tutor_marked_completed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-200'}\`}>
                        Tutor: {b.tutor_marked_completed ? 'Completed' : 'Pending'}
                      </div>
                      <div className={\`text-[10px] font-bold px-2 py-0.5 rounded border inline-flex w-fit \${b.parent_marked_satisfied ? 'bg-blue-50 text-blue-700 border-blue-200' : b.parent_issue_reported ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500 border-slate-200'}\`}>
                        Parent: {b.parent_marked_satisfied ? 'Satisfied' : b.parent_issue_reported ? 'Flagged' : 'Pending'}
                      </div>
                    </div>
                  )}
`;

code = code.replace(
  /<span className=\{\`inline-flex items-center px-2\.5 py-1 rounded-full text-xs font-semibold \$\{\s*b\.status === 'confirmed' \|\| b\.status === 'completed' \s*\? 'bg-emerald-100 text-emerald-700' \s*: b\.status === 'cancelled' \s*\? 'bg-rose-100 text-rose-700' \s*: 'bg-amber-100 text-amber-700'\s*\}\`\}>\s*\{b\.status\.replace\('_', ' '\)\}\s*<\/span>/g,
  badges
);

fs.writeFileSync('src/pages/dashboard/admin/ManageBookings.tsx', code);
