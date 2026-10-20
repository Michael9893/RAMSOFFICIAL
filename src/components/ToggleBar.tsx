import React from 'react';
import {
  Sun,
  Moon,
  Bell,
  Volume2,
  VolumeX,
  Radio,
  HeartHandshake,
  LifeBuoy,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { AppNotification } from '../lib/notificationStore.ts';
import { AppTab } from './HeroBanner.tsx';
import { SupportTicket, ClientSatisfactionFeedback } from '../lib/authStore.ts';

interface ToggleBarProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  isAnnouncementVisible: boolean;
  onToggleAnnouncement: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  tickets?: SupportTicket[];
  feedbacks?: ClientSatisfactionFeedback[];
  userEmail?: string;
}

export const ToggleBar: React.FC<ToggleBarProps> = ({
  activeTab,
  onSelectTab,
  theme,
  onToggleTheme,
  notifications,
  onOpenNotifications,
  isAnnouncementVisible,
  onToggleAnnouncement,
  isSoundEnabled,
  onToggleSound,
  tickets = [],
  feedbacks = [],
  userEmail = 'guest@dswd.gov.ph',
}) => {
  const isDark = theme === 'dark';
  const unreadCount = notifications.filter((n) => !n.readBy.includes(userEmail)).length;
  const activeTicketsCount = tickets.filter((t) => t.status !== 'Resolved' && t.status !== 'Closed').length;

  const isClientSatisfactionActive = activeTab === 'client-satisfaction';
  const isTicketingActive = activeTab === 'ticketing';

  const handleToggleClientSatisfaction = () => {
    if (isClientSatisfactionActive) {
      onSelectTab('home');
    } else {
      onSelectTab('client-satisfaction');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleTicketing = () => {
    if (isTicketingActive) {
      onSelectTab('home');
    } else {
      onSelectTab('ticketing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`w-full border-b select-none transition-colors duration-200 z-30 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-200 backdrop-blur-md shadow-xs'
          : 'bg-slate-100/95 border-slate-200 text-slate-800 backdrop-blur-md shadow-xs'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-4">
          
          {/* LEFT: System Indicator & Services Toggle Switcher (Client Satisfaction & Ticketing) */}
          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {/* Live Indicator Pill */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 shrink-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Portal
              </span>
            </div>

            {/* Feature 1: Client Satisfaction Toggle Button */}
            <button
              type="button"
              onClick={handleToggleClientSatisfaction}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 shadow-2xs group ${
                isClientSatisfactionActive
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/20 ring-2 ring-rose-400/40'
                  : isDark
                  ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border-slate-700/80 hover:border-rose-400/50'
                  : 'bg-white hover:bg-rose-50/70 text-slate-700 border-slate-300 hover:border-rose-300'
              }`}
              title={
                isClientSatisfactionActive
                  ? 'Client Satisfaction Active (Click to Return Home)'
                  : 'Toggle to Client Satisfaction Form & Feedback System'
              }
            >
              <HeartHandshake
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isClientSatisfactionActive
                    ? 'text-white'
                    : 'text-rose-500'
                }`}
              />
              <span className="whitespace-nowrap">Client Satisfaction</span>
              
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isClientSatisfactionActive
                    ? 'bg-white text-rose-600'
                    : isDark
                    ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {feedbacks.length > 0 ? `${feedbacks.length} Forms` : 'Form'}
              </span>
            </button>

            {/* Feature 2: Ticketing Support System Toggle Button */}
            <button
              type="button"
              onClick={handleToggleTicketing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 shadow-2xs group ${
                isTicketingActive
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm shadow-amber-500/20 ring-2 ring-amber-400/40'
                  : isDark
                  ? 'bg-slate-800/90 hover:bg-slate-750 text-slate-200 border-slate-700/80 hover:border-amber-400/50'
                  : 'bg-white hover:bg-amber-50/70 text-slate-700 border-slate-300 hover:border-amber-300'
              }`}
              title={
                isTicketingActive
                  ? 'Ticketing Support Active (Click to Return Home)'
                  : 'Toggle to Ticketing Support System & Service Forms'
              }
            >
              <LifeBuoy
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                  isTicketingActive
                    ? 'text-slate-950'
                    : 'text-amber-500'
                }`}
              />
              <span className="whitespace-nowrap">Ticketing System</span>
              
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  isTicketingActive
                    ? 'bg-slate-950 text-amber-300'
                    : activeTicketsCount > 0
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : isDark
                    ? 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {activeTicketsCount > 0 ? `${activeTicketsCount} Active` : 'Helpdesk'}
              </span>
            </button>
          </div>

          {/* RIGHT: Notifications, Audio, and Dark/Light Mode Toggles */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-end w-full lg:w-auto shrink-0">
            
            {/* Feature 3A: Notifications & Bulletins Drawer */}
            <button
              type="button"
              onClick={onOpenNotifications}
              className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs relative flex items-center justify-center ${
                unreadCount > 0
                  ? 'bg-rose-500 hover:bg-rose-600 text-white border-rose-600 shadow-sm animate-pulse'
                  : isDark
                  ? 'bg-slate-800 hover:bg-slate-750 text-slate-200 border-slate-700/90'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title={`View Bulletins & Announcements (${unreadCount} unread)`}
            >
              <Bell className={`w-4 h-4 ${unreadCount > 0 ? 'text-white' : 'text-amber-500'}`} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-white text-rose-600 text-[10px] font-black rounded-full ring-2 ring-rose-500">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Feature 3B: Announcement Ticker Toggle */}
            <button
              type="button"
              onClick={onToggleAnnouncement}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isAnnouncementVisible
                  ? isDark
                    ? 'bg-slate-800 border-sky-500/50 text-sky-300 hover:bg-slate-750'
                    : 'bg-sky-50 border-sky-300 text-sky-800 hover:bg-sky-100'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isAnnouncementVisible ? 'Hide Announcement Ticker' : 'Show Announcement Ticker'}
            >
              <Radio className={`w-3.5 h-3.5 ${isAnnouncementVisible ? 'text-rose-500 animate-pulse' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">Ticker:</span>
              <span className="font-bold">{isAnnouncementVisible ? 'ON' : 'OFF'}</span>
            </button>

            {/* Feature 3C: Audio Alert Chime Toggle */}
            <button
              type="button"
              onClick={onToggleSound}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isSoundEnabled
                  ? isDark
                    ? 'bg-slate-800 border-amber-500/50 text-amber-300 hover:bg-slate-750'
                    : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  : isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={isSoundEnabled ? 'Mute Alert Chimes' : 'Enable Alert Chimes'}
            >
              {isSoundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-amber-500" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span className="hidden md:inline">Alerts:</span>
              <span className="font-bold">{isSoundEnabled ? 'Audio' : 'Muted'}</span>
            </button>

            {/* Separator */}
            <div className={`hidden sm:block w-px h-4 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />

            {/* Feature 4: Dark & Light Mode Segmented Toggle Bar */}
            <div
              className={`flex items-center p-0.5 rounded-xl border shadow-2xs ${
                isDark
                  ? 'bg-slate-950/80 border-slate-700/80'
                  : 'bg-white border-slate-300/80'
              }`}
              role="group"
              aria-label="Theme mode toggle"
            >
              <button
                type="button"
                onClick={() => theme === 'dark' && onToggleTheme()}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  !isDark
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Switch to Light Mode"
                aria-label="Light Mode"
              >
                <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-300' : 'text-slate-400'}`} />
              </button>

              <button
                type="button"
                onClick={() => theme === 'light' && onToggleTheme()}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isDark
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Switch to Dark Mode"
                aria-label="Dark Mode"
              >
                <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-slate-500'}`} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
