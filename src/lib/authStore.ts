import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase.ts';

export type UserRole = 'admin' | 'user';
export type UserStatus = 'active' | 'pending' | 'suspended' | 'disapproved';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  password?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  department?: string;
  requestedRole?: UserRole;
  approvedAt?: string;
  approvedBy?: string;
}

export interface SopFile {
  id: string;
  sopId: string; // Used for SOP id or Template category id
  sopTitle: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  fileData: string; // base64 or download URL or drive URL
  isDriveLink?: boolean;
  driveUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  downloadCount: number;
}

export const RESOURCE_CATEGORIES = [
  { id: 'resource-rds', title: 'Records Disposition Schedule (RDS)', type: 'resource' as const },
];

export const ISSUANCE_CATEGORIES = [
  { id: 'issuance-2025', title: 'Administrative Issuances 2025', year: '2025', type: 'issuance' as const },
  { id: 'issuance-2026', title: 'Administrative Issuances 2026', year: '2026', type: 'issuance' as const },
];

export const TEMPLATE_CATEGORIES = [
  { id: 'tpl-general', title: 'General Forms', type: 'template' as const },
  { id: 'tpl-admin-service', title: 'Admin Service Forms', type: 'template' as const },
  { id: 'tpl-records-related', title: 'Records Related Forms', type: 'template' as const },
  { id: 'tpl-fo1-unique', title: 'FO 1 Unique Forms', type: 'template' as const },
];

export const SOP_CATEGORIES = [
  { id: 'disposal', title: 'Request for Diposal of Valueless Records', type: 'sop' as const },
  { id: 'archival', title: 'Request for Archival of Vital/Permanent Records', type: 'sop' as const },
  { id: 'messengerial', title: 'Request for Messengerial Services', type: 'sop' as const },
  { id: 'technical-assistance', title: 'Request for Technical Assistance on Records Management', type: 'sop' as const },
  { id: 'copies-certification', title: 'Request for Copies and Certification of Documents', type: 'sop' as const },
  { id: 'issuances', title: 'Certification and Dissemination of Administrative Issuances', type: 'sop' as const },
  { id: 'foi', title: 'Provision of Freedom of Information Request', type: 'sop' as const },
  { id: 'incoming', title: 'Processing of Incoming Documents', type: 'sop' as const },
];

export const ALL_UPLOADABLE_SECTIONS = [
  ...RESOURCE_CATEGORIES,
  ...ISSUANCE_CATEGORIES,
  ...SOP_CATEGORIES,
  ...TEMPLATE_CATEGORIES,
];

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@dswd.gov.ph',
    name: 'Administrative Officer (Admin)',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    department: 'AD-RAMS Records Section',
    createdAt: '2025-01-15T08:00:00Z',
  },
  {
    id: 'user-regular-2',
    email: 'user@dswd.gov.ph',
    name: 'Field Office Staff (User)',
    password: 'user123',
    role: 'user',
    status: 'active',
    department: 'Operations Division',
    createdAt: '2025-02-10T09:30:00Z',
  },
  {
    id: 'user-pending-1',
    email: 'maria.santos@dswd.gov.ph',
    name: 'Maria Santos',
    password: 'user123',
    role: 'user',
    status: 'pending',
    department: 'Community-Based Services Section',
    requestedRole: 'user',
    createdAt: '2026-03-01T08:30:00Z',
  },
];

