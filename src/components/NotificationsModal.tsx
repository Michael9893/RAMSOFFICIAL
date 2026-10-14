import React, { useState } from 'react';
import {
  AppNotification,
  NotificationType,
  NotificationPriority,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  createNotification,
} from '../lib/notificationStore.ts';
import { AppUser } from '../lib/authStore.ts';
import {
  Bell,
  X,
  CheckCheck,
  Megaphone,
  Clock,
  FileText,
  Trash2,
  Plus,
  Send,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Pin,
} from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  currentUser: AppUser | null;
  onNavigateToSection?: (sectionId: string, fileId?: string) => void;
  theme?: 'light' | 'dark';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUser,
  onNavigateToSection,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser?.role === 'admin';
  const userEmail = currentUser?.email || 'guest@dswd.gov.ph';

  const [filterType, setFilterType] = useState<'all' | 'announcement' | 'upload' | 'reminder'>('all');
  const [isComposing, setIsComposing] = useState(false);

  // Compose State
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newType, setNewType] = useState<NotificationType>('announcement');
  const [newPriority, setNewPriority] = useState<NotificationPriority>('high');
  const [newTargetSection, setNewTargetSection] = useState('issuances-2026');
  const [newPinned, setNewPinned] = useState(false);
  const [composeLoading, setComposeLoading] = useState(false);
  const [composeError, setComposeError] = useState('');

  if (!isOpen) return null;

  // Filter list
  const filteredNotifications = notifications.filter((notif) => {
    if (filterType === 'all') return true;
    return notif.type === filterType;
  });

  const unreadCount = notifications.filter((n) => !n.readBy.includes(userEmail)).length;

  const handleMarkAllRead = async () => {
    await markAllNotificationsAsRead(userEmail);
  };

  const handleNotificationClick = async (notif: AppNotification) => {
    await markNotificationAsRead(notif.id, userEmail);
    if (notif.targetSection && onNavigateToSection) {
      onNavigateToSection(notif.targetSection, notif.fileId);
      onClose();
    }
  };

  const handlePostNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) {
      setComposeError('Please provide both a title and message.');
      return;
    }

    setComposeLoading(true);
    setComposeError('');

    try {
      await createNotification({
        type: newType,
        title: newTitle.trim(),
        message: newMessage.trim(),
        priority: newPriority,
        createdBy: userEmail,
        targetSection: newTargetSection,
        pinned: newPinned,
      });

      setNewTitle('');
      setNewMessage('');
      setIsComposing(false);
    } catch (err) {
      setComposeError('Failed to post announcement: ' + (err as Error).message);
    } finally {
      setComposeLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNotification(id);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 2) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className={`relative w-full max-w-lg h-full border-l shadow-2xl flex flex-col ${
        isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Top Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between ${
          isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-gradient-to-r from-[#0d2159] to-[#1a388a] text-white'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Bell className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Notifications & Bulletins
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-xs">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <p className="text-[11px] text-sky-200 mt-0.5">
                Official Announcements, Directives & Records Reminders
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Filter Pills & Admin Compose Trigger */}
        <div className={`px-4 py-2.5 border-b flex items-center justify-between gap-2 text-xs ${
          isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50 border-slate-200'
        }`}>
          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
                filterType === 'all'
                  ? 'bg-sky-600 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilterType('announcement')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'announcement'
                  ? 'bg-sky-600 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Megaphone className="w-3 h-3 text-amber-500" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setFilterType('upload')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'upload'
                  ? 'bg-sky-600 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3 h-3 text-sky-500" />
              <span>Uploads</span>
            </button>
            <button
              onClick={() => setFilterType('reminder')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1 ${
                filterType === 'reminder'
                  ? 'bg-sky-600 text-white'
                  : isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-3 h-3 text-emerald-500" />
              <span>Reminders</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setIsComposing(!isComposing)}
                className={`p-1.5 rounded-md font-semibold text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${
                  isComposing
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-[#0284c7] hover:bg-[#0369a1] text-white shadow-xs'
                }`}
                title={isComposing ? 'Close composer' : 'Post announcement or reminder as Admin'}
              >
                {isComposing ? (
                  <>
                    <X className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Close</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Post Notice</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Admin Compose Form (Collapsible) */}
        {isAdmin && isComposing && (
          <form onSubmit={handlePostNotification} className={`p-4 border-b space-y-3 animate-in slide-in-from-top-2 duration-150 ${
            isDark ? 'bg-slate-850/90 border-slate-700' : 'bg-sky-50/70 border-sky-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-900 dark:text-sky-200 flex items-center gap-1.5 uppercase tracking-wide">
                <Megaphone className="w-3.5 h-3.5 text-amber-500" />
                <span>Admin Announcement & Reminder Creator</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">Broadcasting to all users</span>
            </div>

            {composeError && (
              <div className="p-2 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px]">
                {composeError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Bulletin Category
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as NotificationType)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="announcement">📢 Announcement</option>
                  <option value="reminder">⏰ Reminder / Cutoff</option>
                  <option value="upload">📄 New Issuance / Document</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Urgency Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as NotificationPriority)}
                  className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none cursor-pointer ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="normal">Normal Information</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent / Immediate Action</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Notice Title *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Mandatory submission of Series 2026 Records"
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Message & Instructions *
              </label>
              <textarea
                rows={2}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Provide detailed context, instructions, contact person, or deadlines..."
                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:outline-none ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newPinned}
                  onChange={(e) => setNewPinned(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <span>Pin to top of bulletin</span>
              </label>

              <button
                type="submit"
                disabled={composeLoading}
                className="px-3.5 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Send className="w-3 h-3" />
                <span>{composeLoading ? 'Posting...' : 'Broadcast Bulletin'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-6 h-6" />
              </div>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                No notifications right now
              </p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Official announcements, new administrative issuance uploads, and dispatch reminders will appear here in real-time.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.readBy.includes(userEmail);
              const isUrgent = notif.priority === 'urgent';
              const isHigh = notif.priority === 'high';

              return (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 transition-all cursor-pointer relative group flex items-start gap-3.5 ${
                    isUnread
                      ? isDark
                        ? 'bg-slate-800/60 hover:bg-slate-800'
                        : 'bg-sky-50/50 hover:bg-sky-50'
                      : isDark
                      ? 'hover:bg-slate-850'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Left Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-2xs ${
                    notif.type === 'announcement'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/40'
                      : notif.type === 'reminder'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/40'
                      : 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border border-sky-300/40'
                  }`}>
                    {notif.type === 'announcement' ? (
                      <Megaphone className="w-4 h-4" />
                    ) : notif.type === 'reminder' ? (
                      <Clock className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>

                  {/* Body Text */}
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {notif.pinned && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                      {isUrgent && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider animate-pulse">
                          Urgent Notice
                        </span>
                      )}
                      {isHigh && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                          High Priority
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">
                        {formatRelativeTime(notif.createdAt)}
                      </span>
                    </div>

                    <h4 className={`text-xs sm:text-[13px] font-bold mt-1 leading-snug ${
                      isUnread
                        ? isDark
                          ? 'text-white'
                          : 'text-[#0d2159]'
                        : isDark
                        ? 'text-slate-300'
                        : 'text-slate-800'
                    }`}>
                      {notif.title}
                    </h4>

                    <p className={`text-[11.5px] mt-1 leading-relaxed ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {notif.message}
                    </p>

                    {/* Section link preview hint */}
                    {notif.targetSection && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-sky-600 dark:text-sky-400 group-hover:underline">
                        <span>Open & preview in portal</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Unread Indicator & Delete for Admin */}
                  <div className="absolute right-3.5 top-3.5 flex flex-col items-end gap-2">
                    {isUnread && (
                      <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] ring-4 ring-sky-200 dark:ring-sky-950" />
                    )}

                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, notif.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded transition-opacity cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className={`p-3 border-t text-[11px] text-center ${
          isDark ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          DSWD FO-1 Records and Archives Management Section • Official Bulletin Feed
        </div>
      </div>
    </div>
  );
};
