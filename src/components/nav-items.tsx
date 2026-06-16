import type { ReactNode } from "react";

export interface NavItem {
  href: string;
  view: string;
  label: string;
  section?: string;
  icon: ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    view: "dashboard",
    label: "Tableau de bord",
    section: "Principal",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.2" fill="currentColor" opacity=".9" />
        <rect x="9" y="1" width="6" height="6" rx="1.2" fill="currentColor" opacity=".5" />
        <rect x="1" y="9" width="6" height="6" rx="1.2" fill="currentColor" opacity=".5" />
        <rect x="9" y="9" width="6" height="6" rx="1.2" fill="currentColor" opacity=".3" />
      </svg>
    ),
  },
  {
    href: "/contacts",
    view: "contacts",
    label: "Contacts",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 14c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/pipeline",
    view: "pipeline",
    label: "Pipeline",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="4" width="14" height="2.5" rx="1" fill="currentColor" opacity=".9" />
        <rect x="1" y="8" width="10" height="2.5" rx="1" fill="currentColor" opacity=".6" />
        <rect x="1" y="12" width="6" height="2.5" rx="1" fill="currentColor" opacity=".35" />
      </svg>
    ),
  },
  {
    href: "/activites",
    view: "activites",
    label: "Activités",
    section: "Suivi",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M5 5h6M5 8h6M5 11h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/taches",
    view: "taches",
    label: "Tâches",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M4 8l2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/stats",
    view: "stats",
    label: "Statistiques",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <path d="M2 13V8l3-3 3 2 3-4 3 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/parametres",
    view: "parametres",
    label: "Paramètres",
    section: "Compte",
    icon: (
      <svg className="icon" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3.1 3.1l1.1 1.1M11.8 11.8l1.1 1.1M3.1 12.9l1.1-1.1M11.8 4.2l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

export const PAGE_TITLES: Record<string, string> = {
  dashboard: "Tableau de bord",
  contacts: "Contacts",
  pipeline: "Pipeline commercial",
  activites: "Activités",
  taches: "Tâches",
  stats: "Statistiques",
  parametres: "Paramètres",
};
