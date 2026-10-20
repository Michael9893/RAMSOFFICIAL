import React, { useState } from 'react';
import {
  AppUser,
  SopFile,
  deleteSopFile,
  getGoogleDriveEmbedUrl,
} from '../lib/authStore.ts';
import {
  Globe,
  ExternalLink,
  Upload,
  Lock,
  Edit2,
  Trash2,
  CheckCircle2,
  Layers,
  FileCheck2,
  Database,
  ShieldCheck,
  LifeBuoy,
  HeartHandshake,
  Copy,
  Check,
  Eye,
  RefreshCw,
  FolderArchive,
  ArrowRight,
} from 'lucide-react';
import { AdminFormUploadModal } from './AdminFormUploadModal.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';

interface RmdsViewProps {
  currentUser: AppUser | null;
  files: SopFile[];
  onPreviewDriveLink: (file: SopFile) => void;
  onRefreshData: () => void;
  onOpenLogin: () => void;
  onNavigateToTab?: (tab: 'client-satisfaction' | 'ticketing' | 'rmds') => void;
  theme?: 'light' | 'dark';
}

export const RmdsView: React.FC<RmdsViewProps> = ({
  currentUser,
  files,
  onRefreshData,
  onNavigateToTab,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState<SopFile | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Retrieve official RMDS link from files uploaded with sopId: 'rmds'
  const rmdsFiles = files.filter((f) => f.sopId === 'rmds');
  const primaryRmds = rmdsFiles[0] || null;
  const rawUrl = primaryRmds?.driveUrl || primaryRmds?.fileData || '';
  const embedUrl = rawUrl ? getGoogleDriveEmbedUrl(rawUrl) || rawUrl : null;

  const handleCopyLink = () => {
    if (!rawUrl) return;
    navigator.clipboard.writeText(rawUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeleteRmds = async () => {
    if (!docToDelete) return;
    await deleteSopFile(docToDelete.id);
    setDocToDelete(null);
    onRefreshData();
  };

  return (
    <div className="space-y-6">
      {/* Assistance & Feedback Forms Sub-Navigation */}
      <div className={`p-2.5 rounded-2xl border flex items-center justify-between gap-2 flex-wrap ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2">
            Assistance & Forms:
          </span>
          <button
            type="button"
            onClick={() => onNavigateToTab?.('client-satisfaction')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-white hover:shadow-2xs'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-rose-500" />
            <span>Client Satisfaction (CSF)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateToTab?.('ticketing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isDark
                ? 'text-slate-300 hover:bg-slate-800'
                : 'text-slate-700 hover:bg-white hover:shadow-2xs'
            }`}
          >
            <LifeBuoy className="w-3.5 h-3.5 text-amber-500" />
            <span>Ticketing Support</span>
          </button>

          <button
            type="button"
            className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-default flex items-center gap-1.5 bg-blue-600 text-white shadow-xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>RMDS Portal</span>
          </button>
        </div>

        {isAdmin ? (
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{primaryRmds ? 'Update RMDS Website Link' : 'Upload RMDS Website Link'}</span>
          </button>
        ) : (
          <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium px-2">
            <Lock className="w-3 h-3 text-amber-500" />
            <span>Official Portal Link Maintained by Admin</span>
          </span>
        )}
      </div>

      {/* Hero Header */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-colors ${
        isDark
          ? 'bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border-slate-800'
          : 'bg-gradient-to-r from-blue-50 via-sky-50/50 to-indigo-50/40 border-blue-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white shadow-2xs">
                RMDS System
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 border border-sky-500/20">
                Records Management & Disposal System
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                AD-RAMS Region 1
              </span>
            </div>

            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Records Management and Disposal System (RMDS)
            </h1>

            <p className={`text-xs sm:text-sm leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Centralized web platform for regional records inventory, retention scheduling, disposition tracking,
              and disposal monitoring in compliance with National Archives of the Philippines (NAP) standards.
            </p>
          </div>

          {/* Quick Status Box */}
          <div className={`p-4 rounded-xl border flex items-center gap-3.5 shrink-0 ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-blue-200/80 shadow-xs'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  System Status
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              </div>
              <span className={`text-[11px] block mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {primaryRmds ? 'Official Website Link Configured' : 'Awaiting Administrator Link'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {primaryRmds && rawUrl ? (
        <div className="space-y-5">
          {/* Active RMDS Link Bar */}
          <div className={`p-5 rounded-2xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
                <Globe className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white truncate">
                    {primaryRmds.fileName || 'Official RMDS Website Portal'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20">
                    Official Portal
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                  <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 truncate max-w-md">
                    {rawUrl}
                  </span>
                  <span>•</span>
                  <span>Updated: {primaryRmds.uploadedAt}</span>
                  {primaryRmds.uploadedBy && (
                    <>
                      <span>•</span>
                      <span>By: {primaryRmds.uploadedBy}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
              <button
                type="button"
                onClick={handleCopyLink}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
                title="Copy portal URL"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>

              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <span>Open RMDS Website</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Edit / Replace RMDS Link"
                  >
                    <Edit2 className="w-4 h-4 text-sky-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocToDelete(primaryRmds)}
                    className="p-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove RMDS Website Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Embedded Web Viewport with Fallback and Direct Access */}
          <div className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 ml-2 truncate max-w-sm">
                  {rawUrl}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  <span>RMDS Web Viewport</span>
                </span>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline text-[11px]"
                >
                  <span>Launch External</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="w-full relative min-h-[550px] h-[700px] bg-slate-50 dark:bg-slate-950 flex flex-col">
              {embedUrl && (
                <iframe
                  src={embedUrl}
                  title="Official RMDS Web Portal Preview"
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                  onLoad={() => setIframeLoaded(true)}
                />
              )}

              {/* Informative fallback overlay / banner in case target portal blocks framing via X-Frame-Options */}
              <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border-t border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>
                    Note: If your browser or internal network restricts embedding this portal inside a frame, you can open it directly in a dedicated tab.
                  </span>
                </div>
                <a
                  href={rawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Open RMDS Website Directly</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State: Awaiting Admin Link Upload */
        <div className={`p-10 sm:p-14 rounded-2xl border text-center space-y-6 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto border border-blue-500/20">
            <Globe className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              No RMDS Website Link Uploaded Yet
            </h3>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              The Records Administrator can upload the official website or web link for the RMDS
              (Records Management and Disposal System). Once configured, users can access and open the portal directly from here.
            </p>
          </div>

          {isAdmin ? (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload RMDS Website Link (Admin)</span>
              </button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Awaiting Administrator to upload the official RMDS portal link</span>
            </div>
          )}
        </div>
      )}

      {/* RMDS Operational Guidelines & Capabilities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className={`p-5 rounded-2xl border space-y-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <FolderArchive className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Records Inventory & Appraisal
          </h4>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Systematic classification and identification of regional records under the approved Records Disposition Schedule (RDS).
          </p>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            Disposal of Valueless Records
          </h4>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Documenting requests for disposal, NAP inspection compliance, certificate of disposal generation, and post-disposal documentation.
          </p>
        </div>

        <div className={`p-5 rounded-2xl border space-y-2 ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            NAP & ARTA Compliance
          </h4>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Alignment with National Archives Act of 2007 (RA 9470) and Ease of Doing Business Act standards for regional governance.
          </p>
        </div>
      </div>

      {/* Admin Upload / Edit Modal */}
      {isUploadModalOpen && (
        <AdminFormUploadModal
          isOpen={true}
          onClose={() => setIsUploadModalOpen(false)}
          currentUser={currentUser}
          sectionId="rmds"
          sectionTitle="RMDS (Records Management and Disposal System)"
          onRefreshData={() => {
            onRefreshData();
            setIsUploadModalOpen(false);
          }}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal */}
      {docToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle={docToDelete.fileName}
          onConfirm={handleDeleteRmds}
          onClose={() => setDocToDelete(null)}
        />
      )}
    </div>
  );
};
