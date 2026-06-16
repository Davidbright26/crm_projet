import { getContacts, getTasks } from "@/lib/data";
import { TachesView } from "./taches-view";

export default async function TachesPage() {
  const [contacts, tasks] = await Promise.all([getContacts(), getTasks()]);
  return <TachesView contacts={contacts} tasks={tasks} />;
}
