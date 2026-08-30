"use client";

import { create } from "zustand";
import { DM_DIRECTORY_CHANNEL, DM_PRESENCE_CHANNEL } from "@/lib/chat/channels";
import { SEED_USER_IDS } from "@/lib/chat/seed-users";
import { useAuthStore } from "@/lib/store/auth-store";
import type { Profile } from "@/lib/types";

function isDirectoryPeer(user: Profile): boolean {
  if (SEED_USER_IDS.has(user.id) || user.id.startsWith("usr_peer_") || user.id.startsWith("usr_")) {
    return false;
  }
  const currentUser = useAuthStore.getState().user;
  if (!currentUser) return true;
  return user.id !== currentUser.id;
}

function realPeersOnly(users: Profile[]): Profile[] {
  return users.filter(isDirectoryPeer);
}

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
  return realPeersOnly(Array.from(map.values()));
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

export const useDirectoryStore = create<DirectoryState>()((set, get) => ({
  users: [],
  upsertUser: (user) => {
    if (!isDirectoryPeer(user)) return;
    const users = mergeUsers(get().users, [user]);
    set({ users });
    broadcast(DM_DIRECTORY_CHANNEL, user);
  },
  mergeRemote: (incoming) => {
    set({ users: mergeUsers(get().users, incoming) });
  },
  replaceUsers: (users) => {
    set({ users: realPeersOnly(users) });
  },
  touchPresence: (id, lastSeenAt, emit = false) => {
    const currentUser = useAuthStore.getState().user;
    if (currentUser && id === currentUser.id) return;
    set({
      users: get().users.map((u) => (u.id === id ? { ...u, lastSeenAt } : u)),
    });
    if (emit) broadcast(DM_PRESENCE_CHANNEL, { id, lastSeenAt });
  },
}));
