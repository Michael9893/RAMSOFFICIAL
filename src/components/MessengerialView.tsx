import React, { useState } from 'react';
import {
  AppUser,
  MessengerialRecord,
  MessengerialCategory,
  MessengerialStatus,
  createMessengerialRecord,
  updateMessengerialRecord,
  deleteMessengerialRecord,
  getCarrierTrackingUrl,
  SopFile,
  deleteSopFile,
  getGoogleDriveEmbedUrl,
} from '../lib/authStore.ts';
import {
  Truck,
  Send,
  Mail,
  Building2,
  Search,
  Plus,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Edit2,
  Calendar,
  Clock,
  Package,
  FileText,
  FileCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Filter,
  Eye,
  X,
  Layers,
  Paperclip,
  Upload,
  Link as LinkIcon,
  HelpCircle,
  Lock,
  Download,
  BookOpen,
} from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { AdminFormUploadModal } from './AdminFormUploadModal.tsx';
import { createNotification } from '../lib/notificationStore.ts';

interface MessengerialViewProps {
  currentUser: AppUser | null;
  records: MessengerialRecord[];
  sopFiles?: SopFile[];
  onRefreshData: () => void;
  onOpenLogin: () => void;
  onPreviewDriveLink?: (file: SopFile) => void;
  theme?: 'light' | 'dark';
}

