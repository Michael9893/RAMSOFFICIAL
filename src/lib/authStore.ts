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

export type MessengerialCategory = 'CO.PSP' | 'PSP' | 'POSTAL';
export type MessengerialStatus =
  | 'Dispatched'
  | 'In Transit'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Pending Carrier Pickup';

export interface MessengerialRecord {
  id: string;
  category: MessengerialCategory; // CO.PSP, PSP, or POSTAL
  trackingNumber: string;
  courier: string; // e.g. JRS Express, PhilPost, LBC Express, 2GO
  recipient: string; // Addressee / Recipient office or person
  recipientOffice?: string;
  sender: string; // Originating office / section
  subject: string; // Document / package description
  dispatchDate: string; // YYYY-MM-DD
  status: MessengerialStatus;
  trackingUrl?: string; // Direct carrier tracking URL
  attachmentName?: string;
  attachmentData?: string; // Base64 or download URL
  driveUrl?: string;
  isDriveLink?: boolean;
  remarks?: string;
  postedBy: string;
  postedAt: string;
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

export const SYSTEM_CATEGORIES = [
  { id: 'client-satisfaction', title: 'Client Satisfaction Measurement (CSM/CSF) Form', type: 'system' as const },
  { id: 'ticketing-support', title: 'Ticketing Support System Service Form', type: 'system' as const },
];

export const ALL_UPLOADABLE_SECTIONS = [
  ...RESOURCE_CATEGORIES,
  ...ISSUANCE_CATEGORIES,
  ...SOP_CATEGORIES,
  ...TEMPLATE_CATEGORIES,
  ...SYSTEM_CATEGORIES,
];

export interface DswdOdsuCategory {
  division: string;
  units: string[];
}

export const DSWD_FO1_ODSUS: DswdOdsuCategory[] = [
  {
    division: 'Office of the Regional Director (ORD)',
    units: [
      'ORD - Office of the Regional Director',
      'ORD - Office of the Assistant Regional Director for Administration (ARDA)',
      'ORD - Office of the Assistant Regional Director for Operations (ARDO)',
      'ORD - Regional Information and Communications Technology Management Section (RICTMS)',
      'ORD - Legal Unit',
      'ORD - Social Marketing Unit (SMU)',
      'ORD - Regional Planning Unit / Policy Planning (RPU)',
      'ORD - Regional Internal Audit Unit (RIAU)',
    ],
  },
  {
    division: 'Administrative Division (AD)',
    units: [
      'AD - Records and Archives Management Section (RAMS)',
      'AD - General Services Section (GSS)',
      'AD - Procurement Section (PS)',
      'AD - Property and Asset Management Section (PAMS)',
      'AD - Building and Grounds Maintenance Unit',
      'AD - Transport & Motorpool Unit',
    ],
  },
  {
    division: 'Financial Management Division (FMD)',
    units: [
      'FMD - Accounting Section',
      'FMD - Budget Section',
      'FMD - Cash Section',
    ],
  },
  {
    division: 'Human Resource Management and Development Division (HRMDD)',
    units: [
      'HRMDD - Human Resource Planning and Performance Management Section (HRPPMS)',
      'HRMDD - Personnel Administration Section (PAS)',
      'HRMDD - Capacity Building Section (CBS)',
      'HRMDD - Employee Welfare Section (EWS)',
    ],
  },
  {
    division: 'Promotive Services Division (PSD)',
    units: [
      'PSD - Pantawid Pamilyang Pilipino Program (4Ps RPMO)',
      'PSD - Sustainable Livelihood Program (SLP RPMO)',
      'PSD - KALAHI-CIDSS Comprehensive and Integrated Delivery of Social Services (KC RPMO)',
      'PSD - Enhanced Partnership Against Hunger and Poverty (EPAHP)',
    ],
  },
  {
    division: 'Protective Services Division (PPSD)',
    units: [
      'PPSD - Crisis Intervention Section (CIS / AICS) - San Fernando, La Union',
      'PPSD - Community-Based Services Section (CBSS)',
      'PPSD - Supplementary Feeding Program (SFP)',
      'PPSD - Social Pension for Indigent Senior Citizens Unit (SocPen)',
      'PPSD - Centenarian Program Unit',
      'PPSD - Recovery and Reintegration Program for Trafficked Persons (RRPTP)',
      'PPSD - Regional Alternative Child Care Office (RACCO Ilocos)',
      'PPSD - Minors Travelling Abroad (MTA Unit)',
    ],
  },
  {
    division: 'Centers and Residential Care Facilities (CRCF - FO1 La Union & Region 1)',
    units: [
      'CRCF - Regional Rehabilitation Center for Youth (RRCY) - Bauang, La Union',
      'CRCF - Home for Girls (HFG) - Agoo, La Union',
      'CRCF - Haven for Children (HFC) - Dagupan City',
      'CRCF - Area Vocational Rehabilitation Center I (AVRC I) - Bonuan, Dagupan City',
      'CRCF - Reception and Study Center for Children (RSCC)',
    ],
  },
  {
    division: 'Disaster Response Management Division (DRMD)',
    units: [
      'DRMD - Disaster Response and Rehabilitation Section (DRRS)',
      'DRMD - Disaster Response Information and Management Section (DRIMS)',
      'DRMD - Regional Resource Operations Section (RROS / Regional Warehouse - San Fernando / Biga, La Union)',
      'DRMD - Quick Response Team (QRT - FO1)',
    ],
  },
  {
    division: 'Policy and Plans Division (PPD)',
    units: [
      'PPD - Policy Development and Planning Section (PDPS)',
      'PPD - Standards Section (SS)',
      'PPD - National Household Targeting Section (NHTS-PR / Listahanan)',
      'PPD - Information and Statistics Unit (ISU)',
    ],
  },
  {
    division: 'Provincial Operations Offices (POO) & SWAD Offices',
    units: [
      'POO - La Union Provincial Operations Office (San Fernando City, La Union)',
      'SWAD Team - La Union (Social Welfare and Development Office - San Fernando City)',
      'POO - Ilocos Norte Provincial Operations Office (Laoag City)',
      'SWAD Team - Ilocos Norte (Laoag City)',
      'POO - Ilocos Sur Provincial Operations Office (Vigan City)',
      'SWAD Team - Ilocos Sur (Vigan City)',
      'POO - Western Pangasinan Provincial Operations Office (Dagupan City)',
      'POO - Eastern Pangasinan Satellite Office (Rosales / Urdaneta)',
      'SWAD Team - Pangasinan (Dagupan / Rosales)',
    ],
  },
  {
    division: 'Special Committees & Focal Desks (FO1 La Union)',
    units: [
      'FO1 - Bids and Awards Committee Secretariat (BAC)',
      'FO1 - Gender and Development (GAD) Focal Unit',
      'FO1 - Regional Disaster Operations Center (DOC)',
      'FO1 - Integrity Management Committee (IMC)',
    ],
  },
];

export interface ClientSatisfactionFeedback {
  id: string;
  clientName?: string;
  clientEmail?: string;
  clientOffice?: string;
  clientType?: 'Citizen' | 'Government Employee' | 'Business / Organization' | 'Other';
  serviceAvailed: string;
  dateAvailed: string;
  ratings: {
    responsiveness: number;
    reliability: number;
    integrity: number;
    facilities: number;
    overall: number;
  };
  comments?: string;
  submittedAt: string;
}

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  title: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  requesterName: string;
  requesterEmail: string;
  requesterOffice: string;
  description: string;
  attachedFormUrl?: string;
  attachedFormName?: string;
  isDriveLink?: boolean;
  resolutionNotes?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user-admin-1',
    email: 'admin@dswd.gov.ph',
    name: 'Administrator',
    password: 'admin123',
    role: 'admin',
    status: 'active',
    department: 'AD-RAMS Records Section',
    createdAt: '2025-01-15T08:00:00Z',
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
    id: 'sop-drive-messengerial',
    sopId: 'messengerial',
    sopTitle: 'Request for Messengerial Services',
    fileName: 'SOP on Messengerial Services & Mail Routing (Google Docs)',
    fileSize: 'Google Docs',
    fileType: 'google-drive',
    fileData: 'https://docs.google.com/document/d/1XyZ_Messengerial_Services_SOP_Guidelines/preview',
    isDriveLink: true,
    driveUrl: 'https://docs.google.com/document/d/1XyZ_Messengerial_Services_SOP_Guidelines/preview',
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-12 11:15 AM',
    description: 'Official Standard Operating Procedure on Courier & Postal Messengerial Dispatches (CO.PSP, PSP, POSTAL).',
    downloadCount: 46,
  },
  {
    id: 'csf-drive-form',
    sopId: 'client-satisfaction',
    sopTitle: 'Client Satisfaction Measurement (CSM/CSF) Form',
    fileName: 'DSWD Citizen/Client Satisfaction Measurement (CSM) Official Survey Form (Google Docs)',
    fileSize: 'Google Docs',
    fileType: 'google-drive',
    fileData: 'https://docs.google.com/document/d/1_DSWD_CSM_Client_Satisfaction_Form/preview',
    isDriveLink: true,
    driveUrl: 'https://docs.google.com/document/d/1_DSWD_CSM_Client_Satisfaction_Form/preview',
    uploadedBy: 'admin@dswd.gov.ph',
    uploadedAt: '2025-02-14 08:30 AM',
    description: 'Official DSWD ARTA-compliant Client Satisfaction Measurement (CSM) survey form for AD-RAMS frontline and internal services.',
    downloadCount: 88,
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
      // Filter out any mock dummy users like maria.santos or old demo user
      const filtered = parsed.filter(
        (u) =>
          u.email.toLowerCase() !== 'maria.santos@dswd.gov.ph' &&
          u.email.toLowerCase() !== 'user@dswd.gov.ph'
      );
      return filtered.map((u) => sanitizeUserForFirestore(u));
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
      // Ensure administrative issuances files and mock ticketing forms are removed per user request
      const filtered = parsed.filter(
        (f) =>
          f.sopId !== 'issuance-2025' &&
          f.sopId !== 'issuance-2026' &&
          f.id !== 'tkt-drive-form'
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
          const data = d.data() as Partial<AppUser>;
          if (
            data.email?.toLowerCase() === 'maria.santos@dswd.gov.ph' ||
            data.email?.toLowerCase() === 'user@dswd.gov.ph'
          ) {
            deleteDoc(doc(db, 'users', d.id)).catch(() => {});
            return;
          }
          list.push(sanitizeUserForFirestore(data));
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
          list.push(item);
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

  // Immediate local update
  const current = getStoredSopFiles();
  saveStoredSopFiles([clean, ...current.filter((f) => f.id !== clean.id)]);

  // Firestore has a strict 1MB document limit.
  // If fileData is a large base64 (> 750KB), keep full base64 in local storage and store payload safely.
  const payload = cleanFirestorePayload(clean);
  if (payload.fileData && typeof payload.fileData === 'string' && payload.fileData.length > 750000) {
    payload.fileData = 'local_storage_cached';
  }

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

// Convert Google Drive or Google Docs link to preview embed URL
export function getGoogleDriveEmbedUrl(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();

  // Already a preview link
  if (cleanUrl.includes('/preview')) {
    return cleanUrl;
  }

  // Google Docs: /document/d/{ID}
  const docMatch = cleanUrl.match(/docs\.google\.com\/document\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (docMatch && docMatch[1]) {
    return `https://docs.google.com/document/d/${docMatch[1]}/preview`;
  }

  // Google Spreadsheets: /spreadsheets/d/{ID}
  const sheetMatch = cleanUrl.match(/docs\.google\.com\/spreadsheets\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (sheetMatch && sheetMatch[1]) {
    return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/preview`;
  }

  // Google Presentation: /presentation/d/{ID}
  const presMatch = cleanUrl.match(/docs\.google\.com\/presentation\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (presMatch && presMatch[1]) {
    return `https://docs.google.com/presentation/d/${presMatch[1]}/preview`;
  }

  // Google Drive File: /file/d/{ID}
  const fileMatch = cleanUrl.match(/drive\.google\.com\/file\/(?:u\/\d+\/)?d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  }

  // Google Drive folder: /folders/{ID}
  const folderMatch = cleanUrl.match(/drive\.google\.com\/(?:drive\/)?folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
  }

  // Google Forms: /forms/d/e/{ID}/viewform
  const formMatch = cleanUrl.match(/docs\.google\.com\/forms\/(?:u\/\d+\/)?d\/(?:e\/)?([a-zA-Z0-9_-]+)/);
  if (formMatch && formMatch[1]) {
    return `https://docs.google.com/forms/d/e/${formMatch[1]}/viewform?embedded=true`;
  }

  // Open with id param: ?id={ID}
  const idParamMatch = cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://drive.google.com/file/d/${idParamMatch[1]}/preview`;
  }

  return null;
}

// ==========================================
// MESSENGERIAL SERVICES (CO.PSP, PSP, POSTAL)
// ==========================================

const STORAGE_KEY_MESSENGERIAL = 'rams_messengerial_records_v1';

export function sanitizeMessengerialRecord(
  rec: Partial<MessengerialRecord>
): MessengerialRecord {
  const category: MessengerialCategory =
    rec.category === 'CO.PSP' || rec.category === 'PSP' || rec.category === 'POSTAL'
      ? rec.category
      : 'CO.PSP';

  const status: MessengerialStatus =
    rec.status === 'Dispatched' ||
    rec.status === 'In Transit' ||
    rec.status === 'Out for Delivery' ||
    rec.status === 'Delivered' ||
    rec.status === 'Pending Carrier Pickup'
      ? rec.status
      : 'Dispatched';

  return {
    id: String(rec.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`),
    category,
    trackingNumber: String(rec.trackingNumber || '').trim(),
    courier: (() => {
      const c = String(rec.courier || 'JRS Express').trim();
      if (c.toLowerCase().includes('j&t') || c.toLowerCase().includes('jt express')) {
        return 'JRS Express';
      }
      return c;
    })(),
    recipient: String(rec.recipient || '').trim(),
    recipientOffice: String(rec.recipientOffice || '').trim(),
    sender: String(rec.sender || 'AD-RAMS Records Section FO 1').trim(),
    subject: String(rec.subject || '').trim(),
    dispatchDate: String(rec.dispatchDate || new Date().toISOString().split('T')[0]),
    status,
    trackingUrl: String(rec.trackingUrl || '').trim(),
    attachmentName: String(rec.attachmentName || ''),
    attachmentData: String(rec.attachmentData || ''),
    driveUrl: String(rec.driveUrl || ''),
    isDriveLink: Boolean(rec.isDriveLink),
    remarks: String(rec.remarks || ''),
    postedBy: String(rec.postedBy || 'admin@dswd.gov.ph'),
    postedAt: String(rec.postedAt || new Date().toISOString()),
  };
}

export function getStoredMessengerialRecords(): MessengerialRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSENGERIAL);
    if (raw) {
      const parsed: MessengerialRecord[] = JSON.parse(raw);
      return parsed.map(sanitizeMessengerialRecord);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveStoredMessengerialRecords(records: MessengerialRecord[]): void {
  try {
    const sanitized = records.map(sanitizeMessengerialRecord);
    localStorage.setItem(STORAGE_KEY_MESSENGERIAL, JSON.stringify(sanitized));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Subscribes to real-time updates for Messengerial Records across all tabs
 * and devices via Firebase Firestore.
 */
export function subscribeToMessengerialRecords(
  callback: (records: MessengerialRecord[]) => void
): () => void {
  // Emit initial local cache immediately
  callback(getStoredMessengerialRecords());

  const unsubscribe = onSnapshot(
    collection(db, 'messengerialRecords'),
    (snapshot) => {
      const list: MessengerialRecord[] = [];
      snapshot.forEach((d) => {
        list.push(sanitizeMessengerialRecord(d.data() as Partial<MessengerialRecord>));
      });
      // Sort newest dispatch date or postedAt first
      list.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      saveStoredMessengerialRecords(list);
      callback(list);
    },
    (error) => {
      console.warn('Firestore messengerialRecords subscription notice:', error);
      callback(getStoredMessengerialRecords());
    }
  );

  return unsubscribe;
}

export async function createMessengerialRecord(
  data: Omit<MessengerialRecord, 'id' | 'postedAt'>
): Promise<MessengerialRecord> {
  const newRecord = sanitizeMessengerialRecord({
    ...data,
    id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    postedAt: new Date().toISOString(),
  });

  // Immediate local update
  const current = getStoredMessengerialRecords();
  saveStoredMessengerialRecords([newRecord, ...current.filter((r) => r.id !== newRecord.id)]);

  // Cloud Firestore persistence
  try {
    const payload = cleanFirestorePayload(newRecord);
    await setDoc(doc(db, 'messengerialRecords', newRecord.id), payload);
  } catch (e) {
    console.error('Firestore createMessengerialRecord error:', e);
  }

  return newRecord;
}

export async function updateMessengerialRecord(
  id: string,
  updates: Partial<MessengerialRecord>
): Promise<void> {
  const current = getStoredMessengerialRecords();
  const updated = current.map((r) => (r.id === id ? sanitizeMessengerialRecord({ ...r, ...updates }) : r));
  saveStoredMessengerialRecords(updated);

  // Cloud Firestore persistence
  try {
    const payload = cleanFirestorePayload(updates);
    await updateDoc(doc(db, 'messengerialRecords', id), payload);
  } catch (e) {
    console.error('Firestore updateMessengerialRecord error:', e);
  }
}

export async function deleteMessengerialRecord(id: string): Promise<void> {
  const current = getStoredMessengerialRecords();
  saveStoredMessengerialRecords(current.filter((r) => r.id !== id));

  // Cloud Firestore persistence
  try {
    await deleteDoc(doc(db, 'messengerialRecords', id));
  } catch (e) {
    console.error('Firestore deleteMessengerialRecord error:', e);
  }
}

/**
 * Helper to generate official carrier tracking lookup URLs.
 */
export function getCarrierTrackingUrl(courier: string, trackingNumber: string): string {
  const cleanNum = trackingNumber.trim().replace(/\s+/g, '');
  const lower = courier.toLowerCase();
  if (lower.includes('jrs')) {
    return `https://www.jrs-express.com/track/?tracking_no=${encodeURIComponent(cleanNum)}`;
  }
  if (lower.includes('lbcexpress') || lower.includes('lbc')) {
    return `https://www.lbcexpress.com/track/?tracking_no=${encodeURIComponent(cleanNum)}`;
  }
  if (lower.includes('postal') || lower.includes('philpost') || lower.includes('phlpost')) {
    return `https://tracking.phlpost.gov.ph/`;
  }
  if (lower.includes('2go')) {
    return `https://supplychain.2go.com.ph/tracking/index.asp`;
  }
  return `https://www.jrs-express.com/track/?tracking_no=${encodeURIComponent(cleanNum)}`;
}

// ==========================================
// CLIENT SATISFACTION (CSM / CSF) STORE
// ==========================================

const STORAGE_KEY_FEEDBACKS = 'rams_client_feedbacks_v1';

const INITIAL_FEEDBACKS: ClientSatisfactionFeedback[] = [
  {
    id: 'csf-init-1',
    clientName: 'Juan Dela Cruz',
    clientEmail: 'jdelacruz@dswd.gov.ph',
    clientOffice: 'Promotive Services Division',
    clientType: 'Government Employee',
    serviceAvailed: 'Request for Messengerial Services',
    dateAvailed: '2025-02-12',
    ratings: {
      responsiveness: 5,
      reliability: 5,
      integrity: 5,
      facilities: 4,
      overall: 5,
    },
    comments: 'Very prompt courier dispatch and helpful staff in tracking the parcels to our field units.',
    submittedAt: '2025-02-12T14:30:00Z',
  },
  {
    id: 'csf-init-2',
    clientName: 'Elena Ramos',
    clientEmail: 'eramos@dswd.gov.ph',
    clientOffice: 'Disaster Response Management Division',
    clientType: 'Government Employee',
    serviceAvailed: 'Request for Copies and Certification of Documents',
    dateAvailed: '2025-02-10',
    ratings: {
      responsiveness: 5,
      reliability: 4,
      integrity: 5,
      facilities: 5,
      overall: 5,
    },
    comments: 'Certification of Special Orders was processed within the day. Great job AD-RAMS!',
    submittedAt: '2025-02-10T16:15:00Z',
  },
];

export function getStoredFeedbacks(): ClientSatisfactionFeedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FEEDBACKS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_FEEDBACKS;
}

export function saveStoredFeedbacks(feedbacks: ClientSatisfactionFeedback[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FEEDBACKS, JSON.stringify(feedbacks));
  } catch (e) {
    console.error(e);
  }
}

export function subscribeToSatisfactionFeedbacks(
  callback: (feedbacks: ClientSatisfactionFeedback[]) => void
): () => void {
  callback(getStoredFeedbacks());

  try {
    const colRef = collection(db, 'satisfactionFeedbacks');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fresh: ClientSatisfactionFeedback[] = [];
          snapshot.forEach((docSnap) => {
            fresh.push(docSnap.data() as ClientSatisfactionFeedback);
          });
          fresh.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
          saveStoredFeedbacks(fresh);
          callback(fresh);
        } else {
          callback(getStoredFeedbacks());
        }
      },
      (error) => {
        console.warn('Firestore satisfactionFeedbacks subscription error:', error);
        callback(getStoredFeedbacks());
      }
    );
    return unsubscribe;
  } catch (e) {
    console.error('subscribeToSatisfactionFeedbacks error:', e);
    return () => {};
  }
}

