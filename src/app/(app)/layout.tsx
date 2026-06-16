import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getContacts,
  getOpportunities,
  getTasks,
  getUserProfile,
} from "@/lib/data";
import { ACTIVE_STAGES } from "@/lib/constants";
import { AppUIProvider } from "@/components/app-ui-context";
import { ModalProvider } from "@/components/modals-context";
import { AppShell } from "@/components/app-shell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [contacts, opportunities, tasks, profile] = await Promise.all([
    getContacts(),
    getOpportunities(),
    getTasks(),
    getUserProfile(user.id),
  ]);

  const email = user.email || "";
  const fullName = `${profile?.firstname || ""} ${profile?.lastname || ""}`.trim();
  const displayName = fullName || email;
  const initials = (
    (profile?.firstname?.[0] || "") + (profile?.lastname?.[0] || "") ||
    email[0] ||
    "?"
  ).toUpperCase();

  const contactsCount = contacts.length;
  const pipelineCount = opportunities.filter((o) =>
    ACTIVE_STAGES.includes(o.stage),
  ).length;

  return (
    <AppUIProvider>
      <ModalProvider
        contacts={contacts}
        opportunities={opportunities}
        tasks={tasks}
      >
        <AppShell
          displayName={displayName}
          initials={initials}
          contactsCount={contactsCount}
          pipelineCount={pipelineCount}
        >
          {children}
        </AppShell>
      </ModalProvider>
    </AppUIProvider>
  );
}
