import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase.ts';
import { cleanFirestorePayload } from './authStore.ts';

export type NotificationType = 'upload' | 'announcement' | 'reminder';
export type NotificationPriority = 'normal' | 'high' | 'urgent';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  createdBy: string;
  priority: NotificationPriority;
  targetSection?: string;
  targetTitle?: string;
  fileId?: string;
  fileUrl?: string;
  isDriveLink?: boolean;
  readBy: string[];
  pinned?: boolean;
}

const STORAGE_KEY_NOTIFICATIONS = 'rams_notifications_v1';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-2',
    type: 'reminder',
    title: 'Reminder: Messengerial Services Cutoff Time',
    message: 'All inter-agency delivery slips (CO.PSP, PSP, and POSTAL) must be submitted to the Records and Archives Management Section before 3:00 PM for same-day dispatch.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    createdBy: 'admin@dswd.gov.ph',
    priority: 'urgent',
    targetSection: 'messengerial',
    targetTitle: 'Messengerial Services Tracker',
    readBy: [],
    pinned: true,
  },
  {
    id: 'notif-3',
    type: 'upload',
    title: 'Updated Records Disposition Schedule (RDS) Published',
    message: 'The master Records Disposition Schedule guidelines and circulars are accessible under the Resources tab for records inventory compliance.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    createdBy: 'admin@dswd.gov.ph',
    priority: 'normal',
    targetSection: 'resources',
    targetTitle: 'Records Disposition Schedule',
    readBy: [],
  },
];

export function getStoredNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(
          (item: AppNotification) =>
            item.id !== 'notif-1' &&
            !item.title.toLowerCase().includes('digitized administrative issuances portal live') &&
            !item.title.toLowerCase().includes('databank of issuances') &&
            !item.message.toLowerCase().includes('databank of issuances')
        );
      }
    }
  } catch (e) {
    console.warn('Error reading stored notifications:', e);
  }
  return INITIAL_NOTIFICATIONS;
}

export function saveStoredNotifications(notifs: AppNotification[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifs));
  } catch (e) {
    console.warn('Error saving notifications to localStorage:', e);
  }
}

export function sanitizeNotification(data: Partial<AppNotification>): AppNotification {
  return {
    id: String(data.id || `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
    type: (data.type === 'announcement' || data.type === 'reminder' || data.type === 'upload') ? data.type : 'announcement',
    title: String(data.title || 'Official Notice').trim(),
    message: String(data.message || '').trim(),
    createdAt: String(data.createdAt || new Date().toISOString()),
    createdBy: String(data.createdBy || 'admin@dswd.gov.ph'),
    priority: (data.priority === 'urgent' || data.priority === 'high' || data.priority === 'normal') ? data.priority : 'normal',
    targetSection: data.targetSection ? String(data.targetSection) : undefined,
    targetTitle: data.targetTitle ? String(data.targetTitle) : undefined,
    fileId: data.fileId ? String(data.fileId) : undefined,
    fileUrl: data.fileUrl ? String(data.fileUrl) : undefined,
    isDriveLink: Boolean(data.isDriveLink),
    readBy: Array.isArray(data.readBy) ? data.readBy.map(String) : [],
    pinned: Boolean(data.pinned),
  };
}

/**
 * Subscribes in real-time to notifications from Firebase Firestore
 */
export function subscribeToNotifications(callback: (notifications: AppNotification[]) => void): () => void {
  // Emit local cache immediately
  callback(getStoredNotifications());

  let initialized = false;

  const unsubscribe = onSnapshot(
    collection(db, 'notifications'),
    async (snapshot) => {
      if (snapshot.empty && !initialized) {
        initialized = true;
        // Cloud is empty: seed initial notifications
        try {
          for (const item of INITIAL_NOTIFICATIONS) {
            const clean = sanitizeNotification(item);
            await setDoc(doc(db, 'notifications', clean.id), cleanFirestorePayload(clean));
          }
        } catch (e) {
          console.warn('Seeding initial notifications to Firestore failed:', e);
        }
        callback(INITIAL_NOTIFICATIONS);
      } else {
        initialized = true;
        const list: AppNotification[] = [];
        snapshot.forEach((d) => {
          const item = sanitizeNotification(d.data() as Partial<AppNotification>);
          if (
            item.id === 'notif-1' ||
            item.title.toLowerCase().includes('digitized administrative issuances portal live') ||
            item.title.toLowerCase().includes('databank of issuances') ||
            item.message.toLowerCase().includes('databank of issuances')
          ) {
            deleteDoc(doc(db, 'notifications', d.id)).catch(() => {});
          } else {
            list.push(item);
          }
        });

        // Sort: pinned first, then newest first
        list.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        saveStoredNotifications(list);
        callback(list);
      }
    },
    (error) => {
      console.warn('Firestore notifications subscription notice:', error);
      callback(getStoredNotifications());
    }
  );

  return unsubscribe;
}

/**
 * Create a new notification (Upload alert, Admin announcement, or Reminder)
 */
export async function createNotification(
  data: Omit<AppNotification, 'id' | 'createdAt' | 'readBy'>
): Promise<AppNotification> {
  const newNotif = sanitizeNotification({
    ...data,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    readBy: [],
  });

  // Local cache
  const current = getStoredNotifications();
  const updated = [newNotif, ...current.filter((n) => n.id !== newNotif.id)];
  saveStoredNotifications(updated);

  // Firestore sync
  try {
    const payload = cleanFirestorePayload(newNotif);
    await setDoc(doc(db, 'notifications', newNotif.id), payload);
  } catch (e) {
    console.error('Firestore createNotification error:', e);
  }

  return newNotif;
}

/**
 * Mark a single notification as read by a user
 */
export async function markNotificationAsRead(notificationId: string, userEmail: string): Promise<void> {
  if (!userEmail) return;
  const current = getStoredNotifications();
  const target = current.find((n) => n.id === notificationId);
  if (!target) return;

  if (target.readBy.includes(userEmail)) return;

  const updatedReadBy = [...target.readBy, userEmail];
  const updated = current.map((n) => (n.id === notificationId ? { ...n, readBy: updatedReadBy } : n));
  saveStoredNotifications(updated);

  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      readBy: updatedReadBy,
    });
  } catch (e) {
    console.error('Firestore markNotificationAsRead error:', e);
  }
}

/**
 * Mark all notifications as read by a user
 */
export async function markAllNotificationsAsRead(userEmail: string): Promise<void> {
  if (!userEmail) return;
  const current = getStoredNotifications();
  const updated = current.map((n) => {
    if (!n.readBy.includes(userEmail)) {
      return { ...n, readBy: [...n.readBy, userEmail] };
    }
    return n;
  });
  saveStoredNotifications(updated);

  // Update in Firestore in background
  try {
    for (const item of updated) {
      updateDoc(doc(db, 'notifications', item.id), {
        readBy: item.readBy,
      }).catch(() => {});
    }
  } catch (e) {
    console.warn('Batch mark all read warning:', e);
  }
}

/**
 * Delete a notification (Admin only)
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const current = getStoredNotifications();
  saveStoredNotifications(current.filter((n) => n.id !== notificationId));

  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (e) {
    console.error('Firestore deleteNotification error:', e);
  }
}
