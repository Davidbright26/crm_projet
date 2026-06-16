import type {
  ActivityStatus,
  ContactStatus,
  OppStage,
  TaskType,
} from "@/types/db";

export const AVATAR_COLORS = [
  "av-blue",
  "av-teal",
  "av-coral",
  "av-purple",
  "av-amber",
  "av-green",
] as const;

export const STAGE_COLORS: Record<string, string> = {
  Prospection: "#378ADD",
  Qualification: "#7F77DD",
  Proposition: "#EF9F27",
  Négociation: "#D85A30",
  Gagné: "#639922",
  Perdu: "#E24B4A",
};

export const ACTIVE_STAGES: OppStage[] = [
  "Prospection",
  "Qualification",
  "Proposition",
  "Négociation",
];

export const STATUS_BADGE: Record<ContactStatus, string> = {
  client: "badge-client",
  prospect: "badge-prospect",
  contact: "badge-contact",
};

export const STATUS_LABEL: Record<ContactStatus, string> = {
  client: "Client",
  prospect: "Prospect",
  contact: "Contact",
};

export const ACTIVITY_STATUS_BADGE: Record<ActivityStatus, string> = {
  fait: "badge-won",
  planifié: "badge-contact",
  "en attente": "badge-nego",
};

export interface TaskTypeMeta {
  label: string;
  color: string;
  icon: string;
}

export const TASK_TYPES: Record<TaskType, TaskTypeMeta> = {
  appel: { label: "Appel", color: "#185FA5", icon: "📞" },
  email: { label: "Email", color: "#534AB7", icon: "✉️" },
  reunion: { label: "Réunion", color: "#0F6E56", icon: "👥" },
  relance: { label: "Relance", color: "#D85A30", icon: "🔔" },
  suivi: { label: "Suivi opportunité", color: "#BA7517", icon: "📈" },
  tache: { label: "Tâche", color: "#5F5E5A", icon: "✅" },
};

export function randAvatarColor(): string {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}
