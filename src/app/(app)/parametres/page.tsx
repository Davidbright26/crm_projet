import { createClient } from "@/lib/supabase/server";
import {
  getActivities,
  getContacts,
  getOpportunities,
  getUserProfile,
} from "@/lib/data";
import { getTeamInvitations } from "@/app/actions/team";
import { ParametresView } from "./parametres-view";

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [contacts, opportunities, activities, profile, invitations] =
    await Promise.all([
      getContacts(),
      getOpportunities(),
      getActivities(),
      user ? getUserProfile(user.id) : Promise.resolve(null),
      getTeamInvitations(),
    ]);

  return (
    <ParametresView
      email={user?.email || ""}
      profile={profile}
      contacts={contacts}
      counts={{
        contacts: contacts.length,
        opportunities: opportunities.length,
        activities: activities.length,
      }}
      invitations={invitations}
    />
  );
}
