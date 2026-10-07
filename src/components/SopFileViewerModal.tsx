import React, { useState } from 'react';
import { SopFile, AppUser, deleteSopFile } from '../lib/authStore.ts';
import {
  X,
  Download,
  FileText,
  ExternalLink,
  Upload,
  Lock,
  FileCheck,
  Link as LinkIcon,
  Eye,
  Trash2,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';

interface SopFileViewerModalProps {
  sopId: string | null;
  sopTitle: string | null;
  sopIcon?: React.ReactNode;
  files: SopFile[];
  currentUser: AppUser | null;
  onOpenAdminUpload: (sopId: string) => void;
  onPreviewDriveLink: (file: SopFile) => void;
  onRefreshData: () => void;
  onClose: () => void;
}

export const SopFileViewerModal: React.FC<SopFileViewerModalProps> = ({
  sopId,
  sopTitle,
  sopIcon,
  files,
  currentUser,
  onOpenAdminUpload,
  onPreviewDriveLink,
  onRefreshData,
  onClose,
}) => {
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  if (!sopId || !sopTitle) return null;

  const sopFiles = files.filter((f) => f.sopId === sopId);

  const handleDownload = (file: SopFile) => {
    const link = document.createElement('a');
    link.href = file.fileData;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteDelete = async () => {
    if (!fileToDelete) return;
    await deleteSopFile(fileToDelete.id);
    onRefreshData();
    setFileToDelete(null);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-start justify-between p-5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-3">
              {sopIcon ? (
                <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-xs">
                  {sopIcon}
                </div>
              ) : (
                <div className="p-2.5 bg-sky-100 border border-sky-200 rounded-xl text-sky-700 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  Official Repository Documents & Drive Links
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug mt-1">
                  {sopTitle}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Permission Banner */}
          <div className="px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <span className="text-[11px] text-slate-500 font-medium">Status:</span>
              {currentUser ? (
                <>
                  <span className="font-semibold text-slate-900">{currentUser.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-100 border border-amber-300 text-amber-900 font-black'
                        : 'bg-slate-100 border border-slate-300 text-slate-700'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </>
              ) : (
                <span className="text-slate-500 font-medium">Guest / View Only</span>
              )}
            </div>

            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => {
                  onClose();
                  onOpenAdminUpload(sopId);
                }}
                className="text-[11px] text-[#0284c7] hover:text-[#0369a1] font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>+ Upload File / Drive Link</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>View, Download & Preview Only</span>
              </span>
            )}
          </div>

          {/* Files List */}
          <div className="p-5 overflow-y-auto space-y-3 flex-1 text-xs text-slate-700 bg-white">
            {sopFiles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <p>No documents or Google Drive links added for this section yet.</p>
                {currentUser?.role === 'admin' && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminUpload(sopId);
                    }}
                    className="px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resource Now</span>
                  </button>
                )}
              </div>
            ) : (
              sopFiles.map((file) => (
                <div
                  key={file.id}
                  className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-sky-50/40 hover:border-sky-300 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {file.isDriveLink ? (
                        <LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <FileCheck className="w-4 h-4 text-sky-600 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-900 truncate block">
                        {file.fileName}
                      </span>
                      {file.isDriveLink && (
                        <span className="px-1.5 py-0.2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-bold rounded uppercase shrink-0">
                          Drive Link
                        </span>
                      )}
                    </div>
                    {file.description && (
                      <p className="text-[11px] text-slate-600 mt-1 pl-6 leading-relaxed">
                        {file.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5 pl-6 font-mono">
                      <span>{file.fileSize}</span>
                      <span>•</span>
                      <span>Added: {file.uploadedAt}</span>
                    </div>
                  </div>

                  {/* Actions: Preview, Download, Open, Delete */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Google Drive Link Preview & Open */}
                    {file.isDriveLink ? (
                      <>
                        <button
                          onClick={() => onPreviewDriveLink(file)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          title="Preview Google Drive link before opening"
                        >
                          <Eye className="w-3 h-3 text-sky-600" />
                          <span>Preview</span>
                        </button>

                        <a
                          href={file.driveUrl || file.fileData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded text-[11px] font-semibold transition-colors"
                          title="Open Google Drive directly"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open</span>
                        </a>
                      </>
                    ) : (
                      /* Local Uploaded File Download */
                      <>
                        <a
                          href={file.fileData}
                          download={file.fileName}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded text-[11px] font-semibold transition-colors cursor-pointer shadow-sm"
                          title="Download document file"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </>
                    )}

                    {/* Admin-only Delete Button */}
                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer ml-1"
                        title="Delete resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
            <span>DSWD Records & Archives Management Section</span>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!fileToDelete}
        itemTitle={fileToDelete?.name || ''}
        onConfirm={handleExecuteDelete}
        onClose={() => setFileToDelete(null)}
      />
    </>
  );
};
