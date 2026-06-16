"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OppStage } from "@/types/db";

export interface OpportunityInput {
  contactId: string;
  amount: number;
  stage: OppStage;
  prob: number;
  date: string | null;
  desc: string;
}

type ActionResult = { error?: string };

export async function saveOpportunity(
  input: OpportunityInput,
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
    amount: input.amount,
    stage: input.stage,
    prob: input.prob,
    close_date: input.date || null,
    description: input.desc,
  };

  if (editingId) {
    const { error } = await supabase
      .from("opportunities")
      .update(data)
      .eq("id", editingId);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("opportunities").insert(data);
    if (error) return { error: error.message };
  }
  revalidatePath("/", "layout");
  return {};
}