const INITIAL_SOP_FILES: SopFile[] = [
  {
    id: 'sop-file-1',
    sopId: 'disposal',
    sopTitle: 'Request for Diposal of Valueless Records',
    fileName: 'NAP-Form-1-Authority-to-Dispose-2025.pdf',
    fileSize: '420 KB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJUZpbGUgY29udGVudHMgZm9yIE5BUCBGb3JtIDEgQXV0aG9yaXR5IHRvIERpc3Bvc2UgUmVjb3JkcyAtIEFEIFJBTVM=',
    isDriveLink: false,
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-01 10:15 AM',
    description: 'Official National Archives of the Philippines Authority to Dispose Form.',
    downloadCount: 14,
  },
  {
    id: 'sop-drive-1',
    sopId: 'disposal',
    sopTitle: 'Request for Diposal of Valueless Records',
    fileName: 'Official Google Drive Repository: Disposal Guidelines & Inspection Vault',
    fileSize: 'Google Drive',
    fileType: 'google-drive',
    fileData: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    isDriveLink: true,
    driveUrl: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-03 01:20 PM',
    description: 'Shared Google Drive folder with disposal directives and regional inspection photo archives.',
    downloadCount: 31,
  },
  {
    id: 'sop-file-2',
    sopId: 'archival',
    sopTitle: 'Request for Archival of Vital/Permanent Records',
    fileName: 'Archival-Transfer-List-Template.xlsx',
    fileSize: '185 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    fileData: 'data:text/plain;base64,QXJjaGl2YWwgVHJhbnNmZXIgTGlzdCBJbnZlbnRvcnkgVGVtcGxhdGUgZm9yIFZpdGFsIFJlY29yZHM=',
    isDriveLink: false,
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-05 02:40 PM',
    description: 'Master checklist and accession form for permanent archival transfer.',
    downloadCount: 8,
  },
  {
    id: 'sop-file-3',
    sopId: 'messengerial',
    sopTitle: 'Request for Messengerial Services',
    fileName: 'Messengerial-Service-Slip-MSS.docx',
    fileSize: '95 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileData: 'data:text/plain;base64,TWVzc2VuZ2VyaWFsIFNlcnZpY2UgU2xpcCAoTVNTKSBGb3Jt',
    isDriveLink: false,
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-12 11:00 AM',
    description: 'Inter-agency routing dispatch voucher for courier services.',
    downloadCount: 22,
  },
  {
    id: 'tpl-file-1',
    sopId: 'tpl-general',
    sopTitle: 'General Forms',
    fileName: 'General-Document-Routing-Slip-2025.pdf',
    fileSize: '210 KB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJUZpbGUgY29udGVudHMgZm9yIEdlbmVyYWwgRG9jdW1lbnQgUm91dGluZyBTbGlw',
    isDriveLink: false,
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-14 09:00 AM',
    description: 'Standard General Document Routing Slip for inter-division routing.',
    downloadCount: 45,
  },
  {
    id: 'tpl-drive-1',
    sopId: 'tpl-general',
    sopTitle: 'General Forms',
    fileName: 'Google Drive: General Administrative Forms & Fillable Templates',
    fileSize: 'Google Drive',
    fileType: 'google-drive',
    fileData: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    isDriveLink: true,
    driveUrl: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-14 09:15 AM',
    description: 'Official shared Google Drive folder containing all general printable forms.',
    downloadCount: 68,
  },
  {
    id: 'tpl-file-2',
    sopId: 'tpl-admin-service',
    sopTitle: 'Admin Service Forms',
    fileName: 'Admin-Service-Request-Form-ASRF.docx',
    fileSize: '115 KB',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileData: 'data:text/plain;base64,QWRtaW4gU2VydmljZSBSZXF1ZXN0IEZvcm0gKEFTUkYp',
    isDriveLink: false,
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-16 03:20 PM',
    description: 'Administrative Service request template for logistics and supplies.',
    downloadCount: 19,
  },
  {
    id: 'tpl-file-3',
    sopId: 'tpl-records-related',
    sopTitle: 'Records Related Forms',
    fileName: 'Records-Disposition-Schedule-Form-RDS.pdf',
    fileSize: '340 KB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKUmVjb3JkcyBEaXNwb3NpdGlvbiBTY2hlZHVsZSBGb3Jt',
    isDriveLink: false,
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-18 11:45 AM',
    description: 'National Archives of the Philippines prescribed disposition template.',
    downloadCount: 37,
  },
  {
    id: 'tpl-drive-2',
    sopId: 'tpl-fo1-unique',
    sopTitle: 'FO 1 Unique Forms',
    fileName: 'Google Drive: Field Office 1 Regional Customized Forms Drive',
    fileSize: 'Google Drive',
    fileType: 'google-drive',
    fileData: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    isDriveLink: true,
    driveUrl: 'https://drive.google.com/drive/folders/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-20 04:10 PM',
    description: 'DSWD Field Office 1 Regional Operations and records registry forms repository.',
    downloadCount: 52,
  },
  {
    id: 'rds-file-1',
    sopId: 'resource-rds',
    sopTitle: 'Records Disposition Schedule (RDS)',
    fileName: 'All RDS (DSWD).pdf',
    fileSize: '1.2 MB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJURTV0QgQWxsIFJlY29yZHMgRGlzcG9zaXRpb24gU2NoZWR1bGUgKEFEIFJBTVMp',
    isDriveLink: false,
    uploadedBy: 'Records Administration Management Section FO 01',
    uploadedAt: 'Feb 26 Records Administration Management Section FO 01',
    description: 'Master compilation of all Department of Social Welfare and Development records disposition schedules.',
    downloadCount: 42,
  },
  {
    id: 'rds-file-2',
    sopId: 'resource-rds',
    sopTitle: 'Records Disposition Schedule (RDS)',
    fileName: 'NAP_General_Circular_No_5.pdf',
    fileSize: '840 KB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJU5BUCBHZW5lcmFsIENpcmN1bGFyIE5vLiA1IC0gR2VuZXJhbCBDaXJjdWxhciBHdWlkZWxpbmVz',
    isDriveLink: false,
    uploadedBy: 'Records Administration Management Section FO 01',
    uploadedAt: 'Jan 19 Records Administration Management Section FO 01',
    description: 'National Archives of the Philippines General Circular No. 5 guidelines on disposition.',
    downloadCount: 28,
  },
  {
    id: 'rds-file-3',
    sopId: 'resource-rds',
    sopTitle: 'Records Disposition Schedule (RDS)',
    fileName: 'RDS 2007 (DSWD).pdf',
    fileSize: '950 KB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJURTV0QgUmVjb3JkcyBEaXNwb3NpdGlvbiBTY2hlZHVsZSAyMDA3',
    isDriveLink: false,
    uploadedBy: 'Records Administration Management Section FO 01',
    uploadedAt: 'Jan 20 Records Administration Management Section FO 01',
    description: 'Records Disposition Schedule Series 2007 approved inventory.',
    downloadCount: 15,
  },
  {
    id: 'rds-file-4',
    sopId: 'resource-rds',
    sopTitle: 'Records Disposition Schedule (RDS)',
    fileName: 'RDS 2015 (DSWD).pdf',
    fileSize: '1.1 MB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJURTV0QgUmVjb3JkcyBEaXNwb3NpdGlvbiBTY2hlZHVsZSAyMDE1',
    isDriveLink: false,
    uploadedBy: 'Records Administration Management Section FO 01',
    uploadedAt: 'Jan 23 Records Administration Management Section FO 01',
    description: 'Records Disposition Schedule Series 2015 updated retention periods.',
    downloadCount: 23,
  },
  {
    id: 'rds-file-5',
    sopId: 'resource-rds',
    sopTitle: 'Records Disposition Schedule (RDS)',
    fileName: 'RDS 2022 (DSWD).pdf',
    fileSize: '1.4 MB',
    fileType: 'application/pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJURTV0QgUmVjb3JkcyBEaXNwb3NpdGlvbiBTY2hlZHVsZSAyMDIy',
    isDriveLink: false,
    uploadedBy: 'Records Administration Management Section FO 01',
    uploadedAt: 'Jan 20 Records Administration Management Section FO 01',
    description: 'Records Disposition Schedule Series 2022 latest revision and operational schedule.',
    downloadCount: 36,
  },
];

