import { getActivities, getContacts } from "@/lib/data";
import { ActivitiesView } from "./activities-view";

export default async function ActivitesPage() {
  const [contacts, activities] = await Promise.all([
    getContacts(),
    getActivities(),
  ]);
  return <ActivitiesView contacts={contacts} activities={activities} />;
}
