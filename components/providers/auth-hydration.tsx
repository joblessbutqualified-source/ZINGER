"use client";

import { useEffect } from "react";
import { loadProfileForAuthUser } from "@/lib/chat/auth-user";
import { useAuthStore } from "@/lib/store/auth-store";
import { DEMO_AUTH_COOKIE, type Profile } from "@/lib/types";
import { isAdminEmail, isSupabaseConfigured, isUuid, makeUsername } from "@/lib/utils";

function readCookie(): Profile | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${DEMO_AUTH_COOKIE}=`))
    ?.split("=")
    .slice(1)
    .join("=");
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as {
      id?: string;
      email?: string;
      fullName?: string;
      username?: string;
      role?: "student" | "admin";
    };
    if (!parsed.email) return null;
    const fullName = parsed.fullName ?? parsed.email.split("@")[0] ?? "Learner";
    return {
      id: parsed.id ?? `usr_${parsed.email}`,
      email: parsed.email,
      fullName,
      username: parsed.username ?? makeUsername(fullName, parsed.email),
      role: isAdminEmail(parsed.email) ? "admin" : parsed.role ?? "student",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function AuthHydration() {
  const setHydrated = useAuthStore((s) => s.setHydrated);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const finish = async () => {
      const current = useAuthStore.getState().user;
      if (!current || !isUuid(current.id)) {
        const fromCookie = readCookie();
        if (fromCookie && !useAuthStore.getState().user) setUser(fromCookie);
      }
      if (isSupabaseConfigured()) {
        await loadProfileForAuthUser();
      }
      setHydrated();
    };

    if (useAuthStore.persist.hasHydrated()) {
      void finish();
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      void finish();
    });
    return unsub;
  }, [setHydrated, setUser]);

  return null;
}