const STORAGE_KEY_USERS = 'rams_users_v4';
const STORAGE_KEY_FILES = 'rams_sop_files_v4';
const STORAGE_KEY_CURRENT_USER = 'rams_current_user_v4';

// ==========================================
// SANITIZERS & SAFETY FOR CLOUD FIRESTORE
// ==========================================

export function cleanFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
        clean[key] = cleanFirestorePayload(val);
      } else {
        clean[key] = val;
      }
    }
  }
  return clean;
}

export function sanitizeFileForFirestore(file: Partial<SopFile>): SopFile {
  return {
    id: String(file.id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
    sopId: String(file.sopId || 'disposal'),
    sopTitle: String(file.sopTitle || 'Standard Operating Procedure'),
    fileName: String(file.fileName || 'Document'),
    fileSize: String(file.fileSize || 'Unknown'),
    fileType: String(file.fileType || 'application/octet-stream'),
    fileData: String(file.fileData || ''),
    isDriveLink: Boolean(file.isDriveLink),
    driveUrl: String(file.driveUrl || ''),
    uploadedBy: String(file.uploadedBy || 'admin@dswd.gov.ph'),
    uploadedAt: String(file.uploadedAt || new Date().toLocaleDateString('en-US')),
    description: String(file.description || ''),
    downloadCount: typeof file.downloadCount === 'number' ? file.downloadCount : 0,
  };
}

export function sanitizeUserForFirestore(user: Partial<AppUser>): AppUser {
  const email = (user.email || '').trim().toLowerCase();
  const isAdmin = email === 'admin@dswd.gov.ph';
  const rawStatus = user.status;
  const validStatus: UserStatus =
    rawStatus === 'pending' || rawStatus === 'suspended' || rawStatus === 'disapproved'
      ? rawStatus
      : 'active';

  return {
    id: user.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    email: email || 'user@dswd.gov.ph',
    name: user.name || 'User',
    password: user.password || (isAdmin ? 'admin123' : 'user123'),
    role: isAdmin ? 'admin' : (user.role === 'admin' ? 'admin' : 'user'),
    status: isAdmin ? 'active' : validStatus,
    createdAt: user.createdAt || new Date().toISOString(),
    department: user.department || '',
    requestedRole: user.requestedRole || (user.role === 'admin' ? 'admin' : 'user'),
    approvedAt: user.approvedAt || undefined,
    approvedBy: user.approvedBy || undefined,
  };
}

// Helper to get local cache
export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (raw) {
      const parsed: AppUser[] = JSON.parse(raw);
      return parsed.map((u) => sanitizeUserForFirestore(u));
    }
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_USERS.map((u) => sanitizeUserForFirestore(u));
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    const safeguarded = users.map((u) => sanitizeUserForFirestore(u));
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(safeguarded));
  } catch (e) {
    console.error(e);
  }
}

