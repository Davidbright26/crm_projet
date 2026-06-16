"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/modal";
import { useAppUI } from "@/components/app-ui-context";
import { fmtDate, fmtEur } from "@/lib/format";
import { ACTIVE_STAGES } from "@/lib/constants";
import { saveContact, type ContactInput } from "@/app/actions/contacts";
import { saveOpportunity } from "@/app/actions/opportunities";
import { saveActivity } from "@/app/actions/activities";
import { saveTask } from "@/app/actions/tasks";
import type {
  ActivityStatus,
  ActivityType,
  Contact,
  ContactStatus,
  OppStage,
  Opportunity,
  Task,
  TaskType,
} from "@/types/db";

interface ModalContextValue {
  openContact: (id?: string | null) => void;
  openOpp: (id?: string | null) => void;
  openActivity: () => void;
  openTask: (id?: string | null) => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

type Which = "contact" | "opp" | "activity" | "task" | null;

export function ModalProvider({
  contacts,
  opportunities,
  tasks,
  children,
}: {
  contacts: Contact[];
  opportunities: Opportunity[];
  tasks: Task[];
  children: ReactNode;
}) {
  const router = useRouter();
  const { toast } = useAppUI();
  const [which, setWhich] = useState<Which>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const close = useCallback(() => {
    setWhich(null);
    setEditId(null);
  }, []);

  const openContact = useCallback((id?: string | null) => {
    setEditId(id || null);
    setWhich("contact");
  }, []);
  const openOpp = useCallback((id?: string | null) => {
    setEditId(id || null);
    setWhich("opp");
  }, []);
  const openActivity = useCallback(() => {
    setEditId(null);
    setWhich("activity");
  }, []);
  const openTask = useCallback((id?: string | null) => {
    setEditId(id || null);
    setWhich("task");
  }, []);

  const afterSave = useCallback(() => {
    close();
    router.refresh();
  }, [close, router]);

  return (
    <ModalContext.Provider
      value={{ openContact, openOpp, openActivity, openTask }}
    >
      {children}

      {which === "contact" && (
        <ContactModalForm
          contact={contacts.find((c) => c.id === editId) || null}
          onClose={close}
          onSaved={afterSave}
          toast={toast}
        />
      )}
      {which === "opp" && (
        <OppModalForm
          opp={opportunities.find((o) => o.id === editId) || null}
          contacts={contacts}
          onClose={close}
          onSaved={afterSave}
          toast={toast}
        />
      )}
      {which === "activity" && (
        <ActivityModalForm
          contacts={contacts}
          onClose={close}
          onSaved={afterSave}
          toast={toast}
        />
      )}
      {which === "task" && (
        <TaskModalForm
          task={tasks.find((t) => t.id === editId) || null}
          contacts={contacts}
          opportunities={opportunities}
          onClose={close}
          onSaved={afterSave}
          toast={toast}
        />
      )}
    </ModalContext.Provider>
  );
}

export function useModals(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals must be used within ModalProvider");
  return ctx;
}

type Toast = (msg: string, isError?: boolean) => void;

// ── Contact modal ────────────────────────────────────────────────────────────

function ContactModalForm({
  contact,
  onClose,
  onSaved,
  toast,
}: {
  contact: Contact | null;
  onClose: () => void;
  onSaved: () => void;
  toast: Toast;
}) {
  const [firstname, setFirstname] = useState(contact?.firstname || "");
  const [lastname, setLastname] = useState(contact?.lastname || "");
  const [company, setCompany] = useState(contact?.company || "");
  const [email, setEmail] = useState(contact?.email || "");
  const [phone, setPhone] = useState(contact?.phone || "");
  const [status, setStatus] = useState<ContactStatus>(
    contact?.status || "prospect",
  );
  const [value, setValue] = useState(contact ? String(contact.value) : "");
  const [notes, setNotes] = useState(contact?.notes || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!firstname.trim() || !lastname.trim()) {
      toast("Prénom et nom requis.", true);
      return;
    }
    setSaving(true);
    const input: ContactInput = {
      firstname: firstname.trim(),
      lastname: lastname.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      status,
      value: parseFloat(value) || 0,
      notes: notes.trim(),
    };
    const { error } = await saveContact(input, contact?.id);
    setSaving(false);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast(contact ? "Contact mis à jour" : "Contact ajouté");
    onSaved();
  }

