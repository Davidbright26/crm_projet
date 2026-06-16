"use client";

import { usePathname } from "next/navigation";
import { useAppUI } from "@/components/app-ui-context";
import { useModals } from "@/components/modals-context";
import { PAGE_TITLES } from "@/components/nav-items";

interface TopbarProps {
  contactsCount: number;
  pipelineCount: number;
  onToggleSidebar: () => void;
  onImport: () => void;
}

// Routes that show the primary "+ New" action button (matches original app:
// taches and parametres intentionally have no topbar action).
const PRIMARY_ACTIONS: Record<string, string> = {
  dashboard: "+ Nouveau contact",
  contacts: "+ Nouveau contact",
  pipeline: "+ Nouvelle opportunité",
  activites: "+ Nouvelle activité",
};

export function Topbar({
  contactsCount,
  pipelineCount,
  onToggleSidebar,
  onImport,
}: TopbarProps) {
  const pathname = usePathname();
  const { search, setSearch } = useAppUI();
  const { openContact, openOpp, openActivity } = useModals();

  const view = pathname.replace("/", "") || "dashboard";
  const title = PAGE_TITLES[view] || "";
  const actionLabel = PRIMARY_ACTIONS[view];

  let count: string | null = null;
  if (view === "contacts") count = contactsCount + " contacts";
  else if (view === "pipeline") count = pipelineCount + " opportunités";

  function handlePrimary() {
    if (view === "pipeline") openOpp();
    else if (view === "activites") openActivity();
    else openContact();
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-hamburger" onClick={onToggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <span className="page-title">{title}</span>
        {count && <span className="page-count">{count}</span>}
      </div>
      <div className="topbar-right">
        <input
          className="search-input"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn import-btn" onClick={onImport}>
          ⬆ Importer
        </button>
        {actionLabel && (
          <button className="btn btn-primary" onClick={handlePrimary}>
            {actionLabel}
          </button>
        )}
      </div>
    </header>
  );
}
