import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { EarningsSummaryCards } from '../../../components/tutor/EarningsSummaryCards';
import { TransactionHistory, PaymentTransaction } from '../../../components/tutor/TransactionHistory';
import { TutorWallet } from '../../../components/tutor/TutorWallet';
import { BankDetailsForm } from '../../../components/tutor/BankDetailsForm';
import { WithdrawalHistory } from '../../../components/tutor/WithdrawalHistory';
import { supabase } from '../../../lib/supabase';

export function TutorEarnings() {
  const { session, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [tutorCurrency, setTutorCurrency] = useState<string>('USD');

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        if (!session?.access_token || !profile?.id) return;
        
        const { data: tutor } = await supabase
          .from('tutors')
          .select('currency')
          .eq('profile_id', profile.id)
          .single();
          
        if (tutor) {
          setTutorCurrency(tutor.currency || 'USD');
        }

        const response = await fetch('/api/tutor/earnings', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch earnings');
        
        setTransactions(data.payments);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEarnings();
  }, [session, profile]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-2xl font-medium border border-red-100">
        <h3 className="font-bold text-lg mb-1">Could not load earnings</h3>
        <p>{error}</p>
      </div>
    );
  }

  // Calculate summary stats grouped by currency
  const summaryByCurrency: Record<string, { currency: string, gross: number, net: number, deducted: number }> = {};
  
  transactions.forEach(tx => {
    if (!summaryByCurrency[tx.currency]) {
      summaryByCurrency[tx.currency] = { currency: tx.currency, gross: 0, net: 0, deducted: 0 };
    }
    summaryByCurrency[tx.currency].gross += tx.gross_amount;
    summaryByCurrency[tx.currency].net += tx.tutor_amount;
    summaryByCurrency[tx.currency].deducted += (tx.tax + tx.platform_fee);
  });

  const stats = Object.values(summaryByCurrency);
  if (stats.length === 0) {
    stats.push({ currency: tutorCurrency, gross: 0, net: 0, deducted: 0 });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Earnings & Wallet</h2>
        <p className="text-slate-500 mt-1">Track your income, manage your bank details, and withdraw funds.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <EarningsSummaryCards stats={stats} />
          <BankDetailsForm onSave={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
        <div className="space-y-8">
          <TutorWallet onWithdrawalComplete={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TransactionHistory transactions={transactions} />
        <WithdrawalHistory refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
