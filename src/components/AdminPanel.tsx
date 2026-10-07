import React, { useState, useRef } from 'react';
import {
  AppUser,
  SopFile,
  UserRole,
  createUser,
  updateUserRole,
  deleteUser,
  uploadSopFile,
  deleteSopFile,
  ALL_UPLOADABLE_SECTIONS,
  SOP_CATEGORIES,
  TEMPLATE_CATEGORIES,
  RESOURCE_CATEGORIES,
} from '../lib/authStore.ts';
import {
  Shield,
  Upload,
  UserPlus,
  Users,
  FileText,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
  ExternalLink,
  FileUp,
  FolderOpen,
  Link as LinkIcon,
  Eye,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';

interface AdminPanelProps {
  currentUser: AppUser;
  users: AppUser[];
  sopFiles: SopFile[];
  initialSectionId?: string;
  onRefreshData: () => void;
  onPreviewDriveLink: (file: SopFile) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentUser,
  users,
  sopFiles,
  initialSectionId,
  onRefreshData,
  onPreviewDriveLink,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'users'>('upload');
  const [uploadMode, setUploadMode] = useState<'file' | 'drive'>('file');

  // Selected Target Section (Resources, SOPs, or Templates)
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId || ALL_UPLOADABLE_SECTIONS[0].id);

  // Upload file state
  const [fileDescription, setFileDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive Link state
  const [driveTitle, setDriveTitle] = useState('');
  const [driveUrl, setDriveUrl] = useState('');
  const [driveDescription, setDriveDescription] = useState('');

  // In-app Delete Confirmation State (Fixes iframe confirm bug!)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; name: string } | null>(null);
  const [userToDelete, setUserToDelete] = useState<{ id: string; name: string } | null>(null);

  // Create User state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('dswd123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [createLoading, setCreateLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState('');
  const [createError, setCreateError] = useState('');

  // Role edit message
  const [roleMessage, setRoleMessage] = useState('');

  // Access check: only Admin can access AdminPanel
  if (currentUser.role !== 'admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Access Denied (Admin Only)</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your account (<span className="text-sky-700 font-mono font-semibold">{currentUser.email}</span>) has the <strong className="text-rose-700">User</strong> role. Users can only view, download, and open links. Users cannot switch to admin or access administrative tools.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Return to Portal
          </button>
        </div>
      </div>
    );
  }

  // Handle File Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setUploadError('');
    }
  };

  // Handle Upload Submit
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const targetSection = ALL_UPLOADABLE_SECTIONS.find((s) => s.id === selectedSectionId);
    const targetTitle = targetSection?.title || selectedSectionId;

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
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sopId: selectedSectionId,
            sopTitle: targetTitle,
            fileName: selectedFile.name,
            fileSize: formattedSize,
            fileType: selectedFile.type || 'application/octet-stream',
            fileData: base64Data,
            isDriveLink: false,
            uploadedBy: currentUser.email,
            uploadedAt: new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            description: fileDescription.trim() || '',
            downloadCount: 0,
          };

          await uploadSopFile(newFile);
          onRefreshData();
          setSelectedFile(null);
          setFileDescription('');
          if (fileInputRef.current) fileInputRef.current.value = '';
          setUploadSuccess(`Successfully uploaded "${newFile.fileName}" for ${newFile.sopTitle}!`);
          setUploadLoading(false);
        };
        reader.onerror = () => {
          setUploadError('Failed to read file. Please try another file.');
          setUploadLoading(false);
        };
        reader.readAsDataURL(selectedFile);
      } catch (err) {
        setUploadError('Upload failed: ' + (err as Error).message);
        setUploadLoading(false);
      }
    } else {
      // Google Drive Link Upload
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
          id: `drive-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sopId: selectedSectionId,
          sopTitle: targetTitle,
          fileName: driveTitle.trim(),
          fileSize: 'Google Drive',
          fileType: 'google-drive',
          fileData: driveUrl.trim(),
          isDriveLink: true,
          driveUrl: driveUrl.trim(),
          uploadedBy: currentUser.email,
          uploadedAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          description: driveDescription.trim() || '',
          downloadCount: 0,
        };

        await uploadSopFile(newDriveFile);
        onRefreshData();
        setDriveTitle('');
        setDriveUrl('');
        setDriveDescription('');
        setUploadSuccess(`Successfully added Google Drive link "${newDriveFile.fileName}" for ${targetTitle}!`);
      } catch (err) {
        setUploadError('Failed to save link: ' + (err as Error).message);
      } finally {
        setUploadLoading(false);
      }
    }
  };

  // Confirmed Delete Function (100% iframe safe, zero window.confirm dependency)
  const handleExecuteDeleteFile = async () => {
    if (!itemToDelete) return;
    await deleteSopFile(itemToDelete.id);
    onRefreshData();
    setItemToDelete(null);
  };

  const handleExecuteDeleteUser = async () => {
    if (!userToDelete) return;
    await deleteUser(userToDelete.id);
    onRefreshData();
    setUserToDelete(null);
  };

  // Handle Create User Submit
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
      setCreateError('Please provide full name, email address, and initial password.');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === newUserEmail.trim().toLowerCase())) {
      setCreateError('A user account with this email address already exists.');
      return;
    }

    setCreateLoading(true);
    setCreateError('');
    setCreateSuccess('');

    try {
      await createUser({
        name: newUserName.trim(),
        email: newUserEmail.trim().toLowerCase(),
        password: newUserPassword.trim(),
        role: newUserRole,
        status: 'active',
      });
      onRefreshData();
      setCreateSuccess(`Account created for ${newUserName} (${newUserRole.toUpperCase()}) with password: "${newUserPassword.trim()}"!`);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('dswd123');
      setNewUserRole('user');
    } catch (err) {
      setCreateError('Failed to create account: ' + (err as Error).message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Edit Role
  const handleRoleChange = async (userId: string, targetRole: UserRole) => {
    try {
      await updateUserRole(userId, targetRole);
      onRefreshData();
      setRoleMessage(`User role successfully changed to ${targetRole.toUpperCase()}.`);
      setTimeout(() => setRoleMessage(''), 3500);
    } catch (err) {
      setRoleMessage('Failed to update role.');
    }
  };

  // Filter files for currently selected section
  const filteredFiles = sopFiles.filter((f) => f.sopId === selectedSectionId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50 text-slate-900 overflow-y-auto animate-in fade-in duration-200">
      {/* Top Admin Header */}
      <header className="w-full bg-[#0d2159] border-b border-[#1b3478] px-6 sm:px-10 py-3.5 flex items-center justify-between shrink-0 shadow-sm text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer border border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Portal</span>
          </button>
          <div className="h-5 w-px bg-white/20 mx-1" />
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white/15 border border-white/30 rounded text-white shadow-inner">
              <Shield className="w-4 h-4" />
            </span>
            <span className="font-extrabold text-sm sm:text-base tracking-wide text-white">
              AD-RAMS Administration Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="hidden sm:flex items-center gap-2 bg-[#173273] border border-[#2b4c9e] px-3 py-1.5 rounded-lg text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sky-200">Logged in as:</span>
            <strong className="text-white">{currentUser.name}</strong>
            <span className="px-1.5 py-0.2 bg-amber-400 text-slate-950 text-[10px] font-black rounded uppercase">
              Admin
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition-colors cursor-pointer shadow-sm"
          >
            Exit Admin
          </button>
        </div>
      </header>

      {/* Admin Tabs */}
      <div className="bg-white border-b border-slate-200 px-6 sm:px-10 flex gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('upload')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'upload'
              ? 'border-[#0284c7] text-[#0284c7] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileUp className="w-4 h-4" />
          <span>SOP & Templates File/Drive Management</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-600 font-bold">
            {sopFiles.length} items
          </span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-3.5 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'users'
              ? 'border-[#0284c7] text-[#0284c7] font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Account Creation & Role Editor</span>
          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] text-slate-600 font-bold">
            {users.length} accounts
          </span>
        </button>
      </div>

      {/* Main Admin Area */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto space-y-8 bg-slate-50">
        
        {/* TAB 1: SOP & TEMPLATES FILE/DRIVE UPLOADS */}
        {activeTab === 'upload' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-sky-600" />
                Upload Documents & Google Drive Links
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Upload local files or add Google Drive links for Standard Operating Procedures (SOPs), Records Disposition Schedule (RDS), or Template Categories.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg w-fit border border-slate-200">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
                className={`px-4 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  uploadMode === 'drive'
                    ? 'bg-[#0284c7] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Add Google Drive Link</span>
              </button>
            </div>

            {/* Upload Box */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {/* Target Selection: SOP or Template */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Section, SOP or Template Category *
                  </label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                  >
                    <optgroup label="Resources & Mandates">
                      {RESOURCE_CATEGORIES.map((res) => (
                        <option key={res.id} value={res.id}>
                          Resource: {res.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Standard Operating Procedures (SOPs)">
                      {SOP_CATEGORIES.map((sop) => (
                        <option key={sop.id} value={sop.id}>
                          SOP: {sop.title}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Templates Categories">
                      {TEMPLATE_CATEGORIES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          Template: {tpl.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {uploadMode === 'file' ? (
                  /* LOCAL FILE UPLOAD */
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Document Description / Notes (Optional)
                      </label>
                      <input
                        type="text"
                        value={fileDescription}
                        onChange={(e) => setFileDescription(e.target.value)}
                        placeholder="e.g. Approved 2025 Revised Disposition Schedule Form"
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Select File (PDF, DOCX, XLSX, Images) *
                      </label>
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/30 rounded-xl p-6 text-center cursor-pointer transition-colors"
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileChange}
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
                  /* GOOGLE DRIVE LINK MODE */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                          Resource Title *
                        </label>
                        <input
                          type="text"
                          value={driveTitle}
                          onChange={(e) => setDriveTitle(e.target.value)}
                          placeholder="e.g. 2025 Regional General Forms Google Drive Folder"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
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
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Instructions / Description for Users (Optional)
                      </label>
                      <input
                        type="text"
                        value={driveDescription}
                        onChange={(e) => setDriveDescription(e.target.value)}
                        placeholder="e.g. Official Google Drive folder containing templates and forms."
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                )}

                {/* Notifications */}
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

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={uploadLoading}
                    className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    {uploadMode === 'file' ? <Upload className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                    <span>
                      {uploadLoading
                        ? 'Saving...'
                        : uploadMode === 'file'
                        ? 'Upload File'
                        : 'Add Google Drive Link'}
                    </span>
                  </button>
                </div>
              </form>
            </div>

            {/* List of Files and Google Drive Links with FIXED DELETE Function */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 text-sky-600" />
                    Uploaded Files & Links for:{' '}
                    <span className="text-sky-700">
                      {ALL_UPLOADABLE_SECTIONS.find((s) => s.id === selectedSectionId)?.title}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {filteredFiles.length} item(s) found. Admins can preview Google Drive links, download files, or delete items permanently.
                  </p>
                </div>
              </div>

              {filteredFiles.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs shadow-xs">
                  No files or Google Drive links added for this section yet. Use the upload box above to add files.
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                      <tr>
                        <th className="px-4 py-3">Resource / File Name</th>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Uploaded By</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 font-medium text-slate-900">
                              {file.isDriveLink ? (
                                <LinkIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                              ) : (
                                <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                              )}
                              <span className="truncate max-w-xs">{file.fileName}</span>
                            </div>
                            {file.description && (
                              <p className="text-[11px] text-slate-500 mt-0.5 pl-6">
                                {file.description}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-[11px]">
                            {file.isDriveLink ? (
                              <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded font-semibold text-[10px]">
                                Google Drive
                              </span>
                            ) : (
                              <span className="font-mono">{file.fileSize}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-700">{file.uploadedBy}</td>
                          <td className="px-4 py-3 text-slate-500 text-[11px]">{file.uploadedAt}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            {/* Preview Google Drive link */}
                            {file.isDriveLink && (
                              <button
                                onClick={() => onPreviewDriveLink(file)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                title="Preview Google Drive resource"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Preview</span>
                              </button>
                            )}

                            {/* Download local file */}
                            {!file.isDriveLink && (
                              <a
                                href={file.fileData}
                                download={file.fileName}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-sky-800 rounded text-[11px] font-semibold transition-colors"
                              >
                                <Download className="w-3 h-3" />
                                <span>Download</span>
                              </a>
                            )}

                            {/* ROBUST IN-APP DELETE BUTTON */}
                            <button
                              onClick={() => setItemToDelete({ id: file.id, name: file.fileName })}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-700 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Delete resource"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CREATE ACCOUNT & ROLE MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-sky-600" />
                User Accounts & Role Permissions
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                Create new accounts with specific initial passwords. Designate access levels as Admin (full access) or User (view & download only). Regular users cannot promote themselves to admin.
              </p>
            </div>

            {/* Create Account Interface */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-sky-600" />
                Create New User Account Interface
              </h3>

              <form onSubmit={handleCreateUserSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Juan dela Cruz"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      placeholder="e.g. jdelacruz@dswd.gov.ph"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Initial Password *
                    </label>
                    <input
                      type="text"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Initial password"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Assigned Role *
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-sky-500 cursor-pointer"
                    >
                      <option value="user">User (View, Download & Preview Only)</option>
                      <option value="admin">Admin (Full Website & Upload Access)</option>
                    </select>
                  </div>
                </div>

                {/* Notifications */}
                {createSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{createSuccess}</span>
                  </div>
                )}
                {createError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{createError}</span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>{createLoading ? 'Creating...' : 'Create Account'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* User List & Role Editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Existing User Directory ({users.length} accounts)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Admins can edit whether each account is an <strong className="text-sky-700">Admin</strong> or a <strong className="text-slate-800">User</strong>.
                  </p>
                </div>
                {roleMessage && (
                  <span className="text-xs text-emerald-800 font-semibold bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                    {roleMessage}
                  </span>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Email Address</th>
                      <th className="px-4 py-3">Access Level / Role</th>
                      <th className="px-4 py-3">Password</th>
                      <th className="px-4 py-3 text-right">Delete Account</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-sky-50 border border-sky-200 flex items-center justify-center font-bold text-sky-700 text-xs shadow-2xs">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{user.name}</span>
                            {user.id === currentUser.id && (
                              <span className="text-[10px] text-amber-700 font-bold">(You)</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                          {user.email}
                        </td>
                        <td className="px-4 py-3">
                          {/* Role Switcher Selector */}
                          <div className="flex items-center gap-2">
                            {user.email.toLowerCase() === 'admin@dswd.gov.ph' ? (
                              <span className="px-2.5 py-1 rounded text-[11px] font-bold bg-amber-100 border border-amber-300 text-amber-900">
                                Admin (Super Admin)
                              </span>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                className={`px-2.5 py-1 rounded text-[11px] font-semibold border cursor-pointer ${
                                  user.role === 'admin'
                                    ? 'bg-amber-50 border-amber-300 text-amber-900 focus:ring-amber-500'
                                    : 'bg-white border-slate-300 text-slate-800 focus:ring-slate-400'
                                }`}
                              >
                                <option value="admin">Admin (Full Access)</option>
                                <option value="user">User (View & Download Only)</option>
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                          {user.password || '••••••••'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setUserToDelete({ id: user.id, name: user.name })}
                            disabled={user.id === currentUser.id}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Robust In-App Delete Dialogs */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        itemTitle={itemToDelete?.name || ''}
        onConfirm={handleExecuteDeleteFile}
        onClose={() => setItemToDelete(null)}
      />

      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        itemTitle={userToDelete?.name || ''}
        onConfirm={handleExecuteDeleteUser}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
