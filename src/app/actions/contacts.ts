"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { randAvatarColor } from "@/lib/constants";
import type { ContactStatus } from "@/types/db";

export interface ContactInput {
  firstname: string;
  lastname: string;
  company: string;
  email: string;
  phone: string;
  status: ContactStatus;
  value: number;
  notes: string;
}

type ActionResult = { error?: string };

async function getUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id };
}

function revalidateAll() {
  revalidatePath("/", "layout");
}

export async function saveContact(
  input: ContactInput,
  editingId?: string | null,
): Promise<ActionResult> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "Non authentifié." };

  const data = { user_id: userId, ...input };

  if (editingId) {
    const { error } = await supabase
      .from("contacts")
      .update(data)
      .eq("id", editingId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("contacts")
      .insert({ ...data, color: randAvatarColor() });
    if (error) return { error: error.message };
  }
  revalidateAll();
  return {};
}

export async function deleteContact(id: string): Promise<ActionResult> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "Non authentifié." };

  await supabase.from("activities").delete().eq("contact_id", id);
  await supabase.from("opportunities").delete().eq("contact_id", id);
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateAll();
  return {};
}

export interface ImportRow {
  firstname?: string;
  lastname?: string;
  company?: string;
  email?: string;
  phone?: string;
  status?: string;
  value?: string;
  notes?: string;
}

function normalizeStatus(s?: string): ContactStatus {
  const v = (s || "").toLowerCase().trim();
  if (v === "client" || v === "cliente") return "client";
  if (v === "prospect") return "prospect";
  return "contact";
}

export async function importContacts(
  rows: ImportRow[],
  replace: boolean,
): Promise<ActionResult & { added?: number; updated?: number }> {
  const { supabase, userId } = await getUserId();
  if (!userId) return { error: "Non authentifié." };

  const { data: existingRows } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId);
  const existing = existingRows || [];

  let added = 0;
  let updated = 0;

  for (const r of rows) {
    if (!r.firstname && !r.lastname) continue;
    const status = normalizeStatus(r.status);
    const match =
      r.email
        ? existing.find(
            (c) => c.email && c.email.toLowerCase() === r.email!.toLowerCase(),
          )
        : null;

    if (match && replace) {
      const upd = {
        firstname: r.firstname || match.firstname,
        lastname: r.lastname || match.lastname,
        company: r.company || match.company,
        email: r.email || match.email,
        phone: r.phone || match.phone,
        status,
        value: parseFloat(r.value || "") || match.value,
        notes: r.notes || match.notes,
      };
      await supabase.from("contacts").update(upd).eq("id", match.id);
      updated++;
    } else if (!match) {
      await supabase.from("contacts").insert({
        user_id: userId,
        firstname: r.firstname || "",
        lastname: r.lastname || "",
        company: r.company || "",
        email: r.email || "",
        phone: r.phone || "",
        status,
        value: parseFloat(r.value || "") || 0,
        notes: r.notes || "",
        color: randAvatarColor(),
      });
      added++;
    }
  }
  revalidateAll();
  return { added, updated };
}
