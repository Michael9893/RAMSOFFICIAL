import React, { useState } from 'react';
import { AppUser, SopFile, deleteSopFile } from '../lib/authStore.ts';
import {
  FileText,
  Download,
  Trash2,
  Link as LinkIcon,
  Eye,
  ExternalLink,
  Search,
  Calendar,
  FolderOpen,
  X,
  Sparkles,
  Plus,
  Lock,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { AdminIssuanceUploadModal } from './AdminIssuanceUploadModal.tsx';

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

  // Filter issuances for 2025 & 2026
  const allIssuances = files.filter(
    (f) => f.sopId === 'issuance-2025' || f.sopId === 'issuance-2026'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'docs' | 'file'>('all');

  // Delete modal state
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  // Admin upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Filtered files list based on selected year, search, and type
  const displayedFiles = allIssuances.filter((file) => {
    // Year filter
    if (selectedYear === '2025' && file.sopId !== 'issuance-2025') return false;
    if (selectedYear === '2026' && file.sopId !== 'issuance-2026') return false;

    // Type filter
    if (filterType === 'docs' && !file.isDriveLink) return false;
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

  const count2025 = allIssuances.filter((f) => f.sopId === 'issuance-2025').length;
  const count2026 = allIssuances.filter((f) => f.sopId === 'issuance-2026').length;
  const countDocs = allIssuances.filter((f) => f.isDriveLink).length;

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

  return (
    <div className={`w-full space-y-6 sm:space-y-8 animate-in fade-in duration-200 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* 1. DISCLAIMER NOTICE Section */}
      <section className={`space-y-2 border pb-5 sm:pb-6 p-4 sm:p-5 rounded-xl ${
        isDark ? 'bg-red-950/20 border-red-900/40 text-slate-200' : 'bg-red-50/50 border-red-100 text-slate-800'
      }`}>
        <h2 className="text-[#dc2626] font-bold text-xs sm:text-sm tracking-wide uppercase flex items-center gap-2">
          <span>DISCLAIMER NOTICE:</span>
        </h2>
        <p className={`text-xs sm:text-[13px] leading-relaxed italic font-normal max-w-7xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          This section contains official Department of Social Welfare and Development Administrative Issuances, Memorandum Circulars, and Regional Special Orders. Unauthorized distribution, tampering, or reproduction is strictly prohibited and subject to legal actions under civil service rules.
        </p>
      </section>

      {/* 2. Header & Action Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5 ${isDark ? 'text-white' : 'text-[#0d2159]'}`}>
            <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-sky-500" />
            <span>Administrative Issuances</span>
          </h2>
          <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Official Administrative Orders, Memorandum Circulars, and Directives (Series 2025 & 2026) with Google Docs Preview
          </p>
        </div>

        {/* Right Info: Records Badge & Admin Upload Action */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <div className={`px-3.5 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 shadow-2xs ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>{displayedFiles.length} Records</span>
          </div>

          {isAdmin ? (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
              title="Upload official administrative issuance Google Docs or file"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Issuance (Google Docs)</span>
              <span className="px-1.5 py-0.2 bg-black/20 text-[10px] uppercase tracking-wider rounded font-semibold text-emerald-100">
                Admin
              </span>
            </button>
          ) : (
            <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark ? 'bg-slate-900/90 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}>
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Uploads restricted to Admin</span>
              <button
                onClick={onOpenLogin}
                className="underline text-sky-600 dark:text-sky-400 font-semibold hover:text-sky-700 cursor-pointer"
              >
                Admin Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. High-Visibility Search Bar & Interactive Filter Control */}
      <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {/* Full-Width Prominent Search Input */}
        <div className="relative w-full">
          <Search className="w-5 h-5 text-sky-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search issuances by title, AO/MC number, directive keywords, uploader, or date..."
            className={`w-full pl-11 pr-10 py-3 rounded-xl text-xs sm:text-sm font-medium focus:outline-none transition-all border ${
              isDark
                ? 'bg-slate-800/90 border-slate-700 text-white placeholder-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20'
                : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-500 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-500/20'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Series Year Pills & Format Filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Year Switcher Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Series:
            </span>
            <button
              onClick={() => onSelectYear('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedYear === 'all'
                  ? 'bg-[#0d2159] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>All Series</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedYear === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
              }`}>
                {allIssuances.length}
              </span>
            </button>

            <button
              onClick={() => onSelectYear('2026')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedYear === '2026'
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Series 2026</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedYear === '2026' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}>
                {count2026}
              </span>
            </button>

            <button
              onClick={() => onSelectYear('2025')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedYear === '2025'
                  ? 'bg-[#0284c7] text-white shadow-sm'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>Series 2025</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedYear === '2025' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
              }`}>
                {count2025}
              </span>
            </button>
          </div>

          {/* Quick Format Filter Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
              Format:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setFilterType('docs')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'docs'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Google Docs ({countDocs})</span>
            </button>
            <button
              onClick={() => setFilterType('file')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                filterType === 'file'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3 h-3" />
              <span>Files</span>
            </button>
          </div>
        </div>

        {/* Live Filter Indicator Bar */}
        {searchQuery && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong>{displayedFiles.length}</strong> result{displayedFiles.length === 1 ? '' : 's'} matching &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
            >
              Reset Search
            </button>
          </div>
        )}
      </div>

      {/* 4. Desktop View: Rich Issuances Table with Live Preview */}
      <div className={`hidden md:block rounded-2xl border overflow-hidden shadow-xs ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={isDark ? 'bg-slate-800/80 border-b border-slate-700/80' : 'bg-slate-100/80 border-b border-slate-200'}>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-[#dc2626] w-16 text-center">
                Series
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-[#dc2626]">
                Administrative Issuance Title & Scope
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-36">
                Format
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-44">
                Uploaded By & Date
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-56 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y text-xs ${isDark ? 'divide-slate-800' : 'divide-slate-200/80'}`}>
            {displayedFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 flex items-center justify-center text-sky-600">
                      <FolderOpen className="w-7 h-7" />
                    </div>
                    <div>
                      <p className={`font-bold text-base ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                        {searchQuery ? 'No issuances match your search' : 'No administrative issuances available'}
                      </p>
                      <p className="text-xs text-slate-400 max-w-md mt-1">
                        {searchQuery
                          ? `No directives found for "${searchQuery}". Try searching with another term or clearing the filter.`
                          : 'Official administrative issuances, orders, and memorandum circulars with Google Docs preview will appear here once published by the administrator.'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              displayedFiles.map((file) => {
                const is2025 = file.sopId === 'issuance-2025';
                const isGoogleDocs = file.isDriveLink;

                return (
                  <tr
                    key={file.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-sky-50/50'
                    }`}
                  >
                    {/* Year badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        is2025
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}>
                        {is2025 ? '2025' : '2026'}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        {isGoogleDocs ? (
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/40 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <LinkIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-300/40 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          </div>
                        )}
                        <div>
                          <p className={`font-bold text-xs sm:text-[13px] leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {file.fileName}
                          </p>
                          {file.description && (
                            <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {file.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Format */}
                    <td className="py-3.5 px-4">
                      {isGoogleDocs ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40">
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Google Docs</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                          {file.fileSize}
                        </span>
                      )}
                    </td>

                    {/* Upload info */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      <div className="font-medium text-slate-700 dark:text-slate-300">{file.uploadedAt}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[160px]">{file.uploadedBy}</div>
                    </td>

                    {/* Actions: Live Preview Feature for Users */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Interactive Preview Button */}
                        <button
                          onClick={() => {
                            if (file.isDriveLink) {
                              onPreviewDriveLink(file);
                            } else {
                              onPreviewFile(file);
                            }
                          }}
                          className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg text-[11px] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          title="Preview document live inside the portal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        {/* Open in Google Docs */}
                        {file.isDriveLink && (
                          <a
                            href={file.driveUrl || file.fileData}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Open Google Docs in a new browser tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Docs</span>
                          </a>
                        )}

                        {/* Download for local file */}
                        {!file.isDriveLink && (
                          <button
                            onClick={() => handleDownload(file)}
                            className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                              isDark
                                ? 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                            }`}
                            title="Download document file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete for Admin Only */}
                        {isAdmin && (
                          <button
                            onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                            title="Delete administrative issuance (Admin only)"
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
          <div className={`p-8 text-center rounded-2xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No administrative issuances found
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'Try adjusting your search criteria.'
                : 'Google Docs issuances will appear here once published by the administrator.'}
            </p>
          </div>
        ) : (
          displayedFiles.map((file) => {
            const is2025 = file.sopId === 'issuance-2025';
            return (
              <div
                key={file.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      is2025
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}>
                      {is2025 ? '2025' : '2026'}
                    </span>
                    {file.isDriveLink ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <LinkIcon className="w-3 h-3" />
                        <span>Google Docs</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {file.fileSize}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete issuance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {file.fileName}
                  </h4>
                  {file.description && (
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {file.description}
                    </p>
                  )}
                </div>

                {/* Footer Metadata & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    {file.uploadedAt}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (file.isDriveLink) {
                          onPreviewDriveLink(file);
                        } else {
                          onPreviewFile(file);
                        }
                      }}
                      className="px-3 py-1.5 bg-[#0284c7] text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {file.isDriveLink ? (
                      <a
                        href={file.driveUrl || file.fileData}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center shadow-2xs"
                        title="Open in Google Docs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => handleDownload(file)}
                        className="p-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
                        title="Download file"
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

      {/* Confirm Delete Modal */}
      {fileToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle={fileToDelete.name}
          onConfirm={handleExecuteDelete}
          onClose={() => setFileToDelete(null)}
        />
      )}

      {/* Admin Issuance Upload Modal (Google Docs & Files with live preview & broadcast) */}
      {isUploadModalOpen && currentUser && (
        <AdminIssuanceUploadModal
          currentUser={currentUser}
          defaultYear={selectedYear === '2025' ? '2025' : '2026'}
          onClose={() => setIsUploadModalOpen(false)}
          onSuccess={() => {
            setIsUploadModalOpen(false);
            onRefreshData();
          }}
          theme={theme}
        />
      )}
    </div>
  );
};