export const MessengerialView: React.FC<MessengerialViewProps> = ({
  currentUser,
  records,
  sopFiles = [],
  onRefreshData,
  onOpenLogin,
  onPreviewDriveLink,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';

  // Main Section: 'tracker' (Courier Dispatches) | 'sop' (SOP & Google Docs)
  const [activeMainSection, setActiveMainSection] = useState<'tracker' | 'sop'>('tracker');
  const [isSopUploadModalOpen, setIsSopUploadModalOpen] = useState(false);
  const [sopFileToDelete, setSopFileToDelete] = useState<SopFile | null>(null);

  // Messengerial SOP files
  const messengerialSopFiles = sopFiles.filter((f) => f.sopId === 'messengerial');
  const primarySopDoc = messengerialSopFiles.find((f) => f.isDriveLink) || messengerialSopFiles[0] || null;
  const primarySopEmbedUrl = primarySopDoc ? getGoogleDriveEmbedUrl(primarySopDoc.driveUrl || primarySopDoc.fileData) : null;

  // Category Filter: 'all' | 'CO.PSP' | 'PSP' | 'POSTAL'
  const [selectedCategory, setSelectedCategory] = useState<'all' | MessengerialCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Copy feedback tracking
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Post / Edit Modal state
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MessengerialRecord | null>(null);

  // Form states - completely BLANK by default (no autofills or mock names)
  const [formCategory, setFormCategory] = useState<MessengerialCategory>('CO.PSP');
  const [formTrackingNumber, setFormTrackingNumber] = useState('');
  const [formCourier, setFormCourier] = useState('JRS Express');
  const [customCourier, setCustomCourier] = useState('');
  const [formRecipient, setFormRecipient] = useState('');
  const [formRecipientOffice, setFormRecipientOffice] = useState('');
  const [formSender, setFormSender] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formDispatchDate, setFormDispatchDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<MessengerialStatus>('Dispatched');
  const [formTrackingUrl, setFormTrackingUrl] = useState('');
  const [formRemarks, setFormRemarks] = useState('');
  const [formAttachmentMode, setFormAttachmentMode] = useState<'none' | 'file' | 'drive'>('none');
  const [formAttachmentName, setFormAttachmentName] = useState('');
  const [formAttachmentData, setFormAttachmentData] = useState('');
  const [formDriveUrl, setFormDriveUrl] = useState('');

  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [recordToDelete, setRecordToDelete] = useState<{ id: string; name: string } | null>(null);

  // Waybill attachment preview modal
  const [previewAttachment, setPreviewAttachment] = useState<{
    title: string;
    trackingNumber: string;
    data?: string;
    driveUrl?: string;
  } | null>(null);

  // Handle Copy Tracking
  const handleCopy = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(tracking);
    setTimeout(() => {
      setCopiedTracking((prev) => (prev === tracking ? null : prev));
    }, 2000);
  };

  // Open Modal to Add
  const handleOpenAddModal = (defaultCat?: MessengerialCategory) => {
    setEditingRecord(null);
    setFormCategory(defaultCat || (selectedCategory === 'all' ? 'CO.PSP' : selectedCategory));
    setFormTrackingNumber('');
    setFormCourier('JRS Express');
    setCustomCourier('');
    setFormRecipient('');
    setFormRecipientOffice('');
    setFormSender('');
    setFormSubject('');
    setFormDispatchDate(new Date().toISOString().split('T')[0]);
    setFormStatus('Dispatched');
    setFormTrackingUrl('');
    setFormRemarks('');
    setFormAttachmentMode('none');
    setFormAttachmentName('');
    setFormAttachmentData('');
    setFormDriveUrl('');
    setFormError('');
    setIsPostModalOpen(true);
  };

  // Open Modal to Edit
  const handleOpenEditModal = (rec: MessengerialRecord) => {
    setEditingRecord(rec);
    setFormCategory(rec.category);
    setFormTrackingNumber(rec.trackingNumber);
    const standardCouriers = ['JRS Express', 'PhilPost (Registered Mail)', 'PhilPost (Express Mail)'];
    if (standardCouriers.includes(rec.courier)) {
      setFormCourier(rec.courier);
      setCustomCourier('');
    } else {
      setFormCourier('Other');
      setCustomCourier(rec.courier);
    }
    setFormRecipient(rec.recipient);
    setFormRecipientOffice(rec.recipientOffice || '');
    setFormSender(rec.sender);
    setFormSubject(rec.subject);
    setFormDispatchDate(rec.dispatchDate);
    setFormStatus(rec.status);
    setFormTrackingUrl(rec.trackingUrl || '');
    setFormRemarks(rec.remarks || '');
    if (rec.isDriveLink && rec.driveUrl) {
      setFormAttachmentMode('drive');
      setFormDriveUrl(rec.driveUrl);
      setFormAttachmentName(rec.attachmentName || '');
      setFormAttachmentData('');
    } else if (rec.attachmentData) {
      setFormAttachmentMode('file');
      setFormAttachmentData(rec.attachmentData);
      setFormAttachmentName(rec.attachmentName || '');
      setFormDriveUrl('');
    } else {
      setFormAttachmentMode('none');
      setFormAttachmentName('');
      setFormAttachmentData('');
      setFormDriveUrl('');
    }
    setFormError('');
    setIsPostModalOpen(true);
  };

  // Handle File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormAttachmentName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormAttachmentData(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Post
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTrackingNumber.trim()) {
      setFormError('Please enter a tracking number for this dispatch.');
      return;
    }
    if (!formRecipient.trim()) {
      setFormError('Please specify the recipient or addressee.');
      return;
    }
    if (!formSubject.trim()) {
      setFormError('Please specify the document or package subject.');
      return;
    }

    setFormLoading(true);

    try {
      const resolvedCourier =
        formCourier === 'Other'
          ? (customCourier.trim() || 'Service Provider')
          : formCourier.trim();

      const finalTrackingUrl =
        formTrackingUrl.trim() ||
        getCarrierTrackingUrl(resolvedCourier, formTrackingNumber.trim());

      const payload = {
        category: formCategory,
        trackingNumber: formTrackingNumber.trim(),
        courier: resolvedCourier,
        recipient: formRecipient.trim(),
        recipientOffice: formRecipientOffice.trim(),
        sender: formSender.trim() || 'AD-RAMS Records Section FO 1',
        subject: formSubject.trim(),
        dispatchDate: formDispatchDate,
        status: formStatus,
        trackingUrl: finalTrackingUrl,
        attachmentName: formAttachmentName.trim(),
        attachmentData: formAttachmentMode === 'file' ? formAttachmentData : '',
        driveUrl: formAttachmentMode === 'drive' ? formDriveUrl.trim() : '',
        isDriveLink: formAttachmentMode === 'drive',
        remarks: formRemarks.trim(),
        postedBy: currentUser?.email || 'admin@dswd.gov.ph',
      };

      if (editingRecord) {
        await updateMessengerialRecord(editingRecord.id, payload);
      } else {
        await createMessengerialRecord(payload);
        createNotification({
          type: 'reminder',
          title: `Courier Dispatch [${payload.category}]: ${payload.trackingNumber}`,
          message: `Outbound dispatch to ${payload.recipient} (${payload.recipientOffice || 'Destination Office'}). Subject: "${payload.subject}". Carrier: ${payload.courier}.`,
          priority: 'normal',
          createdBy: currentUser?.email || 'admin@dswd.gov.ph',
          targetSection: 'messengerial',
          targetTitle: 'Messengerial Services Tracker',
        }).catch(() => {});
      }

      onRefreshData();
      setIsPostModalOpen(false);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to post messengerial dispatch. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  // Quick Status Toggle
  const handleQuickStatusChange = async (rec: MessengerialRecord, newStatus: MessengerialStatus) => {
    try {
      await updateMessengerialRecord(rec.id, { status: newStatus });
      onRefreshData();
    } catch (e) {
      console.error(e);
    }
  };

  // Execute Delete
  const handleExecuteDelete = async () => {
    if (!recordToDelete) return;
    try {
      await deleteMessengerialRecord(recordToDelete.id);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setRecordToDelete(null);
    }
  };

  // Filtered records
  const filteredRecords = records.filter((rec) => {
    // 1. Category filter
    if (selectedCategory !== 'all' && rec.category !== selectedCategory) {
      return false;
    }
    // 2. Status filter
    if (selectedStatus !== 'all' && rec.status !== selectedStatus) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTracking = rec.trackingNumber.toLowerCase().includes(q);
      const matchRecipient = rec.recipient.toLowerCase().includes(q);
      const matchOffice = (rec.recipientOffice || '').toLowerCase().includes(q);
      const matchSender = rec.sender.toLowerCase().includes(q);
      const matchSubject = rec.subject.toLowerCase().includes(q);
      const matchCourier = rec.courier.toLowerCase().includes(q);
      const matchDate = rec.dispatchDate.toLowerCase().includes(q);
      const matchRemarks = (rec.remarks || '').toLowerCase().includes(q);
      return (
        matchTracking ||
        matchRecipient ||
        matchOffice ||
        matchSender ||
        matchSubject ||
        matchCourier ||
        matchDate ||
        matchRemarks
      );
    }
    return true;
  });

  // Category counts
  const countAll = records.length;
  const countCoPsp = records.filter((r) => r.category === 'CO.PSP').length;
  const countPsp = records.filter((r) => r.category === 'PSP').length;
  const countPostal = records.filter((r) => r.category === 'POSTAL').length;

  const countInTransit = records.filter((r) => r.status === 'In Transit' || r.status === 'Dispatched' || r.status === 'Out for Delivery').length;
  const countDelivered = records.filter((r) => r.status === 'Delivered').length;

  // Render status badge helper
  const renderStatusBadge = (status: MessengerialStatus) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Delivered</span>
          </span>
        );
      case 'In Transit':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>In Transit</span>
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <Truck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Out for Delivery</span>
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Dispatched</span>
          </span>
        );
      case 'Pending Carrier Pickup':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Pending Pickup</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // Render category pill helper
  const renderCategoryBadge = (category: MessengerialCategory) => {
    switch (category) {
      case 'CO.PSP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold uppercase tracking-wide bg-indigo-100 text-indigo-900 dark:bg-indigo-950/70 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800">
            <Building2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>CO.PSP</span>
          </span>
        );
      case 'PSP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold uppercase tracking-wide bg-teal-100 text-teal-900 dark:bg-teal-950/70 dark:text-teal-200 border border-teal-200 dark:border-teal-800">
            <Truck className="w-3 h-3 text-teal-600 dark:text-teal-400" />
            <span>PSP</span>
          </span>
        );
      case 'POSTAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10.5px] font-extrabold uppercase tracking-wide bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
            <Mail className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>POSTAL</span>
          </span>
        );
    }
  };

  const handleExecuteDeleteSop = async () => {
    if (!sopFileToDelete) return;
    try {
      await deleteSopFile(sopFileToDelete.id);
      onRefreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setSopFileToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 0. Section Switcher: Courier Tracking vs SOP & Google Docs */}
      <div className={`p-2 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveMainSection('tracker')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMainSection === 'tracker'
                ? 'bg-[#0d2159] dark:bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Courier & Mail Tracking ({records.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveMainSection('sop')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeMainSection === 'sop'
                ? 'bg-[#0d2159] dark:bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>SOP & Google Docs Repository</span>
            {messengerialSopFiles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-white">
                {messengerialSopFiles.length}
              </span>
            )}
          </button>
        </div>

        {/* Admin Quick Action */}
        {activeMainSection === 'sop' && (
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {isAdmin ? (
              <button
                type="button"
                onClick={() => setIsSopUploadModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Google Docs SOP</span>
              </button>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                <Lock className="w-3 h-3" />
                <span>Upload Restricted to Admin</span>
              </span>
            )}
          </div>
        )}
      </div>

      {activeMainSection === 'sop' ? (
        /* ========================================================================= */
        /* SOP & GOOGLE DOCS VIEW (Matches user request to upload Google Docs & preview) */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Banner Header */}
          <div className={`p-6 sm:p-8 rounded-2xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-r from-sky-50 via-white to-blue-50 border-sky-100'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-600 border border-sky-500/20">
                    Standard Operating Procedure
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    AD-RAMS Records Section
                  </span>
                </div>
                <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  Request for Messengerial Services (SOP & Guidelines)
                </h1>
                <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
                  isDark ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  Official operating procedures, dispatch guidelines, and routing vouchers for private courier (CO.PSP & PSP) and postal services. Admin can link Google Docs documents and users can preview or download.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setIsSopUploadModalOpen(true)}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Google Docs SOP</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenLogin}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Admin Upload Access</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Primary Google Docs Live Preview (Embedded Desktop & Mobile View) */}
          <div className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="font-bold truncate">
                  {primarySopDoc ? primarySopDoc.fileName : 'Messengerial Services SOP Document'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-extrabold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Google Docs Preview
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {primarySopDoc && (
                  <>
                    {onPreviewDriveLink && (
                      <button
                        type="button"
                        onClick={() => onPreviewDriveLink(primarySopDoc)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Fullscreen Preview</span>
                      </button>
                    )}
                    <a
                      href={primarySopDoc.driveUrl || primarySopDoc.fileData}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title="Open in Google Docs"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Embedded Responsive iFrame */}
            <div className="w-full h-[650px] bg-slate-50 dark:bg-slate-950 flex flex-col">
              {primarySopEmbedUrl ? (
                <iframe
                  src={primarySopEmbedUrl}
                  title="Messengerial Services SOP Preview"
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 text-slate-400" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">No Google Docs Preview Linked Yet</h4>
                    <p className={`text-xs max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Administrator can click &ldquo;Upload Google Docs SOP&rdquo; above to attach the official Google Docs link for interactive user preview.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsSopUploadModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                    >
                      + Upload Google Docs SOP Link
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* List of All Associated SOP Files & Forms for Messengerial */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Messengerial Documents & Downloadable Vouchers ({messengerialSopFiles.length})
              </h3>
              <span className="text-xs text-slate-400 font-semibold">
                Available to all DSWD users
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {messengerialSopFiles.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No documents uploaded for Request for Messengerial Services yet.
                </div>
              ) : (
                messengerialSopFiles.map((f) => (
                  <div key={f.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        f.isDriveLink
                          ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                          : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {f.isDriveLink ? <LinkIcon className="w-5 h-5" /> : <FileCheck className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {f.fileName}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
                          <span>{f.fileSize}</span>
                          <span>•</span>
                          <span>Uploaded {f.uploadedAt}</span>
                          {f.description && (
                            <>
                              <span>•</span>
                              <span className="italic">{f.description}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      {f.isDriveLink && onPreviewDriveLink && (
                        <button
                          type="button"
                          onClick={() => onPreviewDriveLink(f)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>
                      )}

                      {!f.isDriveLink && (
                        <a
                          href={f.fileData}
                          download={f.fileName}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setSopFileToDelete(f)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete Document (Admin only)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* COURIER & MAIL TRACKER VIEW (Existing tracker with SOP callout banner)    */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* SOP Link Notification Strip */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-blue-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 border border-sky-200 dark:border-sky-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-sky-950 dark:text-sky-200">
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-semibold">
                Looking for the official Standard Operating Procedure (SOP) & Google Docs for Messengerial Services?
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveMainSection('sop')}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shrink-0 shadow-2xs"
            >
              <span>View SOP & Google Docs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
      {/* 1. Header Overview & Stats */}
      <div className={`p-4 sm:p-6 rounded-2xl border transition-colors ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 text-white'
          : 'bg-white border-slate-200/90 shadow-sm text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#0d2159] text-white dark:bg-sky-500 dark:text-slate-950">
                Unitized Logistic Tracker
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                DSWD Field Office 1 • AD-RAMS Records Section
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2.5 text-[#0d2159] dark:text-sky-300">
              <Package className="w-7 h-7 text-[#0284c7] shrink-0" />
              <span>Messengerial Services Tracking Portal</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Official dispatch and delivery tracking for all outbound official documents and packages. Categorized into{' '}
              <strong className="text-indigo-700 dark:text-indigo-400">CO.PSP</strong> (Central Office Private Courier),{' '}
              <strong className="text-teal-700 dark:text-teal-400">PSP</strong> (Private Service Provider), and{' '}
              <strong className="text-amber-700 dark:text-amber-400">POSTAL</strong> (PhilPost Mail).
            </p>
          </div>

          {/* Admin Action Button / Guest Login Alert */}
          <div className="flex items-center gap-3 shrink-0">
            {isAdmin ? (
              <button
                onClick={() => handleOpenAddModal()}
                className="px-4 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Attach & Post Tracking #</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 hidden sm:inline">Records Administrator?</span>
                <button
                  onClick={onOpenLogin}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5 text-sky-500" />
                  <span>Admin Post Access</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-5 mt-5 border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Total Dispatches</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">{countAll}</span>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 block">CO.PSP (Central)</span>
            <span className="text-lg sm:text-xl font-black text-indigo-900 dark:text-indigo-200">{countCoPsp}</span>
          </div>
          <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800">
            <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-300 block">PSP (Courier)</span>
            <span className="text-lg sm:text-xl font-black text-teal-900 dark:text-teal-200">{countPsp}</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 block">POSTAL (PhilPost)</span>
            <span className="text-lg sm:text-xl font-black text-amber-900 dark:text-amber-200">{countPostal}</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-300 block">Active In Transit</span>
            <span className="text-lg sm:text-xl font-black text-sky-900 dark:text-sky-200">{countInTransit}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 block">Delivered</span>
            <span className="text-lg sm:text-xl font-black text-emerald-900 dark:text-emerald-200">{countDelivered}</span>
          </div>
        </div>
      </div>

      {/* 2. THE THREE CATEGORY TABS (CO.PSP, PSP, POSTAL) & SEARCH */}
      <div className="space-y-4">
        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* All Tab */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-[#0d2159] text-white shadow-md dark:bg-sky-500 dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>All Categories</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                selectedCategory === 'all'
                  ? 'bg-white/20 text-white dark:bg-slate-900/30 dark:text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}>
                {countAll}
              </span>
            </button>

            {/* 1. CO.PSP Tab */}
            <button
              onClick={() => setSelectedCategory('CO.PSP')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'CO.PSP'
                  ? 'bg-indigo-600 text-white shadow-md dark:bg-indigo-500 dark:text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>CO.PSP</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-200">
                {countCoPsp}
              </span>
            </button>

            {/* 2. PSP Tab */}
            <button
              onClick={() => setSelectedCategory('PSP')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'PSP'
                  ? 'bg-teal-600 text-white shadow-md dark:bg-teal-500 dark:text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-900'
              }`}
            >
              <Truck className="w-4 h-4 text-teal-400" />
              <span>PSP (Private Courier)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-teal-100 text-teal-900 dark:bg-teal-900 dark:text-teal-200">
                {countPsp}
              </span>
            </button>

            {/* 3. POSTAL Tab */}
            <button
              onClick={() => setSelectedCategory('POSTAL')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedCategory === 'POSTAL'
                  ? 'bg-amber-600 text-white shadow-md dark:bg-amber-500 dark:text-slate-950'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-900'
              }`}
            >
              <Mail className="w-4 h-4 text-amber-500" />
              <span>POSTAL (PhilPost)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
                {countPostal}
              </span>
            </button>
          </div>

          {/* View Mode Toggle: Cards vs Table */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Cards View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              Ledger Table
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Live Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tracking Number, Recipient, Sender, Subject, Courier..."
              className={`w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-2xs'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-3 py-2.5 text-xs rounded-xl border focus:outline-none cursor-pointer w-full sm:w-44 ${
                isDark
                  ? 'bg-slate-900 border-slate-700 text-white focus:border-sky-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="Dispatched">Dispatched</option>
              <option value="In Transit">In Transit</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Pending Carrier Pickup">Pending Carrier Pickup</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Information Ribbon */}
      <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
        selectedCategory === 'CO.PSP'
          ? 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200'
          : selectedCategory === 'PSP'
          ? 'bg-teal-50/60 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900 text-teal-900 dark:text-teal-200'
          : selectedCategory === 'POSTAL'
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200'
          : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
      }`}>
        <div className="flex items-center gap-2 font-medium">
          <HelpCircle className="w-4 h-4 shrink-0 opacity-80" />
          <span>
            {selectedCategory === 'CO.PSP' && 'CO.PSP: Direct courier dispatches between DSWD FO 1 and Central Office bureaus, departments, and units.'}
            {selectedCategory === 'PSP' && 'PSP: Private Service Provider courier logistics (JRS Express, LBC, 2GO, etc.) for regional field offices, LGUs, and external agencies.'}
            {selectedCategory === 'POSTAL' && 'POSTAL: Official Philippine Postal Corporation (PhilPost) registered and regular mail dispatches.'}
            {selectedCategory === 'all' && 'Displaying all messengerial service records across CO.PSP, PSP, and POSTAL categories.'}
          </span>
        </div>
        <span className="font-bold text-[11px] shrink-0 ml-2">
          {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* 3. RECORDS LISTING: CARDS OR TABLE */}
      {filteredRecords.length === 0 ? (
        /* Empty State */
        <div className={`p-12 text-center rounded-2xl border ${
          isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50/80 border-slate-200'
        }`}>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400 mb-4 shadow-sm">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Messengerial Dispatches Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
            {searchQuery
              ? `No records matching "${searchQuery}". Try adjusting your keywords or clearing the filter.`
              : `There are currently no posted dispatches in the ${selectedCategory === 'all' ? 'messengerial tracker' : selectedCategory + ' category'}.`}
          </p>

          {isAdmin && (
            <button
              onClick={() => handleOpenAddModal(selectedCategory === 'all' ? 'CO.PSP' : selectedCategory)}
              className="mt-5 px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Attach & Post Tracking Number Now</span>
            </button>
          )}
        </div>
      ) : viewMode === 'cards' ? (
        /* ======================================================== */
        /* CARDS VIEW */
        /* ======================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredRecords.map((rec) => {
            const isDelivered = rec.status === 'Delivered';
            const trackingLink = rec.trackingUrl || getCarrierTrackingUrl(rec.courier, rec.trackingNumber);

            return (
              <div
                key={rec.id}
                className={`flex flex-col justify-between rounded-2xl border p-4 sm:p-5 transition-all hover:shadow-md ${
                  isDark
                    ? 'bg-slate-900/95 border-slate-800 hover:border-sky-500/50'
                    : 'bg-white border-slate-200/90 hover:border-sky-300 shadow-2xs'
                }`}
              >
                {/* Top: Category & Status */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    {renderCategoryBadge(rec.category)}
                    {renderStatusBadge(rec.status)}
                  </div>

                  {/* Tracking Number Highlight Block */}
                  <div className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700'
                      : 'bg-slate-50/90 border-slate-200'
                  }`}>
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Tracking Number
                      </span>
                      <span className="font-mono text-xs sm:text-sm font-black text-[#0284c7] dark:text-sky-400 truncate block tracking-wider">
                        {rec.trackingNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(rec.trackingNumber)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer flex items-center gap-1 ${
                          copiedTracking === rec.trackingNumber
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100'
                        }`}
                        title="Copy tracking number"
                      >
                        {copiedTracking === rec.trackingNumber ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">Copied</span>
                          </>
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {trackingLink && (
                        <a
                          href={trackingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-white dark:bg-slate-700 text-[#0284c7] dark:text-sky-400 border border-slate-300 dark:border-slate-600 hover:bg-sky-50 dark:hover:bg-slate-600 rounded-lg text-xs transition-colors cursor-pointer"
                          title="Open official carrier tracking page"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Courier & Dispatch Date */}
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rec.courier}</span>
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.dispatchDate}</span>
                    </span>
                  </div>

                  {/* Recipient / Destination */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Addressee / Recipient
                    </span>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-tight">
                      {rec.recipient}
                    </h4>
                    {rec.recipientOffice && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {rec.recipientOffice}
                      </p>
                    )}
                  </div>

                  {/* Subject / Purpose */}
                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      Document / Contents Subject
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                      {rec.subject}
                    </p>
                  </div>

                  {/* Sender Origin */}
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <span className="text-slate-400 font-semibold">From:</span>
                    <span className="truncate">{rec.sender}</span>
                  </div>

                  {/* Attachment (Waybill or Drive link) */}
                  {(rec.attachmentData || (rec.isDriveLink && rec.driveUrl)) && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setPreviewAttachment({
                            title: rec.attachmentName || 'Waybill Receipt',
                            trackingNumber: rec.trackingNumber,
                            data: rec.attachmentData,
                            driveUrl: rec.driveUrl,
                          });
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg border bg-sky-50/70 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800 text-[#0284c7] dark:text-sky-300 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors hover:bg-sky-100 cursor-pointer"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="truncate">View Attached Waybill / Receipt</span>
                      </button>
                    </div>
                  )}

                  {/* Remarks note */}
                  {rec.remarks && (
                    <p className="text-[10.5px] italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-200 dark:border-slate-800 leading-snug">
                      <strong>Remarks:</strong> {rec.remarks}
                    </p>
                  )}
                </div>

                {/* Bottom Bar: Admin Controls or Track Online */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  {isAdmin ? (
                    /* Admin Quick Status Change & Edit/Delete */
                    <div className="w-full flex items-center justify-between gap-2">
                      {/* Status Quick Switch */}
                      <select
                        value={rec.status}
                        onChange={(e) => handleQuickStatusChange(rec, e.target.value as MessengerialStatus)}
                        className={`text-[11px] py-1 px-2 rounded border focus:outline-none cursor-pointer ${
                          isDark
                            ? 'bg-slate-800 border-slate-700 text-white'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                        title="Update delivery status"
                      >
                        <option value="Dispatched">Dispatched</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Pending Carrier Pickup">Pending Pickup</option>
                      </select>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(rec)}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="Edit dispatch details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRecordToDelete({ id: rec.id, name: `${rec.trackingNumber} (${rec.recipient})` })}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                          title="Delete dispatch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Regular User Track Link */
                    <a
                      href={trackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 text-center shadow-2xs"
                    >
                      <span>Track with {rec.courier}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ======================================================== */
        /* TABLE / LEDGER VIEW */
        /* ======================================================== */
        <div className={`overflow-x-auto rounded-2xl border shadow-2xs ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Tracking Number</th>
                <th className="py-3 px-3.5">Carrier</th>
                <th className="py-3 px-3.5">Addressee / Recipient</th>
                <th className="py-3 px-3.5">Subject / Package</th>
                <th className="py-3 px-3.5">Mailed Date</th>
                <th className="py-3 px-3.5">Delivery Status</th>
                <th className="py-3 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.map((rec) => {
                const trackingLink = rec.trackingUrl || getCarrierTrackingUrl(rec.courier, rec.trackingNumber);

                return (
                  <tr
                    key={rec.id}
                    className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/40`}
                  >
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {renderCategoryBadge(rec.category)}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-[#0284c7] dark:text-sky-400">
                          {rec.trackingNumber}
                        </span>
                        <button
                          onClick={() => handleCopy(rec.trackingNumber)}
                          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Copy tracking number"
                        >
                          {copiedTracking === rec.trackingNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                      {rec.courier}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {rec.recipient}
                      </div>
                      {rec.recipientOffice && (
                        <div className="text-[10.5px] text-slate-400 line-clamp-1">
                          {rec.recipientOffice}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 max-w-xs">
                      <span className="text-slate-700 dark:text-slate-300 line-clamp-1 font-normal">
                        {rec.subject}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      {rec.dispatchDate}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {renderStatusBadge(rec.status)}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {trackingLink && (
                          <a
                            href={trackingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0284c7] dark:text-sky-400 rounded transition-colors"
                            title="Open courier tracker"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {(rec.attachmentData || (rec.isDriveLink && rec.driveUrl)) && (
                          <button
                            onClick={() => {
                              setPreviewAttachment({
                                title: rec.attachmentName || 'Waybill Receipt',
                                trackingNumber: rec.trackingNumber,
                                data: rec.attachmentData,
                                driveUrl: rec.driveUrl,
                              });
                            }}
                            className="p-1.5 bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 rounded hover:bg-sky-100 transition-colors cursor-pointer"
                            title="View attached waybill"
                          >
                            <Paperclip className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(rec)}
                              className="p-1.5 text-slate-500 hover:text-sky-600 rounded transition-colors cursor-pointer"
                              title="Edit record"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRecordToDelete({ id: rec.id, name: `${rec.trackingNumber} (${rec.recipient})` })}
                              className="p-1.5 text-rose-500 hover:text-rose-700 rounded transition-colors cursor-pointer"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Admin Modal: Attach & Post Messengerial Dispatch */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl transition-colors ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 z-10 ${
              isDark ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-[#0284c7] shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {editingRecord ? 'Edit Messengerial Dispatch' : 'Attach & Post Messengerial Dispatch'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Post official tracking number and dispatch details for users to view.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePostSubmit} className="p-4 sm:p-6 space-y-4" autoComplete="off">
              {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Category Selection: CO.PSP, PSP, POSTAL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Service Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCategory('CO.PSP')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formCategory === 'CO.PSP'
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-indigo-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>CO.PSP</span>
                    <span className="text-[9.5px] opacity-80">Central Office</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('PSP')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formCategory === 'PSP'
                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-teal-50'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>PSP</span>
                    <span className="text-[9.5px] opacity-80">Private Courier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormCategory('POSTAL')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      formCategory === 'POSTAL'
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-amber-50'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>POSTAL</span>
                    <span className="text-[9.5px] opacity-80">PhilPost Mail</span>
                  </button>
                </div>
              </div>

              {/* 2. Tracking Number & Carrier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tracking Number *
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formTrackingNumber}
                    onChange={(e) => setFormTrackingNumber(e.target.value)}
                    placeholder="Enter tracking or waybill number"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl font-mono border focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Courier / Service Provider *
                  </label>
                  <select
                    value={formCourier}
                    onChange={(e) => setFormCourier(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  >
                    <option value="JRS Express">JRS Express</option>
                    <option value="PhilPost (Registered Mail)">PhilPost (Registered Mail)</option>
                    <option value="PhilPost (Express Mail)">PhilPost (Express Mail)</option>
                    <option value="LBC Express">LBC Express</option>
                    <option value="Other">Other / Custom Service Provider</option>
                  </select>
                  {formCourier === 'Other' && (
                    <input
                      type="text"
                      value={customCourier}
                      onChange={(e) => setCustomCourier(e.target.value)}
                      placeholder="Enter courier or service provider name"
                      className={`mt-2 w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* 3. Recipient & Office */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Addressee / Recipient *
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formRecipient}
                    onChange={(e) => setFormRecipient(e.target.value)}
                    placeholder="Recipient name or office head"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Agency / Division (Optional)
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formRecipientOffice}
                    onChange={(e) => setFormRecipientOffice(e.target.value)}
                    placeholder="Agency, division, or building address"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                </div>
              </div>

              {/* 4. Subject / Package Description & Sender Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Document / Package Subject *
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    placeholder="e.g. Special Order No. 2026-081 Transmittal"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Originating Unit / Sender *
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={formSender}
                    onChange={(e) => setFormSender(e.target.value)}
                    placeholder="e.g. AD-RAMS Records Section"
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                    }`}
                  />
                </div>
              </div>

              {/* 5. Dispatch Date & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mailed / Dispatch Date *
                  </label>
                  <input
                    type="date"
                    value={formDispatchDate}
                    onChange={(e) => setFormDispatchDate(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none transition-colors ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as MessengerialStatus)}
                    className={`w-full px-3.5 py-2.5 text-xs rounded-xl border focus:outline-none cursor-pointer ${
                      isDark
                        ? 'bg-slate-800 border-slate-700 text-white focus:border-sky-500'
                        : 'bg-white border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  >
                    <option value="Dispatched">Dispatched</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Pending Carrier Pickup">Pending Carrier Pickup</option>
                  </select>
                </div>
              </div>

              {/* 6. Custom Tracking Link (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Direct Tracking URL (Optional)
                </label>
                <input
                  type="url"
                  autoComplete="off"
                  value={formTrackingUrl}
                  onChange={(e) => setFormTrackingUrl(e.target.value)}
                  placeholder="https://... (Leave blank to use carrier default search link)"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  }`}
                />
              </div>

              {/* 7. Waybill / Receipt Attachment */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Attach Waybill Scan / Receipt (Optional)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAttachmentMode('none')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                      formAttachmentMode === 'none'
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    No Attachment
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAttachmentMode('file')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border flex items-center gap-1 ${
                      formAttachmentMode === 'file'
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAttachmentMode('drive')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border flex items-center gap-1 ${
                      formAttachmentMode === 'drive'
                        ? 'bg-[#0284c7] text-white border-[#0284c7]'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Google Drive Link</span>
                  </button>
                </div>

                {formAttachmentMode === 'file' && (
                  <div className="pt-1 space-y-1.5">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 dark:file:bg-slate-800 dark:file:text-sky-300 cursor-pointer"
                    />
                    {formAttachmentName && (
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-semibold">
                        Selected: {formAttachmentName}
                      </span>
                    )}
                  </div>
                )}

                {formAttachmentMode === 'drive' && (
                  <div className="pt-1">
                    <input
                      type="url"
                      autoComplete="off"
                      value={formDriveUrl}
                      onChange={(e) => setFormDriveUrl(e.target.value)}
                      placeholder="Paste shared Google Drive link to waybill or transmittal"
                      className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* 8. Remarks (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Remarks / Special Instructions (Optional)
                </label>
                <textarea
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  rows={2}
                  placeholder="e.g. Urgent documents, sealed parcel, return receipt attached..."
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500 focus:border-sky-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500'
                  }`}
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2.5 bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{formLoading ? 'Posting...' : editingRecord ? 'Update Dispatch' : 'Post for Users to See'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Waybill Attachment Preview Modal */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm">Attached Waybill Receipt / Scan</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  Tracking #: {previewAttachment.trackingNumber}
                </p>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex items-center justify-center min-h-[300px]">
              {previewAttachment.driveUrl ? (
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 mx-auto">
                    <ExternalLink className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    This waybill is stored in Google Drive:
                  </p>
                  <a
                    href={previewAttachment.driveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                  >
                    <span>Open in Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : previewAttachment.data ? (
                <div className="w-full flex justify-center">
                  {previewAttachment.data.startsWith('data:image') ? (
                    <img
                      src={previewAttachment.data}
                      alt="Waybill Attachment"
                      className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-sm"
                    />
                  ) : (
                    <div className="text-center space-y-3">
                      <FileText className="w-16 h-16 text-sky-500 mx-auto" />
                      <p className="text-xs font-semibold">{previewAttachment.title}</p>
                      <a
                        href={previewAttachment.data}
                        download={`Waybill-${previewAttachment.trackingNumber}`}
                        className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
                      >
                        <span>Download Waybill File</span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No preview available for this document.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Close the Tracker View conditional block */}
      </div>
      )}

      {/* Delete Confirmation Modal for Tracker Record */}
      {recordToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle={recordToDelete.name}
          onConfirm={handleExecuteDelete}
          onClose={() => setRecordToDelete(null)}
        />
      )}

      {/* Admin Upload Modal for Messengerial SOP (Google Docs & Forms) */}
      {isSopUploadModalOpen && (
        <AdminFormUploadModal
          isOpen={true}
          onClose={() => setIsSopUploadModalOpen(false)}
          currentUser={currentUser}
          sectionId="messengerial"
          sectionTitle="Request for Messengerial Services"
          onRefreshData={() => {
            onRefreshData();
            setIsSopUploadModalOpen(false);
          }}
          theme={theme}
        />
      )}

      {/* Delete Confirmation Modal for SOP File */}
      {sopFileToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle={sopFileToDelete.fileName}
          onConfirm={handleExecuteDeleteSop}
          onClose={() => setSopFileToDelete(null)}
        />
      )}
    </div>
  );
};
