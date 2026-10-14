import React, { useState } from 'react';
import { AppUser, SopFile, uploadSopFile, getGoogleDriveEmbedUrl } from '../lib/authStore.ts';
import { createNotification } from '../lib/notificationStore.ts';
import {
  X,
  FileText,
  Link as LinkIcon,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

interface AdminIssuanceUploadModalProps {
  currentUser: AppUser;
  defaultYear?: '2025' | '2026';
  onClose: () => void;
  onSuccess: () => void;
  theme?: 'light' | 'dark';
}

export const AdminIssuanceUploadModal: React.FC<AdminIssuanceUploadModalProps> = ({
  currentUser,
  defaultYear = '2026',
  onClose,
  onSuccess,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const [selectedYear, setSelectedYear] = useState<'2025' | '2026'>(defaultYear);
  const [uploadMode, setUploadMode] = useState<'docs-link' | 'file'>('docs-link');

  // Fields
  const [issuanceType, setIssuanceType] = useState('Administrative Order');
  const [issuanceNumber, setIssuanceNumber] = useState('');
  const [title, setTitle] = useState('');
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [description, setDescription] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(true);

  // File upload state (for .docx / .pdf / .gdoc)
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // UI status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Live embed preview detection
  const detectedEmbedUrl = googleDocsUrl.trim() ? getGoogleDriveEmbedUrl(googleDocsUrl.trim()) : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError('');
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim()) {
      setError('Please provide an Issuance Title.');
      return;
    }

    const sopId = selectedYear === '2025' ? 'issuance-2025' : 'issuance-2026';
    const sopTitle = `Administrative Issuances ${selectedYear}`;
    const displayTitle = issuanceNumber.trim()
      ? `[${issuanceType} ${issuanceNumber.trim()}] ${title.trim()}`
      : `[${issuanceType}] ${title.trim()}`;

    setLoading(true);

    try {
      if (uploadMode === 'docs-link') {
        const url = googleDocsUrl.trim();
        if (!url) {
          setError('Please provide a Google Docs or Google Drive shareable link.');
          setLoading(false);
          return;
        }

        if (!url.includes('docs.google.com') && !url.includes('drive.google.com')) {
          setError('Please enter a valid Google Docs or Google Drive URL (e.g. docs.google.com/document/d/...).');
          setLoading(false);
          return;
        }

        const newFile: SopFile = {
          id: `issuance-${selectedYear}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sopId,
          sopTitle,
          fileName: displayTitle,
          fileSize: 'Google Docs',
          fileType: 'google-docs',
          fileData: url,
          isDriveLink: true,
          driveUrl: url,
          uploadedBy: currentUser.name ? `${currentUser.name} (${currentUser.email})` : currentUser.email,
          uploadedAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          description: description.trim() || `${issuanceType} Series of ${selectedYear} official records issuance.`,
          downloadCount: 0,
        };

        await uploadSopFile(newFile);

        // Auto-notify users
        if (notifyUsers) {
          await createNotification({
            type: 'upload',
            title: `New ${issuanceType} Published (Series ${selectedYear})`,
            message: `Admin published "${displayTitle}". Tap to preview the Google Docs issuance directly.`,
            createdBy: currentUser.email,
            priority: 'high',
            targetSection: sopId,
            targetTitle: sopTitle,
            fileId: newFile.id,
            fileUrl: url,
            isDriveLink: true,
          });
        }

        setSuccess(`Successfully posted Google Docs issuance for Series ${selectedYear}!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 800);
      } else {
        // Direct local file upload (.docx, .pdf, etc.)
        if (!selectedFile) {
          setError('Please choose a document file to upload.');
          setLoading(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string) || '';
          const sizeInKB = Math.round(selectedFile.size / 1024);
          const formattedSize = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

          const newFile: SopFile = {
            id: `issuance-${selectedYear}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sopId,
            sopTitle,
            fileName: displayTitle,
            fileSize: formattedSize,
            fileType: selectedFile.type || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileData: base64Data,
            isDriveLink: false,
            uploadedBy: currentUser.name ? `${currentUser.name} (${currentUser.email})` : currentUser.email,
            uploadedAt: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            description: description.trim() || `${issuanceType} Series of ${selectedYear} official records issuance.`,
            downloadCount: 0,
          };

          await uploadSopFile(newFile);

          if (notifyUsers) {
            await createNotification({
              type: 'upload',
              title: `New Administrative Issuance (${selectedYear})`,
              message: `Admin published "${displayTitle}" (${formattedSize}). Available now for download and preview.`,
              createdBy: currentUser.email,
              priority: 'normal',
              targetSection: sopId,
              targetTitle: sopTitle,
              fileId: newFile.id,
              isDriveLink: false,
            });
          }

          setSuccess(`Successfully uploaded issuance for Series ${selectedYear}!`);
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 800);
        };

        reader.onerror = () => {
          setError('Failed to read document file. Please try another file or use a Google Docs link.');
          setLoading(false);
        };

        reader.readAsDataURL(selectedFile);
      }
    } catch (err) {
      setError('Upload failed: ' + (err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-800/80 border-slate-700/80' : 'bg-gradient-to-r from-[#0d2159] to-[#1a388a] text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner">
              <FileText className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-400 text-slate-950 font-mono">
                  Admin Only
                </span>
                <span className="text-xs text-sky-200 font-semibold">
                  Administrative Issuances
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Upload Google Docs Administrative Issuance
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
          {/* Status Alert Messages */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{success}</span>
            </div>
          )}

          {/* Series Year & Format Choice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Issuance Series Year *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedYear('2026')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    selectedYear === '2026'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Series 2026</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20">Current</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedYear('2025')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    selectedYear === '2025'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Series 2025</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Upload Format *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('docs-link')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    uploadMode === 'docs-link'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Google Docs Link</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    uploadMode === 'file'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : isDark
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Document File</span>
                </button>
              </div>
            </div>
          </div>

          {/* Type & Issuance Code/Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Issuance Classification *
              </label>
              <select
                value={issuanceType}
                onChange={(e) => setIssuanceType(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none cursor-pointer ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                    : 'bg-white border-slate-300 text-slate-800 focus:border-sky-500'
                }`}
              >
                <option value="Administrative Order">Administrative Order (AO)</option>
                <option value="Memorandum Circular">Memorandum Circular (MC)</option>
                <option value="Regional Special Order">Regional Special Order (RSO)</option>
                <option value="Office Directive">Office Directive (OD)</option>
                <option value="Advisory">Administrative Advisory</option>
                <option value="Official Notice">Official Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Issuance Code / Number (Optional)
              </label>
              <input
                type="text"
                value={issuanceNumber}
                onChange={(e) => setIssuanceNumber(e.target.value)}
                placeholder="e.g. No. 04 s. 2026 or MC-2026-001"
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                }`}
              />
            </div>
          </div>

          {/* Issuance Title */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Issuance Document Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Revised Guidelines on Digitization and Archival of Official Records"
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
          </div>

          {/* Mode 1: Google Docs Link */}
          {uploadMode === 'docs-link' ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Google Docs / Google Drive Shareable Link *
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    value={googleDocsUrl}
                    onChange={(e) => setGoogleDocsUrl(e.target.value)}
                    placeholder="https://docs.google.com/document/d/.../edit or drive.google.com/file/d/..."
                    className={`w-full pl-9 pr-3 py-2 rounded-lg border font-mono text-xs focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  💡 Tip: Make sure the Google Docs link permissions are set to <strong>"Anyone with the link can view"</strong> so users can preview the document directly in the portal.
                </p>
              </div>

              {/* Detected Preview Banner */}
              {detectedEmbedUrl && (
                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sky-800 dark:text-sky-300">
                    <Eye className="w-4 h-4 text-sky-600" />
                    <span className="font-semibold text-xs">Google Docs Live Preview Ready</span>
                  </div>
                  <a
                    href={googleDocsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    <span>Test Open</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Direct Document File Upload (.docx / .doc / .pdf) */
            <div>
              <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Select Document File (.docx, .doc, .pdf) *
              </label>
              <div className={`p-4 rounded-xl border-2 border-dashed text-center ${
                isDark ? 'border-slate-700 bg-slate-800/40' : 'border-slate-300 bg-slate-50'
              }`}>
                <input
                  type="file"
                  id="issuance-file-input"
                  accept=".docx,.doc,.pdf,.odt,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="issuance-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
                >
                  <Upload className="w-7 h-7 text-sky-500" />
                  <span className="font-semibold text-xs text-sky-600 dark:text-sky-400">
                    {selectedFile ? selectedFile.name : 'Click to select document from computer'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {selectedFile ? `${Math.round(selectedFile.size / 1024)} KB` : 'Supports Word (.docx, .doc) and PDF files'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Description & Subject */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
              Brief Description / Subject (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of direct instructions, affected divisions, or operational scope..."
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
          </div>

          {/* Auto Notification Checkbox */}
          <div className="flex items-center gap-2.5 p-3 rounded-lg border border-sky-100 dark:border-sky-900 bg-sky-50/50 dark:bg-sky-950/30">
            <input
              type="checkbox"
              id="notify-users-check"
              checked={notifyUsers}
              onChange={(e) => setNotifyUsers(e.target.checked)}
              className="w-4 h-4 text-sky-600 rounded cursor-pointer"
            />
            <label htmlFor="notify-users-check" className="cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <strong>Send Notification Alert</strong>: Notify all portal users with an in-app alert banner & bell badge upon publishing.
            </label>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-semibold border transition-colors cursor-pointer ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Issuance...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Publish Administrative Issuance</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
