import React from 'react';
import { X, Receipt } from 'lucide-react';
import { PaymentTransaction } from './TransactionHistory';

interface Props {
  tx: PaymentTransaction;
  onClose: () => void;
}

export function TransactionDetailsModal({ tx, onClose }: Props) {
  const formatMoney = (amount: number) => {
    return `${tx.currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Calculate percentages purely for display logic based on historical values
  const feePercent = Math.round((tx.platform_fee / tx.gross_amount) * 100);
  const taxPercent = Math.round((tx.tax / tx.gross_amount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-slate-400" />
            Transaction Breakdown
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-600 font-medium">Gross earnings</span>
              <span className="text-slate-900 font-bold">{formatMoney(tx.gross_amount)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 text-rose-600">
              <span className="text-sm">Tax ({taxPercent}%)</span>
              <span className="font-medium">-{formatMoney(tx.tax)}</span>
            </div>

            <div className="flex justify-between items-center py-2 text-rose-600">
              <span className="text-sm">Administration fee ({feePercent}%)</span>
              <span className="font-medium">-{formatMoney(tx.platform_fee)}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-t border-slate-100">
              <span className="text-sm text-slate-500 font-medium">Total deduction</span>
              <span className="text-sm text-rose-600 font-medium">-{formatMoney(tx.tax + tx.platform_fee)}</span>
            </div>

            <div className="flex justify-between items-center py-4 border-t-2 border-slate-100 mt-2">
              <span className="text-lg font-bold text-slate-900">Net earnings</span>
              <span className="text-xl font-extrabold text-emerald-600">{formatMoney(tx.tutor_amount)}</span>
            </div>
          </div>
          
          <div className="mt-8">
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:opacity-90 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
