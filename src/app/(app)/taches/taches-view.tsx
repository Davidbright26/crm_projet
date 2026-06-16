"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { useAppUI } from "@/components/app-ui-context";
import { useModals } from "@/components/modals-context";
import { fmtDateFr } from "@/lib/format";
import { TASK_TYPES } from "@/lib/constants";
import { deleteTask, toggleTaskDone } from "@/app/actions/tasks";
import type { Contact, Task } from "@/types/db";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "retard", label: "En retard" },
  { key: "today", label: "Aujourd’hui" },
  { key: "upcoming", label: "À venir" },
  { key: "done", label: "Terminées" },
];

function gcalUrl(t: Task, contacts: Contact[], todayStr: string): string {
  const c = contacts.find((x) => x.id === t.contactId);
  const tt = TASK_TYPES[t.type] || TASK_TYPES.tache;
  const title = encodeURIComponent(
    tt.label +
      (c ? " - " + c.firstname + " " + c.lastname : "") +
      (t.title ? " : " + t.title : ""),
  );
  const date = (t.dueDate || todayStr).replace(/-/g, "");
  const time = (t.dueTime || "09:00").replace(":", "") + "00";
  const endH = String(
    parseInt((t.dueTime || "09:00").split(":")[0]) + 1,
  ).padStart(2, "0");
  const endTime = endH + (t.dueTime || "09:00").split(":")[1] + "00";
  return (
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" +
    title +
    "&dates=" +
    date +
    "T" +
    time +
    "/" +
    date +
    "T" +
    endTime +
    "&details=" +
    encodeURIComponent(t.notes || "")
  );
}

export function TachesView({
  contacts,
  tasks,
}: {
  contacts: Contact[];
  tasks: Task[];
}) {
  const router = useRouter();
  const { toast } = useAppUI();
  const { openTask } = useModals();
  const [filter, setFilter] = useState("all");

  const todayStr = new Date().toISOString().split("T")[0];
  const getContact = (id: string | null) =>
    id ? contacts.find((c) => c.id === id) : undefined;

  let list = [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });

  if (filter === "retard")
    list = list.filter(
      (t) => t.status !== "done" && t.dueDate && t.dueDate < todayStr,
    );
  else if (filter === "today")
    list = list.filter((t) => t.status !== "done" && t.dueDate === todayStr);
  else if (filter === "upcoming")
    list = list.filter((t) => t.status !== "done" && t.dueDate > todayStr);
  else if (filter === "done") list = list.filter((t) => t.status === "done");
  else list = list.filter((t) => t.status !== "done");

  // Subscribe button exports the first upcoming pending task.
  const pending = tasks.filter((t) => t.status !== "done" && t.dueDate);
  const subscribeHref = pending.length
    ? gcalUrl(pending[0], contacts, todayStr)
    : "#";

  async function handleToggle(t: Task) {
    const { error } = await toggleTaskDone(t.id, t.status);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette tâche ?")) return;
    const { error } = await deleteTask(id);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast("Tâche supprimée");
    router.refresh();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div className="activities-filter" style={{ marginBottom: 0, flex: 1 }}>
          {FILTERS.map((f) => (
            <div
              key={f.key}
              className={"filter-chip" + (filter === f.key ? " active" : "")}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </div>
          ))}
        </div>
        <a
          href={subscribeHref}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            fontSize: 12,
            border: "0.5px solid var(--border-strong)",
            borderRadius: 8,
            color: "var(--text-secondary)",
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Exporter vers Google Calendar
        </a>
      </div>

      {list.length ? (
        list.map((t) => {
          const c = getContact(t.contactId);
          const tt = TASK_TYPES[t.type] || TASK_TYPES.tache;
          const isOverdue =
            !!t.dueDate && t.dueDate < todayStr && t.status !== "done";
          const isToday = t.dueDate === todayStr;
          const dateColor = isOverdue
            ? "var(--red)"
            : isToday
              ? "var(--amber)"
              : "var(--text-tertiary)";
          return (
            <div
              className="card"
              key={t.id}
              style={{
                marginBottom: 10,
                padding: "14px 16px",
                opacity: t.status === "done" ? 0.55 : undefined,
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <button
                  onClick={() => handleToggle(t)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    border:
                      "1.5px solid " +
                      (t.status === "done" ? "var(--green)" : "var(--border-strong)"),
                    background: t.status === "done" ? "var(--green)" : "transparent",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginTop: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {t.status === "done" && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        background: tt.color + "22",
                        color: tt.color,
                        padding: "2px 8px",
                        borderRadius: 10,
                      }}
                    >
                      {tt.label}
                    </span>
                    {t.title && (
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</span>
                    )}
                  </div>
                  {c && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginBottom: 4,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar contact={c} size={18} />
                      <span style={{ marginLeft: 4 }}>
                        {c.firstname} {c.lastname}
                        {c.company ? " — " + c.company : ""}
                      </span>
                    </div>
                  )}
                  {t.notes && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginBottom: 6,
                      }}
                    >
                      {t.notes}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {t.dueDate && (
                      <span
                        style={{ fontSize: 11, fontWeight: 500, color: dateColor }}
                      >
                        {isOverdue ? "⚠ " : ""}
                        {fmtDateFr(t.dueDate)}
                        {t.dueTime ? " à " + t.dueTime : ""}
                      </span>
                    )}
                    <a
                      href={gcalUrl(t, contacts, todayStr)}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: 11,
                        color: "var(--blue)",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                      }}
                    >
                      📅 Google Calendar
                    </a>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    className="action-btn"
                    onClick={() => openTask(t.id)}
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn"
                    onClick={() => handleDelete(t.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="empty-state">
          <p>Aucune tâche {filter === "done" ? "terminée" : "en cours"}.</p>
        </div>
      )}
    </div>
  );
}
