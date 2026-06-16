import { getActivities, getContacts, getOpportunities } from "@/lib/data";
import { fmtEur, capitalize } from "@/lib/format";

export default async function StatsPage() {
  const [contacts, opportunities, activities] = await Promise.all([
    getContacts(),
    getOpportunities(),
    getActivities(),
  ]);

  const won = opportunities.filter((o) => o.stage === "Gagné");
  const lost = opportunities.filter((o) => o.stage === "Perdu");
  const active = opportunities.filter(
    (o) => !["Gagné", "Perdu"].includes(o.stage),
  );
  const caWon = won.reduce((s, o) => s + Number(o.amount || 0), 0);
  const caActive = active.reduce((s, o) => s + Number(o.amount || 0), 0);
  const byStatus = {
    client: contacts.filter((c) => c.status === "client").length,
    prospect: contacts.filter((c) => c.status === "prospect").length,
    contact: contacts.filter((c) => c.status === "contact").length,
  };
  const byActivity: Record<string, number> = {};
  activities.forEach((a) => {
    byActivity[a.type] = (byActivity[a.type] || 0) + 1;
  });

  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-title">Opportunités</div>
        <div className="stat-row">
          <span className="stat-row-label">Actives</span>
          <span className="stat-row-val">{active.length}</span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">Gagnées</span>
          <span className="stat-row-val" style={{ color: "var(--green)" }}>
            {won.length}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">Perdues</span>
          <span className="stat-row-val" style={{ color: "var(--red)" }}>
            {lost.length}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">CA gagné</span>
          <span className="stat-row-val">{fmtEur(caWon)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">CA potentiel</span>
          <span className="stat-row-val">{fmtEur(caActive)}</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-title">Contacts</div>
        <div className="stat-row">
          <span className="stat-row-label">Total</span>
          <span className="stat-row-val">{contacts.length}</span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">Clients</span>
          <span className="stat-row-val" style={{ color: "var(--teal)" }}>
            {byStatus.client}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">Prospects</span>
          <span className="stat-row-val" style={{ color: "var(--purple)" }}>
            {byStatus.prospect}
          </span>
        </div>
        <div className="stat-row">
          <span className="stat-row-label">Taux conv.</span>
          <span className="stat-row-val">
            {contacts.length
              ? Math.round((byStatus.client / contacts.length) * 100)
              : 0}
            %
          </span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-title">Activités</div>
        {Object.entries(byActivity).map(([k, v]) => (
          <div className="stat-row" key={k}>
            <span className="stat-row-label">{capitalize(k)}s</span>
            <span className="stat-row-val">{v}</span>
          </div>
        ))}
        <div
          className="stat-row"
          style={{
            borderTop: "0.5px solid var(--border)",
            marginTop: 4,
            paddingTop: 8,
          }}
        >
          <span className="stat-row-label">Total</span>
          <span className="stat-row-val">{activities.length}</span>
        </div>
      </div>
    </div>
  );
}
