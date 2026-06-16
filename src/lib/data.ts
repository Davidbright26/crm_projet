import { createClient } from "@/lib/supabase/server";
import { mapActivity, mapContact, mapOpportunity, mapTask } from "@/lib/mappers";
import type {
  Activity,
  Contact,
  Opportunity,
  Task,
  UserProfile,
} from "@/types/db";

export async function getContacts(): Promise<Contact[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []).map(mapContact);
}

export async function getOpportunities(): Promise<Opportunity[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []).map(mapOpportunity);
}

export async function getActivities(): Promise<Activity[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false });
  return (data || []).map(mapActivity);
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .order("due_date", { ascending: true });
  return (data || []).map(mapTask);
}

export async function getUserProfile(
  userId: string,
): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (!data) return null;
  return {
    firstname: data.firstname || "",
    lastname: data.lastname || "",
    company: data.company || "",
  };
}
