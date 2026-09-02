import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';
import type { Role } from '../types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@minierp.com');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setRolePreset = (role: Role) => {
    const emailByRole: Record<Role, string> = {
      Admin: 'admin@minierp.com',
      Sales: 'sales@minierp.com',
      Warehouse: 'warehouse@minierp.com',
      Accounts: 'accounts@minierp.com',
    };
    setEmail(emailByRole[role]);
    setPassword('Password@123');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-500 items-center justify-center text-white shadow-xl shadow-cyan-500/20 mb-2">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Mini ERP/CRM System</h1>
          <p className="text-xs text-slate-400">Enterprise Node.js, Express & Prisma Backend</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-400 mb-1.5 block font-medium">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                placeholder="name@minierp.com"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/50"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition duration-200"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Quick Preset Selector */}
        <div className="pt-4 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" /> Quick 1-Click Role Login
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setRolePreset('Admin')}
              className="px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium text-left hover:bg-purple-500/20 transition"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => setRolePreset('Sales')}
              className="px-3 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium text-left hover:bg-blue-500/20 transition"
            >
              💼 Sales Manager
            </button>
            <button
              type="button"
              onClick={() => setRolePreset('Warehouse')}
              className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 font-medium text-left hover:bg-amber-500/20 transition"
            >
              📦 Warehouse Staff
            </button>
            <button
              type="button"
              onClick={() => setRolePreset('Accounts')}
              className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-medium text-left hover:bg-emerald-500/20 transition"
            >
              📊 Accounts Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
