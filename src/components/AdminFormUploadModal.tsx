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
  Lock,
} from 'lucide-react';

interface AdminFormUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser | null;
  sectionId: string;
  sectionTitle: string;
  onRefreshData: () => void;
  theme?: 'light' | 'dark';
}

export const AdminFormUploadModal: React.FC<AdminFormUploadModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  sectionId,
  sectionTitle,
  onRefreshData,
  theme = 'light',
}) => {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  const [uploadMode, setUploadMode] = useState<'docs-link' | 'file'>('docs-link');
  const [title, setTitle] = useState('');
  const [googleDocsUrl, setGoogleDocsUrl] = useState('');
  const [description, setDescription] = useState('');
  const [notifyUsers, setNotifyUsers] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    if (!currentUser || currentUser.role !== 'admin') {
      setError('Only administrators can upload or link official documents.');
      return;
    }

    if (uploadMode === 'docs-link') {
      if (!title.trim()) {
        setError('Please enter a descriptive document title.');
        return;
      }
      if (!googleDocsUrl.trim()) {
        setError('Please provide a Google Docs or Google Drive link.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const isGoogleDoc = googleDocsUrl.includes('docs.google.com/document');
        const isGoogleForm = googleDocsUrl.includes('docs.google.com/forms');
        const fileTypeLabel = isGoogleDoc
          ? 'Google Docs'
          : isGoogleForm
          ? 'Google Form'
          : 'Google Drive';

        const newFile: SopFile = {
          id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sopId: sectionId,
          sopTitle: sectionTitle,
          fileName: title.trim(),
          fileSize: fileTypeLabel,
          fileType: 'google-drive',
          fileData: googleDocsUrl.trim(),
          isDriveLink: true,
          driveUrl: googleDocsUrl.trim(),
          uploadedBy: currentUser.email,
          uploadedAt: new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          description: description.trim() || undefined,
          downloadCount: 0,
        };

        await uploadSopFile(newFile);

        if (notifyUsers) {
          await createNotification({
            type: 'upload',
            title: `New Document Linked: ${newFile.fileName}`,
            message: `Admin uploaded official form "${newFile.fileName}" for ${sectionTitle}. Preview available now.`,
            createdBy: currentUser.email,
            priority: 'normal',
            targetSection: sectionId,
            targetTitle: sectionTitle,
            fileId: newFile.id,
            isDriveLink: true,
          }).catch(() => {});
        }

        setSuccess(`Document "${newFile.fileName}" successfully posted!`);
        setTimeout(() => {
          onRefreshData();
          onClose();
        }, 1200);
      } catch (err: any) {
        setError(err.message || 'Failed to save document. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // File upload
      if (!selectedFile) {
        setError('Please select a document file (.pdf, .docx, .xlsx, .doc).');
        return;
      }
      if (!title.trim()) {
        setError('Please provide a document title.');
        return;
      }

      if (selectedFile.size > 15 * 1024 * 1024) {
        setError('File exceeds 15MB limit. Please upload a smaller file or link via Google Docs.');
        return;
      }

      setLoading(true);
      setError('');
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          const sizeKb = Math.round(selectedFile.size / 1024);
          const formattedSize = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

          const newFile: SopFile = {
            id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            sopId: sectionId,
            sopTitle: sectionTitle,
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
            description: description.trim() || undefined,
            downloadCount: 0,
          };

          await uploadSopFile(newFile);

          if (notifyUsers) {
            await createNotification({
              type: 'upload',
              title: `New Document Uploaded: ${newFile.fileName}`,
              message: `Admin uploaded "${newFile.fileName}" for ${sectionTitle}.`,
              createdBy: currentUser.email,
              priority: 'normal',
              targetSection: sectionId,
              targetTitle: sectionTitle,
              fileId: newFile.id,
              isDriveLink: false,
            }).catch(() => {});
          }

          setSuccess(`File "${newFile.fileName}" successfully uploaded!`);
          setTimeout(() => {
            onRefreshData();
            onClose();
          }, 1200);
        };
        reader.onerror = () => {
          setError('Failed to read file contents.');
          setLoading(false);
        };
        reader.readAsDataURL(selectedFile);
      } catch (err: any) {
        setError(err.message || 'File upload error.');
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden ${
        isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Header */}
        <div className={`flex items-start justify-between p-5 border-b shrink-0 ${
          isDark ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Admin Action
                </span>
                <span className="text-xs text-slate-400 font-semibold">{sectionTitle}</span>
              </div>
              <h3 className="text-base font-bold leading-tight mt-0.5">
                Upload or Link Official Form
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-xl p-1 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
            <button
              type="button"
              onClick={() => setUploadMode('docs-link')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                uploadMode === 'docs-link'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Google Forms / Docs Link (Recommended)</span>
            </button>

            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                uploadMode === 'file'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>File Upload (.pdf / .docx)</span>
            </button>
          </div>

          {/* Document Title */}
          <div>
            <label className="block font-bold mb-1">
              Document / Form Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Official Technical Assistance & Records Service Request Form (Google Forms)"
              className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          {uploadMode === 'docs-link' ? (
            <div className="space-y-3">
              <div>
                <label className="block font-bold mb-1">
                  Google Forms or Google Docs Link <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={googleDocsUrl}
                    onChange={(e) => setGoogleDocsUrl(e.target.value)}
                    placeholder="https://docs.google.com/forms/d/e/... or docs.google.com/document/d/..."
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-[11px] ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                  <LinkIcon className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Make sure file permission is set to &ldquo;Anyone with link can view&rdquo; in Google Drive.
                </span>
              </div>

              {/* Detected embed indicator */}
              {detectedEmbedUrl && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-[11px]">
                      Embed preview supported! Users can preview this directly in desktop & mobile.
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block font-bold mb-1">
                Choose Document File <span className="text-rose-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls"
                onChange={handleFileChange}
                className={`w-full px-3 py-2 rounded-xl border file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-sky-600 file:text-white hover:file:bg-sky-700 file:cursor-pointer ${
                  isDark ? 'bg-slate-950 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>
          )}

          <div>
            <label className="block font-bold mb-1">Description / Instructions (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide procedural instructions or note who should fill this form..."
              className={`w-full px-3 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="notifyCheck"
              checked={notifyUsers}
              onChange={(e) => setNotifyUsers(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <label htmlFor="notifyCheck" className="text-xs font-semibold cursor-pointer">
              Broadcast bulletin announcement to users upon upload
            </label>
          </div>

          {/* Submit buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{loading ? 'Posting...' : 'Save & Publish Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
