"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskStatus, TaskType } from "@/types/db";

export interface TaskInput {
  contactId: string | null;
  oppId: string | null;
  type: TaskType;
  title: string;
  notes: string;
  dueDate: string;
  dueTime: string;
}

type ActionResult = { error?: string };

export async function saveTask(
  input: TaskInput,
  editingId?: string | null,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const data = {
    user_id: user.id,
    contact_id: input.contactId,
    opportunity_id: input.oppId,
    type: input.type,
    title: input.title,
    notes: input.notes,
    due_date: input.dueDate,
    due_time: input.dueTime || "09:00",
    status: "todo" as TaskStatus,
  };

  if (editingId) {
    // Matches the original app: editing resets status to "todo".
    const { error } = await supabase
      .from("tasks")
      .update(data)
      .eq("id", editingId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("tasks").insert(data);
    if (error) return { error: error.message };
  }
  revalidatePath("/", "layout");
  return {};
}

export async function toggleTaskDone(
  id: string,
  current: TaskStatus,
): Promise<ActionResult> {
  const supabase = await createClient();
  const newStatus: TaskStatus = current === "done" ? "todo" : "done";
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteTask(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}
