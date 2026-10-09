import React, { useState } from 'react';
import {
  AppUser,
  setCurrentUser,
  getStoredUsers,
  registerUser,
  UserRole,
} from '../lib/authStore.ts';
import {
  X,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  Shield,
  CheckCircle2,
  Eye,
  EyeOff,
  User,
  Building,
  Clock,
  UserPlus,
  LogIn,
  Info,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  currentUser?: AppUser | null;
  users: AppUser[];
  onLoginSuccess: (user: AppUser) => void;
  onContinueAsGuest?: () => void;
  onRefreshData?: () => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  users,
  onLoginSuccess,
  onContinueAsGuest,
  onRefreshData,
  onClose,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingNotice, setPendingNotice] = useState<AppUser | null>(null);
  const [disapprovedNotice, setDisapprovedNotice] = useState<AppUser | null>(null);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('');
  const [regRequestedRole, setRegRequestedRole] = useState<UserRole>('user');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [regSuccessUser, setRegSuccessUser] = useState<AppUser | null>(null);

  if (!isOpen) return null;

  const currentUsersList = users.length > 0 ? users : getStoredUsers();

  // ------------------------------------------
  // HANDLE LOGIN
  // ------------------------------------------
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setPendingNotice(null);
    setDisapprovedNotice(null);

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter both your email address and password.');
      return;
    }

    setLoginLoading(true);

    setTimeout(() => {
      let targetUser = currentUsersList.find(
        (u) => u.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      // Super Admin fallback
      if (!targetUser && loginEmail.trim().toLowerCase() === 'admin@dswd.gov.ph') {
        targetUser = {
          id: 'user-admin-1',
          email: 'admin@dswd.gov.ph',
          name: 'Administrative Officer (Admin)',
          password: 'admin123',
          role: 'admin',
          status: 'active',
          department: 'AD-RAMS Records Section',
          createdAt: new Date().toISOString(),
        };
      }

      if (!targetUser) {
        setLoginError('No account found with this email. Please register for an account or contact the Administrator.');
        setLoginLoading(false);
        return;
      }

      // Check account password
      const expectedPassword = targetUser.password || (targetUser.role === 'admin' ? 'admin123' : 'user123');
      if (loginPassword.trim() !== expectedPassword) {
        setLoginError('Incorrect password. Please verify your credentials and try again.');
        setLoginLoading(false);
        return;
      }

      // Check account status: PENDING
      if (targetUser.status === 'pending') {
        setPendingNotice(targetUser);
        setLoginLoading(false);
        return;
      }

      // Check account status: DISAPPROVED
      if (targetUser.status === 'disapproved') {
        setDisapprovedNotice(targetUser);
        setLoginLoading(false);
        return;
      }

      // Check account status: SUSPENDED
      if (targetUser.status === 'suspended') {
        setLoginError('This account is suspended. Please contact the AD-RAMS Records Section administrator.');
        setLoginLoading(false);
        return;
      }

      // Successful login for active user
      const userToSet =
        targetUser.email.toLowerCase() === 'admin@dswd.gov.ph'
          ? { ...targetUser, role: 'admin' as const, status: 'active' as const }
          : targetUser;

      setCurrentUser(userToSet);
      onLoginSuccess(userToSet);
      setLoginLoading(false);
      onClose();
    }, 280);
  };

  // ------------------------------------------
  // HANDLE REGISTER
  // ------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError('Please complete all required fields (Full Name, Email, and Password).');
      return;
    }

    if (!regEmail.includes('@') || !regEmail.includes('.')) {
      setRegError('Please enter a valid official email address.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters in length.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    if (currentUsersList.some((u) => u.email.toLowerCase() === regEmail.trim().toLowerCase())) {
      setRegError('An account with this email address already exists. Please sign in instead.');
      return;
    }

    setRegLoading(true);

    try {
      const created = await registerUser({
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword.trim(),
        department: regDepartment.trim() || 'DSWD Field Office 1',
        requestedRole: regRequestedRole,
      });

      setRegSuccessUser(created);
      onRefreshData?.();
      setRegLoading(false);
    } catch (err) {
      setRegError('Registration failed: ' + (err as Error).message);
      setRegLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-5xl rounded-2xl sm:rounded-3xl border shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[96vh] md:h-[680px] ${
        isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        {/* ======================================================== */}
        {/* LEFT SIDE: RAMS PORTAL LOGO & THE VAULT IDENTITY */}
        {/* ======================================================== */}
        <div className="w-full md:w-5/12 lg:w-1/2 p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-[#061438] via-[#091f58] to-[#0f3287] text-white select-none">
          {/* Subtle Background Emblem Watermark */}
          <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
            <svg viewBox="0 0 24 24" className="w-96 h-96 fill-white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.88-3.86-1.1-7-5.34-7-9.88V6.3l7-3.12z"/>
              <path d="M12 5.5L6.5 8.5v3.2c0 3.1 2.3 6.1 5.5 6.8 3.2-.7 5.5-3.7 5.5-6.8V8.5L12 5.5z"/>
            </svg>
          </div>

          {/* Top: RAMS Portal Logo & Section Tag */}
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-sky-200">
              <Shield className="w-3.5 h-3.5 text-sky-300" />
              <span>DSWD FO-1 • AD-RAMS GATEWAY</span>
            </div>

            {/* RAMS Portal Logo */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-inner shrink-0">
                <svg viewBox="0 0 24 24" className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.88-3.86-1.1-7-5.34-7-9.88V6.3l7-3.12z"/>
                  <path d="M12 5.5L6.5 8.5v3.2c0 3.1 2.3 6.1 5.5 6.8 3.2-.7 5.5-3.7 5.5-6.8V8.5L12 5.5z"/>
                </svg>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider text-white font-heading leading-none">
                  RAMS:THE  VAULT
                </h1>
                <p className="text-[10px] sm:text-xs text-sky-200 uppercase font-bold tracking-wider mt-1">
                  Records Administration Management Section
                </p>
              </div>
            </div>

            {/* Official Subtitle (Acronym expansion) */}
            <div className="pt-2">
              <blockquote className="text-xs sm:text-[13px] font-medium italic text-sky-100 bg-black/20 p-3 sm:p-3.5 rounded-xl border border-white/15 leading-relaxed">
                &ldquo;Trusted Hub for Electronic Virtual Archive and Unitized Logistic Tracker&rdquo;
              </blockquote>
            </div>
          </div>

          {/* Bottom: Republic of the Philippines info */}
          <div className="relative z-10 pt-4 mt-4 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-[11px] text-sky-200/70">
            <span>DSWD Regional Government Center, FO 1</span>
            <span className="font-semibold text-white/80">NAP Compliant</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT SIDE: SIMPLE LOG IN & REGISTER PANEL */}
        {/* ======================================================== */}
        <div className={`w-full md:w-7/12 lg:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto ${
          isDark ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
        }`}>
          <div>
            {/* Top Bar: Tabs & Close Button */}
            <div className="flex items-center justify-between gap-3 mb-5">
              {/* Simple Tab Switcher: Log In vs Register */}
              <div className={`flex items-center rounded-xl p-1 border flex-1 max-w-xs ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setLoginError('');
                    setPendingNotice(null);
                    setDisapprovedNotice(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'login'
                      ? 'bg-[#0284c7] text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTab('register');
                    setRegError('');
                    setRegSuccessUser(null);
                  }}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    tab === 'register'
                      ? 'bg-[#0284c7] text-white shadow-sm'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>

              {/* Close / Dismiss button */}
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                aria-label="Close authentication panel"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB CONTENT */}
            {tab === 'login' ? (
              /* ======================================================== */
              /* SIGN IN FORM */
              /* ======================================================== */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    Sign in to RAMS:THE  VAULT
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Enter your DSWD official account credentials to access records.
                  </p>
                </div>

                {/* Status Notice: PENDING VERIFICATION */}
                {pendingNotice && (
                  <div className="p-3.5 rounded-xl border bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                      <Clock className="w-4 h-4" />
                      <span>Account Pending Administrator Verification</span>
                    </div>
                    <p className="leading-relaxed">
                      Hello <strong>{pendingNotice.name}</strong>, your account registration is awaiting review and verification by the administrator in the Admin Panel.
                    </p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      Once verified, the admin will activate your account as either User or Admin. Please check back shortly.
                    </p>
                  </div>
                )}

                {/* Status Notice: DISAPPROVED */}
                {disapprovedNotice && (
                  <div className="p-3.5 rounded-xl border bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs space-y-1 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                      <AlertCircle className="w-4 h-4" />
                      <span>Registration Disapproved by Administrator</span>
                    </div>
                    <p className="leading-relaxed">
                      Your registration for <strong>{disapprovedNotice.email}</strong> was reviewed and disapproved by the administrator in the Admin Panel. Please contact AD-RAMS.
                    </p>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    DSWD Official Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => {
                        setLoginEmail(e.target.value);
                        setLoginError('');
                        setPendingNotice(null);
                      }}
                      placeholder="Official email address"
                      className={`w-full pl-9 pr-3.5 py-2.5 text-xs rounded-lg border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password *
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Protected by Vault Authentication
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Password"
                      className={`w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In to RAMS:THE  VAULT'}</span>
                </button>
              </form>
            ) : (
              /* ======================================================== */
              /* REGISTER NEW ACCOUNT FORM */
              /* ======================================================== */
              <div>
                {regSuccessUser ? (
                  /* Confirmation card */
                  <div className="space-y-4 py-2 animate-in fade-in duration-150">
                    <div className="p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-2.5">
                      <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Registration Submitted to RAMS:THE  VAULT!</span>
                      </div>
                      <p className="text-xs leading-relaxed">
                        Thank you, <strong>{regSuccessUser.name}</strong>. Your account registration for <strong>{regSuccessUser.email}</strong> has been logged.
                      </p>
                      <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-lg border border-emerald-200 dark:border-emerald-800 text-[11px] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Requested Access:</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 uppercase">{regSuccessUser.requestedRole}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status:</span>
                          <span className="font-bold text-amber-600 dark:text-amber-400">PENDING ADMINISTRATOR VERIFICATION</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pt-1">
                        Please wait for the administrator to review and verify your account in the Admin Panel, where they will confirm your access as User or Administrator.
                      </p>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTab('login');
                          setLoginEmail(regSuccessUser.email);
                          setLoginPassword('');
                          setRegSuccessUser(null);
                        }}
                        className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Return to Log In
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Registration fields */
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        Register for RAMS:THE  VAULT
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        New registrations are verified by the administrator in the Admin Panel.
                      </p>
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Full name"
                          className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border focus:outline-none transition-colors ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        DSWD Official Email *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="Official email address"
                          className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border focus:outline-none transition-colors ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Department & Requested Role */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Division / Section (Optional)
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            value={regDepartment}
                            onChange={(e) => setRegDepartment(e.target.value)}
                            placeholder="Division or section (optional)"
                            className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border focus:outline-none transition-colors ${
                              isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Requested Access Level *
                        </label>
                        <select
                          value={regRequestedRole}
                          onChange={(e) => setRegRequestedRole(e.target.value as UserRole)}
                          className={`w-full px-3 py-2 text-xs rounded-lg border focus:outline-none cursor-pointer ${
                            isDark
                              ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                              : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                          }`}
                        >
                          <option value="user">User (View & Download Only)</option>
                          <option value="admin">Administrator (Upload & Management)</option>
                        </select>
                      </div>
                    </div>

                    {/* Password & Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Password (min 6 chars) *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Password"
                            className={`w-full pl-9 pr-3.5 py-2 text-xs rounded-lg border focus:outline-none ${
                              isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                            }`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className={`w-full pl-9 pr-8 py-2 text-xs rounded-lg border focus:outline-none ${
                              isDark
                                ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                                : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Error Banner */}
                    {regError && (
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-lg text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-1">
                      <button
                        type="submit"
                        disabled={regLoading}
                        className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-lg transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>{regLoading ? 'Submitting Registration...' : 'Submit Registration to RAMS:THE  VAULT'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Bottom Bar: Continue as Guest / Browse Portal */}
          <div className={`pt-4 mt-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'border-slate-800' : 'border-slate-200'
          }`}>
            <span className="text-[11px] text-slate-400">
              Need to check directives first?
            </span>

            <button
              type="button"
              onClick={() => {
                onContinueAsGuest?.();
                onClose();
              }}
              className="font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Explore Portal as Visitor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
