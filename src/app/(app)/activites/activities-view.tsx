"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { useAppUI } from "@/components/app-ui-context";
import { fmtDateFr } from "@/lib/format";
import { ACTIVITY_STATUS_BADGE } from "@/lib/constants";
import { deleteActivity } from "@/app/actions/activities";
import type { Activity, Contact } from "@/types/db";

const FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "appel", label: "Appels" },
  { key: "email", label: "Emails" },
  { key: "réunion", label: "Réunions" },
  { key: "note", label: "Notes" },
  { key: "relance", label: "Relances" },
];

export function ActivitiesView({
  contacts,
  activities,
}: {
  contacts: Contact[];
  activities: Activity[];
}) {
  const router = useRouter();
  const { toast } = useAppUI();
  const [filter, setFilter] = useState("all");
  const getContact = (id: string) => contacts.find((c) => c.id === id);

  let list = [...activities].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  if (filter !== "all") list = list.filter((a) => a.type === filter);

  async function handleDelete(id: string) {
    const { error } = await deleteActivity(id);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast("Activité supprimée");
    router.refresh();
  }

  return (
    <div>
      <div className="activities-filter">
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
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table className="crm-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Type</th>
                <th>Description</th>
                <th>Date</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.length ? (
                list.map((a) => {
                  const c = getContact(a.contactId);
                  return (
                    <tr key={a.id}>
                      <td>
                        <div className="contact-cell">
                          {c ? (
                            <>
                              <Avatar contact={c} size={28} />
                              <span>
                                {c.firstname} {c.lastname}
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className="badge"
                          style={{ background: "var(--gray-light)", color: "var(--gray)" }}
                        >
                          {a.type}
                        </span>
                      </td>
                      <td>{a.desc}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12 }}>
                        {fmtDateFr(a.date)}
                      </td>
                      <td>
                        <span
                          className={"badge " + (ACTIVITY_STATUS_BADGE[a.status] || "badge-contact")}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleDelete(a.id)}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      color: "var(--text-tertiary)",
                      padding: 32,
                    }}
                  >
                    Aucune activité.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
