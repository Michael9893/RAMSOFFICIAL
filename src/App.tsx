import React, { useState, useEffect } from 'react';
import { HeroBanner, AppTab } from './components/HeroBanner.tsx';
import {
  SopDisposalIcon,
  SopArchivalIcon,
  SopMessengerialIcon,
  SopTechnicalAssistanceIcon,
  SopCopiesCertificationIcon,
  SopAdministrativeIssuancesIcon,
  SopFoiIcon,
  SopIncomingIcon,
} from './components/SopIcons.tsx';
import {
  AppUser,
  SopFile,
  getStoredUsers,
  getStoredSopFiles,
  getCurrentUser,
  setCurrentUser,
  subscribeToUsers,
  subscribeToSopFiles,
} from './lib/authStore.ts';
import { AdminPanel } from './components/AdminPanel.tsx';
import { SopFileViewerModal } from './components/SopFileViewerModal.tsx';
import { GoogleDrivePreviewModal } from './components/GoogleDrivePreviewModal.tsx';
import { LoginModal } from './components/LoginModal.tsx';
import { ResourcesView } from './components/ResourcesView.tsx';
import { AdministrativeIssuancesView } from './components/AdministrativeIssuancesView.tsx';

interface SopItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('rams_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {
      console.error(e);
    }
    return 'light';
  });

  const [currentUser, setLocalCurrentUser] = useState<AppUser | null>(() => {
    const cur = getCurrentUser();
    if (cur) {
      if (cur.email.toLowerCase() === 'admin@dswd.gov.ph') {
        return { ...cur, role: 'admin' };
      }
      return cur;
    }
    return null;
  });
  const [users, setUsers] = useState<AppUser[]>(getStoredUsers());
  const [sopFiles, setSopFiles] = useState<SopFile[]>(getStoredSopFiles());

  // Track if user has entered the portal (either by signing in or continuing as guest)
  const [hasEnteredPortal, setHasEnteredPortal] = useState<boolean>(() => {
    return !!getCurrentUser();
  });

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeViewerSop, setActiveViewerSop] = useState<SopItem | null>(null);
  const [previewDriveFile, setPreviewDriveFile] = useState<SopFile | null>(null);

  // Apply theme class to document body & root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 antialiased selection:bg-sky-500 selection:text-white';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-white text-slate-900 antialiased selection:bg-sky-600 selection:text-white';
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('rams_theme', next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Real-time Firestore Cloud Synchronization across tabs and incognito sessions
  useEffect(() => {
    // 1. Subscribe to Users collection
    const unsubUsers = subscribeToUsers((freshUsers) => {
      setUsers(freshUsers);
      const active = getCurrentUser();
      if (active) {
        const matching = freshUsers.find((u) => u.id === active.id);
        if (matching) {
          setLocalCurrentUser(matching);
        }
      }
    });

    // 2. Subscribe to SOP & Template files
    const unsubFiles = subscribeToSopFiles((freshFiles) => {
      setSopFiles(freshFiles);
    });

    return () => {
      unsubUsers();
      unsubFiles();
    };
  }, []);

  const handleRefreshData = () => {
    setUsers(getStoredUsers());
    setSopFiles(getStoredSopFiles());
    const cur = getCurrentUser();
    if (cur) setLocalCurrentUser(cur);
  };

  const handleLoginSuccess = (user: AppUser) => {
    setLocalCurrentUser(user);
    setHasEnteredPortal(true);
    setIsLoginModalOpen(false);
    if (user.role === 'admin') {
      setIsAdminPanelOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLocalCurrentUser(null);
    setIsAdminPanelOpen(false);
    setHasEnteredPortal(false);
    setIsLoginModalOpen(true);
  };

  const sopItems: SopItem[] = [
    {
      id: 'disposal',
      title: 'Request for Diposal of Valueless Records',
      icon: <SopDisposalIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'archival',
      title: 'Request for Archival of Vital/Permanent Records',
      icon: <SopArchivalIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'messengerial',
      title: 'Request for Messengerial Services',
      icon: <SopMessengerialIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'technical-assistance',
      title: 'Request for Technical Assistance on Records Management',
      icon: <SopTechnicalAssistanceIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'copies-certification',
      title: 'Request for Copies and Certification of Documents',
      icon: <SopCopiesCertificationIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'issuances',
      title: 'Certification and Dissemination of Administrative Issuances',
      icon: <SopAdministrativeIssuancesIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'foi',
      title: 'Provision of Freedom of Information Request',
      icon: <SopFoiIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
    {
      id: 'incoming',
      title: 'Processing of Incoming Documents',
      icon: <SopIncomingIcon className="w-14 h-12 sm:w-16 sm:h-14" />,
    },
  ];

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans select-text transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
    }`}>
      {/* 1. Header & Hero Banner */}
      <HeroBanner
        currentUser={currentUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenAdmin={() => {
          if (!currentUser) {
            setIsLoginModalOpen(true);
          } else {
            setIsAdminPanelOpen(true);
          }
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onSelectTemplateCategory={(categoryId, title) => {
          setActiveViewerSop({
            id: categoryId,
            title,
            icon: null,
          });
        }}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-6 sm:py-8 space-y-8 transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}>
        {activeTab === 'home' ? (
          <>
            {/* 2. DISCLAIMER NOTICE Section */}
            <section className={`space-y-2 border pb-6 sm:pb-7 p-4 sm:p-5 rounded-xl ${
              isDark ? 'bg-red-950/20 border-red-900/40 text-slate-200' : 'bg-red-50/40 border-red-100 text-slate-800'
            }`}>
              <h2 className="text-[#dc2626] font-bold text-xs sm:text-[15px] tracking-wide uppercase flex items-center gap-2">
                <span>DISCLAIMER NOTICE:</span>
              </h2>
              <p className={`text-xs sm:text-[13.5px] leading-relaxed italic font-normal max-w-7xl ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                This correspondence and any file transmitted with it are CONFIDENTIAL and intended solely for the use of individuals or entities to whom this is addressed. Access by anyone else is strictly unauthorized. If you are not the intended recipient, any disclosure, copying, distribution or any other action taken or omitted to be taken in reliance on it is prohibited and unlawful. It shall justify the AD-RAMS to exercise whatever rights and remedies under the applicable laws, rules and regulations. In such case, please notify the AD-RAMS and subsequently return this correspondence.
              </p>
            </section>

            {/* 3. The Section's Mandate Section */}
            <section className="space-y-2.5">
              <h2 className={`text-2xl sm:text-3xl md:text-[34px] font-script tracking-wide ${
                isDark ? 'text-sky-300' : 'text-[#0d2159]'
              }`}>
                The Section&apos;s Mandate
              </h2>
              <p className={`text-xs sm:text-[14px] leading-relaxed max-w-5xl font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                To develop policies, programs, and procedures for an efficient and effective records management and ensure appropriate management systems and procedures are in-placed for economical, efficient, and effective services.
              </p>
            </section>

            {/* 4. Standard Operating Procedures (SOPs) Section */}
            <section className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                <h2 className={`text-2xl sm:text-4xl md:text-[42px] font-script tracking-wide ${
                  isDark ? 'text-sky-300' : 'text-[#0d2159]'
                }`}>
                  Standard Operating Procedures (SOPs)
                </h2>
                <span className="text-[#dc2626] font-bold text-xs sm:text-sm tracking-tight">
                  NOTE: Only DSWD issued email can access this.
                </span>
              </div>

              {/* 8-Item SOP Grid / Row (Fully responsive for mobile 2 cols, tablet 4 cols, desktop 8 cols) */}
              <div className="pt-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-3 sm:gap-x-4 gap-y-6 sm:gap-y-7 items-start justify-items-center">
                  {sopItems.map((item) => {
                    const count = sopFiles.filter((f) => f.sopId === item.id).length;
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col items-center group w-full max-w-[145px]"
                      >
                        {/* Icon illustration container */}
                        <div
                          onClick={() => setActiveViewerSop(item)}
                          className={`relative w-full flex items-center justify-center p-3 rounded-xl border shadow-xs transition-all group-hover:scale-105 cursor-pointer ${
                            isDark
                              ? 'bg-slate-900 border-slate-800 hover:bg-slate-850 hover:border-sky-500 hover:shadow-sky-950/40'
                              : 'bg-slate-50 hover:bg-sky-50/70 border-slate-200/80 hover:border-sky-300 hover:shadow-sm'
                          }`}
                          aria-label={item.title}
                          title="Click to view, download, or preview documents for this SOP"
                        >
                          {item.icon}
                          {count > 0 && (
                            <span className="absolute top-1.5 right-1.5 px-1.5 py-0.2 bg-[#0284c7] text-white font-bold text-[9px] rounded-full shadow-sm">
                              {count}
                            </span>
                          )}
                        </div>

                        {/* Underlined link label */}
                        <button
                          onClick={() => setActiveViewerSop(item)}
                          className={`mt-2 underline text-[11px] sm:text-xs leading-tight text-center font-semibold transition-colors cursor-pointer ${
                            isDark
                              ? 'text-sky-400 hover:text-sky-300'
                              : 'text-[#0369a1] hover:text-[#0c4a6e]'
                          }`}
                        >
                          {item.title}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        ) : activeTab === 'resources' ? (
          /* RESOURCES TAB: RECORDS DISPOSITION SCHEDULE (RDS) */
          <ResourcesView
            currentUser={currentUser}
            files={sopFiles}
            onPreviewDriveLink={(file) => setPreviewDriveFile(file)}
            onRefreshData={handleRefreshData}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            theme={theme}
          />
        ) : (
          /* ADMINISTRATIVE ISSUANCES TAB (2025 & 2026) */
          <AdministrativeIssuancesView
            currentUser={currentUser}
            files={sopFiles}
            selectedYear={
              activeTab === 'issuances-2025'
                ? '2025'
                : activeTab === 'issuances-2026'
                ? '2026'
                : 'all'
            }
            onSelectYear={(year) => {
              if (year === '2025') setActiveTab('issuances-2025');
              else if (year === '2026') setActiveTab('issuances-2026');
              else setActiveTab('issuances-all');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPreviewDriveLink={(file) => setPreviewDriveFile(file)}
            onPreviewFile={(file) => {
              setActiveViewerSop({
                id: file.sopId,
                title: file.sopTitle,
                icon: null,
              });
            }}
            onRefreshData={handleRefreshData}
            onOpenLogin={() => setIsLoginModalOpen(true)}
            theme={theme}
          />
        )}
      </main>

      {/* 5. Deep Blue Footer */}
      <footer className={`w-full text-slate-100 py-4 sm:py-5 px-4 text-center select-none mt-auto transition-colors ${
        isDark ? 'bg-[#081330] border-t border-slate-900' : 'bg-[#0e245c]'
      }`}>
        <div className="max-w-6xl mx-auto space-y-1.5 text-xs sm:text-[13px]">
          <p className="font-normal text-slate-100">
            Email Address : <span className="underline decoration-slate-400 cursor-pointer">rams.fo1@dswd.gov.ph</span> | Landline : (072) 687-8000 local 11224
          </p>
          <p className="font-semibold text-slate-200 text-[11.5px] sm:text-xs">
            ©2025 Administrative Division - Records and Archives Management Section. All Rights Reserved.
          </p>
        </div>
      </footer>

      {/* Admin Panel (Admin-Only Side) */}
      {isAdminPanelOpen && currentUser && (
        <AdminPanel
          currentUser={currentUser}
          users={users}
          sopFiles={sopFiles}
          initialSectionId={
            activeTab === 'resources'
              ? 'resource-rds'
              : activeTab === 'issuances-2025'
              ? 'issuance-2025'
              : activeTab === 'issuances-2026'
              ? 'issuance-2026'
              : undefined
          }
          onRefreshData={handleRefreshData}
          onPreviewDriveLink={(file) => setPreviewDriveFile(file)}
          onClose={() => setIsAdminPanelOpen(false)}
          theme={theme}
        />
      )}

      {/* SOP File Viewer & Downloader Modal */}
      {activeViewerSop && (
        <SopFileViewerModal
          sopId={activeViewerSop.id}
          sopTitle={activeViewerSop.title}
          sopIcon={activeViewerSop.icon}
          files={sopFiles}
          currentUser={currentUser}
          onOpenAdminUpload={(sopId) => {
            setActiveViewerSop(null);
            if (currentUser?.role === 'admin') {
              setIsAdminPanelOpen(true);
            } else {
              setIsLoginModalOpen(true);
            }
          }}
          onPreviewDriveLink={(file) => setPreviewDriveFile(file)}
          onRefreshData={handleRefreshData}
          onClose={() => setActiveViewerSop(null)}
        />
      )}

      {/* Google Drive Preview Modal */}
      {previewDriveFile && (
        <GoogleDrivePreviewModal
          file={previewDriveFile}
          onClose={() => setPreviewDriveFile(null)}
        />
      )}

      {/* RAMS: THE VAULT Opening Gate / Login & Register Panel */}
      <LoginModal
        isOpen={!hasEnteredPortal || isLoginModalOpen}
        currentUser={currentUser}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => {
          setHasEnteredPortal(true);
          setIsLoginModalOpen(false);
        }}
        onRefreshData={handleRefreshData}
        onClose={() => {
          setHasEnteredPortal(true);
          setIsLoginModalOpen(false);
        }}
        theme={theme}
      />
    </div>
  );
}
