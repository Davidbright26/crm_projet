"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { ImportModal } from "@/components/import-modal";

interface AppShellProps {
  displayName: string;
  initials: string;
  contactsCount: number;
  pipelineCount: number;
  children: ReactNode;
}

export function AppShell({
  displayName,
  initials,
  contactsCount,
  pipelineCount,
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex" }}>
      <div
        className={"sidebar-overlay" + (sidebarOpen ? " open" : "")}
        onClick={() => setSidebarOpen(false)}
      />
      <MobileNav onMenu={() => setSidebarOpen((v) => !v)} />

      <Sidebar
        open={sidebarOpen}
        displayName={displayName}
        initials={initials}
        contactsCount={contactsCount}
        pipelineCount={pipelineCount}
        onNavigate={() => setSidebarOpen(false)}
      />

      <main className="main">
        <Topbar
          contactsCount={contactsCount}
          pipelineCount={pipelineCount}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          onImport={() => setImportOpen(true)}
        />
        <div className="content">{children}</div>
      </main>

      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </div>
  );
}
