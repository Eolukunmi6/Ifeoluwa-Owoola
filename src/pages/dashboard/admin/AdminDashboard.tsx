import React, { useState } from 'react';
import { useAuth } from '../../../providers/AuthProvider';
import { AdminOverview } from './AdminOverview';
import { ManageTutors } from './ManageTutors';
import { ManageParents } from './ManageParents';
import { ManageBookings } from './ManageBookings';
import { ManageSettings } from './ManageSettings';
import { ManageCurriculum } from './ManageCurriculum';
import { ManageWithdrawals } from './ManageWithdrawals';
import { ManageComplaints } from './ManageComplaints';
import { LogOut } from 'lucide-react';

export function AdminDashboard() {
  const { profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'tutors' | 'parents' | 'bookings' | 'curriculum' | 'withdrawals' | 'complaints' | 'settings'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tutors', label: 'Tutors' },
    { id: 'parents', label: 'Parents' },
    { id: 'bookings', label: 'Bookings & Payments' },
    { id: 'withdrawals', label: 'Withdrawals' },
    { id: 'complaints', label: 'Complaints' },
    { id: 'curriculum', label: 'Curriculum' },
    { id: 'settings', label: 'Settings' }
  ] as const;

  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      {/* Top Nav */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Auralearn Logo" className="h-14 sm:h-16 w-auto object-contain invert hue-rotate-180 mix-blend-screen scale-[1.35] origin-left" />
          <h1 className="text-xl font-bold tracking-tight hidden sm:block ml-4">Admin</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            {profile?.full_name}
          </span>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium text-slate-300 hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 gap-6">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 flex flex-col gap-1 sticky top-24">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          {activeTab === 'overview' && <AdminOverview />}
          {activeTab === 'tutors' && <ManageTutors />}
          {activeTab === 'parents' && <ManageParents />}
          {activeTab === 'bookings' && <ManageBookings />}
          {activeTab === 'curriculum' && <ManageCurriculum />}
          {activeTab === 'withdrawals' && <ManageWithdrawals />}
          {activeTab === 'complaints' && <ManageComplaints />}
          {activeTab === 'settings' && <ManageSettings />}
        </div>
      </div>
    </div>
  );
}