export function getCurrentUser(): AppUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeUserForFirestore(parsed);
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export function setCurrentUser(user: AppUser | null): void {
  try {
    if (user) {
      const normalized = sanitizeUserForFirestore(user);
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(normalized));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (e) {
    console.error(e);
  }
}

export function getStoredSopFiles(): SopFile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILES);
    if (raw) {
      const parsed: SopFile[] = JSON.parse(raw);
      // Ensure administrative issuances files are removed per user request
      const filtered = parsed.filter(
        (f) => f.sopId !== 'issuance-2025' && f.sopId !== 'issuance-2026'
      );
      const sanitized = filtered.map((f) => sanitizeFileForFirestore(f));
      let updated = [...sanitized];
      if (!updated.some((f) => f.sopId === 'resource-rds')) {
        const rdsInitial = INITIAL_SOP_FILES.filter((f) => f.sopId === 'resource-rds').map(sanitizeFileForFirestore);
        updated = [...updated, ...rdsInitial];
      }
      return updated;
    }
  } catch (e) {
    console.error(e);
  }
  return INITIAL_SOP_FILES.map((f) => sanitizeFileForFirestore(f));
}

export function saveStoredSopFiles(files: SopFile[]): void {
  try {
    // Filter out any administrative issuances to ensure they remain empty
    const sanitized = files
      .filter((f) => f.sopId !== 'issuance-2025' && f.sopId !== 'issuance-2026')
      .map((f) => sanitizeFileForFirestore(f));
    localStorage.setItem(STORAGE_KEY_FILES, JSON.stringify(sanitized));
  } catch (e) {
    console.error(e);
  }
}

