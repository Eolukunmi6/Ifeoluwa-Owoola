const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorWallet.tsx', 'utf8');

// Add pendingBalances state
code = code.replace(
  "const [balances, setBalances] = useState<Record<string, number>>({});",
  `const [balances, setBalances] = useState<Record<string, number>>({});\n  const [pendingBalances, setPendingBalances] = useState<Record<string, number>>({});`
);

// Update fetchWallet
code = code.replace(
  "setBalances(data.balances || {});",
  `setBalances(data.balances || {});\n      setPendingBalances(data.pendingBalances || {});`
);

// Add pending completion UI
code = code.replace(
  "const available = balances[tutorCurrency] || 0;",
  `const available = balances[tutorCurrency] || 0;\n  const pending = pendingBalances[tutorCurrency] || 0;`
);

code = code.replace(
  "<div className=\"mb-8\">\n        <span className=\"text-5xl font-black\">{tutorCurrency} {available.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>\n      </div>",
  `<div className="mb-4">
        <span className="text-5xl font-black">{tutorCurrency} {available.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
      </div>
      
      {pending > 0 && (
        <div className="mb-8 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-amber-400 text-xs font-bold uppercase tracking-wide mb-1">Pending Completion</div>
            <div className="text-amber-100 font-medium text-sm">Earnings awaiting session completion and parent approval.</div>
          </div>
          <div className="text-xl font-bold text-amber-400">{tutorCurrency} {pending.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
        </div>
      )}
      {pending === 0 && <div className="mb-8"></div>}`
);

fs.writeFileSync('src/components/tutor/TutorWallet.tsx', code);
