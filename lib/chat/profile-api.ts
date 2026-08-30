"use client";

import { createClient } from "@/lib/supabase/client";
import { mapChatRow, mapProfileRow, type ChatRow, type ProfileRow } from "@/lib/chat/mappers";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDirectoryStore } from "@/lib/store/directory-store";
import { toast } from "@/lib/store/toast-store";
import type { Profile } from "@/lib/types";
import { isSupabaseConfigured, isUsernameValid } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024;

export function isUsernameTaken(username: string, selfId: string): boolean {
  const lower = username.toLowerCase();
  return useDirectoryStore
    .getState()
    .users.some((u) => u.id !== selfId && u.username.toLowerCase() === lower);
}

export async function saveProfile(patch: {
  fullName: string;
  username: string;
  avatarUrl?: string | null;
}): Promise<{ error?: string; user?: Profile }> {
  const current = useAuthStore.getState().user;
  if (!current) return { error: "Not signed in" };

  const username = patch.username.trim().toLowerCase();
  if (!isUsernameValid(username)) {
    return { error: "Username must be 3–24 characters: letters, numbers, dots, underscores." };
  }
  if (isUsernameTaken(username, current.id)) {
    return { error: "That username is taken." };
  }

  const next: Profile = {
    ...current,
    fullName: patch.fullName.trim() || current.fullName,
    username,
    avatarUrl: patch.avatarUrl === undefined ? current.avatarUrl : patch.avatarUrl,
    lastSeenAt: new Date().toISOString(),
  };

  const supabase = createClient();
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: next.fullName,
        username: next.username,
        avatar_url: next.avatarUrl ?? null,
      })
      .eq("id", next.id);
    if (error) return { error: error.message };
  }

  useAuthStore.getState().setUser(next);
  return { user: next };
}

export async function uploadAvatarFile(file: File): Promise<{ url?: string; error?: string }> {
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
  if (file.size > MAX_BYTES) return { error: "Keep avatars under 2 MB." };

  const user = useAuthStore.getState().user;
  if (!user) return { error: "Not signed in" };

  const supabase = createClient();
  if (supabase && isSupabaseConfigured()) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    return { url: data.publicUrl };
  }

  const url = await fileToDataUrl(file);
  return { url };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

function isUuid(id: string | undefined | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function fetchDirectoryFromSupabase(currentUserId?: string): Promise<Profile[]> {
  const supabase = createClient();
  if (!supabase || !isSupabaseConfigured()) return [];

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) console.error(authError);

  const currentUser = {
    id: [authData.user?.id, currentUserId, useAuthStore.getState().user?.id].find(isUuid) ??
      authData.user?.id ??
      currentUserId ??
      useAuthStore.getState().user?.id,
  };
  if (!currentUser.id) return [];

  let query = supabase.from("profiles").select("*");
  if (isUuid(currentUser.id)) {
    query = query.neq("id", currentUser.id);
  }

  const { data, error } = await query;

  if (error) {
    console.error(error);
    toast({
      title: "Could not load people",
      description: error.message,
      variant: "error",
    });
    throw error;
  }
  if (!data) return [];
  return (data as ProfileRow[])
    .map(mapProfileRow)
    .filter((p) => p.id !== currentUser.id && p.id !== authData.user?.id);
}

export { mapChatRow, mapProfileRow };
export type { ChatRow, ProfileRow };
