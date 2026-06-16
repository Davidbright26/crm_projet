import { getActivities, getContacts, getOpportunities } from "@/lib/data";
import { Avatar } from "@/components/avatar";
import { fmtDateFr, fmtEur, capitalize } from "@/lib/format";
import { STAGE_COLORS } from "@/lib/constants";

export default async function DashboardPage() {
  const [contacts, opportunities, activities] = await Promise.all([
    getContacts(),
    getOpportunities(),
    getActivities(),
  ]);

  const active = opportunities.filter(
    (o) => !["Gagné", "Perdu"].includes(o.stage),
  );
  const won = opportunities.filter((o) => o.stage === "Gagné");
  const pipelineEur = active.reduce((s, o) => s + Number(o.amount || 0), 0);
  const clients = contacts.filter((c) => c.status === "client").length;
  const total = contacts.length;
  const conv = total ? Math.round((clients / total) * 100) : 0;

  const metrics = [
    { label: "Contacts", val: String(total), sub: clients + " clients", color: "#185FA5" },
    { label: "Opportunités actives", val: String(active.length), sub: won.length + " gagnées", color: "#7F77DD" },
    { label: "CA potentiel", val: fmtEur(pipelineEur), sub: "pipeline actif", color: "#EF9F27" },
    { label: "Taux conversion", val: conv + "%", sub: "prospects → clients", color: "#639922" },
  ];

  const recent = [...activities]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 5)
    .map((a) => ({ a, c: contacts.find((c) => c.id === a.contactId) }))
    .filter((x) => x.c);

  const stages = ["Prospection", "Qualification", "Proposition", "Négociation"];
  const stageCounts = stages.map(
    (s) => opportunities.filter((o) => o.stage === s).length,
  );
  const maxCount = Math.max(...stageCounts, 1);

  const tips: string[] = [];
  const stale = contacts.filter((c) => {
    const last = activities
      .filter((a) => a.contactId === c.id)
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    return !last || Math.round((Date.now() - last.createdAt) / 864e5) >= 7;
  });
  if (stale.length) tips.push(stale.length + " contact(s) sans activité depuis 7+ jours.");
  const pending = activities.filter((a) => a.status === "en attente").length;
  if (pending) tips.push(pending + " activité(s) en attente.");
  if (!tips.length) tips.push("Tout est à jour, bravo !");

  return (
    <div>
      <div className="metrics">
        {metrics.map((m) => (
          <div className="metric-card" key={m.label}>
            <div className="metric-accent" style={{ background: m.color }} />
            <div className="metric-label">{m.label}</div>
            <div className="metric-value">{m.val}</div>
            <div className="metric-sub">{m.sub}</div>
          </div>
        ))}
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">
            <span>Évolution du CA potentiel</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button className="filter-chip active" style={{ fontSize: 11, padding: "3px 10px" }}>
                6 mois
              </button>
              <button className="filter-chip" style={{ fontSize: 11, padding: "3px 10px" }}>
                12 mois
              </button>
            </div>
          </div>
          <canvas height={160} />
        </div>
        <div className="card">
          <div className="card-title">Répartition contacts</div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <canvas width={140} height={140} />
            <div style={{ flex: 1, fontSize: 12 }} />
          </div>
        </div>
      </div>

      <div className="two-col" style={{ marginBottom: 16 }}>
        <div className="card">
          <div className="card-title">Entonnoir de conversion</div>
          <div />
        </div>
        <div className="card">
          <div className="card-title">Activités par semaine</div>
          <canvas height={160} />
        </div>
      </div>

      <div className="two-col">
        <div className="card">
          <div className="card-title">Activité récente</div>
          <div>
            {recent.length ? (
              recent.map(({ a, c }) => (
                <div className="activity-item" key={a.id}>
                  <Avatar contact={c!} size={32} />
                  <div className="activity-body">
                    <div className="activity-name">
                      {c!.firstname} {c!.lastname}
                    </div>
                    <div className="activity-desc">
                      {capitalize(a.type)} — {a.desc}
                    </div>
                  </div>
                  <div className="activity-time">{fmtDateFr(a.date)}</div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>Aucune activité encore.</p>
              </div>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-title">Pipeline par étape</div>
          <div>
            {stages.map((s, i) => {
              const count = stageCounts[i];
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div className="pipe-item" key={s}>
                  <div className="pipe-label">
                    <span style={{ color: "var(--text-secondary)" }}>{s}</span>
                    <span className="pipe-count">{count}</span>
                  </div>
                  <div className="pipe-bar-bg">
                    <div
                      className="pipe-bar"
                      style={{ width: pct + "%", background: STAGE_COLORS[s] || "#888" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ai-box">
            <div className="ai-label">Suggestions</div>
            {tips.map((t, i) => (
              <div className="ai-tip" key={i}>
                <div className="ai-dot" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
