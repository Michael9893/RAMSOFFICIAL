import React from 'react';

// 1. Laptop with user profile and magnifying glass (Request for Disposal of Valueless Records)
export const SopDisposalIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Laptop base */}
    <rect x="18" y="58" width="64" height="6" rx="2" fill="#3b82f6" />
    <path d="M12 64H88C89.1 64 90 64.9 90 66V67H10V66C10 64.9 10.9 64 12 64Z" fill="#1e3a8a" />
    <rect x="44" y="64" width="12" height="2" rx="1" fill="#60a5fa" />
    {/* Laptop screen bezel */}
    <rect x="22" y="16" width="56" height="42" rx="4" fill="#0f172a" stroke="#3b82f6" strokeWidth="2.5" />
    {/* Screen glow & content */}
    <rect x="26" y="20" width="48" height="34" rx="2" fill="#1e1e38" />
    {/* User profile card on screen */}
    <rect x="30" y="24" width="22" height="26" rx="2" fill="#2d1b4e" stroke="#c084fc" strokeWidth="1" />
    <circle cx="41" cy="31" r="4" fill="#ec4899" />
    <path d="M34 44C34 40.5 37 38 41 38C45 38 48 40.5 48 44" fill="#ec4899" />
    {/* Data lines on screen */}
    <rect x="56" y="26" width="14" height="2" rx="1" fill="#60a5fa" />
    <rect x="56" y="31" width="11" height="2" rx="1" fill="#93c5fd" />
    <rect x="56" y="36" width="13" height="2" rx="1" fill="#60a5fa" />
    <rect x="56" y="41" width="8" height="2" rx="1" fill="#93c5fd" />
    {/* Magnifying glass */}
    <circle cx="64" cy="46" r="9" stroke="#38bdf8" strokeWidth="2.5" fill="#0284c7" fillOpacity="0.3" />
    <path d="M71 53L79 61" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
    <circle cx="61.5" cy="43.5" r="2.5" fill="#bae6fd" fillOpacity="0.8" />
  </svg>
);

// 2. Office workers archiving into cabinet (Request for Archival of Vital/Permanent Records)
export const SopArchivalIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Filing Cabinet */}
    <rect x="42" y="30" width="30" height="42" rx="3" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
    {/* Cabinet Drawer 1 */}
    <rect x="45" y="34" width="24" height="16" rx="2" fill="#334155" />
    <rect x="53" y="40" width="8" height="3" rx="1" fill="#94a3b8" />
    {/* Open Folder sticking out */}
    <path d="M47 30H67L64 22H50L47 30Z" fill="#eab308" />
    <path d="M51 22V19H59V22" fill="#ca8a04" />
    {/* Cabinet Drawer 2 */}
    <rect x="45" y="53" width="24" height="16" rx="2" fill="#334155" />
    <rect x="53" y="59" width="8" height="3" rx="1" fill="#94a3b8" />
    {/* Person 1 (left) */}
    <circle cx="34" cy="28" r="5" fill="#fbcfe8" />
    <path d="M30 33H38L41 52H28L30 33Z" fill="#f43f5e" />
    <path d="M38 36L46 30" stroke="#fbcfe8" strokeWidth="2.5" strokeLinecap="round" />
    {/* Person 1 legs */}
    <rect x="30" y="52" width="3" height="16" fill="#0284c7" />
    <rect x="35" y="52" width="3" height="16" fill="#0284c7" />
    {/* Person 2 (right behind) */}
    <circle cx="78" cy="27" r="4.5" fill="#fed7aa" />
    <path d="M74 32H82L83 50H74L74 32Z" fill="#10b981" />
    <path d="M74 36L68 31" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
    <rect x="75" y="50" width="3" height="17" fill="#334155" />
    <rect x="79" y="50" width="3" height="17" fill="#334155" />
  </svg>
);

