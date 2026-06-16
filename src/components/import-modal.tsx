"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { useAppUI } from "@/components/app-ui-context";
import { STATUS_BADGE, STATUS_LABEL } from "@/lib/constants";
import { importContacts, type ImportRow } from "@/app/actions/contacts";
import type { ContactStatus } from "@/types/db";

const FIELD_MAP: Record<string, keyof ImportRow> = {
  prenom: "firstname",
  prénom: "firstname",
  firstname: "firstname",
  first_name: "firstname",
  nom: "lastname",
  lastname: "lastname",
  last_name: "lastname",
  entreprise: "company",
  société: "company",
  company: "company",
  email: "email",
  "e-mail": "email",
  telephone: "phone",
  téléphone: "phone",
  tel: "phone",
  phone: "phone",
  mobile: "phone",
  statut: "status",
  status: "status",
  valeur: "value",
  value: "value",
  montant: "value",
  amount: "value",
  notes: "notes",
  note: "notes",
  commentaire: "notes",
  comments: "notes",
};

function mapRow(raw: Record<string, string>): ImportRow {
  const out: ImportRow = {};
  Object.entries(raw).forEach(([k, v]) => {
    const m = FIELD_MAP[k.toLowerCase().replace(/\s+/g, " ").trim()];
    if (m) out[m] = v;
  });
  return out;
}

function normalizeStatus(s?: string): ContactStatus {
  const v = (s || "").toLowerCase().trim();
  if (v === "client" || v === "cliente") return "client";
  if (v === "prospect") return "prospect";
  return "contact";
}

function splitCSVLine(line: string): string[] {
  const res: string[] = [];
  let cur = "";
  let inQ = false;
  for (const ch of line) {
    if (ch === '"') inQ = !inQ;
    else if ((ch === "," || ch === ";") && !inQ) {
      res.push(cur);
      cur = "";
    } else cur += ch;
  }
  res.push(cur);
  return res;
}

