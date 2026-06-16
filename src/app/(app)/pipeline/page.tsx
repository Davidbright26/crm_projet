import { getContacts, getOpportunities } from "@/lib/data";
import { PipelineView } from "./pipeline-view";

export default async function PipelinePage() {
  const [contacts, opportunities] = await Promise.all([
    getContacts(),
    getOpportunities(),
  ]);
  return <PipelineView contacts={contacts} opportunities={opportunities} />;
}
