import React, { useState } from 'react';
import { SopFile, getGoogleDriveEmbedUrl } from '../lib/authStore.ts';
import { X, ExternalLink, ShieldCheck, Eye, Copy, Check, FileText } from 'lucide-react';

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

  if (!file || !file.isDriveLink) return null;

  const rawUrl = file.driveUrl || file.fileData;
  const embedUrl = getGoogleDriveEmbedUrl(rawUrl);
  const isGoogleDoc = rawUrl.includes('docs.google.com/document');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(rawUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            {/* Google Docs / Drive SVG Icon */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs border ${
              isGoogleDoc
                ? 'bg-blue-50 border-blue-200 text-blue-600'
                : 'bg-white border-slate-200 text-slate-700'
            }`}>
              {isGoogleDoc ? (
                <FileText className="w-5 h-5 text-blue-600" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  isGoogleDoc
                    ? 'text-blue-800 bg-blue-50 border-blue-200'
                    : 'text-sky-800 bg-sky-50 border-sky-200'
                }`}>
                  {isGoogleDoc ? 'Google Docs Document' : 'Google Drive Resource'}
                </span>
                <span className="text-[11px] text-slate-500 font-medium truncate hidden sm:inline">
                  {file.sopTitle}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mt-0.5 truncate">
                {file.fileName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Link Info Bar */}
        <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 text-slate-700 truncate max-w-lg">
            <span className="text-slate-400 text-[11px] font-medium">Link:</span>
            <span className="font-mono text-sky-700 text-[11px] truncate">{rawUrl}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Copied!</span>
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
              className="px-3 py-1 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{isGoogleDoc ? 'Open in Google Docs' : 'Open in Google Drive'}</span>
            </a>
          </div>
        </div>

        {/* Live Preview Viewer Container */}
        <div className="flex-1 p-2 sm:p-3 bg-slate-100 overflow-hidden flex flex-col">
          {embedUrl && !iframeError ? (
            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-300 shadow-sm bg-white flex flex-col">
              <div className="bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200 shrink-0">
                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <Eye className="w-3.5 h-3.5 text-sky-600" />
                  <span>{isGoogleDoc ? 'Google Docs Live Viewer' : 'Google Drive Embedded Viewer'}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Interactive Preview Mode</span>
              </div>
              <iframe
                src={embedUrl}
                title={file.fileName}
                className="w-full flex-1 border-0 bg-white"
                allow="autoplay"
                onError={() => setIframeError(true)}
              />
            </div>
          ) : (
            /* Fallback Card Preview */
            <div className="w-full max-w-lg m-auto p-6 bg-white border border-slate-200 rounded-2xl text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600">
                <FileText className="w-8 h-8 text-sky-600" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">{file.fileName}</h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  {file.description || 'Verified official document for DSWD FO-1 Records and Archives Management Section.'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Procedure:</span>
                  <span className="text-slate-900 font-semibold">{file.sopTitle}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Uploaded By:</span>
                  <span className="text-slate-900">{file.uploadedBy}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date Added:</span>
                  <span className="text-slate-900">{file.uploadedAt}</span>
                </div>
              </div>

              <a
                href={rawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Launch Document Online</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span className="flex items-center gap-1.5 font-medium text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official DSWD Shared Asset • Confidentiality Protected</span>
          </span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
