import React, { useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { TransactionDetailsModal } from './TransactionDetailsModal';

export interface PaymentTransaction {
  id: string;
  created_at: string;
  gross_amount: number;
  tutor_amount: number;
  platform_fee: number;
  tax: number;
  currency: string;
  status: string;
  bookings: {
    scheduled_at: string;
    lesson_packages: { package_type: string };
    profiles: { full_name: string };
  };
}

interface Props {
  transactions: PaymentTransaction[];
}

export function TransactionHistory({ transactions }: Props) {
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [filter, setFilter] = useState<'all' | 'this_month' | 'last_month'>('all');

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    const txDate = new Date(tx.created_at);
    const now = new Date();
    if (filter === 'this_month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    if (filter === 'last_month') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return txDate.getMonth() === lastMonth.getMonth() && txDate.getFullYear() === lastMonth.getFullYear();
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
        
        <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
          {(['all', 'this_month', 'last_month'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'all' ? 'All Time' : f === 'this_month' ? 'This Month' : 'Last Month'}
            </button>
          ))}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Calendar className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-slate-900 font-bold mb-1">No earnings yet</h3>
          <p className="text-slate-500 text-sm">Completed bookings will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Booking details</th>
                <th className="px-6 py-4">Gross</th>
                <th className="px-6 py-4">Net Earned</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-sm font-semibold text-slate-900">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900">{tx.bookings?.lesson_packages?.package_type}</p>
                    <p className="text-xs text-slate-500">with {tx.bookings?.profiles?.full_name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {tx.currency} {tx.gross_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-emerald-600">
                      {tx.currency} {tx.tutor_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedTx(tx)}
                      className="text-sky-600 hover:text-sky-800 text-sm font-semibold inline-flex items-center gap-1"
                    >
                      Breakdown <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTx && (
        <TransactionDetailsModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
      )}
    </div>
  );
}
