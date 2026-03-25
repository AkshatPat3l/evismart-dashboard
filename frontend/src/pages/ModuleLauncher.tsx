import React from 'react';
import { Scan, Database, Box, UserPlus, Link, Archive } from 'lucide-react';

const modules = [
  { name: 'Scanner Portal', description: 'Connect and manage intraoral scanners', icon: Scan, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Case Management', description: 'Track digital impressions and cases', icon: Archive, color: 'text-purple-500', bg: 'bg-purple-50' },
  { name: 'Production DB', description: 'Manufacturing specifications and rules', icon: Database, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Inventory Management', description: 'Track lab materials and supplies', icon: Box, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Client Portal', description: 'Dentist interfacing and collaboration', icon: UserPlus, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Integrations', description: 'Third-party API and partner connections', icon: Link, color: 'text-indigo-500', bg: 'bg-indigo-50' },
];

export const ModuleLauncher: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Module Launcher</h1>
        <p className="text-slate-500 mt-1">Access all connected EviSmart platform components.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <button 
            key={mod.name}
            className="group flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl hover:border-evismart-blue hover:shadow-md transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className={`p-3 rounded-lg ${mod.bg} ${mod.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <mod.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-1">{mod.name}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{mod.description}</p>
            
            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-evismart-blue to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        ))}
      </div>
    </div>
  );
};
