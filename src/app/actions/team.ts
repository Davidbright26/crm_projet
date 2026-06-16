"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { InviteRole, TeamInvitationRow } from "@/types/db";

type ActionResult = { error?: string };

export async function getTeamInvitations(): Promise<TeamInvitationRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_invitations")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []) as TeamInvitationRow[];
}

export async function sendInvitation(
  email: string,
  role: InviteRole,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Non authentifié." };

  const { error } = await supabase.from("team_invitations").insert({
    inviter_id: user.id,
    email,
    role,
    status: "pending",
  });
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}

export async function revokeInvitation(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("team_invitations")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/", "layout");
  return {};
}
