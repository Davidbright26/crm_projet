"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("var(--red)");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!newPass) {
      setMsgColor("var(--red)");
      setMsg("Saisis un mot de passe.");
      return;
    }
    if (newPass.length < 6) {
      setMsgColor("var(--red)");
      setMsg("Minimum 6 caractères.");
      return;
    }
    if (newPass !== confirmPass) {
      setMsgColor("var(--red)");
      setMsg("Les mots de passe ne correspondent pas.");
      return;
    }
    setSaving(true);
    setMsg("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setSaving(false);
    if (error) {
      setMsgColor("var(--red)");
      setMsg(error.message);
      return;
    }
    setMsgColor("var(--green)");
    setMsg("Mot de passe modifié ! Redirection...");
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "36px 40px",
          width: 360,
          maxWidth: "92vw",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              width: 44,
              height: 44,
              background: "var(--blue)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 18 18" fill="none">
              <rect x="2" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".9" />
              <rect x="10" y="2" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="2" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".6" />
              <rect x="10" y="10" width="6" height="6" rx="1.5" fill="white" opacity=".4" />
            </svg>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>Mon CRM</div>
          <div
            style={{
              fontSize: 12,
              color: "var(--text-secondary)",
              marginTop: 4,
            }}
          >
            Choisir un nouveau mot de passe
          </div>
        </div>

        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 16,
          }}
        >
          Choisis ton nouveau mot de passe.
        </p>
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
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
            }}
          />
        </div>
        <div
          style={{
            fontSize: 12,
            minHeight: 16,
            marginBottom: 10,
            color: msgColor,
          }}
        >
          {msg}
        </div>
        <button
          className="btn btn-primary"
          style={{ width: "100%", padding: 10 }}
          disabled={saving}
          onClick={save}
        >
          {saving ? "Enregistrement..." : "Enregistrer le mot de passe"}
        </button>
      </div>
    </div>
  );
}
