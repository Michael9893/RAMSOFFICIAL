import React, { useState } from 'react';
import {
  AppUser,
  SopFile,
  SupportTicket,
  TicketPriority,
  TicketStatus,
  createSupportTicket,
  updateSupportTicket,
  deleteSupportTicket,
  getGoogleDriveEmbedUrl,
  deleteSopFile,
} from '../lib/authStore.ts';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Eye,
  ExternalLink,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Building2,
  Mail,
  Send,
  Trash2,
  Lock,
  Edit2,
  Check,
  X,
  Sparkles,
  Ticket as TicketIcon,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { AdminFormUploadModal } from './AdminFormUploadModal.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';
import { createNotification } from '../lib/notificationStore.ts';

interface TicketingSupportViewProps {
  currentUser: AppUser | null;
  files: SopFile[];
  tickets: SupportTicket[];
  onPreviewDriveLink: (file: SopFile) => void;
  onRefreshData: () => void;
  onOpenLogin: () => void;
  theme?: 'light' | 'dark';
}

export const TicketingSupportView: React.FC<TicketingSupportViewProps> = ({
  currentUser,
  files,
  tickets,
  onPreviewDriveLink,
  onRefreshData,
  onOpenLogin,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';

  // Sub-tab: 'tickets' (List & Management) | 'preview' (Official Form preview) | 'create' (Submit Ticket)
  const [activeSubTab, setActiveSubTab] = useState<'tickets' | 'preview' | 'create'>('tickets');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedTicketDetail, setSelectedTicketDetail] = useState<SupportTicket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<string | null>(null);
  const [docToDelete, setDocToDelete] = useState<SopFile | null>(null);

  // Admin resolution editing state
  const [editingResolutionNotes, setEditingResolutionNotes] = useState('');
  const [editingStatus, setEditingStatus] = useState<TicketStatus>('In Progress');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Form files for ticketing-support (Google Form / Doc uploaded by admin)
  const tktFiles = files.filter((f) => f.sopId === 'ticketing-support');
  const primaryDoc = tktFiles[0] || null;
  const previewEmbedUrl = primaryDoc ? getGoogleDriveEmbedUrl(primaryDoc.driveUrl || primaryDoc.fileData) : null;

  // New Ticket Form State - completely clean, no fake names or files
  const [formName, setFormName] = useState(currentUser?.name || '');
  const [formEmail, setFormEmail] = useState(currentUser?.email || '');
  const [formOffice, setFormOffice] = useState(currentUser?.department || '');
  const [formCategory, setFormCategory] = useState('Request for Technical Assistance on Records Management');
  const [formPriority, setFormPriority] = useState<TicketPriority>('Medium');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDriveUrl, setFormDriveUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState('');

  // Handle Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmail.trim() || !formOffice.trim() || !formTitle.trim() || !formDescription.trim()) {
      setFormError('Please fill out all required fields (Name, Email, Division, Subject, and Description).');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createSupportTicket({
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        status: 'Open',
        requesterName: formName.trim(),
        requesterEmail: formEmail.trim(),
        requesterOffice: formOffice.trim(),
        description: formDescription.trim(),
        attachedFormUrl: formDriveUrl.trim() || undefined,
        attachedFormName: formDriveUrl.trim() ? 'Google Form / Document Attachment' : undefined,
        isDriveLink: !!formDriveUrl.trim(),
      });

      setSubmitSuccessMsg(`Ticket created successfully! Tracking ID: ${created.ticketNumber}`);
      setFormTitle('');
      setFormDescription('');
      setFormDriveUrl('');

      // Broadcast notification
      createNotification({
        type: 'announcement',
        title: `New Support Ticket: ${created.ticketNumber}`,
        message: `${created.requesterName} from ${created.requesterOffice} submitted: "${created.title}" (${created.category}).`,
        priority: created.priority === 'Urgent' ? 'urgent' : 'normal',
        createdBy: created.requesterEmail,
        targetSection: 'ticketing',
        targetTitle: 'Ticketing Support System',
      }).catch(() => {});

      onRefreshData();

      setTimeout(() => {
        setSubmitSuccessMsg('');
        setActiveSubTab('tickets');
      }, 2200);
    } catch (err) {
      console.error(err);
      setFormError('Failed to submit ticket. Please check your network and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDoc = async () => {
    if (!docToDelete) return;
    await deleteSopFile(docToDelete.id);
    setDocToDelete(null);
    onRefreshData();
  };

  // Admin Update Status & Resolution
  const handleSaveResolution = async () => {
    if (!selectedTicketDetail) return;
    setIsUpdatingStatus(true);
    try {
      await updateSupportTicket(selectedTicketDetail.id, {
        status: editingStatus,
        resolutionNotes: editingResolutionNotes.trim() || undefined,
        assignedTo: currentUser?.email || 'admin@dswd.gov.ph',
      });
      setSelectedTicketDetail((prev) =>
        prev
          ? {
              ...prev,
              status: editingStatus,
              resolutionNotes: editingResolutionNotes.trim() || undefined,
              assignedTo: currentUser?.email,
            }
          : null
      );

      // Broadcast notification on resolution update
      createNotification({
        type: 'reminder',
        title: `Ticket ${selectedTicketDetail.ticketNumber}: ${editingStatus}`,
        message: `Status updated to ${editingStatus} by ${currentUser?.name || 'Records Section'}.${editingResolutionNotes.trim() ? ' Remarks: ' + editingResolutionNotes.trim() : ''}`,
        priority: editingStatus === 'Resolved' ? 'normal' : 'high',
        createdBy: currentUser?.email || 'admin@dswd.gov.ph',
        targetSection: 'ticketing',
        targetTitle: 'Ticketing Support System',
      }).catch(() => {});

      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticketToDelete) return;
    await deleteSupportTicket(ticketToDelete);
    if (selectedTicketDetail?.id === ticketToDelete) {
      setSelectedTicketDetail(null);
    }
    setTicketToDelete(null);
    onRefreshData();
  };

  // Filtered Tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.requesterOffice.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getPriorityBadge = (priority: TicketPriority) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30';
      case 'High':
        return 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      default:
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30';
      case 'In Progress':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
      case 'Resolved':
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
      case 'Closed':
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Hero Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-r from-blue-50 via-white to-sky-50 border-sky-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-500/10 text-sky-600 border border-sky-500/20">
                AD-RAMS Service Helpdesk
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Records & Archives Management Section
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Ticketing Support System & Service Slips
            </h1>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Submit technical assistance requests, track document retrieval and disposal tickets, and preview the official DSWD Records Management Service Request Form in desktop or mobile view.
            </p>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <Clock className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-xl font-black text-amber-500">
                  {tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress').length}
                </span>
                <span className={`text-[10px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Active Tickets
                </span>
              </div>
            </div>

            <div className={`px-4 py-3 rounded-xl border flex items-center gap-3 shadow-2xs ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <span className="text-xl font-black text-emerald-500">
                  {tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length}
                </span>
                <span className={`text-[10px] block font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Resolved
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Controls Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveSubTab('tickets')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'tickets'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <TicketIcon className="w-3.5 h-3.5" />
              <span>Tickets Tracker ({tickets.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'preview'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Service Request Form & Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('create')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'create'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit Support Ticket</span>
            </button>
          </div>

          {/* Admin Upload Action */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{primaryDoc ? 'Replace Google Form (Admin)' : 'Upload Official Google Form (Admin)'}</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>Official Form Uploaded by Administrator</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Sub-tab Views */}
      {activeSubTab === 'preview' ? (
        /* FORM PREVIEW SUB-TAB: Desktop & Mobile Viewport */
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                  {primaryDoc ? primaryDoc.fileName : 'Official Service Request Google Form'}
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {primaryDoc
                    ? `Admin uploaded official form (${primaryDoc.uploadedAt})`
                    : 'Awaiting Administrator to upload the official Google Form'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              {primaryDoc ? (
                <>
                  <button
                    type="button"
                    onClick={() => onPreviewDriveLink(primaryDoc)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Fullscreen Preview</span>
                  </button>

                  <a
                    href={primaryDoc.driveUrl || primaryDoc.fileData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Upload / Replace Google Form"
                      >
                        <Edit2 className="w-4 h-4 text-sky-500" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDocToDelete(primaryDoc)}
                        className="p-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Delete uploaded Google Form"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </>
              ) : isAdmin ? (
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Google Form</span>
                </button>
              ) : null}
            </div>
          </div>

          {/* Embedded Google Forms / Docs Viewer */}
          <div className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span>Embedded Google Form Live Preview (Desktop & Mobile Adaptive)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Official Support Slip
              </span>
            </div>

            <div className="w-full min-h-[500px] h-[650px] bg-slate-50 dark:bg-slate-950 flex flex-col">
              {previewEmbedUrl ? (
                <iframe
                  src={previewEmbedUrl}
                  title="Official Service Request Google Form Preview"
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center text-sky-600 dark:text-sky-400">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-bold text-base text-slate-900 dark:text-white">
                      No Google Form Uploaded Yet
                    </h4>
                    <p className={`text-xs max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      The Records Administrator will upload the official Google Form for technical assistance and service requests. Once uploaded by the admin, users can preview and fill out the form here.
                    </p>
                  </div>
                  {isAdmin ? (
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Official Google Form Now</span>
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-medium">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Awaiting Administrator Google Form Upload</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeSubTab === 'create' ? (
        /* CREATE TICKET SUB-TAB */
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {submitSuccessMsg ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold">Ticket Submitted!</h3>
              <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {submitSuccessMsg}
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">Create Technical Assistance / Service Ticket</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Fill in the details below. Our records section officers will review and address your request.
                </p>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Requester Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Maria Santos"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="e.g. msantos@dswd.gov.ph"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    Division / Section / Unit <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formOffice}
                    onChange={(e) => setFormOffice(e.target.value)}
                    placeholder="e.g. Finance / HRMDD / Pantawid Pamilya"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Service Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Request for Technical Assistance on Records Management">
                      Technical Assistance on Records Management
                    </option>
                    <option value="Request for Diposal of Valueless Records">
                      Disposal of Valueless Records (NAP Form 1)
                    </option>
                    <option value="Request for Archival of Vital/Permanent Records">
                      Archival of Vital / Permanent Records
                    </option>
                    <option value="Request for Messengerial Services">
                      Messengerial & Courier Tracking Inquiry
                    </option>
                    <option value="Request for Copies and Certification of Documents">
                      Copies & Document Certification
                    </option>
                    <option value="Administrative Issuances Verification">
                      Administrative Issuances Verification
                    </option>
                    <option value="Portal Access & Account Support">
                      Portal Access / Technical Bug Report
                    </option>
                    <option value="General Inquiry">General Records Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Priority Level</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as TicketPriority)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Low">Low - Routine Request</option>
                    <option value="Medium">Medium - Standard Operational</option>
                    <option value="High">High - Priority Document Deadline</option>
                    <option value="Urgent">Urgent - Immediate Compliance / Audit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Ticket Subject / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Assistance in Archival Inventory of 2023 Payroll Slips"
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Detailed Description & Requirements <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Specify details, volume of records, series year, urgency, or specific questions..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Google Docs or Drive Link (Optional Attachment)
                </label>
                <input
                  type="url"
                  value={formDriveUrl}
                  onChange={(e) => setFormDriveUrl(e.target.value)}
                  placeholder="https://docs.google.com/document/d/... or drive.google.com/..."
                  className={`w-full px-3 py-2 rounded-xl text-xs font-mono border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Attach your filled Service Request Slip or supporting document link for preview.
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Creating Ticket...' : 'Submit Support Ticket'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* TICKETS TRACKER SUB-TAB */
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, title, requester, office..."
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Status:</span>
              {(['all', 'Open', 'In Progress', 'Resolved', 'Closed'] as const).map((st) => (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === st
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : isDark
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {st === 'all' ? 'All' : st}
                </button>
              ))}
            </div>
          </div>

          {/* Tickets Display: Mobile Cards & Desktop Table */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-sm">
                Recorded Support Tickets ({filteredTickets.length})
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                Tap ticket to preview details & resolution notes
              </span>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                <TicketIcon className="w-10 h-10 text-slate-400 mx-auto" />
                <p>No support tickets match the selected filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTickets.map((tkt) => (
                  <div
                    key={tkt.id}
                    onClick={() => {
                      setSelectedTicketDetail(tkt);
                      setEditingStatus(tkt.status);
                      setEditingResolutionNotes(tkt.resolutionNotes || '');
                    }}
                    className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                            {tkt.ticketNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(tkt.status)}`}>
                            {tkt.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(tkt.priority)}`}>
                            {tkt.priority} Priority
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                          {tkt.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span>{tkt.requesterName} ({tkt.requesterOffice})</span>
                          <span>•</span>
                          <span>Category: {tkt.category}</span>
                          <span>•</span>
                          <span>{new Date(tkt.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {tkt.attachedFormUrl && (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            <span>Form Attached</span>
                          </span>
                        )}
                        <span className="p-2 text-slate-400 group-hover:text-sky-500 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ticket Details & Resolution Modal */}
      {selectedTicketDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border flex flex-col max-h-[90vh] overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Header */}
            <div className={`p-5 border-b flex items-start justify-between shrink-0 ${
              isDark ? 'bg-slate-850 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-sky-600 dark:text-sky-400">
                    {selectedTicketDetail.ticketNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getStatusBadge(selectedTicketDetail.status)}`}>
                    {selectedTicketDetail.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(selectedTicketDetail.priority)}`}>
                    {selectedTicketDetail.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold leading-tight">
                  {selectedTicketDetail.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTicketDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
              {/* Requester Info */}
              <div className={`p-4 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 ${
                isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Requester</span>
                  <span className="font-bold text-sm block">{selectedTicketDetail.requesterName}</span>
                  <span className="text-slate-500 block">{selectedTicketDetail.requesterEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Division / Office</span>
                  <span className="font-bold text-sm block">{selectedTicketDetail.requesterOffice}</span>
                  <span className="text-slate-500 block">Category: {selectedTicketDetail.category}</span>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <span className="font-bold text-slate-400 block mb-1 uppercase tracking-wider text-[10px]">
                  Description of Request
                </span>
                <p className={`p-4 rounded-xl border leading-relaxed ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  {selectedTicketDetail.description}
                </p>
              </div>

              {/* Attached Form or Google Docs */}
              {selectedTicketDetail.attachedFormUrl && (
                <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-blue-950/20 border-blue-900/40 text-blue-200' : 'bg-blue-50/70 border-blue-200 text-blue-900'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-5 h-5 text-blue-500 shrink-0" />
                    <div>
                      <span className="font-bold block">Attached Document / Form</span>
                      <span className="text-[11px] font-mono text-slate-400 truncate max-w-sm block">
                        {selectedTicketDetail.attachedFormUrl}
                      </span>
                    </div>
                  </div>
                  <a
                    href={selectedTicketDetail.attachedFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Preview</span>
                  </a>
                </div>
              )}

              {/* Resolution Notes Section */}
              <div className="space-y-2">
                <span className="font-bold text-slate-400 block uppercase tracking-wider text-[10px]">
                  Official Action Taken & Resolution Notes
                </span>

                {isAdmin ? (
                  <div className={`p-4 rounded-xl border space-y-3 ${
                    isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div>
                      <label className="block font-bold mb-1">Update Ticket Status</label>
                      <select
                        value={editingStatus}
                        onChange={(e) => setEditingStatus(e.target.value as TicketStatus)}
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                        }`}
                      >
                        <option value="Open">Open - Pending Review</option>
                        <option value="In Progress">In Progress - Being Handled</option>
                        <option value="Resolved">Resolved - Action Completed</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold mb-1">Resolution Remarks / Action Taken</label>
                      <textarea
                        rows={3}
                        value={editingResolutionNotes}
                        onChange={(e) => setEditingResolutionNotes(e.target.value)}
                        placeholder="Document actions taken, dispatch numbers, schedule dates..."
                        className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                          isDark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-300'
                        }`}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => setTicketToDelete(selectedTicketDetail.id)}
                        className="text-rose-500 hover:text-rose-600 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveResolution}
                        disabled={isUpdatingStatus}
                        className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isUpdatingStatus ? 'Saving...' : 'Save Resolution'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`p-4 rounded-xl border leading-relaxed ${
                    selectedTicketDetail.resolutionNotes
                      ? isDark
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                        : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                      : isDark
                      ? 'bg-slate-950 border-slate-800 text-slate-400'
                      : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    {selectedTicketDetail.resolutionNotes ||
                      'No resolution remarks recorded yet. Records Section is reviewing your ticket.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Upload Modal */}
      {isUploadModalOpen && (
        <AdminFormUploadModal
          isOpen={true}
          onClose={() => setIsUploadModalOpen(false)}
          currentUser={currentUser}
          sectionId="ticketing-support"
          sectionTitle="Ticketing Support System Service Form"
          onRefreshData={() => {
            onRefreshData();
            setIsUploadModalOpen(false);
          }}
          theme={theme}
        />
      )}

      {/* Confirm Delete Ticket Modal */}
      {ticketToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle="Support Ticket"
          onConfirm={handleDeleteTicket}
          onClose={() => setTicketToDelete(null)}
        />
      )}

      {/* Confirm Delete Google Form Modal */}
      {docToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle={docToDelete.fileName}
          onConfirm={handleDeleteDoc}
          onClose={() => setDocToDelete(null)}
        />
      )}
    </div>
  );
};