// ==========================================
// REAL-TIME CLOUD FIRESTORE SYNCHRONIZATION
// ==========================================

/**
 * Subscribes to real-time updates for Users collection across all tabs,
 * devices, and incognito sessions via Firebase Firestore onSnapshot.
 */
export function subscribeToUsers(callback: (users: AppUser[]) => void): () => void {
  // Emit initial local cache immediately
  callback(getStoredUsers());

  let initialized = false;

  const unsubscribe = onSnapshot(
    collection(db, 'users'),
    async (snapshot) => {
      if (snapshot.empty && !initialized) {
        initialized = true;
        // Cloud is empty: Seed default users to Firestore
        try {
          for (const u of DEFAULT_USERS) {
            const clean = sanitizeUserForFirestore(u);
            await setDoc(doc(db, 'users', clean.id), cleanFirestorePayload(clean));
          }
        } catch (e) {
          console.warn('Seeding users to Firestore failed:', e);
        }
        callback(DEFAULT_USERS.map((u) => sanitizeUserForFirestore(u)));
      } else {
        initialized = true;
        const list: AppUser[] = [];
        snapshot.forEach((d) => {
          list.push(sanitizeUserForFirestore(d.data() as Partial<AppUser>));
        });

        // Ensure admin@dswd.gov.ph is always present and has role admin
        if (!list.some((u) => u.email.toLowerCase() === 'admin@dswd.gov.ph')) {
          const defaultAdmin = sanitizeUserForFirestore(DEFAULT_USERS[0]);
          list.unshift(defaultAdmin);
          setDoc(doc(db, 'users', defaultAdmin.id), cleanFirestorePayload(defaultAdmin)).catch(() => {});
        }

        saveStoredUsers(list);
        callback(list);

        // If the active user's role changed in cloud, sync session
        const currentActive = getCurrentUser();
        if (currentActive) {
          const fresh = list.find((u) => u.id === currentActive.id);
          if (fresh && fresh.role !== currentActive.role) {
            setCurrentUser(fresh);
          }
        }
      }
    },
    (error) => {
      console.warn('Firestore users subscription notice:', error);
      callback(getStoredUsers());
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates for SOP & Template files across all tabs,
 * devices, and incognito sessions via Firebase Firestore onSnapshot.
 */
export function subscribeToSopFiles(callback: (files: SopFile[]) => void): () => void {
  // Emit initial local cache immediately
  callback(getStoredSopFiles());

  let initialized = false;

  const unsubscribe = onSnapshot(
    collection(db, 'sopFiles'),
    async (snapshot) => {
      if (snapshot.empty && !initialized) {
        initialized = true;
        // Cloud is empty: Seed initial files to Firestore
        try {
          for (const f of INITIAL_SOP_FILES) {
            const clean = sanitizeFileForFirestore(f);
            await setDoc(doc(db, 'sopFiles', clean.id), cleanFirestorePayload(clean));
          }
        } catch (e) {
          console.warn('Seeding sopFiles to Firestore failed:', e);
        }
        callback(INITIAL_SOP_FILES.map((f) => sanitizeFileForFirestore(f)));
      } else {
        initialized = true;
        const list: SopFile[] = [];
        snapshot.forEach((d) => {
          const item = sanitizeFileForFirestore(d.data() as Partial<SopFile>);
          // Clean out any previously uploaded or seeded issuance documents from Firestore
          if (item.sopId === 'issuance-2025' || item.sopId === 'issuance-2026') {
            deleteDoc(doc(db, 'sopFiles', d.id)).catch(() => {});
          } else {
            list.push(item);
          }
        });

        // Ensure RDS resource files exist in Firestore
        if (!list.some((f) => f.sopId === 'resource-rds')) {
          const rdsInitial = INITIAL_SOP_FILES.filter((f) => f.sopId === 'resource-rds');
          for (const rf of rdsInitial) {
            const clean = sanitizeFileForFirestore(rf);
            list.push(clean);
            setDoc(doc(db, 'sopFiles', clean.id), cleanFirestorePayload(clean)).catch(() => {});
          }
        }

        saveStoredSopFiles(list);
        callback(list);
      }
    },
    (error) => {
      console.warn('Firestore sopFiles subscription notice:', error);
      callback(getStoredSopFiles());
    }
  );

  return unsubscribe;
}

// ==========================================
// CLOUD MUTATION ACTIONS WITH INSTANT CLOUD SYNC
// ==========================================

export async function createUser(data: Omit<AppUser, 'id' | 'createdAt'>): Promise<AppUser> {
  const newUser = sanitizeUserForFirestore({
    ...data,
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
  });

  // Immediate local update
  const current = getStoredUsers();
  saveStoredUsers([...current.filter((u) => u.id !== newUser.id), newUser]);

  // Cloud Firestore persistence
  try {
    const payload = cleanFirestorePayload(newUser);
    await setDoc(doc(db, 'users', newUser.id), payload);
  } catch (e) {
    console.error('Firestore createUser failed:', e);
  }

  return newUser;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  department?: string;
  requestedRole?: UserRole;
}): Promise<AppUser> {
  const newUser = sanitizeUserForFirestore({
    id: `user-reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password.trim(),
    department: (data.department || '').trim(),
    requestedRole: data.requestedRole || 'user',
    role: data.requestedRole || 'user',
    status: 'pending', // Starts in pending verification
    createdAt: new Date().toISOString(),
  });

  // Immediate local update
  const current = getStoredUsers();
  saveStoredUsers([...current.filter((u) => u.id !== newUser.id), newUser]);

  // Cloud Firestore persistence
  try {
    const payload = cleanFirestorePayload(newUser);
    await setDoc(doc(db, 'users', newUser.id), payload);
  } catch (e) {
    console.error('Firestore registerUser failed:', e);
  }

  return newUser;
}

export async function approveUser(
  userId: string,
  assignedRole: UserRole,
  adminEmail: string = 'admin@dswd.gov.ph'
): Promise<void> {
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);
  if (!target) return;

  const now = new Date().toISOString();
  const targetRole = target.email.toLowerCase() === 'admin@dswd.gov.ph' ? 'admin' : assignedRole;
  const updatedUser: AppUser = {
    ...target,
    status: 'active',
    role: targetRole,
    approvedAt: now,
    approvedBy: adminEmail,
  };

  const updated = current.map((u) => (u.id === userId ? updatedUser : u));
  saveStoredUsers(updated);

  const active = getCurrentUser();
  if (active && active.id === userId) {
    setCurrentUser(updatedUser);
  }

  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'active',
      role: targetRole,
      approvedAt: now,
      approvedBy: adminEmail,
    });
  } catch (e) {
    console.error('Firestore approveUser failed:', e);
  }
}

export async function disapproveUser(
  userId: string,
  adminEmail: string = 'admin@dswd.gov.ph'
): Promise<void> {
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);
  if (!target || target.email.toLowerCase() === 'admin@dswd.gov.ph') return;

  const updatedUser: AppUser = {
    ...target,
    status: 'disapproved',
    approvedBy: adminEmail,
  };

  const updated = current.map((u) => (u.id === userId ? updatedUser : u));
  saveStoredUsers(updated);

  try {
    await updateDoc(doc(db, 'users', userId), {
      status: 'disapproved',
      approvedBy: adminEmail,
    });
  } catch (e) {
    console.error('Firestore disapproveUser failed:', e);
  }
}

export async function updateUserStatus(userId: string, newStatus: UserStatus): Promise<void> {
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);
  if (!target || target.email.toLowerCase() === 'admin@dswd.gov.ph') return;

  const updatedUser: AppUser = {
    ...target,
    status: newStatus,
  };

  const updated = current.map((u) => (u.id === userId ? updatedUser : u));
  saveStoredUsers(updated);

  const active = getCurrentUser();
  if (active && active.id === userId) {
    setCurrentUser(updatedUser);
  }

  try {
    await updateDoc(doc(db, 'users', userId), { status: newStatus });
  } catch (e) {
    console.error('Firestore updateUserStatus failed:', e);
  }
}

export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  // Immediate local update
  const current = getStoredUsers();
  const updated = current.map((u) => {
    if (u.id === userId) {
      if (u.email.toLowerCase() === 'admin@dswd.gov.ph') {
        return { ...u, role: 'admin' as UserRole };
      }
      return { ...u, role: newRole };
    }
    return u;
  });
  saveStoredUsers(updated);

  const active = getCurrentUser();
  if (active && active.id === userId) {
    setCurrentUser(active.email.toLowerCase() === 'admin@dswd.gov.ph' ? { ...active, role: 'admin' } : { ...active, role: newRole });
  }

  // Cloud Firestore persistence
  try {
    const target = updated.find((u) => u.id === userId);
    const assignedRole = target && target.email.toLowerCase() === 'admin@dswd.gov.ph' ? 'admin' : newRole;
    await updateDoc(doc(db, 'users', userId), { role: assignedRole });
  } catch (e) {
    console.error('Firestore updateUserRole failed:', e);
  }
}

export async function deleteUser(userId: string): Promise<void> {
  // Protect default admin from deletion
  const current = getStoredUsers();
  const target = current.find((u) => u.id === userId);
  if (target && target.email.toLowerCase() === 'admin@dswd.gov.ph') {
    console.warn('Super admin account cannot be deleted');
    return;
  }

  // Immediate local update
  saveStoredUsers(current.filter((u) => u.id !== userId));

  // Cloud Firestore persistence
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (e) {
    console.error('Firestore deleteUser failed:', e);
  }
}

export async function uploadSopFile(file: SopFile): Promise<void> {
  const clean = sanitizeFileForFirestore(file);
  const payload = cleanFirestorePayload(clean);

  // Immediate local update
  const current = getStoredSopFiles();
  saveStoredSopFiles([clean, ...current.filter((f) => f.id !== clean.id)]);

  // Cloud Firestore persistence
  try {
    await setDoc(doc(db, 'sopFiles', clean.id), payload);
  } catch (e: unknown) {
    console.error('Firestore uploadSopFile error:', e);
  }
}

export async function deleteSopFile(fileId: string): Promise<void> {
  // Immediate local update
  const current = getStoredSopFiles();
  saveStoredSopFiles(current.filter((f) => f.id !== fileId));

  // Cloud Firestore persistence
  try {
    await deleteDoc(doc(db, 'sopFiles', fileId));
  } catch (e) {
    console.error('Firestore deleteSopFile error:', e);
  }
}

// Convert Google Drive link to preview embed URL
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;

  // File link: /file/d/{ID}/...
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }

  // Google Docs: /document/d/{ID}/...
  const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
  }

  // Google Sheets: /spreadsheets/d/{ID}/...
  const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`;
  }

  // Google Presentation: /presentation/d/{ID}/...
  const presMatch = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]+)/);
  if (presMatch && presMatch[1]) {
    return `https://docs.google.com/presentation/d/${presMatch[1]}/preview`;
  }

  // Google Drive folder: /folders/{ID}
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
  }

  // Open with id param: ?id={ID}
  const idParamMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
  }

  return null;
}
