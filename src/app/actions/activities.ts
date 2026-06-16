"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActivityStatus, ActivityType } from "@/types/db";

export interface ActivityInput {
  contactId: string;
  type: ActivityType;
  desc: string;
  date: string;
  status: ActivityStatus;
}

type ActionResult = { error?: string };

export async function saveActivity(
  input: ActivityInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.from("activities").insert({
    user_id: user.id,
    contact_id: input.contactId,
    type: input.type,
    description: input.desc,
    activity_date: input.date,
    status: input.status,
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function deleteActivity(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("activities").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}
