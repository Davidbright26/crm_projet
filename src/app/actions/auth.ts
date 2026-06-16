"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionResult = { error?: string };

export async function login(
  email: string,
  password: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function signup(
  email: string,
  password: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  return {};
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function deleteAccount(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await supabase.from("activities").delete().eq("user_id", user.id);
    await supabase.from("opportunities").delete().eq("user_id", user.id);
    await supabase.from("contacts").delete().eq("user_id", user.id);
    await supabase.from("user_profiles").delete().eq("user_id", user.id);
  }
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
