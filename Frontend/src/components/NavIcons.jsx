/**
 * Sidebar navigation icons.
 * Each icon reads color from CSS variables via className.
 * Usage: <DashboardIcon className="nav-icon" />
 * Active state: add "active" class to the parent .prl-nav-item
 * CSS handles the color change via: .prl-nav-item.active .nav-icon { color: var(--coral) }
 */

export function DashboardIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="3" width="8" height="8" rx="2" opacity="1"/>
      <rect x="13" y="3" width="8" height="8" rx="2" opacity="0.6"/>
      <rect x="3" y="13" width="8" height="8" rx="2" opacity="0.6"/>
      <rect x="13" y="13" width="8" height="8" rx="2" opacity="1"/>
    </svg>
  );
}

export function PostJobIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function MyJobsIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
      <line x1="8" y1="8"  x2="16" y2="8"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="13" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function FindFreelancersIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="9" cy="7" r="4"/>
      <path d="M2 20c0-4 3.1-7 7-7s7 3 7 7" opacity="0.7"/>
      <circle cx="18" cy="8" r="3" opacity="0.5"/>
    </svg>
  );
}

export function FindProjectIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5"/>
      <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

export function CompaniesIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="7" width="18" height="14" rx="1" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="7" y="3" width="10" height="4" rx="1" fill="currentColor"/>
      <rect x="7"  y="11" width="3" height="3" rx="0.5" fill="currentColor"/>
      <rect x="14" y="11" width="3" height="3" rx="0.5" fill="currentColor"/>
      <rect x="7"  y="16" width="3" height="3" rx="0.5" fill="currentColor"/>
      <rect x="14" y="16" width="3" height="3" rx="0.5" fill="currentColor"/>
    </svg>
  );
}

export function ProposalsIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="5" y="2" width="14" height="5" rx="2" fill="currentColor"/>
      <line x1="8" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="17" x2="13" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function SettingsIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function SignOutIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function ChatIcon() {
  return (
    <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
