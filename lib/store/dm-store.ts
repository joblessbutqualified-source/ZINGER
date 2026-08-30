"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DM_MESSAGE_CHANNEL } from "@/lib/chat/channels";
import type { ChatMessage } from "@/lib/types";

function normalize(message: ChatMessage): ChatMessage {
  return {
    ...message,
    isRead: Boolean(message.isRead),
    readAt: message.readAt ?? null,
  };
}

function broadcast(payload: ChatMessage | { type: "read"; ids: string[]; readAt: string }) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return;
  const bc = new BroadcastChannel(DM_MESSAGE_CHANNEL);
  bc.postMessage(payload);
  bc.close();
}

interface DmState {
  messages: ChatMessage[];
  upsertMessage: (message: ChatMessage, emit?: boolean) => void;
  upsertMany: (incoming: ChatMessage[]) => void;
  hydrateFromServer: (incoming: ChatMessage[]) => void;
  removeMessage: (id: string) => void;
  markConversationRead: (selfId: string, peerId: string, emit?: boolean) => ChatMessage[];
  applyRead: (ids: string[], readAt: string) => void;
}

export const useDmStore = create<DmState>()(
  persist(
    (set, get) => ({
      messages: [],
      upsertMessage: (message, emit = false) => {
        const next = normalize(message);
        const exists = get().messages.some((m) => m.id === next.id);
        const messages = exists
          ? get().messages.map((m) => (m.id === next.id ? { ...m, ...next } : m))
          : [...get().messages, next];
        set({ messages });
        if (emit && !exists) broadcast(next);
      },
      upsertMany: (incoming) => {
        const map = new Map(get().messages.map((m) => [m.id, m]));
        for (const m of incoming) {
          const next = normalize(m);
          const prev = map.get(next.id);
          map.set(next.id, prev ? { ...prev, ...next } : next);
        }
        set({ messages: Array.from(map.values()) });
      },
      hydrateFromServer: (incoming) => {
        set({ messages: incoming.map(normalize) });
      },
      removeMessage: (id) => {
        set({ messages: get().messages.filter((m) => m.id !== id) });
      },
      markConversationRead: (selfId, peerId, emit = true) => {
        const readAt = new Date().toISOString();
        const updated: ChatMessage[] = [];
        const messages = get().messages.map((m) => {
          if (m.receiverId === selfId && m.senderId === peerId && !m.isRead) {
            const next = { ...m, isRead: true, readAt };
            updated.push(next);
            return next;
          }
          return m;
        });
        if (updated.length) {
          set({ messages });
          if (emit) broadcast({ type: "read", ids: updated.map((m) => m.id), readAt });
        }
        return updated;
      },
      applyRead: (ids, readAt) => {
        const setIds = new Set(ids);
        set({
          messages: get().messages.map((m) =>
            setIds.has(m.id) ? { ...m, isRead: true, readAt } : m
          ),
        });
      },
    }),
    {
      name: "zinger-dm-messages",
      partialize: (s) => ({ messages: s.messages }),
    }
  )
);
