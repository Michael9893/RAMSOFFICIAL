import React, { useState, useEffect } from 'react';
import { HeroBanner } from './components/HeroBanner.tsx';
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

interface SopItem {
  id: string;
  title: string;
  icon: React.ReactNode;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'resources'>('home');
  const [currentUser, setLocalCurrentUser] = useState<AppUser | null>(() => {
    const cur = getCurrentUser();
    if (cur) {
      if (cur.email.toLowerCase() === 'admin@dswd.gov.ph') {
        return { ...cur, role: 'admin' };
      }
      return cur;
    }
    // Default to Admin account
    return getStoredUsers().find((u) => u.email.toLowerCase() === 'admin@dswd.gov.ph') || null;
  });
  const [users, setUsers] = useState<AppUser[]>(getStoredUsers());
  const [sopFiles, setSopFiles] = useState<SopFile[]>(getStoredSopFiles());

  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeViewerSop, setActiveViewerSop] = useState<SopItem | null>(null);
  const [previewDriveFile, setPreviewDriveFile] = useState<SopFile | null>(null);

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
      } else {
        const defaultAdmin = freshUsers.find((u) => u.email.toLowerCase() === 'admin@dswd.gov.ph');
        if (defaultAdmin) setLocalCurrentUser(defaultAdmin);
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
    if (user.role === 'admin') {
      setIsAdminPanelOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLocalCurrentUser(null);
    setIsAdminPanelOpen(false);
  };

  const sopItems: SopItem[] = [
    {
      id: 'disposal',
      title: 'Request for Diposal of Valueless Records',
      icon: <SopDisposalIcon className="w-16 h-14" />,
    },
    {
      id: 'archival',
      title: 'Request for Archival of Vital/Permanent Records',
      icon: <SopArchivalIcon className="w-16 h-14" />,
    },
    {
      id: 'messengerial',
      title: 'Request for Messengerial Services',
      icon: <SopMessengerialIcon className="w-16 h-14" />,
    },
    {
      id: 'technical-assistance',
      title: 'Request for Technical Assistance on Records Management',
      icon: <SopTechnicalAssistanceIcon className="w-16 h-14" />,
    },
    {
      id: 'copies-certification',
      title: 'Request for Copies and Certification of Documents',
      icon: <SopCopiesCertificationIcon className="w-16 h-14" />,
    },
    {
      id: 'issuances',
      title: 'Certification and Dissemination of Administrative Issuances',
      icon: <SopAdministrativeIssuancesIcon className="w-16 h-14" />,
    },
    {
      id: 'foi',
      title: 'Provision of Freedom of Information Request',
      icon: <SopFoiIcon className="w-16 h-14" />,
    },
    {
      id: 'incoming',
      title: 'Processing of Incoming Documents',
      icon: <SopIncomingIcon className="w-16 h-14" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans select-text">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-7 sm:py-9 space-y-8 bg-white">
        {activeTab === 'home' ? (
          <>
            {/* 2. DISCLAIMER NOTICE Section */}
            <section className="space-y-2 border-b border-slate-200 pb-7 bg-red-50/40 p-5 rounded-xl border border-red-100">
              <h2 className="text-[#dc2626] font-bold text-sm sm:text-[15px] tracking-wide uppercase flex items-center gap-2">
                <span>DISCLAIMER NOTICE:</span>
              </h2>
              <p className="text-slate-700 text-xs sm:text-[13.5px] leading-relaxed italic font-normal max-w-7xl">
                This correspondence and any file transmitted with it are CONFIDENTIAL and intended solely for the use of individuals or entities to whom this is addressed. Access by anyone else is strictly unauthorized. If you are not the intended recipient, any disclosure, copying, distribution or any other action taken or omitted to be taken in reliance on it is prohibited and unlawful. It shall justify the AD-RAMS to exercise whatever rights and remedies under the applicable laws, rules and regulations. In such case, please notify the AD-RAMS and subsequently return this correspondence.
              </p>
            </section>

            {/* 3. The Section's Mandate Section */}
            <section className="space-y-2.5">
              <h2 className="text-[#0d2159] text-2xl sm:text-3xl md:text-[34px] font-script tracking-wide">
                The Section&apos;s Mandate
              </h2>
              <p className="text-slate-700 text-xs sm:text-[14px] leading-relaxed max-w-5xl font-normal">
                To develop policies, programs, and procedures for an efficient and effective records management and ensure appropriate management systems and procedures are in-placed for economical, efficient, and effective services.
              </p>
            </section>

            {/* 4. Standard Operating Procedures (SOPs) Section */}
            <section className="space-y-3 pt-2">
              <h2 className="text-[#0d2159] text-3xl sm:text-4xl md:text-[42px] font-script tracking-wide">
                Standard Operating Procedures (SOPs)
              </h2>
              <p className="text-[#dc2626] font-bold text-xs sm:text-sm tracking-tight">
                NOTE: Only DSWD issued email can access this.
              </p>

              {/* 8-Item SOP Grid / Row */}
              <div className="pt-5 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-4 gap-y-7 items-start justify-items-center">
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
                          className="relative w-full flex items-center justify-center p-3 rounded-xl bg-slate-50 hover:bg-sky-50/70 border border-slate-200/80 hover:border-sky-300 shadow-xs hover:shadow-sm transition-all group-hover:scale-105 cursor-pointer"
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
                          className="mt-2 text-[#0369a1] hover:text-[#0c4a6e] underline text-[11px] sm:text-xs leading-tight text-center font-semibold transition-colors cursor-pointer"
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
        ) : (
          /* RESOURCES TAB: RECORDS DISPOSITION SCHEDULE (RDS) */
          <ResourcesView
            currentUser={currentUser}
            files={sopFiles}
            onPreviewDriveLink={(file) => setPreviewDriveFile(file)}
            onRefreshData={handleRefreshData}
            onOpenLogin={() => setIsLoginModalOpen(true)}
          />
        )}
      </main>

      {/* 5. Deep Blue Footer */}
      <footer className="w-full bg-[#0e245c] text-slate-100 py-4 sm:py-5 px-4 text-center select-none mt-auto">
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
          initialSectionId={activeTab === 'resources' ? 'resource-rds' : undefined}
          onRefreshData={handleRefreshData}
          onPreviewDriveLink={(file) => setPreviewDriveFile(file)}
          onClose={() => setIsAdminPanelOpen(false)}
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

      {/* Real Login Modal with Password */}
      <LoginModal
        isOpen={isLoginModalOpen}
        users={users}
        onLoginSuccess={handleLoginSuccess}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
