import React from 'react';
import { LayoutDashboard, Grid, Settings, Users, FileText, Activity, Receipt, Wallet } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Modules', icon: Grid, path: '/modules' },
  { name: 'Cases', icon: FileText, path: '/cases' },
  { name: 'Invoices', icon: Receipt, path: '/invoices' },
  { name: 'Finances', icon: Wallet, path: '/finances' },
  { name: 'Analytics', icon: Activity, path: '/analytics' },
  { name: 'Clients', icon: Users, path: '/clients' },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="h-16 flex items-center px-6 border-b border-slate-200">
        <div className="flex items-center gap-2 text-evismart-blue font-bold text-xl tracking-tight">
          <div className="w-8 h-8 bg-evismart-blue rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">E</span>
          </div>
          EviSmart
        </div>
      </div>
      
      <div className="flex-1 py-6 px-4 flex flex-col gap-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">
          Platform
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-50 text-evismart-blue font-medium shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 opacity-70 group-hover:opacity-100" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-slate-200">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
              isActive
                ? 'bg-blue-50 text-evismart-blue font-medium shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`
          }
        >
          <Settings className="w-5 h-5 opacity-70 group-hover:opacity-100" />
          <span>Settings</span>
        </NavLink>
      </div>
    </div>
  );
};
