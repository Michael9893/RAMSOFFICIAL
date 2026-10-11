import React, { useState } from 'react';
import { SopFile, getGoogleDriveEmbedUrl, isGoogleDocsUrl, isGoogleSheetsUrl } from '../lib/authStore.ts';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Eye,
  AlertCircle,
  Copy,
  Check,
  FileText,
  Calendar,
  User,
  Maximize2,
} from 'lucide-react';

interface GoogleDrivePreviewModalProps {
  file: SopFile | null;
  onClose: () => void;
}

export const GoogleDrivePreviewModal: React.FC<GoogleDrivePreviewModalProps> = ({
  file,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!file || !file.isDriveLink) return null;

  const rawUrl = file.driveUrl || file.fileData;
  const embedUrl = getGoogleDriveEmbedUrl(rawUrl);
  const isDoc = isGoogleDocsUrl(rawUrl);
  const isSheet = isGoogleSheetsUrl(rawUrl);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(rawUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`relative w-full ${
          isExpanded ? 'max-w-[96vw] h-[94vh]' : 'max-w-4xl max-h-[90vh]'
        } bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-200`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {/* Branding Icon */}
            {isDoc ? (
              /* Google Docs Blue Document SVG */
              <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    fill="#4285F4"
                  />
                  <path d="M14 2V8H20L14 2Z" fill="#A1C2FA" />
                  <path
                    d="M16 13H8M16 17H8M11 9H8"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : isSheet ? (
              /* Google Sheets Green Icon */
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    fill="#0F9D58"
                  />
                  <path d="M14 2V8H20L14 2Z" fill="#87CEAC" />
                  <path
                    d="M8 12H16M8 16H16M12 9V19"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            ) : (
              /* Google Drive Triangle Logo */
              <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                </svg>
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    isDoc
                      ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800'
                      : isSheet
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800'
                  }`}
                >
                  {isDoc
                    ? 'Google Docs Issuance'
                    : isSheet
                    ? 'Google Sheets Resource'
                    : 'Google Drive Resource'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate hidden sm:inline">
                  {file.sopTitle}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug mt-0.5 truncate">
                {file.fileName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Expand / Fullscreen */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer hidden sm:block"
              title={isExpanded ? 'Restore size' : 'Expand preview'}
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Link Info & Toolbar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 truncate max-w-md">
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium shrink-0">
              Link:
            </span>
            <span className="font-mono text-sky-700 dark:text-sky-400 text-[11px] truncate">
              {rawUrl}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <a
              href={rawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1 text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs ${
                isDoc
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-[#0284c7] hover:bg-[#0369a1]'
              }`}
            >
              <ExternalLink className="w-3 h-3" />
              <span>{isDoc ? 'Open in Google Docs' : 'Open in Google Drive'}</span>
            </a>
          </div>
        </div>

        {/* Preview Frame Container */}
        <div className="flex-1 p-3 sm:p-4 bg-slate-100 dark:bg-slate-950 overflow-hidden flex flex-col items-center justify-center min-h-[360px]">
          {embedUrl && !iframeError ? (
            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-xs bg-white dark:bg-slate-900 flex flex-col">
              <div className="bg-slate-50 dark:bg-slate-800 px-3.5 py-1.5 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 font-semibold">
                  <Eye className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                  <span>
                    {isDoc
                      ? 'Interactive Google Docs Viewer'
                      : 'Google Drive Document Viewer'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live Preview</span>
                </div>
              </div>
              <iframe
                src={embedUrl}
                title={file.fileName}
                className="w-full flex-1 min-h-[380px] sm:min-h-[440px] border-0 bg-white"
                allow="autoplay"
                onError={() => setIframeError(true)}
              />
            </div>
          ) : (
            /* Fallback Card Preview if frame blocked or folder */
            <div className="w-full max-w-lg p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                {isDoc ? (
                  <FileText className="w-8 h-8" />
                ) : (
                  <Eye className="w-8 h-8" />
                )}
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  {file.fileName}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  {file.description ||
                    'Official administrative issuance document for AD-RAMS Records Section.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Category:</span>
                  <span className="text-slate-900 dark:text-slate-200 font-semibold">
                    {file.sopTitle}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Uploaded By:</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {file.uploadedBy}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Date Added:</span>
                  <span className="text-slate-900 dark:text-slate-200">
                    {file.uploadedAt}
                  </span>
                </div>
              </div>

              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-2.5 px-4 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm ${
                  isDoc
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-[#0284c7] hover:bg-[#0369a1]'
                }`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>{isDoc ? 'Open in Google Docs' : 'Launch Google Drive Resource'}</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 shrink-0">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Verified Official AD-RAMS Administrative Issuance</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
