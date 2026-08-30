"use client";

import { createClient } from "@/lib/supabase/client";
import { mapProfileRow, toProfileRow, type ProfileRow } from "@/lib/chat/mappers";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Profile } from "@/lib/types";
import { isAdminEmail, isSupabaseConfigured, makeUsername } from "@/lib/utils";

export async function getAuthUserId(): Promise<string | null> {
  const supabase = createClient();
  if (!supabase || !isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error(error);
    return null;
  }
  return data.user?.id ?? null;
}

export async function loadProfileForAuthUser(): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error(authError);
    return null;
  }
  const authUser = authData.user;
  if (!authUser?.email) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, username, avatar_url, role, created_at, last_seen_at")
    .eq("id", authUser.id)
    .maybeSingle();

  if (error) {
    console.error(error);
  }

  if (data) {
    const profile = mapProfileRow(data as ProfileRow);
    useAuthStore.getState().setUser(profile);
    return useAuthStore.getState().user ?? profile;
  }

  const meta = authUser.user_metadata as { full_name?: string; username?: string } | undefined;
  const fullName = meta?.full_name ?? authUser.email.split("@")[0] ?? "Learner";
  const fallback: Profile = {
    id: authUser.id,
    email: authUser.email,
    fullName,
    username: meta?.username || makeUsername(fullName, authUser.email),
    role: isAdminEmail(authUser.email) ? "admin" : "student",
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };

  const { error: upsertError } = await supabase.from("profiles").upsert(toProfileRow(fallback), {
    onConflict: "id",
  });
  if (upsertError) {
    console.error(upsertError);
  }

  useAuthStore.getState().setUser(fallback);
  return useAuthStore.getState().user ?? fallback;
}