export function ImportModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const { toast } = useAppUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [step, setStep] = useState<1 | 2>(1);
  const [replace, setReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  function reset() {
    setRows([]);
    setStep(1);
    setReplace(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  function parseCSV(text: string) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      toast("Fichier vide.", true);
      return;
    }
    const headers = lines[0]
      .split(/[,;]/)
      .map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
    const parsed: Record<string, string>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = splitCSVLine(lines[i]);
      if (vals.every((v) => !v.trim())) continue;
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = (vals[idx] || "").trim().replace(/^["']|["']$/g, "");
      });
      parsed.push(obj);
    }
    setRows(parsed);
    setStep(2);
  }

  async function parseXLSX(buffer: ArrayBuffer) {
    const XLSX = await import("xlsx");
    const wb = XLSX.read(buffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
      defval: "",
    });
    if (!data.length) {
      toast("Feuille vide.", true);
      return;
    }
    const parsed = data.map((row) => {
      const obj: Record<string, string> = {};
      Object.entries(row).forEach(([k, v]) => {
        obj[k.trim().toLowerCase()] = String(v || "").trim();
      });
      return obj;
    });
    setRows(parsed);
    setStep(2);
  }

  function handleFile(file?: File) {
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      const r = new FileReader();
      r.onload = (e) => parseCSV(e.target?.result as string);
      r.readAsText(file, "UTF-8");
    } else if (ext === "xlsx" || ext === "xls") {
      const r = new FileReader();
      r.onload = (e) => parseXLSX(e.target?.result as ArrayBuffer);
      r.readAsArrayBuffer(file);
    } else {
      toast("Format non supporté. Utilise .csv ou .xlsx", true);
    }
  }

  function downloadTemplate() {
    const csv =
      "prenom,nom,entreprise,email,telephone,statut,valeur,notes\n" +
      "Marie,Laurent,Atelier Bloom,m.laurent@bloom.fr,06 12 34 56 78,client,12000,Cliente\n" +
      "Pierre,Tanguy,Tanguy & Fils,p.tanguy@tanguy.fr,06 23 45 67 89,prospect,7800,\n";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    a.download = "modele-contacts-crm.csv";
    a.click();
  }

  async function confirmImport() {
    const mapped = rows.map(mapRow).filter((r) => r.firstname || r.lastname);
    setImporting(true);
    const result = await importContacts(mapped, replace);
    setImporting(false);
    if (result.error) {
      toast("Erreur : " + result.error, true);
      return;
    }
    handleClose();
    router.push("/contacts");
    router.refresh();
    toast(
      "Import terminé — " +
        (result.added || 0) +
        " ajouté(s), " +
        (result.updated || 0) +
        " mis à jour",
    );
  }

  const mapped = rows.map(mapRow);
  const valid = mapped.filter((r) => r.firstname || r.lastname);
  const invalid = rows.length - valid.length;

  return (
    <Modal
      open={open}
      title="Importer des contacts"
      onClose={handleClose}
      width={560}
      footer={
        <>
          {step === 2 && (
            <button className="btn" onClick={reset}>
              ← Retour
            </button>
          )}
          <button className="btn" onClick={handleClose}>
            Annuler
          </button>
          {step === 2 && (
            <button
              className="btn btn-primary"
              onClick={confirmImport}
              disabled={importing}
            >
              Importer les contacts
            </button>
          )}
        </>
      }
    >
      {step === 1 && (
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              handleFile(e.dataTransfer.files[0]);
            }}
            style={{
              border: "1.5px dashed var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              padding: "32px 20px",
              textAlign: "center",
              cursor: "pointer",
              marginBottom: 14,
              background: dragOver ? "var(--blue-light)" : undefined,
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>📂</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: "var(--text)",
                marginBottom: 4,
              }}
            >
              Glisser un fichier ici ou cliquer pour choisir
            </div>
            <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
              Formats acceptés : .csv, .xlsx, .xls
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>ou</span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
          </div>
          <div
            style={{
              background: "var(--gray-light)",
              borderRadius: "var(--radius)",
              padding: "14px 16px",
              fontSize: 12,
              color: "var(--text-secondary)",
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              Format attendu (colonnes CSV)
            </div>
            <code
              style={{
                fontFamily: "monospace",
                fontSize: 11,
                color: "var(--blue-dark)",
              }}
            >
              prenom, nom, entreprise, email, telephone, statut, valeur, notes
            </code>
            <div style={{ marginTop: 8 }}>
              Le champ <strong>statut</strong> accepte : <code>client</code>,{" "}
              <code>prospect</code>, <code>contact</code>
            </div>
            <button
              className="btn"
              onClick={downloadTemplate}
              style={{ marginTop: 10, fontSize: 11 }}
            >
              ⬇ Télécharger le modèle CSV
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ marginBottom: 12, fontSize: 13 }}>
            <span style={{ color: "var(--green)", fontWeight: 500 }}>
              {valid.length} contact(s) prêts
            </span>
            {invalid > 0 && (
              <>
                {" — "}
                <span style={{ color: "var(--amber)" }}>
                  {invalid} ignoré(s)
                </span>
              </>
            )}
          </div>
          <div
            style={{
              maxHeight: 240,
              overflowY: "auto",
              border: "0.5px solid var(--border)",
              borderRadius: "var(--radius)",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 12,
              }}
            >
              <thead>
                <tr style={{ background: "var(--gray-light)", position: "sticky", top: 0 }}>
                  {["Prénom", "Nom", "Entreprise", "Email", "Tél", "Statut"].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "7px 10px",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          textAlign: "left",
                          borderBottom: "0.5px solid var(--border)",
                        }}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {valid.slice(0, 20).map((r, i) => {
                  const st = normalizeStatus(r.status);
                  return (
                    <tr
                      key={i}
                      style={{ background: i % 2 ? "var(--gray-light)" : undefined }}
                    >
                      <td style={{ padding: "7px 10px" }}>{r.firstname || ""}</td>
                      <td style={{ padding: "7px 10px" }}>{r.lastname || ""}</td>
                      <td style={{ padding: "7px 10px", color: "var(--text-secondary)" }}>
                        {r.company || ""}
                      </td>
                      <td style={{ padding: "7px 10px", color: "var(--blue)", fontSize: 11 }}>
                        {r.email || ""}
                      </td>
                      <td style={{ padding: "7px 10px", fontSize: 11 }}>
                        {r.phone || ""}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <span className={"badge " + STATUS_BADGE[st]}>
                          {STATUS_LABEL[st]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {valid.length > 20 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: "8px 10px",
                        textAlign: "center",
                        fontSize: 11,
                        color: "var(--text-tertiary)",
                      }}
                    >
                      … et {valid.length - 20} autres
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 14,
            }}
          >
            <label
              style={{
                fontSize: 12,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={replace}
                onChange={(e) => setReplace(e.target.checked)}
                style={{ margin: 0 }}
              />
              Remplacer les contacts existants (même email)
            </label>
          </div>
        </div>
      )}
    </Modal>
  );
}
