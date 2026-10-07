import React, { useState, useRef, useEffect } from 'react';
import { AppUser, TEMPLATE_CATEGORIES } from '../lib/authStore.ts';
import { Shield, Lock, UserCircle, LogIn, LogOut, ChevronDown } from 'lucide-react';

interface HeroBannerProps {
  currentUser: AppUser | null;
  activeTab: 'home' | 'resources';
  onSelectTab: (tab: 'home' | 'resources') => void;
  onOpenAdmin: () => void;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSelectTemplateCategory: (categoryId: string, title: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAdmin,
  onOpenLogin,
  onLogout,
  onSelectTemplateCategory,
}) => {
  const [templatesDropdownOpen, setTemplatesDropdownOpen] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (templatesRef.current && !templatesRef.current.contains(event.target as Node)) {
        setTemplatesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="w-full bg-white">
      {/* Top Navigation Bar - DSWD Deep Navy with crisp pure WHITE Logo and Nav */}
      <header className="w-full flex items-center justify-between px-6 sm:px-10 lg:px-16 py-3.5 bg-[#0d2159] border-b border-[#1b3478] select-none flex-wrap gap-y-2 shadow-sm">
        {/* Brand / Logo: Crisp WHITE RAMS PORTAL Logo */}
        <div
          onClick={() => {
            onSelectTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-3 cursor-pointer group"
          title="RAMS Portal - DSWD FO-1"
        >
          {/* White Shield & Records Emblem */}
          <div className="w-9 h-9 rounded-lg bg-white/15 border border-white/30 flex items-center justify-center text-white shadow-inner group-hover:bg-white/25 transition-all">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current text-white">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v4.7c0 4.54-3.14 8.78-7 9.88-3.86-1.1-7-5.34-7-9.88V6.3l7-3.12z"/>
              <path d="M12 5.5L6.5 8.5v3.2c0 3.1 2.3 6.1 5.5 6.8 3.2-.7 5.5-3.7 5.5-6.8V8.5L12 5.5z"/>
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl sm:text-2xl tracking-wider text-white font-heading leading-tight drop-shadow-sm group-hover:text-sky-100 transition-colors">
              RAMS PORTAL
            </span>
            <span className="text-[10px] uppercase font-bold text-sky-200 tracking-wider">
              DSWD FO-1 • RECORDS & ARCHIVES
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-5 sm:space-x-7 text-sm font-medium">
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

          {/* Templates Dropdown matching the uploaded image */}
          <div className="relative" ref={templatesRef}>
            <button
              onClick={() => setTemplatesDropdownOpen(!templatesDropdownOpen)}
              onMouseEnter={() => setTemplatesDropdownOpen(true)}
              className="text-sky-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1 py-1"
            >
              <span>Templates</span>
              <span className="text-[10px]">▼</span>
            </button>

            {templatesDropdownOpen && (
              <div
                onMouseLeave={() => setTemplatesDropdownOpen(false)}
                className="absolute left-0 mt-1 w-60 bg-white border border-slate-200 shadow-2xl rounded-lg py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
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

          <span className="text-sky-100 hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            <span>Administrative Issuances</span>
            <span className="text-[10px]">▼</span>
          </span>
        </nav>

        {/* Right side: Login Status & Admin Side Button */}
        <div className="flex items-center gap-2.5 text-xs">
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

              {/* Admin Side button (Only accessible if Admin) */}
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
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Banner Graphic Area */}
      {activeTab === 'home' ? (
        /* HOME HERO: "RAMS PORTAL" with Hexagon Graphics */
        <div className="relative w-full h-64 sm:h-72 md:h-80 bg-[#0c2363] overflow-hidden flex items-center justify-center">
          {/* Subtle geometric grid background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {/* Background Hexagon 1 (Center-Left) */}
          <div
            className="absolute left-[16%] sm:left-[22%] md:left-[26%] top-[8%] sm:top-[12%] w-52 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 pointer-events-none opacity-90"
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
            className="absolute right-[22%] sm:right-[26%] md:right-[30%] top-[30%] sm:top-[34%] w-48 sm:w-60 md:w-68 h-52 sm:h-60 md:h-68 pointer-events-none opacity-90"
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
              className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tight uppercase text-white drop-shadow-lg"
              style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: '-0.01em',
                textShadow: '0 4px 16px rgba(0,0,0,0.65), 0 2px 4px rgba(0,0,0,0.85)',
              }}
            >
              RAMS PORTAL
            </h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base font-bold tracking-widest text-sky-200 uppercase drop-shadow">
              Records and Archives Management System
            </p>
          </div>
        </div>
      ) : (
        /* RESOURCES HERO: "RECORDS DISPOSITION SCHEDULE (RDS)" Matching Screenshot */
        <div className="relative w-full h-64 sm:h-72 md:h-80 bg-[#f8fafc] overflow-hidden flex items-center justify-center">
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

          {/* Bottom Right Layered Triangles (Navy, Yellow, Crimson matching image) */}
          <div className="absolute right-0 bottom-0 top-0 w-64 sm:w-80 md:w-96 pointer-events-none">
            <svg viewBox="0 0 300 250" className="w-full h-full" preserveAspectRatio="none">
              {/* Crimson Red Wedge */}
              <polygon points="170,250 300,70 300,250" fill="#dc2626" />
              {/* Bright Yellow Diagonal Ribbon */}
              <polygon points="110,250 250,50 280,70 140,250" fill="#facc15" />
              {/* Dark Navy Triangle */}
              <polygon points="60,250 200,80 230,110 90,250" fill="#172554" />
            </svg>
          </div>

          {/* Foreground Title "RECORDS DISPOSITION SCHEDULE (RDS)" */}
          <div className="relative z-10 px-6 sm:px-10 max-w-6xl w-full text-center select-none">
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-[4.2rem] font-black tracking-tight uppercase text-[#0d2159] leading-tight"
              style={{
                fontFamily: "'Montserrat', system-ui, sans-serif",
                letterSpacing: '-0.02em',
                textShadow: '0 2px 4px rgba(13,33,89,0.12)',
              }}
            >
              RECORDS DISPOSITION SCHEDULE (RDS)
            </h1>
          </div>
        </div>
      )}

      {/* Clean Divider Line */}
      <div className="w-full h-[1.5px] bg-slate-200" />
    </div>
  );
};
