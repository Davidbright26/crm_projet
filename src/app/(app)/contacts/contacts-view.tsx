"use client";

import { useRouter } from "next/navigation";
import { Avatar } from "@/components/avatar";
import { useAppUI } from "@/components/app-ui-context";
import { useModals } from "@/components/modals-context";
import { fmtDateFr, fmtEur } from "@/lib/format";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { deleteContact } from "@/app/actions/contacts";
import type { Contact } from "@/types/db";

export function ContactsView({
  contacts,
  lastDate,
}: {
  contacts: Contact[];
  lastDate: Record<string, string>;
}) {
  const router = useRouter();
  const { search, toast } = useAppUI();
  const { openContact } = useModals();

  const q = search.toLowerCase();
  const list = q
    ? contacts.filter((c) =>
        (c.firstname + " " + c.lastname + " " + c.company + " " + c.email)
          .toLowerCase()
          .includes(q),
      )
    : contacts;

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce contact ?")) return;
    const { error } = await deleteContact(id);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast("Contact supprimé");
    router.refresh();
  }

  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="table-wrap">
        <table className="crm-table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Statut</th>
              <th>Valeur</th>
              <th>Dernier contact</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {list.length ? (
              list.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="contact-cell">
                      <Avatar contact={c} size={34} />
                      <div className="contact-info">
                        <div className="name">
                          {c.firstname} {c.lastname}
                        </div>
                        <div className="company">{c.company}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--blue)", fontSize: 12 }}>
                    {c.email || "—"}
                  </td>
                  <td style={{ fontSize: 12 }}>{c.phone || "—"}</td>
                  <td>
                    <span className={"badge " + (STATUS_BADGE[c.status] || "badge-contact")}>
                      {STATUS_LABEL[c.status] || c.status}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>
                    {c.value ? fmtEur(c.value) : "—"}
                  </td>
                  <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                    {fmtDateFr(lastDate[c.id]) || "—"}
                  </td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => openContact(c.id)}
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      className="action-btn"
                      onClick={() => handleDelete(c.id)}
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    textAlign: "center",
                    color: "var(--text-tertiary)",
                    padding: 32,
                  }}
                >
                  Aucun contact trouvé.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
