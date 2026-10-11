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
  Filter,
  Calendar,
  FolderOpen,
  X,
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

  // Filter issuances
  const allIssuances = files.filter(
    (f) => f.sopId === 'issuance-2025' || f.sopId === 'issuance-2026'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'drive' | 'file'>('all');

  // Delete modal state
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  // Filtered files list based on selected year, search, and type
  const displayedFiles = allIssuances.filter((file) => {
    // Year filter
    if (selectedYear === '2025' && file.sopId !== 'issuance-2025') return false;
    if (selectedYear === '2026' && file.sopId !== 'issuance-2026') return false;

    // Type filter
    if (filterType === 'drive' && !file.isDriveLink) return false;
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
            Official Administrative Orders, Memorandum Circulars, and Office Directives (Series 2025 & 2026)
          </p>
        </div>

        {/* Repository Records Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`px-3.5 py-2 rounded-lg border text-xs font-semibold flex items-center gap-2 shadow-xs ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <FolderOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>{displayedFiles.length} Records Available</span>
          </div>
        </div>
      </div>

      {/* 3. Year Selector Pills & Search Bar */}
      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
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
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedYear === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
            }`}>
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
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedYear === '2025' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
            }`}>
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
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              selectedYear === '2026' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
            }`}>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issuances, orders, links..."
              className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs focus:outline-none transition-colors border ${
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border focus:outline-none cursor-pointer ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-white border-slate-300 text-slate-700'
            }`}
          >
            <option value="all">All File Types</option>
            <option value="drive">Google Drive Links Only</option>
            <option value="file">Local Documents Only</option>
          </select>
        </div>
      </div>

      {/* 4. Desktop View: Rich Issuances Table */}
      <div className={`hidden md:block rounded-xl border overflow-hidden shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={isDark ? 'bg-slate-800/80 border-b border-slate-700/80' : 'bg-slate-100/80 border-b border-slate-200'}>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-[#dc2626] w-14 text-center">
                Year
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-[#dc2626]">
                Issuance Title & Description
              </th>
              <th className="py-3 px-4 font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-36">
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
          <tbody className={`divide-y text-xs ${isDark ? 'divide-slate-800' : 'divide-slate-200/80'}`}>
            {displayedFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center space-y-2.5">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                    <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      No administrative issuances uploaded yet
                    </p>
                    <p className="text-xs text-slate-400 max-w-md">
                      {searchQuery
                        ? 'No documents matched your search filter. Try clearing the search box.'
                        : 'This section is currently empty. Official issuances, circulars, and Google Drive links will appear here once uploaded by the records administrator.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              displayedFiles.map((file) => {
                const is2025 = file.sopId === 'issuance-2025';
                return (
                  <tr
                    key={file.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-slate-800/50' : 'hover:bg-sky-50/40'
                    }`}
                  >
                    {/* Year badge */}
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        is2025
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                      }`}>
                        {is2025 ? '2025' : '2026'}
                      </span>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        {file.isDriveLink ? (
                          <div className="w-6 h-6 rounded bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300/40 flex items-center justify-center shrink-0 mt-0.5">
                            <LinkIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-300/40 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                          </div>
                        )}
                        <div>
                          <p className={`font-semibold text-xs sm:text-[13px] leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
                      {file.isDriveLink ? (
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
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">{file.uploadedBy}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Preview */}
                        <button
                          onClick={() => {
                            if (file.isDriveLink) {
                              onPreviewDriveLink(file);
                            } else {
                              onPreviewFile(file);
                            }
                          }}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                          title="Preview document or Google Drive contents"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview</span>
                        </button>

                        {/* Open in Drive if drive link */}
                        {file.isDriveLink && (
                          <a
                            href={file.driveUrl || file.fileData}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                            title="Open Google Drive folder or document in new tab"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Drive</span>
                          </a>
                        )}

                        {/* Download for local file */}
                        {!file.isDriveLink && (
                          <button
                            onClick={() => handleDownload(file)}
                            className={`p-1 border rounded transition-colors cursor-pointer ${
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
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
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

      {/* 5. Mobile View: Responsive Card Grid (Accessible on Mobile) */}
      <div className="md:hidden space-y-3.5">
        {displayedFiles.length === 0 ? (
          <div className={`p-8 text-center rounded-xl border ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
          }`}>
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-2.5">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className={`font-bold text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              No administrative issuances uploaded yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery
                ? 'Try adjusting your search filters'
                : 'Official issuances and Google Drive links will appear here once uploaded by the administrator.'}
            </p>
          </div>
        ) : (
          displayedFiles.map((file) => {
            const is2025 = file.sopId === 'issuance-2025';
            return (
              <div
                key={file.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      is2025
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {is2025 ? '2025 Series' : '2026 Series'}
                    </span>
                    {file.isDriveLink ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40">
                        Google Drive
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {file.fileSize}
                      </span>
                    )}
                  </div>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Delete issuance"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Title and description */}
                <div>
                  <h4 className={`text-sm font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {file.fileName}
                  </h4>
                  {file.description && (
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {file.description}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                    {file.uploadedAt}
                  </p>
                </div>

                {/* Actions row */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (file.isDriveLink) {
                        onPreviewDriveLink(file);
                      } else {
                        onPreviewFile(file);
                      }
                    }}
                    className="flex-1 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {file.isDriveLink ? (
                    <a
                      href={file.driveUrl || file.fileData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Drive</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => handleDownload(file)}
                      className={`flex-1 py-2 border rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  )}
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
    </div>
  );
};
