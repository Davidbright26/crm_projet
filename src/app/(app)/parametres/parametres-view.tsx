"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppUI } from "@/components/app-ui-context";
import { saveProfile, updatePassword } from "@/app/actions/profile";
import { sendInvitation, revokeInvitation } from "@/app/actions/team";
import { deleteAccount } from "@/app/actions/auth";
import type {
  Contact,
  InviteRole,
  TeamInvitationRow,
  UserProfile,
} from "@/types/db";

const ROLE_BADGE: Record<string, string> = {
  admin: "badge-prospect",
  commercial: "badge-contact",
  lecture: "badge-nego",
};
const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  commercial: "Commercial",
  lecture: "Lecture",
};

export function ParametresView({
  email,
  profile,
  contacts,
  counts,
  invitations,
}: {
  email: string;
  profile: UserProfile | null;
  contacts: Contact[];
  counts: { contacts: number; opportunities: number; activities: number };
  invitations: TeamInvitationRow[];
}) {
  const router = useRouter();
  const { toast } = useAppUI();

  const [firstname, setFirstname] = useState(profile?.firstname || "");
  const [lastname, setLastname] = useState(profile?.lastname || "");
  const [company, setCompany] = useState(profile?.company || "");

  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passError, setPassError] = useState("");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("commercial");

  const previewInitials = (
    (firstname[0] || "") + (lastname[0] || "") ||
    email[0] ||
    "?"
  ).toUpperCase();
  const previewName = (firstname + " " + lastname).trim() || "Mon profil";

  async function handleSaveProfile() {
    const { error } = await saveProfile({
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      company: company.trim(),
    });
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast("Profil mis à jour");
    router.refresh();
  }

  async function handleSavePassword() {
    if (!newPass) {
      setPassError("Saisis un nouveau mot de passe.");
      return;
    }
    if (newPass.length < 6) {
      setPassError("Minimum 6 caractères.");
      return;
    }
    if (newPass !== confirmPass) {
      setPassError("Les mots de passe ne correspondent pas.");
      return;
    }
    setPassError("");
    const { error } = await updatePassword(newPass);
    if (error) {
      setPassError(error);
      return;
    }
    setNewPass("");
    setConfirmPass("");
    toast("Mot de passe modifié");
  }

  async function handleInvite() {
    if (!inviteEmail.trim()) {
      toast("Email requis", true);
      return;
    }
    const { error } = await sendInvitation(inviteEmail.trim(), inviteRole);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    setInviteEmail("");
    setInviteOpen(false);
    toast("Invitation enregistrée pour " + inviteEmail.trim());
    router.refresh();
  }

  async function handleRevoke(id: string) {
    if (!confirm("Retirer cet accès ?")) return;
    const { error } = await revokeInvitation(id);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast("Accès retiré");
    router.refresh();
  }

  function handleExport() {
    const header = "prenom,nom,entreprise,email,telephone,statut,valeur,notes";
    const rows = contacts.map((c) =>
      [c.firstname, c.lastname, c.company, c.email, c.phone, c.status, c.value, c.notes]
        .map((v) => '"' + (v ?? "") + '"')
        .join(","),
    );
    const csv = header + "\n" + rows.join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download =
      "contacts-crm-" + new Date().toISOString().split("T")[0] + ".csv";
    a.click();
    toast("Export terminé — " + contacts.length + " contacts");
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Supprimer définitivement votre compte et toutes vos données ? Cette action est irréversible.",
      )
    )
      return;
    const typed = prompt('Tapez "SUPPRIMER" pour confirmer :');
    if (typed !== "SUPPRIMER") {
      toast("Suppression annulée");
      return;
    }
    await deleteAccount();
  }

  const dataCards = [
    { label: "Contacts", val: counts.contacts, color: "var(--blue)" },
    { label: "Opportunités", val: counts.opportunities, color: "var(--purple)" },
    { label: "Activités", val: counts.activities, color: "var(--teal)" },
  ];

  return (
    <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Profil */}
      <div className="card">
        <div className="card-title">Profil utilisateur</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--blue)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 600,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {previewInitials}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{previewName}</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{email}</div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Prénom</label>
            <input
              className="form-input"
              placeholder="Marie"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nom</label>
            <input
              className="form-input"
              placeholder="Dupont"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Nom de l&apos;entreprise</label>
          <input
            className="form-input"
            placeholder="Mon Entreprise"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            value={email}
            disabled
            style={{ opacity: 0.6, cursor: "not-allowed" }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
          <button className="btn btn-primary" onClick={handleSaveProfile}>
            Enregistrer le profil
          </button>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="card">
        <div className="card-title">Changer le mot de passe</div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmer</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={confirmPass}
              onChange={(e) => setConfirmPass(e.target.value)}
            />
          </div>
        </div>
        <div style={{ fontSize: 12, color: "var(--red)", minHeight: 16, marginBottom: 8 }}>
          {passError}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button className="btn btn-primary" onClick={handleSavePassword}>
            Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Membres de l'équipe */}
      <div className="card">
        <div
          className="card-title"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <span>Membres de l&apos;équipe</span>
          <button
            className="btn btn-primary"
            style={{ fontSize: 12, padding: "5px 12px" }}
            onClick={() => setInviteOpen(true)}
          >
            + Inviter
          </button>
        </div>
        {inviteOpen && (
          <div
            style={{
              background: "var(--bg)",
              borderRadius: "var(--radius)",
              padding: 14,
              marginBottom: 14,
            }}
          >
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email à inviter</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="collaborateur@exemple.fr"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rôle</label>
                <select
                  className="form-select"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as InviteRole)}
                >
                  <option value="commercial">Commercial</option>
                  <option value="admin">Administrateur</option>
                  <option value="lecture">Lecture seule</option>
                </select>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button className="btn" onClick={() => setInviteOpen(false)}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={handleInvite}>
                Envoyer l&apos;invitation
              </button>
            </div>
          </div>
        )}
        <div style={{ fontSize: 13 }}>
          {/* Current user always first */}
          <div className="activity-item">
            <div className="avatar av-blue" style={{ width: 34, height: 34, fontSize: 13 }}>
              {((firstname || email)[0] || email[0] || "?").toUpperCase()}
            </div>
            <div className="activity-body">
              <div className="activity-name">{previewName !== "Mon profil" ? previewName : email}</div>
              <div className="activity-desc">{email}</div>
            </div>
            <span className="badge badge-client" style={{ alignSelf: "center" }}>
              Admin
            </span>
          </div>
          {invitations.length ? (
            invitations.map((inv) => {
              const statusBadge =
                inv.status === "accepted"
                  ? "badge-won"
                  : inv.status === "pending"
                    ? "badge-nego"
                    : "badge-lost";
              const statusLabel =
                inv.status === "accepted"
                  ? "Actif"
                  : inv.status === "pending"
                    ? "En attente"
                    : "Refusé";
              return (
                <div className="activity-item" key={inv.id}>
                  <div className="avatar av-purple" style={{ width: 34, height: 34, fontSize: 13 }}>
                    {(inv.email || "?")[0].toUpperCase()}
                  </div>
                  <div className="activity-body">
                    <div className="activity-name">{inv.email}</div>
                    <div className="activity-desc">
                      <span
                        className={"badge " + (ROLE_BADGE[inv.role] || "badge-contact")}
                        style={{ fontSize: 10 }}
                      >
                        {ROLE_LABEL[inv.role] || inv.role}
                      </span>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 4,
                    }}
                  >
                    <span className={"badge " + statusBadge} style={{ fontSize: 10 }}>
                      {statusLabel}
                    </span>
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 10,
                        color: "var(--text-tertiary)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ color: "var(--text-tertiary)", fontSize: 12, padding: "12px 0 4px" }}>
              Aucun membre invité pour l’instant.
            </div>
          )}
        </div>
      </div>

      {/* Données */}
      <div className="card">
        <div className="card-title">Mes données</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          {dataCards.map((m) => (
            <div
              key={m.label}
              style={{
                background: "var(--bg)",
                borderRadius: "var(--radius)",
                padding: 12,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 300, color: m.color }}>
                {m.val}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>
                {m.label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn" onClick={handleExport}>
            ⇣ Exporter mes contacts (CSV)
          </button>
        </div>
      </div>

      {/* Zone danger */}
      <div className="card" style={{ borderColor: "var(--red-light)" }}>
        <div className="card-title" style={{ color: "var(--red)" }}>
          Zone danger
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 14 }}>
          La suppression de votre compte est irréversible. Toutes vos données
          (contacts, opportunités, activités) seront définitivement effacées.
        </p>
        <button className="btn btn-danger" onClick={handleDeleteAccount}>
          Supprimer mon compte
        </button>
      </div>
    </div>
  );
}
