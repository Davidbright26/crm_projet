"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MobileNavProps {
  onMenu: () => void;
}

export function MobileNav({ onMenu }: MobileNavProps) {
  const pathname = usePathname();
  const is = (href: string) => pathname === href;

  return (
    <div className="mobile-topbar">
      <div className="mobile-nav">
        <Link
          href="/dashboard"
          className={"mobile-nav-item" + (is("/dashboard") ? " active" : "")}
        >
          <svg viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1.2" fill="currentColor" opacity=".9" />
            <rect x="9" y="1" width="6" height="6" rx="1.2" fill="currentColor" opacity=".5" />
            <rect x="1" y="9" width="6" height="6" rx="1.2" fill="currentColor" opacity=".5" />
            <rect x="9" y="9" width="6" height="6" rx="1.2" fill="currentColor" opacity=".3" />
          </svg>
          Accueil
        </Link>
        <Link
          href="/contacts"
          className={"mobile-nav-item" + (is("/contacts") ? " active" : "")}
        >
          <svg viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Contacts
        </Link>
        <Link
          href="/pipeline"
          className={"mobile-nav-item" + (is("/pipeline") ? " active" : "")}
        >
          <svg viewBox="0 0 16 16" fill="none">
            <rect x="1" y="4" width="14" height="2.5" rx="1" fill="currentColor" opacity=".9" />
            <rect x="1" y="8" width="10" height="2.5" rx="1" fill="currentColor" opacity=".6" />
            <rect x="1" y="12" width="6" height="2.5" rx="1" fill="currentColor" opacity=".35" />
          </svg>
          Pipeline
        </Link>
        <Link
          href="/taches"
          className={"mobile-nav-item" + (is("/taches") ? " active" : "")}
        >
          <svg viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 8l2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tâches
        </Link>
        <button className="mobile-nav-item" onClick={onMenu} type="button">
          <svg viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Menu
        </button>
      </div>
    </div>
  );
}
