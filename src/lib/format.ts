import type { Contact } from "@/types/db";

export function fmtDate(ts: number): string {
  return new Date(ts).toISOString().split("T")[0];
}

export function fmtDateFr(d?: string | null): string {
  if (!d) return "";
  const dt = new Date(d + "T12:00:00");
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  const diff = Math.round((now.getTime() - dt.getTime()) / 864e5);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Hier";
  if (diff > 1 && diff < 30) return "Il y a " + diff + "j";
  return dt.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function initials(c: Pick<Contact, "firstname" | "lastname">): string {
  const fn = (c.firstname || "")[0] || "";
  const ln = (c.lastname || "")[0] || "";
  return (fn + ln).toUpperCase();
}

export function fmtEur(n?: number | null): string {
  return Number(n || 0).toLocaleString("fr-FR") + " €";
}

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
