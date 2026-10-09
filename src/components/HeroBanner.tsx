import React, { useState, useRef, useEffect } from 'react';
import { AppUser, TEMPLATE_CATEGORIES } from '../lib/authStore.ts';
import {
  Shield,
  Lock,
  UserCircle,
  LogIn,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  Calendar,
  Layers,
} from 'lucide-react';

export type AppTab = 'home' | 'resources' | 'issuances-2025' | 'issuances-2026' | 'issuances-all';

interface HeroBannerProps {
  currentUser: AppUser | null;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSelectTemplateCategory: (categoryId: string, title: string) => void;
  theme?: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAdmin,
  onOpenLogin,
  onLogout,
  onSelectTemplateCategory,
  theme = 'light',
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const [templatesDropdownOpen, setTemplatesDropdownOpen] = useState(false);
  const [issuancesDropdownOpen, setIssuancesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileTemplatesOpen, setMobileTemplatesOpen] = useState(false);
  const [mobileIssuancesOpen, setMobileIssuancesOpen] = useState(false);

  const templatesRef = useRef<HTMLDivElement>(null);
  const issuancesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target as Node)) {
        setTemplatesDropdownOpen(false);
      }
      if (issuancesRef.current && !issuancesRef.current.contains(event.target as Node)) {
        setIssuancesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isIssuancesActive = activeTab.startsWith('issuances');

  return (
    <div className={`w-full transition-colors ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Navigation Bar - DSWD Deep Navy with crisp pure WHITE Logo and Nav */}
      <header className={`w-full px-4 sm:px-8 lg:px-16 py-3 border-b select-none transition-colors shadow-sm ${
        isDark ? 'bg-[#09163b] border-[#152a63]' : 'bg-[#0d2159] border-[#1b3478]'
      }`}>
        <div className="w-full flex items-center justify-between">
          {/* Brand / Logo: Crisp WHITE RAMS PORTAL Logo */}
          <div
            onClick={() => {
              onSelectTab('home');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            title="RAMS Portal - DSWD FO-1"
          >
            {/* White Shield & Records Emblem */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-inner group-hover:bg-white/25 transition-all shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-white">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.88-3.86-1.1-7-5.34-7-9.88V6.3l7-3.12z"/>
                <path d="M12 5.5L6.5 8.5v3.2c0 3.1 2.3 6.1 5.5 6.8 3.2-.7 5.5-3.7 5.5-6.8V8.5L12 5.5z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-2xl tracking-wider text-white font-heading leading-tight drop-shadow-sm group-hover:text-sky-100 transition-colors">
                RAMS PORTAL
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold text-sky-200 tracking-wider">
                DSWD FO-1 • RECORDS & ARCHIVES
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
            <button
              onClick={() => {
                onSelectTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`transition-colors cursor-pointer ${
                activeTab === 'home'
                  ? 'text-white font-bold border-b-2 border-white pb-0.5'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                onSelectTab('resources');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`font-semibold transition-colors cursor-pointer ${
                activeTab === 'resources'
                  ? 'text-[#facc15] font-bold border-b-2 border-[#facc15] pb-0.5'
                  : 'text-sky-100 hover:text-white'
              }`}
            >
              Resources
            </button>

            {/* Templates Dropdown */}
            <div className="relative" ref={templatesRef}>
              <button
                onClick={() => setTemplatesDropdownOpen(!templatesDropdownOpen)}
                onMouseEnter={() => setTemplatesDropdownOpen(true)}
                className="text-sky-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1 py-1"
              >
                <span>Templates</span>
                <span className="text-[10px]">{templatesDropdownOpen ? '▲' : '▼'}</span>
              </button>

              {templatesDropdownOpen && (
                <div
                  onMouseLeave={() => setTemplatesDropdownOpen(false)}
                  className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 shadow-2xl rounded-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                >
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Document Templates
                  </div>
                  {TEMPLATE_CATEGORIES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setTemplatesDropdownOpen(false);
                        onSelectTemplateCategory(tpl.id, tpl.title);
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-900 transition-colors cursor-pointer block"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Administrative Issuances Dropdown (2025 & 2026) */}
            <div className="relative" ref={issuancesRef}>
              <button
                onClick={() => setIssuancesDropdownOpen(!issuancesDropdownOpen)}
                onMouseEnter={() => setIssuancesDropdownOpen(true)}
                className={`transition-colors cursor-pointer flex items-center gap-1.5 py-1 ${
                  isIssuancesActive
                    ? 'text-[#38bdf8] font-bold border-b-2 border-[#38bdf8] pb-0.5'
                    : 'text-sky-100 hover:text-white'
                }`}
              >
                <span>Administrative Issuances</span>
                <span className="text-[10px]">{issuancesDropdownOpen ? '▲' : '▼'}</span>
              </button>

              {issuancesDropdownOpen && (
                <div
                  onMouseLeave={() => setIssuancesDropdownOpen(false)}
                  className="absolute left-0 mt-1 w-68 bg-white border border-slate-200 shadow-2xl rounded-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-slate-800"
                >
                  <div className="px-3.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    Administrative Issuances Series
                  </div>

                  {/* 2025 option */}
                  <button
                    onClick={() => {
                      setIssuancesDropdownOpen(false);
                      onSelectTab('issuances-2025');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      activeTab === 'issuances-2025'
                        ? 'bg-sky-50 text-sky-900 font-bold'
                        : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                    }`}
                  >
                    <span>Administrative Issuances 2025</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-blue-100 text-blue-800">
                      2025
                    </span>
                  </button>

                  {/* 2026 option */}
                  <button
                    onClick={() => {
                      setIssuancesDropdownOpen(false);
                      onSelectTab('issuances-2026');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      activeTab === 'issuances-2026'
                        ? 'bg-sky-50 text-sky-900 font-bold'
                        : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                    }`}
                  >
                    <span>Administrative Issuances 2026</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                      2026
                    </span>
                  </button>

                  {/* View All option */}
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={() => {
                      setIssuancesDropdownOpen(false);
                      onSelectTab('issuances-all');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-full text-left px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer flex items-center justify-between ${
                      activeTab === 'issuances-all'
                        ? 'bg-sky-50 text-sky-900 font-bold'
                        : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900'
                    }`}
                  >
                    <span>All Administrative Issuances</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-700">
                      All
                    </span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Desktop Right side: Dark Mode Toggle, Login Status & Admin Side Button */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                isDark
                  ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-800'
                  : 'bg-[#173273] border-[#2b4c9e] text-amber-200 hover:bg-[#1e4094]'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="text-[11px] font-semibold text-white">
                {isDark ? 'Light' : 'Dark'}
              </span>
            </button>

            {currentUser ? (
              /* Logged in state */
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#173273] border border-[#2b4c9e] rounded-lg text-white"
                  title={`Signed in as ${currentUser.email} (${currentUser.role.toUpperCase()})`}
                >
                  <UserCircle className="w-3.5 h-3.5 text-sky-200" />
                  <span className="truncate max-w-[120px] font-medium hidden sm:inline text-white">
                    {currentUser.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>

                {/* Admin Side button */}
                {currentUser.role === 'admin' ? (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-sm border border-sky-400/30"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Admin Side</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenAdmin}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#173273] hover:bg-[#20408d] text-sky-200 hover:text-white border border-[#2b4c9e] rounded-lg cursor-pointer text-[11px] transition-colors"
                    title="Admin Access (Locked for regular users)"
                  >
                    <Lock className="w-3 h-3 text-amber-300" />
                    <span>Admin (Locked)</span>
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={onLogout}
                  className="p-1.5 bg-[#173273] hover:bg-rose-600 border border-[#2b4c9e] hover:border-rose-500 text-sky-100 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Sign out of account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              /* Logged out state */
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-sm border border-sky-300/30"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In / Register</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Bar: Theme toggle + Hamburger menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer text-amber-300 ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-[#173273] border-[#2b4c9e]'
              }`}
              title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-white bg-[#173273] hover:bg-[#214399] border border-[#2b4c9e] rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Collapsible Menu */}
        {mobileMenuOpen && (
          <div className={`lg:hidden mt-3 pt-3 border-t space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
            isDark ? 'border-slate-800' : 'border-[#1b3478]'
          }`}>
            {/* Primary Nav links */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectTab('home');
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-bold transition-colors ${
                  activeTab === 'home'
                    ? 'bg-sky-500 text-white'
                    : 'bg-[#173273] text-sky-100 hover:bg-[#20408d]'
                }`}
              >
                Home
              </button>

              <button
                onClick={() => {
                  onSelectTab('resources');
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-bold transition-colors ${
                  activeTab === 'resources'
                    ? 'bg-amber-400 text-slate-950 font-black'
                    : 'bg-[#173273] text-sky-100 hover:bg-[#20408d]'
                }`}
              >
                Resources (RDS)
              </button>
            </div>

            {/* Mobile Accordion: Administrative Issuances (2025 & 2026) */}
            <div className="bg-[#13275c] rounded-lg border border-[#224190] overflow-hidden">
              <button
                onClick={() => setMobileIssuancesOpen(!mobileIssuancesOpen)}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-white cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-sky-300" />
                  <span>Administrative Issuances (2025 & 2026)</span>
                </span>
                <span className="text-[10px] text-sky-200">{mobileIssuancesOpen ? '▲' : '▼'}</span>
              </button>

              {mobileIssuancesOpen && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[#1d387c]">
                  <button
                    onClick={() => {
                      onSelectTab('issuances-2025');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded text-xs font-semibold flex items-center justify-between ${
                      activeTab === 'issuances-2025'
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-sky-100 hover:bg-[#1a357c]'
                    }`}
                  >
                    <span>Administrative Issuances 2025</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/30 text-white rounded">
                      2025
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('issuances-2026');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded text-xs font-semibold flex items-center justify-between ${
                      activeTab === 'issuances-2026'
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-sky-100 hover:bg-[#1a357c]'
                    }`}
                  >
                    <span>Administrative Issuances 2026</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500/30 text-white rounded">
                      2026
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectTab('issuances-all');
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-2.5 rounded text-xs font-semibold flex items-center justify-between ${
                      activeTab === 'issuances-all'
                        ? 'bg-sky-500 text-white font-bold'
                        : 'text-sky-100 hover:bg-[#1a357c]'
                    }`}
                  >
                    <span>All Administrative Issuances</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-white/20 text-white rounded">
                      All
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Accordion: Templates */}
            <div className="bg-[#13275c] rounded-lg border border-[#224190] overflow-hidden">
              <button
                onClick={() => setMobileTemplatesOpen(!mobileTemplatesOpen)}
                className="w-full flex items-center justify-between p-3 text-xs font-bold text-white cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-sky-300" />
                  <span>Document Templates</span>
                </span>
                <span className="text-[10px] text-sky-200">{mobileTemplatesOpen ? '▲' : '▼'}</span>
              </button>

              {mobileTemplatesOpen && (
                <div className="px-3 pb-3 pt-1 space-y-1.5 border-t border-[#1d387c]">
                  {TEMPLATE_CATEGORIES.map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onSelectTemplateCategory(tpl.id, tpl.title);
                      }}
                      className="w-full text-left py-1.5 px-2 rounded text-xs text-sky-100 hover:bg-[#1a357c]"
                    >
                      {tpl.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile User Profile & Admin bar */}
            <div className="pt-2 border-t border-[#1b3478] flex items-center justify-between gap-2">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2 truncate">
                    <UserCircle className="w-4 h-4 text-sky-300 shrink-0" />
                    <span className="text-xs text-white truncate font-medium">
                      {currentUser.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] uppercase font-bold bg-amber-400 text-slate-900">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentUser.role === 'admin' ? (
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          onOpenAdmin();
                        }}
                        className="px-2.5 py-1.5 bg-[#0284c7] text-white rounded text-xs font-bold"
                      >
                        Admin
                      </button>
                    ) : null}

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        onLogout();
                      }}
                      className="p-1.5 bg-rose-600/80 text-white rounded text-xs"
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In / Register (RAMS:THE  VAULT)</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Banner Graphic Area */}
      {activeTab === 'home' ? (
        /* HOME HERO: "RAMS PORTAL" with Hexagon Graphics */
        <div className={`relative w-full h-56 sm:h-72 md:h-80 overflow-hidden flex items-center justify-center ${
          isDark ? 'bg-[#071330]' : 'bg-[#0c2363]'
        }`}>
          {/* Subtle geometric grid background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Background Hexagon 1 (Center-Left) */}
          <div
            className="absolute left-[16%] sm:left-[22%] md:left-[26%] top-[8%] sm:top-[12%] w-44 sm:w-64 md:w-72 h-48 sm:h-64 md:h-72 pointer-events-none opacity-90"
            style={{ transform: 'translate(-50%, 0)' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <polygon
                points="100,6 186,55 186,153 100,196 14,153 14,55"
                fill="#163884"
                stroke="#eab308"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Background Hexagon 2 (Center-Right) */}
          <div
            className="absolute right-[22%] sm:right-[26%] md:right-[30%] top-[30%] sm:top-[34%] w-40 sm:w-60 md:w-68 h-44 sm:h-60 md:h-68 pointer-events-none opacity-90"
            style={{ transform: 'translate(50%, 0)' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <polygon
                points="100,6 186,55 186,153 100,196 14,153 14,55"
                fill="#18419c"
                stroke="#facc15"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Crimson/Red Geometric Accent on Far Right */}
          <div className="absolute right-0 bottom-0 pointer-events-none">
            <svg width="100" height="160" viewBox="0 0 100 160" fill="none">
              <polygon points="100,0 20,160 100,160" fill="#dc2626" />
              <polygon points="100,45 50,160 100,160" fill="#b91c1c" />
            </svg>
          </div>

          {/* Left Yellow/Blue Geometric Ribbon */}
          <div className="absolute left-0 bottom-0 top-0 w-24 sm:w-36 pointer-events-none opacity-40">
            <svg viewBox="0 0 120 200" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="0,0 80,0 20,200 0,200" fill="#facc15" />
            </svg>
          </div>

          {/* Foreground Title "RAMS PORTAL" in PURE WHITE */}
          <div className="relative z-10 px-4 select-none text-center">
            <h1
              className="text-3xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight uppercase text-white drop-shadow-lg"
              style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: '-0.01em',
                textShadow: '0 4px 16px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.85)',
              }}
            >
              RAMS PORTAL
            </h1>
            <p className="mt-1 text-[11px] sm:text-sm md:text-base font-bold tracking-widest text-sky-200 uppercase drop-shadow">
              Records and Archives Management System
            </p>
          </div>
        </div>
      ) : activeTab === 'resources' ? (
        /* RESOURCES HERO: "RECORDS DISPOSITION SCHEDULE (RDS)" */
        <div className={`relative w-full h-56 sm:h-72 md:h-80 overflow-hidden flex items-center justify-center ${
          isDark ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'
        }`}>
          {/* Top Yellow Hexagon Contour Accent */}
          <div
            className="absolute left-[36%] sm:left-[42%] top-[-25%] w-64 sm:w-80 h-64 sm:h-80 pointer-events-none opacity-90"
            style={{ transform: 'translate(-50%, 0)' }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <polygon
                points="100,6 186,55 186,153 100,196 14,153 14,55"
                fill="none"
                stroke="#eab308"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Left Angular Dark Blue Shape */}
          <div className="absolute left-0 top-0 bottom-0 w-32 sm:w-48 pointer-events-none opacity-85">
            <svg viewBox="0 0 150 200" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="0,0 120,0 40,200 0,200" fill="#1e3a8a" />
              <polygon points="120,0 150,0 70,200 40,200" fill="#facc15" />
            </svg>
          </div>

          {/* Bottom Center Navy Chevron Accent */}
          <div className="absolute left-[54%] bottom-0 w-44 h-16 pointer-events-none">
            <svg viewBox="0 0 150 50" className="w-full h-full">
              <polygon points="75,0 150,50 0,50" fill="#1e3a8a" />
            </svg>
          </div>

          {/* Bottom Right Layered Triangles */}
          <div className="absolute right-0 bottom-0 top-0 w-52 sm:w-80 md:w-96 pointer-events-none">
            <svg viewBox="0 0 300 250" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="170,250 300,70 300,250" fill="#dc2626" />
              <polygon points="110,250 250,50 280,70 140,250" fill="#facc15" />
              <polygon points="60,250 200,80 230,110 90,250" fill="#172554" />
            </svg>
          </div>

          {/* Foreground Title */}
          <div className="relative z-10 px-4 sm:px-10 max-w-6xl w-full text-center select-none">
            <h1
              className={`text-2xl sm:text-4xl md:text-5xl lg:text-[4rem] font-black tracking-tight uppercase leading-tight ${
                isDark ? 'text-white' : 'text-[#0d2159]'
              }`}
              style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: '-0.02em',
                textShadow: isDark ? '0 2px 10px rgba(0,0,0,0.5)' : '0 2px 4px rgba(13,33,89,0.12)',
              }}
            >
              RECORDS DISPOSITION SCHEDULE (RDS)
            </h1>
          </div>
        </div>
      ) : (
        /* ADMINISTRATIVE ISSUANCES HERO (2025 & 2026) */
        <div className={`relative w-full h-56 sm:h-72 md:h-80 overflow-hidden flex items-center justify-center ${
          isDark ? 'bg-[#0a183d]' : 'bg-[#0c2668]'
        }`}>
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Geometric Accents */}
          <div className="absolute left-0 bottom-0 top-0 w-28 sm:w-44 pointer-events-none opacity-60">
            <svg viewBox="0 0 150 200" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="0,0 90,0 20,200 0,200" fill="#38bdf8" />
              <polygon points="90,0 130,0 60,200 20,200" fill="#facc15" />
            </svg>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-36 sm:w-60 pointer-events-none opacity-70">
            <svg viewBox="0 0 180 200" className="w-full h-full" preserveAspectRatio="none">
              <polygon points="60,200 180,40 180,200" fill="#dc2626" />
              <polygon points="20,200 120,40 140,40 40,200" fill="#facc15" />
            </svg>
          </div>

          {/* Central Hero Typography */}
          <div className="relative z-10 px-4 sm:px-10 max-w-6xl w-full text-center select-none space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs border border-white/20 text-sky-200 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
              <span>DSWD Field Office 1 Policy Directives</span>
              <span>•</span>
              <span className="text-amber-300">
                {activeTab === 'issuances-2025'
                  ? 'Series 2025'
                  : activeTab === 'issuances-2026'
                  ? 'Series 2026'
                  : 'Series 2025 & 2026'}
              </span>
            </div>

            <h1
              className="text-2xl sm:text-4xl md:text-5xl lg:text-[4.2rem] font-black tracking-tight uppercase text-white leading-tight drop-shadow-md"
              style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: '-0.02em',
                textShadow: '0 4px 16px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.85)',
              }}
            >
              ADMINISTRATIVE ISSUANCES
            </h1>

            <p className="text-xs sm:text-sm md:text-base font-semibold text-sky-100 max-w-3xl mx-auto drop-shadow-sm">
              {activeTab === 'issuances-2025'
                ? 'Official 2025 Memorandum Circulars, Administrative Orders & Google Drive Repositories'
                : activeTab === 'issuances-2026'
                ? 'Official 2026 Strategic Directives, Guidelines & Cloud Documents'
                : 'Central Repository of Field Office 1 Administrative Directives & Policies'}
            </p>
          </div>
        </div>
      )}

      {/* Clean Divider Line */}
      <div className={`w-full h-[1.5px] ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
    </div>
  );
};
