import React from 'react';
import { PulsingSignature } from '../components/ui/PulsingSignature';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Lab Overview</h1>
        <p className="text-slate-500 mt-1">Monitor your daily operations and recent activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Placeholder Stats */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-sm font-medium text-slate-500">Active Cases</h3>
          <p className="text-3xl font-bold mt-2">142</p>
          <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
            <span className="font-medium">+12%</span>
            <span className="text-slate-500">from last week</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-sm font-medium text-slate-500">Scans Processing</h3>
          <p className="text-3xl font-bold mt-2">8</p>
          <div className="mt-2 text-sm text-slate-500 flex items-center gap-1">
            <span className="text-amber-500 font-medium">●</span>
            <span>2 requiring review</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group transition-all hover:shadow-md bg-gradient-to-br from-white to-slate-50">
          <div className="absolute top-1/2 right-0 w-40 h-40 -translate-y-1/2 translate-x-1/4 opacity-30 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none">
            <PulsingSignature color="#3b82f6" speed={1.5} distort={0.1} scale={0.6} />
          </div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500">Platform Health</h3>
            <p className="text-3xl font-bold mt-2 text-evismart-blue">99.9%</p>
            <div className="mt-2 text-sm text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h2 className="font-semibold text-slate-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-2 h-2 mt-2 rounded-full bg-evismart-blue shrink-0"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Scan uploaded from Portal {i}</p>
                  <p className="text-xs text-slate-500 mt-1">2 hours ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
