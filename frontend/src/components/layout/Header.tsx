import React, { useState } from 'react';
import { Bell, Search, User, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../../lib/authStore';
import { useSearchStore } from '../../lib/searchStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { searchQuery, setSearchQuery } = useSearchStore();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center flex-1">
        <div className="relative w-96 hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search patients, cases, or clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-evismart-blue/20 focus:border-evismart-blue transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => toast('No new notifications', { icon: '🔔' })}
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 cursor-pointer p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-evismart-blue to-purple-500 text-white rounded-full flex items-center justify-center font-medium shadow-inner">
              <User className="w-4 h-4" />
            </div>
            <div className="hidden sm:block text-sm text-left">
              <p className="font-medium text-slate-900 leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500">{user?.role || 'Member'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-12 z-50 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => { toast('Profile settings coming soon!', { icon: '⚙️' }); setShowDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> Profile
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