  return (
    <Modal
      open
      title={contact ? "Modifier le contact" : "Nouveau contact"}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Prénom *</label>
          <input
            className="form-input"
            placeholder="Marie"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Nom *</label>
          <input
            className="form-input"
            placeholder="Dupont"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Entreprise</label>
        <input
          className="form-input"
          placeholder="Dupont & Associés"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            className="form-input"
            type="email"
            placeholder="m.dupont@example.fr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Téléphone</label>
          <input
            className="form-input"
            placeholder="06 xx xx xx xx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Statut</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ContactStatus)}
          >
            <option value="prospect">Prospect</option>
            <option value="contact">Contact</option>
            <option value="client">Client</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Valeur estimée (€)</label>
          <input
            className="form-input"
            type="number"
            placeholder="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          className="form-textarea"
          placeholder="Informations complémentaires..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}

// ── Opportunity modal ────────────────────────────────────────────────────────

function OppModalForm({
  opp,
  contacts,
  onClose,
  onSaved,
  toast,
}: {
  opp: Opportunity | null;
  contacts: Contact[];
  onClose: () => void;
  onSaved: () => void;
  toast: Toast;
}) {
  const [contactId, setContactId] = useState(
    opp?.contactId || contacts[0]?.id || "",
  );
  const [amount, setAmount] = useState(opp ? String(opp.amount) : "");
  const [stage, setStage] = useState<OppStage>(opp?.stage || "Prospection");
  const [prob, setProb] = useState(opp ? String(opp.prob) : "");
  const [date, setDate] = useState(opp?.date || "");
  const [desc, setDesc] = useState(opp?.desc || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!amount) {
      toast("Montant requis.", true);
      return;
    }
    setSaving(true);
    const { error } = await saveOpportunity(
      {
        contactId,
        amount: parseFloat(amount) || 0,
        stage,
        prob: parseInt(prob) || 0,
        date: date || null,
        desc,
      },
      opp?.id,
    );
    setSaving(false);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast(opp ? "Opportunité mise à jour" : "Opportunité ajoutée");
    onSaved();
  }

  return (
    <Modal
      open
      title={opp ? "Modifier l'opportunité" : "Nouvelle opportunité"}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            Enregistrer
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Contact *</label>
        <select
          className="form-select"
          value={contactId}
          onChange={(e) => setContactId(e.target.value)}
        >
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.firstname} {c.lastname} — {c.company || ""}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Montant (€) *</label>
          <input
            className="form-input"
            type="number"
            placeholder="5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Étape</label>
          <select
            className="form-select"
            value={stage}
            onChange={(e) => setStage(e.target.value as OppStage)}
          >
            <option value="Prospection">Prospection</option>
            <option value="Qualification">Qualification</option>
            <option value="Proposition">Proposition</option>
            <option value="Négociation">Négociation</option>
            <option value="Gagné">Gagné</option>
            <option value="Perdu">Perdu</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Probabilité (%)</label>
          <input
            className="form-input"
            type="number"
            min={0}
            max={100}
            placeholder="50"
            value={prob}
            onChange={(e) => setProb(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Date de clôture</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea
          className="form-textarea"
          placeholder="Détails de l'opportunité..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
    </Modal>
  );
}

// ── Activity modal ───────────────────────────────────────────────────────────

function ActivityModalForm({
  contacts,
  onClose,
  onSaved,
  toast,
}: {
  contacts: Contact[];
  onClose: () => void;
  onSaved: () => void;
  toast: Toast;
}) {
  const [contactId, setContactId] = useState(contacts[0]?.id || "");
  const [type, setType] = useState<ActivityType>("appel");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState(fmtDate(Date.now()));
  const [status, setStatus] = useState<ActivityStatus>("fait");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!desc.trim()) {
      toast("Description requise.", true);
      return;
    }
    setSaving(true);
    const { error } = await saveActivity({
      contactId,
      type,
      desc: desc.trim(),
      date,
      status,
    });
    setSaving(false);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast("Activité enregistrée");
    onSaved();
  }