// 3. Messenger and mail package (Request for Messengerial Services)
export const SopMessengerialIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Dispatch Table / Cart */}
    <rect x="40" y="44" width="28" height="26" rx="3" fill="#475569" />
    <circle cx="46" cy="72" r="3" fill="#94a3b8" />
    <circle cx="62" cy="72" r="3" fill="#94a3b8" />
    {/* Large Mail Parcel / Envelope */}
    <rect x="44" y="34" width="26" height="18" rx="2" fill="#ec4899" stroke="#db2777" strokeWidth="1" />
    <path d="M44 34L57 44L70 34" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Floating message badges */}
    <circle cx="48" cy="22" r="5" fill="#38bdf8" />
    <rect x="46" y="20" width="4" height="2" fill="#ffffff" />
    <circle cx="60" cy="18" r="4" fill="#a855f7" />
    {/* Left worker */}
    <circle cx="28" cy="30" r="4.5" fill="#fed7aa" />
    <path d="M24 35H32L34 52H23L24 35Z" fill="#3b82f6" />
    <rect x="25" y="52" width="3" height="18" fill="#1e293b" />
    <rect x="29" y="52" width="3" height="18" fill="#1e293b" />
    <path d="M32 38L42 42" stroke="#fed7aa" strokeWidth="2" strokeLinecap="round" />
    {/* Right worker */}
    <circle cx="78" cy="30" r="4.5" fill="#fbcfe8" />
    <path d="M74 35H82L80 52H73L74 35Z" fill="#14b8a6" />
    <rect x="74" y="52" width="3" height="18" fill="#1e293b" />
    <rect x="78" y="52" width="3" height="18" fill="#1e293b" />
    <path d="M74 40L68 42" stroke="#fbcfe8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 4. Team members with tech assist speech bubbles (Request for Technical Assistance on Records Management)
export const SopTechnicalAssistanceIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Speech / assistance badges above */}
    <circle cx="40" cy="20" r="4.5" fill="#06b6d4" />
    <text x="40" y="23" fontSize="6" fontWeight="bold" fill="#ffffff" textAnchor="middle">?</text>
    <circle cx="50" cy="18" r="4.5" fill="#f59e0b" />
    <text x="50" y="21" fontSize="5" fontWeight="bold" fill="#ffffff" textAnchor="middle">24</text>
    <circle cx="60" cy="20" r="4.5" fill="#ec4899" />
    <text x="60" y="23" fontSize="6" fontWeight="bold" fill="#ffffff" textAnchor="middle">!</text>
    {/* 4 Personnel in a row */}
    {/* Person 1 */}
    <circle cx="34" cy="34" r="4" fill="#67e8f9" />
    <path d="M30 40H38L39 58H29L30 40Z" fill="#0891b2" />
    <rect x="31" y="58" width="2.5" height="14" fill="#164e63" />
    <rect x="35" y="58" width="2.5" height="14" fill="#164e63" />
    {/* Person 2 */}
    <circle cx="45" cy="32" r="4" fill="#a7f3d0" />
    <path d="M41 38H49L50 58H40L41 38Z" fill="#059669" />
    <rect x="42" y="58" width="2.5" height="14" fill="#064e3b" />
    <rect x="46" y="58" width="2.5" height="14" fill="#064e3b" />
    {/* Person 3 */}
    <circle cx="56" cy="32" r="4" fill="#fbcfe8" />
    <path d="M52 38H60L61 58H51L52 38Z" fill="#db2777" />
    <rect x="53" y="58" width="2.5" height="14" fill="#831843" />
    <rect x="57" y="58" width="2.5" height="14" fill="#831843" />
    {/* Person 4 */}
    <circle cx="67" cy="34" r="4" fill="#fed7aa" />
    <path d="M63 40H71L72 58H62L63 40Z" fill="#ea580c" />
    <rect x="64" y="58" width="2.5" height="14" fill="#7c2d12" />
    <rect x="68" y="58" width="2.5" height="14" fill="#7c2d12" />
  </svg>
);

// 5. Document Folder with certification & exchange arrows (Request for Copies and Certification of Documents)
export const SopCopiesCertificationIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Folder Body */}
    <path d="M32 30H46L50 35H76C78.2 35 80 36.8 80 39V65C80 67.2 78.2 69 76 69H32C29.8 69 28 67.2 28 65V34C28 31.8 29.8 30 32 30Z" fill="#d97706" />
    {/* Documents inside */}
    <rect x="40" y="18" width="26" height="34" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" />
    <line x1="44" y1="24" x2="60" y2="24" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="44" y1="29" x2="58" y2="29" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="44" y1="34" x2="62" y2="34" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="44" y1="39" x2="54" y2="39" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    {/* ID Card / badge attached */}
    <rect x="34" y="44" width="24" height="18" rx="2" fill="#b45309" stroke="#fef3c7" strokeWidth="1" />
    <circle cx="40" cy="51" r="3" fill="#fcd34d" />
    <rect x="46" y="48" width="8" height="2" fill="#ffffff" />
    <rect x="46" y="52" width="6" height="2" fill="#ffffff" />
    {/* Green exchange circle badge */}
    <circle cx="68" cy="53" r="9" fill="#10b981" />
    <path d="M64 51L67 48M67 48L70 51M67 48V55" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M72 55L69 58M69 58L66 55M69 58V51" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 6. Rosette Scalloped Seal (Certification and Dissemination of Administrative Issuances)
export const SopAdministrativeIssuancesIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Rosette Scalloped Border in Soft Coral/Pink */}
    <g transform="translate(50, 42)">
      {/* 16 scalloped outer bumps */}
      <circle cx="0" cy="0" r="26" fill="#fed7aa" fillOpacity="0.1" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="0" cy="0" r="24" fill="#fff1f2" fillOpacity="0.15" stroke="#f87171" strokeWidth="2" />
      {/* Inner circular dashed track */}
      <circle cx="0" cy="0" r="19" stroke="#fb7185" strokeWidth="1" strokeDasharray="2 2" />
      {/* Circle of stars */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * 14;
        const y = Math.sin(rad) * 14;
        return (
          <circle key={i} cx={x} cy={y} r="1.2" fill="#f43f5e" />
        );
      })}
      {/* Central Star */}
      <polygon
        points="0,-8 2.4,-2.4 8,-2.4 3.5,1.2 5.5,7 0,3.5 -5.5,7 -3.5,1.2 -8,-2.4 -2.4,-2.4"
        fill="#fb7185"
      />
    </g>
  </svg>
);

// 7. Freedom of Information officials (Provision of Freedom of Information Request)
export const SopFoiIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* FOI Info Badges above */}
    <circle cx="43" cy="22" r="5" fill="#0284c7" />
    <text x="43" y="25.5" fontSize="6" fontWeight="bold" fill="#ffffff" textAnchor="middle">i</text>
    
    <circle cx="57" cy="22" r="5" fill="#ec4899" />
    <text x="57" y="25.5" fontSize="6" fontWeight="bold" fill="#ffffff" textAnchor="middle">i</text>

    {/* Official 1 (Male / Suit) */}
    <circle cx="43" cy="34" r="4.5" fill="#fed7aa" />
    {/* Suit Jacket */}
    <path d="M37 40H49L50 60H36L37 40Z" fill="#1e293b" />
    <path d="M41 40L43 46L45 40" stroke="#f8fafc" strokeWidth="1.5" />
    <polygon points="43,44 42,50 43,52 44,50" fill="#dc2626" />
    {/* Briefcase */}
    <rect x="31" y="50" width="6" height="5" rx="1" fill="#92400e" />
    <rect x="39" y="60" width="3" height="15" fill="#0f172a" />
    <rect x="44" y="60" width="3" height="15" fill="#0f172a" />

    {/* Official 2 (Female / Blouse & Skirt) */}
    <circle cx="57" cy="34" r="4.5" fill="#fbcfe8" />
    <path d="M51 40H63L65 52H49L51 40Z" fill="#38bdf8" />
    <path d="M53 52H61L63 62H51L53 52Z" fill="#1e293b" />
    <rect x="53" y="62" width="2.5" height="13" fill="#fbcfe8" />
    <rect x="58" y="62" width="2.5" height="13" fill="#fbcfe8" />
  </svg>
);

// 8. Documents with "RECEIVED" stamp (Processing of Incoming Documents)
export const SopIncomingIcon: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 100 80" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Back document */}
    <rect x="38" y="16" width="28" height="38" rx="2" fill="#0284c7" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
    {/* Front document */}
    <rect x="44" y="22" width="30" height="42" rx="2" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1.2" />
    {/* Document lines */}
    <line x1="48" y1="28" x2="68" y2="28" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
    <line x1="48" y1="34" x2="64" y2="34" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="48" y1="39" x2="70" y2="39" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="48" y1="44" x2="60" y2="44" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Red / Coral RECEIVED stamp box */}
    <g transform="translate(56, 50) rotate(-8)">
      <rect x="-14" y="-8" width="28" height="14" rx="2" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
      <text x="0" y="-1" fontSize="4.5" fontWeight="900" fill="#dc2626" textAnchor="middle" letterSpacing="0.5">
        RECEIVED
      </text>
      <text x="0" y="4" fontSize="3" fontWeight="bold" fill="#dc2626" textAnchor="middle">
        AD-RAMS CD
      </text>
    </g>

    {/* Paper clip on top left */}
    <path d="M47 24V18C47 16 49 14 51 14C53 14 55 16 55 18V26" stroke="#64748b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);
