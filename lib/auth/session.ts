"use client";

import { createClient } from "@/lib/supabase/client";
import { DEMO_AUTH_COOKIE, type Profile } from "@/lib/types";
import { isAdminEmail, isSupabaseConfigured, makeUsername } from "@/lib/utils";
import { loadProfileForAuthUser } from "@/lib/chat/auth-user";
import { useAuthStore } from "@/lib/store/auth-store";

const COOKIE_MAX = 60 * 60 * 24 * 14;

function writeSessionCookie(user: Profile) {
  const payload = encodeURIComponent(
    JSON.stringify({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      role: user.role,
    })
  );
  document.cookie = `${DEMO_AUTH_COOKIE}=${payload}; Path=/; Max-Age=${COOKIE_MAX}; SameSite=Lax`;
}

function clearSessionCookie() {
  document.cookie = `${DEMO_AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

function makeProfile(email: string, fullName: string, id?: string): Profile {
  const role = isAdminEmail(email) ? "admin" : "student";
  return {
    id: id ?? `usr_${email.replace(/[^a-z0-9]/gi, "_")}`,
    email: email.toLowerCase(),
    fullName,
    username: makeUsername(fullName, email),
    role,
    avatarUrl: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
}

function commitSession(user: Profile): Profile {
  useAuthStore.getState().setUser(user);
  const saved = useAuthStore.getState().user ?? user;
  writeSessionCookie(saved);
  return saved;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
  fullName: string;
}): Promise<{ user: Profile; error?: string }> {
  const supabase = createClient();
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          username: makeUsername(input.fullName, input.email),
        },
      },
    });
    if (error) return { user: makeProfile(input.email, input.fullName), error: error.message };
    const profile = await loadProfileForAuthUser();
    if (profile) {
      writeSessionCookie(profile);
      return { user: profile };
    }
    return { user: commitSession(makeProfile(input.email, input.fullName, data.user?.id)) };
  }

  return { user: commitSession(makeProfile(input.email, input.fullName)) };
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<{ user: Profile; error?: string }> {
  const supabase = createClient();
  if (supabase && isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) {
      return {
        user: makeProfile(input.email, input.email.split("@")[0] ?? "Learner"),
        error: error.message,
      };
    }
    const profile = await loadProfileForAuthUser();
    if (profile) {
      writeSessionCookie(profile);
      return { user: profile };
    }
    const meta = data.user?.user_metadata as { full_name?: string; username?: string } | undefined;
    const user = makeProfile(
      input.email,
      meta?.full_name ?? input.email.split("@")[0] ?? "Learner",
      data.user?.id
    );
    if (meta?.username) user.username = meta.username;
    return { user: commitSession(user) };
  }

  const existing = useAuthStore.getState().user;
  const user =
    existing && existing.email.toLowerCase() === input.email.toLowerCase()
      ? existing
      : makeProfile(input.email, input.email.split("@")[0] ?? "Learner");
  return { user: commitSession(user) };
}

export async function signInWithGooglePlaceholder(): Promise<{ error: string }> {
  const supabase = createClient();
  if (supabase && isSupabaseConfigured()) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) return { error: error.message };
    return { error: "" };
  }
  return {
    error:
      "Google OAuth is a placeholder until you add Google in Supabase Auth providers and real project keys.",
  };
}

export async function signOut() {
  const supabase = createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  useAuthStore.getState().logout();
  clearSessionCookie();
}
