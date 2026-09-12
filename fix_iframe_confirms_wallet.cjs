const fs = require('fs');
let code = fs.readFileSync('src/components/tutor/TutorWallet.tsx', 'utf8');

code = code.replace(
  "const [withdrawing, setWithdrawing] = useState(false);",
  "const [withdrawing, setWithdrawing] = useState(false);\n  const [confirmingWithdrawal, setConfirmingWithdrawal] = useState(false);"
);

code = code.replace(
  `const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    
    if (!window.confirm(\`Are you sure you want to request a withdrawal of \${tutorCurrency} \${withdrawAmount}? This cannot be undone.\`)) {
      return;
    }
    setWithdrawing(true);`,
  `const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || Number(withdrawAmount) <= 0) return;
    
    if (!confirmingWithdrawal) {
      setConfirmingWithdrawal(true);
      return;
    }
    setWithdrawing(true);`
);

code = code.replace(
  `onWithdrawalComplete();
    } catch`,
  `onWithdrawalComplete();
      setConfirmingWithdrawal(false);
    } catch`
);

code = code.replace(
  `{withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Withdraw`,
  `{withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmingWithdrawal ? 'Confirm?' : 'Withdraw'}`
);

// If the amount changes, cancel the confirmation
code = code.replace(
  `onChange={e => setWithdrawAmount(e.target.value)}`,
  `onChange={e => { setWithdrawAmount(e.target.value); setConfirmingWithdrawal(false); }}`
);
code = code.replace(
  `onClick={() => setWithdrawAmount(available.toString())}`,
  `onClick={() => { setWithdrawAmount(available.toString()); setConfirmingWithdrawal(false); }}`
);

fs.writeFileSync('src/components/tutor/TutorWallet.tsx', code);
