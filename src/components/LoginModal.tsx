import React, { useState } from 'react';
import { AppUser, setCurrentUser, getStoredUsers } from '../lib/authStore.ts';
import { X, Lock, Mail, KeyRound, AlertCircle, Shield, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  users,
  onLoginSuccess,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      // Find matching user from props or local cache
      const combinedUsers = users.length > 0 ? users : getStoredUsers();
      let targetUser = combinedUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      // If still not found, check default users as fallback
      if (!targetUser && email.toLowerCase() === 'admin@dswd.gov.ph') {
        targetUser = {
          id: 'user-admin-1',
          email: 'admin@dswd.gov.ph',
          name: 'Administrative Officer (Admin)',
          password: 'admin123',
          role: 'admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        };
      }

      if (!targetUser) {
        setErrorMsg('Account not found. Please verify your email or ask an Administrator to create an account.');
        setLoading(false);
        return;
      }

      // Check password (default password if not explicitly set)
      const expectedPassword = targetUser.password || (targetUser.role === 'admin' ? 'admin123' : 'user123');

      if (password.trim() !== expectedPassword) {
        setErrorMsg('Invalid password. Please check your credentials and try again.');
        setLoading(false);
        return;
      }

      // Successful login
      const userToSet =
        targetUser.email.toLowerCase() === 'admin@dswd.gov.ph'
          ? { ...targetUser, role: 'admin' as const }
          : targetUser;

      setCurrentUser(userToSet);
      onLoginSuccess(userToSet);
      setLoading(false);
      onClose();
    }, 400);
  };

  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-sky-100 border border-sky-200 rounded-lg text-sky-700">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                AD-RAMS Portal Authentication
              </h3>
              <p className="text-xs text-slate-500">Sign in to access your assigned role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleLogin} className="p-6 space-y-4">
          <p className="text-xs text-slate-600">
            Enter your credentials. Regular users have View & Download permissions. Administrator accounts grant access to file uploads and role management.
          </p>

          {/* Email input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              DSWD Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="e.g. admin@dswd.gov.ph"
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Password input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter password"
                className="w-full pl-9 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>

          {/* Demo Credentials Box */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
              Quick Fill Demo Accounts:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@dswd.gov.ph', 'admin123')}
                className="p-2 bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-sky-800">Admin Account</div>
                <div className="text-[10px] text-slate-600">admin@dswd.gov.ph</div>
                <div className="text-[9px] text-slate-400 font-mono">pw: admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('user@dswd.gov.ph', 'user123')}
                className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
              >
                <div className="font-semibold text-slate-800">User Account</div>
                <div className="text-[10px] text-slate-600">user@dswd.gov.ph</div>
                <div className="text-[9px] text-slate-400 font-mono">pw: user123</div>
              </button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
