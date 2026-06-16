import { randAvatarColor } from "@/lib/constants";
import type {
  Activity,
  ActivityRow,
  Contact,
  ContactRow,
  Opportunity,
  OpportunityRow,
  Task,
  TaskRow,
} from "@/types/db";

export function mapContact(r: ContactRow): Contact {
  return {
    id: r.id,
    firstname: r.firstname,
    lastname: r.lastname,
    company: r.company || "",
    email: r.email || "",
    phone: r.phone || "",
    status: r.status || "prospect",
    value: r.value || 0,
    color: r.color || randAvatarColor(),
    notes: r.notes || "",
    createdAt: new Date(r.created_at).getTime(),
  };
}

export function mapOpportunity(r: OpportunityRow): Opportunity {
  return {
    id: r.id,
    contactId: r.contact_id,
    amount: r.amount || 0,
    stage: r.stage || "Prospection",
    prob: r.prob || 0,
    date: r.close_date || "",
    desc: r.description || "",
    createdAt: new Date(r.created_at).getTime(),
  };
}

export function mapActivity(r: ActivityRow): Activity {
  return {
    id: r.id,
    contactId: r.contact_id,
    type: r.type || "note",
    desc: r.description || "",
    date: r.activity_date || "",
    status: r.status || "fait",
    createdAt: new Date(r.created_at).getTime(),
  };
}

export function mapTask(r: TaskRow): Task {
  return {
    id: r.id,
    contactId: r.contact_id,
    oppId: r.opportunity_id,
    type: r.type || "tache",
    title: r.title || "",
    notes: r.notes || "",
    dueDate: r.due_date || "",
    dueTime: r.due_time || "09:00",
    status: r.status || "todo",
    createdAt: new Date(r.created_at).getTime(),
  };
}
