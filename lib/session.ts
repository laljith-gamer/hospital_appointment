import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

export interface SessionInfo {
  userId: string;
  email: string;
  profile: Profile | null;
}

export async function getSessionProfile(): Promise<SessionInfo | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    email: user.email ?? "",
    profile: profile ?? null,
  };
}

export async function requireSession(): Promise<SessionInfo> {
  const session = await getSessionProfile();
  if (!session) throw new Error("UNAUTHENTICATED");
  return session;
}
