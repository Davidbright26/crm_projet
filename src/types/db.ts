// ── Database row shapes (snake_case, as stored in Supabase) ──────────────────

export type ContactStatus = "prospect" | "contact" | "client";
export type OppStage =
  | "Prospection"
  | "Qualification"
  | "Proposition"
  | "Négociation"
  | "Gagné"
  | "Perdu";
export type ActivityType = "appel" | "email" | "réunion" | "note" | "relance";
export type ActivityStatus = "fait" | "planifié" | "en attente";
export type TaskType =
  | "appel"
  | "email"
  | "reunion"
  | "relance"
  | "suivi"
  | "tache";
export type TaskStatus = "todo" | "done";
export type InviteRole = "commercial" | "admin" | "lecture";
export type InviteStatus = "pending" | "accepted" | "refused";

export interface ContactRow {
  id: string;
  user_id: string;
  firstname: string;
  lastname: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  status: ContactStatus | null;
  value: number | null;
  color: string | null;
  notes: string | null;
  created_at: string;
}

export interface OpportunityRow {
  id: string;
  user_id: string;
  contact_id: string;
  amount: number | null;
  stage: OppStage | null;
  prob: number | null;
  close_date: string | null;
  description: string | null;
  created_at: string;
}

export interface ActivityRow {
  id: string;
  user_id: string;
  contact_id: string;
  type: ActivityType | null;
  description: string | null;
  activity_date: string | null;
  status: ActivityStatus | null;
  created_at: string;
}

export interface TaskRow {
  id: string;
  user_id: string;
  contact_id: string | null;
  opportunity_id: string | null;
  type: TaskType | null;
  title: string | null;
  notes: string | null;
  due_date: string | null;
  due_time: string | null;
  status: TaskStatus | null;
  created_at: string;
}

export interface UserProfileRow {
  user_id: string;
  firstname: string | null;
  lastname: string | null;
  company: string | null;
}

export interface TeamInvitationRow {
  id: string;
  inviter_id: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  created_at: string;
}

// ── App models (camelCase, used in components) ───────────────────────────────

export interface Contact {
  id: string;
  firstname: string;
  lastname: string;
  company: string;
  email: string;
  phone: string;
  status: ContactStatus;
  value: number;
  color: string;
  notes: string;
  createdAt: number;
}

export interface Opportunity {
  id: string;
  contactId: string;
  amount: number;
  stage: OppStage;
  prob: number;
  date: string;
  desc: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  contactId: string;
  type: ActivityType;
  desc: string;
  date: string;
  status: ActivityStatus;
  createdAt: number;
}

export interface Task {
  id: string;
  contactId: string | null;
  oppId: string | null;
  type: TaskType;
  title: string;
  notes: string;
  dueDate: string;
  dueTime: string;
  status: TaskStatus;
  createdAt: number;
}

export interface UserProfile {
  firstname: string;
  lastname: string;
  company: string;
}
