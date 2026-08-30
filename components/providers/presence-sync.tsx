"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadProfileForAuthUser } from "@/lib/chat/auth-user";
import { fetchDirectoryFromSupabase } from "@/lib/chat/profile-api";
import { useAuthStore } from "@/lib/store/auth-store";
import { useDirectoryStore } from "@/lib/store/directory-store";
import { isSupabaseConfigured } from "@/lib/utils";

export function PresenceSync() {
  const userId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!userId) return;
    const live = isSupabaseConfigured();

    const beat = async () => {
      const current = useAuthStore.getState().user;
      if (!current) return;
      const lastSeenAt = new Date().toISOString();
      const next = { ...current, lastSeenAt };
      useAuthStore.getState().setUser(next);
      useDirectoryStore.getState().touchPresence(next.id, lastSeenAt, true);

      const supabase = createClient();
      if (supabase && live) {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) console.error(authError);
        const authId = authData.user?.id;
        if (!authId) return;
        if (authId !== current.id) {
          await loadProfileForAuthUser();
        }
        const latest = useAuthStore.getState().user ?? next;
        const { error } = await supabase
          .from("profiles")
          .upsert(
            {
              id: authId,
              full_name: latest.fullName,
              email: latest.email,
              username: latest.username,
              avatar_url: latest.avatarUrl ?? null,
              role: latest.role,
              last_seen_at: lastSeenAt,
            },
            { onConflict: "id" }
          );
        if (error) console.error(error);
      }
    };

    void beat();
    if (live) {
      void fetchDirectoryFromSupabase(userId)
        .then((people) => {
          useDirectoryStore.getState().replaceUsers(people);
        })
        .catch((err) => console.error(err));
    } else {
      useDirectoryStore.getState().replaceUsers([]);
    }

    const id = window.setInterval(() => void beat(), 20_000);
    return () => window.clearInterval(id);
  }, [userId]);

  return null;
}
