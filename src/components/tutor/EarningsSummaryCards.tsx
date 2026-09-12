import React from 'react';
import { DollarSign, Wallet, ArrowDownToLine } from 'lucide-react';

interface SummaryStats {
  currency: string;
  gross: number;
  net: number;
  deducted: number;
}

export function EarningsSummaryCards({ stats }: { stats: SummaryStats[] }) {
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: 'Total Net Earnings', icon: <Wallet className="w-5 h-5 text-emerald-600" /> },
          { label: 'Total Gross Earnings', icon: <DollarSign className="w-5 h-5 text-slate-600" /> },
          { label: 'Total Deducted', icon: <ArrowDownToLine className="w-5 h-5 text-rose-600" /> }
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-slate-50`}>{item.icon}</div>
              <h3 className="text-sm font-semibold text-slate-500">{item.label}</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">—</p>
          </div>
        ))}
      </div>
    );
  }

  // Display one block per currency (usually just 1)
  return (
    <div className="space-y-6 mb-8">
      {stats.map((s) => (
        <div key={s.currency} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Net */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Wallet className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-emerald-50">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500">Total Net Earnings</h3>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {s.currency} {s.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Gross */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-slate-50">
                <DollarSign className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500">Total Gross</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {s.currency} {s.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>

          {/* Deducted */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-rose-50">
                <ArrowDownToLine className="w-5 h-5 text-rose-600" />
              </div>
              <h3 className="text-sm font-semibold text-slate-500">Total Deducted</h3>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {s.currency} {s.deducted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