  return (
    <Modal
      open
      title="Nouvelle activité"
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Contact</label>
          <select
            className="form-select"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstname} {c.lastname} — {c.company || ""}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as ActivityType)}
          >
            <option value="appel">Appel</option>
            <option value="email">Email</option>
            <option value="réunion">Réunion</option>
            <option value="note">Note</option>
            <option value="relance">Relance</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Description *</label>
        <input
          className="form-input"
          placeholder="Description de l'activité..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date</label>
          <input
            className="form-input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Statut</label>
          <select
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value as ActivityStatus)}
          >
            <option value="fait">Fait</option>
            <option value="planifié">Planifié</option>
            <option value="en attente">En attente</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

// ── Task modal ───────────────────────────────────────────────────────────────

function TaskModalForm({
  task,
  contacts,
  opportunities,
  onClose,
  onSaved,
  toast,
}: {
  task: Task | null;
  contacts: Contact[];
  opportunities: Opportunity[];
  onClose: () => void;
  onSaved: () => void;
  toast: Toast;
}) {
  const [type, setType] = useState<TaskType>(task?.type || "appel");
  const [title, setTitle] = useState(task?.title || "");
  const [contactId, setContactId] = useState(task?.contactId || "");
  const [oppId, setOppId] = useState(task?.oppId || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [dueDate, setDueDate] = useState(task?.dueDate || fmtDate(Date.now()));
  const [dueTime, setDueTime] = useState(task?.dueTime || "09:00");
  const [saving, setSaving] = useState(false);

  const activeOpps = opportunities.filter((o) => ACTIVE_STAGES.includes(o.stage));

  async function save() {
    if (!dueDate) {
      toast("La date est requise.", true);
      return;
    }
    setSaving(true);
    const { error } = await saveTask(
      {
        contactId: contactId || null,
        oppId: oppId || null,
        type,
        title: title.trim(),
        notes: notes.trim(),
        dueDate,
        dueTime: dueTime || "09:00",
      },
      task?.id,
    );
    setSaving(false);
    if (error) {
      toast("Erreur : " + error, true);
      return;
    }
    toast(task ? "Tâche mise à jour" : "Tâche ajoutée");
    onSaved();
  }

  return (
    <Modal
      open
      title={task ? "Modifier la tâche" : "Nouvelle tâche"}
      onClose={onClose}
      footer={
        <>
          <button className="btn" onClick={onClose}>
            Annuler
          </button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            Enregistrer
          </button>
        </>
      }
    >
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Type</label>
          <select
            className="form-select"
            value={type}
            onChange={(e) => setType(e.target.value as TaskType)}
          >
            <option value="appel">Appel</option>
            <option value="email">Email</option>
            <option value="reunion">Réunion</option>
            <option value="relance">Relance</option>
            <option value="suivi">Suivi opportunité</option>
            <option value="tache">Tâche</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Titre</label>
          <input
            className="form-input"
            placeholder="Ex. Rappeler pour devis..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Contact lié</label>
          <select
            className="form-select"
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
          >
            <option value="">-- Aucun --</option>
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>
                {c.firstname} {c.lastname}
                {c.company ? " — " + c.company : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Opportunité liée</label>
          <select
            className="form-select"
            value={oppId}
            onChange={(e) => setOppId(e.target.value)}
          >
            <option value="">-- Aucune --</option>
            {activeOpps.map((o) => {
              const c = contacts.find((x) => x.id === o.contactId);
              return (
                <option key={o.id} value={o.id}>
                  {fmtEur(o.amount)}
                  {c ? " - " + c.firstname + " " + c.lastname : ""}
                </option>
              );
            })}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date *</label>
          <input
            className="form-input"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Heure</label>
          <input
            className="form-input"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea
          className="form-textarea"
          placeholder="Détails de la tâche..."
          style={{ minHeight: 60 }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </Modal>
  );
}
