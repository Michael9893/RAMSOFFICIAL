import React, { useState, useRef } from 'react';
import { AppUser, SopFile, uploadSopFile, deleteSopFile } from '../lib/authStore.ts';
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Link as LinkIcon,
  Eye,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Shield,
  Lock,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';

interface ResourcesViewProps {
  currentUser: AppUser | null;
  files: SopFile[];
  onPreviewDriveLink: (file: SopFile) => void;
  onRefreshData: () => void;
  onOpenLogin: () => void;
  theme?: 'light' | 'dark';
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  currentUser,
  files,
  onPreviewDriveLink,
  onRefreshData,
  onOpenLogin,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  // Filter for Records Disposition Schedule files
  const rdsFiles = files.filter((f) => f.sopId === 'resource-rds');

  // Delete modal state
  const [fileToDelete, setFileToDelete] = useState<{ id: string; name: string } | null>(null);

  // In-page upload modal state for Admin
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDescription, setFileDescription] = useState('');
  const [driveTitle, setDriveTitle] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [driveDescription, setDriveDescription] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Handle Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'admin') {
      setUploadError('Only administrators can upload resources.');
      return;
    }

    if (uploadMode === 'file') {
      if (!selectedFile) {
        setUploadError('Please select a file to upload.');
        return;
      }

      setUploadLoading(true);
      setUploadError('');
      setUploadSuccess('');

      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = (reader.result as string) || '';
          const sizeInKB = Math.round(selectedFile.size / 1024);
          const formattedSize = sizeInKB > 1024 ? `${(sizeInKB / 1024).toFixed(1)} MB` : `${sizeInKB} KB`;

          const newFile: SopFile = {
            id: `rds-file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sopId: 'resource-rds',
            sopTitle: 'Records Disposition Schedule (RDS)',
            fileName: selectedFile.name,
            fileSize: formattedSize,
            fileType: selectedFile.type || 'application/pdf',
            fileData: base64Data,
            isDriveLink: false,
            uploadedBy: currentUser.email,
            uploadedAt: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Records Administration Management Section FO 01`,
            description: fileDescription.trim() || '',
            downloadCount: 0,
          };

          await uploadSopFile(newFile);
          onRefreshData();
          setSelectedFile(null);
          setFileDescription('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setUploadSuccess(`Successfully uploaded "${newFile.fileName}" to Records Disposition Schedule!`);
          setUploadLoading(false);
          setTimeout(() => {
            setIsUploadModalOpen(false);
            setUploadSuccess('');
          }, 1500);
        };

        reader.onerror = () => {
          setUploadError('Failed to read file. Please try again.');
          setUploadLoading(false);
        };

        reader.readAsDataURL(selectedFile);
      } catch (err) {
        setUploadError('Upload failed: ' + (err as Error).message);
        setUploadLoading(false);
      }
    } else {
      // Google Drive Link
      if (!driveTitle.trim() || !driveUrl.trim()) {
        setUploadError('Please enter both a Title and a valid Google Drive link.');
        return;
      }

      if (!driveUrl.includes('drive.google.com') && !driveUrl.includes('docs.google.com')) {
        setUploadError('Please provide a valid Google Drive or Google Docs link (drive.google.com or docs.google.com).');
        return;
      }

      setUploadLoading(true);
      setUploadError('');
      setUploadSuccess('');

      try {
        const newDriveFile: SopFile = {
          id: `rds-drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sopId: 'resource-rds',
          sopTitle: 'Records Disposition Schedule (RDS)',
          fileName: driveTitle.trim(),
          fileSize: 'Google Drive',
          fileType: 'google-drive',
          fileData: driveUrl.trim(),
          isDriveLink: true,
          driveUrl: driveUrl.trim(),
          uploadedBy: currentUser.email,
          uploadedAt: `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} Records Administration Management Section FO 01`,
          description: driveDescription.trim() || '',
          downloadCount: 0,
        };

        await uploadSopFile(newDriveFile);
        onRefreshData();
        setDriveTitle('');
        setDriveUrl('');
        setDriveDescription('');
        setUploadSuccess(`Successfully added Google Drive link "${newDriveFile.fileName}"!`);
        setTimeout(() => {
          setIsUploadModalOpen(false);
          setUploadSuccess('');
        }, 1500);
      } catch (err) {
        setUploadError('Failed to save link: ' + (err as Error).message);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  return (
    <div className={`w-full space-y-8 animate-in fade-in duration-200 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* 1. DISCLAIMER NOTICE Section (Exact match to screenshot) */}
      <section className={`space-y-2 border pb-7 p-5 rounded-xl ${
        isDark ? 'bg-red-950/20 border-red-900/40 text-slate-200' : 'bg-red-50/40 border-red-100 text-slate-800'
      }`}>
        <h2 className="text-[#dc2626] font-bold text-sm sm:text-[15px] tracking-wide uppercase flex items-center gap-2">
          <span>DISCLAIMER NOTICE:</span>
        </h2>
        <p className={`text-xs sm:text-[13.5px] leading-relaxed italic font-normal max-w-7xl ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          This correspondence and any file transmitted with it are CONFIDENTIAL and intended solely for the use of individuals or entities to whom this is addressed. Access by anyone else is strictly unauthorized. If you are not the intended recipient, any disclosure, copying, distribution or any other action taken or omitted to be taken in reliance on it is prohibited and unlawful. It shall justify the AD-RAMS to exercise whatever rights and remedies under the applicable laws, rules and regulations. In such case, please notify the AD-RAMS and subsequently return this correspondence.
        </p>
      </section>

      {/* 2. Main Two-Column Layout (Matching screenshot) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start pt-2">
        
        {/* Left Column (Table of Files / Resources) - 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Action Bar */}
          <div className={`flex items-center justify-between pb-2 border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Official RDS Documents & Drive Links ({rdsFiles.length})
              </span>
            </div>

            {/* Admin Upload Trigger */}
            {currentUser?.role === 'admin' ? (
              <button
                onClick={() => {
                  setUploadError('');
                  setUploadSuccess('');
                  setIsUploadModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Upload Resource / Drive Link</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>View & Download Only</span>
              </div>
            )}
          </div>

          {/* Table Container with horizontal scrolling on mobile */}
          <div className={`border rounded-xl overflow-hidden shadow-sm ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead className={`border-b text-[11px] uppercase tracking-wider ${
                  isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}>
                  <tr>
                    <th className="px-4 py-3 font-bold text-[#dc2626]">TITLE</th>
                    <th className="px-4 py-3 font-semibold text-slate-500 dark:text-slate-400">LAST MODIFIED</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-500 dark:text-slate-400">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {rdsFiles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-xs">
                      No Records Disposition Schedule documents uploaded yet.
                      {currentUser?.role === 'admin' && (
                        <button
                          onClick={() => setIsUploadModalOpen(true)}
                          className="block mx-auto mt-2 text-sky-600 hover:underline cursor-pointer font-medium"
                        >
                          Click here to upload the first file or Google Drive link.
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rdsFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Title & Icon */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {file.isDriveLink ? (
                            /* Google Drive Icon */
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                                <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                                <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                                <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                                <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                                <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                              </svg>
                            </div>
                          ) : (
                            /* Red PDF Icon matching screenshot */
                            <div className="w-5 h-5 flex items-center justify-center shrink-0">
                              <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#ef4444] fill-current">
                                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-2v1h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm5 0h-2v2h2c.28 0 .5-.22.5-.5s-.22-.5-.5-.5zm-7-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5H9v2H7.5v-5zm6 0H17v1.5h-2v1h1.5V13H15v2h-1.5v-5zm-3 0h2c.83 0 1.5.67 1.5 1.5v2c0 .83-.67 1.5-1.5 1.5h-2v-5z"/>
                              </svg>
                            </div>
                          )}
                          <div>
                            <span
                              onClick={() => {
                                if (file.isDriveLink) onPreviewDriveLink(file);
                                else handleDownload(file);
                              }}
                              className="font-medium text-slate-800 hover:text-sky-600 transition-colors cursor-pointer"
                            >
                              {file.fileName}
                            </span>
                            {file.isDriveLink && (
                              <span className="ml-2 px-1.5 py-0.2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-bold rounded uppercase">
                                Drive Link
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Last Modified */}
                      <td className="px-4 py-3.5 text-slate-600 text-[11.5px] whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {file.uploadedAt.split(' ')[0]} {file.uploadedAt.split(' ')[1]}
                        </span>{' '}
                        <span className="text-slate-500">
                          {file.uploadedAt.split(' ').slice(2).join(' ') || 'Records Administration Management Section FO 01'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        {file.isDriveLink ? (
                          <>
                            <button
                              onClick={() => onPreviewDriveLink(file)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Preview Google Drive link"
                            >
                              <Eye className="w-3 h-3" />
                              <span>Preview</span>
                            </button>
                            <a
                              href={file.driveUrl || file.fileData}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded text-[11px] font-semibold transition-colors"
                              title="Open Google Drive link directly"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Open</span>
                            </a>
                          </>
                        ) : (
                          <button
                            onClick={() => handleDownload(file)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                            title="Download file"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        )}

                        {/* Admin Delete */}
                        {currentUser?.role === 'admin' && (
                          <button
                            onClick={() => setFileToDelete({ id: file.id, name: file.fileName })}
                            className="inline-flex items-center p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer ml-1"
                            title="Delete resource"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Right Column (Explanatory Text matching screenshot) - 5 cols */}
        <div className="lg:col-span-5 bg-[#0d2159] border border-[#1b3478] rounded-xl p-6 sm:p-7 shadow-sm space-y-4 text-white">
          <div className="space-y-3">
            <p className="text-white text-sm sm:text-[15px] leading-relaxed font-normal">
              This section contains essential records management resources including the Updated Records Disposition Schedule (RDS), which serves as the primary reference for the identification and categorization of records and provides directives on when to dispose of records.
            </p>
          </div>

          <div className="pt-4 border-t border-white/20 space-y-3 text-xs text-sky-100">
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Reference Authority:</strong> National Archives of the Philippines (NAP) and DSWD Central Office Guidelines.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Compliance:</strong> Field Office 1 staff must consult the RDS prior to submitting requests for disposal of valueless records.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-sky-300 mt-1.5 shrink-0" />
              <span>
                <strong className="text-white">Inquiries:</strong> Direct questions to <span className="text-amber-300 font-mono bg-white/10 px-1.5 py-0.5 rounded">rams.fo1@dswd.gov.ph</span>.
              </span>
            </div>
          </div>
        </div>

      </section>

      {/* 3. In-App Upload Modal for Admin (Upload files or Google Drive links like in SOPs) */}
      {isUploadModalOpen && currentUser?.role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-100 border border-sky-200 rounded-lg text-sky-700">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Upload Resource to RDS Repository
                  </h3>
                  <p className="text-xs text-slate-500">
                    Records Disposition Schedule (RDS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200 w-fit">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'file'
                      ? 'bg-[#0284c7] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Upload Local File</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUploadMode('drive')}
                  className={`px-3.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    uploadMode === 'drive'
                      ? 'bg-[#0284c7] text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Add Google Drive Link</span>
                </button>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              {uploadMode === 'file' ? (
                /* Local File Mode */
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Resource Description / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={fileDescription}
                      onChange={(e) => setFileDescription(e.target.value)}
                      placeholder="e.g. Approved 2025 Revised Disposition Schedule Form"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select File (PDF, DOCX, XLSX, Images) *
                    </label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/40 rounded-xl p-6 text-center cursor-pointer transition-colors"
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setSelectedFile(e.target.files[0]);
                            setUploadError('');
                          }
                        }}
                        className="hidden"
                      />
                      <Upload className="w-8 h-8 text-sky-600 mx-auto mb-2" />
                      {selectedFile ? (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-emerald-700 block">
                            Selected: {selectedFile.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Size: {Math.round(selectedFile.size / 1024)} KB · Click to change file
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-slate-700 block">
                            Click to browse files or drag and drop here
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Supports PDF, DOCX, XLS, PNG, JPG, and ZIP files
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Google Drive Link Mode */
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Resource Title *
                    </label>
                    <input
                      type="text"
                      value={driveTitle}
                      onChange={(e) => setDriveTitle(e.target.value)}
                      placeholder="e.g. Official Google Drive Folder: Records Disposition Schedule 2025"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Google Drive Link URL *
                    </label>
                    <input
                      type="url"
                      value={driveUrl}
                      onChange={(e) => setDriveUrl(e.target.value)}
                      placeholder="https://drive.google.com/drive/folders/... or https://docs.google.com/..."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Description / Notes for Users (Optional)
                    </label>
                    <input
                      type="text"
                      value={driveDescription}
                      onChange={(e) => setDriveDescription(e.target.value)}
                      placeholder="e.g. Master shared folder with all RDS reference circulars."
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                </div>
              )}

              {/* Status notifications */}
              {uploadSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadLoading}
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  {uploadMode === 'file' ? <Upload className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                  <span>{uploadLoading ? 'Uploading...' : uploadMode === 'file' ? 'Upload File' : 'Add Drive Link'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={!!fileToDelete}
        itemTitle={fileToDelete?.name || ''}
        onConfirm={handleExecuteDelete}
        onClose={() => setFileToDelete(null)}
      />
    </div>
  );
};
