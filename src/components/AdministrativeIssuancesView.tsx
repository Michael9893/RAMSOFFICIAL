import React, { useState, useRef } from 'react';
import {
  AppUser,
  SopFile,
  deleteSopFile,
  uploadSopFile,
  isGoogleDocsUrl,
  getGoogleDriveEmbedUrl,
} from '../lib/authStore.ts';
import {
  FileText,
  Download,
  Trash2,
  Link as LinkIcon,
  Eye,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  FolderOpen,
  X,
  Plus,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileUp,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';

interface AdministrativeIssuancesViewProps {
  currentUser: AppUser | null;
  files: SopFile[];
  selectedYear: 'all' | '2025' | '2026';
  onSelectYear: (year: 'all' | '2025' | '2026') => void;
  onPreviewDriveLink: (file: SopFile) => void;
  onPreviewFile: (file: SopFile) => void;
  onRefreshData: () => void;
  onOpenLogin: () => void;
  theme?: 'light' | 'dark';
}

export const AdministrativeIssuancesView: React.FC<AdministrativeIssuancesViewProps> = ({
  currentUser,
  files,
  selectedYear,
  onSelectYear,
  onPreviewDriveLink,
  onPreviewFile,
  onRefreshData,
  onOpenLogin,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';

  // Filter issuances for 2025, 2026, and general issuances series
  const allIssuances = files.filter(
    (f) => f.sopId === 'issuance-2025' || f.sopId === 'issuance-2026' || f.sopId === 'issuances'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'docs' | 'drive' | 'file'>('all');

  // Delete modal state
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadSeriesYear, setUploadSeriesYear] = useState<'2025' | '2026'>('2026');
  const [uploadMode, setUploadMode] = useState<'docs' | 'file'>('docs');
  const [docTitle, setDocTitle] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [selectedLocalFile, setSelectedLocalFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to determine year for a file
  const isFile2025 = (f: SopFile) => {
    if (f.sopId === 'issuance-2025') return true;
    if (f.sopId === 'issuances' && f.fileName.includes('2025')) return true;
    return false;
  };

  // Filtered files list based on selected year, search, and type
  const displayedFiles = allIssuances.filter((file) => {
    // Year filter
    const file2025 = isFile2025(file);
    if (selectedYear === '2025' && !file2025) return false;
    if (selectedYear === '2026' && file2025) return false;

    // Type filter
    const rawUrl = file.driveUrl || file.fileData;
    const isDoc = file.isDriveLink && isGoogleDocsUrl(rawUrl);
    if (filterType === 'docs' && !isDoc) return false;
    if (filterType === 'drive' && (!file.isDriveLink || isDoc)) return false;
    if (filterType === 'file' && file.isDriveLink) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = file.fileName.toLowerCase().includes(q);
      const matchDesc = (file.description || '').toLowerCase().includes(q);
      const matchAuthor = file.uploadedBy.toLowerCase().includes(q);
      const matchDate = file.uploadedAt.toLowerCase().includes(q);
      return matchName || matchDesc || matchAuthor || matchDate;
    }

    return true;
  });

  const count2025 = allIssuances.filter((f) => isFile2025(f)).length;
  const count2026 = allIssuances.filter((f) => !isFile2025(f)).length;

  // Handle Download
  const handleDownload = (file: SopFile) => {
    if (file.isDriveLink) {
      onPreviewDriveLink(file);
      return;
    }
    const link = document.createElement('a');
    link.href = file.fileData;
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Delete
  const handleExecuteDelete = async () => {
    if (!fileToDelete) return;
    await deleteSopFile(fileToDelete.id);
    onRefreshData();
    setFileToDelete(null);
  };

  // Handle Upload Form Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError('');
    setUploadSuccess('');

    if (!docTitle.trim()) {
      setUploadError('Please enter an Issuance Title (e.g. Administrative Order No. 04 s. 2026).');
      return;
    }

    const uploaderEmail = currentUser?.email || 'admin@dswd.gov.ph';
    const targetSopId = uploadSeriesYear === '2025' ? 'issuance-2025' : 'issuance-2026';
    const targetSopTitle =
      uploadSeriesYear === '2025'
        ? 'Administrative Issuances 2025'
        : 'Administrative Issuances 2026';

    const formattedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (uploadMode === 'docs') {
      // Google Docs or Drive link
      let normalizedUrl = docUrl.trim();
      if (!normalizedUrl) {
        setUploadError('Please paste a valid Google Docs or Google Drive link.');
        return;
      }

      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      setUploadLoading(true);
      try {
        const isDoc = isGoogleDocsUrl(normalizedUrl);
        const newDocFile: SopFile = {
          id: `issuance-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sopId: targetSopId,
          sopTitle: targetSopTitle,
          fileName: docTitle.trim(),
          fileSize: isDoc ? 'Google Docs' : 'Google Drive',
          fileType: isDoc ? 'google-docs' : 'google-drive',
          fileData: normalizedUrl,
          isDriveLink: true,
          driveUrl: normalizedUrl,
          uploadedBy: uploaderEmail,
          uploadedAt: formattedDate,
          description: docDescription.trim(),
          downloadCount: 0,
        };

        await uploadSopFile(newDocFile);
        onRefreshData();
        setUploadSuccess(
          `Successfully posted "${newDocFile.fileName}" to Series ${uploadSeriesYear}!`
        );
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setDocTitle('');
          setDocUrl('');
          setDocDescription('');
          setUploadSuccess('');
          setUploadLoading(false);
        }, 1200);
      } catch (err) {
        setUploadError('Failed to save Google Docs link: ' + (err as Error).message);
        setUploadLoading(false);
      }
    } else {
      // Local File Upload
      if (!selectedLocalFile) {
        setUploadError('Please select a document file (PDF, DOCX, XLSX).');
        return;
      }

      setUploadLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64Data = reader.result as string;
            const fileSizeStr =
              selectedLocalFile.size > 1024 * 1024
                ? `${(selectedLocalFile.size / (1024 * 1024)).toFixed(1)} MB`
                : `${Math.round(selectedLocalFile.size / 1024)} KB`;

            const newFile: SopFile = {
              id: `issuance-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sopId: targetSopId,
              sopTitle: targetSopTitle,
              fileName: docTitle.trim(),
              fileSize: fileSizeStr,
              fileType: selectedLocalFile.type || 'application/pdf',
              fileData: base64Data,
              isDriveLink: false,
              uploadedBy: uploaderEmail,
              uploadedAt: formattedDate,
              description: docDescription.trim(),
              downloadCount: 0,
            };

            await uploadSopFile(newFile);
            onRefreshData();
            setUploadSuccess(
              `Successfully uploaded "${newFile.fileName}" to Series ${uploadSeriesYear}!`
            );
            setTimeout(() => {
              setIsUploadModalOpen(false);
              setDocTitle('');
              setSelectedLocalFile(null);
              setDocDescription('');
              if (fileInputRef.current) fileInputRef.current.value = '';
              setUploadSuccess('');
              setUploadLoading(false);
            }, 1200);
          } catch (e) {
            setUploadError('Failed to process file: ' + (e as Error).message);
            setUploadLoading(false);
          }
        };
        reader.onerror = () => {
          setUploadError('Failed to read file from disk.');
          setUploadLoading(false);
        };
        reader.readAsDataURL(selectedLocalFile);
      } catch (err) {
        setUploadError('Upload failed: ' + (err as Error).message);
        setUploadLoading(false);
      }
    }
  };

  // Check if current input in upload modal has a previewable embed URL
  const testEmbedUrl = docUrl ? getGoogleDriveEmbedUrl(docUrl) : null;
  const isInputDoc = isGoogleDocsUrl(docUrl);

  return (
    <div
      className={`w-full space-y-6 sm:space-y-8 animate-in fade-in duration-200 ${
        isDark ? 'text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* 1. DISCLAIMER NOTICE Section */}
      <section
        className={`space-y-2 border pb-5 sm:pb-6 p-4 sm:p-5 rounded-xl ${
          isDark
            ? 'bg-red-950/20 border-red-900/40 text-slate-200'
            : 'bg-red-50/50 border-red-100 text-slate-800'
        }`}
      >
        <h2 className="text-[#dc2626] font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2">
          <span>DISCLAIMER NOTICE:</span>
        </h2>
        <p
          className={`text-xs sm:text-[13px] leading-relaxed italic font-normal max-w-7xl ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}
        >
          This section contains official Department of Social Welfare and Development Administrative
          Issuances, Memorandum Circulars, and Regional Special Orders. Unauthorized distribution,
          tampering, or reproduction is strictly prohibited and subject to legal actions under civil
          service rules.
        </p>
      </section>

      {/* 2. Header & Action Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 ${
              isDark ? 'text-white' : 'text-[#0d2159]'
            }`}
          >
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-sky-500" />
            <span>Administrative Issuances</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Official Administrative Orders, Memorandum Circulars, and Office Directives (Series
            2025 & 2026) with Google Docs & Drive live preview
          </p>
        </div>

        {/* Action Buttons: Add Issuance & Records Count */}
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          {/* Direct Upload / Add Google Docs Link Button */}
          <button
            onClick={() => {
              setIsUploadModalOpen(true);
              setUploadSeriesYear(selectedYear === '2025' ? '2025' : '2026');
              setUploadError('');
              setUploadSuccess('');
            }}
            className="px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Issuance / Google Docs Link</span>
          </button>

          {/* Repository Records Badge */}
          <div
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>{displayedFiles.length} Records Available</span>
          </div>
        </div>
      </div>

      {/* 3. Year Selector Pills & Search Bar */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Year Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSelectYear('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedYear === 'all'
                ? 'bg-[#0d2159] text-white shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>All Issuances</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedYear === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}
            >
              {allIssuances.length}
            </span>
          </button>

          <button
            onClick={() => onSelectYear('2025')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedYear === '2025'
                ? 'bg-[#0284c7] text-white shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>Series 2025</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedYear === '2025'
                  ? 'bg-white/20 text-white'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {count2025}
            </span>
          </button>

          <button
            onClick={() => onSelectYear('2026')}
            className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedYear === '2026'
                ? 'bg-[#0284c7] text-white shadow-sm'
                : isDark
                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
            }`}
          >
            <span>Series 2026</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedYear === '2026'
                  ? 'bg-white/20 text-white'
                  : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}
            >
              {count2026}
            </span>
          </button>
        </div>

        {/* Search & Filter Type */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issuances, orders, links..."
              className={`w-full pl-9 pr-8 py-1.5 rounded-lg text-xs focus:outline-none transition-colors border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">All File Formats</option>
            <option value="docs">Google Docs Only</option>
            <option value="drive">Google Drive Only</option>
            <option value="file">Local Files Only</option>
          </select>
        </div>
      </div>

      {/* 4. Desktop View: Rich Issuances Table */}
      <div
        className={`hidden md:block rounded-xl border overflow-hidden shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className={
                isDark
                  ? 'bg-slate-800/80 border-b border-slate-700/80'
                  : 'bg-slate-100/80 border-b border-slate-200'
              }
            >
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-[#dc2626] w-14 text-center">
                Year
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-[#dc2626]">
                Issuance Title & Description
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-40">
                Format
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-44">
                Uploaded At
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-52 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            className={`divide-y text-xs ${isDark ? 'divide-slate-800' : 'divide-slate-200/80'}`}
          >
            {displayedFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <p
                      className={`font-bold text-sm ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      No administrative issuances uploaded yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-md">
                      {searchQuery
                        ? 'No documents matched your search filter. Try clearing the search box.'
                        : 'Official issuances, circulars, and Google Docs links will appear here once uploaded by the records administrator.'}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-2 px-4 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Upload First Issuance / Google Doc</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              displayedFiles.map((file) => {
                const is2025 = file.sopId === 'issuance-2025';
                const rawUrl = file.driveUrl || file.fileData;
                const isDoc = file.isDriveLink && isGoogleDocsUrl(rawUrl);

                return (
                  <tr
                    key={file.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-sky-50/40'
                    }`}
                  >
                    {/* Year badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          is2025
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {is2025 ? '2025' : '2026'}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        {isDoc ? (
                          /* Blue Google Docs Document Icon */
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
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
                        ) : file.isDriveLink ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/40 flex items-center justify-center shrink-0 mt-0.5">
                            <LinkIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300/40 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          </div>
                        )}
                        <div>
                          <p
                            className={`font-semibold text-xs sm:text-[13px] leading-snug ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {file.fileName}
                          </p>
                          {file.description && (
                            <p
                              className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-3.5 px-4">
                      {isDoc ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800">
                          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                              fill="#4285F4"
                            />
                            <path d="M14 2V8H20L14 2Z" fill="#A1C2FA" />
                          </svg>
                          <span>Google Docs</span>
                        </span>
                      ) : file.isDriveLink ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/40">
                          Google Drive
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          {file.fileSize}
                        </span>
                      )}
                    </td>

                    {/* Upload info */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      <div>{file.uploadedAt}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                        {file.uploadedBy}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview button */}
                        <button
                          onClick={() => {
                            if (file.isDriveLink) {
                              onPreviewDriveLink(file);
                            } else {
                              onPreviewFile(file);
                            }
                          }}
                          className={`px-2.5 py-1 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
                            isDoc
                              ? 'bg-blue-600 hover:bg-blue-700'
                              : 'bg-sky-600 hover:bg-sky-700'
                          }`}
                          title={
                            isDoc
                              ? 'Preview Google Docs document live'
                              : 'Preview document contents'
                          }
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>

                        {/* Open in Google Docs / Drive in new tab */}
                        {file.isDriveLink && (
                          <a
                            href={rawUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-2 py-1 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer ${
                              isDoc
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                            }`}
                            title={
                              isDoc
                                ? 'Open Google Docs in new tab'
                                : 'Open Google Drive link in new tab'
                            }
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{isDoc ? 'Docs' : 'Drive'}</span>
                          </a>
                        )}

                        {/* Download for local file */}
                        {!file.isDriveLink && (
                          <button
                            onClick={() => handleDownload(file)}
                            className={`p-1 border rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                            }`}
                            title="Download document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete for Admin */}
                        {isAdmin && (
                          <button
                            onClick={() =>
                              setFileToDelete({ id: file.id, name: file.fileName })
                            }
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete issuance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Mobile View: Responsive Card Grid */}
      <div className="md:hidden space-y-3.5">
        {displayedFiles.length === 0 ? (
          <div
            className={`p-8 text-center rounded-xl border ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-400'
                : 'bg-white border-slate-200 text-slate-500'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p
              className={`font-bold text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              No administrative issuances uploaded yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'Try adjusting your search filters'
                : 'Official issuances and Google Docs links will appear here once uploaded by the administrator.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="mt-3 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                + Add Google Doc / Issuance
              </button>
            )}
          </div>
        ) : (
          displayedFiles.map((file) => {
            const is2025 = file.sopId === 'issuance-2025';
            const rawUrl = file.driveUrl || file.fileData;
            const isDoc = file.isDriveLink && isGoogleDocsUrl(rawUrl);

            return (
              <div
                key={file.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isDark
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        is2025
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      Series {is2025 ? '2025' : '2026'}
                    </span>

                    {isDoc ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/70 dark:text-blue-300">
                        Google Docs
                      </span>
                    ) : file.isDriveLink ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
                        Google Drive
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {file.fileSize}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title & Desc */}
                <div className="space-y-1">
                  <h4
                    className={`font-bold text-xs sm:text-sm leading-snug ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {file.fileName}
                  </h4>
                  {file.description && (
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}
                    >
                      {file.description}
                    </p>
                  )}
                </div>

                {/* Meta & Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{file.uploadedAt}</span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (file.isDriveLink) {
                          onPreviewDriveLink(file);
                        } else {
                          onPreviewFile(file);
                        }
                      }}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {file.isDriveLink && (
                      <a
                        href={rawUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open</span>
                      </a>
                    )}

                    {!file.isDriveLink && (
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1 border border-slate-300 rounded text-slate-700 dark:text-slate-300"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* 6. UPLOAD ISSUANCE / GOOGLE DOCS LINK MODAL */}
      {/* ======================================================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-xs">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    Post Administrative Issuance
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload official directive or link live Google Docs for user preview
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUploadSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Year Series Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Administrative Issuances Series *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUploadSeriesYear('2025')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadSeriesYear === '2025'
                        ? 'bg-[#0284c7] text-white border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Series 2025</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadSeriesYear('2026')}
                    className={`py-2 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadSeriesYear === '2026'
                        ? 'bg-[#0284c7] text-white border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-sky-50'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Series 2026 (Current)</span>
                  </button>
                </div>
              </div>

              {/* Upload Mode Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Issuance Format *
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setUploadMode('docs')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadMode === 'docs'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                    }`}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Google Docs / Drive Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`py-2.5 px-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      uploadMode === 'file'
                        ? 'bg-[#0284c7] text-white border-sky-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Local Document File</span>
                  </button>
                </div>
              </div>

              {/* Issuance Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Issuance Title & Reference Number *
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="e.g. Administrative Order No. 04, Series of 2026"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  }`}
                />
              </div>

              {/* Mode 1: Google Docs / Drive Link */}
              {uploadMode === 'docs' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Google Docs / Google Drive URL *
                    </label>
                    <div className="relative">
                      <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="url"
                        autoComplete="off"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://docs.google.com/document/d/..."
                        className={`w-full pl-9 pr-3.5 py-2.5 text-xs font-mono rounded-xl border focus:outline-none transition-colors ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500'
                        }`}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Paste a shareable Google Docs link or Google Drive link with viewing access.
                    </p>
                  </div>

                  {/* Live Validation & Embed Status Preview */}
                  {docUrl && (
                    <div
                      className={`p-3 rounded-xl border text-xs space-y-2 ${
                        testEmbedUrl
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                          : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold">
                        {testEmbedUrl ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>
                              {isInputDoc
                                ? 'Valid Google Docs Link Detected'
                                : 'Valid Google Drive Link Detected'}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            <span>Checking link format... Make sure it includes document ID</span>
                          </>
                        )}
                      </div>

                      {/* Mini Live Preview Frame */}
                      {testEmbedUrl && (
                        <div className="mt-2 rounded-lg border border-blue-200 dark:border-blue-800 overflow-hidden bg-white shadow-2xs">
                          <div className="bg-blue-100/70 dark:bg-blue-900/60 px-3 py-1 text-[10px] font-bold text-blue-900 dark:text-blue-200 flex items-center justify-between">
                            <span>Live Document Preview Check</span>
                            <span className="text-[9.5px] uppercase font-mono">Interactive</span>
                          </div>
                          <iframe
                            src={testEmbedUrl}
                            title="Live Test Preview"
                            className="w-full h-36 border-0 bg-white"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Mode 2: Local File */
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Document File *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedLocalFile(e.target.files[0]);
                        if (!docTitle) {
                          setDocTitle(
                            e.target.files[0].name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
                          );
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-200'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  />
                  {selectedLocalFile && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>
                        Selected: {selectedLocalFile.name} (
                        {Math.round(selectedLocalFile.size / 1024)} KB)
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Description / Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Subject Summary (Optional)
                </label>
                <textarea
                  rows={3}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="e.g. Guidelines on the disposal of valueless records and archival compliance for regional offices."
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  }`}
                />
              </div>

              {/* Status alerts */}
              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}
              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-900 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={uploadLoading}
                  className={`px-5 py-2 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2 disabled:opacity-50 ${
                    uploadMode === 'docs'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-[#0284c7] hover:bg-[#0369a1]'
                  }`}
                >
                  {uploadLoading ? (
                    <span>Posting Issuance...</span>
                  ) : (
                    <>
                      <FileUp className="w-4 h-4" />
                      <span>Post to Series {uploadSeriesYear}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!fileToDelete}
        itemTitle={fileToDelete?.name || ''}
        onConfirm={handleExecuteDelete}
        onClose={() => setFileToDelete(null)}
      />
    </div>
  );
};
