import { getActivities, getContacts } from "@/lib/data";
import { ContactsView } from "./contacts-view";

export default async function ContactsPage() {
  const [contacts, activities] = await Promise.all([
    getContacts(),
    getActivities(),
  ]);

  // Last-contact date per contact, derived from activities.
  const lastDate: Record<string, string> = {};
  for (const c of contacts) {
    const last = activities
      .filter((a) => a.contactId === c.id)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    lastDate[c.id] = last?.date || "";
  }

  return <ContactsView contacts={contacts} lastDate={lastDate} />;
}
