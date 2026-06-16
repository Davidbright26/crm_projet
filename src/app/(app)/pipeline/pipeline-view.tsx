"use client";

import { useModals } from "@/components/modals-context";
import { fmtEur } from "@/lib/format";
import { STAGE_COLORS } from "@/lib/constants";
import type { Contact, Opportunity } from "@/types/db";

const STAGES = ["Prospection", "Qualification", "Proposition", "Négociation"];

export function PipelineView({
  contacts,
  opportunities,
}: {
  contacts: Contact[];
  opportunities: Opportunity[];
}) {
  const { openOpp } = useModals();
  const getContact = (id: string) => contacts.find((c) => c.id === id);

  return (
    <div className="kanban">
      {STAGES.map((stage) => {
        const cards = opportunities.filter((o) => o.stage === stage);
        const total = cards.reduce((s, o) => s + Number(o.amount || 0), 0);
        return (
          <div className="kanban-col" key={stage}>
            <div className="kanban-header">
              <span
                className="kanban-stage"
                style={{ color: STAGE_COLORS[stage] || "#888" }}
              >
                {stage}
              </span>
              <span className="kanban-badge">{cards.length}</span>
            </div>
            <div className="kanban-total">{fmtEur(total)}</div>
            {cards.length ? (
              cards.map((o) => {
                const c = getContact(o.contactId);
                return (
                  <div
                    className="kanban-card"
                    key={o.id}
                    onClick={() => openOpp(o.id)}
                  >
                    <div className="kc-name">
                      {c ? c.firstname + " " + c.lastname : "—"}
                    </div>
                    <div className="kc-company">{c ? c.company : ""}</div>
                    <div className="kc-amount">{fmtEur(o.amount)}</div>
                    <div className="kc-meta">
                      <span className="kc-date">
                        {o.date
                          ? new Date(o.date + "T12:00:00").toLocaleDateString(
                              "fr-FR",
                              { day: "numeric", month: "short" },
                            )
                          : ""}
                      </span>
                      <span
                        className="kc-prob"
                        style={{
                          color:
                            o.prob >= 70
                              ? "var(--green)"
                              : o.prob >= 40
                                ? "var(--amber)"
                                : "var(--coral)",
                        }}
                      >
                        {Math.round(o.prob || 0)}%
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="kanban-empty">Aucune opportunité</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
