"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DM_DIRECTORY_CHANNEL, DM_PRESENCE_CHANNEL } from "@/lib/chat/channels";
import type { Profile } from "@/lib/types";

function mergeUsers(base: Profile[], incoming: Profile[]): Profile[] {
  const map = new Map<string, Profile>();
  for (const u of base) map.set(u.id, u);
  for (const u of incoming) {
    const prev = map.get(u.id);
    const merged = prev ? { ...prev, ...u } : u;
    map.set(u.id, {
      ...merged,
      username: merged.username || merged.email.split("@")[0] || "learner",
    });
  }
  return Array.from(map.values());
}

function broadcast(channel: string, payload: unknown) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  const bc = new BroadcastChannel(channel);
  bc.postMessage(payload);
  bc.close();
}

interface DirectoryState {
  users: Profile[];
  upsertUser: (user: Profile) => void;
  mergeRemote: (users: Profile[]) => void;
  replaceUsers: (users: Profile[]) => void;
  touchPresence: (id: string, lastSeenAt: string, emit?: boolean) => void;
}

export const useDirectoryStore = create<DirectoryState>()(
  persist(
    (set, get) => ({
      users: [],
      upsertUser: (user) => {
        const users = mergeUsers(get().users, [user]);
        set({ users });
        broadcast(DM_DIRECTORY_CHANNEL, user);
      },
      mergeRemote: (incoming) => {
        set({ users: mergeUsers(get().users, incoming) });
      },
      replaceUsers: (users) => {
        set({ users });
      },
      touchPresence: (id, lastSeenAt, emit = false) => {
        set({
          users: get().users.map((u) => (u.id === id ? { ...u, lastSeenAt } : u)),
        });
        if (emit) broadcast(DM_PRESENCE_CHANNEL, { id, lastSeenAt });
      },
    }),
    {
      name: "zinger-directory",
      partialize: (s) => ({ users: s.users }),
      merge: (persisted, current) => {
        const stored = (persisted as { users?: Profile[] } | undefined)?.users ?? [];
        return {
          ...current,
          users: stored,
        };
      },
    }
  )
);
