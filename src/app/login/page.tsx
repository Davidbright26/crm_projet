"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login, signup } from "@/app/actions/auth";
import { createClient } from "@/lib/supabase/client";

type Panel = "login" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("login");

  // login panel state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [errorColor, setErrorColor] = useState("var(--red)");
  const [submitting, setSubmitting] = useState(false);

  // forgot panel state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotColor, setForgotColor] = useState("var(--red)");
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  const subtitle =
    panel === "login"
      ? "Connecte-toi pour accéder"
      : "Réinitialisation du mot de passe";

  async function doLogin() {
    if (!email || !password) {
      setErrorColor("var(--red)");
      setError("Email et mot de passe requis.");
      return;
    }
    setSubmitting(true);
    setError("");
    setErrorColor("var(--red)");
    const { error } = await login(email.trim(), password);
    setSubmitting(false);
    if (error) {
      setError(error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  async function doSignup() {
    if (!email || !password) {
      setError("Email et mot de passe requis.");
      return;
    }
    if (password.length < 6) {
      setError("Mot de passe trop court (6 car. min).");
      return;
    }
    const { error } = await signup(email.trim(), password);
    if (error) {
      setErrorColor("var(--red)");
      setError(error);
      return;
    }
    setErrorColor("var(--green)");
    setError("Compte créé ! Vérifie tes emails puis connecte-toi.");
  }

  async function sendReset() {
    const target = forgotEmail.trim();
    if (!target) {
      setForgotColor("var(--red)");
      setForgotMsg("Saisis ton adresse email.");
      return;
    }
    setForgotSending(true);
    setForgotMsg("");
    const supabase = createClient();
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(target, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });
    setForgotSending(false);
    if (error) {
      setForgotColor("var(--red)");
      setForgotMsg(error.message);
      return;
    }
    setForgotColor("var(--green)");
    setForgotMsg(
      "Email envoyé ! Vérifie ta boîte de réception (et tes spams).",
    );
    setForgotDone(true);
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
            {subtitle}
          </div>
        </div>

        {panel === "login" && (
          <div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="toi@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") doLogin();
                }}
              />
            </div>
            <div
              style={{
                textAlign: "right",
                marginTop: -6,
                marginBottom: 10,
              }}
            >
              <button
                onClick={() => {
                  setForgotEmail(email);
                  setForgotMsg("");
                  setForgotDone(false);
                  setPanel("forgot");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--blue)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div
              style={{
                fontSize: 12,
                color: errorColor,
                marginBottom: 10,
                minHeight: 16,
              }}
            >
              {error}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: 10 }}
              disabled={submitting}
              onClick={doLogin}
            >
              {submitting ? "Connexion..." : "Se connecter"}
            </button>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Pas encore de compte ?{" "}
              </span>
              <button
                onClick={doSignup}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--blue)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Créer un compte
              </button>
            </div>
          </div>
        )}

        {panel === "forgot" && (
          <div>
            <p
              style={{
                fontSize: 13,
                color: "var(--text-secondary)",
                marginBottom: 16,
              }}
            >
              Saisis ton email et nous t’enverrons un lien pour réinitialiser
              ton mot de passe.
            </p>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="toi@exemple.fr"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendReset();
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                minHeight: 16,
                marginBottom: 10,
                color: forgotColor,
              }}
            >
              {forgotMsg}
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: 10 }}
              disabled={forgotSending || forgotDone}
              onClick={sendReset}
            >
              {forgotSending ? "Envoi..." : "Envoyer le lien"}
            </button>
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button
                onClick={() => {
                  setPanel("login");
                  setError("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--blue)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                ← Retour à la connexion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
