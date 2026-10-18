import React, { useState } from 'react';
import {
  AppUser,
  SopFile,
  ClientSatisfactionFeedback,
  createSatisfactionFeedback,
  deleteSatisfactionFeedback,
  getGoogleDriveEmbedUrl,
} from '../lib/authStore.ts';
import {
  HeartHandshake,
  Star,
  Upload,
  Eye,
  Download,
  ExternalLink,
  CheckCircle2,
  Send,
  FileText,
  BarChart3,
  Calendar,
  Building2,
  User,
  Mail,
  Shield,
  Trash2,
  Sparkles,
  Lock,
  Plus,
  X,
  MessageSquare,
} from 'lucide-react';
import { AdminFormUploadModal } from './AdminFormUploadModal.tsx';
import { ConfirmDeleteModal } from './ConfirmDeleteModal.tsx';

interface ClientSatisfactionViewProps {
  currentUser: AppUser | null;
  files: SopFile[];
  feedbacks: ClientSatisfactionFeedback[];
  onPreviewDriveLink: (file: SopFile) => void;
  onRefreshData: () => void;
  onOpenLogin: () => void;
  theme?: 'light' | 'dark';
}

export const ClientSatisfactionView: React.FC<ClientSatisfactionViewProps> = ({
  currentUser,
  files,
  feedbacks,
  onPreviewDriveLink,
  onRefreshData,
  onOpenLogin,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';

  // Active view tab: 'preview' (Official Form preview) | 'submit' (Online Survey) | 'responses' (Summary/Admin view)
  const [activeSubTab, setActiveSubTab] = useState<'preview' | 'submit' | 'responses'>('preview');

  // Form files for client-satisfaction
  const csfFiles = files.filter((f) => f.sopId === 'client-satisfaction');
  const primaryDoc = csfFiles[0] || null;

  // Admin upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);

  // Online feedback form state
  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [clientEmail, setClientEmail] = useState(currentUser?.email || '');
  const [clientOffice, setClientOffice] = useState(currentUser?.department || '');
  const [clientType, setClientType] = useState<'Citizen' | 'Government Employee' | 'Business / Organization' | 'Other'>('Government Employee');
  const [serviceAvailed, setServiceAvailed] = useState('Request for Messengerial Services');
  const [dateAvailed, setDateAvailed] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Rating states (1 to 5)
  const [ratings, setRatings] = useState({
    responsiveness: 5,
    reliability: 5,
    integrity: 5,
    facilities: 5,
    overall: 5,
  });
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Star Rating Component
  const renderStarRating = (
    label: string,
    key: keyof typeof ratings,
    description: string
  ) => {
    return (
      <div className={`p-4 rounded-xl border transition-all ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div>
            <span className="font-bold text-sm block">{label}</span>
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {description}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onClick={() => setRatings((prev) => ({ ...prev, [key]: star }))}
                className="p-1 hover:scale-110 transition-transform cursor-pointer"
                title={`${star} Star${star > 1 ? 's' : ''}`}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= ratings[key]
                      ? 'fill-amber-400 text-amber-400'
                      : isDark
                      ? 'text-slate-700'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 font-black text-sm text-amber-500 min-w-[28px]">
              {ratings[key]}/5
            </span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createSatisfactionFeedback({
        clientName: clientName.trim() || 'Anonymous Client',
        clientEmail: clientEmail.trim() || 'client@dswd.gov.ph',
        clientOffice: clientOffice.trim() || 'Internal / External Client',
        clientType,
        serviceAvailed,
        dateAvailed,
        ratings,
        comments: comments.trim(),
      });
      setSubmittedSuccess(true);
      setComments('');
      onRefreshData();
      setTimeout(() => {
        setSubmittedSuccess(false);
        setActiveSubTab('responses');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;
    await deleteSatisfactionFeedback(feedbackToDelete);
    setFeedbackToDelete(null);
    onRefreshData();
  };

  // Calculate Average Satisfaction Score
  const totalFeedbacks = feedbacks.length;
  const overallAvg =
    totalFeedbacks > 0
      ? (
          feedbacks.reduce((acc, f) => acc + (f.ratings?.overall || 5), 0) /
          totalFeedbacks
        ).toFixed(1)
      : '5.0';

  const previewEmbedUrl = primaryDoc ? getGoogleDriveEmbedUrl(primaryDoc.driveUrl || primaryDoc.fileData) : null;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-r from-sky-50 via-white to-blue-50 border-sky-100'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-500/10 text-rose-600 border border-rose-500/20">
                ARTA & Citizen&apos;s Charter Compliant
              </span>
              <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Republic Act No. 11032
              </span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Client Satisfaction Measurement (CSM / CSF)
            </h1>
            <p className={`text-xs sm:text-sm max-w-3xl leading-relaxed ${
              isDark ? 'text-slate-300' : 'text-slate-600'
            }`}>
              Help us improve our records management and public service. Upload, preview, and submit the official DSWD Client Satisfaction Feedback form for all services availed at the Records and Archives Management Section.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className={`p-4 rounded-xl border flex items-center gap-4 shrink-0 shadow-2xs ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-500">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-amber-500">{overallAvg}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400 inline" />
              </div>
              <span className={`text-[11px] font-semibold block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Based on {totalFeedbacks} Client Response{totalFeedbacks === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4 border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
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
              <span>Official Form & Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('submit')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'submit'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Online Survey</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('responses')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'responses'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : isDark
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Client Ratings ({feedbacks.length})</span>
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
              <span>Upload CSF Form (Google Docs / Link)</span>
            </button>
          ) : (
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
              <Lock className="w-3 h-3" />
              <span>Form Uploads Restricted to AD-RAMS Admin</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Sub-tab Content */}
      {activeSubTab === 'preview' ? (
        /* PREVIEW SUB-TAB: Desktop & Mobile Responsive Preview */
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight">
                  {primaryDoc ? primaryDoc.fileName : 'DSWD Official Client Satisfaction Measurement (CSM) Form'}
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {primaryDoc?.isDriveLink ? 'Interactive Google Docs / Drive Document' : 'Standard PDF Document'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {primaryDoc && (
                <>
                  <button
                    type="button"
                    onClick={() => onPreviewDriveLink(primaryDoc)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Open Fullscreen Modal</span>
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
                </>
              )}
            </div>
          </div>

          {/* Embedded Google Docs / Form View (Desktop & Mobile Viewport) */}
          <div className={`rounded-2xl border overflow-hidden shadow-sm flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-500" />
                <span>Embedded Google Docs Live Preview (Desktop & Mobile Adaptive)</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Scroll to view entire form
              </span>
            </div>

            <div className="w-full h-[650px] bg-slate-50 dark:bg-slate-950 flex flex-col">
              {previewEmbedUrl ? (
                <iframe
                  src={previewEmbedUrl}
                  title="Client Satisfaction Form Preview"
                  className="w-full h-full border-0"
                  allow="fullscreen"
                  sandbox="allow-scripts allow-same-origin allow-popups"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                  <FileText className="w-16 h-16 text-slate-400" />
                  <div className="space-y-1">
                    <h4 className="font-bold text-base">No Preview Document Uploaded Yet</h4>
                    <p className={`text-xs max-w-md ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Administrator can click &ldquo;Upload CSF Form&rdquo; above to attach the official Google Docs or Google Form link for immediate interactive preview.
                    </p>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setIsUploadModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                    >
                      + Upload Google Docs Form Now
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeSubTab === 'submit' ? (
        /* SUBMIT SUB-TAB: Interactive Online Feedback Form */
        <div className={`p-6 sm:p-8 rounded-2xl border shadow-sm ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {submittedSuccess ? (
            <div className="py-12 text-center space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
              <h3 className="text-xl font-bold">Maraming Salamat! Feedback Submitted</h3>
              <p className={`text-xs sm:text-sm max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Your feedback has been successfully recorded in the DSWD AD-RAMS Client Satisfaction Database.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-6">
              <div className="border-b pb-4 border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold">Client Information & Service Details</h2>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Please fill out the information below. Anonymous submissions are accepted.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Client Name (Optional)</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="e.g. client@dswd.gov.ph"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Office / Division / Agency</label>
                  <input
                    type="text"
                    value={clientOffice}
                    onChange={(e) => setClientOffice(e.target.value)}
                    placeholder="e.g. Administrative Division / Promotive Services"
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Client Classification</label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Government Employee">Government Employee (Internal)</option>
                    <option value="Citizen">Citizen (External Public)</option>
                    <option value="Business / Organization">Business / Partner Agency</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Service Availed</label>
                  <select
                    value={serviceAvailed}
                    onChange={(e) => setServiceAvailed(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  >
                    <option value="Request for Messengerial Services">Request for Messengerial Services</option>
                    <option value="Request for Diposal of Valueless Records">Request for Diposal of Valueless Records</option>
                    <option value="Request for Archival of Vital/Permanent Records">Request for Archival of Vital/Permanent Records</option>
                    <option value="Request for Technical Assistance on Records Management">Request for Technical Assistance on Records Management</option>
                    <option value="Request for Copies and Certification of Documents">Request for Copies and Certification of Documents</option>
                    <option value="Certification and Dissemination of Administrative Issuances">Certification and Dissemination of Administrative Issuances</option>
                    <option value="Provision of Freedom of Information Request">Provision of Freedom of Information Request</option>
                    <option value="Processing of Incoming Documents">Processing of Incoming Documents</option>
                    <option value="General Inquiries">General Records Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Date Service Availed</label>
                  <input
                    type="date"
                    value={dateAvailed}
                    onChange={(e) => setDateAvailed(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                    }`}
                  />
                </div>
              </div>

              {/* ARTA Rating Criteria */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Service Quality Ratings (1 to 5 Stars)</span>
                </h3>

                {renderStarRating('1. Responsiveness', 'responsiveness', 'Staff promptly and courteously attended to my request without undue delay.')}
                {renderStarRating('2. Reliability & Quality', 'reliability', 'The service or requested document was handled accurately and completely.')}
                {renderStarRating('3. Integrity & Professionalism', 'integrity', 'The AD-RAMS personnel treated me with respect, fairness, and honesty.')}
                {renderStarRating('4. Access & Facilities', 'facilities', 'The online portal / physical office processes were accessible and user-friendly.')}
                {renderStarRating('5. Overall Satisfaction', 'overall', 'Overall level of satisfaction with the service provided.')}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Comments, Commendations, or Suggestions for Improvement
                </label>
                <textarea
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Share your experience or suggestions for the Records Section..."
                  className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? 'bg-slate-950 border-slate-700 text-white' : 'bg-slate-50 border-slate-300'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Satisfaction Survey'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* RESPONSES & ANALYTICS SUB-TAB */
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Total Submissions</span>
              <span className="text-3xl font-black text-sky-600 dark:text-sky-400">{feedbacks.length}</span>
              <span className="text-[11px] text-slate-400 block mt-1">Verified Client Responses</span>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-semibold text-slate-400 block mb-1">Average Satisfaction</span>
              <div className="flex items-center gap-1.5">
                <span className="text-3xl font-black text-amber-500">{overallAvg}</span>
                <span className="text-xs text-slate-400">/ 5.0</span>
              </div>
              <span className="text-[11px] text-emerald-500 font-bold block mt-1">Outstanding Rating</span>
            </div>

            <div className={`p-5 rounded-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <span className="text-xs font-semibold text-slate-400 block mb-1">ARTA Compliance</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
              <span className="text-[11px] text-slate-400 block mt-1">Standard Citizen&apos;s Charter</span>
            </div>
          </div>

          {/* Feedback List */}
          <div className={`rounded-2xl border overflow-hidden ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm">Recent Feedback Submissions</h3>
              <span className="text-xs text-slate-400 font-semibold">{feedbacks.length} entries</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {feedbacks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No feedback entries recorded yet.
                </div>
              ) : (
                feedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {fb.clientName || 'Anonymous'}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          {fb.clientOffice || 'Internal'}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {new Date(fb.submittedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-black text-amber-700 dark:text-amber-400">
                            {fb.ratings?.overall || 5}/5
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setFeedbackToDelete(fb.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                            title="Delete Feedback (Admin only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="text-xs font-semibold text-sky-700 dark:text-sky-400 mb-1">
                      Service Availed: {fb.serviceAvailed}
                    </div>

                    {fb.comments && (
                      <p className="text-xs italic text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                        &ldquo;{fb.comments}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
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
          sectionId="client-satisfaction"
          sectionTitle="Client Satisfaction Measurement (CSM/CSF) Form"
          onRefreshData={() => {
            onRefreshData();
            setIsUploadModalOpen(false);
          }}
          theme={theme}
        />
      )}

      {/* Confirm Delete Feedback Modal */}
      {feedbackToDelete && (
        <ConfirmDeleteModal
          isOpen={true}
          itemTitle="Selected Client Feedback"
          onConfirm={handleDeleteFeedback}
          onClose={() => setFeedbackToDelete(null)}
        />
      )}
    </div>
  );
};
