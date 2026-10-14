import React, { useState } from 'react';
import { AppNotification } from '../lib/notificationStore.ts';
import { Megaphone, Clock, AlertTriangle, X, ChevronRight } from 'lucide-react';

interface AnnouncementBannerProps {
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onNavigateToSection?: (sectionId: string, fileId?: string) => void;
  theme?: 'light' | 'dark';
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({
  notifications,
  onOpenNotifications,
  onNavigateToSection,
  theme = 'light',
}) => {
  const [dismissedId, setDismissedId] = useState<string | null>(null);

  // Find the top active urgent or high priority notification that hasn't been dismissed
  const activeNotice = notifications.find(
    (n) => (n.priority === 'urgent' || n.priority === 'high' || n.pinned) && n.id !== dismissedId
  );

  if (!activeNotice) return null;

  const isUrgent = activeNotice.priority === 'urgent';

  return (
    <aside aria-label="Portal Announcements" className={`w-full px-4 py-2 text-xs flex items-center justify-between gap-3 transition-colors shadow-xs ${
      isUrgent
        ? 'bg-rose-600 text-white font-medium'
        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium'
    }`}>
      <div
        onClick={() => {
          if (activeNotice.targetSection && onNavigateToSection) {
            onNavigateToSection(activeNotice.targetSection, activeNotice.fileId);
          } else {
            onOpenNotifications();
          }
        }}
        className="flex-1 flex items-center gap-2.5 cursor-pointer truncate"
      >
        <div className="shrink-0 p-1 bg-white/20 rounded">
          {activeNotice.type === 'reminder' ? (
            <Clock className="w-3.5 h-3.5 text-white" />
          ) : isUrgent ? (
            <AlertTriangle className="w-3.5 h-3.5 text-white animate-bounce" />
          ) : (
            <Megaphone className="w-3.5 h-3.5 text-white" />
          )}
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="font-extrabold uppercase tracking-wide px-1.5 py-0.2 rounded bg-black/20 text-[10px] shrink-0">
            {activeNotice.type.toUpperCase()}:
          </span>
          <span className="font-bold truncate">{activeNotice.title}</span>
          <span className="hidden md:inline opacity-90 truncate">— {activeNotice.message}</span>
        </div>

        <span className="shrink-0 text-[11px] underline flex items-center gap-0.5 ml-2 font-bold hover:text-sky-100">
          <span>View</span>
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>

      <button
        onClick={() => setDismissedId(activeNotice.id)}
        className="p-1 hover:bg-white/20 rounded transition-colors shrink-0 cursor-pointer"
        title="Dismiss announcement banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