export async function createSatisfactionFeedback(
  data: Omit<ClientSatisfactionFeedback, 'id' | 'submittedAt'>
): Promise<ClientSatisfactionFeedback> {
  const newFeedback: ClientSatisfactionFeedback = {
    ...data,
    id: `csf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    submittedAt: new Date().toISOString(),
  };

  const current = getStoredFeedbacks();
  saveStoredFeedbacks([newFeedback, ...current]);

  try {
    const payload = cleanFirestorePayload(newFeedback);
    await setDoc(doc(db, 'satisfactionFeedbacks', newFeedback.id), payload);
  } catch (e) {
    console.error('Firestore createSatisfactionFeedback error:', e);
  }

  return newFeedback;
}

export async function deleteSatisfactionFeedback(id: string): Promise<void> {
  const current = getStoredFeedbacks();
  saveStoredFeedbacks(current.filter((f) => f.id !== id));

  try {
    await deleteDoc(doc(db, 'satisfactionFeedbacks', id));
  } catch (e) {
    console.error('Firestore deleteSatisfactionFeedback error:', e);
  }
}

// ==========================================
// TICKETING SUPPORT SYSTEM STORE
// ==========================================

const STORAGE_KEY_TICKETS = 'rams_tickets_v2';

const INITIAL_TICKETS: SupportTicket[] = [];

export function getStoredTickets(): SupportTicket[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TICKETS);
    if (raw) {
      const parsed: SupportTicket[] = JSON.parse(raw);
      // Remove any auto-filled mock tickets from previous sessions
      const clean = parsed.filter((t) => !t.id.startsWith('tkt-init-'));
      return clean;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function saveStoredTickets(tickets: SupportTicket[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
  } catch (e) {
    console.error(e);
  }
}

export function subscribeToTickets(callback: (tickets: SupportTicket[]) => void): () => void {
  callback(getStoredTickets());

  try {
    const colRef = collection(db, 'tickets');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const fresh: SupportTicket[] = [];
          snapshot.forEach((docSnap) => {
            fresh.push(docSnap.data() as SupportTicket);
          });
          fresh.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          saveStoredTickets(fresh);
          callback(fresh);
        } else {
          callback(getStoredTickets());
        }
      },
      (error) => {
        console.warn('Firestore tickets subscription error:', error);
        callback(getStoredTickets());
      }
    );
    return unsubscribe;
  } catch (e) {
    console.error('subscribeToTickets error:', e);
    return () => {};
  }
}

export async function createSupportTicket(
  data: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt'>
): Promise<SupportTicket> {
  const current = getStoredTickets();
  const sequence = String(current.length + 1).padStart(3, '0');
  const year = new Date().getFullYear();
  const ticketNumber = `RAMS-TKT-${year}-${sequence}`;

  const newTicket: SupportTicket = {
    ...data,
    id: `tkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    ticketNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveStoredTickets([newTicket, ...current]);

  try {
    const payload = cleanFirestorePayload(newTicket);
    await setDoc(doc(db, 'tickets', newTicket.id), payload);
  } catch (e) {
    console.error('Firestore createSupportTicket error:', e);
  }

  return newTicket;
}

export async function updateSupportTicket(
  id: string,
  updates: Partial<SupportTicket>
): Promise<void> {
  const current = getStoredTickets();
  const updated = current.map((t) =>
    t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
  );
  saveStoredTickets(updated);

  try {
    const payload = cleanFirestorePayload({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    await updateDoc(doc(db, 'tickets', id), payload);
  } catch (e) {
    console.error('Firestore updateSupportTicket error:', e);
  }
}

export async function deleteSupportTicket(id: string): Promise<void> {
  const current = getStoredTickets();
  saveStoredTickets(current.filter((t) => t.id !== id));

  try {
    await deleteDoc(doc(db, 'tickets', id));
  } catch (e) {
    console.error('Firestore deleteSupportTicket error:', e);
  }
}
