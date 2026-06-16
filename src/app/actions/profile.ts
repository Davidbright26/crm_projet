"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string };

export async function saveProfile(input: {
  firstname: string;
  lastname: string;
  company: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase
    .from("user_profiles")
    .upsert(
      { user_id: user.id, ...input },
      { onConflict: "user_id" },
    );
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function updatePassword(
  newPassword: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { error: error.message };
  return {};
}
