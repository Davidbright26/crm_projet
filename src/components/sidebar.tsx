"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { NAV_ITEMS } from "@/components/nav-items";

interface SidebarProps {
  open: boolean;
  displayName: string;
  initials: string;
  contactsCount: number;
  pipelineCount: number;
  onNavigate: () => void;
}

export function Sidebar({
  open,
  displayName,
  initials,
  contactsCount,
  pipelineCount,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={"sidebar" + (open ? " open" : "")}>
      <div className="logo">
        <div className="logo-mark">
          <div className="logo-icon">
            <svg viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".4" />
            </svg>
          </div>
          <div>
            <div className="logo-name">Mon CRM</div>
            <div className="logo-sub">Espace commercial</div>
          </div>
        </div>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          const badge =
            item.view === "contacts"
              ? contactsCount
              : item.view === "pipeline"
                ? pipelineCount
                : null;
          return (
            <div key={item.href}>
              {item.section && <div className="nav-section">{item.section}</div>}
              <Link
                href={item.href}
                className={"nav-item" + (active ? " active" : "")}
                onClick={onNavigate}
              >
                {item.icon}
                {item.label}
                {badge !== null && <span className="nav-badge">{badge}</span>}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div>
            <div
              className="user-name"
              style={{ fontSize: 11, wordBreak: "break-all" }}
            >
              {displayName}
            </div>
            <form action={logout}>
              <button
                type="submit"
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 11,
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                  marginTop: 2,
                }}
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}
