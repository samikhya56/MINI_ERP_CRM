import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ChevronDown, RefreshCw } from 'lucide-react';
import type { Role } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const rolesList: Role[] = ['Admin', 'Sales', 'Warehouse', 'Accounts'];

  const roleStyles: Record<Role, string> = {
    Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    Sales: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    Warehouse: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    Accounts: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  };

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-slate-300">Workspace Context</h2>
        <span className="text-slate-600">•</span>
        <span className="text-xs text-slate-400">Node.js Express + Prisma ERP Engine</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Role Selector Dropdown (Quick Testing) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold tracking-wide transition-all ${
              user?.role ? roleStyles[user.role] : 'bg-slate-800 text-slate-300'
            }`}
            title="Switch Active Role for Testing"
          >
            <span>Role: {user?.role || 'Guest'}</span>
            <ChevronDown className="h-3.5 w-3.5 opacity-75" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" /> Switch Demo Role
              </div>
              {rolesList.map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    switchRole(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    user?.role === r ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-3 border-l border-slate-800 pl-4">
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
            <div className="text-[11px] text-slate-400">{user?.email}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
